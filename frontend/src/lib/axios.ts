import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Esta es la URL de la API (Backend), no la de la Base de Datos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar el Token JWT en todas las peticiones automáticamente
api.interceptors.request.use(
  (config) => {
    // Si tuviéramos un sistema de login real, aquí leeríamos el token del localStorage
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
