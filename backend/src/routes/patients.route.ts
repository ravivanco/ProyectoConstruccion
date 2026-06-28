import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { listPatients } from '../repositories/patientRepository.js';
import { TreatmentStatus } from '../types/patient.js';

export const patientsRouter = Router();

const validStatuses: TreatmentStatus[] = [
  'Alta Adherencia',
  'Media Adherencia',
  'Baja Adherencia',
  'Pendiente',
];

patientsRouter.get(
  '/api/patients',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const treatmentStatus =
        typeof req.query.treatmentStatus === 'string' &&
        validStatuses.includes(req.query.treatmentStatus as TreatmentStatus)
          ? (req.query.treatmentStatus as TreatmentStatus)
          : undefined;

      const patients = await listPatients(req.user!.id, { search, treatmentStatus });
      res.json(patients);
    } catch (error) {
      next(error);
    }
  },
);
