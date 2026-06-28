import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getCalorieDashboard } from '../repositories/calorieControlRepository.js';

export const calorieControlRouter = Router();

calorieControlRouter.get(
  '/calorie-control/dashboard',
  authenticate,
  async (req, res, next) => {
    try {
      const queryPatientId = typeof req.query.patientId === 'string' ? req.query.patientId : undefined;
      const patientId = queryPatientId?.trim() || req.user?.id;

      if (!patientId) {
        return res.status(400).json({ message: 'patientId requerido' });
      }

      if (req.user?.role === 'paciente' && patientId !== req.user.id) {
        return res.status(403).json({ message: 'No autorizado para consultar otro paciente' });
      }

      const dashboard = await getCalorieDashboard(patientId);
      res.json(dashboard);
    } catch (error) {
      next(error);
    }
  },
);
