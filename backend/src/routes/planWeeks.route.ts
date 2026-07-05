import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import {
  createPlanWeek,
  listPlanWeeks,
} from '../repositories/planWeekRepository.js';
import { CreatePlanWeekInput } from '../types/planWeek.js';

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
