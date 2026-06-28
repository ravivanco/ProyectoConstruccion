import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { getPatientProfileById, upsertPatientProfile } from '../repositories/patientProfileRepository.js';
import { UpsertPatientProfileInput } from '../types/patientProfile.js';

export const patientProfileRouter = Router();

patientProfileRouter.get(
  '/api/patient-profile/:patientId',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const patientId = String(req.params.patientId ?? '').trim();
      if (!patientId) {
        return res.status(400).json({ message: 'patientId es requerido' });
      }

      const profile = await getPatientProfileById(patientId);
      if (!profile) {
        return res.status(404).json({ message: 'Formulario inicial no encontrado para este paciente' });
      }

      res.json(profile);
    } catch (error) {
      next(error);
    }
  },
);

patientProfileRouter.put(
  '/patient-profile/me',
  authenticate,
  requireRole('paciente'),
  async (req, res, next) => {
    try {
      const body = req.body as UpsertPatientProfileInput & { completed?: boolean };
      const profile = await upsertPatientProfile(req.user!.id, {
        activityLevel: body.activityLevel,
        medicalConditions: body.medicalConditions,
        allergies: body.allergies,
        intolerances: body.intolerances,
        nutritionGoal: body.nutritionGoal,
        sports: body.sports,
        foodPreferences: body.foodPreferences,
        foodRestrictions: body.foodRestrictions,
        completed: body.completed ?? true,
      });
      res.json(profile);
    } catch (error) {
      next(error);
    }
  },
);
