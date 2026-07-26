import { api } from '../../../lib/axios';
import { endpoints } from '../../../lib/endpoints';

export interface AdherenceLog {
  id: string;
  patientId: string;
  logDate: string;
  mealAdherencePercent: number;
  physicalAdherencePercent: number;
  dailyWeightKg?: number;
  extraCaloriesConsumed: number;
  adherenceLevel: 'ALTA' | 'MEDIA' | 'BAJA';
  createdAt?: string;
  updatedAt?: string;
}

export interface ExtraConsumption {
  id: string;
  patientId: string;
  logDate: string;
  foodDescription: string;
  calories: number;
  imageUrl?: string;
  createdAt?: string;
}

export interface AdherenceSummary {
  logs: AdherenceLog[];
  extraConsumptions: ExtraConsumption[];
}

export const adherenceApi = {
  getSummary: async (patientId: string): Promise<AdherenceSummary | null> => {
    try {
      const response = await api.get(endpoints.adherence.summary(patientId));
      return response.data;
    } catch {
      return null;
    }
  },

  logAdherence: async (patientId: string, data: Partial<AdherenceLog>): Promise<AdherenceLog | null> => {
    try {
      const response = await api.post(endpoints.adherence.log(patientId), data);
      return response.data;
    } catch {
      return null;
    }
  },

  logExtraConsumption: async (patientId: string, data: Partial<ExtraConsumption>): Promise<ExtraConsumption | null> => {
    try {
      const response = await api.post(endpoints.adherence.extraConsumption(patientId), data);
      return response.data;
    } catch {
      return null;
    }
  }
};
