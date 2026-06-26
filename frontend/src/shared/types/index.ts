export type TreatmentState = 'Pendiente' | 'Activo' | 'Suspendido' | 'Finalizado';

export interface Patient {
  id: string;
  name: string;
  email: string;
  generalState: 'Alta Adherencia' | 'Media Adherencia' | 'Baja Adherencia' | 'Pendiente';
  treatmentState?: TreatmentState;
  lastVisit?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'nutricionista' | 'paciente';
  name: string;
}
