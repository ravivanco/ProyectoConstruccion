import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import {
  generateMenusWithRestrictions,
  validateMenuAssignment,
} from '../repositories/menuGenerationRepository.js';

export const menuGenerationRouter = Router();

menuGenerationRouter.post(
  '/nutrition-plans/:planId/generate-menus',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const planId = String(req.params.planId ?? '').trim();
      if (!planId) {
        return res.status(400).json({ message: 'planId requerido' });
      }

      const result = await generateMenusWithRestrictions(planId, req.user!.id);
      if (!result) {
        return res.status(404).json({ message: 'Plan nutricional no encontrado' });
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

menuGenerationRouter.post(
  '/nutrition-plans/:planId/validate-menu',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const planId = String(req.params.planId ?? '').trim();
      const body = req.body as Record<string, unknown>;
      const patientId = typeof body.patientId === 'string' ? body.patientId : '';
      const dishName = typeof body.dishName === 'string' ? body.dishName.trim() : '';
      const ingredients = Array.isArray(body.ingredients)
        ? body.ingredients.map((item) => String(item))
        : [];

      if (!planId || !patientId || !dishName) {
        return res.status(400).json({ message: 'patientId y dishName son requeridos' });
      }

      const validation = await validateMenuAssignment(
        patientId,
        req.user!.id,
        dishName,
        ingredients,
      );

      if (!validation.valid) {
        return res.status(409).json(validation);
      }

      res.json(validation);
    } catch (error) {
      next(error);
    }
  },
);
