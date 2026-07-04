import { useState, useMemo } from 'react';
import { Search, Sparkles, Plus, Flame, Tag, X } from 'lucide-react';
import type { DayOfWeek, MealConfig, DishTemplate } from '../types';

interface MenuSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayName: DayOfWeek;
  mealConfig: MealConfig;
  catalog: DishTemplate[];
  onAssignDish: (dish: DishTemplate, portionMultiplier: number, customNotes?: string) => void;
}

export const MenuSelectorModal: React.FC<MenuSelectorModalProps> = ({
  isOpen,
  onClose,
  dayName,
  mealConfig,
  catalog,
  onAssignDish,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [smartMatchOnly, setSmartMatchOnly] = useState(false);
  const [portionMultipliers, setPortionMultipliers] = useState<Record<string, number>>({});
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const categories = ['Todos', 'Desayunos', 'Almuerzos / Cenas', 'Colaciones', 'Bebidas y Batidos'];

  const targetCals = Number(mealConfig.targetCalories) || 400;

  // Filtrado dinámico
  const filteredDishes = useMemo(() => {
    return catalog.filter((dish) => {
      // 1. Búsqueda por texto
      const matchesSearch =
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchesSearch) return false;

      // 2. Filtro de Categoría
      if (selectedCategory !== 'Todos' && dish.category !== selectedCategory) {
        return false;
      }

      // 3. Recomendación Inteligente (~ Meta calórica +- 180 kcal o misma categoría de comida)
      if (smartMatchOnly) {
        const mult = portionMultipliers[dish.id] || 1;
        const totalCals = dish.calories * mult;
        const isCalorieMatch = Math.abs(totalCals - targetCals) <= 180;
        
        // Emparejamiento por tipo de comida
        const isCategoryMatch =
          (mealConfig.name.toLowerCase().includes('desayuno') && dish.category === 'Desayunos') ||
          ((mealConfig.name.toLowerCase().includes('almuerzo') || mealConfig.name.toLowerCase().includes('cena')) && dish.category === 'Almuerzos / Cenas') ||
          (mealConfig.name.toLowerCase().includes('colación') && (dish.category === 'Colaciones' || dish.category === 'Bebidas y Batidos'));

        return isCalorieMatch || isCategoryMatch;
      }

      return true;
    });
  }, [catalog, searchTerm, selectedCategory, smartMatchOnly, portionMultipliers, targetCals, mealConfig.name]);

  const getMultiplier = (id: string) => portionMultipliers[id] || 1;

  const handleSetMultiplier = (id: string, mult: number) => {
    setPortionMultipliers((prev) => ({ ...prev, [id]: mult }));
  };

  const handleConfirmAssignment = (dish: DishTemplate) => {
    const mult = getMultiplier(dish.id);
    onAssignDish(dish, mult, notes.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 max-w-4xl w-full shadow-2xl space-y-6 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Cabecera del Modal */}
        <div className="flex items-start justify-between border-b border-border pb-4 shrink-0">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-black uppercase tracking-wider mb-1">
              <span>Asignación de Menú Clínico</span>
            </div>
            <h3 className="text-2xl font-extrabold text-foreground">
              {dayName} • <span className="text-primary">{mealConfig.name}</span>
            </h3>
            <p className="text-muted text-xs mt-0.5 flex items-center gap-2 font-bold">
              <span>Horario Sugerido: {mealConfig.suggestedTime || '---'}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400">Meta Calórica de la Toma: ~{targetCals} kcal</span>
            </p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground p-1 rounded-xl transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Barra de Búsqueda y Botón WOW Recomendador */}
        <div className="space-y-4 shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-3.5 text-muted" size={18} />
              <input
                type="text"
                placeholder="Buscar por receta, ingrediente o etiqueta (ej. Proteína, Avena, Salmón)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface-hover/60 border border-border rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-3.5 text-muted hover:text-foreground">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* 🔥 WOW Feature: Smart Recommendation Button */}
            <button
              type="button"
              onClick={() => setSmartMatchOnly(!smartMatchOnly)}
              className={`px-5 py-3 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 shadow-sm border ${
                smartMatchOnly
                  ? 'bg-amber-400 text-gray-950 border-amber-300 shadow-amber-500/20 shadow-lg scale-[1.02]'
                  : 'bg-surface hover:bg-surface-hover text-foreground border-border'
              }`}
            >
              <Sparkles size={16} className={smartMatchOnly ? 'fill-current animate-pulse' : 'text-amber-500'} />
              <span>Recomendación Inteligente (~{targetCals} kcal)</span>
            </button>
          </div>

          {/* Filtros de Categoría */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-primary text-gray-900 shadow-xs'
                    : 'bg-surface text-muted hover:text-foreground border border-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {smartMatchOnly && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-3 flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300 animate-fade-in">
              <span className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500 shrink-0" />
                <span>Mostrando platos óptimos en calorías (~{targetCals} kcal) y concordancia con {mealConfig.name}.</span>
              </span>
              <button onClick={() => setSmartMatchOnly(false)} className="underline font-extrabold text-amber-600 dark:text-amber-400">
                Ver todo el catálogo
              </button>
            </div>
          )}
        </div>

        {/* Lista / Catálogo de Platos (Scrollable) */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3">
          {filteredDishes.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-3xl space-y-3">
              <p className="text-muted font-bold text-base">No se encontraron platos que coincidan con tu búsqueda.</p>
              {smartMatchOnly && (
                <button
                  onClick={() => setSmartMatchOnly(false)}
                  className="px-4 py-2 bg-primary/20 text-primary font-extrabold rounded-xl text-xs hover:bg-primary/30 transition-all"
                >
                  Desactivar filtro inteligente
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredDishes.map((dish) => {
                const mult = getMultiplier(dish.id);
                const calcCals = Math.round(dish.calories * mult);
                const calcProt = Math.round(dish.protein * mult);
                const calcCarbs = Math.round(dish.carbs * mult);
                const calcFat = Math.round(dish.fat * mult);
                const isSelected = selectedDishId === dish.id;

                return (
                  <div
                    key={dish.id}
                    onClick={() => setSelectedDishId(dish.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/30'
                        : 'bg-surface hover:bg-surface-hover/50 border-border'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-extrabold text-sm text-foreground leading-snug">{dish.name}</h4>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-surface-hover px-2 py-0.5 rounded-md border border-border text-muted shrink-0">
                          {dish.category}
                        </span>
                      </div>

                      <p className="text-xs text-muted mt-1 font-medium italic">
                        Porción base: {dish.defaultPortion}
                      </p>

                      {/* Etiquetas / Tags */}
                      {dish.tags && dish.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {dish.tags.map((t) => (
                            <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                              <Tag size={10} /> {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 space-y-3">
                      {/* Breakdown de Macros */}
                      <div className="grid grid-cols-4 gap-1 text-center bg-surface-hover/60 p-2 rounded-xl border border-border/40">
                        <div>
                          <span className="block text-[10px] text-muted font-extrabold uppercase">Calorías</span>
                          <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center justify-center gap-0.5">
                            <Flame size={12} /> {calcCals}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-muted font-extrabold uppercase">Proteína</span>
                          <span className="text-xs font-black text-blue-600 dark:text-blue-400">{calcProt}g</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-muted font-extrabold uppercase">Carbos</span>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{calcCarbs}g</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-muted font-extrabold uppercase">Grasas</span>
                          <span className="text-xs font-black text-purple-600 dark:text-purple-400">{calcFat}g</span>
                        </div>
                      </div>

                      {/* Ajustador de Porción y Botón Añadir */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1 bg-surface rounded-xl p-1 border border-border">
                          {[0.5, 1, 1.5, 2].map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetMultiplier(dish.id, m);
                              }}
                              className={`px-2 py-1 rounded-lg text-xs font-black transition-colors ${
                                mult === m
                                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 shadow-xs'
                                  : 'text-muted hover:text-foreground'
                              }`}
                            >
                              {m}x
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmAssignment(dish);
                          }}
                          className="bg-primary hover:bg-primary-hover text-gray-950 font-black px-4 py-2 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1 active:scale-95 shrink-0"
                        >
                          <Plus size={14} />
                          <span>Asignar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pie del Modal con opción para añadir nota extra */}
        <div className="pt-4 border-t border-border shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Nota opcional para el paciente (ej. Acompañar con té verde sin azúcar)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex-1 bg-surface-hover/60 border border-border rounded-xl px-4 py-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
          />
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-surface-hover hover:bg-border text-foreground font-bold rounded-xl text-xs transition-all border border-border shrink-0 w-full sm:w-auto"
          >
            Cerrar selector
          </button>
        </div>

      </div>
    </div>
  );
};
