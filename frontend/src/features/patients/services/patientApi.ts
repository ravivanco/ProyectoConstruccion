import type { PatientDetail } from '../types';

// Simulamos una base de datos de pacientes en memoria
const mockPatientsDb: PatientDetail[] = [
  {
    id: '1',
    name: 'Carlos Mendoza',
    email: 'carlos.m@gmail.com',
    generalState: 'Alta Adherencia',
    lastVisit: '10 Jun 2026',
    phone: '+1 555-0123',
    age: 34,
    weight: 75,
    height: 175,
    isProfileCompleted: true,
    treatmentState: 'Activo',
    notes: 'Paciente con buena evolución física y adaptación a la dieta.',
    medicalConditions: ['Hipertensión leve', 'Resistencia a la insulina'],
    allergies: ['Penicilina', 'Mariscos'],
    preferences: ['Dieta Mediterránea', 'Desayunos ligeros'],
    restrictions: ['Bajo en sodio', 'Sin azúcar refinada'],
    objective: 'Reducir índice de masa corporal y controlar niveles de glucosa en sangre a través de una alimentación balanceada y sostenible.'
  },
  {
    id: '2',
    name: 'Ana Gutiérrez',
    email: 'ana.g@hotmail.com',
    generalState: 'Media Adherencia',
    lastVisit: '12 Jun 2026',
    phone: '+1 555-0199',
    age: 42,
    weight: 82,
    height: 168,
    isProfileCompleted: true,
    treatmentState: 'Suspendido',
    notes: 'Le cuesta seguir los horarios, pero mantiene las porciones.',
    medicalConditions: ['Hipotiroidismo'],
    allergies: [],
    preferences: ['Dietas altas en proteína'],
    restrictions: ['Lácteos enteros'],
    objective: 'Aumentar masa muscular y acelerar metabolismo.'
  },
  {
    id: '3',
    name: 'Luis Ramírez',
    email: 'luis.ramirez@yahoo.com',
    generalState: 'Baja Adherencia',
    lastVisit: '05 Jun 2026',
    phone: '+1 555-0144',
    age: 28,
    weight: 90,
    height: 180,
    isProfileCompleted: false, // ¡PERFIL INCOMPLETO PARA VER ESTADO VACÍO!
    treatmentState: 'Pendiente'
  },
  {
    id: '4',
    name: 'María Fernanda Salas',
    email: 'mafer.salas@gmail.com',
    generalState: 'Alta Adherencia',
    lastVisit: '14 Jun 2026',
    phone: '+1 555-0155',
    age: 31,
    weight: 60,
    height: 165,
    isProfileCompleted: true,
    treatmentState: 'Finalizado',
    notes: 'Excelente progreso, alcanzó su peso ideal.',
    medicalConditions: [],
    allergies: ['Nueces'],
    preferences: ['Vegetariana'],
    restrictions: ['Carnes rojas'],
    objective: 'Mantenimiento de peso actual.'
  },
  {
    id: '5',
    name: 'Jorge Villalobos',
    email: 'jorgev89@outlook.com',
    generalState: 'Pendiente',
    lastVisit: '16 Jun 2026',
    phone: '+1 555-0166',
    age: 45,
    weight: 95,
    height: 170,
    isProfileCompleted: false, // ¡PERFIL INCOMPLETO PARA VER ESTADO VACÍO!
    treatmentState: 'Pendiente'
  }
];

export const patientAPI = {
  // Simulamos una llamada asíncrona a un backend real
  getPatientById: async (id: string): Promise<PatientDetail> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const patient = mockPatientsDb.find(p => p.id === id);
        if (patient) {
          resolve(patient);
        } else {
          reject(new Error('Paciente no encontrado'));
        }
      }, 800); // Simulamos 800ms de latencia de red
    });
  }
};
