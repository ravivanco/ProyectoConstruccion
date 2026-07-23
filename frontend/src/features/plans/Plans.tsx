import { useState, useEffect, useMemo, useCallback } from 'react';
import { FileText, Calendar, Clock, Flame, Plus, Copy, Save, Sparkles, User, Target, Check, Trash2, LayoutGrid, ListFilter, Dumbbell } from 'lucide-react';
import type { WeeklyPlan, DayOfWeek, MealConfig, DishTemplate } from './types';
import { INITIAL_PLANS, createDefaultWeekStructure, DISH_CATALOG } from './services/mockPlans';
import { WeeklyGrid, MenuSelectorModal, ExerciseSelectorModal, WeeklyExerciseSchedule, MobileExerciseSyncModal } from './components';
import { assignedExerciseApi, type AssignedExerciseItem, type CreateAssignedExerciseInput } from './services/assignedExerciseApi';
import { plansApi } from './services/plansApi';
import { foodApi } from '../foods/services/foodApi';
import { patientsAPI } from '../patients/services/patientsApi';
import type { Patient } from '../../shared/types';

export function Plans() {
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);

  const [activePlanId, setActivePlanId] = useState<string>(() => plans[0]?.id || 'plan-101');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Lunes');
  const [viewMode, setViewMode] = useState<'days' | 'grid' | 'exercises'>('grid');
  const [selectedSlotForMenu, setSelectedSlotForMenu] = useState<{ day: DayOfWeek; meal: MealConfig } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado para gestión de ejercicios del plan (HU21)
  const [assignedExercises, setAssignedExercises] = useState<AssignedExerciseItem[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [exerciseSelectorDefaultDay, setExerciseSelectorDefaultDay] = useState<DayOfWeek>('Lunes');
  const [showMobilePreviewModal, setShowMobilePreviewModal] = useState(false);

  // Estado para crear nuevo plan
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanPatient, setNewPlanPatient] = useState('');
  const [newPlanObjective, setNewPlanObjective] = useState('');

  // Estado para catálogo de platos dinámico desde Foods API
  const [dishCatalog, setDishCatalog] = useState<DishTemplate[]>(DISH_CATALOG);

  // Estado para pacientes reales del sistema
  const [availablePatients, setAvailablePatients] = useState<Patient[]>([]);

  // Cargar planes desde el backend al montar el componente
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const backendPlans = await plansApi.getPlans();
        setPlans(backendPlans.length > 0 ? backendPlans : INITIAL_PLANS);
      } catch {
        setPlans(INITIAL_PLANS);
      }
    };
    loadPlans();
  }, []);

  // Cargar catálogo de alimentos reales desde foodApi para el MenuSelectorModal
  useEffect(() => {
    const loadFoodCatalog = async () => {
      try {
        const foods = await foodApi.getFoods();
        if (foods.length > 0) {
          const mapped: DishTemplate[] = foods
            .filter((f) => f.isActive)
            .map((f) => ({
              id: f.id,
              name: f.name,
              category: mapFoodCategoryToDishCategory(f.category),
              defaultPortion: f.servingSize || '1 porción',
              calories: f.calories,
              protein: f.protein,
              carbs: f.carbs,
              fat: f.fat,
              tags: [f.category],
            }));
          setDishCatalog(mapped.length > 0 ? mapped : DISH_CATALOG);
        }
      } catch {
        // Fallback: mantener DISH_CATALOG estático
      }
    };
    loadFoodCatalog();
  }, []);

  // Cargar lista de pacientes reales
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const pts = await patientsAPI.getPatients();
        setAvailablePatients(pts);
      } catch {
        // Sin conexión al backend, no bloquear la UI
      }
    };
    loadPatients();
  }, []);

  useEffect(() => {
    localStorage.setItem('dkfitt_plans', JSON.stringify(plans));
  }, [plans]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activePlan = useMemo(() => {
    return plans.find((p) => p.id === activePlanId) || plans[0];
  }, [plans, activePlanId]);

  const loadAssignedExercises = useCallback(async (planId: string) => {
    const list = await assignedExerciseApi.getByPlanId(planId);
    setAssignedExercises(list);
  }, []);

  useEffect(() => {
    if (activePlan?.id) {
      loadAssignedExercises(activePlan.id);
    }
  }, [activePlan?.id, loadAssignedExercises]);

  const handleAssignExercise = async (data: CreateAssignedExerciseInput) => {
    if (!activePlan) return;
    const added = await assignedExerciseApi.assignToPlan(activePlan.id, data);
    if (added) {
      setAssignedExercises((prev) => [...prev, added]);
      showToast(`¡Ejercicio "${data.exerciseName}" asignado para el día ${data.dayOfWeek}!`);
    }
  };

  const handleDeleteAssignedExercise = async (id: string) => {
    if (!activePlan) return;
    await assignedExerciseApi.deleteAssigned(activePlan.id, id);
    setAssignedExercises((prev) => prev.filter((item) => item.id !== id));
    showToast('Ejercicio removido del seguimiento.');
  };

  // Si se desactivan fines de semana y estamos en Sábado/Domingo, mover a Lunes
  useEffect(() => {
    if (activePlan && !activePlan.includeWeekends) {
      if (selectedDay === 'Sábado' || selectedDay === 'Domingo') {
        setSelectedDay('Lunes');
      }
    }
  }, [activePlan, selectedDay]);

  const handleToggleWeekends = () => {
    if (!activePlan) return;
    const nextVal = !activePlan.includeWeekends;
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id === activePlan.id) {
          return { ...p, includeWeekends: nextVal, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );
    showToast(`Fines de semana ${nextVal ? 'activados (7 días)' : 'desactivados (5 días)'}.`);
  };

  const handleUpdateMeal = (mealId: string, updates: Partial<MealConfig>) => {
    if (!activePlan) return;
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== activePlan.id) return p;
        const updatedDays = p.days.map((dayObj) => {
          if (dayObj.day !== selectedDay) return dayObj;
          const updatedMeals = dayObj.meals.map((m) => (m.id === mealId ? { ...m, ...updates } : m));
          return { ...dayObj, meals: updatedMeals };
        });
        return { ...p, days: updatedDays, updatedAt: new Date().toISOString() };
      })
    );
  };

  const handleAddCustomMeal = () => {
    if (!activePlan) return;
    const customName = prompt('Nombre de la nueva comida o colación (ej. Pre-entrenamiento):', 'Colación extra');
    if (!customName || !customName.trim()) return;

    const newMeal: MealConfig = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      suggestedTime: '16:00 PM',
      targetCalories: 200,
      isEnabled: true,
    };

    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== activePlan.id) return p;
        const updatedDays = p.days.map((dayObj) => {
          if (dayObj.day !== selectedDay) return dayObj;
          return { ...dayObj, meals: [...dayObj.meals, newMeal] };
        });
        return { ...p, days: updatedDays, updatedAt: new Date().toISOString() };
      })
    );
    showToast(`Comida "${customName}" agregada al ${selectedDay}.`);
  };

  const handleDeleteMeal = (mealId: string, mealName: string) => {
    if (!activePlan) return;
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== activePlan.id) return p;
        const updatedDays = p.days.map((dayObj) => {
          if (dayObj.day !== selectedDay) return dayObj;
          return { ...dayObj, meals: dayObj.meals.filter((m) => m.id !== mealId) };
        });
        return { ...p, days: updatedDays, updatedAt: new Date().toISOString() };
      })
    );
    showToast(`Comida "${mealName}" eliminada.`);
  };

  const handleCloneDayToAll = () => {
    if (!activePlan) return;
    const currentDayObj = activePlan.days.find((d) => d.day === selectedDay);
    if (!currentDayObj) return;

    // Clonar la estructura de comidas a los demás días
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== activePlan.id) return p;
        const clonedDays = p.days.map((dayObj) => {
          if (dayObj.day === selectedDay) return dayObj;
          // Copiar comidas con nuevos IDs únicos pero mismos valores
          const copiedMeals = currentDayObj.meals.map((m) => ({
            ...m,
            id: `${dayObj.day}-${m.id.split('-').slice(1).join('-')}-${Math.random().toString(36).substring(2, 5)}`,
          }));
          return { ...dayObj, meals: copiedMeals };
        });
        return { ...p, days: clonedDays, updatedAt: new Date().toISOString() };
      })
    );
    showToast(`⚡ Estructura del ${selectedDay} copiada con éxito a toda la semana.`);
  };

  const handleRemoveAssignedMenu = (day: DayOfWeek, mealId: string, menuId: string) => {
    if (!activePlan) return;
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== activePlan.id) return p;
        const updatedDays = p.days.map((dayObj) => {
          if (dayObj.day !== day) return dayObj;
          const updatedMeals = dayObj.meals.map((m) => {
            if (m.id !== mealId) return m;
            return {
              ...m,
              assignedMenus: (m.assignedMenus || []).filter((am) => am.id !== menuId),
            };
          });
          return { ...dayObj, meals: updatedMeals };
        });
        return { ...p, days: updatedDays, updatedAt: new Date().toISOString() };
      })
    );
    showToast(`Plato eliminado de la toma.`);
  };

  const handleAssignDish = (dish: any, portionMultiplier: number, notes?: string) => {
    if (!activePlan || !selectedSlotForMenu) return;
    const { day, meal } = selectedSlotForMenu;

    const newAssigned = {
      id: `ass-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dishId: dish.id,
      name: dish.name,
      portion: portionMultiplier !== 1 ? `${portionMultiplier}x porción (${dish.defaultPortion})` : dish.defaultPortion,
      calories: Math.round(dish.calories * portionMultiplier),
      protein: Math.round(dish.protein * portionMultiplier),
      carbs: Math.round(dish.carbs * portionMultiplier),
      fat: Math.round(dish.fat * portionMultiplier),
      category: dish.category,
      notes,
    };

    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== activePlan.id) return p;
        const updatedDays = p.days.map((dayObj) => {
          if (dayObj.day !== day) return dayObj;
          const updatedMeals = dayObj.meals.map((m) => {
            if (m.id !== meal.id) return m;
            return {
              ...m,
              assignedMenus: [...(m.assignedMenus || []), newAssigned],
            };
          });
          return { ...dayObj, meals: updatedMeals };
        });
        return { ...p, days: updatedDays, updatedAt: new Date().toISOString() };
      })
    );
    showToast(`✨ Plato "${dish.name}" asignado a ${day} - ${meal.name}`);
  };

  const handleSaveConfiguration = async () => {
    localStorage.setItem('dkfitt_plans', JSON.stringify(plans));
    // También persistir en backend si el plan existe
    if (activePlan) {
      await plansApi.updateWeeklyStructure(activePlan.id, activePlan.days);
    }
    showToast('💾 Estructura semanal del plan guardada correctamente en el sistema.');
  };

  const handleCreateNewPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTitle.trim()) return;

    // Intentar crear en el backend primero
    const selectedPatient = availablePatients.find((p) => p.id === newPlanPatient || p.name === newPlanPatient);
    const backendPlan = await plansApi.createPlan({
      patientId: selectedPatient?.id || newPlanPatient.trim() || 'sin-asignar',
      title: newPlanTitle.trim(),
      dailyCalories: 2000,
      proteinG: 150,
      carbsG: 200,
      fatG: 65,
    });

    const newPlan: WeeklyPlan = backendPlan || {
      id: `plan-${Date.now()}`,
      title: newPlanTitle.trim(),
      patientName: selectedPatient?.name || newPlanPatient.trim() || 'Paciente Sin Asignar',
      objective: newPlanObjective.trim() || 'Estructuración alimenticia equilibrada',
      includeWeekends: true,
      days: createDefaultWeekStructure(1.0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Enriquecer con campos del formulario
    newPlan.patientName = selectedPatient?.name || newPlanPatient.trim() || newPlan.patientName || 'Paciente Sin Asignar';
    newPlan.objective = newPlanObjective.trim() || 'Estructuración alimenticia equilibrada';
    newPlan.includeWeekends = true;
    if (!newPlan.days || newPlan.days.length === 0) {
      newPlan.days = createDefaultWeekStructure(1.0);
    }

    setPlans((prev) => [newPlan, ...prev]);
    setActivePlanId(newPlan.id);
    setSelectedDay('Lunes');
    setShowCreateModal(false);
    setNewPlanTitle('');
    setNewPlanPatient('');
    setNewPlanObjective('');
    showToast(`Nuevo plan "${newPlan.title}" creado con éxito.`);
  };

  if (!activePlan) return null;

  const visibleDays: DayOfWeek[] = activePlan.includeWeekends
    ? ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    : ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  const currentDayData = activePlan.days.find((d) => d.day === selectedDay) || activePlan.days[0];

  const dailyTotalCalories = currentDayData.meals
    .filter((m) => m.isEnabled)
    .reduce((sum, m) => sum + (Number(m.targetCalories) || 0), 0);

  const weeklyAverageCalories = Math.round(
    activePlan.days
      .filter((d) => visibleDays.includes(d.day))
      .reduce((totalSum, dObj) => {
        const daySum = dObj.meals.filter((m) => m.isEnabled).reduce((s, m) => s + (Number(m.targetCalories) || 0), 0);
        return totalSum + daySum;
      }, 0) / visibleDays.length
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in border border-border font-bold text-sm">
          <Sparkles className="text-amber-400 shrink-0" size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Plan Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <FileText size={16} />
            <span>Nutrición • Estructura Semanal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">Planes Alimenticios</h1>
          <p className="text-muted text-sm mt-1">
            Define la distribución de comidas, horarios y objetivos calóricos de lunes a viernes o fines de semana.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={activePlanId}
            onChange={(e) => setActivePlanId(e.target.value)}
            className="bg-surface border border-border rounded-2xl px-4 py-3 text-sm font-bold text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 max-w-xs truncate"
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                📁 {p.title} ({p.patientName})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary-hover text-gray-900 font-extrabold px-5 py-3 rounded-2xl text-sm shadow-md transition-all flex items-center gap-2 shrink-0 active:scale-95"
          >
            <Plus size={18} /> Nuevo Plan
          </button>
        </div>
      </div>

      {/* Active Plan Overview Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-gray-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-extrabold tracking-wide">
              <User size={14} /> Paciente: {activePlan.patientName || 'Sin Asignar'}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">{activePlan.title}</h2>
            <p className="text-gray-300 text-sm flex items-center gap-1.5 max-w-2xl">
              <Target size={16} className="text-amber-400 shrink-0" />
              <span><strong className="text-white">Objetivo Clínico:</strong> {activePlan.objective}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0 bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-white/10">
            <div className="text-center sm:text-left px-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Promedio Calórico Semanal</span>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-amber-400 font-black text-2xl mt-0.5">
                <Flame size={22} className="fill-amber-400" />
                <span>~{weeklyAverageCalories} kcal/día</span>
              </div>
            </div>

            <div className="h-10 w-px bg-white/10 hidden sm:block"></div>

            {/* Weekend Toggle Switch */}
            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 px-2">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Calendar size={15} className="text-primary" />
                Incluir Fin de Semana
              </span>
              <button
                onClick={handleToggleWeekends}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${
                  activePlan.includeWeekends ? 'bg-primary' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    activePlan.includeWeekends ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Switcher Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-surface p-2 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
              viewMode === 'grid'
                ? 'bg-primary text-gray-900 shadow-sm scale-[1.02]'
                : 'text-muted hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            <LayoutGrid size={16} />
            <span>📅 Grilla Semanal de Menús (Matriz)</span>
          </button>

          <button
            onClick={() => setViewMode('days')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
              viewMode === 'days'
                ? 'bg-primary text-gray-900 shadow-sm scale-[1.02]'
                : 'text-muted hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            <ListFilter size={16} />
            <span>📑 Configurar Horarios y Tomas (Por Días)</span>
          </button>

          <button
            onClick={() => setViewMode('exercises')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
              viewMode === 'exercises'
                ? 'bg-primary text-gray-900 shadow-sm scale-[1.02]'
                : 'text-muted hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            <Dumbbell size={16} />
            <span>🏋️ Actividad Física y Ejercicios Asignados (HU21)</span>
          </button>
        </div>

        <button
          onClick={handleSaveConfiguration}
          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 ml-auto"
        >
          <Save size={15} /> Guardar Plan
        </button>
      </div>

      {/* Conditional Rendering based on View Mode */}
      {viewMode === 'grid' ? (
        <WeeklyGrid
          plan={activePlan}
          onSelectMealSlot={(day, meal) => setSelectedSlotForMenu({ day, meal })}
          onRemoveAssignedMenu={handleRemoveAssignedMenu}
        />
      ) : viewMode === 'days' ? (
        /* Weekly Structure Builder Section */
        <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden">
        
        {/* Days Navigation Tabs */}
        <div className="flex items-center overflow-x-auto no-scrollbar border-b border-border bg-surface-hover/50 p-2 gap-2">
          {visibleDays.map((day) => {
            const isSelected = selectedDay === day;
            const dayObj = activePlan.days.find((d) => d.day === day);
            const dayCals = dayObj?.meals
              .filter((m) => m.isEnabled)
              .reduce((s, m) => s + (Number(m.targetCalories) || 0), 0) || 0;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex flex-col items-start px-6 py-3.5 rounded-2xl transition-all min-w-[130px] shrink-0 border ${
                  isSelected
                    ? 'bg-primary text-gray-900 border-primary shadow-md font-extrabold scale-[1.02]'
                    : 'bg-surface text-muted hover:text-foreground border-border hover:border-muted'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-black tracking-tight">{day}</span>
                  {isSelected && <Check size={16} className="text-gray-900 stroke-[3]" />}
                </div>
                <div className={`text-[11px] font-bold mt-1 flex items-center gap-1 ${isSelected ? 'text-gray-800' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  <Flame size={13} className={isSelected ? 'fill-gray-800' : 'fill-emerald-500'} />
                  <span>{dayCals} kcal</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Day Content */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h3 className="text-2xl font-black text-foreground flex items-center gap-2">
                <span>Comidas para el {selectedDay}</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                  Total: {dailyTotalCalories} kcal
                </span>
              </h3>
              <p className="text-muted text-xs mt-0.5">
                Activa las tomas de alimento necesarias, configura el horario sugerido para el paciente y la meta calórica.
              </p>
            </div>

            {/* WOW Button: Clone structure to all days */}
            <button
              onClick={handleCloneDayToAll}
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto active:scale-95 shrink-0"
              title="Copia los horarios, nombres y calorías de este día a todos los demás días visibles"
            >
              <Copy size={15} />
              <span>⚡ Copiar estructura del {selectedDay} a toda la semana</span>
            </button>
          </div>

          {/* Meals Configuration List */}
          <div className="space-y-3">
            {currentDayData.meals.map((meal, index) => (
              <div
                key={meal.id}
                className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border transition-all ${
                  meal.isEnabled
                    ? 'bg-surface border-border shadow-sm hover:border-primary/40'
                    : 'bg-surface-hover/40 border-border/60 opacity-55'
                }`}
              >
                {/* Enable Switch & Meal Name */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleUpdateMeal(meal.id, { isEnabled: !meal.isEnabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 focus:outline-none ${
                      meal.isEnabled ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        meal.isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>

                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-black flex items-center justify-center text-sm shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <input
                        type="text"
                        value={meal.name}
                        disabled={!meal.isEnabled}
                        onChange={(e) => handleUpdateMeal(meal.id, { name: e.target.value })}
                        className="font-bold text-base text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-0.5 transition-colors"
                      />
                      <span className="block text-[11px] font-bold text-muted px-1">
                        {meal.isEnabled ? '🟢 Toma activa' : '⚪ Toma desactivada'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Horario & Calorías Inputs */}
                <div className="flex items-center flex-wrap gap-4 pl-14 md:pl-0">
                  {/* Suggested Time Input */}
                  <div className="flex items-center gap-2 bg-surface-hover px-3 py-2 rounded-xl border border-border">
                    <Clock size={15} className="text-muted shrink-0" />
                    <span className="text-xs font-bold text-muted">Horario:</span>
                    <input
                      type="text"
                      value={meal.suggestedTime}
                      disabled={!meal.isEnabled}
                      onChange={(e) => handleUpdateMeal(meal.id, { suggestedTime: e.target.value })}
                      placeholder="ej. 08:00 AM"
                      className="w-24 text-xs font-extrabold text-foreground bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Target Calories Input */}
                  <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-500/20">
                    <Flame size={16} className="text-amber-500 shrink-0 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Meta:</span>
                    <input
                      type="number"
                      value={meal.targetCalories}
                      disabled={!meal.isEnabled}
                      onChange={(e) => handleUpdateMeal(meal.id, { targetCalories: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-16 text-xs font-black text-amber-700 dark:text-amber-400 bg-transparent focus:outline-none text-right"
                    />
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">kcal</span>
                  </div>

                  {/* Delete Meal Button if custom */}
                  {currentDayData.meals.length > 3 && (
                    <button
                      onClick={() => handleDeleteMeal(meal.id, meal.name)}
                      className="p-2 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      title="Eliminar esta toma del día"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Custom Meal & Save Footer Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-border mt-8">
            <button
              onClick={handleAddCustomMeal}
              className="px-5 py-3 bg-surface-hover hover:bg-border text-foreground font-bold rounded-2xl text-xs transition-all border border-border flex items-center justify-center gap-2"
            >
              <Plus size={16} /> + Agregar nueva toma o colación a este día
            </button>

            <button
              onClick={handleSaveConfiguration}
              className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Save size={18} />
              <span>💾 Guardar Estructura Semanal del Plan</span>
            </button>
          </div>
        </div>
      </div>
      ) : (
        /* Weekly Exercise Schedule View (HU21) */
        <WeeklyExerciseSchedule
          planId={activePlan.id}
          patientId="p-101"
          assignedExercises={assignedExercises}
          onOpenSelector={(day) => {
            if (day) setExerciseSelectorDefaultDay(day);
            setShowExerciseSelector(true);
          }}
          onDeleteExercise={handleDeleteAssignedExercise}
          onOpenMobilePreview={() => {
            setShowMobilePreviewModal(true);
          }}
        />
      )}

      {/* Modal de Sincronización y Simulación Móvil (HU21 / PROYEC-678) */}
      <MobileExerciseSyncModal
        isOpen={showMobilePreviewModal}
        onClose={() => setShowMobilePreviewModal(false)}
        patientId="p-101"
        planTitle={activePlan.title}
      />

      {/* Modal de Creación de Nuevo Plan */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                <Plus className="text-primary" /> Crear Nuevo Plan Nutricional
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-muted hover:text-foreground p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewPlan} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-muted uppercase tracking-wider mb-1.5">
                  Título de la Estructura / Plan
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Plan Aumento Muscular (2,400 kcal)"
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-muted uppercase tracking-wider mb-1.5">
                  Paciente Asignado
                </label>
                {availablePatients.length > 0 ? (
                  <select
                    value={newPlanPatient}
                    onChange={(e) => setNewPlanPatient(e.target.value)}
                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">— Selecciona un paciente —</option>
                    {availablePatients.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="ej. Laura Vásquez"
                    value={newPlanPatient}
                    onChange={(e) => setNewPlanPatient(e.target.value)}
                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-muted uppercase tracking-wider mb-1.5">
                  Objetivo Clínico
                </label>
                <textarea
                  rows={2}
                  placeholder="ej. Pérdida de peso controlada con alta saciedad"
                  value={newPlanObjective}
                  onChange={(e) => setNewPlanObjective(e.target.value)}
                  className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 bg-surface-hover hover:bg-border text-foreground rounded-xl text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-gray-900 rounded-xl text-xs font-extrabold transition-all shadow-md"
                >
                  Crear y Configurar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Selección y Asignación de Platos */}
      {selectedSlotForMenu && (
        <MenuSelectorModal
          isOpen={!!selectedSlotForMenu}
          onClose={() => setSelectedSlotForMenu(null)}
          dayName={selectedSlotForMenu.day}
          mealConfig={selectedSlotForMenu.meal}
          catalog={dishCatalog}
          onAssignDish={handleAssignDish}
        />
      )}

      {/* Modal para Seleccionar Ejercicios y Asociarlos al Seguimiento (HU21) */}
      <ExerciseSelectorModal
        isOpen={showExerciseSelector}
        onClose={() => setShowExerciseSelector(false)}
        onAssign={handleAssignExercise}
        patientId="p-101"
        defaultDay={exerciseSelectorDefaultDay}
      />
    </div>
  );
}

// Función auxiliar para mapear categorías del módulo Alimentos a categorías del módulo Planes
function mapFoodCategoryToDishCategory(foodCategory: string): import('./types').DishCategory {
  switch (foodCategory) {
    case 'Proteínas':
    case 'Verduras':
      return 'Almuerzos / Cenas';
    case 'Frutas':
    case 'Lácteos':
      return 'Colaciones';
    case 'Carbohidratos':
    case 'Grasas':
      return 'Desayunos';
    default:
      return 'Almuerzos / Cenas';
  }
}
