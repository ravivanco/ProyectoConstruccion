export type GeneralState = 'Alta Adherencia' | 'Media Adherencia' | 'Baja Adherencia';

export interface Patient {
  id: string;
  name: string;
  email: string;
  generalState: GeneralState | 'Pendiente';
  treatmentState?: 'Pendiente' | 'Activo' | 'Suspendido' | 'Finalizado';
  lastVisit: string;
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
