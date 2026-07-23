import { api } from '../../../lib/axios';
import { endpoints } from '../../../lib/endpoints';

export interface Appointment {
  id: string;
  patientId: string;
  dateTime: string;
  reason: string;
  status: 'PROGRAMADA' | 'ATENDIDA' | 'CANCELADA' | 'REPROGRAMADA';
}

export const appointmentsApi = {
  getAppointments: async (): Promise<Appointment[]> => {
    try {
      const response = await api.get(endpoints.appointments.list);
      return response.data;
    } catch {
      return [];
    }
  },
  
  getAppointmentsByPatient: async (patientId: string): Promise<Appointment[]> => {
    try {
      const response = await api.get(endpoints.appointments.patient(patientId));
      return response.data;
    } catch {
      return [];
    }
  }
};
