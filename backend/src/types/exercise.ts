export type ExerciseCategory =
  | 'Fuerza'
  | 'Cardio'
  | 'Flexibilidad'
  | 'Equilibrio'
  | 'HIIT'
  | 'Rehabilitación';

export type ExerciseDifficulty = 'Principiante' | 'Intermedio' | 'Avanzado';

export interface ExerciseItem {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroup: string;
  difficulty: ExerciseDifficulty;
  metValue: number; // Equivalente metabólico (MET) para estimar gasto calórico
  recommendedDurationMin: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseDTO {
  name: string;
  category: ExerciseCategory;
  muscleGroup: string;
  difficulty?: ExerciseDifficulty;
  metValue?: number;
  recommendedDurationMin?: number;
  description?: string;
}

export interface UpdateExerciseDTO {
  name?: string;
  category?: ExerciseCategory;
  muscleGroup?: string;
  difficulty?: ExerciseDifficulty;
  metValue?: number;
  recommendedDurationMin?: number;
  description?: string;
  isActive?: boolean;
}
