import api from '../../../lib/axios';
import { endpoints } from '../../../lib/endpoints';

export interface CompareResult {
  base: any;
  target: any;
  differences: {
    weightKg: number;
    bodyFatPercentage: number | null;
    muscleMassPercentage: number | null;
  };
}

export interface TrendData {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPercentage: number | null;
  muscleMassPercentage: number | null;
}

export const clinicalEvaluationAPI = {
  compare: async (patientId: string, baseId: string, targetId: string): Promise<CompareResult> => {
    const response = await api.get(endpoints.clinicalEvaluations.compare(patientId, baseId, targetId));
    return response.data;
  },
  trends: async (patientId: string): Promise<{ patientId: string, trends: TrendData[] }> => {
    const response = await api.get(endpoints.clinicalEvaluations.trends(patientId));
    return response.data;
  }
};
