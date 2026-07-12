import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  createMealLog,
  deleteMealLog,
  findMealLogById,
  isValidMealType,
  listMealLogs,
  updateMealLog,
} from '../repositories/mealLogRepository.js';
import { CreateMealLogInput, MEAL_TYPES, UpdateMealLogInput } from '../types/tracking.js';
import { resolvePatientAccess } from '../utils/patientAccess.js';

export const mealLogsRouter = Router();

function parseCreateBody(body: unknown): CreateMealLogInput | null {
  if (!body || typeof body !== 'object') return null;
  const data = body as Record<string, unknown>;
  const mealType = typeof data.mealType === 'string' ? data.mealType : '';
  const calories = Number(data.calories);

  if (!isValidMealType(mealType) || Number.isNaN(calories) || calories < 0) return null;

  const protein = data.protein !== undefined ? Number(data.protein) : 0;
  const carbs = data.carbs !== undefined ? Number(data.carbs) : 0;
  const fat = data.fat !== undefined ? Number(data.fat) : 0;

  if ([protein, carbs, fat].some((n) => Number.isNaN(n) || n < 0)) return null;

  return {
    mealType,
    foodName: typeof data.foodName === 'string' ? data.foodName.trim() : undefined,
    calories,
    protein,
    carbs,
    fat,
    logDate: typeof data.logDate === 'string' ? data.logDate : undefined,
    notes: typeof data.notes === 'string' ? data.notes : undefined,
    dishId: typeof data.dishId === 'string' ? data.dishId : undefined,
  };
}

mealLogsRouter.post('/meal-logs/me', authenticate, async (req, res, next) => {
  try {
    const access = resolvePatientAccess(req);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const input = parseCreateBody(req.body);
    if (!input) {
      return res.status(400).json({
        message: `Datos inválidos. mealType debe ser uno de: ${MEAL_TYPES.join(', ')}`,
      });
    }

    const log = await createMealLog(access.patientId, input);
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
});

mealLogsRouter.get('/meal-logs/me', authenticate, async (req, res, next) => {
  try {
    const access = resolvePatientAccess(req);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const logDate = typeof req.query.logDate === 'string' ? req.query.logDate : undefined;
    const logs = await listMealLogs(access.patientId, logDate);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

mealLogsRouter.get('/meal-logs/patient/:patientId', authenticate, async (req, res, next) => {
  try {
    const access = resolvePatientAccess(req, String(req.params.patientId));
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const logDate = typeof req.query.logDate === 'string' ? req.query.logDate : undefined;
    const logs = await listMealLogs(access.patientId, logDate);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

mealLogsRouter.put('/meal-logs/:id', authenticate, async (req, res, next) => {
  try {
    const access = resolvePatientAccess(req);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const existing = await findMealLogById(String(req.params.id));
    if (!existing) return res.status(404).json({ message: 'Registro no encontrado' });

    if (req.user?.role === 'paciente' && existing.patientId !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const body = req.body as Record<string, unknown>;
    const input: UpdateMealLogInput = {};

    if (typeof body.mealType === 'string') {
      if (!isValidMealType(body.mealType)) {
        return res.status(400).json({ message: 'mealType inválido' });
      }
      input.mealType = body.mealType;
    }
    if (typeof body.foodName === 'string') input.foodName = body.foodName.trim();
    if (body.calories !== undefined) input.calories = Number(body.calories);
    if (body.protein !== undefined) input.protein = Number(body.protein);
    if (body.carbs !== undefined) input.carbs = Number(body.carbs);
    if (body.fat !== undefined) input.fat = Number(body.fat);
    if (typeof body.logDate === 'string') input.logDate = body.logDate;
    if (typeof body.notes === 'string') input.notes = body.notes;
    if (typeof body.dishId === 'string') input.dishId = body.dishId;

    const updated = await updateMealLog(String(req.params.id), existing.patientId, input);
    if (!updated) return res.status(404).json({ message: 'Registro no encontrado' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

mealLogsRouter.delete('/meal-logs/:id', authenticate, async (req, res, next) => {
  try {
    const existing = await findMealLogById(String(req.params.id));
    if (!existing) return res.status(404).json({ message: 'Registro no encontrado' });

    if (req.user?.role === 'paciente' && existing.patientId !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const deleted = await deleteMealLog(String(req.params.id), existing.patientId);
    if (!deleted) return res.status(404).json({ message: 'Registro no encontrado' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
