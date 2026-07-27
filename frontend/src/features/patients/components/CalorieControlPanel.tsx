import { useState, useEffect } from 'react';
import { api } from '../../../lib/axios';
import { endpoints } from '../../../lib/endpoints';
import { Activity, Flame, ArrowUp, ArrowDown } from 'lucide-react';

interface CalorieControlPanelProps {
  patientId: string;
}

interface DashboardData {
  plannedCalories: number;
  consumedToday: number;
  remainingToday: number;
  weeklyAverageConsumed: number;
  adherencePercentage: number;
}

export function CalorieControlPanel({ patientId }: CalorieControlPanelProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // GET /api/calorie-control/patient/:id/today
        const response = await api.get(endpoints.calorieControl.today(patientId));
        setData(response.data);
      } catch (err) {
        setError('Error al cargar balance calórico');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  if (isLoading) {
    return <div className="text-center py-8 text-muted">Cargando balance calórico...</div>;
  }

  if (error || !data) {
    return <div className="text-center py-8 text-red-500">{error || 'Sin datos'}</div>;
  }

  const { plannedCalories, consumedToday, remainingToday } = data;
  
  const balance = consumedToday - plannedCalories;
  const isSurplus = balance > 0;
  const isDeficit = balance < 0;
  
  // Semáforo calórico (HU35)
  // Verde: Déficit (o en rango)
  // Rojo: Superávit
  const balanceColor = isSurplus ? 'text-red-500 bg-red-500/10' : 'text-emerald-500 bg-emerald-500/10';
  const balanceText = isSurplus ? 'Superávit Calórico' : isDeficit ? 'Déficit Calórico' : 'Mantenimiento';
  const balanceIcon = isSurplus ? <ArrowUp size={20} /> : isDeficit ? <ArrowDown size={20} /> : <Activity size={20} />;

  const percent = Math.min((consumedToday / plannedCalories) * 100, 100) || 0;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm mb-6">
      <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
        <Flame size={20} className="text-orange-500" />
        Balance Calórico Diario
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Gráfico de dona sencillo */}
        <div className="flex flex-col items-center justify-center relative">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-surface-hover" />
              <circle 
                cx="50" cy="50" r="40" 
                stroke="currentColor" 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray={`${percent * 2.51} 251`}
                className={isSurplus ? 'text-red-500' : 'text-orange-500'} 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-foreground">{consumedToday}</span>
              <span className="text-xs text-muted">/ {plannedCalories} kcal</span>
            </div>
          </div>
        </div>

        {/* Detalles y Semáforo */}
        <div className="space-y-6">
          <div className={`p-4 rounded-xl flex items-center gap-3 ${balanceColor}`}>
            <div className="p-2 rounded-full bg-white/20">
              {balanceIcon}
            </div>
            <div>
              <p className="font-bold text-lg">{balanceText}</p>
              <p className="text-sm opacity-90">
                {isSurplus 
                  ? `Exceso de ${Math.abs(balance)} kcal` 
                  : `Faltan ${remainingToday} kcal para la meta`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-hover p-4 rounded-xl border border-border">
              <p className="text-xs text-muted uppercase tracking-wider mb-1 font-bold">Consumido</p>
              <p className="text-xl font-bold text-foreground">{consumedToday} <span className="text-sm font-normal text-muted">kcal</span></p>
            </div>
            <div className="bg-surface-hover p-4 rounded-xl border border-border">
              <p className="text-xs text-muted uppercase tracking-wider mb-1 font-bold">Planeado</p>
              <p className="text-xl font-bold text-foreground">{plannedCalories} <span className="text-sm font-normal text-muted">kcal</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
