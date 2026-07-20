import api from '../../../lib/axios';
import { endpoints } from '../../../lib/endpoints';
import type { WeightChartResponse, WeightLog } from '../types';

const generateMockWeightLogs = (patientId: string, days = 30): WeightLog[] => {
  const logs: WeightLog[] = [];
  const now = new Date();
  const baseWeight = 78.5;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    // Simular variación ligera descendente
    const variation = Math.sin(i * 0.5) * 0.4 - (days - i) * 0.05;
    const weightKg = Number((baseWeight + variation).toFixed(1));

    // Simular que el paciente registra peso cada 1 o 2 días
    if (i % 2 === 0 || i < 5) {
      logs.push({
        id: `mock-w-${i}`,
        patientId,
        weightKg,
        logDate: dateStr,
        notes: i === 0 ? 'Registro matutino post-rutina en móvil' : i === 14 ? 'Control en báscula digital' : undefined,
        createdAt: d.toISOString(),
      });
    }
  }
  return logs;
};

const generateMockWeightChart = (patientId: string, days = 30): WeightChartResponse => {
  const logs = generateMockWeightLogs(patientId, days);
  const points = logs.map((log) => ({
    date: log.logDate,
    weightKg: log.weightKg,
  }));

  const weights = points.map((p) => p.weightKg);
  const minWeight = weights.length ? Math.min(...weights) : 0;
  const maxWeight = weights.length ? Math.max(...weights) : 0;
  const latest = points.length ? points[points.length - 1].weightKg : null;
  const first = points.length ? points[0].weightKg : null;
  const change = latest !== null && first !== null ? Number((latest - first).toFixed(2)) : 0;
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';

  return {
    patientId,
    points,
    summary: {
      latestWeightKg: latest,
      minWeightKg: minWeight,
      maxWeightKg: maxWeight,
      changeKg: change,
      trend,
      daysTracked: points.length,
    },
  };
};

export const weightRecordsAPI = {
  getPatientWeightLogs: async (
    patientId: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<WeightLog[]> => {
    try {
      const response = await api.get(endpoints.weightRecords.list(patientId, fromDate, toDate));
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return generateMockWeightLogs(patientId);
    } catch (error) {
      console.warn('Endpoint de registros de peso no disponible, usando mock en frontend:', error);
      return generateMockWeightLogs(patientId);
    }
  },

  getPatientWeightChart: async (
    patientId: string,
    days = 30,
  ): Promise<WeightChartResponse> => {
    try {
      const response = await api.get(endpoints.weightRecords.chart(patientId, days));
      if (response.data && Array.isArray(response.data.points)) {
        return response.data;
      }
      return generateMockWeightChart(patientId, days);
    } catch (error) {
      console.warn('Endpoint de gráfico de peso no disponible, usando mock en frontend:', error);
      return generateMockWeightChart(patientId, days);
    }
  },
};
