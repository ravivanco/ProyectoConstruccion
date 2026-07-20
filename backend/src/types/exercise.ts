export interface ExerciseCatalogItem {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  intensity: string;
  caloriesPerSession: number;
  description?: string;
  isRecommended: boolean;
}

export interface ScheduledExercise extends ExerciseCatalogItem {
  scheduledDate: string;
}
