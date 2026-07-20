import { useQuery } from '@tanstack/react-query';
import { physicalComplianceAPI } from '../services/physicalComplianceApi';
import type { DailyPhysicalCompliance } from '../types';

export function usePhysicalCompliance(
  patientId: string,
  date: string,
) {
  const query = useQuery<DailyPhysicalCompliance, Error>({
    queryKey: ['physical-compliance', patientId, date],
    queryFn: async () => {
      return await physicalComplianceAPI.getPatientPhysicalCompliance(patientId, date);
    },
    enabled: Boolean(patientId) && Boolean(date),
    staleTime: 1000 * 60 * 5, // 5 min
    retry: 1,
  });

  return {
    complianceData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error?.message || 'Error al cargar el cumplimiento físico del paciente',
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
