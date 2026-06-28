import { pool } from '../db/pool.js';
import { NutritionPlan, PlanStatusView, resolvePlanStatus } from '../types/nutritionPlan.js';

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

export async function getPlanStatusForPatient(patientId: string): Promise<PlanStatusView | null> {
  const result = await pool.query(
    `SELECT * FROM nutrition_plans
     WHERE patient_id = $1 AND status IN ('active', 'draft')
     ORDER BY
       CASE WHEN status = 'active' THEN 0 ELSE 1 END,
       activated_at DESC NULLS LAST
     LIMIT 1`,
    [patientId],
  );
  if (!result.rowCount) return null;
  return resolvePlanStatus(mapRow(result.rows[0]));
}
