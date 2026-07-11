import { useMemo } from 'react';
import {
  Dumbbell,
  Plus,
  Trash2,
  Flame,
  Clock,
  Calendar,
  Smartphone,
} from 'lucide-react';
import type {
  AssignedExerciseItem,
  DayOfWeek,
} from '../services/assignedExerciseApi';

interface WeeklyExerciseScheduleProps {
  planId: string;
  patientId: string;
  assignedExercises: AssignedExerciseItem[];
  onOpenSelector: (day?: DayOfWeek) => void;
  onDeleteExercise: (id: string) => void;
  onOpenMobilePreview: () => void;
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

export function WeeklyExerciseSchedule({
  assignedExercises,
  onOpenSelector,
  onDeleteExercise,
  onOpenMobilePreview,
}: WeeklyExerciseScheduleProps) {
  const totalWeeklyMinutes = useMemo(() => {
    return assignedExercises.reduce((acc, curr) => acc + curr.durationMin, 0);
  }, [assignedExercises]);

  const totalWeeklyCalories = useMemo(() => {
    return assignedExercises.reduce((acc, curr) => {
      const estimatedBurn = curr.metValue * 1.2 * curr.durationMin;
      return acc + Math.round(estimatedBurn);
    }, 0);
  }, [assignedExercises]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Resumen Semanal Superior */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-3xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <Dumbbell size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Total Ejercicios
            </p>
            <p className="text-2xl font-extrabold text-foreground">
              {assignedExercises.length}
            </p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-3xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Tiempo Semanal
            </p>
            <p className="text-2xl font-extrabold text-foreground">
              {totalWeeklyMinutes} min
            </p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-3xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Gasto Est. (METs)
            </p>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              ~{totalWeeklyCalories} kcal
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Controles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface border border-border rounded-3xl p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Calendar size={16} className="text-primary" />
          <span>Distribución por Días de la Semana</span>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onOpenMobilePreview}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border border-border bg-surface-hover hover:bg-surface transition-colors"
          >
            <Smartphone size={15} className="text-emerald-500" />
            <span>Vista App Móvil</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenSelector()}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold bg-primary hover:bg-primary-hover text-gray-900 shadow-md transition-all active:scale-95"
          >
            <Plus size={15} />
            <span>Asignar Ejercicio</span>
          </button>
        </div>
      </div>

      {/* Grilla Semanal de Lunes a Domingo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const dayExercises = assignedExercises.filter(
            (exc) => exc.dayOfWeek === day,
          );
          const dayMinutes = dayExercises.reduce(
            (acc, curr) => acc + curr.durationMin,
            0,
          );

          return (
            <div
              key={day}
              className="bg-surface border border-border rounded-3xl p-4 flex flex-col justify-between shadow-sm hover:border-primary/40 transition-colors"
            >
              <div>
                {/* Header del Día */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="text-sm font-extrabold text-foreground">
                      {day}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-muted bg-surface-hover px-2.5 py-0.5 rounded-full">
                    {dayMinutes}m
                  </span>
                </div>

                {/* Lista de Ejercicios del Día */}
                <div className="space-y-2.5 mb-4">
                  {dayExercises.length > 0 ? (
                    dayExercises.map((exc) => (
                      <div
                        key={exc.id}
                        className="bg-surface-hover/70 border border-border/80 rounded-2xl p-3 space-y-1.5 group hover:bg-surface-hover transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-foreground leading-tight">
                            {exc.exerciseName}
                          </p>
                          <button
                            type="button"
                            onClick={() => onDeleteExercise(exc.id)}
                            className="text-muted hover:text-rose-500 transition-colors opacity-80 group-hover:opacity-100"
                            title="Quitar ejercicio"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-muted">
                          <span className="font-bold text-blue-500">
                            {exc.durationMin} min
                          </span>
                          <span>•</span>
                          <span>{exc.category}</span>
                          <span>•</span>
                          <span className="text-amber-500 font-bold">
                            MET {exc.metValue}
                          </span>
                        </div>

                        {exc.notes && (
                          <p className="text-[11px] text-muted/90 italic bg-surface/80 px-2.5 py-1 rounded-xl border border-border/50">
                            “{exc.notes}”
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-xs text-muted">Descanso / Sin ejercicio</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón Añadir para ese día */}
              <button
                type="button"
                onClick={() => onOpenSelector(day)}
                className="w-full py-2 border border-dashed border-border rounded-2xl text-xs font-bold text-muted hover:text-foreground hover:border-primary/50 hover:bg-surface-hover transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                <span>Añadir al {day}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
