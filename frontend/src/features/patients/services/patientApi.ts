import type { Patient, PatientDetail } from '../types';

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
    objective: 'Reducir índice de masa corporal y controlar niveles de glucosa en sangre a través de una alimentación balanceada y sostenible.',
    evaluations: [
      { id: 'ev1', date: '2026-06-10T10:00:00Z', weight: 75.0, height: 175, bodyFat: 20.5, muscleMass: 45.0 },
      { id: 'ev2', date: '2026-05-15T09:30:00Z', weight: 76.2, height: 175, bodyFat: 21.0, muscleMass: 44.5 },
      { id: 'ev3', date: '2026-04-10T11:15:00Z', weight: 78.5, height: 175, bodyFat: 22.5, muscleMass: 44.0 }
    ]
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
    isProfileCompleted: false, // ¡PERFIL INCOMPLETO!
    treatmentState: 'Pendiente'
  },
  {
    id: '4',
    name: 'María Fernanda Salas',
    email: 'mafer.salas@gmail.com',
    generalState: 'Alta Adherencia',
    lastVisit: '20 Jun 2026',
    phone: '+593 98 765 4323',
    age: 25,
    weight: 62.0,
    height: 165,
    isProfileCompleted: true,
    treatmentState: 'Pendiente',
    notes: 'Paciente lista para iniciar plan.',
    medicalConditions: ['Ninguna'],
    allergies: ['Ninguna'],
    preferences: ['Comida vegetariana'],
    restrictions: ['Sin lactosa'],
    objective: 'Aumentar masa muscular',
    evaluations: []
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
    isProfileCompleted: false,
    treatmentState: 'Pendiente',
    evaluations: []
  }
];

export const patientAPI = {
  getPatients: async (): Promise<Patient[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockPatientsDb.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        generalState: p.generalState,
        lastVisit: p.lastVisit,
        treatmentState: p.treatmentState
      }))), 800);
    });
  },

  getPatientById: async (id: string): Promise<PatientDetail> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const patient = mockPatientsDb.find(p => p.id === id);
        if (patient) {
          resolve(patient);
        } else {
          reject(new Error('Patient not found'));
        }
      }, 500);
    });
  },
  
  activatePlan: async (id: string, startDate?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const patientIndex = mockPatientsDb.findIndex(p => p.id === id);
        if (patientIndex !== -1) {
          mockPatientsDb[patientIndex].treatmentState = 'Activo';
          // console.log(`Activando plan para paciente ${id} con fecha de inicio ${startDate}`); (PROYEC-468)
          if (startDate) console.log(startDate);
          resolve();
        } else {
          reject(new Error('Patient not found'));
        }
      }, 1500);
    });
  }
};
