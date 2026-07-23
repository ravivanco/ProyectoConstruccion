import { api } from '../../../lib/axios';
import { endpoints } from '../../../lib/endpoints';
import type { WeeklyPlan } from '../types';
import { INITIAL_PLANS } from './mockPlans';

export const plansApi = {
  getPlans: async (): Promise<WeeklyPlan[]> => {
    try {
      const response = await api.get(endpoints.nutritionPlans.list);
      if (Array.isArray(response.data) && response.data.length > 0) {
        const formatted: WeeklyPlan[] = response.data.map((p: any) => ({
          id: p.id,
          title: p.title || `Plan Nutricional #${String(p.id).slice(0, 6)}`,
          patientName: p.patientName || p.patientId || 'Paciente Asignado',
          objective: p.objective || `Meta calórica: ${p.dailyCalories || 2000} kcal — P:${p.proteinG || 150}g C:${p.carbsG || 200}g G:${p.fatG || 65}g`,
          includeWeekends: p.includeWeekends ?? true,
          days: p.weeklyStructure && p.weeklyStructure.length > 0 ? p.weeklyStructure : INITIAL_PLANS[0].days,
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString(),
        }));
        localStorage.setItem('dkfitt_plans', JSON.stringify(formatted));
        return formatted;
      }
      return getLocalOrInitial();
    } catch {
      return getLocalOrInitial();
    }
  },

  createPlan: async (data: {
    patientId: string;
    title?: string;
    dailyCalories?: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
  }): Promise<WeeklyPlan | null> => {
    try {
      const response = await api.post(endpoints.nutritionPlans.create, data);
      const p = response.data;
      return {
        id: p.id,
        title: data.title || `Plan Nutricional #${String(p.id).slice(0, 6)}`,
        patientName: data.patientId,
        objective: `Meta calórica: ${p.dailyCalories || data.dailyCalories || 2000} kcal`,
        includeWeekends: true,
        days: p.weeklyStructure && p.weeklyStructure.length > 0 ? p.weeklyStructure : INITIAL_PLANS[0].days,
        createdAt: p.createdAt || new Date().toISOString(),
        updatedAt: p.updatedAt || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  },

  updateWeeklyStructure: async (planId: string, days: any[]): Promise<boolean> => {
    try {
      await api.put(endpoints.nutritionPlans.weeklyStructure(planId), {
        weeklyStructure: days,
      });
      return true;
    } catch {
      return false;
    }
  },
};

function getLocalOrInitial(): WeeklyPlan[] {
  const saved = localStorage.getItem('dkfitt_plans');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_PLANS;
    }
  }
  return INITIAL_PLANS;
}
