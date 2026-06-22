import type { User } from '../../../shared/types';

// TODO: Cambiar API_URL por la URL real del backend cuando Alejandro termine los endpoints
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const API_URL = 'http://localhost:3000/api';

export const authAPI = {
  // PROYEC-401: POST /auth/login — Validar credenciales con rol nutricionista.
  login: async (email: string, password: string): Promise<{ token: string }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'correo@dkfitt.com' && password === '123456') {
          resolve({ token: 'mock-token-nutritionist-123' });
        } else {
          reject(new Error('Credenciales inválidas'));
        }
      }, 1000);
    });
  },

  // PROYEC-402: GET /nutritionist-profile/me — Obtener perfil profesional.
  getProfile: async (): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'nutri-1',
          email: 'correo@dkfitt.com',
          role: 'nutricionista',
          name: 'dkfitt nutricionista'
        });
      }, 500);
    });
  }
};
