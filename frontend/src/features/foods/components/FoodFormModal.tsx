import { useState, useEffect } from 'react';
import { X, Flame, Sparkles, Check, AlertCircle } from 'lucide-react';
import type { Food, FoodCategory, CreateFoodInput } from '../types';

interface FoodFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateFoodInput | Food) => void;
  initialData?: Food | null;
}

const CATEGORIES: FoodCategory[] = [
  'Proteínas',
  'Carbohidratos',
  'Grasas',
  'Frutas',
  'Verduras',
  'Lácteos',
];

export function FoodFormModal({ isOpen, onClose, onSave, initialData }: FoodFormModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Proteínas');
  const [servingSize, setServingSize] = useState('100g');
  const [calories, setCalories] = useState<number | ''>(0);
  const [protein, setProtein] = useState<number | ''>(0);
  const [carbs, setCarbs] = useState<number | ''>(0);
  const [fat, setFat] = useState<number | ''>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setServingSize(initialData.servingSize);
      setCalories(initialData.calories);
      setProtein(initialData.protein);
      setCarbs(initialData.carbs);
      setFat(initialData.fat);
    } else {
      setName('');
      setCategory('Proteínas');
      setServingSize('100g');
      setCalories(0);
      setProtein(0);
      setCarbs(0);
      setFat(0);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Cálculo de calorías en tiempo real: (P * 4) + (C * 4) + (G * 9)
  const estimatedCalories = Math.round(
    (Number(protein) || 0) * 4 + (Number(carbs) || 0) * 4 + (Number(fat) || 0) * 9
  );

  const calDifference = Math.abs((Number(calories) || 0) - estimatedCalories);
  const isDiffSignificant = calDifference > 15 && (Number(protein) > 0 || Number(carbs) > 0 || Number(fat) > 0);

  const handleApplyEstimated = () => {
    setCalories(estimatedCalories);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, ingresa el nombre del alimento.');
      return;
    }
    if (!servingSize.trim()) {
      setError('Por favor, especifica la ración o unidad de medida.');
      return;
    }
    if (calories === '' || Number(calories) < 0) {
      setError('Las calorías deben ser un número válido mayor o igual a 0.');
      return;
    }

    const payload = {
      name: name.trim(),
      category,
      servingSize: servingSize.trim(),
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    };

    if (initialData) {
      onSave({ ...initialData, ...payload });
    } else {
      onSave(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div
        className="bg-surface border border-border rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden transition-colors my-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="bg-surface-hover/80 border-b border-border px-8 py-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary block mb-1">
              {initialData ? 'Edición de Registro' : 'Nuevo Registro Nutricional'}
            </span>
            <h2 className="text-2xl font-bold text-foreground">
              {initialData ? `Editar "${initialData.name}"` : 'Crear Alimento'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface hover:bg-border flex items-center justify-center text-muted hover:text-foreground transition-colors border border-border"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nombre y Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-muted mb-2">
                Nombre del Alimento *
              </label>
              <input
                type="text"
                placeholder="ej. Pechuga de Pollo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-hover border border-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-muted mb-2">
                Categoría Nutricional *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full bg-surface-hover border border-border rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer font-semibold"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-surface text-foreground font-semibold">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ración / Unidad */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-muted mb-2">
              Ración o Unidad de Medida *
            </label>
            <input
              type="text"
              placeholder="ej. 100g, 1 taza (200ml), 1 pieza mediana"
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              required
            />
            <span className="text-[11px] text-muted font-medium mt-1.5 block">
              💡 Todas las calorías y macronutrientes deben ser calculados en base a esta ración.
            </span>
          </div>

          {/* Grid de Macronutrientes */}
          <div className="border-t border-b border-border py-6">
            <span className="text-xs font-extrabold uppercase tracking-wider text-foreground block mb-4">
              Macronutrientes (por ración)
            </span>
            <div className="grid grid-cols-3 gap-4">
              {/* Proteína */}
              <div className="bg-blue-50/50 dark:bg-blue-500/5 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-500/20">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-1.5">
                  Proteínas (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-base font-extrabold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Carbohidratos */}
              <div className="bg-amber-50/50 dark:bg-amber-500/5 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-500/20">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1.5">
                  Carbos (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-base font-extrabold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>

              {/* Grasas */}
              <div className="bg-purple-50/50 dark:bg-purple-500/5 p-3.5 rounded-2xl border border-purple-200 dark:border-purple-500/20">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400 mb-1.5">
                  Grasas (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={fat}
                  onChange={(e) => setFat(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-base font-extrabold text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Calorías y Calculadora en Tiempo Real */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-muted mb-2 flex items-center justify-between">
                <span>Calorías Totales (kcal) *</span>
              </label>
              <div className="relative">
                <Flame className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-surface-hover border border-border rounded-2xl pl-12 pr-4 py-3 text-lg font-extrabold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Banner de Calculadora WOW */}
            <div
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDiffSignificant
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-primary/5 dark:bg-primary/10 border-primary/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <Sparkles
                  size={20}
                  className={isDiffSignificant ? 'text-amber-500 shrink-0 mt-0.5' : 'text-primary shrink-0 mt-0.5'}
                />
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Cálculo Estimado de Macros: <span className="font-extrabold text-sm">{estimatedCalories} kcal</span>
                  </span>
                  <span className="text-[11px] text-muted font-medium block">
                    {isDiffSignificant
                      ? 'Difiere un poco de las calorías ingresadas. ¿Deseas aplicar el valor calculado?'
                      : 'Cálculo estándar basado en (P×4 + C×4 + G×9).'}
                  </span>
                </div>
              </div>

              {Number(calories) !== estimatedCalories && (
                <button
                  type="button"
                  onClick={handleApplyEstimated}
                  className="bg-surface hover:bg-border text-foreground text-xs font-extrabold py-2 px-3.5 rounded-xl border border-border shadow-sm transition-all shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Check size={14} className="text-emerald-500" /> Usar {estimatedCalories} kcal
                </button>
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-surface-hover hover:bg-border text-foreground font-semibold text-sm transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-gray-900 font-extrabold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              {initialData ? 'Guardar Cambios' : 'Crear Alimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
