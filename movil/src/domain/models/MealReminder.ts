import { MealSlotKey } from './WeeklyMenu';

export interface MealReminder {
  mealSlot: MealSlotKey;
  name: string;
  time: string;
  notificationId?: string;
}
