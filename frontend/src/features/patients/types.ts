export type GeneralState = 'Alta Adherencia' | 'Media Adherencia' | 'Baja Adherencia';

export interface Patient {
  id: string;
  name: string;
  email: string;
  generalState: GeneralState | 'Pendiente';
  treatmentState?: 'Pendiente' | 'Activo' | 'Suspendido' | 'Finalizado';
  lastVisit?: string;
}

export interface ClinicalEvaluation {
  id: string;
  date: string;
  weight: number;
  height: number;
  bodyFat: number;
  muscleMass: number;
}

export interface PatientDetail {
  id: string;
  name: string;
  email: string;
  generalState: GeneralState | 'Pendiente';
  treatmentState: 'Pendiente' | 'Activo' | 'Suspendido' | 'Finalizado';
  lastVisit: string;
  phone: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  isProfileCompleted: boolean;
  notes?: string;
  medicalConditions?: string[];
  allergies?: string[];
  preferences?: string[];
  restrictions?: string[];
  objective?: string;
  evaluations?: ClinicalEvaluation[];
  isPlanLocked?: boolean;
}

export type MealStatus = 'completed' | 'missed' | 'pending';

export interface MealItem {
  id: string;
  mealType: 'desayuno' | 'almuerzo' | 'cena' | 'colacion_1' | 'colacion_2';
  name: string;
  scheduledTime: string;
  status: MealStatus;
  loggedAt?: string;
  estimatedCalories: number;
  consumedCalories?: number;
  notes?: string;
  photoUrl?: string;
}

export interface DailyMealCompliance {
  patientId: string;
  date: string;
  totalAssigned: number;
  completedCount: number;
  missedCount: number;
  pendingCount: number;
  complianceRate: number;
  meals: MealItem[];
}
