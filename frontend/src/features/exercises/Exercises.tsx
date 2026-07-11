import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Dumbbell,
  Flame,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import type {
  ExerciseItem,
  ExerciseCategory,
  ExerciseDifficulty,
  CreateExerciseInput,
} from './types';
import { exerciseApi } from './services/exerciseApi';
import { ExerciseFormModal } from './components/ExerciseFormModal';

const CATEGORIES: ('Todos' | ExerciseCategory)[] = [
  'Todos',
  'Fuerza',
  'Cardio',
  'Flexibilidad',
  'Equilibrio',
  'HIIT',
  'Rehabilitación',
];

export function Exercises() {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | ExerciseCategory>('Todos');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'Todos' | ExerciseDifficulty>('Todos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseItem | null>(null);

  useEffect(() => {
    exerciseApi.getExercises().then((data) => {
      setExercises(data);
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleStatus = async (item: ExerciseItem) => {
    const nextState = !item.isActive;
    const updated = await exerciseApi.updateExercise(item.id, { isActive: nextState });
    if (updated) {
      setExercises((prev) => prev.map((exc) => (exc.id === item.id ? updated : exc)));
      showToast(`Ejercicio "${item.name}" marcado como ${nextState ? 'Activo' : 'Inactivo'}`);
    } else {
      setExercises((prev) =>
        prev.map((exc) => (exc.id === item.id ? { ...exc, isActive: nextState } : exc)),
      );
      showToast(`Ejercicio "${item.name}" marcado como ${nextState ? 'Activo' : 'Inactivo'}`);
    }
  };

  const handleDeleteExercise = async (item: ExerciseItem) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar el ejercicio "${item.name}" del catálogo clínico?`,
      )
    ) {
      return;
    }
    await exerciseApi.deleteExercise(item.id);
    setExercises((prev) => prev.filter((exc) => exc.id !== item.id));
    showToast(`Ejercicio "${item.name}" eliminado del catálogo`);
  };

  const handleSaveExercise = async (
    data: CreateExerciseInput,
    isEdit: boolean,
    id?: string,
  ) => {
    if (isEdit && id) {
      const updated = await exerciseApi.updateExercise(id, data);
      if (updated) {
        setExercises((prev) => prev.map((exc) => (exc.id === id ? updated : exc)));
        showToast(`Ejercicio "${data.name}" actualizado exitosamente`);
      } else {
        setExercises((prev) =>
          prev.map((exc) => (exc.id === id ? { ...exc, ...data } : exc)),
        );
        showToast(`Ejercicio "${data.name}" actualizado`);
      }
    } else {
      const created = await exerciseApi.createExercise(data);
      if (created) {
        setExercises((prev) => [created, ...prev]);
        showToast(`Ejercicio "${data.name}" registrado en el catálogo`);
      }
    }
  };

  const filteredExercises = useMemo(() => {
    return exercises.filter((exc) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        exc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exc.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exc.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'Todos' || exc.category === selectedCategory;

      const matchesDifficulty =
        difficultyFilter === 'Todos' || exc.difficulty === difficultyFilter;

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? exc.isActive
          : !exc.isActive;

      return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });
  }, [exercises, searchQuery, selectedCategory, difficultyFilter, statusFilter]);

  const getCategoryBadgeStyle = (category: ExerciseCategory) => {
    switch (category) {
      case 'Fuerza':
        return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30';
      case 'Cardio':
        return 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30';
      case 'HIIT':
        return 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30';
      case 'Flexibilidad':
        return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30';
      case 'Equilibrio':
        return 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30';
      case 'Rehabilitación':
        return 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const getDifficultyBadgeStyle = (diff: ExerciseDifficulty) => {
    switch (diff) {
      case 'Principiante':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'Intermedio':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'Avanzado':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
    }
  };

  const totalActive = exercises.filter((e) => e.isActive).length;
  const totalInactive = exercises.length - totalActive;

  return (
    <div className="max-w-6xl mx-auto pb-12 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in text-sm font-semibold border border-white/10 dark:border-black/10">
          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <Dumbbell size={16} />
            <span>Prescripción de Actividad Física</span>
          </div>
          <h1 className="text-[30px] font-bold text-foreground">Catálogo de Ejercicios</h1>
          <p className="text-muted text-[13px] mt-1">
            Gestiona ejercicios de fuerza, cardio y rehabilitación para complementar el plan de nutrición.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-surface px-4 py-2.5 rounded-2xl border border-border flex items-center gap-4 shadow-sm">
            <div className="text-center">
              <span className="text-[11px] text-muted font-semibold block">Total</span>
              <span className="text-base font-bold text-foreground">{exercises.length}</span>
            </div>
            <div className="h-6 w-px bg-border"></div>
            <div className="text-center">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                Activos
              </span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {totalActive}
              </span>
            </div>
            <div className="h-6 w-px bg-border"></div>
            <div className="text-center">
              <span className="text-[11px] text-muted font-semibold block">Inactivos</span>
              <span className="text-base font-bold text-muted">{totalInactive}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingExercise(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-gray-900 font-semibold py-3 px-6 rounded-2xl transition-all text-sm shadow-md hover:shadow-lg active:scale-95 shrink-0"
          >
            <Plus size={18} /> Nuevo Ejercicio
          </button>
        </div>
      </div>

      {/* Search and Category Filters Bar */}
      <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm mb-6 space-y-5 transition-colors">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, grupo muscular o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded-2xl pl-11 pr-24 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted hover:text-foreground bg-surface p-1 rounded-full border border-border"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Toggle */}
          <div className="flex items-center gap-2 bg-surface-hover p-1.5 rounded-2xl border border-border shrink-0 self-start md:self-auto">
            <span className="text-xs font-semibold text-muted px-2 flex items-center gap-1">
              <Filter size={13} /> Estado:
            </span>
            {(['all', 'active', 'inactive'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-surface text-foreground shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {st === 'all' ? 'Todos' : st === 'active' ? 'Activos' : 'Inactivos'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills (HU20 / PROYEC-673) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm'
                    : 'bg-surface-hover text-muted hover:text-foreground border border-border'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Difficulty Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider shrink-0">
              ⚡ Dificultad:
            </span>
            {(['Todos', 'Principiante', 'Intermedio', 'Avanzado'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  difficultyFilter === diff
                    ? 'bg-primary text-gray-900 border-primary shadow-sm'
                    : 'bg-surface-hover text-foreground border-border'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {(searchQuery ||
            selectedCategory !== 'Todos' ||
            statusFilter !== 'all' ||
            difficultyFilter !== 'Todos') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
                setStatusFilter('all');
                setDifficultyFilter('Todos');
              }}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl transition-all"
            >
              Restablecer Filtros
            </button>
          )}
        </div>
      </div>

      {/* Exercises Table (HU20 / PROYEC-671) */}
      <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm transition-colors">
        {filteredExercises.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left border-collapse">
              <thead>
                <tr className="bg-surface-hover border-b border-border text-[11px] uppercase tracking-wider text-muted font-extrabold">
                  <th className="py-4 px-4">Ejercicio Físico</th>
                  <th className="py-4 px-4">Grupo Muscular</th>
                  <th className="py-4 px-4">Dificultad</th>
                  <th className="py-4 px-4 whitespace-nowrap">MET / Calorías</th>
                  <th className="py-4 px-4 whitespace-nowrap">Duración Sugerida</th>
                  <th className="py-4 px-4 text-center">Estado</th>
                  <th className="py-4 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredExercises.map((exc) => (
                  <tr
                    key={exc.id}
                    className={`hover:bg-surface-hover/50 transition-colors ${
                      !exc.isActive ? 'opacity-60 bg-gray-50/50 dark:bg-gray-900/20' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold text-base shrink-0">
                          <Dumbbell size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground leading-snug">
                            {exc.name}
                          </p>
                          <span
                            className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold tracking-wide ${getCategoryBadgeStyle(
                              exc.category,
                            )}`}
                          >
                            {exc.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-xs font-semibold text-foreground bg-surface-hover px-3 py-1.5 rounded-xl border border-border inline-block">
                        {exc.muscleGroup}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl inline-block ${getDifficultyBadgeStyle(
                          exc.difficulty,
                        )}`}
                      >
                        {exc.difficulty}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                        <Flame size={15} className="shrink-0" />
                        <span>MET {exc.metValue}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-sm">
                        <Clock size={15} className="shrink-0" />
                        <span>{exc.recommendedDurationMin} min</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(exc)}
                        title={exc.isActive ? 'Desactivar ejercicio' : 'Activar ejercicio'}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          exc.isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                            exc.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingExercise(exc);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all text-xs font-semibold"
                          title="Editar ejercicio"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteExercise(exc)}
                          className="p-2 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all text-xs font-semibold"
                          title="Eliminar ejercicio"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center text-muted mb-4 border border-border shadow-inner">
              <Dumbbell size={28} className="opacity-50 text-primary" />
            </div>
            <h3 className="text-xl font-extrabold text-foreground">No se encontraron ejercicios</h3>
            <p className="text-muted text-sm max-w-md mt-1.5">
              No hay ejercicios físicos que coincidan con los filtros seleccionados en el catálogo.
            </p>
          </div>
        )}
      </div>

      <ExerciseFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExercise(null);
        }}
        onSave={handleSaveExercise}
        initialData={editingExercise}
      />
    </div>
  );
}
