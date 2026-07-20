import { useQuery } from '@tanstack/react-query';
import { alertsAPI } from '../../patients/services/alertsApi';
import type { PatientAlert } from '../../patients/types';

export function useAllAlerts(status?: string, patientId?: string) {
  const query = useQuery<PatientAlert[], Error>({
    queryKey: ['all-alerts', status, patientId],
    queryFn: async () => {
      return await alertsAPI.listAllAlerts(status === 'all' ? undefined : status, patientId);
    },
    staleTime: 1000 * 60 * 2, // 2 min
  });

  return {
    alerts: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error?.message || 'Error al obtener listado global de alertas',
    refetch: query.refetch,
  };
}
