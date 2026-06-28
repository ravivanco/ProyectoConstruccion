import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import {
  activateNutritionPlan,
  getActivePlanForPatient,
  getPlanStatusForPatient,
  setNutritionPlanModuleLock,
  setNutritionPlanStartDate,
} from '../repositories/nutritionPlanRepository.js';
import { validateStartDate } from '../utils/validateStartDate.js';

export const nutritionPlansRouter = Router();

nutritionPlansRouter.patch(
  '/nutrition-plans/:id/activate',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      if (!id) {
        return res.status(400).json({ message: 'id del plan requerido' });
      }

      const startDate = typeof req.body?.startDate === 'string' ? req.body.startDate : undefined;
      const result = await activateNutritionPlan(id, startDate);

      if (!result) {
        return res.status(404).json({ message: 'Plan nutricional no encontrado' });
      }

      res.json({
        plan: result.plan,
        statusChange: { from: result.previousStatus, to: result.plan.status },
      });
    } catch (error) {
      next(error);
    }
  },
);

nutritionPlansRouter.patch(
  '/nutrition-plans/:id/start-date',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      const startDate = typeof req.body?.startDate === 'string' ? req.body.startDate.trim() : '';

      if (!id) {
        return res.status(400).json({ message: 'id del plan requerido' });
      }

      const validation = validateStartDate(startDate);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
      }

      const plan = await setNutritionPlanStartDate(id, startDate);
      if (!plan) {
        return res.status(404).json({ message: 'Plan nutricional no encontrado' });
      }

      res.json(plan);
    } catch (error) {
      next(error);
    }
  },
);

nutritionPlansRouter.patch(
  '/nutrition-plans/:id/lock-module',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      if (!id) {
        return res.status(400).json({ message: 'id del plan requerido' });
      }

      const locked = typeof req.body?.locked === 'boolean' ? req.body.locked : true;
      const plan = await setNutritionPlanModuleLock(id, locked);

      if (!plan) {
        return res.status(404).json({ message: 'Plan nutricional no encontrado' });
      }

      res.json(plan);
    } catch (error) {
      next(error);
    }
  },
);

nutritionPlansRouter.patch(
  '/nutrition-plans/:id/unlock-module',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      if (!id) {
        return res.status(400).json({ message: 'id del plan requerido' });
      }

      const plan = await setNutritionPlanModuleLock(id, false);
      if (!plan) {
        return res.status(404).json({ message: 'Plan nutricional no encontrado' });
      }

      res.json(plan);
    } catch (error) {
      next(error);
    }
  },
);

nutritionPlansRouter.get(
  '/nutrition-plans/active/me',
  authenticate,
  requireRole('paciente'),
  async (req, res, next) => {
    try {
      const plan = await getActivePlanForPatient(req.user!.id);
      if (!plan) {
        return res.status(404).json({ message: 'No hay plan nutricional activo' });
      }
      res.json(plan);
    } catch (error) {
      next(error);
    }
  },
);

nutritionPlansRouter.get(
  '/nutrition-plans/status/me',
  authenticate,
  requireRole('paciente'),
  async (req, res, next) => {
    try {
      const planStatus = await getPlanStatusForPatient(req.user!.id);
      if (!planStatus) {
        return res.status(404).json({ message: 'No hay plan nutricional asignado' });
      }
      res.json(planStatus);
    } catch (error) {
      next(error);
    }
  },
);
