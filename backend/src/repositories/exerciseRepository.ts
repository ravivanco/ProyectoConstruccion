import { randomUUID } from 'crypto';
import {
  CreateExerciseDTO,
  ExerciseItem,
  UpdateExerciseDTO,
} from '../types/exercise.js';

const INITIAL_EXERCISES: ExerciseItem[] = [
  {
    id: 'exc-1',
    name: 'Sentadillas con Peso Corporal',
    category: 'Fuerza',
    muscleGroup: 'Piernas y Glúteos',
    difficulty: 'Principiante',
    metValue: 5.0,
    recommendedDurationMin: 15,
    description: 'Ejercicio funcional fundamental para tren inferior y estabilidad del core.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exc-2',
    name: 'Caminata Rápida en Cinta (6 km/h)',
    category: 'Cardio',
    muscleGroup: 'Cardiovascular / Todo el cuerpo',
    difficulty: 'Principiante',
    metValue: 4.3,
    recommendedDurationMin: 30,
    description: 'Actividad aeróbica de bajo impacto ideal para control metabólico y quema de grasa.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exc-3',
    name: 'Plancha Abdominal Isométrica',
    category: 'Fuerza',
    muscleGroup: 'Core / Abdominales',
    difficulty: 'Intermedio',
    metValue: 3.8,
    recommendedDurationMin: 10,
    description: 'Trabajo isométrico para fortalecimiento profundo del cinturón abdominal y columna.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exc-4',
    name: 'Intervalos HIIT en Bicicleta Estática',
    category: 'HIIT',
    muscleGroup: 'Piernas / Cardiovascular',
    difficulty: 'Avanzado',
    metValue: 9.5,
    recommendedDurationMin: 20,
    description: 'Entrenamiento de alta intensidad con intervalos de 30s sprint / 60s recuperación activa.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exc-5',
    name: 'Estiramiento Dinámico de Cadera e Isquiotibiales',
    category: 'Flexibilidad',
    muscleGroup: 'Cadera e Isquiotibiales',
    difficulty: 'Principiante',
    metValue: 2.3,
    recommendedDurationMin: 15,
    description: 'Rutina de movilidad articular y elongación para prevenir lesiones y dolor lumbar.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exc-6',
    name: 'Press con Mancuernas en Banco Inclinado',
    category: 'Fuerza',
    muscleGroup: 'Pecho, Hombros y Tríceps',
    difficulty: 'Intermedio',
    metValue: 6.0,
    recommendedDurationMin: 25,
    description: 'Desarrollo de fuerza del tren superior enfocándose en haz clavicular pectoral.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exc-7',
    name: 'Remo con Banda de Resistencia',
    category: 'Rehabilitación',
    muscleGroup: 'Espalda Alta y Postura',
    difficulty: 'Principiante',
    metValue: 3.5,
    recommendedDurationMin: 15,
    description: 'Ejercicio correctivo postural para retracción escapular y fortalecimiento de romboides.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exc-8',
    name: 'Ejercicios de Equilibrio sobre Bosu',
    category: 'Equilibrio',
    muscleGroup: 'Propiocepción / Tobillos',
    difficulty: 'Intermedio',
    metValue: 3.0,
    recommendedDurationMin: 15,
    description: 'Mejora de la estabilidad articular y control neuromuscular sobre superficie inestable.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exc-9',
    name: 'Natación Estilo Libre Ritmado',
    category: 'Cardio',
    muscleGroup: 'Cuerpo Completo',
    difficulty: 'Intermedio',
    metValue: 8.0,
    recommendedDurationMin: 30,
    description: 'Ejercicio cardiovascular completo sin impacto articular en extremidades inferiores.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exc-10',
    name: 'Peso Muerto Rumano con Mancuernas',
    category: 'Fuerza',
    muscleGroup: 'Cadena Posterior (Glúteo / Isquio)',
    difficulty: 'Avanzado',
    metValue: 6.5,
    recommendedDurationMin: 20,
    description: 'Ejercicio clave para bisagra de cadera y fortalecimiento posterior lumbar y femoral.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exc-11',
    name: 'Movilidad de Columna Gato-Camello',
    category: 'Flexibilidad',
    muscleGroup: 'Columna Vertebral',
    difficulty: 'Principiante',
    metValue: 2.0,
    recommendedDurationMin: 10,
    description: 'Flexión y extensión controlada de columna para reducir rigidez e inflamación lumbar.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exc-12',
    name: 'Burpees Adaptados sin Salto',
    category: 'HIIT',
    muscleGroup: 'Cuerpo Completo',
    difficulty: 'Intermedio',
    metValue: 7.8,
    recommendedDurationMin: 12,
    description: 'Variante metabólica de alta eficiencia calórica apta para pacientes intermedios.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let exercisesStore: ExerciseItem[] = [...INITIAL_EXERCISES];

export async function getAllExercises(filters?: {
  search?: string;
  category?: string;
}): Promise<ExerciseItem[]> {
  let result = [...exercisesStore];

  if (filters?.category && filters.category !== 'Todos') {
    result = result.filter(
      (exc) => exc.category.toLowerCase() === filters.category!.toLowerCase(),
    );
  }

  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (exc) =>
        exc.name.toLowerCase().includes(q) ||
        exc.muscleGroup.toLowerCase().includes(q) ||
        exc.description.toLowerCase().includes(q),
    );
  }

  return result;
}

export async function findExerciseById(id: string): Promise<ExerciseItem | null> {
  return exercisesStore.find((exc) => exc.id === id) ?? null;
}

export async function createExercise(dto: CreateExerciseDTO): Promise<ExerciseItem> {
  const now = new Date().toISOString();
  const newExc: ExerciseItem = {
    id: `exc-${randomUUID().slice(0, 8)}`,
    name: dto.name.trim(),
    category: dto.category,
    muscleGroup: (dto.muscleGroup || 'General').trim(),
    difficulty: dto.difficulty ?? 'Principiante',
    metValue: Number(dto.metValue ?? 4.0),
    recommendedDurationMin: Number(dto.recommendedDurationMin ?? 20),
    description: (dto.description || '').trim(),
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  exercisesStore.unshift(newExc);
  return newExc;
}

export async function updateExercise(
  id: string,
  dto: UpdateExerciseDTO,
): Promise<ExerciseItem | null> {
  const index = exercisesStore.findIndex((exc) => exc.id === id);
  if (index === -1) return null;

  const current = exercisesStore[index];
  const updated: ExerciseItem = {
    ...current,
    name: dto.name !== undefined ? dto.name.trim() : current.name,
    category: dto.category ?? current.category,
    muscleGroup: dto.muscleGroup !== undefined ? dto.muscleGroup.trim() : current.muscleGroup,
    difficulty: dto.difficulty ?? current.difficulty,
    metValue: dto.metValue !== undefined ? Number(dto.metValue) : current.metValue,
    recommendedDurationMin:
      dto.recommendedDurationMin !== undefined
        ? Number(dto.recommendedDurationMin)
        : current.recommendedDurationMin,
    description: dto.description !== undefined ? dto.description.trim() : current.description,
    isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : current.isActive,
    updatedAt: new Date().toISOString(),
  };

  exercisesStore[index] = updated;
  return updated;
}

export async function deleteExercise(id: string): Promise<boolean> {
  const initialLen = exercisesStore.length;
  exercisesStore = exercisesStore.filter((exc) => exc.id !== id);
  return exercisesStore.length < initialLen;
}
