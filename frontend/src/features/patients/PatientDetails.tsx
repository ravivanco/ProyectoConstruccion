import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Activity, AlertCircle, Phone, Mail, Weight, Ruler } from 'lucide-react';
import { patientAPI } from './services/patientApi';
import type { PatientDetail } from './types';

export function PatientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTreatmentColor = (state?: string) => {
    switch(state) {
      case 'Activo': return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400';
      case 'Pendiente': return 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400';
      case 'Suspendido': return 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400';
      case 'Finalizado': return 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await patientAPI.getPatientById(id);
        setPatient(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar el paciente');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <span className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin mb-4"></span>
        <p className="text-muted text-sm">Cargando ficha del paciente...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Paciente no encontrado</h3>
        <p className="text-muted text-sm max-w-md mb-6">{error}</p>
        <button 
          onClick={() => navigate('/patients')}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-gray-900 font-semibold py-2 px-6 rounded-full transition-all text-sm"
        >
          <ArrowLeft size={16} /> Volver al listado
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/patients')}
          className="p-2 text-muted hover:text-foreground hover:bg-surface rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-[28px] font-bold text-foreground transition-colors">Ficha de Paciente</h1>
          <p className="text-muted text-[13px] mt-1 transition-colors">ID: {patient.id} • Última visita: {patient.lastVisit}</p>
        </div>
      </div>

      {/* Warning Alert if profile is incomplete */}
      {!patient.isProfileCompleted && (
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl flex items-start gap-3">
          <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-orange-800 dark:text-orange-400 font-bold text-sm">Perfil Nutricional Incompleto</h4>
            <p className="text-orange-700 dark:text-orange-300 text-[13px] mt-1">Este paciente no ha completado su evaluación inicial. Ciertos datos médicos podrían faltar.</p>
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Personal Info */}
        <div className="col-span-1 space-y-6">
          <div className="bg-surface rounded-3xl border border-border p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-colors">
            <div className="flex flex-col items-center text-center border-b border-border pb-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl mb-4">
                {patient.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-foreground">{patient.name}</h2>
              <div className="flex items-center gap-2 mt-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  patient.generalState === 'Alta Adherencia' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                  patient.generalState === 'Media Adherencia' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                  'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                }`}>
                  {patient.generalState}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getTreatmentColor(patient.treatmentState).replace('bg-', 'border-').replace('text-', 'border-').split(' ')[0]} ${getTreatmentColor(patient.treatmentState)}`}>
                  {patient.treatmentState || 'Pendiente'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Contacto</h3>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-muted">
                  <Mail size={14} />
                </div>
                <div>
                  <p className="text-[11px] text-muted">Correo Electrónico</p>
                  <p className="text-[13px] font-medium text-foreground">{patient.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-muted">
                  <Phone size={14} />
                </div>
                <div>
                  <p className="text-[11px] text-muted">Teléfono</p>
                  <p className="text-[13px] font-medium text-foreground">{patient.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Nutritional Data */}
        <div className="col-span-2 space-y-6">
          <div className="bg-surface rounded-3xl border border-border p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-colors h-full">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              Perfil Nutricional Básico
            </h3>

            {patient.isProfileCompleted ? (
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-surface-hover p-4 rounded-2xl border border-border transition-colors">
                  <div className="flex items-center gap-2 text-muted mb-2">
                    <User size={16} />
                    <span className="text-xs font-semibold">Edad</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{patient.age} <span className="text-sm font-normal text-muted">años</span></p>
                </div>
                
                <div className="bg-surface-hover p-4 rounded-2xl border border-border transition-colors">
                  <div className="flex items-center gap-2 text-muted mb-2">
                    <Weight size={16} />
                    <span className="text-xs font-semibold">Peso Inicial</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{patient.weight} <span className="text-sm font-normal text-muted">kg</span></p>
                </div>

                <div className="bg-surface-hover p-4 rounded-2xl border border-border transition-colors">
                  <div className="flex items-center gap-2 text-muted mb-2">
                    <Ruler size={16} />
                    <span className="text-xs font-semibold">Estatura</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{patient.height} <span className="text-sm font-normal text-muted">cm</span></p>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl mb-8">
                <User size={40} className="text-muted mb-4 opacity-50" />
                <p className="text-muted font-medium">No hay métricas iniciales disponibles</p>
                <p className="text-muted text-sm mt-1">El paciente debe completar su evaluación de ingreso.</p>
              </div>
            )}

            <div>
              <h3 className="text-[13px] font-bold text-foreground mb-3">Notas Médicas</h3>
              {patient.notes ? (
                <p className="text-sm text-muted bg-surface-hover p-4 rounded-xl border border-border leading-relaxed">
                  {patient.notes}
                </p>
              ) : (
                <p className="text-sm text-muted italic">Sin notas registradas.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
