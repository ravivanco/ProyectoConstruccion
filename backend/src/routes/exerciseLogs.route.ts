import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  createExerciseLog,
  deleteExerciseLog,
  findExerciseLogById,
  isValidExerciseCategory,
  listExerciseLogs,
  updateExerciseLog,
} from '../repositories/exerciseLogRepository.js';
import {
  CreateExerciseLogInput,
  EXERCISE_CATEGORIES,
  UpdateExerciseLogInput,
} from '../types/tracking.js';
import { resolvePatientAccess } from '../utils/patientAccess.js';

export const exerciseLogsRouter = Router();

function parseCreateBody(body: unknown): CreateExerciseLogInput | null {
  if (!body || typeof body !== 'object') return null;
  const data = body as Record<string, unknown>;
  const exerciseName = typeof data.exerciseName === 'string' ? data.exerciseName.trim() : '';
  const category = typeof data.category === 'string' ? data.category : '';
  const durationMinutes = Number(data.durationMinutes);

  if (!exerciseName || !isValidExerciseCategory(category) || Number.isNaN(durationMinutes) || durationMinutes <= 0) {
    return null;
  }

  const caloriesBurned = data.caloriesBurned !== undefined ? Number(data.caloriesBurned) : 0;
  if (Number.isNaN(caloriesBurned) || caloriesBurned < 0) return null;

  return {
    exerciseName,
    category,
    durationMinutes,
    caloriesBurned,
    logDate: typeof data.logDate === 'string' ? data.logDate : undefined,
    notes: typeof data.notes === 'string' ? data.notes : undefined,
  };
}

exerciseLogsRouter.post('/exercise-logs/me', authenticate, async (req, res, next) => {
  try {
    const access = resolvePatientAccess(req);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const input = parseCreateBody(req.body);
    if (!input) {
      return res.status(400).json({
        message: `Datos inválidos. category debe ser uno de: ${EXERCISE_CATEGORIES.join(', ')}`,
      });
    }

    const log = await createExerciseLog(access.patientId, input);
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
});

exerciseLogsRouter.get('/exercise-logs/me', authenticate, async (req, res, next) => {
  try {
    const access = resolvePatientAccess(req);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const logDate = typeof req.query.logDate === 'string' ? req.query.logDate : undefined;
    const logs = await listExerciseLogs(access.patientId, logDate);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

exerciseLogsRouter.get('/exercise-logs/patient/:patientId', authenticate, async (req, res, next) => {
  try {
    const access = resolvePatientAccess(req, String(req.params.patientId));
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const logDate = typeof req.query.logDate === 'string' ? req.query.logDate : undefined;
    const logs = await listExerciseLogs(access.patientId, logDate);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

exerciseLogsRouter.put('/exercise-logs/:id', authenticate, async (req, res, next) => {
  try {
    const existing = await findExerciseLogById(String(req.params.id));
    if (!existing) return res.status(404).json({ message: 'Registro no encontrado' });

    if (req.user?.role === 'paciente' && existing.patientId !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const body = req.body as Record<string, unknown>;
    const input: UpdateExerciseLogInput = {};

    if (typeof body.exerciseName === 'string') input.exerciseName = body.exerciseName.trim();
    if (typeof body.category === 'string') {
      if (!isValidExerciseCategory(body.category)) {
        return res.status(400).json({ message: 'category inválida' });
      }
      input.category = body.category;
    }
    if (body.durationMinutes !== undefined) input.durationMinutes = Number(body.durationMinutes);
    if (body.caloriesBurned !== undefined) input.caloriesBurned = Number(body.caloriesBurned);
    if (typeof body.logDate === 'string') input.logDate = body.logDate;
    if (typeof body.notes === 'string') input.notes = body.notes;

    const updated = await updateExerciseLog(String(req.params.id), existing.patientId, input);
    if (!updated) return res.status(404).json({ message: 'Registro no encontrado' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

exerciseLogsRouter.delete('/exercise-logs/:id', authenticate, async (req, res, next) => {
  try {
    const existing = await findExerciseLogById(String(req.params.id));
    if (!existing) return res.status(404).json({ message: 'Registro no encontrado' });

    if (req.user?.role === 'paciente' && existing.patientId !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const deleted = await deleteExerciseLog(String(req.params.id), existing.patientId);
    if (!deleted) return res.status(404).json({ message: 'Registro no encontrado' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
