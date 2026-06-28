import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { createClinicalEvaluation, listClinicalEvaluationsByPatient } from '../repositories/clinicalEvaluationRepository.js';
import { CreateClinicalEvaluationInput } from '../types/clinicalEvaluation.js';

export const clinicalEvaluationsRouter = Router();

clinicalEvaluationsRouter.post(
  '/clinical-evaluations',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const body = req.body as CreateClinicalEvaluationInput;

      if (!body.patientId?.trim()) {
        return res.status(400).json({ message: 'patientId es requerido' });
      }
      if (!body.weightKg || body.weightKg <= 0) {
        return res.status(400).json({ message: 'weightKg debe ser mayor a 0' });
      }
      if (!body.heightCm || body.heightCm <= 0) {
        return res.status(400).json({ message: 'heightCm debe ser mayor a 0' });
      }

      const evaluation = await createClinicalEvaluation(req.user!.id, {
        ...body,
        patientId: body.patientId.trim(),
      });

      res.status(201).json(evaluation);
    } catch (error) {
      next(error);
    }
  },
);

clinicalEvaluationsRouter.get(
  '/clinical-evaluations/patient/:id',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const patientId = req.params.id?.trim();
      if (!patientId) {
        return res.status(400).json({ message: 'id de paciente requerido' });
      }

      const evaluations = await listClinicalEvaluationsByPatient(patientId);
      res.json({ patientId, evaluations });
    } catch (error) {
      next(error);
    }
  },
);
