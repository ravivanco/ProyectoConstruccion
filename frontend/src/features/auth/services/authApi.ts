import type { User } from '../../../shared/types';
import api from '../../../lib/axios';
import { endpoints } from '../../../lib/endpoints';

export const authAPI = {
  // PROYEC-401: POST /auth/login — Validar credenciales con rol nutricionista.
  login: async (email: string, password: string): Promise<{ token: string }> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // PROYEC-402: GET /api/me — Obtener perfil profesional desde el backend
  getProfile: async (): Promise<User> => {
    const response = await api.get(endpoints.auth.me);
    return response.data;
  }
};
