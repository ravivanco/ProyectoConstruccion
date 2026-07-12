import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import {
  createAdditionalFoodLog,
  deleteAdditionalFoodLog,
  findAdditionalFoodLogById,
  listAdditionalFoodLogs,
  setAdditionalIntakeStatus,
  updateAdditionalFoodLog,
} from '../repositories/additionalFoodLogRepository.js';
import { getCalorieToday } from '../repositories/calorieControlRepository.js';
import {
  CreateAdditionalFoodLogInput,
  UpdateAdditionalFoodLogInput,
} from '../types/tracking.js';
import { analyzeFoodImageWithVision, uploadImageBase64 } from '../utils/mediaAi.js';
import { resolvePatientAccess } from '../utils/patientAccess.js';

export const additionalIntakeRouter = Router();

function parseCreateBody(body: unknown): CreateAdditionalFoodLogInput | null {
  if (!body || typeof body !== 'object') return null;
  const data = body as Record<string, unknown>;
  const foodName = typeof data.foodName === 'string' ? data.foodName.trim() : '';
  const calories = Number(data.calories);

  if (!foodName || Number.isNaN(calories) || calories < 0) return null;

  const protein = data.protein !== undefined ? Number(data.protein) : 0;
  const carbs = data.carbs !== undefined ? Number(data.carbs) : 0;
  const fat = data.fat !== undefined ? Number(data.fat) : 0;

  if ([protein, carbs, fat].some((n) => Number.isNaN(n) || n < 0)) return null;

  return {
    foodName,
    calories,
    protein,
    carbs,
    fat,
    quantity: typeof data.quantity === 'string' ? data.quantity : undefined,
    logDate: typeof data.logDate === 'string' ? data.logDate : undefined,
    status: 'pending',
    notes: typeof data.notes === 'string' ? data.notes : undefined,
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : undefined,
  };
}

async function handleCreateAdditionalIntake(req: Request, res: Response, next: NextFunction) {
  try {
    const access = resolvePatientAccess(req);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const input = parseCreateBody(req.body);
    if (!input) return res.status(400).json({ message: 'Datos de consumo adicional inválidos' });

    const log = await createAdditionalFoodLog(access.patientId, {
      ...input,
      logDate: input.logDate ?? new Date().toISOString().slice(0, 10),
      status: 'pending',
    });
    res.status(201).json({
      ...log,
      patientId: access.patientId,
      savedDate: log.logDate,
    });
  } catch (error) {
    next(error);
  }
}

additionalIntakeRouter.post('/additional-intake', authenticate, handleCreateAdditionalIntake);
additionalIntakeRouter.post('/additional-intake/me', authenticate, handleCreateAdditionalIntake);

additionalIntakeRouter.post(
  '/additional-intake/upload-image',
  authenticate,
  requireRole('paciente'),
  async (req, res, next) => {
    try {
      const imageBase64 = typeof req.body?.imageBase64 === 'string' ? req.body.imageBase64 : '';
      const folder =
        typeof req.body?.folder === 'string' && req.body.folder
          ? req.body.folder
          : 'dkfitt/additional-intake';
      if (!imageBase64) {
        return res.status(400).json({ message: 'imageBase64 requerido' });
      }

      const result = await uploadImageBase64(imageBase64, folder);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

additionalIntakeRouter.post('/additional-intake/analyze', authenticate, async (req, res, next) => {
  try {
    const access = resolvePatientAccess(req);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const imageBase64 = typeof req.body?.imageBase64 === 'string' ? req.body.imageBase64 : '';
    if (!imageBase64) {
      return res.status(400).json({ message: 'imageBase64 requerido' });
    }

    const analysis = await analyzeFoodImageWithVision(imageBase64);
    res.json({
      ...analysis,
      integratedWith: 'gemini-vision',
    });
  } catch (error) {
    next(error);
  }
});

additionalIntakeRouter.get('/additional-intake/me', authenticate, async (req, res, next) => {
  try {
    const access = resolvePatientAccess(req);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const logDate = typeof req.query.logDate === 'string' ? req.query.logDate : undefined;
    const logs = await listAdditionalFoodLogs(access.patientId, logDate);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

additionalIntakeRouter.get(
  '/additional-intake/patient/:patientId',
  authenticate,
  async (req, res, next) => {
    try {
      const access = resolvePatientAccess(req, String(req.params.patientId));
      if (!access.ok) return res.status(access.status).json({ message: access.message });

      const logDate = typeof req.query.logDate === 'string' ? req.query.logDate : undefined;
      const logs = await listAdditionalFoodLogs(access.patientId, logDate);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  },
);

additionalIntakeRouter.patch(
  '/additional-intake/:id/confirm',
  authenticate,
  async (req, res, next) => {
    try {
      const existing = await findAdditionalFoodLogById(String(req.params.id));
      if (!existing) return res.status(404).json({ message: 'Registro no encontrado' });

      if (req.user?.role === 'paciente' && existing.patientId !== req.user.id) {
        return res.status(403).json({ message: 'No autorizado' });
      }

      const updated = await setAdditionalIntakeStatus(
        String(req.params.id),
        existing.patientId,
        'confirmed',
      );
      if (!updated) return res.status(404).json({ message: 'Registro no encontrado' });

      const calorieSummary = await getCalorieToday(existing.patientId);
      res.json({ log: updated, calorieSummary });
    } catch (error) {
      next(error);
    }
  },
);

additionalIntakeRouter.post(
  '/additional-intake/:id/discard',
  authenticate,
  async (req, res, next) => {
    try {
      const existing = await findAdditionalFoodLogById(String(req.params.id));
      if (!existing) return res.status(404).json({ message: 'Registro no encontrado' });

      if (req.user?.role === 'paciente' && existing.patientId !== req.user.id) {
        return res.status(403).json({ message: 'No autorizado' });
      }

      const updated = await setAdditionalIntakeStatus(
        String(req.params.id),
        existing.patientId,
        'discarded',
      );
      if (!updated) return res.status(404).json({ message: 'Registro no encontrado' });
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },
);

additionalIntakeRouter.put('/additional-intake/:id', authenticate, async (req, res, next) => {
  try {
    const existing = await findAdditionalFoodLogById(String(req.params.id));
    if (!existing) return res.status(404).json({ message: 'Registro no encontrado' });

    if (req.user?.role === 'paciente' && existing.patientId !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const body = req.body as Record<string, unknown>;
    const input: UpdateAdditionalFoodLogInput = {};

    if (typeof body.foodName === 'string') input.foodName = body.foodName.trim();
    if (body.calories !== undefined) input.calories = Number(body.calories);
    if (body.protein !== undefined) input.protein = Number(body.protein);
    if (body.carbs !== undefined) input.carbs = Number(body.carbs);
    if (body.fat !== undefined) input.fat = Number(body.fat);
    if (typeof body.quantity === 'string') input.quantity = body.quantity;
    if (typeof body.logDate === 'string') input.logDate = body.logDate;
    if (typeof body.notes === 'string') input.notes = body.notes;
    if (typeof body.imageUrl === 'string') input.imageUrl = body.imageUrl;

    const updated = await updateAdditionalFoodLog(String(req.params.id), existing.patientId, input);
    if (!updated) return res.status(404).json({ message: 'Registro no encontrado' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

additionalIntakeRouter.delete('/additional-intake/:id', authenticate, async (req, res, next) => {
  try {
    const existing = await findAdditionalFoodLogById(String(req.params.id));
    if (!existing) return res.status(404).json({ message: 'Registro no encontrado' });

    if (req.user?.role === 'paciente' && existing.patientId !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const deleted = await deleteAdditionalFoodLog(String(req.params.id), existing.patientId);
    if (!deleted) return res.status(404).json({ message: 'Registro no encontrado' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
