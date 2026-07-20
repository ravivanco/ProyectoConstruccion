import { useQuery } from '@tanstack/react-query';
import { weightRecordsAPI } from '../services/weightRecordsApi';
import type { WeightChartResponse, WeightLog } from '../types';

export function useWeightLogs(patientId: string, fromDate?: string, toDate?: string) {
  const query = useQuery<WeightLog[], Error>({
    queryKey: ['weight-logs', patientId, fromDate, toDate],
    queryFn: async () => {
      return await weightRecordsAPI.getPatientWeightLogs(patientId, fromDate, toDate);
    },
    enabled: Boolean(patientId),
    staleTime: 1000 * 60 * 5, // 5 min
    retry: 1,
  });

  return {
    logs: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error?.message || 'Error al obtener historial de registros de peso',
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

export function useWeightChart(patientId: string, days = 30) {
  const query = useQuery<WeightChartResponse, Error>({
    queryKey: ['weight-chart', patientId, days],
    queryFn: async () => {
      return await weightRecordsAPI.getPatientWeightChart(patientId, days);
    },
    enabled: Boolean(patientId),
    staleTime: 1000 * 60 * 5, // 5 min
    retry: 1,
  });

  return {
    chartData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error?.message || 'Error al obtener datos del gráfico de peso',
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
