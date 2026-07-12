import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  createWeightLog,
  findWeightLogByPatientAndDate,
  listWeightLogs,
} from '../repositories/weightLogRepository.js';
import { CreateWeightLogInput } from '../types/tracking.js';
import { resolvePatientAccess } from '../utils/patientAccess.js';

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
    const points = [...logs]
      .sort((a, b) => a.logDate.localeCompare(b.logDate))
      .map((log) => ({
        date: log.logDate,
        weightKg: log.weightKg,
      }));

    const weights = points.map((p) => p.weightKg);
    const minWeight = weights.length ? Math.min(...weights) : 0;
    const maxWeight = weights.length ? Math.max(...weights) : 0;
    const latest = points.length ? points[points.length - 1].weightKg : null;
    const first = points.length ? points[0].weightKg : null;
    const change = latest !== null && first !== null ? Number((latest - first).toFixed(2)) : 0;
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';

    res.json({
      patientId: access.patientId,
      points,
      summary: {
        latestWeightKg: latest,
        minWeightKg: minWeight,
        maxWeightKg: maxWeight,
        changeKg: change,
        trend,
        daysTracked: points.length,
      },
    });
  } catch (error) {
    next(error);
  }
});
