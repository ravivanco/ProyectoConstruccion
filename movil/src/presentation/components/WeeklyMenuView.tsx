import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DayPlan, MealConfig, MealSlotKey, PlanWeek } from '../../domain/models/WeeklyMenu';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';
import { Button, Card } from './ui';
import { MealTimeCard } from './MealTimeCard';
import { DishDetailModal } from './DishDetailModal';
import { MenuRecommendationCard } from './MenuRecommendationCard';

const mealSchedule: Array<{ key: MealSlotKey; name: string; time: string }> = [
  { key: 'desayuno', name: 'Desayuno', time: '07:00' },
  { key: 'colacion_matutina', name: 'Media mañana', time: '10:00' },
  { key: 'almuerzo', name: 'Almuerzo', time: '13:00' },
  { key: 'colacion_vespertina', name: 'Media tarde', time: '16:00' },
  { key: 'cena', name: 'Cena', time: '19:00' },
];

function completeMealSchedule(meals: MealConfig[]): MealConfig[] {
  return mealSchedule.map((slot, index) => {
    const meal = meals.find((item) => item.mealSlot === slot.key);
    return { mealSlot: slot.key, name: slot.name, suggestedTime: meal?.suggestedTime || slot.time, order: index + 1, assignedMenus: meal?.assignedMenus ?? [] };
  });
}

export function WeeklyMenuView({ planId, dailyCalorieTarget }: { planId: string; dailyCalorieTarget: number }) {
  const { getPlanWeeks } = useApp();
  const [weeks, setWeeks] = useState<PlanWeek[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadWeeks = useCallback(async () => {
    setLoading(true); setError('');
    try { setWeeks(await getPlanWeeks(planId)); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el menú semanal.'); }
    finally { setLoading(false); }
  }, [getPlanWeeks, planId]);
  useEffect(() => { void loadWeeks(); }, [loadWeeks]);

  const week = weeks[0];
  const weekdays = useMemo(() => week?.days.filter((day) => day.dayOfWeek >= 1 && day.dayOfWeek <= 5) ?? [], [week]);
  const day = weekdays.find((item) => item.dayOfWeek === selectedDay) ?? weekdays[0];
  const dayCalories = day?.meals.flatMap((meal) => meal.assignedMenus).reduce((total, menu) => total + menu.calories, 0) ?? 0;

  if (loading) return <Card><ActivityIndicator color={colors.primary} /><Text style={styles.center}>Cargando tu semana…</Text></Card>;
  if (error) return <Card><Text style={styles.title}>No pudimos cargar tu semana</Text><Text style={styles.center}>{error}</Text><Button label="Reintentar" onPress={loadWeeks} /></Card>;
  if (!week || !weekdays.length) return <Card><Text style={styles.title}>Semana aún no disponible</Text><Text style={styles.center}>Tu nutricionista todavía no ha publicado menús para esta semana.</Text></Card>;

  return <Card>
    <Text style={styles.eyebrow}>MI SEMANA</Text>
    <Text style={styles.title}>{week.title || `Semana ${week.weekNumber}`}</Text>
    {week.objective ? <Text style={styles.objective}>{week.objective}</Text> : null}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
      {weekdays.map((item) => <DayButton key={item.dayOfWeek} day={item} selected={item.dayOfWeek === day?.dayOfWeek} onPress={() => setSelectedDay(item.dayOfWeek)} />)}
    </ScrollView>
    <View style={styles.dayContent}>
      <Text style={styles.dayTitle}>{day?.day}</Text>
      {dayCalories > 0 ? <MenuRecommendationCard calories={dayCalories} dailyTarget={dailyCalorieTarget} /> : null}
      {day ? completeMealSchedule(day.meals).map((meal) => <MealTimeCard key={meal.mealSlot} meal={meal} onOpenDish={setSelectedDishId} />) : null}
    </View>
    <DishDetailModal dishId={selectedDishId} onClose={() => setSelectedDishId(null)} />
  </Card>;
}

function DayButton({ day, selected, onPress }: { day: DayPlan; selected: boolean; onPress(): void }) {
  return <Pressable onPress={onPress} style={[styles.dayButton, selected ? styles.dayButtonSelected : null]}><Text style={[styles.dayText, selected ? styles.dayTextSelected : null]}>{day.day.slice(0, 3)}</Text></Pressable>;
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.primaryDark, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 21, fontWeight: '900', marginTop: 4 },
  objective: { color: colors.muted, lineHeight: 20, marginTop: 6 },
  center: { color: colors.muted, lineHeight: 21, textAlign: 'center', marginTop: 10 },
  days: { gap: 8, paddingVertical: 18 },
  dayButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#FFF' },
  dayButtonSelected: { borderColor: colors.primary, backgroundColor: '#EEF8E8' },
  dayText: { color: colors.muted, fontWeight: '800', textTransform: 'uppercase' },
  dayTextSelected: { color: colors.primaryDark },
  dayContent: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 },
  dayTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 8 },
});
