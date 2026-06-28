import { pool } from '../db/pool.js';
import { NutritionPlan } from '../types/nutritionPlan.js';

function mapRow(row: Record<string, unknown>): NutritionPlan {
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    nutritionistId: String(row.nutritionist_id),
    status: String(row.status) as NutritionPlan['status'],
    moduleLocked: Boolean(row.module_locked),
    startDate: row.start_date ? String(row.start_date).slice(0, 10) : undefined,
    dailyCalories: Number(row.daily_calories),
    proteinG: Number(row.protein_g),
    carbsG: Number(row.carbs_g),
    fatG: Number(row.fat_g),
    activatedAt: row.activated_at ? new Date(String(row.activated_at)).toISOString() : undefined,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function setNutritionPlanModuleLock(
  id: string,
  locked: boolean,
): Promise<NutritionPlan | null> {
  const result = await pool.query(
    `UPDATE nutrition_plans
     SET module_locked = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, locked],
  );
  if (!result.rowCount) return null;
  return mapRow(result.rows[0]);
}
