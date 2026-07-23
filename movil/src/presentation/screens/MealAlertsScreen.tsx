import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MealReminder } from '../../domain/models/MealReminder';
import { cancelMealReminders, defaultMealReminders, scheduleMealReminders } from '../../infrastructure/notifications/MealReminderNotifications';
import { Button, Card } from '../components/ui';
import { colors } from '../theme';

export function MealAlertsScreen({ onBack }: { onBack(): void }) {
  const [enabled, setEnabled] = useState(false);
  const [reminders, setReminders] = useState<MealReminder[]>(defaultMealReminders);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function enableAlerts() {
    setSaving(true); setMessage('');
    try {
      const scheduled = await scheduleMealReminders(defaultMealReminders);
      setReminders(scheduled);
      setEnabled(true);
      setMessage('Recordatorios locales activados para tus cinco comidas.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudieron activar las notificaciones.');
    } finally {
      setSaving(false);
    }
  }

  async function disableAlerts() {
    setSaving(true); setMessage('');
    try {
      await cancelMealReminders();
      setReminders(defaultMealReminders);
      setEnabled(false);
      setMessage('Recordatorios de comidas desactivados.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudieron desactivar las notificaciones.');
    } finally {
      setSaving(false);
    }
  }

  return <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Alertas de comidas</Text>
    <Text style={styles.subtitle}>Activa recordatorios locales para no olvidar los horarios del plan.</Text>
    <Card>
      <Text style={styles.cardTitle}>Horarios programados</Text>
      {reminders.map((reminder) => <View key={reminder.mealSlot} style={styles.reminderRow}>
        <View>
          <Text style={styles.reminderName}>{reminder.name}</Text>
          <Text style={styles.reminderMeta}>{reminder.notificationId ? `Notificación ${reminder.notificationId}` : 'Pendiente de activar'}</Text>
        </View>
        <Text style={styles.time}>{reminder.time}</Text>
      </View>)}
    </Card>
    <Card>
      <Text style={styles.cardTitle}>Estado</Text>
      <Text style={[styles.status, enabled ? styles.enabled : styles.disabled]}>{enabled ? 'Notificaciones activas' : 'Notificaciones desactivadas'}</Text>
      <Text style={styles.info}>Se notificará desayuno, media mañana, almuerzo, media tarde y cena usando Expo Notifications.</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Button label={saving ? 'Procesando…' : 'Activar notificaciones'} disabled={saving || enabled} onPress={enableAlerts} />
      <Button secondary label="Desactivar recordatorios" disabled={saving || !enabled} onPress={disableAlerts} />
    </Card>
    <Button secondary label="Volver al inicio" onPress={onBack} />
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 48, gap: 14 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900' },
  subtitle: { color: colors.muted, lineHeight: 21, marginBottom: 6 },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 10 },
  reminderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 12 },
  reminderName: { color: colors.text, fontSize: 16, fontWeight: '900' },
  reminderMeta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  time: { color: colors.primaryDark, fontSize: 18, fontWeight: '900' },
  status: { textAlign: 'center', overflow: 'hidden', borderRadius: 14, paddingVertical: 10, fontWeight: '900' },
  enabled: { color: colors.primaryDark, backgroundColor: '#F0F7E8' },
  disabled: { color: colors.muted, backgroundColor: '#EEF1EC' },
  info: { color: colors.muted, lineHeight: 21, textAlign: 'center', marginTop: 12 },
  message: { color: colors.primaryDark, fontWeight: '700', textAlign: 'center', marginTop: 12 },
});
