import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
} from '../repositories/foodRepository.js';
import { CreateFoodDTO, UpdateFoodDTO } from '../types/food.js';

export const foodsRouter = Router();

// GET /api/foods - Listar y filtrar alimentos (HU18 y HU19)
foodsRouter.get(
  '/api/foods',
  authenticate,
  async (req, res, next) => {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;

      const items = await getAllFoods({ search, category });
      res.json(items);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/foods/:id - Detalle de un alimento/receta
foodsRouter.get(
  '/api/foods/:id',
  authenticate,
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      const item = await getFoodById(id);
      if (!item) {
        return res.status(404).json({ message: 'Alimento no encontrado' });
      }
      res.json(item);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/foods - Crear nuevo alimento/plato clínico (HU18)
foodsRouter.post(
  '/api/foods',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const body = req.body as CreateFoodDTO;
      if (!body?.name?.trim()) {
        return res.status(400).json({ message: 'El nombre del alimento o plato es requerido' });
      }

      const created = await createFood(body);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/foods/:id - Actualizar alimento (HU18)
foodsRouter.put(
  '/api/foods/:id',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      const body = req.body as UpdateFoodDTO;

      const updated = await updateFood(id, body);
      if (!updated) {
        return res.status(404).json({ message: 'Alimento no encontrado' });
      }

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/foods/:id - Eliminar alimento (HU18)
foodsRouter.delete(
  '/api/foods/:id',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      const success = await deleteFood(id);
      if (!success) {
        return res.status(404).json({ message: 'Alimento no encontrado o ya eliminado' });
      }

      res.json({ message: 'Alimento eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }
);
