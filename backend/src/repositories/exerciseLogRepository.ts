import { pool } from '../db/pool.js';
import {
  CreateExerciseLogInput,
  ExerciseCategory,
  ExerciseLog,
  EXERCISE_CATEGORIES,
  UpdateExerciseLogInput,
} from '../types/tracking.js';

function mapRow(row: Record<string, unknown>): ExerciseLog {
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    exerciseName: String(row.exercise_name),
    category: String(row.category) as ExerciseCategory,
    durationMinutes: Number(row.duration_minutes),
    caloriesBurned: Number(row.calories_burned),
    logDate: String(row.log_date).slice(0, 10),
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at ?? row.created_at)).toISOString(),
  };
}

export function isValidExerciseCategory(value: string): value is ExerciseCategory {
  return (EXERCISE_CATEGORIES as readonly string[]).includes(value);
}

export async function createExerciseLog(
  patientId: string,
  input: CreateExerciseLogInput,
): Promise<ExerciseLog> {
  const result = await pool.query(
    `INSERT INTO exercise_logs (
      patient_id, exercise_name, category, duration_minutes,
      calories_burned, log_date, notes
    ) VALUES ($1, $2, $3, $4, $5, COALESCE($6::date, CURRENT_DATE), $7)
    RETURNING *`,
    [
      patientId,
      input.exerciseName,
      input.category,
      input.durationMinutes,
      input.caloriesBurned ?? 0,
      input.logDate ?? null,
      input.notes ?? null,
    ],
  );
  return mapRow(result.rows[0]);
}

export async function listExerciseLogs(
  patientId: string,
  logDate?: string,
): Promise<ExerciseLog[]> {
  const conditions = ['patient_id = $1'];
  const values: string[] = [patientId];

  if (logDate) {
    conditions.push('log_date = $2::date');
    values.push(logDate);
  }

  const result = await pool.query(
    `SELECT * FROM exercise_logs
     WHERE ${conditions.join(' AND ')}
     ORDER BY log_date DESC, created_at DESC`,
    values,
  );
  return result.rows.map(mapRow);
}

export async function findExerciseLogById(id: string): Promise<ExerciseLog | null> {
  const result = await pool.query('SELECT * FROM exercise_logs WHERE id = $1', [id]);
  return result.rowCount ? mapRow(result.rows[0]) : null;
}

export async function updateExerciseLog(
  id: string,
  patientId: string,
  input: UpdateExerciseLogInput,
): Promise<ExerciseLog | null> {
  const current = await findExerciseLogById(id);
  if (!current || current.patientId !== patientId) return null;

  const result = await pool.query(
    `UPDATE exercise_logs SET
      exercise_name = $3,
      category = $4,
      duration_minutes = $5,
      calories_burned = $6,
      log_date = COALESCE($7::date, log_date),
      notes = $8,
      updated_at = NOW()
    WHERE id = $1 AND patient_id = $2
    RETURNING *`,
    [
      id,
      patientId,
      input.exerciseName ?? current.exerciseName,
      input.category ?? current.category,
      input.durationMinutes ?? current.durationMinutes,
      input.caloriesBurned ?? current.caloriesBurned,
      input.logDate ?? null,
      input.notes ?? current.notes ?? null,
    ],
  );
  return result.rowCount ? mapRow(result.rows[0]) : null;
}

export async function deleteExerciseLog(id: string, patientId: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM exercise_logs WHERE id = $1 AND patient_id = $2',
    [id, patientId],
  );
  return (result.rowCount ?? 0) > 0;
}
