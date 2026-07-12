export interface CalorieDashboard {
  patientId: string;
  plannedCalories: number;
  consumedToday: number;
  remainingToday: number;
  remainingCalories: number;
  weeklyAverageConsumed: number;
  adherencePercentage: number;
  macros: {
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  activePlanId?: string;
  moduleLocked: boolean;
}

export interface CalorieTodaySummary {
  patientId: string;
  date: string;
  plannedCalories: number;
  consumedCalories: number;
  burnedCalories: number;
  balanceCalories: number;
  remainingCalories: number;
  adherencePercentage: number;
  macros: CalorieDashboard['macros'];
}
