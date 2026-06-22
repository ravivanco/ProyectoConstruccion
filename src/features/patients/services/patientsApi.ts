import type { Patient } from '../../../shared/types';

// TODO: Cambiar API_URL por la URL real del backend cuando Alejandro termine los endpoints
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const API_URL = 'http://localhost:3000/api';

export const patientsAPI = {
  // PROYEC-407: GET /patients — Retornar listado de pacientes.
  getPatients: async (): Promise<Patient[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '1', name: 'Carlos Mendoza', email: 'carlos.m@gmail.com', generalState: 'Alta Adherencia', lastVisit: '10 Jun 2026' },
          { id: '2', name: 'Ana Gutiérrez', email: 'ana.g@hotmail.com', generalState: 'Media Adherencia', lastVisit: '12 Jun 2026' },
          { id: '3', name: 'Luis Ramírez', email: 'luis.ramirez@yahoo.com', generalState: 'Baja Adherencia', lastVisit: '05 Jun 2026' },
          { id: '4', name: 'María Fernanda Salas', email: 'mafer.salas@gmail.com', generalState: 'Alta Adherencia', lastVisit: '14 Jun 2026' },
          { id: '5', name: 'Jorge Villalobos', email: 'jorgev89@outlook.com', generalState: 'Pendiente', lastVisit: '16 Jun 2026' },
        ]);
      }, 800);
    });
  }
};
