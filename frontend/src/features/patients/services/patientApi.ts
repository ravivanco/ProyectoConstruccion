import api from '../../../lib/axios';
import { endpoints } from '../../../lib/endpoints';

export const patientAPI = {
  // Obtiene el perfil de un paciente (sus alergias, condiciones médicas, etc.)
  getPatientProfile: async (id: string) => {
    const response = await api.get(endpoints.patients.profile(id));
    return response.data;
  },

  // Obtiene el historial de evaluaciones clínicas
  getPatientEvaluations: async (id: string) => {
    const response = await api.get(endpoints.clinicalEvaluations.history(id));
    return response.data;
  },
  
  activatePlan: async (id: string, startDate?: string): Promise<void> => {
    const response = await api.patch(endpoints.nutritionPlans.activate(id), { startDate });
    return response.data;
  },
  
  lockPlan: async (id: string): Promise<void> => {
    const response = await api.patch(endpoints.nutritionPlans.lockModule(id), { locked: true });
    return response.data;
  },

  unlockPlan: async (id: string): Promise<void> => {
    const response = await api.patch(endpoints.nutritionPlans.unlockModule(id));
    return response.data;
  }
};
