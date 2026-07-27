import { useState, useEffect } from 'react';
import { X, Activity, User, ChevronRight, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { patientsAPI } from '../features/patients/services/patientsApi';
import type { Patient } from '../features/patients/types';

interface TrackingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrackingDrawer({ isOpen, onClose }: TrackingDrawerProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadPatients();
    }
  }, [isOpen]);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const data = await patientsAPI.getPatients();
      // Filtrar pacientes activos que ya tengan adherencia
      setPatients(data);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const getAdherenceColor = (state: string) => {
    if (state === 'Alta Adherencia') return 'bg-green-500';
    if (state === 'Media Adherencia') return 'bg-yellow-500';
    if (state === 'Baja Adherencia') return 'bg-red-500';
    return 'bg-gray-300';
  };

  const handlePatientClick = (id: string) => {
    onClose();
    navigate(`/patients/${id}`);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-background border-l border-border shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <BarChart2 size={18} />
            </div>
            <h2 className="font-bold text-[16px] text-foreground">Directorio de Seguimiento</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-muted hover:text-foreground hover:bg-surface-hover rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 bg-surface border-b border-border text-[13px] text-muted leading-relaxed">
          Selecciona un paciente para acceder a su ficha detallada y analizar su historial de peso, consumo calórico y adherencia completa.
        </div>

        {/* Lista de Pacientes con Adherencia */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted text-center py-8">Cargando pacientes...</p>
          ) : patients.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="mx-auto text-muted/30 mb-3" size={40} />
              <p className="font-bold text-foreground mb-1">Sin pacientes</p>
              <p className="text-xs text-muted">Aún no hay pacientes con seguimiento activo.</p>
            </div>
          ) : (
            patients.map(patient => (
              <button 
                key={patient.id}
                onClick={() => handlePatientClick(patient.id)}
                className="w-full text-left p-4 bg-surface rounded-xl border border-border flex items-center justify-between hover:border-primary/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-[14px] text-foreground mb-0.5 group-hover:text-primary transition-colors">{patient.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getAdherenceColor(patient.generalState)}`}></span>
                      <p className="text-[12px] text-muted">{patient.generalState}</p>
                    </div>
                  </div>
                </div>
                <div className="text-muted group-hover:text-primary transition-colors">
                  <ChevronRight size={20} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
