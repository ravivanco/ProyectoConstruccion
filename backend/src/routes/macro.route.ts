import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getMacroDistributionForPatient } from '../repositories/macroRepository.js';

export const macroRouter = Router();

macroRouter.get(
  '/calorie-control/macros/:patientId',
  authenticate,
  async (req, res, next) => {
    try {
      const patientId = String(req.params.patientId ?? '').trim();
      if (!patientId) {
        return res.status(400).json({ message: 'patientId requerido' });
      }

      if (req.user?.role === 'paciente' && patientId !== req.user.id) {
        return res.status(403).json({ message: 'No autorizado' });
      }

      const goalParam = String(req.query.goal ?? 'maintain_weight');
      const goal = ['lose_weight', 'maintain_weight', 'gain_muscle'].includes(goalParam)
        ? (goalParam as 'lose_weight' | 'maintain_weight' | 'gain_muscle')
        : 'maintain_weight';

      const macros = await getMacroDistributionForPatient(patientId, goal);

      if (!macros) {
        return res.status(404).json({ message: 'No hay evaluación clínica para calcular macros' });
      }

      res.json(macros);
    } catch (error) {
      next(error);
    }
  },
);
