import { useQuery } from '@tanstack/react-query';
import { complianceAPI } from '../services/complianceApi';
import type { DailyMealCompliance } from '../types';

export function useMealCompliance(
  patientId: string | undefined,
  date: string,
  refetchIntervalMs: number | false = 30000
) {
  const query = useQuery<DailyMealCompliance, Error>({
    queryKey: ['meal-compliance', patientId, date],
    queryFn: async () => {
      if (!patientId) throw new Error('ID de paciente no proporcionado');
      return await complianceAPI.getPatientMealCompliance(patientId, date);
    },
    enabled: !!patientId && !!date,
    refetchInterval: refetchIntervalMs, // Refresco periódico automático para datos de la app móvil
    staleTime: 10000,
  });

  return {
    complianceData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
