import { useQuery } from '@tanstack/react-query';
import { planDeviationAPI } from '../services/planDeviationApi';
import type { PlanDeviationSummary } from '../types';

export function usePlanDeviation(patientId: string, periodDays = 7) {
  const query = useQuery<PlanDeviationSummary, Error>({
    queryKey: ['plan-deviation', patientId, periodDays],
    queryFn: async () => {
      return await planDeviationAPI.getPatientPlanDeviation(patientId, periodDays);
    },
    enabled: Boolean(patientId),
    staleTime: 1000 * 60 * 5, // 5 min
    retry: 1,
  });

  return {
    deviationSummary: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error?.message || 'Error al calcular y cargar desviaciones del plan nutricional',
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
