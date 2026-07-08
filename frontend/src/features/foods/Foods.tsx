import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Apple, Flame, Edit2, CheckCircle2, Filter } from 'lucide-react';
import type { Food, FoodCategory, CreateFoodInput, NutritionalFilter } from './types';
import { INITIAL_FOODS } from './services/mockFoods';
import { foodApi } from './services/foodApi';
import { FoodFormModal } from './components/FoodFormModal';

const CATEGORIES: ('Todos' | FoodCategory)[] = [
  'Todos',
  'Proteínas',
  'Carbohidratos',
  'Grasas',
  'Frutas',
  'Verduras',
  'Lácteos',
];

function HighlightText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${highlight.trim()})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.trim().toLowerCase() ? (
          <span
            key={i}
            className="bg-amber-300 dark:bg-amber-500/40 text-gray-900 dark:text-white font-extrabold px-1 rounded shadow-sm"
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
}

export function Foods() {
  const [foods, setFoods] = useState<Food[]>(() => {
    const saved = localStorage.getItem('dkfitt_foods');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_FOODS;
      }
    }
    return INITIAL_FOODS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | FoodCategory>('Todos');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [nutritionalFilter, setNutritionalFilter] = useState<NutritionalFilter>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [prefillFoodName, setPrefillFoodName] = useState('');

  useEffect(() => {
    foodApi.getFoods().then((data) => {
      if (data && data.length > 0) {
        setFoods(data);
      }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('dkfitt_foods', JSON.stringify(foods));
  }, [foods]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleStatus = (id: string) => {
    setFoods((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const nextState = !f.isActive;
          showToast(`Alimento "${f.name}" marcado como ${nextState ? 'Activo' : 'Inactivo'}`);
          return { ...f, isActive: nextState };
        }
        return f;
      })
    );
  };

  const handleOpenCreateModal = (prefill?: string) => {
    setEditingFood(null);
    setPrefillFoodName(typeof prefill === 'string' ? prefill : '');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (food: Food) => {
    setEditingFood(food);
    setPrefillFoodName('');
    setIsModalOpen(true);
  };

  const handleSaveFood = (foodData: CreateFoodInput | Food) => {
    if ('id' in foodData) {
      // Modo Edición
      setFoods((prev) => prev.map((f) => (f.id === foodData.id ? foodData : f)));
      showToast(`Alimento "${foodData.name}" actualizado correctamente.`);
    } else {
      // Modo Creación
      const newFood: Food = {
        ...foodData,
        id: `f-${Date.now()}`,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setFoods((prev) => [newFood, ...prev]);
      showToast(`Alimento "${newFood.name}" registrado con éxito.`);
    }
  };

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        food.name.toLowerCase().includes(query) ||
        food.servingSize.toLowerCase().includes(query) ||
        food.category.toLowerCase().includes(query);

      const matchesCategory = selectedCategory === 'Todos' || food.category === selectedCategory;
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? food.isActive
          : !food.isActive;

      const matchesNutritional =
        nutritionalFilter === 'all'
          ? true
          : nutritionalFilter === 'high-protein'
          ? food.protein >= 15
          : nutritionalFilter === 'low-carb'
          ? food.carbs <= 15
          : nutritionalFilter === 'low-fat'
          ? food.fat <= 5
          : nutritionalFilter === 'low-cal'
          ? food.calories <= 120
          : true;

      return matchesSearch && matchesCategory && matchesStatus && matchesNutritional;
    });
  }, [foods, searchQuery, selectedCategory, statusFilter, nutritionalFilter]);

  const getCategoryBadgeStyle = (category: FoodCategory) => {
    switch (category) {
      case 'Proteínas':
        return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30';
      case 'Carbohidratos':
        return 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30';
      case 'Grasas':
        return 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30';
      case 'Frutas':
        return 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30';
      case 'Verduras':
        return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30';
      case 'Lácteos':
        return 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  // Resumen de estadísticas rápidas
  const totalActive = foods.filter((f) => f.isActive).length;
  const totalInactive = foods.length - totalActive;

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
            <Apple size={16} />
            <span>Base de Datos Nutricional</span>
          </div>
          <h1 className="text-[30px] font-bold text-foreground">Alimentos y Recetas</h1>
          <p className="text-muted text-[13px] mt-1">
            Gestiona la biblioteca de alimentos para calcular y prescribir planes de alimentación.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-surface px-4 py-2.5 rounded-2xl border border-border flex items-center gap-4 shadow-sm">
            <div className="text-center">
              <span className="text-[11px] text-muted font-semibold block">Total</span>
              <span className="text-base font-bold text-foreground">{foods.length}</span>
            </div>
            <div className="h-6 w-px bg-border"></div>
            <div className="text-center">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">Activos</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{totalActive}</span>
            </div>
            <div className="h-6 w-px bg-border"></div>
            <div className="text-center">
              <span className="text-[11px] text-muted font-semibold block">Inactivos</span>
              <span className="text-base font-bold text-muted">{totalInactive}</span>
            </div>
          </div>

          <button
            onClick={() => handleOpenCreateModal()}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-gray-900 font-semibold py-3 px-6 rounded-2xl transition-all text-sm shadow-md hover:shadow-lg active:scale-95 shrink-0"
          >
            <Plus size={18} /> Nuevo Alimento
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm mb-6 space-y-5 transition-colors">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, ración o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded-2xl pl-11 pr-24 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery && (
                <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full whitespace-nowrap">
                  {filteredFoods.length} efic.
                </span>
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-semibold text-muted hover:text-foreground bg-surface p-1 rounded-full border border-border"
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>
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

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
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

        {/* Quick Nutritional Filters (Chips WOW) */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider shrink-0 flex items-center gap-1">
              <span>⚡ Filtros Nutricionales:</span>
            </span>
            {[
              { id: 'all', label: 'Todos los macros', color: 'bg-surface-hover text-foreground' },
              { id: 'high-protein', label: '⚡ Alto en Proteína (>15g)', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
              { id: 'low-carb', label: '🍃 Bajo en Carbos (≤15g)', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
              { id: 'low-fat', label: '🥑 Bajo en Grasa (≤5g)', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
              { id: 'low-cal', label: '🔥 Bajo en Calorías (≤120 kcal)', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
            ].map((chip) => {
              const isActive = nutritionalFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setNutritionalFilter(chip.id as NutritionalFilter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isActive
                      ? 'bg-primary text-gray-900 border-primary shadow-sm font-extrabold'
                      : `${chip.color} border-border hover:border-muted`
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Active Filters Counter & Clear Button */}
          {(searchQuery || selectedCategory !== 'Todos' || statusFilter !== 'all' || nutritionalFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
                setStatusFilter('all');
                setNutritionalFilter('all');
              }}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ml-auto"
            >
              <span>Limpiar Filtros Activos</span>
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
                {[
                  searchQuery ? 1 : 0,
                  selectedCategory !== 'Todos' ? 1 : 0,
                  statusFilter !== 'all' ? 1 : 0,
                  nutritionalFilter !== 'all' ? 1 : 0,
                ].reduce((a, b) => a + b, 0)}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Foods Table */}
      <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm transition-colors">
        {filteredFoods.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left border-collapse">
              <thead>
                <tr className="bg-surface-hover border-b border-border text-[11px] uppercase tracking-wider text-muted font-extrabold">
                  <th className="py-4 px-4">Alimento</th>
                  <th className="py-4 px-4">Ración / Unidad</th>
                  <th className="py-4 px-4 whitespace-nowrap">Calorías (kcal)</th>
                  <th className="py-4 px-4 whitespace-nowrap">Desglose de Macros</th>
                  <th className="py-4 px-4 text-center">Estado</th>
                  <th className="py-4 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFoods.map((food) => (
                  <tr
                    key={food.id}
                    className={`hover:bg-surface-hover/50 transition-colors ${
                      !food.isActive ? 'opacity-60 bg-gray-50/50 dark:bg-gray-900/20' : ''
                    }`}
                  >
                    {/* Nombre y Categoría */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold text-base shrink-0">
                          {food.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground leading-snug">
                            <HighlightText text={food.name} highlight={searchQuery} />
                          </p>
                          <span
                            className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold tracking-wide ${getCategoryBadgeStyle(
                              food.category
                            )}`}
                          >
                            {food.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Ración */}
                    <td className="py-4 px-6">
                      <span className="text-sm font-semibold text-foreground bg-surface-hover px-3 py-1.5 rounded-xl border border-border inline-block">
                        <HighlightText text={food.servingSize} highlight={searchQuery} />
                      </span>
                    </td>

                    {/* Calorías */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-base">
                        <Flame size={16} className="shrink-0" />
                        <span>{food.calories} kcal</span>
                      </div>
                    </td>

                    {/* Macros */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span
                          title="Proteínas"
                          className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 px-2 py-1 rounded-lg text-xs font-bold"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          P: {food.protein}g
                        </span>
                        <span
                          title="Carbohidratos"
                          className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 px-2 py-1 rounded-lg text-xs font-bold"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          C: {food.carbs}g
                        </span>
                        <span
                          title="Grasas"
                          className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 px-2 py-1 rounded-lg text-xs font-bold"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                          G: {food.fat}g
                        </span>
                      </div>
                    </td>

                    {/* Estado Switch */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleStatus(food.id)}
                        title={food.isActive ? 'Desactivar alimento' : 'Activar alimento'}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface ${
                          food.isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                            food.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="block text-[10px] text-muted font-bold mt-1">
                        {food.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenEditModal(food)}
                        className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all inline-flex items-center gap-1 text-xs font-semibold"
                        title="Editar alimento"
                      >
                        <Edit2 size={16} />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Smart Empty State (PROYEC-524) */
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center text-muted mb-4 border border-border shadow-inner">
              <Apple size={28} className="opacity-50 text-primary" />
            </div>
            <h3 className="text-xl font-extrabold text-foreground">
              {searchQuery ? `No encontramos "${searchQuery.trim()}" en la biblioteca` : 'No se encontraron alimentos'}
            </h3>
            <p className="text-muted text-sm max-w-md mt-1.5 mb-6">
              {searchQuery
                ? `No existe ningún alimento registrado con ese término. ¿Deseas crearlo ahora mismo o limpiar los filtros activos?`
                : `No hay alimentos que coincidan con la combinación actual de filtros en la biblioteca.`}
            </p>
            <div className="flex items-center justify-center flex-wrap gap-3">
              {(searchQuery || selectedCategory !== 'Todos' || statusFilter !== 'all' || nutritionalFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Todos');
                    setStatusFilter('all');
                    setNutritionalFilter('all');
                  }}
                  className="px-5 py-2.5 bg-surface-hover hover:bg-border text-foreground rounded-xl text-xs font-bold transition-all border border-border"
                >
                  Limpiar Filtros Activos
                </button>
              )}
              {searchQuery ? (
                <button
                  onClick={() => handleOpenCreateModal(searchQuery.trim())}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-gray-900 rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Plus size={16} /> Crear "{searchQuery.trim()}" como nuevo alimento
                </button>
              ) : (
                <button
                  onClick={() => handleOpenCreateModal()}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-gray-900 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Plus size={16} /> Nuevo Alimento
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Creación y Edición */}
      <FoodFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFood}
        initialData={editingFood}
        prefillName={prefillFoodName}
      />
    </div>
  );
}
