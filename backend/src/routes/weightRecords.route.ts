import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  createWeightLog,
  findWeightLogByPatientAndDate,
  listWeightLogs,
} from '../repositories/weightLogRepository.js';
import { CreateWeightLogInput } from '../types/tracking.js';
import { resolvePatientAccess } from '../utils/patientAccess.js';
import { buildWeightChart } from '../utils/weightChart.js';

export const weightRecordsRouter = Router();

async function validateSingleWeightPerDay(patientId: string, logDate: string) {
  const existing = await findWeightLogByPatientAndDate(patientId, logDate);
  if (existing) {
    return { ok: false as const, message: 'Ya existe un registro de peso para este día' };
  }
  return { ok: true as const };
}

function parseCreateBody(body: unknown): CreateWeightLogInput | null {
  if (!body || typeof body !== 'object') return null;
  const data = body as Record<string, unknown>;
  const weightKg = Number(data.weightKg);

  if (Number.isNaN(weightKg) || weightKg <= 0) return null;

  return {
    weightKg,
    logDate: typeof data.logDate === 'string' ? data.logDate : undefined,
    notes: typeof data.notes === 'string' ? data.notes : undefined,
  };
}

weightRecordsRouter.post('/weight-records', authenticate, async (req, res, next) => {
  try {
    const access = resolvePatientAccess(req);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const input = parseCreateBody(req.body);
    if (!input) return res.status(400).json({ message: 'weightKg inválido' });

    const logDate = input.logDate ?? new Date().toISOString().slice(0, 10);
    const validation = await validateSingleWeightPerDay(access.patientId, logDate);
    if (!validation.ok) {
      return res.status(409).json({ message: validation.message });
    }

    const log = await createWeightLog(access.patientId, { ...input, logDate });
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
});

weightRecordsRouter.get('/weight-records/me', authenticate, async (req, res, next) => {
  try {
    const access = resolvePatientAccess(req);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const fromDate = typeof req.query.fromDate === 'string' ? req.query.fromDate : undefined;
    const toDate = typeof req.query.toDate === 'string' ? req.query.toDate : undefined;
    const logs = await listWeightLogs(access.patientId, fromDate, toDate);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

weightRecordsRouter.get('/weight-records/me/chart', authenticate, async (req, res, next) => {
  try {
    const access = resolvePatientAccess(req);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const days = typeof req.query.days === 'string' ? Number(req.query.days) : 30;
    const limit = Number.isNaN(days) || days <= 0 ? 30 : Math.min(days, 90);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - (limit - 1));
    const from = fromDate.toISOString().slice(0, 10);

    const logs = await listWeightLogs(access.patientId, from);
    res.json(buildWeightChart(access.patientId, logs, limit));
  } catch (error) {
    next(error);
  }
});

weightRecordsRouter.get(
  '/weight-records/patient/:patientId/chart',
  authenticate,
  async (req, res, next) => {
    try {
      const access = resolvePatientAccess(req, String(req.params.patientId));
      if (!access.ok) return res.status(access.status).json({ message: access.message });

      const days = typeof req.query.days === 'string' ? Number(req.query.days) : 30;
      const limit = Number.isNaN(days) || days <= 0 ? 30 : Math.min(days, 90);
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - (limit - 1));
      const from = fromDate.toISOString().slice(0, 10);

      const logs = await listWeightLogs(access.patientId, from);
      res.json(buildWeightChart(access.patientId, logs, limit));
    } catch (error) {
      next(error);
    }
  },
);
