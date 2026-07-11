import { api } from '../../../lib/axios';
import type { ExerciseItem, CreateExerciseInput } from '../types';
import { INITIAL_EXERCISES } from './mockExercises';

export const exerciseApi = {
  getExercises: async (search?: string, category?: string): Promise<ExerciseItem[]> => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (category && category !== 'Todos') params.category = category;

      const response = await api.get<ExerciseItem[]>('/exercises', { params });
      if (Array.isArray(response.data) && response.data.length > 0) {
        localStorage.setItem('dkfitt_exercises', JSON.stringify(response.data));
        return response.data;
      }
      return response.data;
    } catch {
      const saved = localStorage.getItem('dkfitt_exercises');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return INITIAL_EXERCISES;
        }
      }
      return INITIAL_EXERCISES;
    }
  },

  createExercise: async (input: CreateExerciseInput): Promise<ExerciseItem | null> => {
    try {
      const response = await api.post<ExerciseItem>('/exercises', input);
      return response.data;
    } catch {
      return null;
    }
  },

  updateExercise: async (
    id: string,
    input: Partial<CreateExerciseInput> & { isActive?: boolean }
  ): Promise<ExerciseItem | null> => {
    try {
      const response = await api.put<ExerciseItem>(`/exercises/${id}`, input);
      return response.data;
    } catch {
      return null;
    }
  },

  deleteExercise: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/exercises/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};
