import { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar as CalendarIcon, 
  RefreshCw, 
  Utensils, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Flame 
} from 'lucide-react';
import { useMealCompliance } from '../hooks/useMealCompliance';
import type { MealStatus, MealItem } from '../types';

interface MealComplianceSectionProps {
  patientId: string;
}

export function MealComplianceSection({ patientId }: MealComplianceSectionProps) {
  // Manejo de fecha (por defecto fecha actual en formato YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const { complianceData, isLoading, isError, error, refetch, isFetching } = useMealCompliance(
    patientId,
    selectedDate,
    30000 // Refresco automático cada 30 segundos
  );

  const handlePrevDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDate(e.target.value);
    }
  };

  const getStatusBadge = (status: MealStatus, loggedAt?: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            Realizada {loggedAt ? `(${loggedAt})` : ''}
          </span>
        );
      case 'missed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
            <XCircle size={14} className="text-rose-600 dark:text-rose-400 shrink-0" />
            No Realizada / Omitida
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
            <Clock size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
            Pendiente
          </span>
        );
    }
  };

  const getMealTypeLabel = (type: MealItem['mealType']) => {
    switch (type) {
      case 'desayuno': return 'Desayuno';
      case 'almuerzo': return 'Almuerzo';
      case 'cena': return 'Cena';
      case 'colacion_1': return 'Colación Matutina';
      case 'colacion_2': return 'Colación Vespertina';
      default: return 'Comida';
    }
  };

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Encabezado y controles de fecha */}
      <div className="bg-surface rounded-3xl border border-border p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5 mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Utensils size={20} className="text-primary" />
              Cumplimiento Alimentario Diario
            </h3>
            <p className="text-xs text-muted mt-1">
              Monitoreo en vivo de las comidas realizadas y no realizadas desde la app móvil.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-surface-hover border border-border rounded-xl p-1">
              <button
                onClick={handlePrevDay}
                className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded-lg transition-colors"
                title="Día anterior"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="relative flex items-center px-2">
                <CalendarIcon size={14} className="text-muted mr-2 shrink-0" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
                />
              </div>

              <button
                onClick={handleNextDay}
                className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded-lg transition-colors"
                title="Día siguiente"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 px-3 py-2 bg-surface-hover hover:bg-surface border border-border rounded-xl text-xs font-semibold text-foreground transition-all active:scale-95 disabled:opacity-50"
              title="Actualizar datos desde el móvil"
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin text-primary' : 'text-muted'} />
              <span>{isFetching ? 'Sincronizando...' : 'Actualizar'}</span>
            </button>
          </div>
        </div>

        {/* Estado de Carga */}
        {isLoading && (
          <div className="py-16 flex flex-col items-center justify-center">
            <span className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin mb-4"></span>
            <p className="text-muted text-sm font-medium">Obteniendo estado de comidas desde el móvil...</p>
          </div>
        )}

        {/* Estado de Error */}
        {isError && !isLoading && (
          <div className="py-12 flex flex-col items-center justify-center text-center bg-rose-50/50 dark:bg-rose-500/5 rounded-2xl border border-rose-200 dark:border-rose-500/20 p-6">
            <AlertCircle size={32} className="text-rose-500 mb-3" />
            <p className="text-foreground font-bold text-sm">Error al cargar el cumplimiento alimentario</p>
            <p className="text-muted text-xs mt-1 max-w-md">{error?.message || 'No fue posible conectar con el servicio.'}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-gray-900 font-semibold rounded-full text-xs transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Contenido Principal con Datos */}
        {!isLoading && !isError && complianceData && (
          <div className="space-y-6">
            {/* Tarjetas de Resumen / KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-surface-hover p-4 rounded-2xl border border-border">
                <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">Total Comidas</p>
                <p className="text-2xl font-black text-foreground">{complianceData.totalAssigned}</p>
                <p className="text-[11px] text-muted mt-1 capitalize">{formattedDate}</p>
              </div>

              <div className="bg-emerald-50/60 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/20">
                <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-600" /> Realizadas
                </p>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{complianceData.completedCount}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400/80 mt-1">Completadas en la app</p>
              </div>

              <div className="bg-rose-50/60 dark:bg-rose-500/10 p-4 rounded-2xl border border-rose-200 dark:border-rose-500/20">
                <p className="text-[11px] font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <XCircle size={13} className="text-rose-600" /> No Realizadas
                </p>
                <p className="text-2xl font-black text-rose-700 dark:text-rose-300">{complianceData.missedCount}</p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400/80 mt-1">Omitidas por el paciente</p>
              </div>

              <div className="bg-purple-50/60 dark:bg-purple-500/10 p-4 rounded-2xl border border-purple-200 dark:border-purple-500/20">
                <p className="text-[11px] font-bold text-purple-800 dark:text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Flame size={13} className="text-purple-600" /> Adherencia
                </p>
                <p className="text-2xl font-black text-purple-700 dark:text-purple-300">{complianceData.complianceRate}%</p>
                <div className="w-full bg-purple-200 dark:bg-purple-900/50 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-purple-600 dark:bg-purple-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${complianceData.complianceRate}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Listado de Tiempos de Comida */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
                Detalle por Tiempo de Comida
              </h4>

              {complianceData.meals && complianceData.meals.length > 0 ? (
                <div className="grid grid-cols-1 gap-3.5">
                  {complianceData.meals.map((meal: MealItem) => (
                    <div
                      key={meal.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        meal.status === 'completed'
                          ? 'bg-surface border-emerald-200/60 dark:border-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-500/40'
                          : meal.status === 'missed'
                          ? 'bg-surface border-rose-200/60 dark:border-rose-500/20 hover:border-rose-400 dark:hover:border-rose-500/40'
                          : 'bg-surface border-border hover:border-muted'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                          meal.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : meal.status === 'missed'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                            : 'bg-surface-hover text-muted'
                        }`}>
                          {meal.mealType.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-muted uppercase tracking-wide">
                              {getMealTypeLabel(meal.mealType)}
                            </span>
                            <span className="text-[11px] text-muted font-medium">
                              • Horario: {meal.scheduledTime}
                            </span>
                          </div>

                          <h5 className="text-sm font-bold text-foreground mt-0.5">
                            {meal.name}
                          </h5>

                          {meal.notes && (
                            <p className="text-xs text-muted mt-1.5 bg-surface-hover/60 p-2 rounded-lg border border-border/50 italic">
                              "{meal.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                        {getStatusBadge(meal.status, meal.loggedAt)}

                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                          <Flame size={13} className="text-orange-500" />
                          <span>
                            {meal.consumedCalories ?? meal.estimatedCalories} / {meal.estimatedCalories} kcal
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-surface-hover/30">
                  <Utensils size={32} className="text-muted opacity-40 mb-2" />
                  <p className="text-sm font-semibold text-foreground">No hay comidas programadas para esta fecha.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
