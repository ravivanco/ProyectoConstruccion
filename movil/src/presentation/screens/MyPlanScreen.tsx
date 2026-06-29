import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NutritionPlanStatus } from '../../domain/models/NutritionPlan';
import { Button, Card } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

function formatStartDate(date?: string) {
  if (!date) return 'la fecha indicada por tu nutricionista';
  return new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}

export function MyPlanScreen({ onBack }: { onBack(): void }) {
  const { getPlanStatus } = useApp();
  const [status, setStatus] = useState<NutritionPlanStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadStatus = useCallback(async () => {
    setLoading(true); setError('');
    try { setStatus(await getPlanStatus()); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'No se pudo consultar Mi Plan.'); }
    finally { setLoading(false); }
  }, [getPlanStatus]);

  useEffect(() => { void loadStatus(); }, [loadStatus]);

  return <View style={styles.container}>
    <Text style={styles.title}>Mi Plan</Text>
    {loading ? <Card><ActivityIndicator color={colors.primary} /><Text style={styles.centerText}>Consultando tu plan…</Text></Card> : null}
    {!loading && error ? <Card><Text style={styles.icon}>!</Text><Text style={styles.cardTitle}>No pudimos consultar tu plan</Text><Text style={styles.centerText}>{error}</Text><Button label="Reintentar" onPress={loadStatus} /></Card> : null}
    {!loading && !error && !status ? <Card><Text style={styles.icon}>○</Text><Text style={styles.cardTitle}>Aún no tienes un plan</Text><Text style={styles.centerText}>Tu nutricionista te avisará cuando exista una planificación disponible.</Text></Card> : null}
    {!loading && !error && status?.effectiveStatus === 'scheduled' ? <Card><Text style={styles.icon}>🗓️</Text><Text style={styles.cardTitle}>Tu plan aún no inicia</Text><Text style={styles.centerText}>Podrás consultar tu planificación desde {formatStartDate(status.startDate)}. Hasta entonces, el contenido permanecerá protegido.</Text></Card> : null}
    {!loading && !error && status && status.effectiveStatus !== 'scheduled' && !status.moduloHabilitado ? <Card><Text style={styles.icon}>🔒</Text><Text style={styles.cardTitle}>Mi Plan está bloqueado</Text><Text style={styles.centerText}>Tu nutricionista habilitará este módulo cuando el plan esté listo. Por ahora no puedes acceder a su contenido.</Text></Card> : null}
    {!loading && !error && status?.moduloHabilitado ? <Card><Text style={styles.icon}>✓</Text><Text style={styles.cardTitle}>Mi Plan está habilitado</Text><Text style={styles.centerText}>Ya puedes consultar tu planificación nutricional.</Text></Card> : null}
    <Button secondary label="Volver al inicio" onPress={onBack} />
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 48 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', marginBottom: 24 },
  icon: { fontSize: 34, textAlign: 'center', marginBottom: 12 },
  cardTitle: { color: colors.text, fontSize: 21, fontWeight: '800', textAlign: 'center' },
  centerText: { color: colors.muted, lineHeight: 21, textAlign: 'center', marginTop: 10 },
});
