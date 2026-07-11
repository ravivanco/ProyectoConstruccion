import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import {
  createAssignedExercise,
  deleteAssignedExercise,
  getAssignedExercisesByPlanId,
  getPatientMobileExerciseSchedule,
  updateAssignedExercise,
} from '../repositories/assignedExerciseRepository.js';
import {
  CreateAssignedExerciseDTO,
  UpdateAssignedExerciseDTO,
} from '../types/assignedExercise.js';

export const assignedExercisesRouter = Router();

// GET /api/nutrition-plans/:planId/exercises
assignedExercisesRouter.get(
  '/api/nutrition-plans/:planId/exercises',
  authenticate,
  async (req, res, next) => {
    try {
      const planId = String(req.params.planId ?? '').trim();
      const list = await getAssignedExercisesByPlanId(planId);
      res.json(list);
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/nutrition-plans/:planId/exercises
assignedExercisesRouter.post(
  '/api/nutrition-plans/:planId/exercises',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const planId = String(req.params.planId ?? '').trim();
      const body = req.body as CreateAssignedExerciseDTO;
      if (!body.exerciseId || !body.exerciseName || !body.dayOfWeek) {
        return res
          .status(400)
          .json({ message: 'exerciseId, exerciseName y dayOfWeek son obligatorios' });
      }
      const item = await createAssignedExercise(planId, body);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  },
);

// PUT /api/nutrition-plans/:planId/exercises/:id
assignedExercisesRouter.put(
  '/api/nutrition-plans/:planId/exercises/:id',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      const body = req.body as UpdateAssignedExerciseDTO;
      const updated = await updateAssignedExercise(id, body);
      if (!updated) {
        return res.status(404).json({ message: 'Ejercicio asignado no encontrado' });
      }
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /api/nutrition-plans/:planId/exercises/:id
assignedExercisesRouter.delete(
  '/api/nutrition-plans/:planId/exercises/:id',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      const deleted = await deleteAssignedExercise(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Ejercicio asignado no encontrado' });
      }
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/mobile/patients/:patientId/exercises (PROYEC-678 - Sincronización móvil)
assignedExercisesRouter.get(
  '/api/mobile/patients/:patientId/exercises',
  authenticate,
  async (req, res, next) => {
    try {
      const patientId = String(req.params.patientId ?? '').trim();
      const mobileSchedule = await getPatientMobileExerciseSchedule(patientId);
      res.json(mobileSchedule);
    } catch (error) {
      next(error);
    }
  },
);
