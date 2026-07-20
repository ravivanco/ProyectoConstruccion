import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import {
  assignDayMenu,
  createPlanWeek,
  getOrderedMealTimes,
  isMealSlotKey,
  listPlanWeeks,
} from '../repositories/planWeekRepository.js';
import { AssignDayMenuInput, CreatePlanWeekInput } from '../types/planWeek.js';

export const planWeeksRouter = Router();

planWeeksRouter.post(
  '/nutrition-plans/:planId/weeks',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const planId = String(req.params.planId ?? '').trim();
      if (!planId) {
        return res.status(400).json({ message: 'planId requerido' });
      }

      const body = req.body as Record<string, unknown>;
      const input: CreatePlanWeekInput = {};
      if (body.weekNumber !== undefined) input.weekNumber = Number(body.weekNumber);
      if (typeof body.title === 'string') input.title = body.title;
      if (typeof body.objective === 'string') input.objective = body.objective;
      if (typeof body.includeWeekends === 'boolean') input.includeWeekends = body.includeWeekends;

      const week = await createPlanWeek(planId, req.user!.id, input);
      if (!week) {
        return res.status(404).json({ message: 'Plan nutricional no encontrado' });
      }

      res.status(201).json(week);
    } catch (error) {
      next(error);
    }
  },
);

planWeeksRouter.get(
  '/nutrition-plans/:planId/weeks',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const planId = String(req.params.planId ?? '').trim();
      if (!planId) {
        return res.status(400).json({ message: 'planId requerido' });
      }

      const weeks = await listPlanWeeks(planId, req.user!.id);
      if (!weeks) {
        return res.status(404).json({ message: 'Plan nutricional no encontrado' });
      }

      res.json({ planId, weeks });
    } catch (error) {
      next(error);
    }
  },
);

planWeeksRouter.post(
  '/nutrition-plans/weeks/:weekId/days/:day/menus',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const weekId = String(req.params.weekId ?? '').trim();
      const dayOfWeek = Number(req.params.day);

      if (!weekId || Number.isNaN(dayOfWeek)) {
        return res.status(400).json({ message: 'weekId y day requeridos' });
      }

      const body = req.body as Record<string, unknown>;
      const mealSlot = typeof body.mealSlot === 'string' ? body.mealSlot : '';
      const dishName = typeof body.dishName === 'string' ? body.dishName.trim() : '';

      if (!isMealSlotKey(mealSlot) || !dishName) {
        return res.status(400).json({ message: 'mealSlot y dishName son requeridos' });
      }

      const input: AssignDayMenuInput = {
        mealSlot,
        dishId: typeof body.dishId === 'string' ? body.dishId : undefined,
        dishName,
        portion: typeof body.portion === 'string' ? body.portion : undefined,
        calories: Number(body.calories ?? 0),
        protein: Number(body.protein ?? 0),
        carbs: Number(body.carbs ?? 0),
        fat: Number(body.fat ?? 0),
        notes: typeof body.notes === 'string' ? body.notes : undefined,
      };

      const result = await assignDayMenu(weekId, dayOfWeek, req.user!.id, input);
      if (!result) {
        return res.status(404).json({ message: 'Semana o día no encontrado' });
      }

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

planWeeksRouter.get('/meal-times', authenticate, async (_req, res) => {
  res.json(getOrderedMealTimes());
});

planWeeksRouter.get('/meal-alerts/schedules', authenticate, async (_req, res) => {
  const schedules = getOrderedMealTimes().map((slot) => ({
    ...slot,
    alertWindowMinutes: 30,
    suggestedEndTime: slot.suggestedTime,
  }));
  res.json({ schedules });
});
