import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getPatientExerciseTracking } from '../repositories/exerciseTrackingRepository.js';
import { resolvePatientAccess } from '../utils/patientAccess.js';

export const exerciseTrackingRouter = Router();

function patientIdParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

exerciseTrackingRouter.get(
  '/exercise-tracking/patient/:patientId',
  authenticate,
  async (req, res, next) => {
    try {
      const access = resolvePatientAccess(req, patientIdParam(req.params.patientId));
      if (!access.ok) return res.status(access.status).json({ message: access.message });

      const logDate = typeof req.query.logDate === 'string' ? req.query.logDate : undefined;
      const tracking = await getPatientExerciseTracking(access.patientId, logDate);
      res.json(tracking);
    } catch (error) {
      next(error);
    }
  },
);
