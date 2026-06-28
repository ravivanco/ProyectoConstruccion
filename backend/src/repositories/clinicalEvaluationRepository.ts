import { pool } from '../db/pool.js';
import {
  ClinicalEvaluation,
  CreateClinicalEvaluationInput,
  calculateBmi,
} from '../types/clinicalEvaluation.js';

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

export async function createClinicalEvaluation(
  nutritionistId: string,
  input: CreateClinicalEvaluationInput,
): Promise<ClinicalEvaluation> {
  const bmi = calculateBmi(input.weightKg, input.heightCm);
  const evaluationDate = input.evaluationDate ?? new Date().toISOString().slice(0, 10);

  const result = await pool.query(
    `INSERT INTO clinical_evaluations (
      patient_id, nutritionist_id, weight_kg, height_cm, bmi,
      body_fat_percentage, waist_cm, notes, evaluation_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      input.patientId,
      nutritionistId,
      input.weightKg,
      input.heightCm,
      bmi,
      input.bodyFatPercentage ?? null,
      input.waistCm ?? null,
      input.notes ?? null,
      evaluationDate,
    ],
  );

  return mapRow(result.rows[0]);
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
