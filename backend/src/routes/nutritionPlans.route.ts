import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { activateNutritionPlan, setNutritionPlanModuleLock } from '../repositories/nutritionPlanRepository.js';

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
      const plan = await activateNutritionPlan(id, startDate);

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

      if (typeof req.body?.locked !== 'boolean') {
        return res.status(400).json({ message: 'locked debe ser booleano' });
      }

      const plan = await setNutritionPlanModuleLock(id, req.body.locked);

      if (!plan) {
        return res.status(404).json({ message: 'Plan nutricional no encontrado' });
      }

      res.json(plan);
    } catch (error) {
      next(error);
    }
  },
);
