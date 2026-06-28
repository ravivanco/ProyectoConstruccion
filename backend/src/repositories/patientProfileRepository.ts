import { pool } from '../db/pool.js';
import { PatientProfile, UpsertPatientProfileInput } from '../types/patientProfile.js';

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapRow(row: Record<string, unknown>): PatientProfile {
  return {
    patientId: String(row.patient_id),
    activityLevel: row.activity_level ? (String(row.activity_level) as PatientProfile['activityLevel']) : undefined,
    medicalConditions: parseJsonArray(row.medical_conditions),
    allergies: parseJsonArray(row.allergies),
    intolerances: parseJsonArray(row.intolerances),
    nutritionGoal: row.nutrition_goal ? (String(row.nutrition_goal) as PatientProfile['nutritionGoal']) : undefined,
    sports: parseJsonArray(row.sports),
    foodPreferences: parseJsonArray(row.food_preferences),
    foodRestrictions: parseJsonArray(row.food_restrictions),
    completed: Boolean(row.completed),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getPatientProfileById(patientId: string): Promise<PatientProfile | null> {
  const result = await pool.query(
    'SELECT * FROM patient_profiles WHERE patient_id = $1',
    [patientId],
  );
  if (!result.rowCount) return null;
  return mapRow(result.rows[0]);
}

export async function upsertPatientProfile(
  patientId: string,
  input: UpsertPatientProfileInput,
): Promise<PatientProfile> {
  const result = await pool.query(
    `INSERT INTO patient_profiles (
      patient_id, activity_level, medical_conditions, allergies, intolerances,
      nutrition_goal, sports, food_preferences, food_restrictions, completed, updated_at
    ) VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6, $7::jsonb, $8::jsonb, $9::jsonb, $10, NOW())
    ON CONFLICT (patient_id) DO UPDATE SET
      activity_level = COALESCE(EXCLUDED.activity_level, patient_profiles.activity_level),
      medical_conditions = COALESCE(EXCLUDED.medical_conditions, patient_profiles.medical_conditions),
      allergies = COALESCE(EXCLUDED.allergies, patient_profiles.allergies),
      intolerances = COALESCE(EXCLUDED.intolerances, patient_profiles.intolerances),
      nutrition_goal = COALESCE(EXCLUDED.nutrition_goal, patient_profiles.nutrition_goal),
      sports = COALESCE(EXCLUDED.sports, patient_profiles.sports),
      food_preferences = COALESCE(EXCLUDED.food_preferences, patient_profiles.food_preferences),
      food_restrictions = COALESCE(EXCLUDED.food_restrictions, patient_profiles.food_restrictions),
      completed = COALESCE(EXCLUDED.completed, patient_profiles.completed),
      updated_at = NOW()
    RETURNING *`,
    [
      patientId,
      input.activityLevel ?? null,
      JSON.stringify(input.medicalConditions ?? []),
      JSON.stringify(input.allergies ?? []),
      JSON.stringify(input.intolerances ?? []),
      input.nutritionGoal ?? null,
      JSON.stringify(input.sports ?? []),
      JSON.stringify(input.foodPreferences ?? []),
      JSON.stringify(input.foodRestrictions ?? []),
      input.completed ?? false,
    ],
  );

  return mapRow(result.rows[0]);
}
