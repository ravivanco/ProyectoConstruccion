import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import {
  createDish,
  deleteDish,
  findDishById,
  findDishByIdPublic,
  isValidDishCategory,
  listDishes,
  updateDish,
} from '../repositories/dishRepository.js';
import { CreateDishInput, DISH_CATEGORIES, UpdateDishInput } from '../types/dish.js';

export const dishesRouter = Router();

function parseCreateBody(body: unknown): CreateDishInput | null {
  if (!body || typeof body !== 'object') return null;
  const data = body as Record<string, unknown>;
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const category = typeof data.category === 'string' ? data.category : '';
  if (!name || !isValidDishCategory(category)) return null;

  const calories = Number(data.calories);
  const protein = Number(data.protein);
  const carbs = Number(data.carbs);
  const fat = Number(data.fat);
  if ([calories, protein, carbs, fat].some((n) => Number.isNaN(n) || n < 0)) return null;

  return {
    name,
    category,
    defaultPortion: typeof data.defaultPortion === 'string' ? data.defaultPortion : undefined,
    calories,
    protein,
    carbs,
    fat,
    ingredients: Array.isArray(data.ingredients) ? (data.ingredients as CreateDishInput['ingredients']) : [],
    preparation: typeof data.preparation === 'string' ? data.preparation : undefined,
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
  };
}

dishesRouter.get(
  '/dishes',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const dishes = await listDishes(req.user!.id);
      res.json(dishes);
    } catch (error) {
      next(error);
    }
  },
);

dishesRouter.get('/dishes/:id', authenticate, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const dish =
      req.user?.role === 'nutricionista'
        ? await findDishById(req.user.id, id)
        : await findDishByIdPublic(id);

    if (!dish) {
      return res.status(404).json({ message: 'Plato no encontrado' });
    }

    res.json(dish);
  } catch (error) {
    next(error);
  }
});

dishesRouter.post(
  '/dishes',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const input = parseCreateBody(req.body);
      if (!input) {
        return res.status(400).json({ message: 'Datos inválidos', validCategories: DISH_CATEGORIES });
      }
      const dish = await createDish(req.user!.id, input);
      res.status(201).json(dish);
    } catch (error) {
      next(error);
    }
  },
);

dishesRouter.put(
  '/dishes/:id',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const body = req.body as Record<string, unknown>;
      const input: UpdateDishInput = {};
      if (typeof body.name === 'string') input.name = body.name;
      if (typeof body.category === 'string') {
        if (!isValidDishCategory(body.category)) {
          return res.status(400).json({ message: 'Categoría inválida' });
        }
        input.category = body.category;
      }
      if (typeof body.defaultPortion === 'string') input.defaultPortion = body.defaultPortion;
      if (body.calories !== undefined) input.calories = Number(body.calories);
      if (body.protein !== undefined) input.protein = Number(body.protein);
      if (body.carbs !== undefined) input.carbs = Number(body.carbs);
      if (body.fat !== undefined) input.fat = Number(body.fat);
      if (Array.isArray(body.ingredients)) input.ingredients = body.ingredients as UpdateDishInput['ingredients'];
      if (typeof body.preparation === 'string') input.preparation = body.preparation;
      if (typeof body.imageUrl === 'string') input.imageUrl = body.imageUrl;
      if (Array.isArray(body.tags)) input.tags = body.tags.map(String);
      if (typeof body.isActive === 'boolean') input.isActive = body.isActive;

      const dish = await updateDish(req.user!.id, String(req.params.id), input);
      if (!dish) {
        return res.status(404).json({ message: 'Plato no encontrado' });
      }
      res.json(dish);
    } catch (error) {
      next(error);
    }
  },
);

dishesRouter.delete(
  '/dishes/:id',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const deleted = await deleteDish(req.user!.id, String(req.params.id));
      if (!deleted) {
        return res.status(404).json({ message: 'Plato no encontrado' });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);
