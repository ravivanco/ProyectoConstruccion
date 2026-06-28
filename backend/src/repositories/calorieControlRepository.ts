import { pool } from '../db/pool.js';
import { CalorieDashboard } from '../types/calorieControl.js';
import { ActivityLevel, Sex, calculateDailyCalorieRequirement } from '../utils/metabolism.js';

export interface CalorieRequirement {
  patientId: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  bmr: number;
  tdee: number;
  dailyCalories: number;
  evaluationDate: string;
}

export async function getCalorieRequirementFromEvaluation(
  patientId: string,
  age = 30,
  sex: Sex = 'male',
  activityLevel: ActivityLevel = 'moderate',
): Promise<CalorieRequirement | null> {
  const result = await pool.query(
    `SELECT * FROM clinical_evaluations
     WHERE patient_id = $1
     ORDER BY evaluation_date DESC, created_at DESC
     LIMIT 1`,
    [patientId],
  );
  if (!result.rowCount) return null;

  const row = result.rows[0];
  const weightKg = Number(row.weight_kg);
  const heightCm = Number(row.height_cm);
  const { bmr, tdee, dailyCalories } = calculateDailyCalorieRequirement(
    weightKg,
    heightCm,
    age,
    sex,
    activityLevel,
  );

  return {
    patientId,
    weightKg,
    heightCm,
    bmi: Number(row.bmi),
    bmr,
    tdee,
    dailyCalories,
    evaluationDate: String(row.evaluation_date).slice(0, 10),
  };
}

export async function getCalorieDashboard(patientId: string): Promise<CalorieDashboard> {  const planResult = await pool.query(
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
