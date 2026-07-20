import api from '../../../lib/axios';
import { endpoints } from '../../../lib/endpoints';
import type { DailyPhysicalCompliance, ExerciseComplianceItem } from '../types';

// Mock enriquecido para simular la información que llega sincronizada desde la app móvil del paciente
const generateMockPhysicalCompliance = (patientId: string, date: string): DailyPhysicalCompliance => {
  const isToday = date === new Date().toISOString().split('T')[0];

  const exercises: ExerciseComplianceItem[] = [
    {
      id: 'ex-1',
      name: 'Caminata Ligera en Cinta / Aire Libre',
      category: 'Cardio',
      muscleGroup: 'Cardiovascular y Piernas',
      scheduledTime: '07:30 AM',
      durationMinutes: 30,
      caloriesBurned: 165,
      status: 'completed',
      loggedAt: '08:05 AM',
      notes: 'Sincronizado automáticamente por pulsera de actividad en App Móvil. Ritmo cardíaco medio 125 bpm.',
      source: 'mobile_app',
    },
    {
      id: 'ex-2',
      name: 'Sentadillas con Peso Corporal y Estocadas',
      category: 'Fuerza',
      muscleGroup: 'Cuádriceps y Glúteos',
      scheduledTime: '10:00 AM',
      durationMinutes: 20,
      caloriesBurned: isToday ? 110 : 0,
      status: isToday ? 'completed' : 'missed',
      loggedAt: isToday ? '10:25 AM' : undefined,
      notes: isToday
        ? '3 series de 15 repeticiones completadas en App Móvil.'
        : 'El paciente no registró la sesión de fuerza en la aplicación móvil.',
      source: 'mobile_app',
    },
    {
      id: 'ex-3',
      name: 'Plancha Abdominal e Hiperextensiones',
      category: 'Fuerza',
      muscleGroup: 'Core y Zona Lumbar',
      scheduledTime: '16:00 PM',
      durationMinutes: 15,
      caloriesBurned: isToday ? 80 : 0,
      status: isToday ? 'pending' : 'completed',
      loggedAt: !isToday ? '16:20 PM' : undefined,
      notes: isToday ? 'Pendiente de realizar según horario programado.' : 'Sincronizado desde App Móvil por el paciente.',
      source: 'mobile_app',
    },
    {
      id: 'ex-4',
      name: 'Rutina de Estiramiento Dinámico y Yoga',
      category: 'Flexibilidad',
      muscleGroup: 'Cuerpo Completo',
      scheduledTime: '19:30 PM',
      durationMinutes: 25,
      caloriesBurned: isToday ? 95 : 0,
      status: isToday ? 'pending' : 'missed',
      loggedAt: undefined,
      notes: isToday
        ? 'Programado para la noche en el plan de entrenamiento.'
        : 'Sesión no realizada por el paciente.',
      source: 'mobile_app',
    },
  ];

  const completedCount = exercises.filter((e) => e.status === 'completed').length;
  const missedCount = exercises.filter((e) => e.status === 'missed').length;
  const pendingCount = exercises.filter((e) => e.status === 'pending').length;
  const totalAssigned = exercises.length;
  const complianceRate = Math.round((completedCount / totalAssigned) * 100);

  const totalDurationMinutes = exercises
    .filter((e) => e.status === 'completed')
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  const totalCaloriesBurned = exercises
    .filter((e) => e.status === 'completed')
    .reduce((acc, curr) => acc + (curr.caloriesBurned || 0), 0);

  return {
    patientId,
    date,
    totalAssigned,
    completedCount,
    missedCount,
    pendingCount,
    complianceRate,
    totalDurationMinutes,
    totalCaloriesBurned,
    exercises,
  };
};

export const physicalComplianceAPI = {
  getPatientPhysicalCompliance: async (
    patientId: string,
    date: string,
  ): Promise<DailyPhysicalCompliance> => {
    try {
      const response = await api.get(endpoints.physicalCompliance.byDate(patientId, date));
      if (response.data && response.data.exercises && response.data.exercises.length > 0) {
        return response.data;
      }
      return generateMockPhysicalCompliance(patientId, date);
    } catch (error) {
      console.warn(
        'Endpoint de cumplimiento físico no disponible o con error, utilizando datos mock para monitoreo en frontend:',
        error,
      );
      return generateMockPhysicalCompliance(patientId, date);
    }
  },
};
