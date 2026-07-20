import { useState } from 'react';
import {
  Activity,
  AlertCircle,
  Flame,
  Calendar,
  Filter,
  CheckCircle2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { usePlanDeviation } from '../hooks/usePlanDeviation';

interface PlanDeviationAnalysisPanelProps {
  patientId: string;
}

export function PlanDeviationAnalysisPanel({ patientId }: PlanDeviationAnalysisPanelProps) {
  const [periodDays, setPeriodDays] = useState<number>(7);
  const [onlyRelevant, setOnlyRelevant] = useState<boolean>(false);

  const { deviationSummary, isLoading, isFetching, refetch } = usePlanDeviation(
    patientId,
    periodDays,
  );

  if (isLoading) {
    return (
      <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm flex items-center justify-center min-h-[220px]">
        <div className="flex flex-col items-center gap-2 text-muted">
          <RefreshCw size={24} className="animate-spin text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Calculando desviaciones del plan nutricional...
          </span>
        </div>
      </div>
    );
  }

  const days = deviationSummary?.days || [];
  const averagePercentage = deviationSummary?.averageDeviationPercentage || 0;

  // Criterio de relevancia: Desviación >= 25% o >= 400 kcal
  const relevantDaysCount = days.filter(
    (d) => d.deviationPercentage >= 25 || d.deviationCalories >= 400,
  ).length;

  const filteredDays = onlyRelevant
    ? days.filter((d) => d.deviationPercentage >= 25 || d.deviationCalories >= 400)
    : days;

  // Indicador global
  const getDeviationLevelBadge = (percentage: number) => {
    if (percentage >= 25) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
          <AlertCircle size={15} /> Desviación Alta (Alerta Nutricional)
        </span>
      );
    }
    if (percentage >= 15) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <Activity size={15} /> Desviación Moderada (Atención)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 size={15} /> Desviación Baja (En Rango Permisible)
      </span>
    );
  };

  return (
    <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm space-y-6">
      {/* Header del Panel de Análisis */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Activity size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-black text-foreground">
                Análisis de Desviación del Plan Nutricional
              </h4>
              {getDeviationLevelBadge(averagePercentage)}
            </div>
            <p className="text-xs text-muted mt-1">
              Comparativa algorítmica entre calorías planificadas vs. consumos reales y adicionales para detectar incumplimientos.
            </p>
          </div>
        </div>

        {/* Controles: Selector de periodo y actualización */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-surface-hover rounded-xl border border-border p-1 text-xs font-bold">
            <button
              onClick={() => setPeriodDays(7)}
              className={`px-3 py-1 rounded-lg transition-all ${
                periodDays === 7 ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'
              }`}
            >
              7 Días
            </button>
            <button
              onClick={() => setPeriodDays(14)}
              className={`px-3 py-1 rounded-lg transition-all ${
                periodDays === 14 ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'
              }`}
            >
              14 Días
            </button>
            <button
              onClick={() => setPeriodDays(30)}
              className={`px-3 py-1 rounded-lg transition-all ${
                periodDays === 30 ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'
              }`}
            >
              30 Días
            </button>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-xl bg-surface-hover border border-border text-muted hover:text-foreground transition-all"
            title="Actualizar análisis"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin text-primary' : ''} />
          </button>
        </div>
      </div>

      {/* Barra de Resumen / Alertas de Desviaciones Relevantes */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-hover/80 border border-border">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            relevantDaysCount > 0 ? 'bg-red-500/15 text-red-500 animate-pulse' : 'bg-emerald-500/15 text-emerald-500'
          }`}>
            <AlertCircle size={20} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-foreground block">
              {relevantDaysCount > 0
                ? `¡Se detectaron ${relevantDaysCount} día(s) con desviaciones relevantes en el periodo!`
                : 'Excelente adherencia calórica en el periodo evaluado.'}
            </span>
            <span className="text-[11px] text-muted">
              {relevantDaysCount > 0
                ? 'Las desviaciones ≥ 25% o ≥ 400 kcal extra impactan el tratamiento y requieren ajuste o consejería.'
                : 'No se registran excesos significativos sobre el plan diario planificado.'}
            </span>
          </div>
        </div>

        {/* Subtarea 2: Botón de filtro para resaltar/enfocar desviaciones relevantes */}
        <button
          onClick={() => setOnlyRelevant(!onlyRelevant)}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border ${
            onlyRelevant
              ? 'bg-red-500 text-white border-red-600 shadow-md'
              : 'bg-surface hover:bg-surface-hover text-foreground border-border'
          }`}
          title="Filtra y resalta únicamente los días con incumplimiento crítico"
        >
          <Filter size={14} />
          {onlyRelevant ? 'Mostrando solo relevantes (Desactivar)' : `Resaltar desviaciones relevantes (${relevantDaysCount})`}
        </button>
      </div>

      {/* Subtarea 1 y 2: Grid o listado de días con indicador de desviación y resaltado de relevantes */}
      {filteredDays.length === 0 ? (
        <div className="py-12 text-center text-muted space-y-2">
          <Info size={32} className="mx-auto opacity-40" />
          <p className="text-sm font-semibold">
            {onlyRelevant
              ? 'No hay días con desviaciones relevantes en este periodo.'
              : 'No hay datos de consumo para evaluar en el periodo seleccionado.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDays.map((day) => {
            const isRelevant = day.deviationPercentage >= 25 || day.deviationCalories >= 400;
            const dateObj = new Date(day.date + 'T12:00:00');
            const formattedDate = dateObj.toLocaleDateString('es-ES', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            });

            return (
              <div
                key={day.date}
                className={`relative rounded-2xl p-4 transition-all border flex flex-col justify-between space-y-3 ${
                  isRelevant
                    ? 'bg-red-500/10 border-red-500/60 shadow-lg shadow-red-500/10 ring-1 ring-red-500/30'
                    : 'bg-surface-hover/50 border-border hover:border-border/80'
                }`}
              >
                {/* Etiqueta superior de relevancia si aplica */}
                {isRelevant && (
                  <div className="absolute -top-2.5 right-3 bg-red-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <AlertCircle size={10} /> Desviación Relevante
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-foreground capitalize flex items-center gap-1.5">
                    <Calendar size={13} className="text-muted" />
                    {formattedDate}
                  </span>
                  <span
                    className={`text-[11px] font-black px-2 py-0.5 rounded-lg border ${
                      day.deviationPercentage >= 25
                        ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
                        : day.deviationPercentage >= 15
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {day.deviationPercentage >= 25
                      ? 'Desv. Alta'
                      : day.deviationPercentage >= 15
                        ? 'Desv. Media'
                        : 'Desv. Baja'}
                  </span>
                </div>

                {/* Métricas de calorías planificadas vs consumidas */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted font-medium">Planificado:</span>
                    <span className="font-bold text-foreground">{day.plannedCalories} kcal</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted font-medium">Consumo Real:</span>
                    <span className="font-extrabold text-foreground">{day.consumedCalories} kcal</span>
                  </div>
                </div>

                {/* Diferencia y Porcentaje */}
                <div
                  className={`pt-2.5 border-t flex items-center justify-between font-black text-xs ${
                    isRelevant ? 'border-red-500/30 text-red-600 dark:text-red-400' : 'border-border text-foreground'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Flame size={14} className={isRelevant ? 'text-red-500' : 'text-amber-500'} />
                    Diferencia:
                  </span>
                  <span>
                    {day.deviationCalories > 0 ? `+${day.deviationCalories}` : day.deviationCalories} kcal (
                    {day.deviationPercentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
