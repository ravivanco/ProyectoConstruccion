import { MealReminder } from '../../domain/models/MealReminder';

declare const require: (moduleName: string) => unknown;

type NotificationModule = {
  AndroidImportance?: { HIGH?: unknown };
  setNotificationHandler(handler: unknown): void;
  getPermissionsAsync(): Promise<{ status: string; granted?: boolean }>;
  requestPermissionsAsync(): Promise<{ status: string; granted?: boolean }>;
  scheduleNotificationAsync(input: unknown): Promise<string>;
  cancelAllScheduledNotificationsAsync(): Promise<void>;
  setNotificationChannelAsync?(channelId: string, options: unknown): Promise<void>;
};

export const defaultMealReminders: MealReminder[] = [
  { mealSlot: 'desayuno', name: 'Desayuno', time: '07:00' },
  { mealSlot: 'colacion_matutina', name: 'Media mañana', time: '10:00' },
  { mealSlot: 'almuerzo', name: 'Almuerzo', time: '13:00' },
  { mealSlot: 'colacion_vespertina', name: 'Media tarde', time: '16:00' },
  { mealSlot: 'cena', name: 'Cena', time: '19:00' },
];

function loadNotifications(): NotificationModule {
  return require('expo-notifications') as NotificationModule;
}

function splitTime(time: string) {
  const [hourText = '0', minuteText = '0'] = time.split(':');
  return { hour: Number(hourText), minute: Number(minuteText) };
}

export async function ensureMealReminderPermission() {
  const Notifications = loadNotifications();
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
  await Notifications.setNotificationChannelAsync?.('meal-reminders', {
    name: 'Recordatorios de comidas',
    importance: Notifications.AndroidImportance?.HIGH,
  });
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.status === 'granted') return true;
  const requested = await Notifications.requestPermissionsAsync();
  return Boolean(requested.granted || requested.status === 'granted');
}

export async function scheduleMealReminders(reminders: MealReminder[] = defaultMealReminders) {
  const Notifications = loadNotifications();
  const granted = await ensureMealReminderPermission();
  if (!granted) throw new Error('Activa permisos de notificaciones para recibir recordatorios.');
  await Notifications.cancelAllScheduledNotificationsAsync();
  const scheduled = await Promise.all(reminders.map(async (reminder) => {
    const { hour, minute } = splitTime(reminder.time);
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Hora de ${reminder.name}`,
        body: 'Registra tu comida del plan para mantener tu seguimiento al día.',
        sound: true,
      },
      trigger: { hour, minute, repeats: true, channelId: 'meal-reminders' },
    });
    return { ...reminder, notificationId };
  }));
  return scheduled;
}

export async function cancelMealReminders() {
  const Notifications = loadNotifications();
  await Notifications.cancelAllScheduledNotificationsAsync();
}
