import { pool } from '../db/pool.js';
import {
  CreateWeightLogInput,
  UpdateWeightLogInput,
  WeightLog,
} from '../types/tracking.js';

function mapRow(row: Record<string, unknown>): WeightLog {
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    weightKg: Number(row.weight_kg),
    logDate: String(row.log_date).slice(0, 10),
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at ?? row.created_at)).toISOString(),
  };
}

export async function createWeightLog(
  patientId: string,
  input: CreateWeightLogInput,
): Promise<WeightLog> {
  const result = await pool.query(
    `INSERT INTO weight_logs (patient_id, weight_kg, log_date, notes)
     VALUES ($1, $2, COALESCE($3::date, CURRENT_DATE), $4)
     RETURNING *`,
    [patientId, input.weightKg, input.logDate ?? null, input.notes ?? null],
  );
  return mapRow(result.rows[0]);
}

export async function listWeightLogs(
  patientId: string,
  fromDate?: string,
  toDate?: string,
): Promise<WeightLog[]> {
  const conditions = ['patient_id = $1'];
  const values: string[] = [patientId];
  let index = 2;

  if (fromDate) {
    conditions.push(`log_date >= $${index}::date`);
    values.push(fromDate);
    index += 1;
  }

  if (toDate) {
    conditions.push(`log_date <= $${index}::date`);
    values.push(toDate);
    index += 1;
  }

  const result = await pool.query(
    `SELECT * FROM weight_logs
     WHERE ${conditions.join(' AND ')}
     ORDER BY log_date DESC, created_at DESC`,
    values,
  );
  return result.rows.map(mapRow);
}

export async function findWeightLogById(id: string): Promise<WeightLog | null> {
  const result = await pool.query('SELECT * FROM weight_logs WHERE id = $1', [id]);
  return result.rowCount ? mapRow(result.rows[0]) : null;
}

export async function findWeightLogByPatientAndDate(
  patientId: string,
  logDate: string,
): Promise<WeightLog | null> {
  const result = await pool.query(
    'SELECT * FROM weight_logs WHERE patient_id = $1 AND log_date = $2::date',
    [patientId, logDate],
  );
  return result.rowCount ? mapRow(result.rows[0]) : null;
}

export async function updateWeightLog(
  id: string,
  patientId: string,
  input: UpdateWeightLogInput,
): Promise<WeightLog | null> {
  const current = await findWeightLogById(id);
  if (!current || current.patientId !== patientId) return null;

  const result = await pool.query(
    `UPDATE weight_logs SET
      weight_kg = $3,
      log_date = COALESCE($4::date, log_date),
      notes = $5,
      updated_at = NOW()
    WHERE id = $1 AND patient_id = $2
    RETURNING *`,
    [
      id,
      patientId,
      input.weightKg ?? current.weightKg,
      input.logDate ?? null,
      input.notes ?? current.notes ?? null,
    ],
  );
  return result.rowCount ? mapRow(result.rows[0]) : null;
}

export async function deleteWeightLog(id: string, patientId: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM weight_logs WHERE id = $1 AND patient_id = $2',
    [id, patientId],
  );
  return (result.rowCount ?? 0) > 0;
}
