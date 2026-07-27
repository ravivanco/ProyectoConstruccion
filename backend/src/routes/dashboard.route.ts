import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import { pool } from '../db/pool.js';

export const dashboardRouter = Router();

dashboardRouter.get(
  '/api/dashboard/nutritionist',
  authenticate,
  requireRole('nutricionista'),
  async (req, res, next) => {
    try {
      const nutritionistId = req.user!.id;

      const [patientsRes, foodsRes, exercisesRes, plansRes] = await Promise.all([
        pool.query('SELECT count(*) as total, sum(case when treatment_status = \'Activo\' then 1 else 0 end) as active, sum(case when treatment_status = \'Pendiente\' then 1 else 0 end) as pending FROM patients WHERE nutritionist_id = $1', [nutritionistId]),
        pool.query('SELECT count(*) as total FROM foods WHERE is_active = true AND nutritionist_id = $1', [nutritionistId]),
        pool.query('SELECT count(*) as total FROM exercises WHERE is_active = true AND nutritionist_id = $1', [nutritionistId]),
        pool.query('SELECT count(*) as total, sum(case when status = \'active\' then 1 else 0 end) as active FROM nutrition_plans WHERE nutritionist_id = $1', [nutritionistId]),
      ]);

      res.json({
        totalPatients: parseInt(patientsRes.rows[0].total) || 0,
        activePatients: parseInt(patientsRes.rows[0].active) || 0,
        pendingPatients: parseInt(patientsRes.rows[0].pending) || 0,
        totalFoods: parseInt(foodsRes.rows[0].total) || 0,
        totalExercises: parseInt(exercisesRes.rows[0].total) || 0,
        totalPlans: parseInt(plansRes.rows[0].total) || 0,
        activePlans: parseInt(plansRes.rows[0].active) || 0,
      });
    } catch (error) {
      next(error);
    }
  }
);
