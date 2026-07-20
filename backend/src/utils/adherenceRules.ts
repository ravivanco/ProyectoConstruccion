import { AdherenceLevel } from '../types/adherence.js';

export interface AdherenceClassificationRule {
  level: AdherenceLevel;
  minScore: number;
  maxScore: number;
  treatmentStatus: string;
  description: string;
}

export const ADHERENCE_CLASSIFICATION_RULES: AdherenceClassificationRule[] = [
  {
    level: 'alta',
    minScore: 80,
    maxScore: 100,
    treatmentStatus: 'Alta Adherencia',
    description: 'Cumplimiento consistente del plan nutricional y actividad física',
  },
  {
    level: 'media',
    minScore: 50,
    maxScore: 79,
    treatmentStatus: 'Media Adherencia',
    description: 'Cumplimiento parcial con desviaciones moderadas',
  },
  {
    level: 'baja',
    minScore: 0,
    maxScore: 49,
    treatmentStatus: 'Baja Adherencia',
    description: 'Bajo cumplimiento que requiere intervención del nutricionista',
  },
];

export function classifyScore(score: number): AdherenceClassificationRule {
  const normalized = Math.min(Math.max(Math.round(score), 0), 100);
  return (
    ADHERENCE_CLASSIFICATION_RULES.find(
      (rule) => normalized >= rule.minScore && normalized <= rule.maxScore,
    ) ?? ADHERENCE_CLASSIFICATION_RULES[2]
  );
}
