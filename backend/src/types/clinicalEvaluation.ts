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
