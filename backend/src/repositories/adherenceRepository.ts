import { pool } from '../db/pool.js';
import {
  AdherenceIndicators,
  AdherenceLevel,
  AdherenceLevelSummary,
  AdditionalIntakeSummary,
  ExerciseComplianceSummary,
  FoodComplianceSummary,
  PatientAdherenceOverview,
  PlanDeviationSummary,
  WeightMonitoringSummary,
} from '../types/adherence.js';
import { TreatmentStatus } from '../types/patient.js';
import { MEAL_TYPES } from '../types/tracking.js';

const EXPECTED_MEALS_PER_DAY = MEAL_TYPES.length;

function clampPercentage(value: number): number {
  return Math.min(Math.max(Math.round(value), 0), 100);
}

function scoreToLevel(score: number): AdherenceLevel {
  if (score >= 80) return 'alta';
  if (score >= 50) return 'media';
  return 'baja';
}

function levelToTreatmentStatus(level: AdherenceLevel): TreatmentStatus {
  if (level === 'alta') return 'Alta Adherencia';
  if (level === 'media') return 'Media Adherencia';
  return 'Baja Adherencia';
}

async function getPlannedCalories(patientId: string): Promise<number> {
  const planResult = await pool.query(
    `SELECT daily_calories FROM nutrition_plans
     WHERE patient_id = $1 AND status = 'active'
     ORDER BY activated_at DESC NULLS LAST
     LIMIT 1`,
    [patientId],
  );
  return planResult.rowCount ? Number(planResult.rows[0].daily_calories) : 2000;
}

export async function getFoodCompliance(
  patientId: string,
  periodDays = 7,
): Promise<FoodComplianceSummary> {
  const mealsResult = await pool.query(
    `SELECT log_date::text AS log_date, meal_type
     FROM meal_logs
     WHERE patient_id = $1
       AND log_date >= CURRENT_DATE - (($2::int - 1) * INTERVAL '1 day')
       AND status = 'completed'`,
    [patientId, periodDays],
  );

  const mealsByDate = new Map<string, Set<string>>();
  for (const row of mealsResult.rows) {
    const date = String(row.log_date).slice(0, 10);
    if (!mealsByDate.has(date)) mealsByDate.set(date, new Set());
    mealsByDate.get(date)!.add(String(row.meal_type));
  }

  const mealsLogged = mealsResult.rowCount ?? 0;
  const mealsExpected = periodDays * EXPECTED_MEALS_PER_DAY;
  const missingMealTypes: string[] = [];

  const today = new Date();
  for (let i = 0; i < periodDays; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = date.toISOString().slice(0, 10);
    const logged = mealsByDate.get(dateKey) ?? new Set();
    for (const mealType of MEAL_TYPES) {
      if (!logged.has(mealType)) {
        missingMealTypes.push(`${dateKey}:${mealType}`);
      }
    }
  }

  return {
    patientId,
    periodDays,
    expectedMealsPerDay: EXPECTED_MEALS_PER_DAY,
    daysTracked: mealsByDate.size,
    mealsLogged,
    mealsExpected,
    compliancePercentage: clampPercentage((mealsLogged / mealsExpected) * 100),
    missingMealTypes: missingMealTypes.slice(0, 20),
  };
}

export async function getExerciseCompliance(
  patientId: string,
  periodDays = 7,
): Promise<ExerciseComplianceSummary> {
  const scheduledResult = await pool.query(
    `SELECT scheduled_date::text AS scheduled_date
     FROM patient_exercise_schedule
     WHERE patient_id = $1
       AND scheduled_date >= CURRENT_DATE - (($2::int - 1) * INTERVAL '1 day')`,
    [patientId, periodDays],
  );

  const completedResult = await pool.query(
    `SELECT DISTINCT log_date::text AS log_date
     FROM exercise_logs
     WHERE patient_id = $1
       AND log_date >= CURRENT_DATE - (($2::int - 1) * INTERVAL '1 day')`,
    [patientId, periodDays],
  );

  const completedDates = new Set(
    completedResult.rows.map((row) => String(row.log_date).slice(0, 10)),
  );

  const missedDates: string[] = [];
  for (const row of scheduledResult.rows) {
    const date = String(row.scheduled_date).slice(0, 10);
    if (!completedDates.has(date)) missedDates.push(date);
  }

  const scheduledSessions = scheduledResult.rowCount ?? 0;
  const completedSessions = scheduledSessions > 0
    ? scheduledSessions - missedDates.length
    : completedResult.rowCount ?? 0;

  const denominator = scheduledSessions > 0 ? scheduledSessions : periodDays;
  const numerator = scheduledSessions > 0 ? completedSessions : completedResult.rowCount ?? 0;

  return {
    patientId,
    periodDays,
    scheduledSessions,
    completedSessions: numerator,
    compliancePercentage: clampPercentage((numerator / denominator) * 100),
    missedDates,
  };
}

export async function getWeightMonitoring(
  patientId: string,
  periodDays = 7,
): Promise<WeightMonitoringSummary> {
  const result = await pool.query(
    `SELECT log_date::text AS log_date, weight_kg
     FROM weight_logs
     WHERE patient_id = $1
       AND log_date >= CURRENT_DATE - (($2::int - 1) * INTERVAL '1 day')
     ORDER BY log_date ASC`,
    [patientId, periodDays],
  );

  const records = result.rows.map((row) => ({
    date: String(row.log_date).slice(0, 10),
    weightKg: Number(row.weight_kg),
  }));

  const latestWeightKg = records.length ? records[records.length - 1].weightKg : undefined;
  const previousWeightKg = records.length > 1 ? records[records.length - 2].weightKg : undefined;

  return {
    patientId,
    periodDays,
    daysWithRecords: records.length,
    compliancePercentage: clampPercentage((records.length / periodDays) * 100),
    latestWeightKg,
    previousWeightKg,
    weightChangeKg:
      latestWeightKg !== undefined && previousWeightKg !== undefined
        ? Number((latestWeightKg - previousWeightKg).toFixed(2))
        : undefined,
    records,
  };
}

export async function getAdditionalIntakeMonitoring(
  patientId: string,
  periodDays = 7,
): Promise<AdditionalIntakeSummary> {
  const result = await pool.query(
    `SELECT id, food_name, calories, log_date::text AS log_date, image_url, status
     FROM additional_food_logs
     WHERE patient_id = $1
       AND log_date >= CURRENT_DATE - (($2::int - 1) * INTERVAL '1 day')
     ORDER BY log_date DESC, created_at DESC`,
    [patientId, periodDays],
  );

  const entries = result.rows.map((row) => ({
    id: String(row.id),
    foodName: String(row.food_name),
    calories: Number(row.calories),
    logDate: String(row.log_date).slice(0, 10),
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    status: row.status ? String(row.status) : undefined,
  }));

  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);

  return {
    patientId,
    periodDays,
    totalEntries: entries.length,
    totalCalories,
    entries,
  };
}

export async function getPlanDeviation(
  patientId: string,
  periodDays = 7,
): Promise<PlanDeviationSummary> {
  const plannedCalories = await getPlannedCalories(patientId);

  const result = await pool.query(
    `SELECT log_date::text AS log_date, COALESCE(SUM(calories), 0) AS consumed
     FROM (
       SELECT log_date, calories FROM meal_logs
       WHERE patient_id = $1
         AND log_date >= CURRENT_DATE - (($2::int - 1) * INTERVAL '1 day')
         AND status = 'completed'
       UNION ALL
       SELECT log_date, calories FROM additional_food_logs
       WHERE patient_id = $1
         AND log_date >= CURRENT_DATE - (($2::int - 1) * INTERVAL '1 day')
         AND status = 'confirmed'
     ) daily_logs
     GROUP BY log_date
     ORDER BY log_date ASC`,
    [patientId, periodDays],
  );

  const consumedByDate = new Map<string, number>();
  for (const row of result.rows) {
    consumedByDate.set(String(row.log_date).slice(0, 10), Number(row.consumed));
  }

  const days = [];
  const today = new Date();
  for (let i = periodDays - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = date.toISOString().slice(0, 10);
    const consumedCalories = consumedByDate.get(dateKey) ?? 0;
    const deviationCalories = consumedCalories - plannedCalories;
    const deviationPercentage = plannedCalories > 0
      ? clampPercentage(Math.abs((deviationCalories / plannedCalories) * 100))
      : 0;

    days.push({
      date: dateKey,
      plannedCalories,
      consumedCalories,
      deviationCalories,
      deviationPercentage,
    });
  }

  const averageDeviationPercentage = days.length
    ? clampPercentage(days.reduce((sum, day) => sum + day.deviationPercentage, 0) / days.length)
    : 0;

  return {
    patientId,
    periodDays,
    averageDeviationPercentage,
    days,
  };
}

export async function getAdherenceIndicators(
  patientId: string,
  periodDays = 7,
): Promise<AdherenceIndicators> {
  const [food, exercise, weight, planDeviation] = await Promise.all([
    getFoodCompliance(patientId, periodDays),
    getExerciseCompliance(patientId, periodDays),
    getWeightMonitoring(patientId, periodDays),
    getPlanDeviation(patientId, periodDays),
  ]);

  const calorieAdherencePercentage = clampPercentage(100 - planDeviation.averageDeviationPercentage);
  const overallScore = clampPercentage(
    (food.compliancePercentage * 0.35)
    + (exercise.compliancePercentage * 0.2)
    + (weight.compliancePercentage * 0.15)
    + (calorieAdherencePercentage * 0.3),
  );

  return {
    patientId,
    periodDays,
    foodCompliancePercentage: food.compliancePercentage,
    exerciseCompliancePercentage: exercise.compliancePercentage,
    weightCompliancePercentage: weight.compliancePercentage,
    calorieAdherencePercentage,
    overallScore,
  };
}

export async function getAdherenceLevel(
  patientId: string,
  periodDays = 7,
): Promise<AdherenceLevelSummary> {
  const indicators = await getAdherenceIndicators(patientId, periodDays);
  const level = scoreToLevel(indicators.overallScore);
  const treatmentStatus = levelToTreatmentStatus(level);

  await pool.query(
    `UPDATE patients SET treatment_status = $2 WHERE id = $1`,
    [patientId, treatmentStatus],
  );

  return {
    patientId,
    level,
    treatmentStatus,
    overallScore: indicators.overallScore,
    indicators,
  };
}

export async function getPatientAdherenceOverview(
  patientId: string,
  periodDays = 7,
): Promise<PatientAdherenceOverview> {
  const [
    indicators,
    level,
    foodCompliance,
    exerciseCompliance,
    weightMonitoring,
    additionalIntake,
    planDeviation,
  ] = await Promise.all([
    getAdherenceIndicators(patientId, periodDays),
    getAdherenceLevel(patientId, periodDays),
    getFoodCompliance(patientId, periodDays),
    getExerciseCompliance(patientId, periodDays),
    getWeightMonitoring(patientId, periodDays),
    getAdditionalIntakeMonitoring(patientId, periodDays),
    getPlanDeviation(patientId, periodDays),
  ]);

  return {
    patientId,
    periodDays,
    indicators,
    level,
    foodCompliance,
    exerciseCompliance,
    weightMonitoring,
    additionalIntake,
    planDeviation,
  };
}
