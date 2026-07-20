export const APPOINTMENT_STATUSES = [
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export interface Appointment {
  id: string;
  patientId: string;
  nutritionistId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentInput {
  patientId: string;
  scheduledAt: string;
  durationMinutes?: number;
  status?: AppointmentStatus;
  notes?: string;
  location?: string;
}

export interface UpdateAppointmentInput {
  scheduledAt?: string;
  durationMinutes?: number;
  status?: AppointmentStatus;
  notes?: string;
  location?: string;
}
