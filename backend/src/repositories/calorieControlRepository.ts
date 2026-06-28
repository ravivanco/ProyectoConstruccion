import { pool } from '../db/pool.js';
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
