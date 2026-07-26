import { api } from '../../../lib/axios';
import { endpoints } from '../../../lib/endpoints';

export interface Alert {
  id: string;
  patientId: string;
  type: 'ADHERENCIA' | 'PESO' | 'EXCESO_CALORICO' | 'INACTIVIDAD';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export const alertsApi = {
  getAlerts: async (): Promise<Alert[]> => {
    try {
      const response = await api.get(endpoints.alerts.list);
      return response.data;
    } catch {
      return [];
    }
  },
  
  resolveAlert: async (alertId: string): Promise<Alert | null> => {
    try {
      const response = await api.patch(endpoints.alerts.resolve(alertId));
      return response.data;
    } catch {
      return null;
    }
  }
};
