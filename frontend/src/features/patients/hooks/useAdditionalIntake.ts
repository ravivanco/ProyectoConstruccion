import { useQuery } from '@tanstack/react-query';
import { additionalIntakeAPI } from '../services/additionalIntakeApi';
import type { AdditionalFoodLog } from '../types';

export function useAdditionalIntake(patientId: string, logDate?: string) {
  const query = useQuery<AdditionalFoodLog[], Error>({
    queryKey: ['additional-intake', patientId, logDate],
    queryFn: async () => {
      return await additionalIntakeAPI.getPatientAdditionalIntake(patientId, logDate);
    },
    enabled: Boolean(patientId),
    staleTime: 1000 * 60 * 5, // 5 min
    retry: 1,
  });

  return {
    logs: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error?.message || 'Error al obtener historial de consumos adicionales',
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
