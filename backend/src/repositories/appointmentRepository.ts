import { pool } from '../db/pool.js';
import {
  Appointment,
  AppointmentStatus,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '../types/appointment.js';

function mapRow(row: Record<string, unknown>): Appointment {
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    nutritionistId: String(row.nutritionist_id),
    scheduledAt: new Date(String(row.scheduled_at)).toISOString(),
    durationMinutes: Number(row.duration_minutes),
    status: String(row.status) as AppointmentStatus,
    notes: row.notes ? String(row.notes) : undefined,
    location: row.location ? String(row.location) : undefined,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at ?? row.created_at)).toISOString(),
  };
}

export async function createAppointment(
  nutritionistId: string,
  input: CreateAppointmentInput,
): Promise<Appointment> {
  const result = await pool.query(
    `INSERT INTO appointments (
      patient_id, nutritionist_id, scheduled_at, duration_minutes, status, notes, location
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      input.patientId,
      nutritionistId,
      input.scheduledAt,
      input.durationMinutes ?? 30,
      input.status ?? 'scheduled',
      input.notes ?? null,
      input.location ?? null,
    ],
  );
  return mapRow(result.rows[0]);
}

export async function listAppointments(filters: {
  patientId?: string;
  nutritionistId?: string;
  status?: AppointmentStatus;
  from?: string;
  to?: string;
}): Promise<Appointment[]> {
  const conditions: string[] = [];
  const values: string[] = [];
  let index = 1;

  if (filters.patientId) {
    conditions.push(`patient_id = $${index}`);
    values.push(filters.patientId);
    index += 1;
  }

  if (filters.nutritionistId) {
    conditions.push(`nutritionist_id = $${index}`);
    values.push(filters.nutritionistId);
    index += 1;
  }

  if (filters.status) {
    conditions.push(`status = $${index}`);
    values.push(filters.status);
    index += 1;
  }

  if (filters.from) {
    conditions.push(`scheduled_at >= $${index}::timestamptz`);
    values.push(filters.from);
    index += 1;
  }

  if (filters.to) {
    conditions.push(`scheduled_at <= $${index}::timestamptz`);
    values.push(filters.to);
    index += 1;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query(
    `SELECT * FROM appointments ${whereClause} ORDER BY scheduled_at ASC`,
    values,
  );
  return result.rows.map(mapRow);
}

export async function findAppointmentById(id: string): Promise<Appointment | null> {
  const result = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
  return result.rowCount ? mapRow(result.rows[0]) : null;
}

export async function updateAppointment(
  id: string,
  nutritionistId: string,
  input: UpdateAppointmentInput,
): Promise<Appointment | null> {
  const current = await findAppointmentById(id);
  if (!current || current.nutritionistId !== nutritionistId) return null;

  const result = await pool.query(
    `UPDATE appointments SET
      scheduled_at = COALESCE($3::timestamptz, scheduled_at),
      duration_minutes = COALESCE($4, duration_minutes),
      status = COALESCE($5, status),
      notes = COALESCE($6, notes),
      location = COALESCE($7, location),
      updated_at = NOW()
    WHERE id = $1 AND nutritionist_id = $2
    RETURNING *`,
    [
      id,
      nutritionistId,
      input.scheduledAt ?? null,
      input.durationMinutes ?? null,
      input.status ?? null,
      input.notes ?? null,
      input.location ?? null,
    ],
  );
  return result.rowCount ? mapRow(result.rows[0]) : null;
}

export async function deleteAppointment(
  id: string,
  nutritionistId: string,
): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM appointments WHERE id = $1 AND nutritionist_id = $2',
    [id, nutritionistId],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function assertPatientBelongsToNutritionist(
  patientId: string,
  nutritionistId: string,
): Promise<boolean> {
  const result = await pool.query(
    'SELECT 1 FROM patients WHERE id = $1 AND nutritionist_id = $2',
    [patientId, nutritionistId],
  );
  return (result.rowCount ?? 0) > 0;
}
