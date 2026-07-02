import { Router } from 'express';
import { signToken } from '../utils/jwt.js';

export const authRouter = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
authRouter.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Validación rápida con las credenciales que usamos en el Frontend
  if (email === 'correo@dkfitt.com' && password === '123456') {
    const token = signToken({
      id: 'nutri-1', // ID que coincide con los pacientes de prueba en la BD
      email: 'correo@dkfitt.com',
      role: 'nutricionista',
    });

    res.json({ token });
  } else {
    res.status(401).json({ message: 'Credenciales inválidas' });
  }
});
