import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patientAPI } from '../services/patientApi';

export function useActivatePlan(patientId: string) {
  const queryClient = useQueryClient();

  const activateMutation = useMutation({
    mutationFn: (startDate?: string) => patientAPI.activatePlan(patientId, startDate),
    onSuccess: () => {
      // Forzamos la actualización de los datos del paciente para que la UI se refresque
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });

  const lockMutation = useMutation({
    mutationFn: () => patientAPI.lockPlan(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
    },
  });

  const unlockMutation = useMutation({
    mutationFn: () => patientAPI.unlockPlan(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
    },
  });

  return {
    activatePlan: activateMutation.mutateAsync,
    isActivating: activateMutation.isPending,
    lockPlan: lockMutation.mutateAsync,
    isLocking: lockMutation.isPending,
    unlockPlan: unlockMutation.mutateAsync,
    isUnlocking: unlockMutation.isPending,
  };
}
