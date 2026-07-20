import { api } from '../../../lib/axios';
import type { Food, CreateFoodInput } from '../types';
import { INITIAL_FOODS } from './mockFoods';

export const foodApi = {
  getFoods: async (search?: string, category?: string): Promise<Food[]> => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (category && category !== 'Todos') params.category = category;

      const response = await api.get<Food[]>('/foods', { params });
      if (Array.isArray(response.data) && response.data.length > 0) {
        localStorage.setItem('dkfitt_foods', JSON.stringify(response.data));
        return response.data;
      }
      return response.data;
    } catch {
      // Fallback si el backend está apagado para evitar pantalla rota
      const saved = localStorage.getItem('dkfitt_foods');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return INITIAL_FOODS;
        }
      }
      return INITIAL_FOODS;
    }
  },

  createFood: async (input: CreateFoodInput): Promise<Food | null> => {
    try {
      const response = await api.post<Food>('/foods', input);
      return response.data;
    } catch {
      return null;
    }
  },

  updateFood: async (id: string, input: Partial<CreateFoodInput>): Promise<Food | null> => {
    try {
      const response = await api.put<Food>(`/foods/${id}`, input);
      return response.data;
    } catch {
      return null;
    }
  },

  deleteFood: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/foods/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};
