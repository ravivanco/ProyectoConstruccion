import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertOctagon, Info, Filter, Check } from 'lucide-react';
import { alertsApi, type Alert } from '../features/dashboard/services/alertsApi';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'ALL' | 'ADHERENCIA' | 'PESO' | 'CONSUMO';

export function AlertsDrawer({ isOpen, onClose }: AlertsDrawerProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('ALL');

  useEffect(() => {
    if (isOpen) {
      loadAlerts();
    }
  }, [isOpen]);

  const loadAlerts = async () => {
    setIsLoading(true);
    const data = await alertsApi.getAlerts();
    setAlerts(data);
    setIsLoading(false);
  };

  const handleResolve = async (id: string) => {
    await alertsApi.resolveAlert(id);
    loadAlerts(); // recargar
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <AlertOctagon className="text-red-500" size={18} />;
      case 'WARNING': return <AlertTriangle className="text-yellow-500" size={18} />;
      case 'INFO': return <Info className="text-blue-500" size={18} />;
      default: return <Info size={18} />;
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'ALL') return true;
    if (filter === 'ADHERENCIA' && a.type.toLowerCase().includes('adherencia')) return true;
    if (filter === 'PESO' && a.type.toLowerCase().includes('peso')) return true;
    if (filter === 'CONSUMO' && a.type.toLowerCase().includes('consumo')) return true;
    return false;
  });

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
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-background border-l border-border shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <AlertTriangle size={18} />
            </div>
            <h2 className="font-bold text-[16px] text-foreground">Gestión de Alertas</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-muted hover:text-foreground hover:bg-surface-hover rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filtros */}
        <div className="p-4 border-b border-border bg-surface">
          <div className="flex items-center gap-2 mb-3 text-[12px] font-semibold text-muted uppercase tracking-wider">
            <Filter size={14} /> Filtros de Alerta
          </div>
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'ADHERENCIA', 'PESO', 'CONSUMO'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                  filter === f 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background border border-border text-muted hover:text-foreground'
                }`}
              >
                {f === 'ALL' ? 'Todas' : f === 'ADHERENCIA' ? 'Adherencia' : f === 'PESO' ? 'Peso' : 'Consumos'}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Alertas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted text-center py-8">Cargando alertas...</p>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto text-green-400 mb-3" size={40} />
              <p className="font-bold text-foreground mb-1">Todo en orden</p>
              <p className="text-xs text-muted">No hay alertas pendientes para este filtro.</p>
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <div key={alert.id} className="p-4 bg-surface rounded-xl border border-border flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                    <div>
                      <p className="text-[13px] font-bold text-foreground leading-tight mb-1">{alert.type}</p>
                      <p className="text-[12px] text-muted leading-snug">{alert.message}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/50">
                  <p className="text-[11px] font-medium text-muted truncate max-w-[180px]">Paciente: {alert.patientId}</p>
                  <button 
                    onClick={() => handleResolve(alert.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700 rounded-full text-[12px] font-bold transition-colors"
                  >
                    <Check size={14} /> Atender
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
