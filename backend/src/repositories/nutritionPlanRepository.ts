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

export async function activateNutritionPlan(
  id: string,
  startDate?: string,
): Promise<{ plan: NutritionPlan; previousStatus: string } | null> {
  const existing = await pool.query('SELECT status FROM nutrition_plans WHERE id = $1', [id]);
  if (!existing.rowCount) return null;

  const previousStatus = String(existing.rows[0].status);
  const date = startDate ?? new Date().toISOString().slice(0, 10);
  const result = await pool.query(
    `UPDATE nutrition_plans
     SET status = 'active',
         start_date = $2,
         activated_at = NOW(),
         module_locked = FALSE,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, date],
  );
  return { plan: mapRow(result.rows[0]), previousStatus };
}
