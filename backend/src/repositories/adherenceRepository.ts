import { pool } from '../db/pool.js';

export interface AdherenceLog {
  id: string;
  patientId: string;
  logDate: string;
  mealAdherencePercent: number;
  physicalAdherencePercent: number;
  dailyWeightKg?: number;
  extraCaloriesConsumed: number;
  adherenceLevel: 'ALTA' | 'MEDIA' | 'BAJA';
  createdAt?: string;
  updatedAt?: string;
}

export interface ExtraConsumption {
  id: string;
  patientId: string;
  logDate: string;
  foodDescription: string;
  calories: number;
  imageUrl?: string;
  createdAt?: string;
}

export async function upsertAdherenceLog(data: Omit<AdherenceLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdherenceLog> {
  const result = await pool.query(
    `INSERT INTO adherence_logs 
      (patient_id, log_date, meal_adherence_percent, physical_adherence_percent, daily_weight_kg, extra_calories_consumed, adherence_level)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (patient_id, log_date) 
     DO UPDATE SET 
        meal_adherence_percent = EXCLUDED.meal_adherence_percent,
        physical_adherence_percent = EXCLUDED.physical_adherence_percent,
        daily_weight_kg = COALESCE(EXCLUDED.daily_weight_kg, adherence_logs.daily_weight_kg),
        extra_calories_consumed = EXCLUDED.extra_calories_consumed,
        adherence_level = EXCLUDED.adherence_level,
        updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [
      data.patientId, 
      data.logDate, 
      data.mealAdherencePercent, 
      data.physicalAdherencePercent, 
      data.dailyWeightKg, 
      data.extraCaloriesConsumed, 
      data.adherenceLevel
    ],
  );
  return mapRowToAdherenceLog(result.rows[0]);
}

export async function getAdherenceLogs(patientId: string, limit = 7): Promise<AdherenceLog[]> {
  const result = await pool.query(
    `SELECT * FROM adherence_logs WHERE patient_id = $1 ORDER BY log_date DESC LIMIT $2`,
    [patientId, limit]
  );
  return result.rows.map(mapRowToAdherenceLog);
}

export async function addExtraConsumption(data: Omit<ExtraConsumption, 'id' | 'createdAt'>): Promise<ExtraConsumption> {
  const result = await pool.query(
    `INSERT INTO extra_consumptions (patient_id, log_date, food_description, calories, image_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.patientId, data.logDate, data.foodDescription, data.calories, data.imageUrl]
  );
  const row = result.rows[0];
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    logDate: String(row.log_date).slice(0,10),
    foodDescription: String(row.food_description),
    calories: Number(row.calories),
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    createdAt: String(row.created_at)
  };
}

export async function getExtraConsumptions(patientId: string, limit = 10): Promise<ExtraConsumption[]> {
  const result = await pool.query(
    `SELECT * FROM extra_consumptions WHERE patient_id = $1 ORDER BY log_date DESC, created_at DESC LIMIT $2`,
    [patientId, limit]
  );
  return result.rows.map(row => ({
    id: String(row.id),
    patientId: String(row.patient_id),
    logDate: String(row.log_date).slice(0,10),
    foodDescription: String(row.food_description),
    calories: Number(row.calories),
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    createdAt: String(row.created_at)
  }));
}

function mapRowToAdherenceLog(row: any): AdherenceLog {
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    logDate: String(row.log_date).slice(0, 10),
    mealAdherencePercent: Number(row.meal_adherence_percent),
    physicalAdherencePercent: Number(row.physical_adherence_percent),
    dailyWeightKg: row.daily_weight_kg ? Number(row.daily_weight_kg) : undefined,
    extraCaloriesConsumed: Number(row.extra_calories_consumed),
    adherenceLevel: row.adherence_level as any,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
