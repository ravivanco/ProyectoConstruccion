import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import {
  createExercise,
  deleteExercise,
  findExerciseById,
  getAllExercises,
  updateExercise,
} from '../repositories/exerciseRepository.js';
import { CreateExerciseDTO, UpdateExerciseDTO } from '../types/exercise.js';

export const exercisesRouter = Router();

// GET /api/exercises
exercisesRouter.get(
  '/api/exercises',
  authenticate,
  async (req, res, next) => {
    try {
      const { search, category } = req.query;
      const exercises = await getAllExercises({
        search: typeof search === 'string' ? search : undefined,
        category: typeof category === 'string' ? category : undefined,
      });
      res.json(exercises);
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/exercises/:id
exercisesRouter.get(
  '/api/exercises/:id',
  authenticate,
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      const exercise = await findExerciseById(id);
      if (!exercise) {
        return res.status(404).json({ message: 'Ejercicio no encontrado' });
      }
      res.json(exercise);
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/exercises
exercisesRouter.post(
  '/api/exercises',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const body = req.body as CreateExerciseDTO;
      if (!body.name || !body.category) {
        return res
          .status(400)
          .json({ message: 'El nombre y la categoría son campos obligatorios' });
      }
      const newExercise = await createExercise(body);
      res.status(201).json(newExercise);
    } catch (error) {
      next(error);
    }
  },
);

// PUT /api/exercises/:id
exercisesRouter.put(
  '/api/exercises/:id',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      const body = req.body as UpdateExerciseDTO;
      const updated = await updateExercise(id, body);
      if (!updated) {
        return res.status(404).json({ message: 'Ejercicio no encontrado' });
      }
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /api/exercises/:id
exercisesRouter.delete(
  '/api/exercises/:id',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      const deleted = await deleteExercise(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Ejercicio no encontrado' });
      }
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
);
