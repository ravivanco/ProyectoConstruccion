import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import {
  activateNutritionPlan,
  createNutritionPlan,
  findNutritionPlanById,
  getActivePlanForPatient,
  getAllNutritionPlans,
  getPlanStatusForPatient,
  setNutritionPlanModuleLock,
  setNutritionPlanStartDate,
  updatePlanWeeklyStructure,
  assignMenuToMealSlot,
  removeAssignedMenuFromSlot,
} from '../repositories/nutritionPlanRepository.js';
import { AssignedMenuDTO, WeeklyDayStructure } from '../types/nutritionPlan.js';
import { validateStartDate } from '../utils/validateStartDate.js';

export const nutritionPlansRouter = Router();

nutritionPlansRouter.patch(
  '/api/nutrition-plans/:id/activate',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      if (!id) {
        return res.status(400).json({ message: 'id del plan requerido' });
      }

      const startDate = typeof req.body?.startDate === 'string' ? req.body.startDate : undefined;
      const result = await activateNutritionPlan(id, startDate);

      if (!result) {
        return res.status(404).json({ message: 'Plan nutricional no encontrado' });
      }

      res.json({
        plan: result.plan,
        statusChange: { from: result.previousStatus, to: result.plan.status },
      });
    } catch (error) {
      next(error);
    }
  },
);

nutritionPlansRouter.patch(
  '/api/nutrition-plans/:id/start-date',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      const startDate = typeof req.body?.startDate === 'string' ? req.body.startDate.trim() : '';

      if (!id) {
        return res.status(400).json({ message: 'id del plan requerido' });
      }

      const validation = validateStartDate(startDate);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
      }

      const plan = await setNutritionPlanStartDate(id, startDate);
      if (!plan) {
        return res.status(404).json({ message: 'Plan nutricional no encontrado' });
      }

      res.json(plan);
    } catch (error) {
      next(error);
    }
  },
);

nutritionPlansRouter.patch(
  '/api/nutrition-plans/:id/lock-module',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      if (!id) {
        return res.status(400).json({ message: 'id del plan requerido' });
      }

      const locked = typeof req.body?.locked === 'boolean' ? req.body.locked : true;
      const plan = await setNutritionPlanModuleLock(id, locked);

      if (!plan) {
        return res.status(404).json({ message: 'Plan nutricional no encontrado' });
      }

      res.json(plan);
    } catch (error) {
      next(error);
    }
  },
);

nutritionPlansRouter.patch(
  '/api/nutrition-plans/:id/unlock-module',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      if (!id) {
        return res.status(400).json({ message: 'id del plan requerido' });
      }

      const plan = await setNutritionPlanModuleLock(id, false);
      if (!plan) {
        return res.status(404).json({ message: 'Plan nutricional no encontrado' });
      }

      res.json(plan);
    } catch (error) {
      next(error);
    }
  },
);

nutritionPlansRouter.get(
  '/api/nutrition-plans/active/me',
  authenticate,
  requireRole('paciente'),
  async (req, res, next) => {
    try {
      const plan = await getActivePlanForPatient(req.user!.id);
      if (!plan) {
        return res.status(404).json({ message: 'No hay plan nutricional activo' });
      }
      res.json(plan);
    } catch (error) {
      next(error);
    }
  },
);

nutritionPlansRouter.get(
  '/api/nutrition-plans/status/me',
  authenticate,
  requireRole('paciente'),
  async (req, res, next) => {
    try {
      const planStatus = await getPlanStatusForPatient(req.user!.id);
      if (!planStatus) {
        return res.status(404).json({ message: 'No hay plan nutricional asignado' });
      }
      res.json(planStatus);
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/nutrition-plans - Listado de planes nutricionales
nutritionPlansRouter.get(
  '/api/nutrition-plans',
  authenticate,
  requireRole('nutricionista'),
  async (_req, res, next) => {
    try {
      const plans = await getAllNutritionPlans();
      res.json(plans);
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/nutrition-plans - Crear un nuevo plan nutricional
nutritionPlansRouter.post(
  '/api/nutrition-plans',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const { patientId, dailyCalories, proteinG, carbsG, fatG, weeklyStructure } = req.body;
      if (!patientId) {
        return res.status(400).json({ message: 'patientId es requerido' });
      }
      const newPlan = await createNutritionPlan({
        patientId,
        nutritionistId: req.user?.id || 'nutri-101',
        dailyCalories,
        proteinG,
        carbsG,
        fatG,
        weeklyStructure,
      });
      res.status(201).json(newPlan);
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/nutrition-plans/:id - Detalle de un plan con estructura semanal
nutritionPlansRouter.get(
  '/api/nutrition-plans/:id',
  authenticate,
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      const plan = await findNutritionPlanById(id);
      if (!plan) {
        return res.status(404).json({ message: 'Plan nutricional no encontrado' });
      }
      res.json(plan);
    } catch (error) {
      next(error);
    }
  },
);

// PUT /api/nutrition-plans/:id/weekly-structure - Guardar días y tiempos de comida (HU16)
nutritionPlansRouter.put(
  '/api/nutrition-plans/:id/weekly-structure',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      const structure = req.body?.weeklyStructure as WeeklyDayStructure[];
      if (!Array.isArray(structure)) {
        return res.status(400).json({ message: 'weeklyStructure debe ser un arreglo de días' });
      }

      const plan = await updatePlanWeeklyStructure(id, structure);
      if (!plan) {
        return res.status(404).json({ message: 'Plan nutricional no encontrado' });
      }
      res.json(plan);
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/nutrition-plans/:id/days/:day/meals/:mealId/menus - Asignar plato a toma (HU17)
nutritionPlansRouter.post(
  '/api/nutrition-plans/:id/days/:day/meals/:mealId/menus',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      const day = String(req.params.day ?? '').trim();
      const mealId = String(req.params.mealId ?? '').trim();
      const menuDto = req.body as AssignedMenuDTO;

      if (!menuDto?.dishId || !menuDto?.name) {
        return res.status(400).json({ message: 'dishId y name son requeridos para asignar menú' });
      }

      const plan = await assignMenuToMealSlot(id, day, mealId, menuDto);
      if (!plan) {
        return res.status(404).json({ message: 'Plan nutricional no encontrado' });
      }
      res.status(201).json(plan);
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /api/nutrition-plans/:id/days/:day/meals/:mealId/menus/:menuId - Eliminar plato de toma (HU17)
nutritionPlansRouter.delete(
  '/api/nutrition-plans/:id/days/:day/meals/:mealId/menus/:menuId',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      const day = String(req.params.day ?? '').trim();
      const mealId = String(req.params.mealId ?? '').trim();
      const menuId = String(req.params.menuId ?? '').trim();

      const plan = await removeAssignedMenuFromSlot(id, day, mealId, menuId);
      if (!plan) {
        return res.status(404).json({ message: 'Plan nutricional no encontrado' });
      }
      res.json(plan);
    } catch (error) {
      next(error);
    }
  },
);

