import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ActiveNutritionPlan, NutritionPlanStatus } from '../../domain/models/NutritionPlan';
import { PlanStatusCard } from '../components/PlanStatusCard';
import { Button, Card } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export function MyPlanScreen({ onBack }: { onBack(): void }) {
  const { getActivePlan, getPlanStatus } = useApp();
  const [status, setStatus] = useState<NutritionPlanStatus | null>(null);
  const [plan, setPlan] = useState<ActiveNutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadStatus = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const currentStatus = await getPlanStatus();
      setStatus(currentStatus);
      setPlan(currentStatus?.moduloHabilitado ? await getActivePlan() : null);
    }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'No se pudo consultar Mi Plan.'); }
    finally { setLoading(false); }
  }, [getActivePlan, getPlanStatus]);

  useEffect(() => { void loadStatus(); }, [loadStatus]);

  return <View style={styles.container}>
    <Text style={styles.title}>Mi Plan</Text>
    {loading ? <Card><ActivityIndicator color={colors.primary} /><Text style={styles.centerText}>Consultando tu plan…</Text></Card> : null}
    {!loading && error ? <Card><Text style={styles.icon}>!</Text><Text style={styles.cardTitle}>No pudimos consultar tu plan</Text><Text style={styles.centerText}>{error}</Text><Button label="Reintentar" onPress={loadStatus} /></Card> : null}
    {!loading && !error && !status ? <Card><Text style={styles.icon}>○</Text><Text style={styles.cardTitle}>Aún no tienes un plan</Text><Text style={styles.centerText}>Tu nutricionista te avisará cuando exista una planificación disponible.</Text></Card> : null}
    {!loading && !error && status ? <PlanStatusCard status={status} /> : null}
    {!loading && !error && status?.moduloHabilitado && plan ? <Card>
      <Text style={styles.planTitle}>Tu planificación diaria</Text>
      <Text style={styles.calories}>{Math.round(plan.dailyCalories)} kcal</Text>
      <Text style={styles.caption}>Meta energética diaria</Text>
      <View style={styles.macroRow}>
        <Macro label="Proteína" value={plan.proteinG} />
        <Macro label="Carbohidratos" value={plan.carbsG} />
        <Macro label="Grasas" value={plan.fatG} />
      </View>
    </Card> : null}
    {!loading && !error && status?.moduloHabilitado && !plan ? <Card><Text style={styles.cardTitle}>No hay un plan activo</Text><Text style={styles.centerText}>Tu nutricionista aún no ha publicado una planificación para mostrar.</Text></Card> : null}
    <Button secondary label="Volver al inicio" onPress={onBack} />
  </View>;
}

function Macro({ label, value }: { label: string; value: number }) {
  return <View style={styles.macro}><Text style={styles.macroValue}>{Math.round(value)} g</Text><Text style={styles.macroLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 48 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', marginBottom: 24 },
  icon: { fontSize: 34, textAlign: 'center', marginBottom: 12 },
  cardTitle: { color: colors.text, fontSize: 21, fontWeight: '800', textAlign: 'center' },
  centerText: { color: colors.muted, lineHeight: 21, textAlign: 'center', marginTop: 10 },
  planTitle: { color: colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  calories: { color: colors.primaryDark, fontSize: 36, fontWeight: '900', textAlign: 'center', marginTop: 16 },
  caption: { color: colors.muted, textAlign: 'center' },
  macroRow: { flexDirection: 'row', marginTop: 22 },
  macro: { flex: 1, alignItems: 'center' },
  macroValue: { color: colors.text, fontSize: 17, fontWeight: '800' },
  macroLabel: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 4 },
});
