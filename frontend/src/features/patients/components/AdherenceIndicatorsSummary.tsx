import { useState } from 'react';
import {
  Target,
  RefreshCw,
  Utensils,
  Dumbbell,
  Weight,
  Flame,
  AlertCircle,
} from 'lucide-react';
import { useAdherenceIndicators } from '../hooks/useAdherenceIndicators';
import { AdherenceLevelBadge } from './AdherenceLevelBadge';
import { AdherenceTrafficLight } from './AdherenceTrafficLight';

interface AdherenceIndicatorsSummaryProps {
  patientId: string;
}

export function AdherenceIndicatorsSummary({ patientId }: AdherenceIndicatorsSummaryProps) {
  const [periodDays, setPeriodDays] = useState<number>(7);
  const { indicators, isLoading, isError, error, refetch, isFetching } = useAdherenceIndicators(
    patientId,
    periodDays,
  );

  if (isLoading) {
    return (
      <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm flex items-center justify-center min-h-[220px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-muted">Calculando indicadores de adherencia...</p>
        </div>
      </div>
    );
  }

  if (isError || !indicators) {
    return (
      <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm flex flex-col items-center justify-center text-center">
        <AlertCircle size={32} className="text-red-500 mb-2" />
        <h4 className="text-base font-bold text-foreground">Error al calcular indicadores</h4>
        <p className="text-xs text-muted max-w-sm mb-4">{error}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-gray-950 rounded-xl text-xs font-bold transition-all hover:brightness-110"
        >
          Reintentar cálculo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-3xl border border-border p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-colors space-y-6">
      {/* Cabecera y Selector de Periodo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
            <Target size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-foreground">
                Cálculo e Indicadores de Adherencia
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-extrabold border border-blue-500/20">
                EVALUACIÓN OBJETIVA
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Porcentaje general y desglose de cumplimiento de planes alimentarios y físicos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 bg-surface-hover p-1 rounded-xl border border-border text-xs font-bold">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setPeriodDays(days)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  periodDays === days
                    ? 'bg-primary text-gray-950 shadow-sm font-black'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {days} días
              </button>
            ))}
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 bg-surface hover:bg-surface-hover border border-border rounded-xl text-foreground text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Actualizar con nuevos registros"
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin text-primary' : ''} />
            <span className="hidden md:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Indicador Global y Desglose en Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
        {/* Tarjeta de Cumplimiento General */}
        <div className="lg:col-span-1 bg-gradient-to-br from-primary/15 via-surface-hover/80 to-purple-500/10 p-5 rounded-2xl border border-primary/25 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <span className="text-[11px] font-black uppercase tracking-wider text-muted mb-3">
            Cumplimiento General
          </span>
          <div className="relative w-28 h-28 flex items-center justify-center mb-3">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="46"
                className="stroke-border"
                strokeWidth="9"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r="46"
                className="stroke-primary"
                strokeWidth="9"
                strokeDasharray={289.02}
                strokeDashoffset={
                  289.02 - (289.02 * indicators.overallScore) / 100
                }
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-foreground">
                {indicators.overallScore}%
              </span>
              <span className="text-[10px] uppercase font-bold text-muted">
                Puntuación
              </span>
            </div>
          </div>
          <AdherenceLevelBadge score={indicators.overallScore} size="sm" showScore={false} />
        </div>

        {/* Barras de Desglose de Adherencia Específica */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Adherencia Alimentaria */}
          <div className="bg-surface-hover p-4.5 rounded-2xl border border-border transition-all hover:border-emerald-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Utensils size={16} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-foreground">
                    Adherencia Alimentaria
                  </h4>
                  <span className="text-[11px] text-muted font-medium">
                    Comidas consumidas / asignadas
                  </span>
                </div>
              </div>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {indicators.foodCompliancePercentage}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${indicators.foodCompliancePercentage}%` }}
              />
            </div>
          </div>

          {/* Adherencia Física */}
          <div className="bg-surface-hover p-4.5 rounded-2xl border border-border transition-all hover:border-blue-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Dumbbell size={16} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-foreground">
                    Adherencia Física
                  </h4>
                  <span className="text-[11px] text-muted font-medium">
                    Ejercicios completados (App Móvil)
                  </span>
                </div>
              </div>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                {indicators.exerciseCompliancePercentage}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${indicators.exerciseCompliancePercentage}%` }}
              />
            </div>
          </div>

          {/* Adherencia de Peso */}
          <div className="bg-surface-hover p-4.5 rounded-2xl border border-border transition-all hover:border-purple-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Weight size={16} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-foreground">
                    Registro de Peso Diario
                  </h4>
                  <span className="text-[11px] text-muted font-medium">
                    Días con control registrado
                  </span>
                </div>
              </div>
              <span className="text-lg font-black text-purple-600 dark:text-purple-400">
                {indicators.weightCompliancePercentage}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${indicators.weightCompliancePercentage}%` }}
              />
            </div>
          </div>

          {/* Adherencia de Control Calórico */}
          <div className="bg-surface-hover p-4.5 rounded-2xl border border-border transition-all hover:border-orange-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Flame size={16} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-foreground">
                    Cumplimiento Calórico
                  </h4>
                  <span className="text-[11px] text-muted font-medium">
                    Ajuste a la meta calórica diaria
                  </span>
                </div>
              </div>
              <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                {indicators.calorieAdherencePercentage}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${indicators.calorieAdherencePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Semáforo Visual de Cumplimiento / Nivel de Adherencia */}
      <AdherenceTrafficLight score={indicators.overallScore} />
    </div>
  );
}
