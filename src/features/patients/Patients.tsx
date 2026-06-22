import { useEffect, useState } from 'react';
import { Search, Filter, MoreHorizontal, User } from 'lucide-react';
import { patientsAPI } from './services/patientsApi';
import type { Patient } from '../../shared/types';

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    setIsLoading(true);
    try {
      const data = await patientsAPI.getPatients();
      setPatients(data);
    } catch (error) {
      console.error("Error al cargar pacientes", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAdherenceColor = (state: string) => {
    switch(state) {
      case 'Alta Adherencia': return 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400';
      case 'Media Adherencia': return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'Baja Adherencia': return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <div className="inline-block px-3 py-1 bg-[#fdf8ee] dark:bg-yellow-500/10 text-[#d97706] dark:text-yellow-500 text-[11px] font-bold rounded-full mb-3 border border-[#fde68a] dark:border-yellow-500/20">
            Gestión de usuarios
          </div>
          <h1 className="text-[28px] font-bold text-foreground transition-colors">Mis Pacientes</h1>
          <p className="text-muted text-[13px] mt-1 transition-colors">Directorio completo de pacientes activos y en seguimiento.</p>
        </div>
        <button className="bg-[#eab308] hover:bg-[#d97706] text-gray-900 font-semibold py-2.5 px-6 rounded-full transition-all text-sm shadow-sm active:scale-95">
          + Nuevo Paciente
        </button>
      </div>

      <div className="bg-surface rounded-3xl border border-border shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden transition-colors">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-surface-hover">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border text-foreground rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted"
            />
          </div>
          <button className="flex items-center gap-2 text-muted hover:text-foreground px-4 py-2 border border-border rounded-xl bg-surface hover:bg-surface-hover text-sm font-medium transition-colors">
            <Filter size={16} /> Filtros
          </button>
        </div>

        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center">
            <span className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin mb-4"></span>
            <p className="text-muted text-sm">Cargando pacientes...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && patients.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 bg-yellow-50 dark:bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
              <User size={32} className="text-yellow-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No hay pacientes registrados</h3>
            <p className="text-muted text-sm max-w-md mx-auto mb-6">
              Parece que aún no tienes pacientes asignados a tu cuenta. Comienza añadiendo uno nuevo para empezar el seguimiento nutricional.
            </p>
            <button 
              onClick={loadPatients}
              className="text-[#d97706] text-sm font-semibold hover:underline"
            >
              Recargar lista
            </button>
          </div>
        )}

        {/* Table / List */}
        {!isLoading && filteredPatients.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="py-3 px-6 text-[12px] font-semibold text-muted uppercase tracking-wider">Paciente</th>
                  <th className="py-3 px-6 text-[12px] font-semibold text-muted uppercase tracking-wider">Correo Electrónico</th>
                  <th className="py-3 px-6 text-[12px] font-semibold text-muted uppercase tracking-wider">Estado General</th>
                  <th className="py-3 px-6 text-[12px] font-semibold text-muted uppercase tracking-wider">Última Visita</th>
                  <th className="py-3 px-6 text-center text-[12px] font-semibold text-muted uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-surface-hover transition-colors group">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {patient.name.charAt(0)}
                        </div>
                        <span className="font-bold text-foreground text-sm group-hover:text-primary-hover transition-colors">{patient.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span className="text-muted text-sm">{patient.email}</span>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getAdherenceColor(patient.generalState)}`}>
                        {patient.generalState}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="text-muted text-sm">{patient.lastVisit}</span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <button className="text-muted hover:text-foreground p-2 rounded-full hover:bg-surface-hover transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty Search Result */}
        {!isLoading && patients.length > 0 && filteredPatients.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-muted text-sm">No se encontraron pacientes con el término "{searchTerm}"</p>
          </div>
        )}
      </div>
    </>
  );
}
