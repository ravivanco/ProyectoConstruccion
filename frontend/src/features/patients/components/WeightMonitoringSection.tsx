import { useState } from 'react';
import {
  Weight,
  Activity,
  Calendar,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { useWeightChart, useWeightLogs } from '../hooks/useWeightRecords';

interface WeightMonitoringSectionProps {
  patientId: string;
}

export function WeightMonitoringSection({ patientId }: WeightMonitoringSectionProps) {
  const [days, setDays] = useState<number>(30);
  const [viewMode, setViewMode] = useState<'both' | 'chart' | 'history'>('both');

  const { chartData, isLoading: isLoadingChart, isFetching: isFetchingChart, refetch: refetchChart } = useWeightChart(
    patientId,
    days,
  );
  const { logs, isLoading: isLoadingLogs, refetch: refetchLogs } = useWeightLogs(patientId);

  const handleRefresh = () => {
    refetchChart();
    refetchLogs();
  };

  if (isLoadingChart || isLoadingLogs) {
    return (
      <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm flex flex-col items-center justify-center min-h-[350px] space-y-3">
        <RefreshCw size={28} className="animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted">Cargando registros y gráfico de peso...</p>
      </div>
    );
  }

  const points = chartData?.points || [];
  const summary = chartData?.summary || {
    latestWeightKg: null,
    minWeightKg: 0,
    maxWeightKg: 0,
    changeKg: 0,
    trend: 'stable' as const,
    daysTracked: 0,
  };

  // Cálculo de dimensiones para el gráfico SVG responsive
  const svgWidth = 700;
  const svgHeight = 220;
  const paddingX = 50;
  const paddingY = 35;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Rango de pesos para escalar el gráfico SVG
  const weights = points.map((p) => p.weightKg);
  const minW = weights.length ? Math.min(...weights) - 0.5 : 70;
  const maxW = weights.length ? Math.max(...weights) + 0.5 : 80;
  const rangeW = Math.max(maxW - minW, 1);

  // Coordenadas para cada punto SVG
  const svgPoints = points.map((pt, index) => {
    const x = points.length === 1 ? svgWidth / 2 : paddingX + (index / (points.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - ((pt.weightKg - minW) / rangeW) * chartHeight;
    return { ...pt, x, y };
  });

  // Polyline string para el camino de la línea
  const polylineStr = svgPoints.map((pt) => `${pt.x},${pt.y}`).join(' ');

  // Área bajo el gráfico para el gradiente
  const areaPolygonStr =
    svgPoints.length > 0
      ? `${paddingX},${paddingY + chartHeight} ${polylineStr} ${svgPoints[svgPoints.length - 1].x},${
          paddingY + chartHeight
        }`
      : '';

  // Ordenar logs para la tabla de historial (más reciente primero)
  const sortedLogs = [...(logs.length ? logs : points.map((p, i) => ({
    id: `p-${i}`,
    patientId,
    weightKg: p.weightKg,
    logDate: p.date,
    notes: 'Registro en móvil',
  })))].sort((a, b) => b.logDate.localeCompare(a.logDate));

  return (
    <div className="space-y-6">
      {/* Header y Selectores */}
      <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
            <Weight size={22} />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
              Monitoreo de Peso Diario
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Smartphone size={11} /> Sincronizado con Móvil
              </span>
            </h3>
            <p className="text-xs text-muted">
              Evolución ponderal del paciente a partir de sus registros diarios en la aplicación
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Periodo */}
          <div className="flex items-center bg-surface-hover p-1 rounded-xl border border-border">
            {[
              { label: '7D', value: 7 },
              { label: '14D', value: 14 },
              { label: '30D', value: 30 },
              { label: '60D', value: 60 },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setDays(period.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  days === period.value
                    ? 'bg-primary text-gray-900 shadow-2xs'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Selector de Modo de Vista */}
          <div className="flex items-center bg-surface-hover p-1 rounded-xl border border-border">
            {[
              { label: 'Ambos', value: 'both' as const },
              { label: 'Gráfico', value: 'chart' as const },
              { label: 'Historial', value: 'history' as const },
            ].map((mode) => (
              <button
                key={mode.value}
                onClick={() => setViewMode(mode.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === mode.value
                    ? 'bg-primary text-gray-900 shadow-2xs'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isFetchingChart}
            className="p-2.5 rounded-xl bg-surface-hover border border-border text-muted hover:text-foreground transition-all"
            title="Actualizar datos"
          >
            <RefreshCw size={16} className={isFetchingChart ? 'animate-spin text-primary' : ''} />
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen Numérico */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface p-4.5 rounded-2xl border border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Weight size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Peso Actual</span>
            <span className="text-xl font-black text-foreground">
              {summary.latestWeightKg !== null ? `${summary.latestWeightKg} kg` : 'N/A'}
            </span>
          </div>
        </div>

        <div className="bg-surface p-4.5 rounded-2xl border border-border flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              summary.trend === 'down'
                ? 'bg-emerald-500/10 text-emerald-500'
                : summary.trend === 'up'
                ? 'bg-amber-500/10 text-amber-500'
                : 'bg-gray-500/10 text-gray-500'
            }`}
          >
            <Activity size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Variación ({days}d)</span>
            <span
              className={`text-xl font-black ${
                summary.changeKg < 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : summary.changeKg > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-foreground'
              }`}
            >
              {summary.changeKg > 0 ? `+${summary.changeKg}` : summary.changeKg} kg
            </span>
          </div>
        </div>

        <div className="bg-surface p-4.5 rounded-2xl border border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <Weight size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Mín / Máx ({days}d)</span>
            <span className="text-base font-black text-foreground">
              {summary.minWeightKg.toFixed(1)} / {summary.maxWeightKg.toFixed(1)} kg
            </span>
          </div>
        </div>

        <div className="bg-surface p-4.5 rounded-2xl border border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Registros Diarios</span>
            <span className="text-xl font-black text-foreground">
              {summary.daysTracked} <span className="text-xs text-muted font-normal">días</span>
            </span>
          </div>
        </div>
      </div>

      {/* Subtarea 1: [WEB] Crear gráfico de peso */}
      {(viewMode === 'both' || viewMode === 'chart') && (
        <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              Gráfico de Evolución de Peso
            </h4>
            <p className="text-xs text-muted">
              Curva de peso diaria obtenida de los controles de la aplicación móvil del paciente
            </p>
          </div>
          <span className="text-xs font-bold text-muted bg-surface-hover px-3 py-1 rounded-full border border-border">
            Últimos {days} días
          </span>
        </div>

        {points.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Weight size={36} className="text-muted mx-auto opacity-40" />
            <p className="text-sm font-semibold text-muted">No hay suficientes registros de peso para este periodo.</p>
          </div>
        ) : (
          <div className="relative w-full overflow-x-auto pt-2">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto min-w-[550px] font-sans overflow-visible"
            >
              <defs>
                <linearGradient id="weightAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary, #10B981)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--color-primary, #10B981)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid horizontales y etiquetas del eje Y */}
              {[0, 0.5, 1].map((ratio) => {
                const yPos = paddingY + chartHeight * (1 - ratio);
                const val = minW + ratio * rangeW;
                return (
                  <g key={ratio}>
                    <line
                      x1={paddingX}
                      y1={yPos}
                      x2={svgWidth - paddingX}
                      y2={yPos}
                      className="stroke-border/60"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 12}
                      y={yPos + 4}
                      textAnchor="end"
                      className="fill-muted text-[11px] font-bold"
                    >
                      {val.toFixed(1)} kg
                    </text>
                  </g>
                );
              })}

              {/* Área degradada debajo de la línea */}
              {points.length > 1 && (
                <polygon points={areaPolygonStr} fill="url(#weightAreaGradient)" />
              )}

              {/* Línea principal */}
              {points.length > 1 && (
                <polyline
                  fill="none"
                  stroke="var(--color-primary, #10B981)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylineStr}
                />
              )}

              {/* Puntos de datos y etiquetas del eje X */}
              {svgPoints.map((pt, index) => {
                const showLabel =
                  points.length <= 7 ||
                  index === 0 ||
                  index === points.length - 1 ||
                  index % Math.floor(points.length / 4) === 0;

                return (
                  <g key={index} className="group cursor-pointer">
                    {/* Línea vertical en hover */}
                    <line
                      x1={pt.x}
                      y1={paddingY}
                      x2={pt.x}
                      y2={paddingY + chartHeight}
                      className="stroke-primary/30 opacity-0 group-hover:opacity-100 transition-opacity"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />

                    {/* Punto exterior */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="6"
                      className="fill-surface stroke-primary transition-all group-hover:r-8 group-hover:fill-primary"
                      strokeWidth="3"
                    />

                    {/* Valor emergente (Tooltip en hover) */}
                    <g className="opacity-0 group-hover:opacity-100 transition-all transform -translate-y-2 group-hover:translate-y-0 pointer-events-none">
                      <rect
                        x={pt.x - 38}
                        y={pt.y - 36}
                        width="76"
                        height="24"
                        rx="6"
                        className="fill-gray-900 dark:fill-gray-100 shadow-md"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 20}
                        textAnchor="middle"
                        className="fill-white dark:fill-gray-900 text-[10px] font-extrabold"
                      >
                        {pt.weightKg} kg
                      </text>
                    </g>

                    {/* Etiqueta del eje X (fecha) */}
                    {showLabel && (
                      <text
                        x={pt.x}
                        y={paddingY + chartHeight + 20}
                        textAnchor="middle"
                        className="fill-muted text-[10px] font-bold"
                      >
                        {pt.date.slice(5)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
        </div>
      )}

      {/* Subtarea 2: [WEB] Mostrar historial de peso */}
      {(viewMode === 'both' || viewMode === 'history') && (
        <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              Historial de Registros Diarios de Peso
            </h4>
            <p className="text-xs text-muted">
              Detalle cronológico con fecha, valor exacto y origen de captura del dato
            </p>
          </div>
          <span className="text-xs font-semibold text-muted">
            Total: <strong className="text-foreground font-extrabold">{sortedLogs.length}</strong> registros
          </span>
        </div>

        {sortedLogs.length === 0 ? (
          <div className="py-12 text-center text-muted text-sm font-semibold">
            No hay registros en el historial para mostrar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] font-black uppercase tracking-wider text-muted">
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Valor de Peso</th>
                  <th className="py-3 px-4">Variación respecto al previo</th>
                  <th className="py-3 px-4">Origen / Medio</th>
                  <th className="py-3 px-4">Notas del Paciente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {sortedLogs.map((log, index) => {
                  // Calcular variación respecto al registro cronológicamente anterior (que está en index + 1)
                  const prevLog = sortedLogs[index + 1];
                  const diff = prevLog ? Number((log.weightKg - prevLog.weightKg).toFixed(1)) : 0;

                  return (
                    <tr key={log.id} className="hover:bg-surface-hover/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        {new Date(log.logDate + 'T12:00:00').toLocaleDateString('es-ES', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 font-black text-sm text-foreground bg-surface-hover px-2.5 py-1 rounded-xl border border-border">
                          <Weight size={14} className="text-primary" />
                          {log.weightKg.toFixed(1)} kg
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        {!prevLog ? (
                          <span className="text-muted text-[11px] font-medium">— Registro Base</span>
                        ) : diff < 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold">
                            <Activity size={14} /> {diff} kg
                          </span>
                        ) : diff > 0 ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-extrabold">
                            <Activity size={14} /> +{diff} kg
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-muted">
                            <Activity size={14} /> 0.0 kg
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          <Smartphone size={13} />
                          Móvil App
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-muted font-medium italic">
                        {log.notes || 'Control diario'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        </div>
      )}
    </div>
  );
}
