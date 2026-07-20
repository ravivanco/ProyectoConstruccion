import {
  X,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Smartphone,
  Flame,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import type { ExerciseComplianceItem, ExerciseItemStatus } from '../types';

interface ExerciseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: ExerciseComplianceItem | null;
}

export function ExerciseStatusModal({ isOpen, onClose, exercise }: ExerciseStatusModalProps) {
  if (!isOpen || !exercise) return null;

  const getStatusBanner = (status: ExerciseItemStatus, loggedAt?: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 size={26} />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Estado Sincronizado: OK
              </span>
              <h4 className="text-lg font-black text-foreground">Ejercicio Completado</h4>
              <p className="text-xs text-muted font-medium mt-0.5">
                Sesión finalizada e informada por la aplicación móvil {loggedAt ? `a las ${loggedAt}` : ''}.
              </p>
            </div>
          </div>
        );
      case 'missed':
        return (
          <div className="bg-red-500/15 border border-red-500/30 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <XCircle size={26} />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400">
                Estado Sincronizado: Alerta
              </span>
              <h4 className="text-lg font-black text-foreground">Ejercicio No Completado</h4>
              <p className="text-xs text-muted font-medium mt-0.5">
                La jornada concluyó sin que la app móvil registrara la ejecución de esta rutina física.
              </p>
            </div>
          </div>
        );
      case 'pending':
        return (
          <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-gray-950 flex items-center justify-center shrink-0 shadow-sm">
              <Clock size={26} />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Estado Sincronizado: En Espera
              </span>
              <h4 className="text-lg font-black text-foreground">Ejercicio Programado (Pendiente)</h4>
              <p className="text-xs text-muted font-medium mt-0.5">
                Sesión programada para hoy a las {exercise.scheduledTime}. Esperando sincronización desde la app.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-3xl border border-border w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
        {/* Cabecera */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-black">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="font-black text-lg text-foreground">Detalle de Estado de Ejercicio</h3>
              <p className="text-xs text-muted">Telemetría de la App Móvil del Paciente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-hover hover:bg-border text-muted hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {getStatusBanner(exercise.status, exercise.loggedAt)}

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">Rutina Asignada</span>
              <h4 className="text-xl font-black text-foreground mt-0.5">{exercise.name}</h4>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-extrabold text-xs">
                  {exercise.category}
                </span>
                {exercise.muscleGroup && (
                  <span className="px-2.5 py-1 rounded-lg bg-surface-hover border border-border text-foreground font-bold text-xs">
                    💪 {exercise.muscleGroup}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-hover p-4 rounded-2xl border border-border">
                <span className="text-xs font-bold text-muted flex items-center gap-1 mb-1">
                  <Clock size={13} /> Duración Programada
                </span>
                <p className="text-lg font-black text-foreground">{exercise.durationMinutes} min</p>
              </div>

              <div className="bg-surface-hover p-4 rounded-2xl border border-border">
                <span className="text-xs font-bold text-muted flex items-center gap-1 mb-1">
                  <Flame size={13} className="text-orange-500" /> Calorías Estimadas / Quemadas
                </span>
                <p className="text-lg font-black text-orange-600 dark:text-orange-400">
                  {exercise.caloriesBurned ? `${exercise.caloriesBurned} kcal` : 'N/A'}
                </p>
              </div>
            </div>

            <div className="bg-surface-hover/80 p-4 rounded-2xl border border-border space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-muted border-b border-border pb-2">
                <span className="flex items-center gap-1.5">
                  <Smartphone size={14} className="text-primary" /> Fuente de datos
                </span>
                <span className="text-foreground">Sincronización App Móvil (DK-Fitt Mobile)</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-muted pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} /> Horario programado
                </span>
                <span className="text-foreground">{exercise.scheduledTime}</span>
              </div>
            </div>

            {exercise.notes && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mb-1">
                  <AlertCircle size={14} /> Telemetría / Nota del Dispositivo
                </span>
                <p className="text-xs text-foreground font-medium leading-relaxed">{exercise.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Pie de modal */}
        <div className="p-4 bg-surface-hover border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-primary text-gray-900 rounded-xl font-bold text-xs hover:brightness-110 transition-all shadow-md"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
}
