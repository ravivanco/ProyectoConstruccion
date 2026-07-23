import { useState, useEffect } from 'react';
import { adherenceApi, type AdherenceSummary } from '../services/adherenceApi';
import { Activity, Apple, Dumbbell, AlertTriangle, Info } from 'lucide-react';

interface Props {
  patientId: string;
}

export function AdherencePanel({ patientId }: Props) {
  const [summary, setSummary] = useState<AdherenceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await adherenceApi.getSummary(patientId);
      setSummary(data);
      setIsLoading(false);
    };
    if (patientId) {
      loadData();
    }
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="bg-surface rounded-3xl border border-border p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] text-center py-10 mt-6">
        <p className="text-muted text-sm">Cargando datos de adherencia...</p>
      </div>
    );
  }

  if (!summary || (summary.logs.length === 0 && summary.extraConsumptions.length === 0)) {
    return (
      <div className="bg-surface rounded-3xl border border-border p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] mt-6">
        <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
          <Activity size={20} className="text-primary" />
          Cumplimiento y Adherencia (Sprint 5)
        </h3>
        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-border bg-surface-hover/50 rounded-2xl">
          <Info size={40} className="text-muted mb-4 opacity-50" />
          <p className="text-foreground font-bold">Sin registros de adherencia</p>
          <p className="text-muted text-sm mt-1 max-w-sm text-center">El paciente aún no ha registrado datos de cumplimiento alimentario o físico en la app móvil.</p>
        </div>
      </div>
    );
  }

  // Tomamos el registro más reciente para mostrar el porcentaje actual
  const latestLog = summary.logs[0];

  return (
    <div className="bg-surface rounded-3xl border border-border p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] mt-6">
      <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
        <Activity size={20} className="text-primary" />
        Cumplimiento y Adherencia (Sprint 5)
      </h3>
      
      {latestLog && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-surface-hover p-4 rounded-2xl border border-border transition-colors">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 text-muted">
                <Apple size={16} className="text-green-500"/>
                <span className="text-xs font-semibold">Alimentación</span>
              </div>
              <span className="text-xs text-muted">{latestLog.logDate}</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-extrabold text-foreground">{latestLog.mealAdherencePercent}%</p>
            </div>
            <div className="w-full bg-border h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className={`h-full rounded-full ${latestLog.mealAdherencePercent >= 80 ? 'bg-green-500' : latestLog.mealAdherencePercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${latestLog.mealAdherencePercent}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-surface-hover p-4 rounded-2xl border border-border transition-colors">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 text-muted">
                <Dumbbell size={16} className="text-purple-500"/>
                <span className="text-xs font-semibold">Actividad Física</span>
              </div>
              <span className="text-xs text-muted">{latestLog.logDate}</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-extrabold text-foreground">{latestLog.physicalAdherencePercent}%</p>
            </div>
            <div className="w-full bg-border h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className={`h-full rounded-full ${latestLog.physicalAdherencePercent >= 80 ? 'bg-purple-500' : latestLog.physicalAdherencePercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${latestLog.physicalAdherencePercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {summary.extraConsumptions.length > 0 && (
        <div className="mt-8 border-t border-border pt-6">
           <h4 className="text-[14px] font-bold text-foreground border-b border-border pb-2 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" />
            Consumos Fuera del Plan
          </h4>
          <div className="space-y-3">
            {summary.extraConsumptions.map(extra => (
              <div key={extra.id} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                <div>
                  <p className="text-[13px] font-bold text-foreground">{extra.foodDescription}</p>
                  <p className="text-[11px] text-muted">{extra.logDate}</p>
                </div>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20 px-2 py-1 rounded-md">
                  +{extra.calories} kcal
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
