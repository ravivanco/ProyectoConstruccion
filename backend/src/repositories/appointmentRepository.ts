import { pool } from '../db/pool.js';

export interface Appointment {
  id: string;
  patientId: string;
  dateTime: string;
  reason: string;
  status: 'PROGRAMADA' | 'ATENDIDA' | 'CANCELADA' | 'REPROGRAMADA';
  createdAt?: string;
  updatedAt?: string;
}

export async function createAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
  const result = await pool.query(
    `INSERT INTO appointments (patient_id, date_time, reason, status)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.patientId, data.dateTime, data.reason, data.status],
  );
  const row = result.rows[0];
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    dateTime: String(row.date_time),
    reason: String(row.reason),
    status: row.status as any,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function getAppointments(): Promise<Appointment[]> {
  const result = await pool.query(
    `SELECT * FROM appointments ORDER BY date_time ASC`
  );
  return result.rows.map(row => ({
    id: String(row.id),
    patientId: String(row.patient_id),
    dateTime: String(row.date_time),
    reason: String(row.reason),
    status: row.status as any,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }));
}

export async function getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
  const result = await pool.query(
    `SELECT * FROM appointments WHERE patient_id = $1 ORDER BY date_time ASC`,
    [patientId]
  );
  return result.rows.map(row => ({
    id: String(row.id),
    patientId: String(row.patient_id),
    dateTime: String(row.date_time),
    reason: String(row.reason),
    status: row.status as any,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }));
}

export async function updateAppointmentStatus(id: string, status: string): Promise<Appointment | null> {
  const result = await pool.query(
    `UPDATE appointments 
     SET status = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 
     RETURNING *`,
    [status, id]
  );
  if (!result.rowCount) return null;
  const row = result.rows[0];
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    dateTime: String(row.date_time),
    reason: String(row.reason),
    status: row.status as any,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
