import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssignedExercise, Exercise } from '../../domain/models/Exercise';
import { Button, Card, Choice } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

export function ExercisesScreen({ onBack }: { onBack(): void }) {
  const { getActivePlan, getCalorieDashboard, getExercises, getRecommendedExercises, getExerciseSchedule } = useApp();
  const [catalog, setCatalog] = useState<Exercise[]>([]);
  const [recommended, setRecommended] = useState<Exercise[]>([]);
  const [schedule, setSchedule] = useState<AssignedExercise[]>([]);
  const [category, setCategory] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const categories = useMemo(() => ['Todas', ...Array.from(new Set(catalog.map((item) => item.category).filter(Boolean)))], [catalog]);
  const filteredCatalog = category === 'Todas' ? catalog : catalog.filter((item) => item.category === category);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [catalogResult, recommendedResult, plan, dashboard] = await Promise.all([getExercises(), getRecommendedExercises(), getActivePlan(), getCalorieDashboard()]);
      setCatalog(catalogResult);
      setRecommended(recommendedResult.slice(0, 3));
      setSchedule(plan?.id ? await getExerciseSchedule(plan.id, dashboard?.patientId) : []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudieron cargar los ejercicios.');
    } finally {
      setLoading(false);
    }
  }, [getActivePlan, getCalorieDashboard, getExerciseSchedule, getExercises, getRecommendedExercises]);

  useEffect(() => { void load(); }, [load]);

  return <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Ejercicios</Text>
    <Text style={styles.subtitle}>Catálogo, recomendaciones y rutina semanal para organizar tu actividad física.</Text>
    {loading ? <Card><ActivityIndicator color={colors.primary} /><Text style={styles.center}>Cargando ejercicios…</Text></Card> : null}
    {!loading && error ? <Card><Text style={styles.cardTitle}>No pudimos cargar ejercicios</Text><Text style={styles.center}>{error}</Text><Button label="Reintentar" onPress={load} /></Card> : null}
    {!loading && !error ? <>
      <Card>
        <Text style={styles.cardTitle}>Recomendados para ti</Text>
        {recommended.length ? recommended.map((item) => <ExerciseCard key={item.id} item={item} recommended />) : <Text style={styles.empty}>Aún no hay recomendaciones del backend.</Text>}
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Vista semanal anticipada</Text>
        {days.map((day) => {
          const items = schedule.filter((item) => normalizeDay(item.dayOfWeek) === normalizeDay(day));
          return <View key={day} style={styles.dayBlock}><Text style={styles.dayTitle}>{capitalize(day)}</Text>{items.length ? items.map((item) => <Text key={item.id} style={styles.dayItem}>• {item.exerciseName} · {item.durationMinutes} min · {item.intensity ?? item.category}</Text>) : <Text style={styles.emptySmall}>Sin ejercicios asignados.</Text>}</View>;
        })}
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Catálogo por categorías</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{categories.map((item) => <Choice key={item} label={item} selected={category === item} onPress={() => setCategory(item)} />)}</ScrollView>
        {filteredCatalog.length ? filteredCatalog.map((item) => <ExerciseCard key={item.id} item={item} />) : <Text style={styles.empty}>No hay ejercicios en esta categoría.</Text>}
      </Card>
    </> : null}
    <Button secondary label="Volver al inicio" onPress={onBack} />
  </ScrollView>;
}

function ExerciseCard({ item, recommended }: { item: Exercise; recommended?: boolean }) {
  return <View style={styles.exercise}>
    <View style={styles.row}><Text style={styles.exerciseName}>{item.name}</Text>{recommended ? <Text style={styles.badge}>Recomendado</Text> : null}</View>
    <Text style={styles.meta}>{item.category} · {item.durationMinutes} min · {item.intensity ?? item.difficulty ?? 'Intensidad no definida'}</Text>
    {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
  </View>;
}

function normalizeDay(day: string) { return day.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
function capitalize(text: string) { return `${text.charAt(0).toUpperCase()}${text.slice(1)}`; }

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 48, gap: 14 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900' },
  subtitle: { color: colors.muted, lineHeight: 21, marginBottom: 6 },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 10 },
  center: { color: colors.muted, lineHeight: 21, textAlign: 'center', marginTop: 10 },
  filters: { gap: 8, paddingVertical: 4 },
  exercise: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  exerciseName: { color: colors.text, flex: 1, fontWeight: '900', fontSize: 16 },
  badge: { color: colors.primaryDark, backgroundColor: '#F0F7E8', overflow: 'hidden', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, fontSize: 11, fontWeight: '900' },
  meta: { color: colors.primaryDark, fontWeight: '700', marginTop: 4 },
  description: { color: colors.muted, lineHeight: 20, marginTop: 6 },
  dayBlock: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 10 },
  dayTitle: { color: colors.text, fontWeight: '900' },
  dayItem: { color: colors.muted, marginTop: 5 },
  empty: { color: colors.muted, textAlign: 'center', paddingVertical: 12 },
  emptySmall: { color: colors.muted, fontSize: 12, marginTop: 4 },
});
