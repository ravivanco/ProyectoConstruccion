import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  createWeightLog,
  deleteWeightLog,
  findWeightLogById,
  listWeightLogs,
  updateWeightLog,
} from '../repositories/weightLogRepository.js';
import { CreateWeightLogInput, UpdateWeightLogInput } from '../types/tracking.js';
import { resolvePatientAccess } from '../utils/patientAccess.js';

export const weightLogsRouter = Router();

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

weightLogsRouter.post('/weight-logs/me', authenticate, async (req, res, next) => {
  try {
    const access = resolvePatientAccess(req);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const input = parseCreateBody(req.body);
    if (!input) return res.status(400).json({ message: 'weightKg inválido' });

    const log = await createWeightLog(access.patientId, input);
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
});

weightLogsRouter.get('/weight-logs/me', authenticate, async (req, res, next) => {
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

weightLogsRouter.get('/weight-logs/patient/:patientId', authenticate, async (req, res, next) => {
  try {
    const access = resolvePatientAccess(req, String(req.params.patientId));
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const fromDate = typeof req.query.fromDate === 'string' ? req.query.fromDate : undefined;
    const toDate = typeof req.query.toDate === 'string' ? req.query.toDate : undefined;
    const logs = await listWeightLogs(access.patientId, fromDate, toDate);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

weightLogsRouter.put('/weight-logs/:id', authenticate, async (req, res, next) => {
  try {
    const existing = await findWeightLogById(String(req.params.id));
    if (!existing) return res.status(404).json({ message: 'Registro no encontrado' });

    if (req.user?.role === 'paciente' && existing.patientId !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const body = req.body as Record<string, unknown>;
    const input: UpdateWeightLogInput = {};

    if (body.weightKg !== undefined) input.weightKg = Number(body.weightKg);
    if (typeof body.logDate === 'string') input.logDate = body.logDate;
    if (typeof body.notes === 'string') input.notes = body.notes;

    const updated = await updateWeightLog(String(req.params.id), existing.patientId, input);
    if (!updated) return res.status(404).json({ message: 'Registro no encontrado' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

weightLogsRouter.delete('/weight-logs/:id', authenticate, async (req, res, next) => {
  try {
    const existing = await findWeightLogById(String(req.params.id));
    if (!existing) return res.status(404).json({ message: 'Registro no encontrado' });

    if (req.user?.role === 'paciente' && existing.patientId !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const deleted = await deleteWeightLog(String(req.params.id), existing.patientId);
    if (!deleted) return res.status(404).json({ message: 'Registro no encontrado' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
