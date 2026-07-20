import api from '../../../lib/axios';
import { endpoints } from '../../../lib/endpoints';
import type { DailyMealCompliance, MealItem } from '../types';

// Mock de respaldo enriquecido por si el backend aún no tiene este endpoint o el paciente no tiene datos
const generateMockCompliance = (patientId: string, date: string): DailyMealCompliance => {
  const isToday = date === new Date().toISOString().split('T')[0];
  
  // Si la fecha es pasada, la mayoría están completadas o falladas. Si es hoy, hay pendientes.
  const meals: MealItem[] = [
    {
      id: 'm1',
      mealType: 'desayuno',
      name: 'Desayuno Nutritivo - Avena con Frutas y Nueces',
      scheduledTime: '08:00 AM',
      status: 'completed',
      loggedAt: '08:15 AM',
      estimatedCalories: 420,
      consumedCalories: 410,
      notes: 'Consumido según las porciones indicadas.'
    },
    {
      id: 'm2',
      mealType: 'colacion_1',
      name: 'Colación Mañana - Yogur griego con almendras',
      scheduledTime: '11:00 AM',
      status: isToday ? 'completed' : 'missed',
      loggedAt: isToday ? '11:05 AM' : undefined,
      estimatedCalories: 180,
      consumedCalories: isToday ? 180 : 0,
      notes: isToday ? '' : 'El paciente omitió el registro de esta colación.'
    },
    {
      id: 'm3',
      mealType: 'almuerzo',
      name: 'Almuerzo - Pechuga de Pollo a la Plancha con Quinoa y Vegetales',
      scheduledTime: '13:30 PM',
      status: 'completed',
      loggedAt: '13:40 PM',
      estimatedCalories: 650,
      consumedCalories: 660,
      notes: 'Buena saciedad reportada.'
    },
    {
      id: 'm4',
      mealType: 'colacion_2',
      name: 'Colación Tarde - Manzana fresca con crema de cacahuate',
      scheduledTime: '17:00 PM',
      status: isToday ? 'pending' : 'completed',
      loggedAt: !isToday ? '17:15 PM' : undefined,
      estimatedCalories: 210,
      consumedCalories: !isToday ? 210 : 0,
    },
    {
      id: 'm5',
      mealType: 'cena',
      name: 'Cena - Filete de Salmón con Espárragos al Horno',
      scheduledTime: '20:30 PM',
      status: isToday ? 'pending' : 'completed',
      loggedAt: !isToday ? '20:45 PM' : undefined,
      estimatedCalories: 520,
      consumedCalories: !isToday ? 510 : 0,
    }
  ];

  const completedCount = meals.filter(m => m.status === 'completed').length;
  const missedCount = meals.filter(m => m.status === 'missed').length;
  const pendingCount = meals.filter(m => m.status === 'pending').length;
  const totalAssigned = meals.length;
  const complianceRate = Math.round((completedCount / totalAssigned) * 100);

  return {
    patientId,
    date,
    totalAssigned,
    completedCount,
    missedCount,
    pendingCount,
    complianceRate,
    meals
  };
};

export const complianceAPI = {
  getPatientMealCompliance: async (patientId: string, date: string): Promise<DailyMealCompliance> => {
    try {
      const response = await api.get(endpoints.mealCompliance.byDate(patientId, date));
      if (response.data && response.data.meals) {
        return response.data;
      }
      return generateMockCompliance(patientId, date);
    } catch (error) {
      console.warn('Endpoint de cumplimiento alimentario no disponible o con error, utilizando datos mock para monitoreo visual en frontend:', error);
      return generateMockCompliance(patientId, date);
    }
  }
};
