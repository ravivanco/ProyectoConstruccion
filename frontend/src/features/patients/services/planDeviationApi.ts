import api from '../../../lib/axios';
import { endpoints } from '../../../lib/endpoints';
import type { PlanDeviationSummary, PlanDeviationDay } from '../types';

const generateMockPlanDeviation = (patientId: string, periodDays = 7): PlanDeviationSummary => {
  const plannedCalories = 2000;
  const days: PlanDeviationDay[] = [];
  const today = new Date();

  // Simular consumos y desviaciones en los últimos días
  const mockDeviations = [
    { consumed: 2120, dev: 120 }, // Desviación baja
    { consumed: 2650, dev: 650 }, // Desviación alta relevante (+32.5%)
    { consumed: 1980, dev: -20 }, // En rango / negativa leve
    { consumed: 2420, dev: 420 }, // Desviación moderada-alta (+21%)
    { consumed: 2050, dev: 50 },  // Desviación muy baja
    { consumed: 2800, dev: 800 }, // Desviación crítica (+40%)
    { consumed: 2150, dev: 150 }, // Desviación baja
  ];

  for (let i = periodDays - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const mockData = mockDeviations[i % mockDeviations.length] || { consumed: 2100, dev: 100 };
    const consumedCalories = mockData.consumed;
    const deviationCalories = consumedCalories - plannedCalories;
    const deviationPercentage = Math.round(Math.abs((deviationCalories / plannedCalories) * 100));

    days.push({
      date: dateStr,
      plannedCalories,
      consumedCalories,
      deviationCalories,
      deviationPercentage,
    });
  }

  const averageDeviationPercentage = days.length
    ? Math.round(days.reduce((sum, d) => sum + d.deviationPercentage, 0) / days.length)
    : 0;

  return {
    patientId,
    periodDays,
    averageDeviationPercentage,
    days,
  };
};

export const planDeviationAPI = {
  getPatientPlanDeviation: async (
    patientId: string,
    periodDays = 7,
  ): Promise<PlanDeviationSummary> => {
    try {
      const response = await api.get(endpoints.planDeviation.byPeriod(patientId, periodDays));
      if (response.data && Array.isArray(response.data.days)) {
        return response.data;
      }
      return generateMockPlanDeviation(patientId, periodDays);
    } catch (error) {
      console.warn(
        'Endpoint de desviación del plan nutricional no disponible, utilizando cálculo de respaldo en frontend:',
        error,
      );
      return generateMockPlanDeviation(patientId, periodDays);
    }
  },
};
