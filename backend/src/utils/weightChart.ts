import { WeightLog } from '../types/tracking.js';

export interface WeightChartResponse {
  patientId: string;
  points: Array<{ date: string; weightKg: number }>;
  summary: {
    latestWeightKg: number | null;
    minWeightKg: number;
    maxWeightKg: number;
    changeKg: number;
    trend: 'up' | 'down' | 'stable';
    daysTracked: number;
  };
}

export function buildWeightChart(patientId: string, logs: WeightLog[], limit = 30): WeightChartResponse {
  const points = [...logs]
    .sort((a, b) => a.logDate.localeCompare(b.logDate))
    .map((log) => ({
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
}
