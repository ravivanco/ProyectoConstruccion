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
  Sparkles,
  Info,
  Calendar,
  Filter,
} from 'lucide-react';
import { usePatientAlerts } from '../hooks/usePatientAlerts';
import { useAlertMutations } from '../hooks/useAlertMutations';
import type { PatientAlert, AlertSeverity } from '../types';

interface PatientAlertsSectionProps {
  patientId: string;
}

export function PatientAlertsSection({ patientId }: PatientAlertsSectionProps) {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedReasonFilter, setSelectedReasonFilter] = useState<string>('all');

  const { alerts, isLoading, isFetching, refetch } = usePatientAlerts(
    patientId,
    selectedStatusFilter === 'all' ? undefined : selectedStatusFilter,
  );
  const { generateAlerts, isGenerating, updateStatus, isUpdatingStatus } = useAlertMutations(patientId);

  // Filtrado interno adicional
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (selectedReasonFilter === 'all') return true;
      if (selectedReasonFilter === 'adherence') {
        return alert.alertType === 'plan_deviation' || alert.alertType === 'meal_missed';
      }
      if (selectedReasonFilter === 'inactivity') {
        return alert.alertType === 'exercise_missed';
      }
      if (selectedReasonFilter === 'calorie_excess') {
        return alert.alertType === 'calorie_excess' || alert.alertType === 'additional_intake';
      }
      return true;
    });
  }, [alerts, selectedReasonFilter]);

  // Contadores de severidad y causas para HU36
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status === 'pending').length;
  const highCount = alerts.filter((a) => a.severity === 'high' && a.status === 'pending').length;
  const adherenceCount = alerts.filter((a) => a.alertType === 'plan_deviation' || a.alertType === 'meal_missed').length;
  const inactivityCount = alerts.filter((a) => a.alertType === 'exercise_missed').length;
  const calorieCount = alerts.filter((a) => a.alertType === 'calorie_excess').length;

  const handleGenerateAlerts = async () => {
    try {
      await generateAlerts();
    } catch (err) {
      console.error('Error al generar alertas automáticas:', err);
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

  if (isLoading) {
    return (
      <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm flex items-center justify-center min-h-[350px]">
        <div className="flex flex-col items-center gap-3 text-muted">
          <RefreshCw size={28} className="animate-spin text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Cargando alertas automáticas del paciente...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header y Botón de Generación de Alertas (HU36) */}
      <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-13 h-13 rounded-2xl bg-red-500/15 text-red-500 flex items-center justify-center shrink-0 shadow-inner mt-0.5 p-3">
            <Bell size={26} className="animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-lg font-black text-foreground">
                Motor de Generación de Alertas Automáticas
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-primary/15 text-primary border border-primary/20">
                <Sparkles size={12} /> Algoritmo Evaluador Activo
              </span>
            </div>
            <p className="text-xs text-muted mt-1 max-w-2xl">
              Detección continua e inmediata ante eventos relevantes de incumplimiento para intervención oportuna: <strong className="text-foreground">baja adherencia</strong>, <strong className="text-foreground">inactividad física</strong> y <strong className="text-foreground">exceso calórico</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleGenerateAlerts}
            disabled={isGenerating}
            className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black text-xs shadow-lg shadow-primary/25 transition-all flex items-center gap-2 disabled:opacity-50"
            title="Ejecuta el motor de análisis y genera alertas basadas en los últimos registros del paciente"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Evaluando Registros...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generar / Evaluar Alertas Ahora
              </>
            )}
          </button>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-3 rounded-2xl bg-surface-hover border border-border text-muted hover:text-foreground transition-all"
            title="Actualizar listado de alertas"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin text-primary' : ''} />
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen Rápido por Tipo de Alertas Generadas (HU36 Criterios) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setSelectedReasonFilter('all')}
          className={`p-4.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
            selectedReasonFilter === 'all'
              ? 'bg-primary/10 border-primary ring-1 ring-primary/30'
              : 'bg-surface border-border hover:border-border/80'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-gray-500/10 text-foreground flex items-center justify-center shrink-0">
            <Bell size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted uppercase block tracking-wider">Todas las Alertas</span>
            <span className="text-xl font-black text-foreground">{alerts.length}</span>
            {(criticalCount > 0 || highCount > 0) && (
              <span className="text-[10px] font-bold text-red-500 block">
                {criticalCount} crítica(s) | {highCount} alta(s)
              </span>
            )}
          </div>
        </div>

        <div
          onClick={() => setSelectedReasonFilter(selectedReasonFilter === 'adherence' ? 'all' : 'adherence')}
          className={`p-4.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
            selectedReasonFilter === 'adherence'
              ? 'bg-purple-500/15 border-purple-500 ring-1 ring-purple-500/30'
              : 'bg-surface border-border hover:border-border/80'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <Activity size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted uppercase block tracking-wider">Por Baja Adherencia</span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400">{adherenceCount}</span>
          </div>
        </div>

        <div
          onClick={() => setSelectedReasonFilter(selectedReasonFilter === 'inactivity' ? 'all' : 'inactivity')}
          className={`p-4.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
            selectedReasonFilter === 'inactivity'
              ? 'bg-blue-500/15 border-blue-500 ring-1 ring-blue-500/30'
              : 'bg-surface border-border hover:border-border/80'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Dumbbell size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted uppercase block tracking-wider">Por Inactividad</span>
            <span className="text-xl font-black text-blue-600 dark:text-blue-400">{inactivityCount}</span>
          </div>
        </div>

        <div
          onClick={() => setSelectedReasonFilter(selectedReasonFilter === 'calorie_excess' ? 'all' : 'calorie_excess')}
          className={`p-4.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
            selectedReasonFilter === 'calorie_excess'
              ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/30'
              : 'bg-surface border-border hover:border-border/80'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Flame size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted uppercase block tracking-wider">Por Exceso Calórico</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">{calorieCount}</span>
          </div>
        </div>
      </div>

      {/* HU36 Subtarea 1: [WEB] Mostrar alertas generadas */}
      <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h4 className="text-base font-black text-foreground flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              Listado de Alertas Generadas en el Sistema
            </h4>
            <p className="text-xs text-muted">
              {filteredAlerts.length === 0
                ? 'No hay alertas que coincidan con el filtro actual.'
                : `Mostrando ${filteredAlerts.length} alerta(s) registradas y ordenadas por relevancia.`}
            </p>
          </div>

          {/* Selector de filtro de estado (HU37/HU38 preparación y exploración) */}
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-muted" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-surface-hover text-xs font-extrabold text-foreground px-3 py-2 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Estado: Todos los Estados</option>
              <option value="pending">Pendientes de Revisión</option>
              <option value="reviewed">Revisadas / En Seguimiento</option>
              <option value="resolved">Atendidas / Resueltas</option>
            </select>
          </div>
        </div>

        {/* Lista de alertas */}
        {filteredAlerts.length === 0 ? (
          <div className="py-16 text-center text-muted space-y-3">
            <CheckCircle2 size={42} className="mx-auto text-emerald-500 opacity-80 animate-bounce" />
            <h5 className="text-base font-extrabold text-foreground">Sin Alertas Críticas o Pendientes</h5>
            <p className="text-xs max-w-md mx-auto">
              El paciente mantiene sus parámetros de adherencia, peso y actividad dentro de los márgenes normales o las alertas han sido atendidas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const sev = getSeverityStyles(alert.severity);
              return (
                <div
                  key={alert.id}
                  className={`rounded-2xl p-5 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    alert.status === 'resolved' || alert.status === 'dismissed'
                      ? 'bg-surface-hover/30 border-border/60 opacity-60'
                      : alert.severity === 'critical'
                        ? 'bg-red-500/10 border-red-500/50 shadow-md ring-1 ring-red-500/20'
                        : 'bg-surface-hover/60 border-border hover:border-border/90'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 shrink-0">{sev.icon}</div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${sev.bg} ${sev.text} ${sev.border}`}>
                          Severidad: {sev.badgeText}
                        </span>
                        {getReasonBadge(alert.alertType)}
                        <span className="text-[11px] font-bold text-muted flex items-center gap-1">
                          <Calendar size={12} /> Disparada: {alert.triggeredDate}
                        </span>
                      </div>

                      <h5 className="text-sm font-black text-foreground">{alert.title}</h5>
                      <p className="text-xs text-muted leading-relaxed max-w-3xl">{alert.message}</p>

                      {/* Mostrar metadata clave si existe */}
                      {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {Object.entries(alert.metadata).map(([key, val]) => (
                            <span
                              key={key}
                              className="inline-flex items-center px-2 py-0.5 rounded bg-border/40 text-[10px] font-semibold text-foreground/80"
                            >
                              {key}: <strong className="ml-1 text-foreground">{String(val)}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center shrink-0 border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold capitalize ${
                        alert.status === 'pending'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : alert.status === 'reviewed'
                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      Estado: {alert.status === 'pending' ? 'Pendiente' : alert.status === 'reviewed' ? 'Revisada' : 'Atendida'}
                    </span>

                    {/* Botones de acción rápida de estado */}
                    {alert.status === 'pending' && (
                      <button
                        onClick={() => updateStatus({ alertId: alert.id, status: 'reviewed' })}
                        disabled={isUpdatingStatus}
                        className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hover border border-border text-xs font-bold text-foreground transition-all hover:border-primary"
                        title="Marcar como revisada para seguimiento"
                      >
                        Revisar
                      </button>
                    )}
                    {alert.status !== 'resolved' && (
                      <button
                        onClick={() => updateStatus({ alertId: alert.id, status: 'resolved' })}
                        disabled={isUpdatingStatus}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-sm flex items-center gap-1"
                        title="Marcar como atendida / resuelta"
                      >
                        <CheckCircle2 size={13} />
                        Atendida
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
