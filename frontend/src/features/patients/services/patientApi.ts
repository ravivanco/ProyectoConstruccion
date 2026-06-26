import type { PatientDetail } from '../types';

// Simulamos una base de datos de pacientes en memoria
const mockPatientsDb: PatientDetail[] = [
  {
    id: '1',
    name: 'Ana María Santos',
    email: 'ana.santos@email.com',
    generalState: 'Alta Adherencia',
    lastVisit: '15-jun-2026',
    phone: '+1 555-0123',
    age: 34,
    weight: 65,
    height: 165,
    isProfileCompleted: true,
    treatmentState: 'Activo',
    notes: 'Paciente con buena evolución física y adaptación a la dieta.'
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    email: 'crodriguez@email.com',
    generalState: 'Media Adherencia',
    lastVisit: '10-jun-2026',
    phone: '+1 555-0199',
    age: 42,
    weight: 82,
    height: 178,
    isProfileCompleted: true,
    treatmentState: 'Suspendido',
    notes: 'Le cuesta seguir los horarios, pero mantiene las porciones.'
  },
  {
    id: '3',
    name: 'Elena Fuentes',
    email: 'elena.f@email.com',
    generalState: 'Baja Adherencia',
    lastVisit: '02-jun-2026',
    phone: '+1 555-0144',
    age: 28,
    weight: 70,
    height: 160,
    isProfileCompleted: false, // ¡PERFIL INCOMPLETO PARA TESTEAR REQUERIMIENTO!
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
