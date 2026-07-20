import { getExerciseCompliance } from './adherenceRepository.js';
import { listExerciseLogs } from './exerciseLogRepository.js';
import { pool } from '../db/pool.js';

export interface PatientExerciseTracking {
  patientId: string;
  logDate: string;
  compliancePercentage: number;
  scheduledSessions: number;
  completedSessions: number;
  logs: Awaited<ReturnType<typeof listExerciseLogs>>;
  scheduled: Array<{
    exerciseId: string;
    exerciseName: string;
    scheduledDate: string;
    completed: boolean;
  }>;
}

export async function getPatientExerciseTracking(
  patientId: string,
  logDate?: string,
): Promise<PatientExerciseTracking> {
  const date = logDate ?? new Date().toISOString().slice(0, 10);
  const [logs, compliance, scheduledResult] = await Promise.all([
    listExerciseLogs(patientId, date),
    getExerciseCompliance(patientId, 7),
    pool.query(
      `SELECT pes.scheduled_date::text AS scheduled_date, e.id AS exercise_id, e.name AS exercise_name
       FROM patient_exercise_schedule pes
       JOIN exercises e ON e.id = pes.exercise_id
       WHERE pes.patient_id = $1 AND pes.scheduled_date = $2::date`,
      [patientId, date],
    ),
  ]);

  const scheduled = scheduledResult.rows.map((row) => ({
    exerciseId: String(row.exercise_id),
    exerciseName: String(row.exercise_name),
    scheduledDate: String(row.scheduled_date).slice(0, 10),
    completed: logs.length > 0,
  }));

  return {
    patientId,
    logDate: date,
    compliancePercentage: compliance.compliancePercentage,
    scheduledSessions: compliance.scheduledSessions,
    completedSessions: compliance.completedSessions,
    logs,
    scheduled,
  };
}
