export type TreatmentStatus =
  | 'Alta Adherencia'
  | 'Media Adherencia'
  | 'Baja Adherencia'
  | 'Pendiente';

export interface Patient {
  id: string;
  name: string;
  email: string;
  generalState: TreatmentStatus;
  lastVisit?: string;
}

export interface PatientFilters {
  search?: string;
  treatmentStatus?: TreatmentStatus;
}
