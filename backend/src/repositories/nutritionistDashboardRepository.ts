import { pool } from '../db/pool.js';
import { getAdherenceIndicators } from './adherenceRepository.js';

export interface NutritionistDashboard {
  nutritionistId: string;
  periodDays: number;
  activePlans: number;
  totalPatients: number;
  averageAdherencePercentage: number;
  adherenceDistribution: {
    alta: number;
    media: number;
    baja: number;
    pendiente: number;
  };
  pendingAlerts: number;
  weeklyProgressPercentage: number;
  caloriesSummary: {
    plannedAverage: number;
    consumedAverage: number;
  };
  weightTrend: Array<{
    patientId: string;
    patientName: string;
    latestWeightKg?: number;
    records: Array<{ date: string; weightKg: number }>;
  }>;
}

function scoreToLevel(score: number): 'alta' | 'media' | 'baja' {
  if (score >= 80) return 'alta';
  if (score >= 50) return 'media';
  return 'baja';
}

export async function getNutritionistDashboard(
  nutritionistId: string,
  periodDays = 7,
): Promise<NutritionistDashboard> {
  const patientsResult = await pool.query(
    `SELECT id, name, treatment_status FROM patients WHERE nutritionist_id = $1 ORDER BY name ASC`,
    [nutritionistId],
  );

  const patients = patientsResult.rows;
  const adherenceScores: number[] = [];
  const distribution = { alta: 0, media: 0, baja: 0, pendiente: 0 };

  for (const patient of patients) {
    const indicators = await getAdherenceIndicators(String(patient.id), periodDays);
    adherenceScores.push(indicators.overallScore);
    const level = scoreToLevel(indicators.overallScore);
    if (level === 'alta') distribution.alta += 1;
    else if (level === 'media') distribution.media += 1;
    else distribution.baja += 1;
  }

  const activePlansResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM nutrition_plans np
     JOIN patients p ON p.id = np.patient_id
     WHERE p.nutritionist_id = $1 AND np.status = 'active'`,
    [nutritionistId],
  );

  const alertsResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM patient_alerts
     WHERE (nutritionist_id = $1 OR nutritionist_id IS NULL) AND status = 'pending'`,
    [nutritionistId],
  );

  const caloriesResult = await pool.query(
    `SELECT
       COALESCE(AVG(np.daily_calories), 0) AS planned_avg,
       COALESCE(AVG(daily.consumed), 0) AS consumed_avg
     FROM patients p
     LEFT JOIN nutrition_plans np ON np.patient_id = p.id AND np.status = 'active'
     LEFT JOIN (
       SELECT patient_id, log_date, SUM(calories) AS consumed
       FROM (
         SELECT patient_id, log_date, calories FROM meal_logs
         WHERE log_date >= CURRENT_DATE - (($2::int - 1) * INTERVAL '1 day')
           AND status = 'completed'
         UNION ALL
         SELECT patient_id, log_date, calories FROM additional_food_logs
         WHERE log_date >= CURRENT_DATE - (($2::int - 1) * INTERVAL '1 day')
           AND status = 'confirmed'
       ) logs
       GROUP BY patient_id, log_date
     ) daily ON daily.patient_id = p.id
     WHERE p.nutritionist_id = $1`,
    [nutritionistId, periodDays],
  );

  const weightTrend = [];
  for (const patient of patients.slice(0, 5)) {
    const weightResult = await pool.query(
      `SELECT log_date::text AS log_date, weight_kg
       FROM weight_logs
       WHERE patient_id = $1
         AND log_date >= CURRENT_DATE - (($2::int - 1) * INTERVAL '1 day')
       ORDER BY log_date ASC`,
      [String(patient.id), periodDays],
    );

    const records = weightResult.rows.map((row) => ({
      date: String(row.log_date).slice(0, 10),
      weightKg: Number(row.weight_kg),
    }));

    weightTrend.push({
      patientId: String(patient.id),
      patientName: String(patient.name),
      latestWeightKg: records.length ? records[records.length - 1].weightKg : undefined,
      records,
    });
  }

  const averageAdherencePercentage = adherenceScores.length
    ? Math.round(adherenceScores.reduce((sum, score) => sum + score, 0) / adherenceScores.length)
    : 0;

  return {
    nutritionistId,
    periodDays,
    activePlans: Number(activePlansResult.rows[0]?.total ?? 0),
    totalPatients: patients.length,
    averageAdherencePercentage,
    adherenceDistribution: distribution,
    pendingAlerts: Number(alertsResult.rows[0]?.total ?? 0),
    weeklyProgressPercentage: averageAdherencePercentage,
    caloriesSummary: {
      plannedAverage: Math.round(Number(caloriesResult.rows[0]?.planned_avg ?? 0)),
      consumedAverage: Math.round(Number(caloriesResult.rows[0]?.consumed_avg ?? 0)),
    },
    weightTrend,
  };
}
