import { useState, useEffect } from 'react';
import { api } from '../../../lib/axios';
import { endpoints } from '../../../lib/endpoints';
import { Calendar, Plus, Clock, User, Search, X, Edit2, Trash2, Link2, CheckCircle, XCircle } from 'lucide-react';

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  dateTime: string;
  reason: string;
  status: 'PROGRAMADA' | 'ATENDIDA' | 'CANCELADA' | 'REPROGRAMADA';
  evaluationId?: string | null;
}

interface AppointmentFormData {
  patientId: string;
  dateTime: string;
  reason: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PROGRAMADA: { label: 'Programada', color: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' },
  ATENDIDA: { label: 'Atendida', color: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' },
  CANCELADA: { label: 'Cancelada', color: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' },
  REPROGRAMADA: { label: 'Reprogramada', color: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' },
};

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: '',
    dateTime: '',
    reason: '',
  });
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [linkingAppointment, setLinkingAppointment] = useState<Appointment | null>(null);
  const [evaluations, setEvaluations] = useState<{ id: string; date: string; weightKg: number }[]>([]);

  useEffect(() => {
    loadAppointments();
    loadPatients();
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(endpoints.appointments.list);
      setAppointments(response.data);
    } catch {
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await api.get(endpoints.patients.list);
      setPatients(response.data.map((p: any) => ({ id: p.id, name: p.name || `Paciente ${p.id}` })));
    } catch {
      setPatients([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingAppointment) {
        await api.put(`/api/appointments/${editingAppointment.id}`, formData);
      } else {
        await api.post(endpoints.appointments.list, { ...formData, status: 'PROGRAMADA' });
      }
      setShowModal(false);
      setEditingAppointment(null);
      setFormData({ patientId: '', dateTime: '', reason: '' });
      await loadAppointments();
    } catch (err) {
      console.error('Error saving appointment:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (apt: Appointment) => {
    setEditingAppointment(apt);
    setFormData({
      patientId: apt.patientId,
      dateTime: apt.dateTime.slice(0, 16),
      reason: apt.reason,
    });
    setShowModal(true);
  };

  const handleCancel = async (id: string) => {
    try {
      await api.patch(`/api/appointments/${id}/status`, { status: 'CANCELADA' });
      await loadAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
    }
  };

  const handleMarkStatus = async (id: string, status: 'ATENDIDA' | 'CANCELADA') => {
    try {
      await api.patch(`/api/appointments/${id}/status`, { status });
      await loadAppointments();
    } catch (err) {
      console.error('Error marking appointment:', err);
    }
  };

  const openNewModal = () => {
    setEditingAppointment(null);
    setFormData({ patientId: '', dateTime: '', reason: '' });
    setShowModal(true);
  };

  const handleLinkEvaluation = async (appointmentId: string, evaluationId: string | null) => {
    try {
      await api.patch(`/api/appointments/${appointmentId}/link-evaluation`, { evaluationId });
      setLinkingAppointment(null);
      await loadAppointments();
    } catch (err) {
      console.error('Error linking evaluation:', err);
    }
  };

  const openLinkModal = async (apt: Appointment) => {
    setLinkingAppointment(apt);
    try {
      const response = await api.get(endpoints.clinicalEvaluations.history(apt.patientId));
      setEvaluations(response.data.map((e: any) => ({ id: e.id, date: e.evaluation_date || e.date, weightKg: e.weight_kg || e.weight })));
    } catch {
      setEvaluations([]);
    }
  };

  const filtered = appointments.filter(apt => {
    const matchesSearch = apt.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-foreground">Gestión de Citas</h1>
          <p className="text-muted text-[13px] mt-1">{appointments.length} citas registradas</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-gray-900 font-semibold py-2.5 px-6 rounded-full transition-all text-sm shadow-sm active:scale-95"
        >
          <Plus size={18} /> Nueva Cita
        </button>
      </div>

      {/* Cumplimiento de Citas (HU41) */}
      {!isLoading && appointments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface border border-border p-4 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs text-muted uppercase font-bold tracking-wider mb-0.5">Atendidas</p>
              <p className="text-xl font-bold text-foreground">{appointments.filter(a => a.status === 'ATENDIDA').length}</p>
            </div>
          </div>
          <div className="bg-surface border border-border p-4 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
              <XCircle size={24} />
            </div>
            <div>
              <p className="text-xs text-muted uppercase font-bold tracking-wider mb-0.5">No Atendidas / Canceladas</p>
              <p className="text-xl font-bold text-foreground">{appointments.filter(a => a.status === 'CANCELADA').length}</p>
            </div>
          </div>
          <div className="bg-surface border border-border p-4 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-xs text-muted uppercase font-bold tracking-wider mb-0.5">Programadas</p>
              <p className="text-xl font-bold text-foreground">{appointments.filter(a => a.status === 'PROGRAMADA' || a.status === 'REPROGRAMADA').length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar por motivo o paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'PROGRAMADA', 'ATENDIDA', 'CANCELADA', 'REPROGRAMADA'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${statusFilter === s ? 'bg-primary text-gray-900' : 'bg-surface border border-border text-muted hover:text-foreground'}`}
            >
              {s === 'ALL' ? 'Todas' : STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-20">
          <span className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin inline-block mb-4"></span>
          <p className="text-muted text-sm">Cargando citas...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border">
          <Calendar size={40} className="mx-auto text-muted mb-4 opacity-50" />
          <p className="text-foreground font-bold">Sin citas</p>
          <p className="text-muted text-sm mt-1">No se encontraron citas con los filtros actuales.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover border-b border-border text-xs uppercase tracking-wider text-muted font-bold">
                <th className="py-4 px-6 font-semibold">Fecha/Hora</th>
                <th className="py-4 px-6 font-semibold">Paciente</th>
                <th className="py-4 px-6 font-semibold">Motivo</th>
                <th className="py-4 px-6 font-semibold">Estado</th>
                <th className="py-4 px-6 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(apt => {
                const patientName = patients.find(p => p.id === apt.patientId)?.name || apt.patientId;
                return (
                  <tr key={apt.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-foreground flex items-center gap-2">
                      <Clock size={14} className="text-muted" />
                      {new Date(apt.dateTime).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground flex items-center gap-2">
                      <User size={14} className="text-muted" />
                      {patientName}
                    </td>
                    <td className="py-4 px-6 text-sm text-muted">{apt.reason}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${STATUS_CONFIG[apt.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_CONFIG[apt.status]?.label || apt.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(apt.status === 'PROGRAMADA' || apt.status === 'REPROGRAMADA') && (
                          <>
                            <button onClick={() => handleEdit(apt)} className="p-1.5 text-muted hover:text-primary rounded-lg hover:bg-surface-hover transition-colors" title="Editar">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleCancel(apt.id)} className="p-1.5 text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors" title="Cancelar">
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                        {(apt.status === 'PROGRAMADA' || apt.status === 'REPROGRAMADA') && (
                          <>
                            <button onClick={() => handleMarkStatus(apt.id, 'ATENDIDA')} className="p-1.5 text-muted hover:text-emerald-500 rounded-lg hover:bg-emerald-500/10 transition-colors" title="Marcar como atendida">
                              <CheckCircle size={14} />
                            </button>
                            <button onClick={() => handleMarkStatus(apt.id, 'CANCELADA')} className="p-1.5 text-muted hover:text-orange-500 rounded-lg hover:bg-orange-500/10 transition-colors" title="Marcar como no atendida">
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        <button onClick={() => openLinkModal(apt)} className="p-1.5 text-muted hover:text-blue-500 rounded-lg hover:bg-blue-500/10 transition-colors" title="Vincular evaluación">
                          <Link2 size={14} />
                        </button>
                        {apt.evaluationId && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-bold">Vinculada</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-foreground">
                {editingAppointment ? 'Editar Cita' : 'Nueva Cita'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingAppointment(null); }} className="text-muted hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Paciente</label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Seleccionar paciente...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Fecha y Hora</label>
                <input
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateTime: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Motivo</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Ej: Control mensual, Evaluación inicial..."
                  required
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-gray-900 font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : editingAppointment ? 'Actualizar Cita' : 'Crear Cita'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Link Evaluation Modal (HU40) */}
      {linkingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-foreground">Vincular Evaluación</h2>
              <button onClick={() => setLinkingAppointment(null)} className="text-muted hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-muted mb-4">Selecciona la evaluación clínica a vincular con esta cita:</p>
            {evaluations.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">No hay evaluaciones para este paciente.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {evaluations.map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => handleLinkEvaluation(linkingAppointment.id, ev.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${linkingAppointment.evaluationId === ev.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-surface-hover'}`}
                  >
                    <p className="text-sm font-bold text-foreground">
                      {new Date(ev.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-muted">Peso: {ev.weightKg} kg</p>
                  </button>
                ))}
              </div>
            )}
            {linkingAppointment.evaluationId && (
              <button
                onClick={() => handleLinkEvaluation(linkingAppointment.id, null)}
                className="w-full mt-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition-colors font-bold"
              >
                Desvincular evaluación
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
