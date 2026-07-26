// Dashboard
import { useDashboardStats } from './hooks/useDashboardStats';
import { Users, Apple, Dumbbell, FileText, Loader2 } from 'lucide-react';
import { AlertsPanel } from './components/AlertsPanel';
import { AppointmentsPanel } from './components/AppointmentsPanel';

export default function Dashboard() {
  const stats = useDashboardStats();

  return (
    <>
      <div className="mb-8">
        <div className="inline-block px-3 py-1 bg-primary/10 text-primary-hover text-[11px] font-bold rounded-full mb-3 border border-primary/20">
          Seguimiento nutricional
        </div>
        <h1 className="text-[28px] font-bold text-foreground transition-colors">Dashboard</h1>
        <p className="text-muted text-[13px] mt-1 transition-colors">Resumen clínico — Datos en tiempo real del sistema DK Fitt</p>
      </div>

      {/* Top Info Cards — Indicadores Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Adherencia Promedio / Pacientes Totales */}
        <div className="col-span-2 bg-surface rounded-2xl border border-border p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              <p className="text-[13px] font-bold text-foreground">Pacientes en el Sistema</p>
            </div>
            <p className="text-[11px] text-muted ml-4">↗ {stats.activePatients} activos · {stats.pendingPatients} pendientes</p>
          </div>
          {/* Indicador Circular */}
          <div className="w-14 h-14 rounded-full border-4 border-border border-t-primary border-r-primary flex items-center justify-center">
            {stats.isLoading ? (
              <Loader2 className="animate-spin text-muted" size={18} />
            ) : (
              <span className="text-[12px] font-bold text-foreground">{stats.totalPatients}</span>
            )}
          </div>
        </div>
        
        {/* Planes Activos */}
        <div className="bg-green-100 dark:bg-green-500/10 rounded-2xl p-5 flex flex-col justify-between transition-colors">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></span>
            <p className="text-[13px] font-bold text-green-900 dark:text-green-100">Planes Activos</p>
          </div>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2 mb-1">
            {stats.isLoading ? <Loader2 className="animate-spin" size={24} /> : stats.activePlans}
          </p>
          <p className="text-[11px] text-green-700 dark:text-green-400">↗ de {stats.totalPlans} totales</p>
        </div>
        
        {/* Alimentos en Catálogo */}
        <div className="bg-orange-100 dark:bg-orange-500/10 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-colors">
           <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-600 dark:bg-orange-400"></span>
            <p className="text-[13px] font-bold text-orange-900 dark:text-orange-100 z-10">Catálogo Alimentos</p>
          </div>
          <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2 mb-1 z-10">
            {stats.isLoading ? <Loader2 className="animate-spin" size={24} /> : stats.totalFoods}
          </p>
          <p className="text-[11px] text-orange-800 dark:text-orange-400 z-10">↗ Alimentos y Recetas registrados</p>
          {/* Decorative wave */}
          <svg className="absolute bottom-0 right-0 w-full h-1/2 text-orange-300 opacity-50" viewBox="0 0 100 50" preserveAspectRatio="none">
             <path d="M0,50 Q25,0 50,25 T100,0 L100,50 Z" fill="currentColor"/>
          </svg>
        </div>
      </div>

      {/* Sección de Resumen de Módulos Registrados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
            <Users className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-foreground">{stats.totalPatients}</p>
            <p className="text-[11px] text-muted font-bold">Pacientes Registrados</p>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center">
            <Apple className="text-amber-600 dark:text-amber-400" size={20} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-foreground">{stats.totalFoods}</p>
            <p className="text-[11px] text-muted font-bold">Alimentos Activos</p>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/15 flex items-center justify-center">
            <Dumbbell className="text-purple-600 dark:text-purple-400" size={20} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-foreground">{stats.totalExercises}</p>
            <p className="text-[11px] text-muted font-bold">Ejercicios en Catálogo</p>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
            <FileText className="text-emerald-600 dark:text-emerald-400" size={20} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-foreground">{stats.totalPlans}</p>
            <p className="text-[11px] text-muted font-bold">Planes Nutricionales</p>
          </div>
        </div>
      </div>

      {/* Alertas y Citas (Sprint 5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <AlertsPanel />
        <AppointmentsPanel />
      </div>

      {/* Charts Area (Simulados) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Evolucion del Peso */}
        <div className="col-span-2 bg-surface rounded-2xl border border-border p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              <p className="text-[13px] font-bold text-foreground">Evolución del Peso</p>
            </div>
            <select className="text-[11px] border border-border bg-surface text-foreground rounded-lg px-2 py-1 outline-none">
              <option>3/3 pacientes seleccionados</option>
            </select>
          </div>
          <p className="text-[11px] text-muted mb-6 -mt-4">Registros diarios - 3 pacientes seleccionados</p>
          
          {/* Chart Placeholder Area */}
          <div className="h-48 w-full flex items-end justify-between px-4 pb-4 border-l border-b border-border relative">
             {/* Fake line chart using SVG */}
             <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline fill="none" stroke="#eab308" strokeWidth="1" points="0,80 20,70 40,75 60,60 80,40 100,50" />
                <polyline fill="none" stroke="#22c55e" strokeWidth="1" points="0,60 20,50 40,55 60,40 80,45 100,30" />
                <polyline fill="none" stroke="#ef4444" strokeWidth="1" points="0,40 20,45 40,30 60,35 80,20 100,25" />
             </svg>
             <span className="text-[9px] text-muted absolute -bottom-5 left-0">29-may</span>
             <span className="text-[9px] text-muted absolute -bottom-5 left-1/4">07-jun</span>
             <span className="text-[9px] text-muted absolute -bottom-5 left-2/4">11-jun</span>
             <span className="text-[9px] text-muted absolute -bottom-5 left-3/4">17-jun</span>
             <span className="text-[9px] text-muted absolute -bottom-5 right-0">19-jun</span>

             <span className="text-[9px] text-muted absolute left-[-30px] bottom-0">73.1 kg</span>
             <span className="text-[9px] text-muted absolute left-[-30px] bottom-1/2">81.1 kg</span>
             <span className="text-[9px] text-muted absolute left-[-30px] top-0">87.0 kg</span>
          </div>
        </div>

        {/* Calorias Planificadas */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors">
           <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              <p className="text-[13px] font-bold text-foreground">Calorías Planificadas vs Consumidas</p>
            </div>
          <p className="text-[11px] text-muted mb-6">Promedio semanal - pacientes activos</p>

          {/* Fake Bar Chart */}
          <div className="h-40 flex items-end justify-around border-l border-b border-border pb-2 pl-2">
             <div className="flex gap-1 items-end h-full">
               <div className="w-3 bg-green-200 dark:bg-green-500/30 h-[80%] rounded-t-sm transition-colors"></div>
               <div className="w-3 bg-orange-200 dark:bg-orange-500/30 h-[60%] rounded-t-sm transition-colors"></div>
             </div>
             <div className="flex gap-1 items-end h-full">
               <div className="w-3 bg-green-200 dark:bg-green-500/30 h-[90%] rounded-t-sm transition-colors"></div>
               <div className="w-3 bg-orange-200 dark:bg-orange-500/30 h-[85%] rounded-t-sm transition-colors"></div>
             </div>
             <div className="flex gap-1 items-end h-full">
               <div className="w-3 bg-green-200 dark:bg-green-500/30 h-[70%] rounded-t-sm transition-colors"></div>
               <div className="w-3 bg-orange-200 dark:bg-orange-500/30 h-[50%] rounded-t-sm transition-colors"></div>
             </div>
             <div className="flex gap-1 items-end h-full">
               <div className="w-3 bg-green-200 dark:bg-green-500/30 h-[85%] rounded-t-sm transition-colors"></div>
               <div className="w-3 bg-orange-200 dark:bg-orange-500/30 h-[75%] rounded-t-sm transition-colors"></div>
             </div>
             <div className="flex gap-1 items-end h-full">
               <div className="w-3 bg-green-200 dark:bg-green-500/30 h-[95%] rounded-t-sm transition-colors"></div>
               <div className="w-3 bg-orange-200 dark:bg-orange-500/30 h-[90%] rounded-t-sm transition-colors"></div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
