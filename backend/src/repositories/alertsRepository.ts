import { pool } from '../db/pool.js';

export interface Alert {
  id: string;
  patientId: string;
  type: 'ADHERENCIA' | 'PESO' | 'EXCESO_CALORICO' | 'INACTIVIDAD';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  isResolved: boolean;
  createdAt?: string;
  resolvedAt?: string;
}

export async function createAlert(data: Omit<Alert, 'id' | 'isResolved' | 'createdAt' | 'resolvedAt'>): Promise<Alert> {
  const result = await pool.query(
    `INSERT INTO alerts (patient_id, type, severity, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.patientId, data.type, data.severity, data.message],
  );
  return mapRowToAlert(result.rows[0]);
}

export async function getActiveAlerts(): Promise<Alert[]> {
  const result = await pool.query(
    `SELECT * FROM alerts WHERE is_resolved = FALSE ORDER BY created_at DESC`
  );
  return result.rows.map(mapRowToAlert);
}

export async function resolveAlert(id: string): Promise<Alert | null> {
  const result = await pool.query(
    `UPDATE alerts 
     SET is_resolved = TRUE, resolved_at = CURRENT_TIMESTAMP 
     WHERE id = $1 
     RETURNING *`,
    [id]
  );
  if (!result.rowCount) return null;
  return mapRowToAlert(result.rows[0]);
}

function mapRowToAlert(row: any): Alert {
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    type: row.type as any,
    severity: row.severity as any,
    message: String(row.message),
    isResolved: Boolean(row.is_resolved),
    createdAt: String(row.created_at),
    resolvedAt: row.resolved_at ? String(row.resolved_at) : undefined,
  };
}
