export const ALERT_TYPES = [
  'meal_missed',
  'calorie_excess',
  'calorie_deficit',
  'weight_anomaly',
  'exercise_missed',
  'plan_deviation',
  'additional_intake',
] as const;

export type AlertType = (typeof ALERT_TYPES)[number];

export const ALERT_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

export const ALERT_CLASSIFICATIONS = ['nutritional', 'behavioral', 'clinical'] as const;
export type AlertClassification = (typeof ALERT_CLASSIFICATIONS)[number];

export const ALERT_STATUSES = ['pending', 'reviewed', 'resolved', 'dismissed'] as const;
export type AlertStatus = (typeof ALERT_STATUSES)[number];

export interface PatientAlert {
  id: string;
  patientId: string;
  nutritionistId?: string;
  alertType: AlertType;
  severity: AlertSeverity;
  classification: AlertClassification;
  title: string;
  message: string;
  status: AlertStatus;
  triggeredDate: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlertInput {
  patientId: string;
  nutritionistId?: string;
  alertType: AlertType;
  severity?: AlertSeverity;
  classification?: AlertClassification;
  title: string;
  message: string;
  triggeredDate?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateAlertStatusInput {
  status: AlertStatus;
}
