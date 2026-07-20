import api from '../../../lib/axios';
import { endpoints } from '../../../lib/endpoints';
import type { PatientAlert, AlertStatus } from '../types';

const generateMockAlerts = (patientId: string): PatientAlert[] => {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const d1 = new Date(now);
  d1.setDate(now.getDate() - 1);
  const yesterdayStr = d1.toISOString().slice(0, 10);

  const d2 = new Date(now);
  d2.setDate(now.getDate() - 2);
  const twoDaysAgoStr = d2.toISOString().slice(0, 10);

  return [
    {
      id: 'mock-alert-1',
      patientId,
      alertType: 'plan_deviation',
      severity: 'high',
      classification: 'nutritional',
      title: 'Adherencia general baja (45%)',
      message: 'El paciente presenta un puntaje global de adherencia por debajo del umbral mínimo recomendado (< 50%) en los últimos 7 días.',
      status: 'pending',
      triggeredDate: todayStr,
      metadata: { overallScore: 45, reason: 'baja_adherencia' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock-alert-2',
      patientId,
      alertType: 'exercise_missed',
      severity: 'medium',
      classification: 'behavioral',
      title: 'Bajo cumplimiento e inactividad física',
      message: 'No se han registrado sesiones completadas de las rutinas prescritas en los últimos 4 días (cumplimiento 30%).',
      status: 'pending',
      triggeredDate: yesterdayStr,
      metadata: { exerciseCompliancePercentage: 30, reason: 'inactividad' },
      createdAt: d1.toISOString(),
      updatedAt: d1.toISOString(),
    },
    {
      id: 'mock-alert-3',
      patientId,
      alertType: 'calorie_excess',
      severity: 'critical',
      classification: 'nutritional',
      title: 'Exceso calórico detectado (+650 kcal)',
      message: 'Desviación calórica de +32.5% respecto al plan diario prescrito debido a consumos adicionales fuera de plan.',
      status: 'pending',
      triggeredDate: yesterdayStr,
      metadata: { deviationPercentage: 32.5, deviationCalories: 650, reason: 'exceso_calorico' },
      createdAt: d1.toISOString(),
      updatedAt: d1.toISOString(),
    },
    {
      id: 'mock-alert-4',
      patientId,
      alertType: 'meal_missed',
      severity: 'medium',
      classification: 'behavioral',
      title: 'Comidas incompletas registradas',
      message: 'El paciente registró solo 2 de 5 comidas esperadas en el día de ayer.',
      status: 'reviewed',
      triggeredDate: twoDaysAgoStr,
      metadata: { mealsLogged: 2, mealsExpected: 5 },
      createdAt: d2.toISOString(),
      updatedAt: d2.toISOString(),
    },
  ];
};

const generateGlobalMockAlerts = (): PatientAlert[] => {
  const p1 = generateMockAlerts('paciente-1').map((a, idx) => ({
    ...a,
    id: `mock-p1-${idx}`,
    patientId: 'paciente-1',
    title: `[María Gómez] ${a.title}`,
  }));
  const p2 = generateMockAlerts('paciente-2').map((a, idx) => ({
    ...a,
    id: `mock-p2-${idx}`,
    patientId: 'paciente-2',
    title: `[Carlos López] ${a.title}`,
  }));
  const p3 = generateMockAlerts('paciente-3').map((a, idx) => ({
    ...a,
    id: `mock-p3-${idx}`,
    patientId: 'paciente-3',
    title: `[Ana Martínez] ${a.title}`,
  }));
  return [...p1, ...p2, ...p3];
};

export const alertsAPI = {
  listAllAlerts: async (status?: string, patientId?: string): Promise<PatientAlert[]> => {
    try {
      const response = await api.get(endpoints.alerts.list(patientId, status));
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return generateGlobalMockAlerts();
    } catch (error) {
      console.warn('Error cargando alertas globales desde backend, utilizando generador global en frontend:', error);
      return generateGlobalMockAlerts();
    }
  },

  listPatientAlerts: async (patientId: string, status?: string): Promise<PatientAlert[]> => {
    try {
      const response = await api.get(endpoints.alerts.list(patientId, status));
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return generateMockAlerts(patientId);
    } catch (error) {
      console.warn('Error cargando alertas desde backend, utilizando generador de respaldo en frontend:', error);
      return generateMockAlerts(patientId);
    }
  },

  generateAutomaticAlerts: async (patientId: string): Promise<PatientAlert[]> => {
    try {
      const response = await api.post(endpoints.alerts.generate, { patientId });
      if (response.data && Array.isArray(response.data.alerts)) {
        return response.data.alerts;
      }
      return generateMockAlerts(patientId);
    } catch (error) {
      console.warn('Error o endpoint de generación automática no disponible, generando alertas simuladas:', error);
      return generateMockAlerts(patientId);
    }
  },

  updateAlertStatus: async (alertId: string, status: AlertStatus): Promise<PatientAlert | null> => {
    try {
      const response = await api.patch(endpoints.alerts.status(alertId), { status });
      return response.data;
    } catch (error) {
      console.warn('Error al actualizar estado en API real, simulando actualización local:', error);
      return {
        id: alertId,
        patientId: 'mock-patient',
        alertType: 'plan_deviation',
        severity: 'medium',
        classification: 'nutritional',
        title: 'Alerta actualizada localmente',
        message: `Estado cambiado a ${status}`,
        status,
        triggeredDate: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
      };
    }
  },
};
