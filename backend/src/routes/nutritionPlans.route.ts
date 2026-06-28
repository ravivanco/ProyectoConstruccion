import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { activateNutritionPlan } from '../repositories/nutritionPlanRepository.js';

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
        statusChange: {
          from: result.previousStatus,
          to: result.plan.status,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);
