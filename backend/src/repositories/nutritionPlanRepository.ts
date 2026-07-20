import { pool } from '../db/pool.js';
import {
  ActivePlanForPatient,
  NutritionPlan,
  PlanStatusView,
  resolvePlanStatus,
  WeeklyDayStructure,
  AssignedMenuDTO,
  AssignedMenu,
} from '../types/nutritionPlan.js';

function parseWeeklyStructure(raw: unknown): WeeklyDayStructure[] {
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (Array.isArray(raw)) return raw as WeeklyDayStructure[];
  return [];
}

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
    weeklyStructure: parseWeeklyStructure(row.weekly_structure),
    activatedAt: row.activated_at ? new Date(String(row.activated_at)).toISOString() : undefined,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getAllNutritionPlans(): Promise<NutritionPlan[]> {
  const result = await pool.query('SELECT * FROM nutrition_plans ORDER BY created_at DESC');
  return result.rows.map(mapRow);
}

export async function findNutritionPlanById(id: string): Promise<NutritionPlan | null> {
  const result = await pool.query('SELECT * FROM nutrition_plans WHERE id = $1', [id]);
  if (!result.rowCount) return null;
  return mapRow(result.rows[0]);
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

export async function setNutritionPlanStartDate(
  id: string,
  startDate: string,
): Promise<NutritionPlan | null> {
  const result = await pool.query(
    `UPDATE nutrition_plans
     SET start_date = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, startDate],
  );
  if (!result.rowCount) return null;
  return mapRow(result.rows[0]);
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

export async function getActivePlanForPatient(
  patientId: string,
): Promise<ActivePlanForPatient | null> {
  const result = await pool.query(
    `SELECT * FROM nutrition_plans
     WHERE patient_id = $1 AND status = 'active'
     ORDER BY activated_at DESC NULLS LAST
     LIMIT 1`,
    [patientId],
  );
  if (!result.rowCount) return null;

  const plan = mapRow(result.rows[0]);
  return { ...plan, moduloHabilitado: !plan.moduleLocked };
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

export async function createNutritionPlanSeed(
  patientId: string,
  nutritionistId: string,
): Promise<NutritionPlan> {
  const result = await pool.query(
    `INSERT INTO nutrition_plans (patient_id, nutritionist_id)
     VALUES ($1, $2)
     RETURNING *`,
    [patientId, nutritionistId],
  );
  return mapRow(result.rows[0]);
}

// ===================== HU16 y HU17 =====================

export async function updatePlanWeeklyStructure(
  id: string,
  weeklyStructure: WeeklyDayStructure[],
): Promise<NutritionPlan | null> {
  const result = await pool.query(
    `UPDATE nutrition_plans
     SET weekly_structure = $2::jsonb, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, JSON.stringify(weeklyStructure)],
  );
  if (!result.rowCount) return null;
  return mapRow(result.rows[0]);
}

export async function assignMenuToMealSlot(
  planId: string,
  dayName: string,
  mealId: string,
  dto: AssignedMenuDTO,
): Promise<NutritionPlan | null> {
  const plan = await findNutritionPlanById(planId);
  if (!plan) return null;

  const structure = plan.weeklyStructure || [];
  const newMenu: AssignedMenu = {
    ...dto,
    id: `ass-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };

  const updatedStructure = structure.map((dayObj) => {
    if (dayObj.day.toLowerCase() !== dayName.toLowerCase()) return dayObj;
    const updatedMeals = dayObj.meals.map((meal) => {
      if (meal.id !== mealId) return meal;
      return {
        ...meal,
        assignedMenus: [...(meal.assignedMenus || []), newMenu],
      };
    });
    return { ...dayObj, meals: updatedMeals };
  });

  return updatePlanWeeklyStructure(planId, updatedStructure);
}

export async function removeAssignedMenuFromSlot(
  planId: string,
  dayName: string,
  mealId: string,
  menuId: string,
): Promise<NutritionPlan | null> {
  const plan = await findNutritionPlanById(planId);
  if (!plan) return null;

  const structure = plan.weeklyStructure || [];
  const updatedStructure = structure.map((dayObj) => {
    if (dayObj.day.toLowerCase() !== dayName.toLowerCase()) return dayObj;
    const updatedMeals = dayObj.meals.map((meal) => {
      if (meal.id !== mealId) return meal;
      return {
        ...meal,
        assignedMenus: (meal.assignedMenus || []).filter((am) => am.id !== menuId),
      };
    });
    return { ...dayObj, meals: updatedMeals };
  });

  return updatePlanWeeklyStructure(planId, updatedStructure);
}
