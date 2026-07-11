import React, { useState, useEffect } from 'react';
import { X, Dumbbell, Flame, Clock } from 'lucide-react';
import type { ExerciseItem, ExerciseCategory, ExerciseDifficulty, CreateExerciseInput } from '../types';

interface ExerciseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateExerciseInput, isEdit: boolean, id?: string) => void;
  initialData?: ExerciseItem | null;
}

const CATEGORIES: ExerciseCategory[] = [
  'Fuerza',
  'Cardio',
  'Flexibilidad',
  'Equilibrio',
  'HIIT',
  'Rehabilitación',
];

const DIFFICULTIES: ExerciseDifficulty[] = ['Principiante', 'Intermedio', 'Avanzado'];

export function ExerciseFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ExerciseFormModalProps) {
  const isEdit = !!initialData;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('Fuerza');
  const [muscleGroup, setMuscleGroup] = useState('Piernas y Glúteos');
  const [difficulty, setDifficulty] = useState<ExerciseDifficulty>('Principiante');
  const [metValue, setMetValue] = useState('5.0');
  const [recommendedDurationMin, setRecommendedDurationMin] = useState('15');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setMuscleGroup(initialData.muscleGroup);
      setDifficulty(initialData.difficulty);
      setMetValue(String(initialData.metValue));
      setRecommendedDurationMin(String(initialData.recommendedDurationMin));
      setDescription(initialData.description || '');
    } else {
      setName('');
      setCategory('Fuerza');
      setMuscleGroup('Cuerpo Completo');
      setDifficulty('Principiante');
      setMetValue('5.0');
      setRecommendedDurationMin('20');
      setDescription('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor ingresa el nombre del ejercicio físico');
      return;
    }

    const data: CreateExerciseInput = {
      name: name.trim(),
      category,
      muscleGroup: muscleGroup.trim() || 'Cuerpo Completo',
      difficulty,
      metValue: Number(metValue) || 4.0,
      recommendedDurationMin: Number(recommendedDurationMin) || 15,
      description: description.trim(),
    };

    onSave(data, isEdit, initialData?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-3xl border border-border w-full max-w-lg shadow-2xl overflow-hidden transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-surface-hover/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <Dumbbell size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isEdit ? 'Editar Ejercicio Físico' : 'Nuevo Ejercicio Físico'}
              </h2>
              <p className="text-xs text-muted">
                {isEdit ? 'Actualiza los parámetros clínicos y METs' : 'Registra un nuevo ejercicio en el catálogo clínico'}
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold px-4 py-2.5 rounded-2xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              Nombre del Ejercicio *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Sentadillas con Mancuernas"
              className="w-full bg-surface-hover border border-border rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
                className="w-full bg-surface-hover border border-border rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Dificultad
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as ExerciseDifficulty)}
                className="w-full bg-surface-hover border border-border rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              Grupo Muscular Principal
            </label>
            <input
              type="text"
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value)}
              placeholder="Ej. Piernas y Glúteos, Core, Espalda..."
              className="w-full bg-surface-hover border border-border rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5 flex items-center gap-1.5">
                <Flame size={14} className="text-amber-500" /> Índice MET (Gasto calórico)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="25"
                required
                value={metValue}
                onChange={(e) => setMetValue(e.target.value)}
                placeholder="5.0"
                className="w-full bg-surface-hover border border-border rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5 flex items-center gap-1.5">
                <Clock size={14} className="text-blue-500" /> Duración Recomendada (min)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                required
                value={recommendedDurationMin}
                onChange={(e) => setRecommendedDurationMin(e.target.value)}
                placeholder="20"
                className="w-full bg-surface-hover border border-border rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              Instrucciones / Descripción Clínica
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe técnica correcta, precauciones o progresiones del ejercicio..."
              className="w-full bg-surface-hover border border-border rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-primary hover:bg-primary-hover text-gray-900 shadow-md transition-all active:scale-95"
            >
              {isEdit ? 'Guardar Cambios' : 'Crear Ejercicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
