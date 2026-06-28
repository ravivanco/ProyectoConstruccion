import { pool } from '../db/pool.js';
import { CalorieDashboard } from '../types/calorieControl.js';

export async function getCalorieDashboard(patientId: string): Promise<CalorieDashboard> {
  const planResult = await pool.query(
    `SELECT * FROM nutrition_plans
     WHERE patient_id = $1 AND status = 'active'
     ORDER BY activated_at DESC NULLS LAST
     LIMIT 1`,
    [patientId],
  );

  const plan = planResult.rows[0];
  const plannedCalories = plan ? Number(plan.daily_calories) : 2000;
  const proteinG = plan ? Number(plan.protein_g) : 120;
  const carbsG = plan ? Number(plan.carbs_g) : 220;
  const fatG = plan ? Number(plan.fat_g) : 65;
  const moduleLocked = plan ? Boolean(plan.module_locked) : true;
  const activePlanId = plan ? String(plan.id) : undefined;

  const todayResult = await pool.query(
    `SELECT COALESCE(SUM(calories), 0) AS total
     FROM meal_logs
     WHERE patient_id = $1 AND log_date = CURRENT_DATE`,
    [patientId],
  );
  const consumedToday = Number(todayResult.rows[0]?.total ?? 0);

  const weekResult = await pool.query(
    `SELECT COALESCE(AVG(daily_total), 0) AS avg
     FROM (
       SELECT log_date, SUM(calories) AS daily_total
       FROM meal_logs
       WHERE patient_id = $1
         AND log_date >= CURRENT_DATE - INTERVAL '6 days'
       GROUP BY log_date
     ) daily`,
    [patientId],
  );
  const weeklyAverageConsumed = Math.round(Number(weekResult.rows[0]?.avg ?? 0));

  const remainingToday = Math.max(plannedCalories - consumedToday, 0);
  const adherencePercentage = plannedCalories > 0
    ? Math.min(Math.round((consumedToday / plannedCalories) * 100), 100)
    : 0;

  return {
    patientId,
    plannedCalories,
    consumedToday,
    remainingToday,
    weeklyAverageConsumed,
    adherencePercentage,
    macros: { proteinG, carbsG, fatG },
    activePlanId,
    moduleLocked,
  };
}
