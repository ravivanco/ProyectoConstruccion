import { pool } from '../db/pool.js';
import { MacroDistribution, calculateMacroDistribution } from '../utils/macros.js';

export async function getMacroDistributionForPatient(
  patientId: string,
  goal: 'lose_weight' | 'maintain_weight' | 'gain_muscle' = 'maintain_weight',
): Promise<MacroDistribution | null> {
  const evalResult = await pool.query(
    `SELECT weight_kg FROM clinical_evaluations
     WHERE patient_id = $1
     ORDER BY evaluation_date DESC, created_at DESC
     LIMIT 1`,
    [patientId],
  );
  if (!evalResult.rowCount) return null;

  const planResult = await pool.query(
    `SELECT daily_calories FROM nutrition_plans
     WHERE patient_id = $1 AND status = 'active'
     ORDER BY created_at DESC
     LIMIT 1`,
    [patientId],
  );

  const weightKg = Number(evalResult.rows[0].weight_kg);
  const dailyCalories = planResult.rowCount
    ? Number(planResult.rows[0].daily_calories)
    : 2000;

  const distribution = calculateMacroDistribution(dailyCalories, weightKg, goal);

  return { patientId, ...distribution };
}
