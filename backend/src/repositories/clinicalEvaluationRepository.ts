import { pool } from '../db/pool.js';
import { ClinicalEvaluation } from '../types/clinicalEvaluation.js';

function mapRow(row: Record<string, unknown>): ClinicalEvaluation {
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    nutritionistId: String(row.nutritionist_id),
    weightKg: Number(row.weight_kg),
    heightCm: Number(row.height_cm),
    bmi: Number(row.bmi),
    bodyFatPercentage: row.body_fat_percentage != null ? Number(row.body_fat_percentage) : undefined,
    waistCm: row.waist_cm != null ? Number(row.waist_cm) : undefined,
    notes: row.notes != null ? String(row.notes) : undefined,
    evaluationDate: String(row.evaluation_date).slice(0, 10),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

export async function listClinicalEvaluationsByPatient(
  patientId: string,
): Promise<ClinicalEvaluation[]> {
  const result = await pool.query(
    `SELECT * FROM clinical_evaluations
     WHERE patient_id = $1
     ORDER BY evaluation_date DESC, created_at DESC`,
    [patientId],
  );

  return result.rows.map(mapRow);
}
