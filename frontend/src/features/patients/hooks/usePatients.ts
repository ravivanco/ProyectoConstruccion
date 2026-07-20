import { useQuery } from '@tanstack/react-query';
import { patientsAPI } from '../services/patientsApi';
import type { Patient } from '../../../shared/types';

export function usePatients() {
  const query = useQuery<Patient[], Error>({
    queryKey: ['patients'],
    queryFn: patientsAPI.getPatients,
  });

  return {
    patients: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
