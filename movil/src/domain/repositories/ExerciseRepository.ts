import { AssignedExercise, Exercise } from '../models/Exercise';

export interface ExerciseRepository {
  getCatalog(category?: string): Promise<Exercise[]>;
  getRecommendations(): Promise<Exercise[]>;
  getWeeklySchedule(planId: string, patientId?: string): Promise<AssignedExercise[]>;
}
