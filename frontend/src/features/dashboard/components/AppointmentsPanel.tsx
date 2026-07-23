import { useState, useEffect } from 'react';
import { appointmentsApi, type Appointment } from '../services/appointmentsApi';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

export function AppointmentsPanel() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    const data = await appointmentsApi.getAppointments();
    setAppointments(data.filter(a => a.status === 'PROGRAMADA' || a.status === 'REPROGRAMADA'));
    setIsLoading(false);
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          <p className="text-[13px] font-bold text-foreground">Próximas Citas</p>
        </div>
        <button className="text-[11px] font-medium text-primary hover:text-primary-hover">Ver calendario</button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted text-center py-4">Cargando citas...</p>
      ) : appointments.length === 0 ? (
        <div className="text-center py-8">
          <CalendarIcon className="mx-auto text-blue-200 mb-2" size={32} />
          <p className="text-sm text-muted">No hay citas programadas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.slice(0, 5).map(apt => (
            <div key={apt.id} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <CalendarIcon className="text-blue-600 dark:text-blue-400" size={18} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-foreground">{apt.reason}</p>
                  <div className="flex items-center gap-1 text-[11px] text-muted">
                    <Clock size={10} />
                    <span>{new Date(apt.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md font-medium">
                {apt.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
