import { useQuery } from '@tanstack/react-query';
import { adherenceIndicatorsAPI } from '../services/adherenceIndicatorsApi';
import type { AdherenceIndicators } from '../types';

export function useAdherenceIndicators(patientId: string, periodDays = 7) {
  const query = useQuery<AdherenceIndicators, Error>({
    queryKey: ['adherence-indicators', patientId, periodDays],
    queryFn: async () => {
      return await adherenceIndicatorsAPI.getPatientAdherenceIndicators(patientId, periodDays);
    },
    enabled: Boolean(patientId),
    staleTime: 1000 * 60 * 5, // 5 min
    retry: 1,
  });

  return {
    indicators: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error?.message || 'Error al calcular y cargar indicadores de adherencia',
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
