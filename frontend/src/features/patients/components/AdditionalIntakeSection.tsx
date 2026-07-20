import { useState, useMemo } from 'react';
import {
  Utensils,
  Flame,
  Calendar,
  Smartphone,
  RefreshCw,
  Search,
  AlertCircle,
  Clock,
  Info,
} from 'lucide-react';
import { useAdditionalIntake } from '../hooks/useAdditionalIntake';

interface AdditionalIntakeSectionProps {
  patientId: string;
}

export function AdditionalIntakeSection({ patientId }: AdditionalIntakeSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const { logs, isLoading, isFetching, refetch } = useAdditionalIntake(
    patientId,
    selectedDate || undefined,
  );

  // Filtrar por término de búsqueda (y ordenar cronológicamente descendente para ver más recientes primero)
  const filteredLogs = useMemo(() => {
    return [...logs]
      .filter((log) => {
        if (!searchTerm.trim()) return true;
        const query = searchTerm.toLowerCase();
        return (
          log.foodName.toLowerCase().includes(query) ||
          (log.notes && log.notes.toLowerCase().includes(query)) ||
          (log.quantity && log.quantity.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || a.logDate).getTime();
        const timeB = new Date(b.createdAt || b.logDate).getTime();
        return timeB - timeA;
      });
  }, [logs, searchTerm]);

  // Cálculo de resumen
  const totalCalories = useMemo(() => {
    return filteredLogs.reduce((acc, curr) => acc + (curr.calories || 0), 0);
  }, [filteredLogs]);

  const totalProtein = useMemo(() => {
    return filteredLogs.reduce((acc, curr) => acc + (curr.protein || 0), 0);
  }, [filteredLogs]);

  const totalCarbs = useMemo(() => {
    return filteredLogs.reduce((acc, curr) => acc + (curr.carbs || 0), 0);
  }, [filteredLogs]);

  const totalFat = useMemo(() => {
    return filteredLogs.reduce((acc, curr) => acc + (curr.fat || 0), 0);
  }, [filteredLogs]);

  if (isLoading) {
    return (
      <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm flex flex-col items-center justify-center min-h-[350px] space-y-3">
        <RefreshCw size={28} className="animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted">Cargando registros de consumo adicional desde móvil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <Utensils size={22} />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
              Monitoreo de Consumo Adicional
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Smartphone size={11} /> Sincronizado con Móvil
              </span>
            </h3>
            <p className="text-xs text-muted">
              Alimentos consumidos fuera del plan nutricional asignado, registrados por el paciente
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filtro por fecha opcional */}
          <div className="flex items-center gap-1.5 bg-surface-hover px-3 py-1.5 rounded-xl border border-border">
            <Calendar size={14} className="text-muted" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-foreground focus:outline-none"
              title="Filtrar por fecha específica"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-[10px] text-muted hover:text-foreground font-extrabold ml-1 bg-border/60 px-1.5 py-0.5 rounded"
              >
                Limpiar
              </button>
            )}
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-xl bg-surface-hover border border-border text-muted hover:text-foreground transition-all"
            title="Actualizar datos"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin text-primary' : ''} />
          </button>
        </div>
      </div>

      {/* Subtarea 2: [WEB] Mostrar calorías estimadas (y resumen de macronutrientes extra) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface p-4.5 rounded-2xl border border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Flame size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
              Calorías Extra Totales
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">
              {totalCalories.toLocaleString()} <span className="text-xs font-normal text-muted">kcal</span>
            </span>
          </div>
        </div>

        <div className="bg-surface p-4.5 rounded-2xl border border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Utensils size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
              Proteína Extra
            </span>
            <span className="text-xl font-black text-foreground">
              {totalProtein.toFixed(1)} <span className="text-xs font-normal text-muted">g</span>
            </span>
          </div>
        </div>

        <div className="bg-surface p-4.5 rounded-2xl border border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <Info size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
              Carbos / Grasas
            </span>
            <span className="text-base font-black text-foreground">
              {totalCarbs.toFixed(0)}g C / {totalFat.toFixed(0)}g G
            </span>
          </div>
        </div>

        <div className="bg-surface p-4.5 rounded-2xl border border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
              Registros Adicionales
            </span>
            <span className="text-xl font-black text-foreground">
              {filteredLogs.length} <span className="text-xs font-normal text-muted">ítems</span>
            </span>
          </div>
        </div>
      </div>

      {/* Subtarea 1: [WEB] Crear tabla de consumos adicionales */}
      <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Calendar size={18} className="text-amber-500" />
              Tabla de Registros Cronológicos y Desviaciones
            </h4>
            <p className="text-xs text-muted">
              Listado completo de consumos adicionales capturados en tiempo real por el paciente en la app móvil
            </p>
          </div>

          {/* Buscador interno */}
          <div className="relative w-full md:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por alimento o nota..."
              className="w-full bg-surface-hover pl-9 pr-3 py-2 rounded-xl border border-border text-xs font-medium text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Utensils size={36} className="text-muted mx-auto opacity-40" />
            <p className="text-sm font-semibold text-muted">
              {searchTerm || selectedDate
                ? 'No se encontraron consumos adicionales con los filtros aplicados.'
                : 'No hay registros de consumo adicional para este paciente.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] font-black uppercase tracking-wider text-muted">
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Alimento y Cantidad</th>
                  <th className="py-3 px-4">Calorías Estimadas</th>
                  <th className="py-3 px-4">Macronutrientes (P / C / G)</th>
                  <th className="py-3 px-4">Origen</th>
                  <th className="py-3 px-4">Notas / Contexto del Paciente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {filteredLogs.map((log) => {
                  const dateObj = new Date(log.createdAt || log.logDate + 'T12:00:00');
                  const formattedDate = dateObj.toLocaleDateString('es-ES', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const formattedTime = log.createdAt
                    ? dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                    : 'Diario';

                  return (
                    <tr key={log.id} className="hover:bg-surface-hover/80 transition-colors">
                      {/* Fecha y Hora */}
                      <td className="py-4 px-4 font-bold text-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-muted shrink-0" />
                          <div>
                            <span className="block">{formattedDate}</span>
                            <span className="text-[10px] text-muted font-semibold">{formattedTime}</span>
                          </div>
                        </div>
                      </td>

                      {/* Alimento y Cantidad */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className="font-extrabold text-foreground text-sm block">
                            {log.foodName}
                          </span>
                          {log.quantity && (
                            <span className="inline-block px-2 py-0.5 rounded-lg bg-surface-hover border border-border text-[11px] font-bold text-muted">
                              Porción: {log.quantity}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Subtarea 2: Calorías Estimadas */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-sm border border-amber-500/30">
                          <Flame size={15} />
                          {log.calories ? `${log.calories} kcal` : '0 kcal'}
                        </span>
                      </td>

                      {/* Macronutrientes */}
                      <td className="py-4 px-4 whitespace-nowrap font-bold text-muted">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            P: {log.protein || 0}g
                          </span>
                          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">
                            C: {log.carbs || 0}g
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            G: {log.fat || 0}g
                          </span>
                        </div>
                      </td>

                      {/* Origen */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          <Smartphone size={13} />
                          Móvil App
                        </span>
                      </td>

                      {/* Notas / Contexto */}
                      <td className="py-4 px-4 text-muted font-medium italic max-w-xs">
                        {log.notes || 'Consumo adicional reportado fuera del horario habitual de comida'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
