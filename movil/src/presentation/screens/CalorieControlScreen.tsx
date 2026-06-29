import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { CalorieDashboard } from '../../domain/models/CalorieDashboard';
import { Button, Card } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export function CalorieControlScreen({ onBack }: { onBack(): void }) {
  const { getCalorieDashboard } = useApp();
  const [dashboard, setDashboard] = useState<CalorieDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadDashboard = useCallback(async () => {
    setLoading(true); setError('');
    try { setDashboard(await getCalorieDashboard()); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'No se pudo consultar tu control calórico.'); }
    finally { setLoading(false); }
  }, [getCalorieDashboard]);
  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  return <View style={styles.container}>
    <Text style={styles.title}>Control calórico</Text>
    {loading ? <Card><ActivityIndicator color={colors.primary} /><Text style={styles.center}>Calculando tu meta…</Text></Card> : null}
    {!loading && error ? <Card><Text style={styles.cardTitle}>No pudimos cargar tu meta</Text><Text style={styles.center}>{error}</Text><Button label="Reintentar" onPress={loadDashboard} /></Card> : null}
    {!loading && !error && !dashboard ? <Card><Text style={styles.cardTitle}>Meta aún no disponible</Text><Text style={styles.center}>Necesitas una evaluación clínica para calcular tu requerimiento calórico diario.</Text></Card> : null}
    {!loading && !error && dashboard ? <>
      <Card><Text style={styles.label}>Tu meta diaria</Text><Text style={styles.calories}>{Math.round(dashboard.plannedCalories)}</Text><Text style={styles.unit}>kcal</Text></Card>
      <Card>
        <View style={styles.row}><Metric label="Consumidas" value={dashboard.consumedToday} /><Metric label="Restantes" value={dashboard.remainingToday} /></View>
        <View style={styles.track}><View style={[styles.progress, { width: `${Math.min(Math.max(dashboard.adherencePercentage, 0), 100)}%` }]} /></View>
        <Text style={styles.progressText}>{dashboard.adherencePercentage}% de la meta diaria</Text>
      </Card>
    </> : null}
    <Button secondary label="Volver al inicio" onPress={onBack} />
  </View>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{Math.round(value)} kcal</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 48, gap: 14 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', marginBottom: 10 },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center' },
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
});
