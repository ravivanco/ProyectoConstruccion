import { useState, useEffect } from 'react';
import { alertsApi, type Alert } from '../services/alertsApi';
import { Bell, CheckCircle, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setIsLoading(true);
    const data = await alertsApi.getAlerts();
    setAlerts(data);
    setIsLoading(false);
  };

  const handleResolve = async (id: string) => {
    await alertsApi.resolveAlert(id);
    loadAlerts();
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <AlertOctagon className="text-red-500" size={18} />;
      case 'WARNING': return <AlertTriangle className="text-yellow-500" size={18} />;
      case 'INFO': return <Info className="text-blue-500" size={18} />;
      default: return <Bell size={18} />;
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400"></span>
          <p className="text-[13px] font-bold text-foreground">Alertas Activas</p>
        </div>
        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold">
          {alerts.length} nuevas
        </span>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted text-center py-4">Cargando alertas...</p>
      ) : alerts.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="mx-auto text-green-400 mb-2" size={32} />
          <p className="text-sm text-muted">No hay alertas pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className="flex items-start justify-between p-3 bg-background rounded-xl border border-border">
              <div className="flex gap-3">
                <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                <div>
                  <p className="text-[13px] font-bold text-foreground">{alert.type}</p>
                  <p className="text-[12px] text-muted">{alert.message}</p>
                  <p className="text-[10px] text-muted mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button 
                onClick={() => handleResolve(alert.id)}
                className="text-xs text-primary hover:text-primary-hover font-medium px-2 py-1 bg-primary/10 rounded-md"
              >
                Resolver
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
