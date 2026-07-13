export type ExerciseIntensity = 'Baja' | 'Media' | 'Alta' | 'Principiante' | 'Intermedio' | 'Avanzado';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  intensity?: ExerciseIntensity | string;
  difficulty?: string;
  description?: string;
  caloriesBurned?: number;
}

export interface AssignedExercise {
  id: string;
  planId?: string;
  patientId?: string;
  exerciseId: string;
  exerciseName: string;
  category: string;
  dayOfWeek: string;
  durationMinutes: number;
  intensity?: string;
  caloriesBurned?: number;
  notes?: string;
}
