import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WeightRecord } from '../../domain/models/Tracking';
import { Button, Card, Field } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export function ProgressScreen({ onBack }: { onBack(): void }) {
  const { createWeightRecord, getWeightRecords } = useApp();
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const sorted = useMemo(() => [...records].sort((a, b) => a.logDate.localeCompare(b.logDate)), [records]);
  const latest = sorted.at(-1);
  const previous = sorted.at(-2);
  const variation = latest && previous ? latest.weightKg - previous.weightKg : 0;

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setRecords(await getWeightRecords()); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el progreso.'); }
    finally { setLoading(false); }
  }, [getWeightRecords]);

  const save = useCallback(async () => {
    const value = Number(weight.replace(',', '.'));
    if (Number.isNaN(value) || value <= 0 || value > 400) { setMessage('Ingresa un peso válido mayor a 0.'); return; }
    setSaving(true); setMessage('');
    try {
      await createWeightRecord(value, notes.trim() || undefined);
      setWeight(''); setNotes(''); setMessage('Peso guardado correctamente para hoy.');
      await load();
    } catch (requestError) {
      setMessage(requestError instanceof Error ? requestError.message : 'No se pudo guardar el peso.');
    } finally {
      setSaving(false);
    }
  }, [createWeightRecord, load, notes, weight]);

  useEffect(() => { void load(); }, [load]);

  return <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Progreso</Text>
    <Card>
      <Text style={styles.cardTitle}>Registro de peso diario</Text>
      <Field label="Peso de hoy (kg)" value={weight} keyboardType="decimal-pad" onChangeText={setWeight} placeholder="Ej. 72.5" />
      <Field label="Nota opcional" value={notes} onChangeText={setNotes} placeholder="Ej. después de entrenar" />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Button label={saving ? 'Guardando…' : 'Guardar peso'} disabled={saving} onPress={save} />
    </Card>
    {loading ? <Card><ActivityIndicator color={colors.primary} /><Text style={styles.center}>Cargando historial…</Text></Card> : null}
    {!loading && error ? <Card><Text style={styles.cardTitle}>Sin progreso disponible</Text><Text style={styles.center}>{error}</Text><Button label="Reintentar" onPress={load} /></Card> : null}
    {!loading && !error ? <Card>
      <Text style={styles.cardTitle}>Estadísticas</Text>
      {latest ? <View style={styles.stats}>
        <Stat label="Último peso" value={`${latest.weightKg.toFixed(1)} kg`} />
        <Stat label="Variación" value={`${variation >= 0 ? '+' : ''}${variation.toFixed(1)} kg`} danger={variation > 0} />
        <Stat label="Registros" value={`${records.length}`} />
      </View> : <Text style={styles.empty}>Aún no hay registros de peso.</Text>}
      {sorted.length ? <View style={styles.chart}>{sorted.slice(-7).map((item) => <View key={item.id} style={styles.barWrap}><View style={[styles.bar, { height: Math.max(12, Math.min(110, item.weightKg)) }]} /><Text style={styles.barLabel}>{formatDate(item.logDate)}</Text></View>)}</View> : null}
    </Card> : null}
    <Button secondary label="Volver al inicio" onPress={onBack} />
  </ScrollView>;
}

function Stat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return <View style={styles.stat}><Text style={[styles.statValue, danger ? styles.danger : null]}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function formatDate(date: string) {
  const [, month = '', day = ''] = date.slice(0, 10).split('-');
  return `${day}/${month}`;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 48, gap: 14 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900' },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 10 },
  center: { color: colors.muted, lineHeight: 21, textAlign: 'center', marginTop: 10 },
  message: { color: colors.primaryDark, fontWeight: '700', textAlign: 'center' },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, alignItems: 'center', backgroundColor: '#F8FAF7', borderRadius: 14, padding: 10 },
  statValue: { color: colors.text, fontWeight: '900', fontSize: 18 },
  statLabel: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 4 },
  danger: { color: colors.danger },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', minHeight: 140, marginTop: 18 },
  barWrap: { alignItems: 'center', flex: 1 },
  bar: { width: 18, borderRadius: 9, backgroundColor: colors.primary },
  barLabel: { color: colors.muted, fontSize: 10, marginTop: 6 },
  empty: { color: colors.muted, textAlign: 'center', paddingVertical: 12 },
});
