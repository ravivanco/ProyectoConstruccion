export type GeneralState = 'Alta Adherencia' | 'Media Adherencia' | 'Baja Adherencia';

export interface Patient {
  id: string;
  name: string;
  email: string;
  generalState: GeneralState | 'Pendiente';
  treatmentState?: 'Pendiente' | 'Activo' | 'Suspendido' | 'Finalizado';
  lastVisit?: string;
}

export interface ClinicalEvaluation {
  id: string;
  date: string;
  weight: number;
  height: number;
  bodyFat: number;
  muscleMass: number;
}

export interface PatientDetail {
  id: string;
  name: string;
  email: string;
  generalState: GeneralState | 'Pendiente';
  treatmentState: 'Pendiente' | 'Activo' | 'Suspendido' | 'Finalizado';
  lastVisit: string;
  phone: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  isProfileCompleted: boolean;
  notes?: string;
  medicalConditions?: string[];
  allergies?: string[];
  preferences?: string[];
  restrictions?: string[];
  objective?: string;
  evaluations?: ClinicalEvaluation[];
  isPlanLocked?: boolean;
}

export type MealStatus = 'completed' | 'missed' | 'pending';

export interface MealItem {
  id: string;
  mealType: 'desayuno' | 'almuerzo' | 'cena' | 'colacion_1' | 'colacion_2';
  name: string;
  scheduledTime: string;
  status: MealStatus;
  loggedAt?: string;
  estimatedCalories: number;
  consumedCalories?: number;
  notes?: string;
  photoUrl?: string;
}

export interface DailyMealCompliance {
  patientId: string;
  date: string;
  totalAssigned: number;
  completedCount: number;
  missedCount: number;
  pendingCount: number;
  complianceRate: number;
  meals: MealItem[];
}

export type ExerciseItemStatus = 'completed' | 'missed' | 'pending';

export interface ExerciseComplianceItem {
  id: string;
  name: string;
  category: string;
  muscleGroup?: string;
  scheduledTime: string;
  durationMinutes: number;
  caloriesBurned?: number;
  status: ExerciseItemStatus;
  loggedAt?: string;
  notes?: string;
  source: 'mobile_app' | 'manual';
}

export interface DailyPhysicalCompliance {
  patientId: string;
  date: string;
  totalAssigned: number;
  completedCount: number;
  missedCount: number;
  pendingCount: number;
  complianceRate: number;
  totalDurationMinutes: number;
  totalCaloriesBurned: number;
  exercises: ExerciseComplianceItem[];
}

export interface AdherenceIndicators {
  patientId: string;
  periodDays: number;
  foodCompliancePercentage: number;
  exerciseCompliancePercentage: number;
  weightCompliancePercentage: number;
  calorieAdherencePercentage: number;
  overallScore: number;
}

export interface WeightLog {
  id: string;
  patientId: string;
  weightKg: number;
  logDate: string;
  notes?: string;
  createdAt?: string;
}

export interface WeightChartResponse {
  patientId: string;
  points: Array<{ date: string; weightKg: number }>;
  summary: {
    latestWeightKg: number | null;
    minWeightKg: number;
    maxWeightKg: number;
    changeKg: number;
    trend: 'up' | 'down' | 'stable';
    daysTracked: number;
  };
}

export interface AdditionalFoodLog {
  id: string;
  patientId: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity?: string;
  logDate: string;
  notes?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanDeviationDay {
  date: string;
  plannedCalories: number;
  consumedCalories: number;
  deviationCalories: number;
  deviationPercentage: number;
}

export interface PlanDeviationSummary {
  patientId: string;
  periodDays: number;
  averageDeviationPercentage: number;
  days: PlanDeviationDay[];
}

export type AlertType =
  | 'meal_missed'
  | 'calorie_excess'
  | 'calorie_deficit'
  | 'weight_anomaly'
  | 'weight_plateau'
  | 'weight_change'
  | 'weight_target_missed'
  | 'exercise_missed'
  | 'plan_deviation'
  | 'additional_intake';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertClassification = 'nutritional' | 'behavioral' | 'clinical' | 'adherence' | 'weight' | 'additional_consumption';
export type AlertStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

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
  createdAt?: string;
  updatedAt?: string;
}
