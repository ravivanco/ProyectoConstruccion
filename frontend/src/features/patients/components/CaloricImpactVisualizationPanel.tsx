import { useState } from 'react';
import {
  BarChart2,
  Flame,
  Target,
  Activity,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Calendar,
  Info,
  Award,
} from 'lucide-react';
import { usePlanDeviation } from '../hooks/usePlanDeviation';

interface CaloricImpactVisualizationPanelProps {
  patientId: string;
}

export function CaloricImpactVisualizationPanel({
  patientId,
}: CaloricImpactVisualizationPanelProps) {
  const [periodDays, setPeriodDays] = useState<number>(7);

  const { deviationSummary, isLoading, isFetching, refetch } = usePlanDeviation(
    patientId,
    periodDays,
  );

  if (isLoading) {
    return (
      <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3 text-muted">
          <RefreshCw size={28} className="animate-spin text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Calculando impacto calórico y comparativa del plan...
          </span>
        </div>
      </div>
    );
  }

  const days = deviationSummary?.days || [];

  // Cálculos globales de impacto calórico en el periodo
  const totalPlanned = days.reduce((sum, d) => sum + d.plannedCalories, 0);
  const totalConsumed = days.reduce((sum, d) => sum + d.consumedCalories, 0);
  const totalImpactCalories = totalConsumed - totalPlanned;
  const impactPercentage = totalPlanned > 0
    ? Math.round((totalImpactCalories / totalPlanned) * 100)
    : 0;

  // Encontrar el día con mayor impacto calórico (pico adicional)
  const maxImpactDay = days.length
    ? [...days].sort((a, b) => b.deviationCalories - a.deviationCalories)[0]
    : null;

  // Determinar nivel y color de impacto
  const getImpactStatus = (percentage: number) => {
    if (percentage > 20) {
      return {
        label: 'Impacto Calórico Crítico (Exceso Significativo)',
        colorText: 'text-red-500',
        colorBg: 'bg-red-500/15',
        colorBorder: 'border-red-500/30',
        colorBar: 'bg-red-500',
        alertMsg:
          'El consumo adicional está aportando un exceso calórico superior al 20% sobre la dieta planificada, comprometiendo seriamente el déficit o mantenimiento calórico.',
      };
    }
    if (percentage > 10) {
      return {
        label: 'Impacto Calórico Moderado (Atención Recomendada)',
        colorText: 'text-amber-500',
        colorBg: 'bg-amber-500/15',
        colorBorder: 'border-amber-500/30',
        colorBar: 'bg-amber-500',
        alertMsg:
          'El aporte calórico extra ronda entre 10% y 20% por encima de la meta. Se sugiere reforzar la adherencia al plan en las próximas consultas.',
      };
    }
    if (percentage < -10) {
      return {
        label: 'Déficit Calórico por Debajo del Plan',
        colorText: 'text-blue-500',
        colorBg: 'bg-blue-500/15',
        colorBorder: 'border-blue-500/30',
        colorBar: 'bg-blue-500',
        alertMsg:
          'El paciente ha consumido menos calorías de las planificadas en el periodo evaluado.',
      };
    }
    return {
      label: 'Impacto Calórico Bajo / En Rango Óptimo',
      colorText: 'text-emerald-500',
      colorBg: 'bg-emerald-500/15',
      colorBorder: 'border-emerald-500/30',
      colorBar: 'bg-emerald-500',
      alertMsg:
        'El consumo calórico total se mantiene estrictamente alineado al plan nutricional asignado sin impacto negativo por consumos adicionales.',
    };
  };

  const status = getImpactStatus(impactPercentage);

  // Cálculo del máximo valor para escalar barras en la comparativa de gráfico
  const maxDailyValue = days.reduce(
    (max, d) => Math.max(max, d.plannedCalories, d.consumedCalories),
    2500,
  );

  return (
    <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 shadow-sm space-y-8">
      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
            <BarChart2 size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-lg font-black text-foreground">
                Visualización y Medidor de Impacto Calórico
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${status.colorBg} ${status.colorText} ${status.colorBorder}`}
              >
                {impactPercentage > 10 ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                {status.label}
              </span>
            </div>
            <p className="text-xs text-muted mt-1 max-w-2xl">
              Análisis cuantitativo de cómo los consumos adicionales repercuten en el balance energético y comparativa detallada día a día.
            </p>
          </div>
        </div>

        {/* Controles del periodo */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-surface-hover rounded-xl border border-border p-1 text-xs font-bold">
            <button
              onClick={() => setPeriodDays(7)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                periodDays === 7 ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'
              }`}
            >
              7 Días
            </button>
            <button
              onClick={() => setPeriodDays(14)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                periodDays === 14 ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'
              }`}
            >
              14 Días
            </button>
            <button
              onClick={() => setPeriodDays(30)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
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
            title="Refrescar datos calóricos"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin text-primary' : ''} />
          </button>
        </div>
      </div>

      {/* Subtarea 1: [WEB] Mostrar impacto calórico (Tarjetas de métricas + Termómetro visual) */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface-hover/60 p-5 rounded-2xl border border-border flex flex-col justify-between space-y-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Target size={14} className="text-blue-500" /> Total Planificado ({periodDays}d)
            </span>
            <span className="text-2xl font-black text-foreground">
              {totalPlanned.toLocaleString()} <span className="text-xs font-normal text-muted">kcal</span>
            </span>
            <span className="text-[11px] text-muted">Meta calórica acumulada base</span>
          </div>

          <div className="bg-surface-hover/60 p-5 rounded-2xl border border-border flex flex-col justify-between space-y-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Flame size={14} className="text-amber-500" /> Consumo Adicional (Impacto)
            </span>
            <span className={`text-2xl font-black ${totalImpactCalories > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'}`}>
              {totalImpactCalories > 0 ? `+${totalImpactCalories.toLocaleString()}` : totalImpactCalories.toLocaleString()}{' '}
              <span className="text-xs font-normal text-muted">kcal extra</span>
            </span>
            <span className="text-[11px] text-muted">Aporte por registros fuera de plan</span>
          </div>

          <div className="bg-surface-hover/60 p-5 rounded-2xl border border-border flex flex-col justify-between space-y-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={14} className="text-primary" /> Total Consumido Real
            </span>
            <span className="text-2xl font-black text-foreground">
              {totalConsumed.toLocaleString()} <span className="text-xs font-normal text-muted">kcal</span>
            </span>
            <span className="text-[11px] text-muted">Ingesta real total medida</span>
          </div>

          <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-2 ${status.colorBg} ${status.colorBorder}`}>
            <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-foreground">
              <Award size={14} className={status.colorText} /> Índice de Impacto Calórico
            </span>
            <span className={`text-3xl font-black ${status.colorText}`}>
              {impactPercentage > 0 ? `+${impactPercentage}%` : `${impactPercentage}%`}
            </span>
            <span className="text-[11px] font-medium text-foreground/80">
              {impactPercentage > 10 ? 'Sobrecarga sobre meta' : 'Cumplimiento en rango'}
            </span>
          </div>
        </div>

        {/* Termómetro visual de Impacto Calórico */}
        <div className="bg-surface-hover/40 p-6 rounded-2xl border border-border space-y-3">
          <div className="flex items-center justify-between text-xs font-extrabold text-foreground">
            <span className="flex items-center gap-2">
              <Flame size={15} className="text-amber-500" />
              Termómetro de Impacto Calórico en Balance Energético
            </span>
            <span className="text-muted">
              Planificado: 100% | Consumo actual: {Math.max(100 + impactPercentage, 0)}%
            </span>
          </div>

          <div className="relative w-full h-6 rounded-full bg-border/40 overflow-hidden flex">
            {/* Parte del plan base (máx 100% visual) */}
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500 flex items-center justify-center text-[10px] font-black text-white"
              style={{ width: `${Math.min((totalPlanned / Math.max(totalConsumed, totalPlanned)) * 100, 100)}%` }}
            >
              Meta Base
            </div>
            {/* Parte del impacto adicional extra */}
            {totalImpactCalories > 0 && (
              <div
                className={`h-full ${status.colorBar} transition-all duration-500 flex items-center justify-center text-[10px] font-black text-white animate-pulse`}
                style={{ width: `${Math.min((totalImpactCalories / Math.max(totalConsumed, totalPlanned)) * 100, 100)}%` }}
              >
                +{totalImpactCalories} kcal extra
              </div>
            )}
          </div>

          <p className="text-xs text-muted font-medium flex items-center gap-2 pt-1">
            <Info size={14} className="text-primary shrink-0" />
            {status.alertMsg}
          </p>
        </div>
      </div>

      {/* Subtarea 2: [WEB] Comparar planificado vs consumido (Gráfico CSS y Tabla Día a Día) */}
      <div className="space-y-5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-base font-black text-foreground flex items-center gap-2">
              <BarChart2 size={18} className="text-primary" />
              Comparativa Gráfica Día a Día: Planificado vs. Consumido
            </h4>
            <p className="text-xs text-muted">
              Observa las variaciones diarias y detecta exactamente en qué fechas ocurrió el exceso calórico
            </p>
          </div>
          {maxImpactDay && (
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertCircle size={13} />
              Pico máximo: {maxImpactDay.date} (+{maxImpactDay.deviationCalories} kcal)
            </div>
          )}
        </div>

        {/* Visualización Gráfica en CSS (Bar Chart apilado de comparación) */}
        {days.length === 0 ? (
          <div className="py-12 text-center text-muted">No hay datos suficientes para graficar el periodo.</div>
        ) : (
          <div className="bg-surface-hover/30 p-6 rounded-3xl border border-border space-y-6">
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-64 pt-6 pb-2 px-2 border-b border-border">
              {days.map((day) => {
                const plannedHeight = Math.round((day.plannedCalories / maxDailyValue) * 100);
                const consumedHeight = Math.round((day.consumedCalories / maxDailyValue) * 100);
                const isOver = day.consumedCalories > day.plannedCalories;
                const dateObj = new Date(day.date + 'T12:00:00');
                const dayLabel = dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });

                return (
                  <div key={day.date} className="flex flex-col items-center gap-2 h-full justify-end group">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-24 bg-gray-900 text-white text-[11px] p-2.5 rounded-xl shadow-xl pointer-events-none z-10 w-44 space-y-1 border border-white/10">
                      <div className="font-black border-b border-white/10 pb-1">{day.date}</div>
                      <div className="flex justify-between">
                        <span className="text-blue-300">Planificado:</span>
                        <span className="font-bold">{day.plannedCalories} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isOver ? 'text-amber-300' : 'text-emerald-300'}>Consumido:</span>
                        <span className="font-bold">{day.consumedCalories} kcal</span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-1 font-black">
                        <span>Impacto:</span>
                        <span className={day.deviationCalories > 0 ? 'text-red-400' : 'text-emerald-400'}>
                          {day.deviationCalories > 0 ? `+${day.deviationCalories}` : day.deviationCalories} kcal
                        </span>
                      </div>
                    </div>

                    {/* Contenedor par de barras */}
                    <div className="flex items-end gap-1.5 w-full justify-center h-48">
                      {/* Barra Planificado */}
                      <div
                        className="w-3.5 sm:w-5 bg-blue-500/80 rounded-t-lg transition-all group-hover:bg-blue-500 shadow-sm relative"
                        style={{ height: `${Math.max(plannedHeight, 5)}%` }}
                        title={`Planificado: ${day.plannedCalories} kcal`}
                      />
                      {/* Barra Consumido */}
                      <div
                        className={`w-3.5 sm:w-5 rounded-t-lg transition-all shadow-sm relative ${
                          isOver
                            ? 'bg-amber-500 group-hover:bg-amber-600'
                            : 'bg-emerald-500 group-hover:bg-emerald-600'
                        }`}
                        style={{ height: `${Math.max(consumedHeight, 5)}%` }}
                        title={`Consumido: ${day.consumedCalories} kcal`}
                      />
                    </div>

                    {/* Etiqueta inferior del día */}
                    <span className="text-[10px] font-extrabold text-muted uppercase tracking-tighter truncate w-full text-center">
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Leyenda de la gráfica */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-muted">
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-blue-500/80 block" /> Calorías Planificadas (Meta)
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500 block" /> Consumo en o bajo el plan
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-amber-500 block" /> Consumo que excede la meta (Impacto Adicional)
              </span>
            </div>
          </div>
        )}

        {/* Tabla Comparativa Detallada */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="p-4 bg-surface-hover/50 border-b border-border flex items-center justify-between">
            <h5 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
              <Calendar size={14} className="text-muted" /> Desglose Comparativo de Impacto por Día
            </h5>
            <span className="text-xs font-bold text-muted">{days.length} días analizados</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-hover/30 text-[11px] font-extrabold text-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4 text-right">Meta Planificada</th>
                  <th className="py-3 px-4 text-right">Consumo Real</th>
                  <th className="py-3 px-4 text-right">Impacto Adicional</th>
                  <th className="py-3 px-4 text-center">Nivel de Exceso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {days.map((day) => {
                  const isOver = day.consumedCalories > day.plannedCalories;
                  return (
                    <tr key={day.date} className="hover:bg-surface-hover/40 transition-colors font-medium">
                      <td className="py-3 px-4 font-bold text-foreground">{day.date}</td>
                      <td className="py-3 px-4 text-right text-muted">{day.plannedCalories} kcal</td>
                      <td className="py-3 px-4 text-right font-extrabold text-foreground">
                        {day.consumedCalories} kcal
                      </td>
                      <td className={`py-3 px-4 text-right font-black ${isOver ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'}`}>
                        {day.deviationCalories > 0 ? `+${day.deviationCalories}` : day.deviationCalories} kcal ({day.deviationPercentage}%)
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                            day.deviationPercentage > 25
                              ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
                              : day.deviationPercentage > 15
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {day.deviationPercentage > 25
                            ? 'Crítico (>25%)'
                            : day.deviationPercentage > 15
                              ? 'Moderado'
                              : 'Óptimo'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
