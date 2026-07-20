import { useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsAPI } from '../services/alertsApi';
import type { AlertStatus } from '../types';

export function useAlertMutations(patientId: string) {
  const queryClient = useQueryClient();

  const generateAlertsMutation = useMutation({
    mutationFn: async () => {
      return await alertsAPI.generateAutomaticAlerts(patientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-alerts', patientId] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ alertId, status }: { alertId: string; status: AlertStatus }) => {
      return await alertsAPI.updateAlertStatus(alertId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-alerts', patientId] });
    },
  });

  return {
    generateAlerts: generateAlertsMutation.mutateAsync,
    isGenerating: generateAlertsMutation.isPending,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}
