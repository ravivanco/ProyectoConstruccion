export interface ClinicalEvaluation {
  id: string;
  patientId: string;
  nutritionistId: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  bodyFatPercentage?: number;
  waistCm?: number;
  notes?: string;
  evaluationDate: string;
  createdAt: string;
}

export interface CreateClinicalEvaluationInput {
  patientId: string;
  weightKg: number;
  heightCm: number;
  bodyFatPercentage?: number;
  waistCm?: number;
  notes?: string;
  evaluationDate?: string;
}

export function calculateBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(2));
}
