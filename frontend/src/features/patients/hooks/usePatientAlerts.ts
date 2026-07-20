import { useQuery } from '@tanstack/react-query';
import { alertsAPI } from '../services/alertsApi';
import type { PatientAlert } from '../types';

export function usePatientAlerts(patientId: string, status?: string) {
  const query = useQuery<PatientAlert[], Error>({
    queryKey: ['patient-alerts', patientId, status],
    queryFn: async () => {
      return await alertsAPI.listPatientAlerts(patientId, status);
    },
    enabled: Boolean(patientId),
    staleTime: 1000 * 60 * 2, // 2 min
  });

  return {
    alerts: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error?.message || 'Error al obtener alertas automáticas',
    refetch: query.refetch,
  };
}
