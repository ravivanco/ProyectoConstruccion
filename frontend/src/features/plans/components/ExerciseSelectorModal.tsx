import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Dumbbell, Flame, Clock, Check } from 'lucide-react';
import { exerciseApi } from '../../exercises/services/exerciseApi';
import type { ExerciseItem } from '../../exercises/types';
import type { DayOfWeek, CreateAssignedExerciseInput } from '../services/assignedExerciseApi';

interface ExerciseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (data: CreateAssignedExerciseInput) => void;
  patientId: string;
  defaultDay?: DayOfWeek;
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

export function ExerciseSelectorModal({
  isOpen,
  onClose,
  onAssign,
  patientId,
  defaultDay = 'Lunes',
}: ExerciseSelectorModalProps) {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(defaultDay);
  const [durationMin, setDurationMin] = useState<number>(20);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      exerciseApi.getExercises().then((list) => {
        setExercises(list.filter((e) => e.isActive));
      });
      setDayOfWeek(defaultDay);
      setSelectedExercise(null);
      setSearch('');
      setSelectedCategory('Todos');
      setNotes('');
    }
  }, [isOpen, defaultDay]);

  const categories = useMemo(() => {
    const cats = new Set(exercises.map((e) => e.category));
    return ['Todos', ...Array.from(cats)];
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    return exercises.filter((exc) => {
      const matchSearch =
        search.trim() === '' ||
        exc.name.toLowerCase().includes(search.toLowerCase()) ||
        exc.muscleGroup.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        selectedCategory === 'Todos' || exc.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [exercises, search, selectedCategory]);

  if (!isOpen) return null;

  const handleSelectExercise = (exc: ExerciseItem) => {
    setSelectedExercise(exc);
    setDurationMin(exc.recommendedDurationMin || 20);
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise) return;

    onAssign({
      patientId,
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      category: selectedExercise.category,
      metValue: selectedExercise.metValue,
      durationMin: Number(durationMin) || 20,
      dayOfWeek,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-3xl border border-border w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden transition-all">
        {/* Modal Header Fijo */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface-hover/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <Dumbbell size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Seleccionar Ejercicio para Seguimiento
              </h2>
              <p className="text-[11px] sm:text-xs text-muted">
                Elige un ejercicio del catálogo y asígnalo a la rutina semanal del paciente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-foreground rounded-xl hover:bg-surface transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Deslizable */}
        <div className="flex flex-col flex-1 overflow-hidden p-5 space-y-4">
          {/* Categorías y Buscador */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type="text"
                placeholder="Buscar ejercicio o grupo muscular..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-hover border border-border rounded-2xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-surface-hover border border-border rounded-2xl px-4 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shrink-0"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Categoría: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Lista de Ejercicios Deslizable */}
          <div className="flex-1 overflow-y-auto border border-border rounded-2xl divide-y divide-border bg-surface-hover/30 max-h-[220px]">
            {filteredExercises.length > 0 ? (
              filteredExercises.map((exc) => {
                const isSelected = selectedExercise?.id === exc.id;
                return (
                  <button
                    key={exc.id}
                    type="button"
                    onClick={() => handleSelectExercise(exc)}
                    className={`w-full text-left p-3.5 flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-primary/15 border-l-4 border-primary'
                        : 'hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? 'bg-primary text-gray-900'
                            : 'bg-surface border border-border text-muted'
                        }`}
                      >
                        {isSelected ? <Check size={16} /> : <Dumbbell size={15} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{exc.name}</p>
                        <p className="text-[11px] text-muted">
                          {exc.category} • {exc.muscleGroup}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Flame size={13} /> MET {exc.metValue}
                      </span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Clock size={13} /> {exc.recommendedDurationMin}m
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-muted">
                No hay ejercicios que coincidan con la búsqueda.
              </div>
            )}
          </div>

          {/* Panel de Asignación cuando hay un ejercicio seleccionado */}
          {selectedExercise && (
            <div className="bg-surface-hover/80 border border-border rounded-2xl p-4 space-y-3 animate-fade-in shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
                  Configurar Prescripción para el Paciente
                </span>
                <span className="text-xs font-bold text-foreground">
                  {selectedExercise.name}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1">
                    Día de la Semana
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={durationMin}
                    onChange={(e) => setDurationMin(Number(e.target.value))}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1">
                  Notas / Indicaciones clínicas (Series, repeticiones, descanso)
                </label>
                <input
                  type="text"
                  placeholder="Ej. 3 series de 12 repeticiones con descanso de 45 seg..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Fijo */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-surface shrink-0">
          <span className="text-xs text-muted">
            {selectedExercise
              ? `Calorías est: ~${Math.round(selectedExercise.metValue * 1.2 * durationMin)} kcal`
              : 'Selecciona un ejercicio de la lista superior'}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-muted hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!selectedExercise}
              onClick={handleConfirmAssign}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover disabled:opacity-40 text-gray-900 shadow-md transition-all active:scale-95"
            >
              Asignar al {dayOfWeek}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
