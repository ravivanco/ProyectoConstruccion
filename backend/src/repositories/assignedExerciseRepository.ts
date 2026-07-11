import { randomUUID } from 'crypto';
import {
  AssignedExerciseItem,
  CreateAssignedExerciseDTO,
  UpdateAssignedExerciseDTO,
} from '../types/assignedExercise.js';

let assignedExercisesStore: AssignedExerciseItem[] = [
  {
    id: 'asg-exc-101',
    planId: 'plan-001',
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
    planId: 'plan-001',
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
    planId: 'plan-001',
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

export async function getAssignedExercisesByPlanId(
  planId: string,
): Promise<AssignedExerciseItem[]> {
  return assignedExercisesStore.filter((item) => item.planId === planId);
}

export async function getPatientMobileExerciseSchedule(
  patientId: string,
): Promise<AssignedExerciseItem[]> {
  return assignedExercisesStore.filter((item) => item.patientId === patientId);
}

export async function createAssignedExercise(
  planId: string,
  dto: CreateAssignedExerciseDTO,
): Promise<AssignedExerciseItem> {
  const newItem: AssignedExerciseItem = {
    id: `asg-exc-${randomUUID().slice(0, 8)}`,
    planId,
    patientId: dto.patientId,
    exerciseId: dto.exerciseId,
    exerciseName: dto.exerciseName.trim(),
    category: dto.category,
    metValue: Number(dto.metValue ?? 4.0),
    durationMin: Number(dto.durationMin ?? 20),
    dayOfWeek: dto.dayOfWeek,
    notes: (dto.notes || '').trim(),
    completed: false,
    assignedAt: new Date().toISOString(),
  };

  assignedExercisesStore.push(newItem);
  return newItem;
}

export async function updateAssignedExercise(
  id: string,
  dto: UpdateAssignedExerciseDTO,
): Promise<AssignedExerciseItem | null> {
  const index = assignedExercisesStore.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const current = assignedExercisesStore[index];
  const updated: AssignedExerciseItem = {
    ...current,
    durationMin:
      dto.durationMin !== undefined ? Number(dto.durationMin) : current.durationMin,
    dayOfWeek: dto.dayOfWeek ?? current.dayOfWeek,
    notes: dto.notes !== undefined ? dto.notes.trim() : current.notes,
    completed: dto.completed !== undefined ? Boolean(dto.completed) : current.completed,
  };

  assignedExercisesStore[index] = updated;
  return updated;
}

export async function deleteAssignedExercise(id: string): Promise<boolean> {
  const initialLen = assignedExercisesStore.length;
  assignedExercisesStore = assignedExercisesStore.filter((item) => item.id !== id);
  return assignedExercisesStore.length < initialLen;
}
