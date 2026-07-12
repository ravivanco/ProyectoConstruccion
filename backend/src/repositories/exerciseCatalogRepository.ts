import { pool } from '../db/pool.js';
import { ExerciseCatalogItem, ScheduledExercise } from '../types/exercise.js';
import { ActivityLevel } from '../utils/metabolism.js';

function mapRow(row: Record<string, unknown>): ExerciseCatalogItem {
  return {
    id: String(row.id),
    name: String(row.name),
    category: String(row.category),
    durationMinutes: Number(row.duration_minutes),
    intensity: String(row.intensity),
    caloriesPerSession: Number(row.calories_per_session),
    description: row.description ? String(row.description) : undefined,
    isRecommended: Boolean(row.is_recommended),
  };
}

const ACTIVITY_RANK: Record<ActivityLevel, number> = {
  sedentary: 0,
  light: 1,
  moderate: 2,
  high: 3,
};

export async function listExercises(category?: string): Promise<ExerciseCatalogItem[]> {
  const conditions: string[] = [];
  const values: string[] = [];

  if (category) {
    conditions.push('category = $1');
    values.push(category);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query(
    `SELECT * FROM exercises ${where} ORDER BY category, name`,
    values,
  );
  return result.rows.map(mapRow);
}

export async function listRecommendedExercises(
  activityLevel: ActivityLevel = 'moderate',
): Promise<ExerciseCatalogItem[]> {
  const rank = ACTIVITY_RANK[activityLevel];
  const levels = Object.entries(ACTIVITY_RANK)
    .filter(([, value]) => value <= rank)
    .map(([key]) => key);

  const result = await pool.query(
    `SELECT * FROM exercises
     WHERE is_recommended = true
       AND min_activity_level = ANY($1::text[])
     ORDER BY calories_per_session DESC`,
    [levels],
  );
  return result.rows.map(mapRow);
}

export async function listExercisesByDate(
  patientId: string,
  date: string,
): Promise<ScheduledExercise[]> {
  const result = await pool.query(
    `SELECT e.*, s.scheduled_date
     FROM patient_exercise_schedule s
     JOIN exercises e ON e.id = s.exercise_id
     WHERE s.patient_id = $1 AND s.scheduled_date = $2::date
     ORDER BY e.category, e.name`,
    [patientId, date],
  );

  if (!result.rowCount) {
    const fallback = await pool.query(
      `SELECT * FROM exercises
       WHERE is_recommended = true
       ORDER BY category, name
       LIMIT 5`,
    );
    const today = date;
    return fallback.rows.map((row) => ({
      ...mapRow(row),
      scheduledDate: today,
    }));
  }

  return result.rows.map((row) => ({
    ...mapRow(row),
    scheduledDate: String(row.scheduled_date).slice(0, 10),
  }));
}

export async function seedPatientScheduleIfEmpty(patientId: string, date: string): Promise<void> {
  const existing = await pool.query(
    'SELECT 1 FROM patient_exercise_schedule WHERE patient_id = $1 AND scheduled_date = $2::date LIMIT 1',
    [patientId, date],
  );
  if (existing.rowCount) return;

  const recommended = await pool.query(
    'SELECT id FROM exercises WHERE is_recommended = true ORDER BY name LIMIT 3',
  );
  for (const row of recommended.rows) {
    await pool.query(
      `INSERT INTO patient_exercise_schedule (patient_id, exercise_id, scheduled_date)
       VALUES ($1, $2, $3::date)
       ON CONFLICT DO NOTHING`,
      [patientId, row.id, date],
    );
  }
}
