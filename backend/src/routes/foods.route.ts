import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import {
  createFood,
  deleteFood,
  findFoodById,
  isValidFoodCategory,
  listFoods,
  updateFood,
} from '../repositories/foodRepository.js';
import { CreateFoodInput, FOOD_CATEGORIES, UpdateFoodInput } from '../types/food.js';

export const foodsRouter = Router();

function parseCreateBody(body: unknown): CreateFoodInput | null {
  if (!body || typeof body !== 'object') return null;
  const data = body as Record<string, unknown>;
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const category = typeof data.category === 'string' ? data.category : '';
  const servingSize = typeof data.servingSize === 'string' ? data.servingSize.trim() : '';

  if (!name || !servingSize || !isValidFoodCategory(category)) return null;

  const calories = Number(data.calories);
  const protein = Number(data.protein);
  const carbs = Number(data.carbs);
  const fat = Number(data.fat);

  if ([calories, protein, carbs, fat].some((n) => Number.isNaN(n) || n < 0)) return null;

  return { name, category, servingSize, calories, protein, carbs, fat };
}

foodsRouter.get(
  '/foods',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const foods = await listFoods(req.user!.id);
      res.json(foods);
    } catch (error) {
      next(error);
    }
  },
);

foodsRouter.get(
  '/foods/:id',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const food = await findFoodById(req.user!.id, String(req.params.id));
      if (!food) {
        return res.status(404).json({ message: 'Alimento no encontrado' });
      }
      res.json(food);
    } catch (error) {
      next(error);
    }
  },
);

foodsRouter.post(
  '/foods',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const input = parseCreateBody(req.body);
      if (!input) {
        return res.status(400).json({
          message: 'Datos inválidos',
          validCategories: FOOD_CATEGORIES,
        });
      }

      const food = await createFood(req.user!.id, input);
      res.status(201).json(food);
    } catch (error) {
      next(error);
    }
  },
);

foodsRouter.put(
  '/foods/:id',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const body = req.body as Record<string, unknown>;
      const input: UpdateFoodInput = {};

      if (typeof body.name === 'string') input.name = body.name;
      if (typeof body.category === 'string') {
        if (!isValidFoodCategory(body.category)) {
          return res.status(400).json({ message: 'Categoría inválida', validCategories: FOOD_CATEGORIES });
        }
        input.category = body.category;
      }
      if (typeof body.servingSize === 'string') input.servingSize = body.servingSize;
      if (body.calories !== undefined) input.calories = Number(body.calories);
      if (body.protein !== undefined) input.protein = Number(body.protein);
      if (body.carbs !== undefined) input.carbs = Number(body.carbs);
      if (body.fat !== undefined) input.fat = Number(body.fat);
      if (typeof body.isActive === 'boolean') input.isActive = body.isActive;

      const food = await updateFood(req.user!.id, String(req.params.id), input);
      if (!food) {
        return res.status(404).json({ message: 'Alimento no encontrado' });
      }
      res.json(food);
    } catch (error) {
      next(error);
    }
  },
);

foodsRouter.patch(
  '/foods/:id/status',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const isActive = typeof req.body?.isActive === 'boolean' ? req.body.isActive : null;
      if (isActive === null) {
        return res.status(400).json({ message: 'isActive boolean requerido' });
      }

      const food = await updateFood(req.user!.id, String(req.params.id), { isActive });
      if (!food) {
        return res.status(404).json({ message: 'Alimento no encontrado' });
      }
      res.json(food);
    } catch (error) {
      next(error);
    }
  },
);

foodsRouter.delete(
  '/foods/:id',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const deleted = await deleteFood(req.user!.id, String(req.params.id));
      if (!deleted) {
        return res.status(404).json({ message: 'Alimento no encontrado' });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);
