import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getAdditionalIntakeMonitoring,
  getAdherenceIndicators,
  getAdherenceLevel,
  getExerciseCompliance,
  getFoodCompliance,
  getPatientAdherenceOverview,
  getPlanDeviation,
  getWeightMonitoring,
} from '../repositories/adherenceRepository.js';
import { resolvePatientAccess } from '../utils/patientAccess.js';

export const adherenceRouter = Router();

function parsePeriodDays(value: unknown): number {
  const days = Number(value);
  if (Number.isNaN(days) || days < 1 || days > 90) return 7;
  return Math.round(days);
}

function patientIdParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

adherenceRouter.get(
  '/adherence/patient/:patientId',
  authenticate,
  async (req, res, next) => {
    try {
      const access = resolvePatientAccess(req, patientIdParam(req.params.patientId));
      if (!access.ok) return res.status(access.status).json({ message: access.message });

      const periodDays = parsePeriodDays(req.query.periodDays);
      const overview = await getPatientAdherenceOverview(access.patientId, periodDays);
      res.json(overview);
    } catch (error) {
      next(error);
    }
  },
);

adherenceRouter.get(
  '/adherence/patient/:patientId/food-compliance',
  authenticate,
  async (req, res, next) => {
    try {
      const access = resolvePatientAccess(req, patientIdParam(req.params.patientId));
      if (!access.ok) return res.status(access.status).json({ message: access.message });

      const summary = await getFoodCompliance(access.patientId, parsePeriodDays(req.query.periodDays));
      res.json(summary);
    } catch (error) {
      next(error);
    }
  },
);

adherenceRouter.get(
  '/adherence/patient/:patientId/exercise-compliance',
  authenticate,
  async (req, res, next) => {
    try {
      const access = resolvePatientAccess(req, patientIdParam(req.params.patientId));
      if (!access.ok) return res.status(access.status).json({ message: access.message });

      const summary = await getExerciseCompliance(access.patientId, parsePeriodDays(req.query.periodDays));
      res.json(summary);
    } catch (error) {
      next(error);
    }
  },
);

adherenceRouter.get(
  '/adherence/patient/:patientId/weight-monitoring',
  authenticate,
  async (req, res, next) => {
    try {
      const access = resolvePatientAccess(req, patientIdParam(req.params.patientId));
      if (!access.ok) return res.status(access.status).json({ message: access.message });

      const summary = await getWeightMonitoring(access.patientId, parsePeriodDays(req.query.periodDays));
      res.json(summary);
    } catch (error) {
      next(error);
    }
  },
);

adherenceRouter.get(
  '/adherence/patient/:patientId/additional-intake',
  authenticate,
  async (req, res, next) => {
    try {
      const access = resolvePatientAccess(req, patientIdParam(req.params.patientId));
      if (!access.ok) return res.status(access.status).json({ message: access.message });

      const summary = await getAdditionalIntakeMonitoring(access.patientId, parsePeriodDays(req.query.periodDays));
      res.json(summary);
    } catch (error) {
      next(error);
    }
  },
);

adherenceRouter.get(
  '/adherence/patient/:patientId/plan-deviation',
  authenticate,
  async (req, res, next) => {
    try {
      const access = resolvePatientAccess(req, patientIdParam(req.params.patientId));
      if (!access.ok) return res.status(access.status).json({ message: access.message });

      const summary = await getPlanDeviation(access.patientId, parsePeriodDays(req.query.periodDays));
      res.json(summary);
    } catch (error) {
      next(error);
    }
  },
);

adherenceRouter.get(
  '/adherence/patient/:patientId/indicators',
  authenticate,
  async (req, res, next) => {
    try {
      const access = resolvePatientAccess(req, patientIdParam(req.params.patientId));
      if (!access.ok) return res.status(access.status).json({ message: access.message });

      const indicators = await getAdherenceIndicators(access.patientId, parsePeriodDays(req.query.periodDays));
      res.json(indicators);
    } catch (error) {
      next(error);
    }
  },
);

adherenceRouter.get(
  '/adherence/patient/:patientId/level',
  authenticate,
  async (req, res, next) => {
    try {
      const access = resolvePatientAccess(req, patientIdParam(req.params.patientId));
      if (!access.ok) return res.status(access.status).json({ message: access.message });

      const level = await getAdherenceLevel(access.patientId, parsePeriodDays(req.query.periodDays));
      res.json(level);
    } catch (error) {
      next(error);
    }
  },
);
