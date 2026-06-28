import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { getPlanStatusForPatient } from '../repositories/nutritionPlanRepository.js';

export const nutritionPlansRouter = Router();

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
