import { useState } from 'react';
import { Activity, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clinicalEvaluationAPI, type CompareResult } from '../services/clinicalEvaluationApi';
import type { ClinicalEvaluation } from '../types';

interface ClinicalComparePanelProps {
  patientId: string;
  evaluations: ClinicalEvaluation[];
}

export function ClinicalComparePanel({ patientId, evaluations }: ClinicalComparePanelProps) {
  const [baseId, setBaseId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!baseId || !targetId) {
      setError('Debes seleccionar dos evaluaciones para comparar');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await clinicalEvaluationAPI.compare(patientId, baseId, targetId);
      setCompareResult(result);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al comparar evaluaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDelta = (value: number | null | undefined, unit: string) => {
    if (value == null) return <span className="text-muted text-sm">-</span>;
    
    if (value > 0) {
      return (
        <span className="flex items-center gap-1 text-red-500 font-bold text-sm">
          <TrendingUp size={14} /> +{value} {unit}
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="flex items-center gap-1 text-emerald-500 font-bold text-sm">
          <TrendingDown size={14} /> {value} {unit}
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 text-slate-500 font-bold text-sm">
          <Minus size={14} /> {value} {unit}
        </span>
      );
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <Activity size={20} className="text-primary" />
        Comparación de Evaluaciones
      </h3>

      {evaluations.length < 2 ? (
        <p className="text-sm text-muted">Se requieren al menos 2 evaluaciones para comparar.</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Evaluación Base (Anterior)</label>
              <select 
                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={baseId}
                onChange={(e) => setBaseId(e.target.value)}
              >
                <option value="">Seleccione...</option>
                {evaluations.map(e => (
                  <option key={e.id} value={e.id}>
                    {new Date(e.date).toLocaleDateString()} - {e.weight} kg
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-center pb-3">
              <ArrowRight size={20} className="text-muted" />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Evaluación Actual</label>
              <select 
                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
              >
                <option value="">Seleccione...</option>
                {evaluations.map(e => (
                  <option key={e.id} value={e.id}>
                    {new Date(e.date).toLocaleDateString()} - {e.weight} kg
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button 
            onClick={handleCompare}
            disabled={isLoading || !baseId || !targetId}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Calculando diferencias...' : 'Comparar'}
          </button>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          {compareResult && (
            <div className="mt-6 border-t border-border pt-6">
              <h4 className="text-sm font-bold text-foreground mb-4">Resultados (Diferencias)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-hover p-4 rounded-xl border border-border text-center">
                  <p className="text-xs text-muted mb-1">Peso</p>
                  {renderDelta(compareResult.differences.weightKg, 'kg')}
                </div>
                <div className="bg-surface-hover p-4 rounded-xl border border-border text-center">
                  <p className="text-xs text-muted mb-1">Grasa Corporal</p>
                  {renderDelta(compareResult.differences.bodyFatPercentage, '%')}
                </div>
                <div className="bg-surface-hover p-4 rounded-xl border border-border text-center">
                  <p className="text-xs text-muted mb-1">Masa Muscular</p>
                  {renderDelta(compareResult.differences.muscleMassPercentage, '%')}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
