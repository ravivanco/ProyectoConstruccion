import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getCalorieDashboard,
  getCalorieRequirementFromEvaluation,
} from '../repositories/calorieControlRepository.js';
import { ActivityLevel, Sex } from '../utils/metabolism.js';

export const calorieControlRouter = Router();

calorieControlRouter.get(
  '/calorie-control/requirement/:patientId',
  authenticate,
  async (req, res, next) => {
    try {
      const patientId = String(req.params.patientId ?? '').trim();
      if (!patientId) {
        return res.status(400).json({ message: 'patientId requerido' });
      }

      if (req.user?.role === 'paciente' && patientId !== req.user.id) {
        return res.status(403).json({ message: 'No autorizado' });
      }

      const age = typeof req.query.age === 'string' ? Number(req.query.age) : 30;
      const sex = req.query.sex === 'female' ? 'female' : 'male';
      const activityLevel = (
        ['sedentary', 'light', 'moderate', 'high'].includes(String(req.query.activityLevel))
          ? String(req.query.activityLevel)
          : 'moderate'
      ) as ActivityLevel;

      const requirement = await getCalorieRequirementFromEvaluation(
        patientId,
        age,
        sex as Sex,
        activityLevel,
      );

      if (!requirement) {
        return res.status(404).json({ message: 'No hay evaluación clínica para calcular requerimiento' });
      }

      res.json(requirement);
    } catch (error) {
      next(error);
    }
  },
);

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
