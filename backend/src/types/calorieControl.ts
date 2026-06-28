export interface CalorieDashboard {
  patientId: string;
  plannedCalories: number;
  consumedToday: number;
  remainingToday: number;
  weeklyAverageConsumed: number;
  adherencePercentage: number;
  macros: { proteinG: number; carbsG: number; fatG: number };
  activePlanId?: string;
  moduleLocked: boolean;
}
