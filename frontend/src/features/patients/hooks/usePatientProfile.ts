import { useQuery } from '@tanstack/react-query';
import { patientAPI } from '../services/patientApi';
import type { PatientDetail, ClinicalEvaluation } from '../types';

export function usePatientProfile(patientId: string | undefined) {
  const query = useQuery<PatientDetail, Error>({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      if (!patientId) throw new Error("ID de paciente no proporcionado");
      
      // Hacemos las peticiones en paralelo (perfil y evaluaciones)
      const [profileData, evaluationsData] = await Promise.all([
        patientAPI.getPatientProfile(patientId).catch(() => null),
        patientAPI.getPatientEvaluations(patientId).catch(() => null)
      ]);

      if (!profileData) {
        throw new Error("Perfil de paciente no encontrado");
      }

      // Mezclamos la respuesta para cumplir con la interfaz PatientDetail que espera la UI
      return {
        id: patientId,
        name: profileData.names || 'Sin Nombre',
        email: profileData.email || 'Sin Email',
        generalState: 'Pendiente', // El backend real quizá no devuelva esto directamente en el perfil, mock por ahora
        treatmentState: 'Pendiente',
        lastVisit: 'Reciente',
        phone: profileData.phone || '',
        age: 30, // Mock, calcular si backend da fecha nac
        weight: profileData.weight || 0,
        height: profileData.height || 0,
        isProfileCompleted: profileData.completed || false,
        notes: profileData.notes || '',
        medicalConditions: profileData.medicalConditions || [],
        allergies: profileData.allergies || [],
        preferences: profileData.foodPreferences || [],
        restrictions: profileData.foodRestrictions || [],
        objective: profileData.nutritionGoal || '',
        evaluations: evaluationsData?.evaluations || [],
        isPlanLocked: false,
      };
    },
    enabled: !!patientId,
  });

  return {
    patient: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
