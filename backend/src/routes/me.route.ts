import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';

export const meRouter = Router();

meRouter.get('/api/me', authenticate, (req, res) => {
  res.json({
    id: req.user!.id,
    email: req.user!.email,
    role: req.user!.role,
  });
});
