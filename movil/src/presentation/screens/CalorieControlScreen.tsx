import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CalorieDashboard } from '../../domain/models/CalorieDashboard';
import { AdditionalIntake, DailyTracking, FoodImageAnalysis, MealLog } from '../../domain/models/Tracking';
import { Button, Card, Choice, Field } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

declare const require: (moduleName: string) => unknown;

const todayIso = () => new Date().toISOString().slice(0, 10);
const mealTypes = [
  { id: 'breakfast', label: 'Desayuno' },
  { id: 'morning_snack', label: 'Media mañana' },
  { id: 'lunch', label: 'Almuerzo' },
  { id: 'afternoon_snack', label: 'Media tarde' },
  { id: 'dinner', label: 'Cena' },
];

export function CalorieControlScreen({ onBack }: { onBack(): void }) {
  const { analyzeFoodImage, confirmAdditionalIntake, createAdditionalIntake, createMealLog, discardAdditionalIntake, getCalorieDashboard, getDailyTracking } = useApp();
  const [dashboard, setDashboard] = useState<CalorieDashboard | null>(null);
  const [tracking, setTracking] = useState<DailyTracking>({ mealLogs: [], additionalIntakes: [] });
  const [selectedMeal, setSelectedMeal] = useState(mealTypes[0]?.id ?? 'breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [analysis, setAnalysis] = useState<FoodImageAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const today = todayIso();
  const consumedAdditional = useMemo(() => tracking.additionalIntakes.reduce((total, item) => total + Number(item.calories || 0), 0), [tracking.additionalIntakes]);

  const loadDashboard = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [dashboardResult, trackingResult] = await Promise.all([getCalorieDashboard(), getDailyTracking(today)]);
      setDashboard(dashboardResult);
      setTracking(trackingResult);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo consultar tu control calórico.');
    } finally {
      setLoading(false);
    }
  }, [getCalorieDashboard, getDailyTracking, today]);

  const markMeal = useCallback(async () => {
    const alreadyMarked = tracking.mealLogs.some((item) => item.mealType === selectedMeal);
    if (alreadyMarked) { setMessage('Esta comida ya fue registrada hoy.'); return; }
    setSaving(true); setMessage('');
    try {
      await createMealLog({ mealType: selectedMeal, calories: Math.max(0, Number(calories.replace(',', '.')) || 0), protein: 0, carbs: 0, fat: 0, status: 'completed' });
      setCalories('');
      setMessage('Comida marcada para hoy. El balance se actualizará al refrescar.');
      await loadDashboard();
    } catch (requestError) {
      setMessage(requestError instanceof Error ? requestError.message : 'No se pudo marcar la comida.');
    } finally {
      setSaving(false);
    }
  }, [calories, createMealLog, loadDashboard, selectedMeal, tracking.mealLogs]);

  const pickImage = useCallback(async () => {
    try {
      const ImagePicker = require('expo-image-picker') as { requestMediaLibraryPermissionsAsync(): Promise<{ granted: boolean }>; launchImageLibraryAsync(options: { base64: boolean; quality: number; mediaTypes?: unknown }): Promise<{ canceled: boolean; assets?: { base64?: string }[] }>; MediaTypeOptions?: { Images?: unknown } };
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) { setMessage('Permiso de galería denegado.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7, mediaTypes: ImagePicker.MediaTypeOptions?.Images });
      const asset = result.assets?.[0];
      if (!result.canceled && asset?.base64) { setImageBase64(asset.base64); setMessage('Imagen seleccionada para análisis.'); }
    } catch {
      setMessage('Instala expo-image-picker para usar cámara o galería.');
    }
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!imageBase64) { setMessage('Selecciona una imagen antes de analizar.'); return; }
    setSaving(true); setMessage('');
    try {
      const result = await analyzeFoodImage(imageBase64);
      setAnalysis(result);
      setFoodName(result.foodName);
      setCalories(String(Math.round(result.calories)));
      setMessage('Estimación lista. Revísala antes de confirmar.');
    } catch (requestError) {
      setMessage(requestError instanceof Error ? requestError.message : 'No se pudo estimar el alimento.');
    } finally {
      setSaving(false);
    }
  }, [analyzeFoodImage, imageBase64]);

  const saveAdditional = useCallback(async () => {
    const caloriesValue = Number(calories.replace(',', '.'));
    if (!foodName.trim() || Number.isNaN(caloriesValue) || caloriesValue < 0) { setMessage('Ingresa alimento y calorías válidas.'); return; }
    setSaving(true); setMessage('');
    try {
      await createAdditionalIntake({ foodName: foodName.trim(), calories: caloriesValue, protein: analysis?.protein ?? 0, carbs: analysis?.carbs ?? 0, fat: analysis?.fat ?? 0, quantity: analysis?.quantity, notes: imageBase64 ? 'Registro con imagen seleccionada desde móvil.' : undefined });
      setFoodName(''); setCalories(''); setAnalysis(null); setImageBase64('');
      setMessage('Alimento adicional guardado. Confírmalo si realmente lo consumiste.');
      await loadDashboard();
    } catch (requestError) {
      setMessage(requestError instanceof Error ? requestError.message : 'No se pudo registrar el alimento adicional.');
    } finally {
      setSaving(false);
    }
  }, [analysis, calories, createAdditionalIntake, foodName, imageBase64, loadDashboard]);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  return <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Control calórico</Text>
    <Text style={styles.subtitle}>Hoy: {today}. Solo puedes registrar comidas del día actual.</Text>
    {loading ? <Card><ActivityIndicator color={colors.primary} /><Text style={styles.center}>Calculando tu meta…</Text></Card> : null}
    {!loading && error ? <Card><Text style={styles.cardTitle}>No pudimos cargar tu meta</Text><Text style={styles.center}>{error}</Text><Button label="Reintentar" onPress={loadDashboard} /></Card> : null}
    {!loading && !error && !dashboard ? <Card><Text style={styles.cardTitle}>Meta aún no disponible</Text><Text style={styles.center}>Necesitas una evaluación clínica para calcular tu requerimiento calórico diario.</Text></Card> : null}
    {!loading && !error && dashboard ? <>
      <Card><Text style={styles.label}>Tu meta diaria</Text><Text style={styles.calories}>{Math.round(dashboard.plannedCalories)}</Text><Text style={styles.unit}>kcal</Text></Card>
      <Card>
        <View style={styles.row}><Metric label="Consumidas" value={dashboard.consumedToday} /><Metric label="Restantes" value={dashboard.remainingToday} danger={dashboard.remainingToday < 0} /></View>
        <View style={styles.track}><View style={[styles.progress, { width: `${Math.min(Math.max(dashboard.adherencePercentage, 0), 100)}%` }]} /></View>
        <Text style={[styles.progressText, dashboard.remainingToday < 0 ? styles.danger : null]}>{dashboard.remainingToday < 0 ? `Exceso de ${Math.abs(Math.round(dashboard.remainingToday))} kcal` : `${dashboard.adherencePercentage}% de la meta diaria`}</Text>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Estado de comidas</Text>
        {mealTypes.map((meal) => <MealState key={meal.id} meal={meal.label} log={tracking.mealLogs.find((item) => item.mealType === meal.id)} />)}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{mealTypes.map((meal) => <Choice key={meal.id} label={meal.label} selected={selectedMeal === meal.id} onPress={() => setSelectedMeal(meal.id)} />)}</ScrollView>
        <Field label="Calorías de la comida" value={calories} keyboardType="numeric" onChangeText={setCalories} placeholder="Ej. 450" />
        <Button label={saving ? 'Guardando…' : 'Marcar comida realizada'} disabled={saving} onPress={markMeal} />
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Alimento adicional</Text>
        <Field label="Nombre del alimento" value={foodName} onChangeText={setFoodName} placeholder="Ej. Yogur con fruta" />
        <Field label="Calorías estimadas" value={calories} keyboardType="numeric" onChangeText={setCalories} placeholder="Ej. 220" />
        {analysis ? <Text style={styles.center}>Estimación: {analysis.foodName} · {Math.round(analysis.calories)} kcal · confianza {Math.round((analysis.confidence ?? 0) * 100)}%</Text> : null}
        <Button secondary label="Seleccionar imagen" onPress={pickImage} />
        <Button secondary label="Analizar imagen" disabled={saving || !imageBase64} onPress={analyzeImage} />
        <Button label={saving ? 'Guardando…' : 'Guardar adicional'} disabled={saving} onPress={saveAdditional} />
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Adicionales de hoy</Text>
        <Text style={styles.center}>Suma registrada: {Math.round(consumedAdditional)} kcal</Text>
        {tracking.additionalIntakes.length ? tracking.additionalIntakes.map((item) => <AdditionalRow key={item.id} item={item} onConfirm={async () => { await confirmAdditionalIntake(item.id); await loadDashboard(); }} onDiscard={() => { Alert.alert('Descartar', '¿Descartar este consumo adicional?', [{ text: 'Cancelar' }, { text: 'Descartar', style: 'destructive', onPress: async () => { await discardAdditionalIntake(item.id); await loadDashboard(); } }]); }} />) : <Text style={styles.empty}>No hay alimentos adicionales registrados hoy.</Text>}
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Distribución de macronutrientes</Text>
        <View style={styles.macroRow}>
          <Macro label="Proteínas" grams={dashboard.macros.proteinG} caloriesPerGram={4} color="#5A8DEE" />
          <Macro label="Carbohidratos" grams={dashboard.macros.carbsG} caloriesPerGram={4} color="#E6A23C" />
          <Macro label="Grasas" grams={dashboard.macros.fatG} caloriesPerGram={9} color="#9B6DD6" />
        </View>
      </Card>
    </> : null}
    <Button secondary label="Volver al inicio" onPress={onBack} />
  </ScrollView>;
}

function Metric({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return <View style={styles.metric}><Text style={[styles.metricValue, danger ? styles.danger : null]}>{Math.round(value)} kcal</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

function MealState({ meal, log }: { meal: string; log?: MealLog }) {
  const status = log ? 'Realizada' : 'Pendiente';
  return <View style={styles.mealState}><Text style={styles.mealName}>{meal}</Text><Text style={[styles.mealBadge, log ? styles.done : styles.pending]}>{status}</Text></View>;
}

function AdditionalRow({ item, onConfirm, onDiscard }: { item: AdditionalIntake; onConfirm(): void; onDiscard(): void }) {
  return <View style={styles.additional}><Text style={styles.mealName}>{item.foodName}</Text><Text style={styles.metricLabel}>{Math.round(item.calories)} kcal · {item.confirmed ? 'Confirmado' : 'Pendiente de confirmar'}</Text><View style={styles.actions}><Button secondary label="Descartar" onPress={onDiscard} /><Button label="Confirmar" onPress={onConfirm} /></View></View>;
}

function Macro({ label, grams, caloriesPerGram, color }: { label: string; grams: number; caloriesPerGram: number; color: string }) {
  const roundedGrams = Math.round(grams);
  return <View style={styles.macro}>
    <View style={[styles.macroDot, { backgroundColor: color }]} />
    <Text style={styles.macroValue}>{roundedGrams} g</Text>
    <Text style={styles.macroCalories}>{roundedGrams * caloriesPerGram} kcal</Text>
    <Text style={styles.macroLabel}>{label}</Text>
  </View>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 48, gap: 14 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900' },
  subtitle: { color: colors.muted, lineHeight: 21, marginBottom: 6 },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 10 },
  center: { color: colors.muted, lineHeight: 21, textAlign: 'center', marginTop: 10 },
  label: { color: colors.muted, fontWeight: '700', textAlign: 'center' },
  calories: { color: colors.primaryDark, fontSize: 52, fontWeight: '900', textAlign: 'center', marginTop: 4 },
  unit: { color: colors.muted, textAlign: 'center' },
  row: { flexDirection: 'row' },
  metric: { flex: 1, alignItems: 'center' },
  metricValue: { color: colors.text, fontSize: 18, fontWeight: '800' },
  metricLabel: { color: colors.muted, marginTop: 4 },
  track: { height: 10, borderRadius: 5, backgroundColor: '#E7ECE4', overflow: 'hidden', marginTop: 22 },
  progress: { height: '100%', backgroundColor: colors.primary },
  progressText: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 8 },
  filters: { gap: 8, paddingVertical: 8 },
  mealState: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 10 },
  mealName: { color: colors.text, fontWeight: '800' },
  mealBadge: { overflow: 'hidden', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, fontWeight: '900', fontSize: 12 },
  done: { color: colors.primaryDark, backgroundColor: '#F0F7E8' },
  pending: { color: colors.muted, backgroundColor: '#EEF1EC' },
  additional: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  message: { color: colors.primaryDark, fontWeight: '700', textAlign: 'center', marginTop: 10 },
  danger: { color: colors.danger },
  empty: { color: colors.muted, textAlign: 'center', paddingVertical: 12 },
  macroRow: { flexDirection: 'row', marginTop: 12 },
  macro: { flex: 1, alignItems: 'center', paddingHorizontal: 3 },
  macroDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 8 },
  macroValue: { color: colors.text, fontSize: 17, fontWeight: '900' },
  macroCalories: { color: colors.primaryDark, fontSize: 12, fontWeight: '700', marginTop: 2 },
  macroLabel: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 5 },
});
