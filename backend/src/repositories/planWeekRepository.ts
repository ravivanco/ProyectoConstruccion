import { pool } from '../db/pool.js';
import { findNutritionPlanById } from './nutritionPlanRepository.js';
import {
  AssignDayMenuInput,
  CreatePlanWeekInput,
  DAY_LABELS,
  DayPlanStructure,
  MEAL_SLOTS,
  MealConfig,
  MealSlotKey,
  PlanWeek,
} from '../types/planWeek.js';

function isMealSlotKey(value: string): value is MealSlotKey {
  return MEAL_SLOTS.some((slot) => slot.key === value);
}

function defaultDays(includeWeekends: boolean): number[] {
  return includeWeekends ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5];
}

function emptyMeals(): MealConfig[] {
  return MEAL_SLOTS.map((slot) => ({
    mealSlot: slot.key,
    name: slot.name,
    suggestedTime: slot.suggestedTime,
    order: slot.order,
    assignedMenus: [],
  }));
}

async function loadWeekDays(weekId: string, includeWeekends: boolean): Promise<DayPlanStructure[]> {
  const daysResult = await pool.query(
    'SELECT * FROM plan_week_days WHERE week_id = $1 ORDER BY day_of_week ASC',
    [weekId],
  );

  const structures: DayPlanStructure[] = [];

  for (const dayRow of daysResult.rows) {
    const dayOfWeek = Number(dayRow.day_of_week);
    if (!includeWeekends && dayOfWeek > 5) continue;

    const menusResult = await pool.query(
      `SELECT * FROM plan_day_menus
       WHERE week_day_id = $1
       ORDER BY sort_order ASC, created_at ASC`,
      [dayRow.id],
    );

    const meals = emptyMeals();
    for (const menuRow of menusResult.rows) {
      const slot = String(menuRow.meal_slot) as MealSlotKey;
      const meal = meals.find((m) => m.mealSlot === slot);
      if (!meal) continue;
      meal.assignedMenus.push({
        id: String(menuRow.id),
        dishId: menuRow.dish_id ? String(menuRow.dish_id) : undefined,
        name: String(menuRow.dish_name),
        portion: menuRow.portion ? String(menuRow.portion) : undefined,
        calories: Number(menuRow.calories),
        protein: Number(menuRow.protein_g),
        carbs: Number(menuRow.carbs_g),
        fat: Number(menuRow.fat_g),
        notes: menuRow.notes ? String(menuRow.notes) : undefined,
      });
    }

    structures.push({
      day: DAY_LABELS[dayOfWeek - 1],
      dayOfWeek,
      meals,
    });
  }

  return structures;
}

async function mapWeekRow(row: Record<string, unknown>): Promise<PlanWeek> {
  const includeWeekends = Boolean(row.include_weekends);
  return {
    id: String(row.id),
    planId: String(row.plan_id),
    weekNumber: Number(row.week_number),
    title: row.title ? String(row.title) : undefined,
    objective: row.objective ? String(row.objective) : undefined,
    includeWeekends,
    days: await loadWeekDays(String(row.id), includeWeekends),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function createPlanWeek(
  planId: string,
  nutritionistId: string,
  input: CreatePlanWeekInput,
): Promise<PlanWeek | null> {
  const plan = await findNutritionPlanById(planId);
  if (!plan || plan.nutritionistId !== nutritionistId) return null;

  const countResult = await pool.query(
    'SELECT COUNT(*)::int AS total FROM plan_weeks WHERE plan_id = $1',
    [planId],
  );
  const weekNumber = input.weekNumber ?? Number(countResult.rows[0].total) + 1;
  const includeWeekends = input.includeWeekends ?? false;

  const weekResult = await pool.query(
    `INSERT INTO plan_weeks (plan_id, week_number, title, objective, include_weekends)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [planId, weekNumber, input.title ?? null, input.objective ?? null, includeWeekends],
  );

  const weekId = String(weekResult.rows[0].id);
  for (const day of defaultDays(includeWeekends)) {
    await pool.query(
      'INSERT INTO plan_week_days (week_id, day_of_week) VALUES ($1, $2)',
      [weekId, day],
    );
  }

  return mapWeekRow(weekResult.rows[0]);
}

export async function listPlanWeeks(
  planId: string,
  nutritionistId: string,
): Promise<PlanWeek[] | null> {
  const plan = await findNutritionPlanById(planId);
  if (!plan || plan.nutritionistId !== nutritionistId) return null;

  const result = await pool.query(
    'SELECT * FROM plan_weeks WHERE plan_id = $1 ORDER BY week_number ASC',
    [planId],
  );

  return Promise.all(result.rows.map(mapWeekRow));
}

export async function assignDayMenu(
  weekId: string,
  dayOfWeek: number,
  nutritionistId: string,
  input: AssignDayMenuInput,
): Promise<AssignedMenuResult | null> {
  const weekResult = await pool.query(
    `SELECT pw.*, np.nutritionist_id
     FROM plan_weeks pw
     JOIN nutrition_plans np ON np.id = pw.plan_id
     WHERE pw.id = $1`,
    [weekId],
  );
  if (!weekResult.rowCount) return null;
  if (String(weekResult.rows[0].nutritionist_id) !== nutritionistId) return null;

  const includeWeekends = Boolean(weekResult.rows[0].include_weekends);
  if (!includeWeekends && dayOfWeek > 5) return null;
  if (dayOfWeek < 1 || dayOfWeek > 7) return null;
  if (!isMealSlotKey(input.mealSlot)) return null;

  const dayResult = await pool.query(
    'SELECT id FROM plan_week_days WHERE week_id = $1 AND day_of_week = $2',
    [weekId, dayOfWeek],
  );
  if (!dayResult.rowCount) return null;

  const sortResult = await pool.query(
    'SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM plan_day_menus WHERE week_day_id = $1 AND meal_slot = $2',
    [dayResult.rows[0].id, input.mealSlot],
  );

  const menuResult = await pool.query(
    `INSERT INTO plan_day_menus (
      week_day_id, meal_slot, dish_id, dish_name, portion,
      calories, protein_g, carbs_g, fat_g, notes, sort_order
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      dayResult.rows[0].id,
      input.mealSlot,
      input.dishId ?? null,
      input.dishName.trim(),
      input.portion ?? null,
      input.calories,
      input.protein,
      input.carbs,
      input.fat,
      input.notes ?? null,
      Number(sortResult.rows[0].next_order),
    ],
  );

  const row = menuResult.rows[0];
  return {
    menu: {
      id: String(row.id),
      dishId: row.dish_id ? String(row.dish_id) : undefined,
      name: String(row.dish_name),
      portion: row.portion ? String(row.portion) : undefined,
      calories: Number(row.calories),
      protein: Number(row.protein_g),
      carbs: Number(row.carbs_g),
      fat: Number(row.fat_g),
      notes: row.notes ? String(row.notes) : undefined,
    },
    weekId,
    dayOfWeek,
    mealSlot: input.mealSlot,
  };
}

export interface AssignedMenuResult {
  menu: import('../types/planWeek.js').AssignedMenu;
  weekId: string;
  dayOfWeek: number;
  mealSlot: MealSlotKey;
}

export function getOrderedMealTimes() {
  return [...MEAL_SLOTS].sort((a, b) => a.order - b.order);
}

export { isMealSlotKey };
