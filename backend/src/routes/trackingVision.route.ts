import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { analyzeFoodImageWithVision } from '../utils/mediaAi.js';

export const trackingVisionRouter = Router();

trackingVisionRouter.post(
  '/tracking/analyze-food-image',
  authenticate,
  requireRole('paciente'),
  async (req, res, next) => {
    try {
      const imageBase64 = typeof req.body?.imageBase64 === 'string' ? req.body.imageBase64 : '';
      if (!imageBase64) {
        return res.status(400).json({ message: 'imageBase64 requerido' });
      }

      const analysis = await analyzeFoodImageWithVision(imageBase64);
      res.json(analysis);
    } catch (error) {
      next(error);
    }
  },
);
