import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { listExercises, listRecommendedExercises } from '../repositories/exerciseCatalogRepository.js';
import { getPatientProfileById } from '../repositories/patientProfileRepository.js';
import { ActivityLevel } from '../utils/metabolism.js';
import { resolvePatientAccess } from '../utils/patientAccess.js';

export const exercisesRouter = Router();

exercisesRouter.get('/exercises', authenticate, async (req, res, next) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const exercises = await listExercises(category);
    res.json(exercises);
  } catch (error) {
    next(error);
  }
});

exercisesRouter.get('/exercises/recommendations', authenticate, async (req, res, next) => {
  try {
    const access = resolvePatientAccess(req);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const profile = await getPatientProfileById(access.patientId);
    const activityLevel = (profile?.activityLevel ?? 'moderate') as ActivityLevel;
    const exercises = await listRecommendedExercises(activityLevel);
    res.json(exercises);
  } catch (error) {
    next(error);
  }
});
