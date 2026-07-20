import { TreatmentStatus } from './patient.js';

export type AdherenceLevel = 'alta' | 'media' | 'baja';

export interface FoodComplianceSummary {
  patientId: string;
  periodDays: number;
  expectedMealsPerDay: number;
  daysTracked: number;
  mealsLogged: number;
  mealsExpected: number;
  compliancePercentage: number;
  missingMealTypes: string[];
}

export interface ExerciseComplianceSummary {
  patientId: string;
  periodDays: number;
  scheduledSessions: number;
  completedSessions: number;
  compliancePercentage: number;
  missedDates: string[];
}

export interface WeightMonitoringSummary {
  patientId: string;
  periodDays: number;
  daysWithRecords: number;
  compliancePercentage: number;
  latestWeightKg?: number;
  previousWeightKg?: number;
  weightChangeKg?: number;
  records: Array<{ date: string; weightKg: number }>;
}

export interface AdditionalIntakeSummary {
  patientId: string;
  periodDays: number;
  totalEntries: number;
  totalCalories: number;
  entries: Array<{
    id: string;
    foodName: string;
    calories: number;
    logDate: string;
    imageUrl?: string;
    status?: string;
  }>;
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

export interface AdherenceIndicators {
  patientId: string;
  periodDays: number;
  foodCompliancePercentage: number;
  exerciseCompliancePercentage: number;
  weightCompliancePercentage: number;
  calorieAdherencePercentage: number;
  overallScore: number;
}

export interface AdherenceLevelSummary {
  patientId: string;
  level: AdherenceLevel;
  treatmentStatus: TreatmentStatus;
  overallScore: number;
  indicators: AdherenceIndicators;
}

export interface PatientAdherenceOverview {
  patientId: string;
  periodDays: number;
  indicators: AdherenceIndicators;
  level: AdherenceLevelSummary;
  foodCompliance: FoodComplianceSummary;
  exerciseCompliance: ExerciseComplianceSummary;
  weightMonitoring: WeightMonitoringSummary;
  additionalIntake: AdditionalIntakeSummary;
  planDeviation: PlanDeviationSummary;
}
