import { useState } from 'react';
import {
  Dumbbell,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Flame,
  Smartphone,
  AlertCircle,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { usePhysicalCompliance } from '../hooks/usePhysicalCompliance';
import type { ExerciseItemStatus } from '../types';

interface PhysicalComplianceSectionProps {
  patientId: string;
}

export function PhysicalComplianceSection({ patientId }: PhysicalComplianceSectionProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [statusFilter, setStatusFilter] = useState<'all' | ExerciseItemStatus>('all');

  const {
    complianceData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = usePhysicalCompliance(patientId, selectedDate);

  const handleDateChange = (daysOffset: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + daysOffset);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  if (isLoading) {
    return (
      <div className="bg-surface rounded-3xl border border-border p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-colors flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-muted">
          Sincronizando cumplimiento físico desde App Móvil...
        </p>
      </div>
    );
  }

  if (isError || !complianceData) {
    return (
      <div className="bg-surface rounded-3xl border border-border p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-colors flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-foreground mb-2">Error en Monitoreo Físico</h3>
        <p className="text-sm text-muted max-w-md mb-6">{error}</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-gray-900 rounded-xl font-bold text-sm hover:brightness-110 transition-all shadow-md"
        >
          <RefreshCw size={16} />
          <span>Reintentar</span>
        </button>
      </div>
    );
  }

  const filteredExercises = complianceData.exercises.filter((exercise) => {
    if (statusFilter === 'all') return true;
    return exercise.status === statusFilter;
  });

  const getStatusBadge = (status: ExerciseItemStatus, loggedAt?: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-500/30">
            <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
            Completado {loggedAt ? `(${loggedAt})` : ''}
          </span>
        );
      case 'missed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-full text-xs font-bold border border-red-200 dark:border-red-500/30">
            <XCircle size={13} className="text-red-600 dark:text-red-400" />
            No Completado
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-500/30">
            <Clock size={13} className="text-amber-600 dark:text-amber-400" />
            Pendiente
          </span>
        );
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cardio':
        return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'Fuerza':
        return 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400';
      case 'Flexibilidad':
        return 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Superior de Sincronización Móvil */}
      <div className="bg-gradient-to-r from-blue-600/10 via-primary/10 to-purple-600/10 border border-primary/20 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <Smartphone size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-foreground text-base">
                Seguimiento Físico Sincronizado
              </h4>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                APP MÓVIL ACTIVA
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Los datos se reciben en tiempo real desde la aplicación móvil del paciente (pulseras
              de actividad, registros manuales y cronómetro de ejercicio).
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover border border-border text-foreground rounded-xl text-xs font-bold transition-all shrink-0"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin text-primary' : ''} />
          <span>Sincronizar ahora</span>
        </button>
      </div>

      {/* Tarjeta Principal y Selector de Fecha */}
      <div className="bg-surface rounded-3xl border border-border p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h3 className="text-xl font-black text-foreground flex items-center gap-2.5">
              <Dumbbell size={24} className="text-primary" />
              Monitoreo de Cumplimiento Físico
            </h3>
            <p className="text-xs text-muted mt-1">
              Evalúa la adherencia a las rutinas de ejercicio asignadas al paciente para esta jornada.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-surface-hover p-1.5 rounded-2xl border border-border">
            <button
              onClick={() => handleDateChange(-1)}
              className="p-2 hover:bg-surface rounded-xl text-muted hover:text-foreground transition-colors font-bold text-sm"
              title="Día anterior"
            >
              ←
            </button>
            <div className="flex items-center gap-2 px-3 py-1 font-bold text-sm text-foreground">
              <Calendar size={15} className="text-primary" />
              <span>
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <button
              onClick={() => handleDateChange(1)}
              className="p-2 hover:bg-surface rounded-xl text-muted hover:text-foreground transition-colors font-bold text-sm"
              title="Día siguiente"
            >
              →
            </button>
          </div>
        </div>

        {/* Indicador Global de Adherencia (Barra y Métricas) */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          <div className="lg:col-span-1 bg-surface-hover/60 rounded-2xl p-5 border border-border flex flex-col items-center justify-center text-center">
            <div className="relative w-24 h-24 flex items-center justify-center mb-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-border"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-primary"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * complianceData.complianceRate) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-foreground">
                  {complianceData.complianceRate}%
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted font-extrabold">
                  Adherencia
                </span>
              </div>
            </div>
            <p className="text-xs font-bold text-foreground">
              {complianceData.completedCount} de {complianceData.totalAssigned} rutinas completadas
            </p>
          </div>

          {/* Tarjetas de Estadísticas Rápida */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-hover p-4 rounded-2xl border border-border transition-all hover:border-emerald-500/40">
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-xs font-bold">Completados</span>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {complianceData.completedCount}
              </p>
              <span className="text-[11px] text-muted font-medium">Sincronizados OK</span>
            </div>

            <div className="bg-surface-hover p-4 rounded-2xl border border-border transition-all hover:border-red-500/40">
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-xs font-bold">No Completados</span>
                <XCircle size={16} className="text-red-500" />
              </div>
              <p className="text-2xl font-black text-red-600 dark:text-red-400">
                {complianceData.missedCount}
              </p>
              <span className="text-[11px] text-muted font-medium">Omisión detectada</span>
            </div>

            <div className="bg-surface-hover p-4 rounded-2xl border border-border transition-all hover:border-amber-500/40">
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-xs font-bold">Pendientes</span>
                <Clock size={16} className="text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {complianceData.pendingCount}
              </p>
              <span className="text-[11px] text-muted font-medium">Por realizar hoy</span>
            </div>

            <div className="bg-surface-hover p-4 rounded-2xl border border-border transition-all hover:border-primary/40">
              <div className="flex items-center justify-between text-muted mb-2">
                <span className="text-xs font-bold">Tiempo & Calorías</span>
                <Flame size={16} className="text-orange-500" />
              </div>
              <p className="text-lg font-black text-foreground">
                {complianceData.totalDurationMinutes} min
              </p>
              <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1 mt-0.5">
                <Flame size={12} /> {complianceData.totalCaloriesBurned} kcal quemadas
              </span>
            </div>
          </div>
        </div>

        {/* Filtros por Estado de Ejercicio */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted" />
            <h4 className="font-extrabold text-sm text-foreground">Detalle y Estado de Rutinas</h4>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-surface-hover p-1 rounded-xl border border-border">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-primary text-gray-900 shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Todos ({complianceData.exercises.length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <CheckCircle2 size={13} />
              Completados ({complianceData.completedCount})
            </button>
            <button
              onClick={() => setStatusFilter('missed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                statusFilter === 'missed'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-red-600 dark:text-red-400 hover:bg-red-500/10'
              }`}
            >
              <XCircle size={13} />
              No Completados ({complianceData.missedCount})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-gray-900 shadow-sm'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <Clock size={13} />
              Pendientes ({complianceData.pendingCount})
            </button>
          </div>
        </div>

        {/* Lista de Ejercicios */}
        <div className="mt-4 space-y-3">
          {filteredExercises.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-surface-hover/30 text-center">
              <Activity size={36} className="text-muted opacity-40 mb-3" />
              <p className="text-sm font-bold text-foreground">No se encontraron rutinas</p>
              <p className="text-xs text-muted mt-1">
                No hay ejercicios asignados con el estado seleccionado en esta fecha.
              </p>
            </div>
          ) : (
            filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  exercise.status === 'completed'
                    ? 'bg-emerald-500/5 border-emerald-500/30 dark:bg-emerald-500/10'
                    : exercise.status === 'missed'
                    ? 'bg-red-500/5 border-red-500/30 dark:bg-red-500/10'
                    : 'bg-surface-hover/40 border-border hover:border-primary/40'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Activity size={20} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-foreground text-sm">
                        {exercise.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${getCategoryColor(
                          exercise.category,
                        )}`}
                      >
                        {exercise.category}
                      </span>
                      {exercise.muscleGroup && (
                        <span className="text-xs font-semibold text-muted bg-surface px-2 py-0.5 rounded-md border border-border">
                          💪 {exercise.muscleGroup}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted">
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        Programado: <strong className="text-foreground">{exercise.scheduledTime}</strong> ({exercise.durationMinutes} min)
                      </span>
                      {exercise.caloriesBurned ? (
                        <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-bold">
                          <Flame size={13} />
                          {exercise.caloriesBurned} kcal quemadas
                        </span>
                      ) : null}
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <Smartphone size={13} />
                        Origen: {exercise.source === 'mobile_app' ? 'App Móvil' : 'Manual'}
                      </span>
                    </div>

                    {exercise.notes && (
                      <p className="text-xs text-muted bg-surface/80 p-2.5 rounded-xl border border-border mt-2 leading-relaxed">
                        📝 <strong>Nota App Móvil:</strong> {exercise.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center md:justify-end shrink-0">
                  {getStatusBadge(exercise.status, exercise.loggedAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
