import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { getActivePlanForPatient } from '../repositories/nutritionPlanRepository.js';

export const nutritionPlansRouter = Router();

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
