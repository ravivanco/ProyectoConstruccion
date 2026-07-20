import { useState, useMemo } from 'react';
import {
  Bell,
  AlertCircle,
  Activity,
  Flame,
  Dumbbell,
  Clock,
  CheckCircle2,
  RefreshCw,
  Info,
  Calendar,
  Filter,
  Search,
  Check,
} from 'lucide-react';
import { useAllAlerts } from './hooks/useAllAlerts';
import { useAlertMutations } from '../patients/hooks/useAlertMutations';
import type { PatientAlert, AlertSeverity, AlertStatus } from '../patients/types';

export default function AlertsDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAlert, setSelectedAlert] = useState<PatientAlert | null>(null);

  const { alerts, isLoading, isFetching, refetch } = useAllAlerts(statusFilter);
  // Para operaciones de status mutation, podemos usar un useAlertMutations genérico o global
  const { updateStatus, isUpdatingStatus } = useAlertMutations('global');

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchTitle = alert.title.toLowerCase().includes(term);
        const matchMsg = alert.message.toLowerCase().includes(term);
        const matchPatient = alert.patientId.toLowerCase().includes(term);
        if (!matchTitle && !matchMsg && !matchPatient) return false;
      }
      return true;
    });
  }, [alerts, searchTerm]);

  // Contadores de estado para el panel principal
  const pendingCount = alerts.filter((a) => a.status === 'pending').length;
  const reviewedCount = alerts.filter((a) => a.status === 'reviewed').length;
  const resolvedCount = alerts.filter((a) => a.status === 'resolved').length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status === 'pending').length;

  const handleUpdateStatus = async (alertId: string, status: AlertStatus) => {
    try {
      await updateStatus({ alertId, status });
      if (selectedAlert && selectedAlert.id === alertId) {
        setSelectedAlert({ ...selectedAlert, status });
      }
      refetch();
    } catch (err) {
      console.error('Error al actualizar estado en el panel de alertas:', err);
    }
  };

  const getSeverityStyles = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          badgeText: 'Crítica',
          bg: 'bg-red-500/15',
          border: 'border-red-500/40 ring-1 ring-red-500/20 shadow-red-500/5 shadow-md',
          text: 'text-red-600 dark:text-red-400',
          icon: <AlertCircle size={18} className="text-red-500 animate-pulse" />,
        };
      case 'high':
        return {
          badgeText: 'Alta',
          bg: 'bg-orange-500/15',
          border: 'border-orange-500/40',
          text: 'text-orange-600 dark:text-orange-400',
          icon: <AlertCircle size={18} className="text-orange-500" />,
        };
      case 'medium':
        return {
          badgeText: 'Media',
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/30',
          text: 'text-amber-600 dark:text-amber-400',
          icon: <Clock size={18} className="text-amber-500" />,
        };
      case 'low':
      default:
        return {
          badgeText: 'Baja',
          bg: 'bg-blue-500/15',
          border: 'border-blue-500/30',
          text: 'text-blue-600 dark:text-blue-400',
          icon: <Info size={18} className="text-blue-500" />,
        };
    }
  };

  const getReasonBadge = (type: PatientAlert['alertType']) => {
    switch (type) {
      case 'plan_deviation':
      case 'meal_missed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Activity size={12} /> Baja Adherencia
          </span>
        );
      case 'exercise_missed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Dumbbell size={12} /> Inactividad Física
          </span>
        );
      case 'calorie_excess':
      case 'additional_intake':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Flame size={12} /> Exceso Calórico
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gray-500/15 text-gray-600 border border-gray-500/20">
            <Bell size={12} /> Evento Clínico
          </span>
        );
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Estado: Pendiente
          </span>
        );
      case 'reviewed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <Check size={13} />
            Estado: Revisada
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 size={13} />
            Estado: Atendida / Resuelta
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-gray-500/15 text-gray-600 border border-gray-500/30">
            Estado: Descartada
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-muted">
          <RefreshCw size={28} className="animate-spin text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Cargando Panel Central de Alertas Clínicas y Nutricionales...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Cabecera del Panel Central de Alertas (HU37) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface rounded-3xl border border-border p-6 md:p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/15 text-red-500 flex items-center justify-center shrink-0 shadow-inner mt-0.5">
            <Bell size={28} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-foreground">
                Panel de Gestión de Alertas Automáticas
              </h1>
              {criticalCount > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black bg-red-500 text-white shadow-md animate-bounce">
                  {criticalCount} Alertas Críticas Pendientes
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-muted mt-1 max-w-2xl">
              Monitoreo centralizado para consultar, categorizar y gestionar el seguimiento clínico de todos tus pacientes. Marca cada alerta como <strong className="text-foreground">Revisada</strong> o <strong className="text-foreground">Atendida</strong> según el avance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center shrink-0">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-3.5 rounded-2xl bg-surface-hover border border-border text-muted hover:text-foreground transition-all flex items-center gap-2 text-xs font-bold shadow-sm"
            title="Sincronizar alertas con el servidor"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin text-primary' : ''} />
            <span>Refrescar Panel</span>
          </button>
        </div>
      </div>

      {/* Tarjetas Rápida de Filtrado por Estado (HU37: Listar y Mostrar Estado) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-5 rounded-2xl border transition-all text-left flex items-center justify-between ${
            statusFilter === 'all'
              ? 'bg-primary/10 border-primary ring-2 ring-primary/30 shadow-md'
              : 'bg-surface border-border hover:border-border/80'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-muted uppercase block tracking-wider">Todas las Alertas</span>
            <span className="text-2xl font-black text-foreground">{alerts.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Bell size={20} />
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`p-5 rounded-2xl border transition-all text-left flex items-center justify-between ${
            statusFilter === 'pending'
              ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 shadow-md'
              : 'bg-surface border-border hover:border-border/80'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-muted uppercase block tracking-wider">Pendientes</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('reviewed')}
          className={`p-5 rounded-2xl border transition-all text-left flex items-center justify-between ${
            statusFilter === 'reviewed'
              ? 'bg-blue-500/15 border-blue-500 ring-2 ring-blue-500/30 shadow-md'
              : 'bg-surface border-border hover:border-border/80'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-muted uppercase block tracking-wider">Revisadas</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{reviewedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
            <Check size={20} />
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('resolved')}
          className={`p-5 rounded-2xl border transition-all text-left flex items-center justify-between ${
            statusFilter === 'resolved'
              ? 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
              : 'bg-surface border-border hover:border-border/80'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-muted uppercase block tracking-wider">Atendidas</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{resolvedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </button>
      </div>

      {/* Barra de Búsqueda y Herramientas */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar por paciente, motivo o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-hover pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted font-bold self-end sm:self-center">
          <Filter size={15} className="text-primary" />
          <span>Filtro de Estado: {statusFilter.toUpperCase()}</span>
        </div>
      </div>

      {/* Lista Principal de Alertas (HU37: Listar Alertas, Mostrar Estado y Acciones para Marcar) */}
      <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 shadow-sm space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="py-20 text-center text-muted space-y-3">
            <CheckCircle2 size={48} className="mx-auto text-emerald-500 opacity-80 animate-bounce" />
            <h4 className="text-lg font-black text-foreground">No hay alertas registradas bajo este criterio</h4>
            <p className="text-xs max-w-md mx-auto">
              Intenta cambiar la pestaña de estado o modificar el término de búsqueda para consultar alertas anteriores.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const sev = getSeverityStyles(alert.severity);
              return (
                <div
                  key={alert.id}
                  className={`rounded-2xl p-6 border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                    alert.status === 'resolved' || alert.status === 'dismissed'
                      ? 'bg-surface-hover/30 border-border/60 opacity-70 hover:opacity-100'
                      : alert.severity === 'critical'
                        ? 'bg-red-500/10 border-red-500/50 shadow-md ring-1 ring-red-500/20'
                        : 'bg-surface-hover/60 border-border hover:border-border/90'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 shrink-0">{sev.icon}</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${sev.bg} ${sev.text} ${sev.border}`}>
                          {sev.badgeText}
                        </span>
                        {getReasonBadge(alert.alertType)}
                        {getStatusBadge(alert.status)}
                        <span className="text-[11px] font-bold text-muted flex items-center gap-1">
                          <Calendar size={12} /> {alert.triggeredDate}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-foreground">{alert.title}</h4>
                      <p className="text-xs md:text-sm text-muted leading-relaxed max-w-3xl">{alert.message}</p>

                      {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {Object.entries(alert.metadata).map(([key, val]) => (
                            <span
                              key={key}
                              className="inline-flex items-center px-2 py-0.5 rounded bg-border/50 text-[10px] font-bold text-foreground/80"
                            >
                              {key}: <strong className="ml-1 text-foreground">{String(val)}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Criterios HU37: Marcar como revisada, Marcar como atendida */}
                  <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-center shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 w-full lg:w-auto justify-end">
                    {alert.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(alert.id, 'reviewed')}
                        disabled={isUpdatingStatus}
                        className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border text-xs font-extrabold text-foreground transition-all hover:border-primary shadow-sm flex items-center gap-1.5"
                        title="Marcar alerta como revisada (en seguimiento clínico)"
                      >
                        <Check size={14} className="text-blue-500" />
                        Marcar Revisada
                      </button>
                    )}

                    {alert.status !== 'resolved' && (
                      <button
                        onClick={() => handleUpdateStatus(alert.id, 'resolved')}
                        disabled={isUpdatingStatus}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5"
                        title="Marcar alerta como atendida / resuelta por completo"
                      >
                        <CheckCircle2 size={14} />
                        Marcar Atendida
                      </button>
                    )}

                    {alert.status === 'resolved' && (
                      <button
                        onClick={() => handleUpdateStatus(alert.id, 'pending')}
                        disabled={isUpdatingStatus}
                        className="px-3 py-2 rounded-xl bg-surface-hover border border-border text-[11px] font-bold text-muted hover:text-foreground transition-all"
                        title="Reabrir alerta (volver a pendiente)"
                      >
                        Reabrir
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
