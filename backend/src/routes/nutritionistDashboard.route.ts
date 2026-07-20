import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { getNutritionistDashboard } from '../repositories/nutritionistDashboardRepository.js';

export const nutritionistDashboardRouter = Router();

nutritionistDashboardRouter.get(
  '/nutritionist/dashboard',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const periodDays = Number(req.query.periodDays);
      const days = Number.isNaN(periodDays) || periodDays < 1 || periodDays > 90
        ? 7
        : Math.round(periodDays);

      const dashboard = await getNutritionistDashboard(req.user!.id, days);
      res.json(dashboard);
    } catch (error) {
      next(error);
    }
  },
);
