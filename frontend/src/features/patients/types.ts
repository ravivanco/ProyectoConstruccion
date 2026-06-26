// Tipos específicos del módulo de Patients
export type GeneralState = 'Alta Adherencia' | 'Media Adherencia' | 'Baja Adherencia';

export interface Patient {
  id: string;
  name: string;
  email: string;
  generalState: GeneralState | 'Pendiente';
  treatmentState?: 'Pendiente' | 'Activo' | 'Suspendido' | 'Finalizado';
  lastVisit: string;
}

export interface PatientDetail extends Patient {
  phone: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  isProfileCompleted: boolean;
  notes?: string;
}
