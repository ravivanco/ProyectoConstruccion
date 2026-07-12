import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { listExercises } from '../repositories/exerciseCatalogRepository.js';

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
