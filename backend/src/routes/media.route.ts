import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { generateRecipeWithAi, uploadImageBase64 } from '../utils/mediaAi.js';

export const mediaRouter = Router();

mediaRouter.post(
  '/uploads/image',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const imageBase64 = typeof req.body?.imageBase64 === 'string' ? req.body.imageBase64 : '';
      const folder = typeof req.body?.folder === 'string' ? req.body.folder : 'dkfitt/dishes';

      if (!imageBase64) {
        return res.status(400).json({ message: 'imageBase64 requerido' });
      }

      const result = await uploadImageBase64(imageBase64, folder);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

mediaRouter.post(
  '/dishes/generate-ai',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
      if (!prompt) {
        return res.status(400).json({ message: 'prompt requerido' });
      }

      const recipe = await generateRecipeWithAi(prompt);
      res.json(recipe);
    } catch (error) {
      next(error);
    }
  },
);
