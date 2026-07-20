import { AlertClassification, AlertType } from '../types/alert.js';

export interface AlertRule {
  alertType: AlertType;
  classification: AlertClassification;
  defaultSeverity: 'low' | 'medium' | 'high' | 'critical';
  trigger: string;
  description: string;
}

export const ALERT_RULES: AlertRule[] = [
  {
    alertType: 'meal_missed',
    classification: 'behavioral',
    defaultSeverity: 'medium',
    trigger: 'foodCompliancePercentage < 60 en el día actual',
    description: 'El paciente no registró todas las comidas planificadas',
  },
  {
    alertType: 'meal_alert',
    classification: 'behavioral',
    defaultSeverity: 'medium',
    trigger: 'Hora sugerida de comida superada sin registro',
    description: 'Alerta por tiempo de comida no registrado según horario',
  },
  {
    alertType: 'calorie_excess',
    classification: 'nutritional',
    defaultSeverity: 'high',
    trigger: 'desviación calórica positiva > 20%',
    description: 'Consumo superior al plan nutricional',
  },
  {
    alertType: 'calorie_deficit',
    classification: 'nutritional',
    defaultSeverity: 'medium',
    trigger: 'desviación calórica negativa > 20%',
    description: 'Consumo inferior al plan nutricional',
  },
  {
    alertType: 'weight_anomaly',
    classification: 'clinical',
    defaultSeverity: 'high',
    trigger: 'cambio de peso >= 2 kg entre registros',
    description: 'Variación de peso fuera del rango esperado',
  },
  {
    alertType: 'exercise_missed',
    classification: 'behavioral',
    defaultSeverity: 'medium',
    trigger: 'exerciseCompliancePercentage < 50 semanal',
    description: 'Bajo cumplimiento de actividad física',
  },
  {
    alertType: 'plan_deviation',
    classification: 'nutritional',
    defaultSeverity: 'high',
    trigger: 'overallScore < 50',
    description: 'Adherencia global baja al plan',
  },
  {
    alertType: 'additional_intake',
    classification: 'nutritional',
    defaultSeverity: 'low',
    trigger: 'consumo adicional confirmado con impacto calórico',
    description: 'Alimentos adicionales que afectan la meta diaria',
  },
];
