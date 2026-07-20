export type DayOfWeek =
  | 'Lunes'
  | 'Martes'
  | 'Miércoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sábado'
  | 'Domingo';

export interface AssignedExerciseItem {
  id: string;
  planId: string;
  patientId: string;
  exerciseId: string;
  exerciseName: string;
  category: string;
  metValue: number;
  durationMin: number;
  dayOfWeek: DayOfWeek;
  notes?: string;
  completed?: boolean;
  assignedAt: string;
}

export interface CreateAssignedExerciseDTO {
  patientId: string;
  exerciseId: string;
  exerciseName: string;
  category: string;
  metValue: number;
  durationMin: number;
  dayOfWeek: DayOfWeek;
  notes?: string;
}

export interface UpdateAssignedExerciseDTO {
  durationMin?: number;
  dayOfWeek?: DayOfWeek;
  notes?: string;
  completed?: boolean;
}
