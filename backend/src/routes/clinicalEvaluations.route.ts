import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { listClinicalEvaluationsByPatient } from '../repositories/clinicalEvaluationRepository.js';

export const clinicalEvaluationsRouter = Router();

clinicalEvaluationsRouter.get(
  '/clinical-evaluations/patient/:id',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const patientId = String(req.params.id ?? '').trim();
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
