import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getMealStatusByDate,
  isValidMealType,
  upsertMealTracking,
} from '../repositories/mealLogRepository.js';
import { getCalorieToday } from '../repositories/calorieControlRepository.js';
import { CreateMealLogInput, MEAL_TYPES } from '../types/tracking.js';
import { assertTodayDate } from '../utils/dateValidation.js';
import { resolvePatientAccess } from '../utils/patientAccess.js';

export const mealTrackingRouter = Router();

function parseTrackingBody(body: unknown): CreateMealLogInput | null {
  if (!body || typeof body !== 'object') return null;
  const data = body as Record<string, unknown>;
  const mealType = typeof data.mealType === 'string' ? data.mealType : '';
  const calories = Number(data.calories);

  if (!isValidMealType(mealType) || Number.isNaN(calories) || calories < 0) return null;

  return {
    mealType,
    calories,
    protein: data.protein !== undefined ? Number(data.protein) : 0,
    carbs: data.carbs !== undefined ? Number(data.carbs) : 0,
    fat: data.fat !== undefined ? Number(data.fat) : 0,
    foodName: typeof data.foodName === 'string' ? data.foodName.trim() : undefined,
    logDate: typeof data.logDate === 'string' ? data.logDate : undefined,
    status: data.status === 'skipped' ? 'skipped' : 'completed',
    dishId: typeof data.dishId === 'string' ? data.dishId : undefined,
    notes: typeof data.notes === 'string' ? data.notes : undefined,
  };
}

mealTrackingRouter.post('/meal-tracking', authenticate, async (req, res, next) => {
  try {
    const access = resolvePatientAccess(req);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const input = parseTrackingBody(req.body);
    if (!input) {
      return res.status(400).json({
        message: `Datos inválidos. mealType debe ser uno de: ${MEAL_TYPES.join(', ')}`,
      });
    }

    const dateCheck = assertTodayDate(input.logDate);
    if (!dateCheck.ok) return res.status(400).json({ message: dateCheck.message });

    const log = await upsertMealTracking(access.patientId, {
      ...input,
      logDate: dateCheck.date,
      status: input.status ?? 'completed',
    });

    const calorieSummary = await getCalorieToday(access.patientId);
    res.status(201).json({
      log,
      calorieSummary,
      balanceUpdated: true,
      remainingCalories: calorieSummary.remainingCalories,
    });
  } catch (error) {
    next(error);
  }
});

mealTrackingRouter.get('/meal-tracking/status', authenticate, async (req, res, next) => {
  try {
    const access = resolvePatientAccess(req);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const logDate =
      typeof req.query.date === 'string' && req.query.date
        ? req.query.date
        : new Date().toISOString().slice(0, 10);

    const meals = await getMealStatusByDate(access.patientId, logDate);
    res.json({ patientId: access.patientId, date: logDate, meals });
  } catch (error) {
    next(error);
  }
});
