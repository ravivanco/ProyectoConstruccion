import { pool } from '../db/pool.js';
import { Patient, PatientFilters, TreatmentStatus } from '../types/patient.js';

const validStatuses: TreatmentStatus[] = [
  'Alta Adherencia',
  'Media Adherencia',
  'Baja Adherencia',
  'Pendiente',
];

function mapRow(row: Record<string, unknown>): Patient {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    generalState: String(row.treatment_status) as TreatmentStatus,
    lastVisit: row.last_visit ? String(row.last_visit).slice(0, 10) : undefined,
  };
}

export async function listPatients(
  nutritionistId: string,
  filters: PatientFilters,
): Promise<Patient[]> {
  const conditions = ['nutritionist_id = $1'];
  const values: Array<string> = [nutritionistId];
  let index = 2;

  if (filters.search?.trim()) {
    conditions.push(`(LOWER(name) LIKE $${index} OR LOWER(email) LIKE $${index})`);
    values.push(`%${filters.search.trim().toLowerCase()}%`);
    index += 1;
  }

  if (filters.treatmentStatus && validStatuses.includes(filters.treatmentStatus)) {
    conditions.push(`treatment_status = $${index}`);
    values.push(filters.treatmentStatus);
    index += 1;
  }

  const result = await pool.query(
    `SELECT * FROM patients WHERE ${conditions.join(' AND ')} ORDER BY name ASC`,
    values,
  );

  return result.rows.map(mapRow);
}
