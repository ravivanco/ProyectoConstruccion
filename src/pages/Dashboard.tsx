import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, FileText, Activity, Apple, Bell, LogOut, Calendar, BarChart2, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#faf9f6] font-sans">
      {/* Sidebar - Matching the warm cream color */}
      <aside className="w-[260px] bg-[#fcf8ee] border-r border-[#f0e9dc] flex flex-col hidden md:flex shrink-0">
        <div className="pt-10 pb-6 flex flex-col items-center">
          <div className="w-12 h-12 text-gray-900 flex items-center justify-center mb-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
              <path d="M2 10l10-8 10 8" />
              <line x1="6" y1="14" x2="18" y2="14" strokeWidth="2" />
              <rect x="4" y="11" width="2" height="6" fill="currentColor" stroke="none" />
              <rect x="18" y="11" width="2" height="6" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <h2 className="font-bold text-[18px] text-gray-900 tracking-wide">DK Fitt</h2>
          <span className="text-[11px] text-gray-500 font-medium tracking-widest mt-0.5">Panel Clínico</span>
          <span className="text-[9px] text-gray-400 font-light mt-0.5">nutrición activa</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <a href="#" className="flex items-center gap-4 px-5 py-3.5 bg-[#fde68a] text-gray-900 rounded-full font-semibold transition-colors text-[13px] shadow-sm">
            <Activity size={18} /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-4 px-5 py-3.5 text-gray-600 hover:bg-[#fef3c7] hover:text-gray-900 rounded-full font-medium transition-colors text-[13px]">
            <Users size={18} /> Pacientes
          </a>
          <a href="#" className="flex items-center gap-4 px-5 py-3.5 text-gray-600 hover:bg-[#fef3c7] hover:text-gray-900 rounded-full font-medium transition-colors text-[13px]">
            <FileText size={18} /> Planes Nutricionales
          </a>
          <a href="#" className="flex items-center gap-4 px-5 py-3.5 text-gray-600 hover:bg-[#fef3c7] hover:text-gray-900 rounded-full font-medium transition-colors text-[13px]">
            <Apple size={18} /> Alimentos y Recetas
          </a>
          <a href="#" className="flex items-center gap-4 px-5 py-3.5 text-gray-600 hover:bg-[#fef3c7] hover:text-gray-900 rounded-full font-medium transition-colors text-[13px]">
            <BarChart2 size={18} /> Seguimiento
          </a>
          <a href="#" className="flex items-center gap-4 px-5 py-3.5 text-gray-600 hover:bg-[#fef3c7] hover:text-gray-900 rounded-full font-medium transition-colors text-[13px]">
            <AlertCircle size={18} /> Alertas
          </a>
          <a href="#" className="flex items-center gap-4 px-5 py-3.5 text-gray-600 hover:bg-[#fef3c7] hover:text-gray-900 rounded-full font-medium transition-colors text-[13px]">
            <Calendar size={18} /> Citas
          </a>
        </nav>
        
        <div className="p-6">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-full font-semibold transition-colors text-[13px]"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-white flex flex-col relative">
        {/* Top Header - simple and clean */}
        <header className="flex justify-end items-center px-10 py-6">
          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#fde68a] flex items-center justify-center text-gray-800 font-bold text-sm">
                D
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-[13px] font-bold text-gray-900 leading-none">dkfitt nutricionista</span>
                <span className="text-[11px] text-gray-500 mt-1">Nutriólogo</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content matching the reference layout */}
        <div className="px-10 pb-10 flex-1">
          <div className="mb-8">
            <div className="inline-block px-3 py-1 bg-[#fdf8ee] text-[#d97706] text-[11px] font-bold rounded-full mb-3 border border-[#fde68a]">
              Seguimiento nutricional
            </div>
            <h1 className="text-[28px] font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-[13px] mt-1">Resumen clínico - semana del 15 Junio al 19 de Junio de 2026</p>
          </div>

          {/* Top Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Adherencia Promedio */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  <p className="text-[13px] font-bold text-gray-900">Adherencia Promedio</p>
                </div>
                <p className="text-[11px] text-gray-400 ml-4">↗ 7 planes activos</p>
              </div>
              {/* Fake circular chart */}
              <div className="w-14 h-14 rounded-full border-4 border-gray-100 border-t-yellow-400 border-r-yellow-400 flex items-center justify-center">
                <span className="text-[12px] font-bold text-gray-800">39%</span>
              </div>
            </div>
            
            {/* Baja Adherencia */}
            <div className="bg-[#e2f5d0] rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                <p className="text-[13px] font-bold text-gray-900">Baja Adherencia</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-2 mb-1">5</p>
              <p className="text-[11px] text-green-700">↘ 0 alertas sin revisar</p>
            </div>
            
            {/* Progreso Semanal / Planes Activos */}
            <div className="bg-[#fcd3a1] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
               <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                <p className="text-[13px] font-bold text-gray-900 z-10">Progreso Semanal</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-2 mb-1 z-10">29%</p>
              <p className="text-[11px] text-orange-800 z-10">↗ Adherencia media/alta</p>
              {/* Decorative wave */}
              <svg className="absolute bottom-0 right-0 w-full h-1/2 text-orange-300 opacity-50" viewBox="0 0 100 50" preserveAspectRatio="none">
                 <path d="M0,50 Q25,0 50,25 T100,0 L100,50 Z" fill="currentColor"/>
              </svg>
            </div>
          </div>

          {/* Charts Area (Simulados) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Evolucion del Peso */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  <p className="text-[13px] font-bold text-gray-900">Evolución del Peso</p>
                </div>
                <select className="text-[11px] border border-gray-200 rounded-lg px-2 py-1 text-gray-600 outline-none">
                  <option>3/3 pacientes seleccionados</option>
                </select>
              </div>
              <p className="text-[11px] text-gray-400 mb-6 -mt-4">Registros diarios - 3 pacientes seleccionados</p>
              
              {/* Chart Placeholder Area */}
              <div className="h-48 w-full flex items-end justify-between px-4 pb-4 border-l border-b border-gray-100 relative">
                 {/* Fake line chart using SVG */}
                 <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <polyline fill="none" stroke="#eab308" strokeWidth="1" points="0,80 20,70 40,75 60,60 80,40 100,50" />
                    <polyline fill="none" stroke="#22c55e" strokeWidth="1" points="0,60 20,50 40,55 60,40 80,45 100,30" />
                    <polyline fill="none" stroke="#ef4444" strokeWidth="1" points="0,40 20,45 40,30 60,35 80,20 100,25" />
                 </svg>
                 <span className="text-[9px] text-gray-300 absolute -bottom-5 left-0">29-may</span>
                 <span className="text-[9px] text-gray-300 absolute -bottom-5 left-1/4">07-jun</span>
                 <span className="text-[9px] text-gray-300 absolute -bottom-5 left-2/4">11-jun</span>
                 <span className="text-[9px] text-gray-300 absolute -bottom-5 left-3/4">17-jun</span>
                 <span className="text-[9px] text-gray-300 absolute -bottom-5 right-0">19-jun</span>

                 <span className="text-[9px] text-gray-300 absolute left-[-25px] bottom-0">73.1 kg</span>
                 <span className="text-[9px] text-gray-300 absolute left-[-25px] bottom-1/2">81.1 kg</span>
                 <span className="text-[9px] text-gray-300 absolute left-[-25px] top-0">87 kg</span>
              </div>
            </div>

            {/* Calorias Planificadas */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
               <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                  <p className="text-[13px] font-bold text-gray-900">Calorías Planificadas vs Consumidas</p>
                </div>
              <p className="text-[11px] text-gray-400 mb-6">Promedio semanal - pacientes activos</p>

              {/* Fake Bar Chart */}
              <div className="h-40 flex items-end justify-around border-l border-b border-gray-100 pb-2 pl-2">
                 <div className="flex gap-1 items-end h-full">
                   <div className="w-3 bg-[#e2f5d0] h-[80%] rounded-t-sm"></div>
                   <div className="w-3 bg-[#fcd3a1] h-[60%] rounded-t-sm"></div>
                 </div>
                 <div className="flex gap-1 items-end h-full">
                   <div className="w-3 bg-[#e2f5d0] h-[90%] rounded-t-sm"></div>
                   <div className="w-3 bg-[#fcd3a1] h-[85%] rounded-t-sm"></div>
                 </div>
                 <div className="flex gap-1 items-end h-full">
                   <div className="w-3 bg-[#e2f5d0] h-[70%] rounded-t-sm"></div>
                   <div className="w-3 bg-[#fcd3a1] h-[50%] rounded-t-sm"></div>
                 </div>
                 <div className="flex gap-1 items-end h-full">
                   <div className="w-3 bg-[#e2f5d0] h-[85%] rounded-t-sm"></div>
                   <div className="w-3 bg-[#fcd3a1] h-[75%] rounded-t-sm"></div>
                 </div>
                 <div className="flex gap-1 items-end h-full">
                   <div className="w-3 bg-[#e2f5d0] h-[95%] rounded-t-sm"></div>
                   <div className="w-3 bg-[#fcd3a1] h-[90%] rounded-t-sm"></div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
