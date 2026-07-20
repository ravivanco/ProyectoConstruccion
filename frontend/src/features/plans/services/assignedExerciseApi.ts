import { api } from '../../../lib/axios';

export type DayOfWeek =
  | 'Lunes'
  | 'Martes'
  | 'Miércoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sábado'
  | 'Domingo';

export interface AssignedExerciseItem {
  id: string;
  planId: string;
  patientId: string;
  exerciseId: string;
  exerciseName: string;
  category: string;
  metValue: number;
  durationMin: number;
  dayOfWeek: DayOfWeek;
  notes?: string;
  completed?: boolean;
  assignedAt: string;
}

export interface CreateAssignedExerciseInput {
  patientId: string;
  exerciseId: string;
  exerciseName: string;
  category: string;
  metValue: number;
  durationMin: number;
  dayOfWeek: DayOfWeek;
  notes?: string;
}

const INITIAL_ASSIGNED: AssignedExerciseItem[] = [
  {
    id: 'asg-exc-101',
    planId: 'default-plan',
    patientId: 'p-101',
    exerciseId: 'exc-1',
    exerciseName: 'Sentadillas con Peso Corporal',
    category: 'Fuerza',
    metValue: 5.0,
    durationMin: 15,
    dayOfWeek: 'Lunes',
    notes: '3 series de 15 repeticiones con descanso de 45s.',
    completed: true,
    assignedAt: new Date().toISOString(),
  },
  {
    id: 'asg-exc-102',
    planId: 'default-plan',
    patientId: 'p-101',
    exerciseId: 'exc-2',
    exerciseName: 'Caminata Rápida en Cinta (6 km/h)',
    category: 'Cardio',
    metValue: 4.3,
    durationMin: 30,
    dayOfWeek: 'Miércoles',
    notes: 'Mantener ritmo cardiaco moderado (zona aeróbica).',
    completed: false,
    assignedAt: new Date().toISOString(),
  },
  {
    id: 'asg-exc-103',
    planId: 'default-plan',
    patientId: 'p-101',
    exerciseId: 'exc-5',
    exerciseName: 'Estiramiento Dinámico de Cadera e Isquiotibiales',
    category: 'Flexibilidad',
    metValue: 2.3,
    durationMin: 15,
    dayOfWeek: 'Viernes',
    notes: 'Enfocar en movilidad articular sin forzar extensión posterior.',
    completed: false,
    assignedAt: new Date().toISOString(),
  },
];

export const assignedExerciseApi = {
  getByPlanId: async (planId: string): Promise<AssignedExerciseItem[]> => {
    try {
      const response = await api.get<AssignedExerciseItem[]>(
        `/nutrition-plans/${planId}/exercises`,
      );
      if (Array.isArray(response.data)) {
        localStorage.setItem(`dkfitt_asg_exc_${planId}`, JSON.stringify(response.data));
        return response.data;
      }
      return response.data;
    } catch {
      const saved = localStorage.getItem(`dkfitt_asg_exc_${planId}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return INITIAL_ASSIGNED.filter((e) => e.planId === planId || planId === 'default-plan');
        }
      }
      return INITIAL_ASSIGNED;
    }
  },

  assignToPlan: async (
    planId: string,
    input: CreateAssignedExerciseInput,
  ): Promise<AssignedExerciseItem | null> => {
    try {
      const response = await api.post<AssignedExerciseItem>(
        `/nutrition-plans/${planId}/exercises`,
        input,
      );
      return response.data;
    } catch {
      const fallbackItem: AssignedExerciseItem = {
        id: `asg-${Date.now()}`,
        planId,
        ...input,
        completed: false,
        assignedAt: new Date().toISOString(),
      };
      return fallbackItem;
    }
  },

  updateAssigned: async (
    planId: string,
    id: string,
    input: Partial<{
      durationMin: number;
      dayOfWeek: DayOfWeek;
      notes: string;
      completed: boolean;
    }>,
  ): Promise<AssignedExerciseItem | null> => {
    try {
      const response = await api.put<AssignedExerciseItem>(
        `/nutrition-plans/${planId}/exercises/${id}`,
        input,
      );
      return response.data;
    } catch {
      return null;
    }
  },

  deleteAssigned: async (planId: string, id: string): Promise<boolean> => {
    try {
      await api.delete(`/nutrition-plans/${planId}/exercises/${id}`);
      return true;
    } catch {
      return true;
    }
  },

  getMobileSchedule: async (
    patientId: string,
  ): Promise<{ patientId: string; schedule: Record<DayOfWeek, AssignedExerciseItem[]> }> => {
    try {
      const response = await api.get<{
        patientId: string;
        schedule: Record<DayOfWeek, AssignedExerciseItem[]>;
      }>(`/mobile/patients/${patientId}/exercises`);
      return response.data;
    } catch {
      // Fallback local robusto para simulación móvil en desarrollo
      const all: AssignedExerciseItem[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('dkfitt_asg_exc_')) {
          try {
            const arr = JSON.parse(localStorage.getItem(key) || '[]');
            if (Array.isArray(arr)) all.push(...arr);
          } catch {
            // ignore
          }
        }
      }
      const items = all.length > 0 ? all : INITIAL_ASSIGNED;
      const schedule: Record<DayOfWeek, AssignedExerciseItem[]> = {
        Lunes: [],
        Martes: [],
        Miércoles: [],
        Jueves: [],
        Viernes: [],
        Sábado: [],
        Domingo: [],
      };
      items.forEach((item) => {
        if (schedule[item.dayOfWeek]) {
          schedule[item.dayOfWeek].push(item);
        }
      });
      return { patientId, schedule };
    }
  },
};
