import { pool } from '../db/pool.js';
import {
  AlertClassification,
  AlertSeverity,
  AlertStatus,
  AlertType,
  CreateAlertInput,
  PatientAlert,
} from '../types/alert.js';
import {
  getAdherenceIndicators,
  getFoodCompliance,
  getPlanDeviation,
  getWeightMonitoring,
} from './adherenceRepository.js';

function mapRow(row: Record<string, unknown>): PatientAlert {
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    nutritionistId: row.nutritionist_id ? String(row.nutritionist_id) : undefined,
    alertType: String(row.alert_type) as AlertType,
    severity: String(row.severity) as AlertSeverity,
    classification: String(row.classification) as AlertClassification,
    title: String(row.title),
    message: String(row.message),
    status: String(row.status) as AlertStatus,
    triggeredDate: String(row.triggered_date).slice(0, 10),
    metadata: row.metadata ? (row.metadata as Record<string, unknown>) : undefined,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at ?? row.created_at)).toISOString(),
  };
}

export async function createAlert(input: CreateAlertInput): Promise<PatientAlert> {
  const result = await pool.query(
    `INSERT INTO patient_alerts (
      patient_id, nutritionist_id, alert_type, severity, classification,
      title, message, triggered_date, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::date, CURRENT_DATE), $9)
    RETURNING *`,
    [
      input.patientId,
      input.nutritionistId ?? null,
      input.alertType,
      input.severity ?? 'medium',
      input.classification ?? 'nutritional',
      input.title,
      input.message,
      input.triggeredDate ?? null,
      input.metadata ? JSON.stringify(input.metadata) : null,
    ],
  );
  return mapRow(result.rows[0]);
}

export async function listAlerts(filters: {
  patientId?: string;
  nutritionistId?: string;
  status?: AlertStatus;
}): Promise<PatientAlert[]> {
  const conditions: string[] = [];
  const values: string[] = [];
  let index = 1;

  if (filters.patientId) {
    conditions.push(`patient_id = $${index}`);
    values.push(filters.patientId);
    index += 1;
  }

  if (filters.nutritionistId) {
    conditions.push(`(nutritionist_id = $${index} OR nutritionist_id IS NULL)`);
    values.push(filters.nutritionistId);
    index += 1;
  }

  if (filters.status) {
    conditions.push(`status = $${index}`);
    values.push(filters.status);
    index += 1;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query(
    `SELECT * FROM patient_alerts ${whereClause} ORDER BY triggered_date DESC, created_at DESC`,
    values,
  );
  return result.rows.map(mapRow);
}

export async function findAlertById(id: string): Promise<PatientAlert | null> {
  const result = await pool.query('SELECT * FROM patient_alerts WHERE id = $1', [id]);
  return result.rowCount ? mapRow(result.rows[0]) : null;
}

export async function updateAlertStatus(
  id: string,
  status: AlertStatus,
): Promise<PatientAlert | null> {
  const result = await pool.query(
    `UPDATE patient_alerts SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, status],
  );
  return result.rowCount ? mapRow(result.rows[0]) : null;
}

export async function generateAutomaticAlerts(
  patientId: string,
  nutritionistId?: string,
): Promise<PatientAlert[]> {
  const [food, weight, planDeviation, indicators] = await Promise.all([
    getFoodCompliance(patientId, 1),
    getWeightMonitoring(patientId, 7),
    getPlanDeviation(patientId, 1),
    getAdherenceIndicators(patientId, 7),
  ]);

  const generated: PatientAlert[] = [];

  if (food.compliancePercentage < 60) {
    generated.push(await createAlert({
      patientId,
      nutritionistId,
      alertType: 'meal_missed',
      severity: food.compliancePercentage < 30 ? 'high' : 'medium',
      classification: 'behavioral',
      title: 'Comidas incompletas hoy',
      message: `El paciente registró ${food.mealsLogged} de ${food.mealsExpected} comidas esperadas.`,
      metadata: { compliancePercentage: food.compliancePercentage },
    }));
  }

  const todayDeviation = planDeviation.days.at(-1);
  if (todayDeviation && todayDeviation.deviationPercentage > 20) {
    const isExcess = todayDeviation.deviationCalories > 0;
    generated.push(await createAlert({
      patientId,
      nutritionistId,
      alertType: isExcess ? 'calorie_excess' : 'calorie_deficit',
      severity: todayDeviation.deviationPercentage > 40 ? 'high' : 'medium',
      classification: 'nutritional',
      title: isExcess ? 'Exceso calórico detectado' : 'Déficit calórico detectado',
      message: `Desviación de ${todayDeviation.deviationPercentage}% respecto al plan (${todayDeviation.deviationCalories} kcal).`,
      metadata: { ...todayDeviation },
    }));
  }

  if (weight.weightChangeKg !== undefined && Math.abs(weight.weightChangeKg) >= 2) {
    generated.push(await createAlert({
      patientId,
      nutritionistId,
      alertType: 'weight_anomaly',
      severity: Math.abs(weight.weightChangeKg) >= 3 ? 'critical' : 'high',
      classification: 'clinical',
      title: 'Variación de peso significativa',
      message: `Cambio de ${weight.weightChangeKg} kg entre los últimos registros.`,
      metadata: { weightChangeKg: weight.weightChangeKg },
    }));
  }

  if (indicators.exerciseCompliancePercentage < 50) {
    generated.push(await createAlert({
      patientId,
      nutritionistId,
      alertType: 'exercise_missed',
      severity: 'medium',
      classification: 'behavioral',
      title: 'Bajo cumplimiento de ejercicio',
      message: `Cumplimiento físico del ${indicators.exerciseCompliancePercentage}% en la última semana.`,
      metadata: { exerciseCompliancePercentage: indicators.exerciseCompliancePercentage },
    }));
  }

  if (indicators.overallScore < 50) {
    generated.push(await createAlert({
      patientId,
      nutritionistId,
      alertType: 'plan_deviation',
      severity: 'high',
      classification: 'nutritional',
      title: 'Adherencia general baja',
      message: `Puntaje global de adherencia: ${indicators.overallScore}%.`,
      metadata: { overallScore: indicators.overallScore },
    }));
  }

  return generated;
}
