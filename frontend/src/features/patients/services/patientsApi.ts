import type { Patient } from '../types';
import api from '../../../lib/axios';
import { endpoints } from '../../../lib/endpoints';

export const patientsAPI = {
  // PROYEC-407: GET /patients — Retornar listado de pacientes.
  getPatients: async (): Promise<Patient[]> => {
    const response = await api.get(endpoints.patients.list);
    return response.data;
  }
};
