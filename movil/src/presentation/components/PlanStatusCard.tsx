import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NutritionPlanStatus } from '../../domain/models/NutritionPlan';
import { colors } from '../theme';

function formatStartDate(date?: string) {
  if (!date) return 'la fecha indicada por tu nutricionista';
  return new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}

export function PlanStatusCard({ status }: { status: NutritionPlanStatus }) {
  const pending = status.effectiveStatus === 'scheduled';
  const active = status.moduloHabilitado && status.effectiveStatus === 'active';
  const title = pending ? 'Plan pendiente' : active ? 'Plan activo' : 'Plan bloqueado';
  const message = pending
    ? `Tu plan estará disponible desde ${formatStartDate(status.startDate)}.`
    : active
      ? 'Tu planificación está habilitada y lista para consultar.'
      : 'El contenido estará protegido hasta que tu nutricionista lo habilite.';

  return <View style={[styles.card, pending ? styles.pending : active ? styles.active : styles.locked]}>
    <Text style={styles.icon}>{pending ? '🗓️' : active ? '✓' : '🔒'}</Text>
    <View style={styles.content}><Text style={styles.title}>{title}</Text><Text style={styles.message}>{message}</Text></View>
  </View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center' },
  pending: { backgroundColor: '#FFF8E7', borderColor: '#EBCB78' },
  active: { backgroundColor: '#EEF8E8', borderColor: colors.primary },
  locked: { backgroundColor: '#F3F4F2', borderColor: colors.border },
  icon: { fontSize: 28, marginRight: 14 },
  content: { flex: 1 },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  message: { color: colors.muted, lineHeight: 20, marginTop: 4 },
});
