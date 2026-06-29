import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NutritionPlanStatus } from '../../domain/models/NutritionPlan';
import { PlanStatusCard } from '../components/PlanStatusCard';
import { Button, Card } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export function HomeScreen({ onOpenPlan, onOpenCalories }: { onOpenPlan(): void; onOpenCalories(): void }) {
  const { getPlanStatus, reset } = useApp();
  const [status, setStatus] = useState<NutritionPlanStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadStatus = useCallback(async () => {
    setLoading(true); setError('');
    try { setStatus(await getPlanStatus()); }
    catch { setError('No se pudo actualizar el estado de Mi Plan.'); }
    finally { setLoading(false); }
  }, [getPlanStatus]);
  useEffect(() => { void loadStatus(); }, [loadStatus]);

  return <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.brand}>DK-FITT</Text>
    <Text style={styles.title}>Hola, este es tu espacio</Text>
    <Card>
      <Text style={styles.cardTitle}>Mi Plan</Text>
      <Text style={styles.text}>Consulta el estado de tu planificación nutricional.</Text>
      <View style={styles.status}>{loading ? <ActivityIndicator color={colors.primary} /> : status ? <PlanStatusCard status={status} /> : <Text style={styles.empty}>{error || 'Aún no tienes un plan asignado.'}</Text>}</View>
      <Button label="Ver Mi Plan" onPress={onOpenPlan} />
    </Card>
    <Card>
      <Text style={styles.cardTitle}>Control calórico</Text>
      <Text style={styles.text}>Revisa tu meta energética para hoy.</Text>
      <Button label="Ver control calórico" onPress={onOpenCalories} />
    </Card>
    <Button secondary label="Cerrar sesión" onPress={reset} />
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 48, gap: 14 },
  brand: { color: colors.primaryDark, fontSize: 20, fontWeight: '900' },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 8, marginBottom: 24 },
  cardTitle: { color: colors.text, fontSize: 22, fontWeight: '800' },
  text: { color: colors.muted, lineHeight: 21, marginTop: 8 },
  status: { marginTop: 16 },
  empty: { color: colors.muted, textAlign: 'center', paddingVertical: 12 },
});
