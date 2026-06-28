import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { setNutritionPlanStartDate } from '../repositories/nutritionPlanRepository.js';
import { validateStartDate } from '../utils/validateStartDate.js';

export const nutritionPlansRouter = Router();

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
      if (!startDate) {
        return res.status(400).json({ message: 'startDate es requerido' });
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
