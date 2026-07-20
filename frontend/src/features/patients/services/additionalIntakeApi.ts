import api from '../../../lib/axios';
import { endpoints } from '../../../lib/endpoints';
import type { AdditionalFoodLog } from '../types';

const generateMockAdditionalLogs = (patientId: string): AdditionalFoodLog[] => {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10);

  return [
    {
      id: 'mock-add-1',
      patientId,
      foodName: 'Galletas de Avena con Chips de Chocolate (Porción extra)',
      calories: 280,
      protein: 4,
      carbs: 42,
      fat: 11,
      quantity: '2 unidades medianas (60g)',
      logDate: today,
      notes: 'Consumidas a media tarde en oficina por antojo dulce tras reunión.',
      imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80',
      createdAt: `${today}T16:30:00Z`,
    },
    {
      id: 'mock-add-2',
      patientId,
      foodName: 'Café Frappuccino Caramel con Leche Entera',
      calories: 340,
      protein: 5,
      carbs: 55,
      fat: 12,
      quantity: '1 vaso grande (473ml)',
      logDate: yesterday,
      notes: 'Salida con compañeros de trabajo tras terminar el turno.',
      imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80',
      createdAt: `${yesterday}T18:15:00Z`,
    },
    {
      id: 'mock-add-3',
      patientId,
      foodName: 'Porción de Pizza Artesanal Pepperoni',
      calories: 320,
      protein: 14,
      carbs: 34,
      fat: 15,
      quantity: '1 rebanada mediana (120g)',
      logDate: twoDaysAgo,
      notes: 'Cena familiar de fin de semana no planificada.',
      imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80',
      createdAt: `${twoDaysAgo}T21:00:00Z`,
    },
    {
      id: 'mock-add-4',
      patientId,
      foodName: 'Barrita de Proteína Chocolate y Almendra',
      calories: 190,
      protein: 18,
      carbs: 16,
      fat: 6,
      quantity: '1 barra (50g)',
      logDate: twoDaysAgo,
      notes: 'Consumida justo antes del entrenamiento nocturno de gimnasio.',
      createdAt: `${twoDaysAgo}T17:45:00Z`,
    },
  ];
};

export const additionalIntakeAPI = {
  getPatientAdditionalIntake: async (
    patientId: string,
    logDate?: string,
  ): Promise<AdditionalFoodLog[]> => {
    try {
      const response = await api.get(endpoints.additionalIntake.list(patientId, logDate));
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return generateMockAdditionalLogs(patientId);
    } catch (error) {
      console.warn('Endpoint de consumos adicionales no disponible, usando mock en frontend:', error);
      return generateMockAdditionalLogs(patientId);
    }
  },
};
