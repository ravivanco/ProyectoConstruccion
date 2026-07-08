import { useState, useEffect } from 'react';
import {
  Smartphone,
  X,
  Dumbbell,
  Flame,
  Clock,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Award,
} from 'lucide-react';
import {
  assignedExerciseApi,
  type DayOfWeek,
  type AssignedExerciseItem,
} from '../services/assignedExerciseApi';

interface MobileExerciseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName?: string;
  planTitle?: string;
}

const WEEK_DAYS: DayOfWeek[] = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

export function MobileExerciseSyncModal({
  isOpen,
  onClose,
  patientId,
  patientName = 'Laura Vásquez',
  planTitle = 'Plan Aumento Muscular',
}: MobileExerciseSyncModalProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Lunes');
  const [loading, setLoading] = useState(false);
  const [exercisesByDay, setExercisesByDay] = useState<
    Record<DayOfWeek, AssignedExerciseItem[]>
  >({
    Lunes: [],
    Martes: [],
    Miércoles: [],
    Jueves: [],
    Viernes: [],
    Sábado: [],
    Domingo: [],
  });

  const loadMobileData = async () => {
    setLoading(true);
    try {
      const schedule = await assignedExerciseApi.getMobileSchedule(patientId);
      const grouped: Record<DayOfWeek, AssignedExerciseItem[]> = {
        Lunes: [],
        Martes: [],
        Miércoles: [],
        Jueves: [],
        Viernes: [],
        Sábado: [],
        Domingo: [],
      };

      if (schedule && schedule.schedule) {
        WEEK_DAYS.forEach((day) => {
          grouped[day] = schedule.schedule[day] || [];
        });
      }
      setExercisesByDay(grouped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMobileData();
    }
  }, [isOpen, patientId]);

  if (!isOpen) return null;

  const currentDayExercises = exercisesByDay[selectedDay] || [];
  const currentDayMinutes = currentDayExercises.reduce(
    (acc, curr) => acc + curr.durationMin,
    0,
  );
  const currentDayBurn = currentDayExercises.reduce((acc, curr) => {
    return acc + Math.round(curr.metValue * 1.2 * curr.durationMin);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-surface rounded-3xl border border-border w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera del Simulador Móvil */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  App Móvil Paciente (HU21)
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-sm font-extrabold text-white leading-tight">
                Vista Sincronizada: {patientName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadMobileData}
              disabled={loading}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
              title="Refrescar sincronización API móvil"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Marco del Celular (Simulación Fiel de la UX Móvil) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/40">
          {/* Tarjeta de Plan Activo */}
          <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                Mi Plan Activo
              </span>
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 size={13} /> Sincronizado
              </span>
            </div>
            <h4 className="text-base font-extrabold text-foreground">
              {planTitle}
            </h4>
            <p className="text-xs text-muted">
              Planificación nutricional diaria y rutinas complementarias de
              ejercicio prescritas por tu especialista.
            </p>
          </div>

          {/* Días de la semana deslizables tipo App */}
          <div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {WEEK_DAYS.map((day) => {
                const isSelected = selectedDay === day;
                const count = exercisesByDay[day]?.length || 0;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`flex flex-col items-center justify-center px-3 py-2 rounded-2xl transition-all shrink-0 border ${
                      isSelected
                        ? 'bg-primary text-gray-900 border-primary font-black shadow-md scale-105'
                        : 'bg-surface text-muted hover:text-foreground border-border'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold">
                      {day.slice(0, 3)}
                    </span>
                    <span
                      className={`text-xs mt-0.5 font-extrabold px-1.5 rounded-full ${
                        isSelected
                          ? 'bg-gray-900 text-white'
                          : count > 0
                            ? 'bg-primary/20 text-primary'
                            : 'text-muted'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resumen del Día en Celular */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface border border-border rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted">
                  Tiempo del Día
                </p>
                <p className="text-sm font-extrabold text-foreground">
                  {currentDayMinutes} min
                </p>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Flame size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted">
                  Gasto Est.
                </p>
                <p className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                  ~{currentDayBurn} kcal
                </p>
              </div>
            </div>
          </div>

          {/* Lista de Ejercicios del Día Seleccionado */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span className="flex items-center gap-1.5">
                <Dumbbell size={15} className="text-primary" />
                Rutina programada para el {selectedDay}
              </span>
              <span className="text-muted">
                {currentDayExercises.length} ejercicio(s)
              </span>
            </div>

            {currentDayExercises.length > 0 ? (
              currentDayExercises.map((exc, idx) => (
                <div
                  key={exc.id || idx}
                  className="bg-surface border border-border rounded-2xl p-3.5 space-y-2 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-primary/20 text-primary font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h5 className="text-xs font-extrabold text-foreground">
                        {exc.exerciseName}
                      </h5>
                    </div>
                    <span className="text-[10px] font-extrabold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">
                      {exc.durationMin} min
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-muted">
                    <span className="font-bold text-foreground">
                      {exc.category}
                    </span>
                    <span>•</span>
                    <span className="text-amber-500 font-bold">
                      MET {exc.metValue}
                    </span>
                  </div>

                  {exc.notes && (
                    <div className="bg-surface-hover/80 rounded-xl p-2.5 text-[11px] text-muted border border-border/60 flex items-start gap-1.5">
                      <Sparkles size={13} className="text-primary shrink-0 mt-0.5" />
                      <span>{exc.notes}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-surface border border-border rounded-2xl p-6 text-center space-y-2">
                <Award size={28} className="text-muted mx-auto opacity-50" />
                <p className="text-xs font-bold text-foreground">
                  Día sin actividad física obligatoria
                </p>
                <p className="text-[11px] text-muted">
                  Puedes tomarlo de descanso activo o seguir las pautas generales
                  de tu nutricionista.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pie de botón del Modal */}
        <div className="p-4 bg-surface border-t border-border flex items-center justify-between">
          <span className="text-xs font-bold text-muted">
            Conectado al endpoint móvil <code className="text-primary">/api/mobile</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-gray-900 font-extrabold text-xs shadow-md transition-all"
          >
            Cerrar Vista Móvil
          </button>
        </div>
      </div>
    </div>
  );
}
