import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Smartphone,
  Flame,
  ChevronRight,
} from 'lucide-react';
import type { ExerciseComplianceItem, ExerciseItemStatus } from '../types';

interface ExerciseStatusCardProps {
  exercise: ExerciseComplianceItem;
  onSelect?: (exercise: ExerciseComplianceItem) => void;
}

export function ExerciseStatusCard({ exercise, onSelect }: ExerciseStatusCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cardio':
        return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30';
      case 'Fuerza':
        return 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30';
      case 'Flexibilidad':
        return 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-border';
    }
  };

  const getStatusBadge = (status: ExerciseItemStatus, loggedAt?: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-black shadow-sm tracking-wide">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>COMPLETADO {loggedAt ? `• ${loggedAt}` : ''}</span>
          </span>
        );
      case 'missed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 text-white rounded-xl text-xs font-black shadow-sm tracking-wide">
            <XCircle size={14} className="shrink-0" />
            <span>NO COMPLETADO (OMITIDO)</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 text-gray-950 rounded-xl text-xs font-black shadow-sm tracking-wide">
            <Clock size={14} className="shrink-0" />
            <span>PENDIENTE HOY</span>
          </span>
        );
    }
  };

  const isCompleted = exercise.status === 'completed';
  const isMissed = exercise.status === 'missed';

  return (
    <div
      onClick={() => onSelect && onSelect(exercise)}
      className={`group p-5 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden ${
        isCompleted
          ? 'bg-emerald-500/[0.04] border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-md'
          : isMissed
          ? 'bg-red-500/[0.04] border-red-500/30 hover:border-red-500/60 hover:shadow-md'
          : 'bg-surface hover:bg-surface-hover border-border hover:border-primary/40 hover:shadow-md'
      }`}
    >
      {/* Barra indicadora lateral de estado visible */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          isCompleted ? 'bg-emerald-500' : isMissed ? 'bg-red-600' : 'bg-amber-500'
        }`}
      />

      <div className="flex items-start gap-4 flex-1 pl-2">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
            isCompleted
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : isMissed
              ? 'bg-red-500/10 text-red-600 dark:text-red-400'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          }`}
        >
          <Activity size={24} />
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h5 className="font-black text-foreground text-base group-hover:text-primary transition-colors">
              {exercise.name}
            </h5>
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${getCategoryColor(exercise.category)}`}>
              {exercise.category}
            </span>
            {exercise.muscleGroup && (
              <span className="text-xs font-bold text-muted bg-surface-hover px-2.5 py-0.5 rounded-lg border border-border">
                💪 {exercise.muscleGroup}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-muted">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-primary" />
              Horario: <strong className="text-foreground">{exercise.scheduledTime}</strong> ({exercise.durationMinutes} min)
            </span>

            {exercise.caloriesBurned && exercise.caloriesBurned > 0 ? (
              <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-extrabold">
                <Flame size={14} />
                {exercise.caloriesBurned} kcal quemadas en sesión
              </span>
            ) : null}

            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
              <Smartphone size={12} />
              Sincronizado desde App Móvil
            </span>
          </div>

          {exercise.notes && (
            <div className="bg-surface/90 p-3 rounded-2xl border border-border mt-2 text-xs text-muted font-medium flex items-start gap-2">
              <span className="shrink-0 text-base">📱</span>
              <p className="leading-relaxed">
                <strong className="text-foreground">Telemetría / Nota Móvil:</strong> {exercise.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pl-2 md:pl-0 border-t md:border-t-0 pt-3 md:pt-0 border-border">
        {getStatusBadge(exercise.status, exercise.loggedAt)}
        <ChevronRight size={18} className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}
