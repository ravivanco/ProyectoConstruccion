import React from 'react';
import { Plus, Flame, Utensils, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import type { WeeklyPlan, DayOfWeek, MealConfig } from '../types';

interface WeeklyGridProps {
  plan: WeeklyPlan;
  onSelectMealSlot: (day: DayOfWeek, meal: MealConfig) => void;
  onRemoveAssignedMenu: (day: DayOfWeek, mealId: string, menuId: string) => void;
}

export const WeeklyGrid: React.FC<WeeklyGridProps> = ({
  plan,
  onSelectMealSlot,
  onRemoveAssignedMenu,
}) => {
  const visibleDays: DayOfWeek[] = plan.includeWeekends
    ? ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    : ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  // Obtener nombres únicos de todas las comidas configuradas en la semana (respetando orden)
  const allMealNames = React.useMemo(() => {
    const names = new Set<string>();
    plan.days.forEach((d) => {
      d.meals.forEach((m) => {
        if (m.isEnabled) names.add(m.name);
      });
    });
    return Array.from(names);
  }, [plan]);

  // Calcular calorías totales asignadas por cada día
  const getDayAssignedCalories = (day: DayOfWeek) => {
    const dayObj = plan.days.find((d) => d.day === day);
    if (!dayObj) return { cals: 0, prot: 0 };
    let cals = 0;
    let prot = 0;
    dayObj.meals.forEach((m) => {
      if (m.isEnabled && m.assignedMenus) {
        m.assignedMenus.forEach((am) => {
          cals += am.calories || 0;
          prot += am.protein || 0;
        });
      }
    });
    return { cals, prot };
  };

  // Calcular meta calórica configurada por día
  const getDayTargetCalories = (day: DayOfWeek) => {
    const dayObj = plan.days.find((d) => d.day === day);
    if (!dayObj) return 0;
    return dayObj.meals.filter((m) => m.isEnabled).reduce((sum, m) => sum + (Number(m.targetCalories) || 0), 0);
  };

  return (
    <div className="bg-surface rounded-3xl border border-border shadow-md overflow-hidden animate-fade-in">
      {/* Grilla Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider mb-1">
            <Utensils size={14} /> Matriz de Asignación Nutricional
          </div>
          <h3 className="text-2xl font-black text-white">Grilla Semanal de Menús</h3>
          <p className="text-emerald-100 text-xs mt-0.5">
            Haz clic en cualquier celda para asignar, editar o recomendar platos inteligentes para cada toma de comida.
          </p>
        </div>

        <div className="bg-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md border border-white/20 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-amber-300 shrink-0" />
          <div className="text-xs">
            <span className="font-extrabold text-white block">Vista: {visibleDays.length} Días Activos</span>
            <span className="text-emerald-100 font-medium">Sincronización en tiempo real</span>
          </div>
        </div>
      </div>

      {/* Contenedor con scroll horizontal para la matriz */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[900px]">
          {/* Cabecera con Días de la Semana y Totales Calóricos */}
          <thead>
            <tr className="bg-surface-hover/80 border-b border-border text-left">
              <th className="p-4 font-black text-xs uppercase tracking-wider text-muted w-44 sticky left-0 bg-surface-hover/95 z-10 border-r border-border">
                Tiempo de Comida
              </th>
              {visibleDays.map((day) => {
                const { cals, prot } = getDayAssignedCalories(day);
                const targetCals = getDayTargetCalories(day);
                const isOver = cals > targetCals + 100;
                const isUnder = cals < targetCals - 100 && cals > 0;

                return (
                  <th key={day} className="p-4 border-r border-border min-w-[200px] align-top">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-foreground">{day}</span>
                      <span className="text-[11px] font-bold text-muted bg-surface px-2 py-0.5 rounded-lg border border-border">
                        Meta: {targetCals} kcal
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black ${
                        cals === 0
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                          : isOver
                          ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'
                          : isUnder
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                          : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        <Flame size={13} className={cals > 0 ? 'fill-current' : ''} />
                        <span>{cals} kcal asignadas</span>
                      </div>
                      {prot > 0 && (
                        <span className="text-[11px] font-black text-blue-600 dark:text-blue-400">
                          {prot}g P
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Cuerpo de la Matriz (Filas por Toma de Comida) */}
          <tbody className="divide-y divide-border">
            {allMealNames.map((mealName) => (
              <tr key={mealName} className="hover:bg-surface-hover/30 transition-colors">
                {/* Columna Fija: Nombre de la Toma */}
                <td className="p-4 font-extrabold text-sm text-foreground sticky left-0 bg-surface z-10 border-r border-border align-top">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0"></span>
                    <span>{mealName}</span>
                  </div>
                  <span className="block text-[11px] font-normal text-muted mt-1">
                    Horarios y metas configurables en Vista por Días
                  </span>
                </td>

                {/* Celdas por Día */}
                {visibleDays.map((day) => {
                  const dayObj = plan.days.find((d) => d.day === day);
                  const mealConfig = dayObj?.meals.find((m) => m.name === mealName);

                  if (!mealConfig || !mealConfig.isEnabled) {
                    return (
                      <td key={`${day}-${mealName}`} className="p-4 border-r border-border bg-surface-hover/40 align-middle text-center">
                        <span className="text-xs text-muted/60 font-medium italic">⚪ Desactivado en este día</span>
                      </td>
                    );
                  }

                  const assignedList = mealConfig.assignedMenus || [];
                  const cellCalories = assignedList.reduce((s, m) => s + (m.calories || 0), 0);

                  return (
                    <td key={`${day}-${mealName}`} className="p-3 border-r border-border align-top bg-surface/50 hover:bg-surface transition-colors">
                      <div className="space-y-2">
                        {/* Cabecera de la Celda (Horario y calorías asignadas vs meta) */}
                        <div className="flex items-center justify-between text-[11px] text-muted font-bold border-b border-border/60 pb-1">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {mealConfig.suggestedTime || '---'}
                          </span>
                          <span className={cellCalories > mealConfig.targetCalories + 50 ? 'text-rose-500 font-extrabold' : 'text-emerald-600 dark:text-emerald-400 font-extrabold'}>
                            {cellCalories} / {mealConfig.targetCalories} kcal
                          </span>
                        </div>

                        {/* Platos Asignados */}
                        {assignedList.length > 0 ? (
                          <div className="space-y-2">
                            {assignedList.map((item) => (
                              <div
                                key={item.id}
                                className="group relative bg-surface border border-border hover:border-primary/50 rounded-xl p-2.5 shadow-xs transition-all"
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <span className="text-xs font-bold text-foreground leading-snug">
                                    {item.name}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRemoveAssignedMenu(day, mealConfig.id, item.id);
                                    }}
                                    className="text-muted hover:text-rose-500 p-0.5 rounded transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                    title="Eliminar este plato"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between mt-1 text-[11px] font-bold">
                                  <span className="text-muted italic">{item.portion}</span>
                                  <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded">
                                    {item.calories} kcal • {item.protein}g P
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-3 text-center border border-dashed border-border/80 rounded-xl bg-surface-hover/20">
                            <span className="text-[11px] text-muted font-medium block mb-1">Sin menú asignado</span>
                          </div>
                        )}

                        {/* Botón Asignar Plato */}
                        <button
                          onClick={() => onSelectMealSlot(day, mealConfig)}
                          className="w-full mt-1 py-1.5 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary-hover font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-primary/20 shadow-xs"
                        >
                          <Plus size={14} />
                          <span>{assignedList.length > 0 ? '+ Añadir Plato' : '+ Asignar Menú'}</span>
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
