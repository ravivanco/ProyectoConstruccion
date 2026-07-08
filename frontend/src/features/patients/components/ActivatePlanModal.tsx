import { useState, useEffect } from 'react';
import { X, Calendar, PlayCircle, AlertCircle, CheckCircle } from 'lucide-react';

interface ActivatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startDate: string) => Promise<void>;
  patientName: string;
}

export function ActivatePlanModal({ isOpen, onClose, onConfirm, patientName }: ActivatePlanModalProps) {
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Set today's date as default formatted as YYYY-MM-DD
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const today = new Date();
        // Ajustar zona horaria local para evitar problemas con UTC
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        setStartDate(today.toISOString().split('T')[0]);
        setError('');
        setIsSuccess(false);
      }, 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateDate = (dateStr: string) => {
    const selected = new Date(dateStr + 'T00:00:00'); // Forzar hora local medianoche
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selected < today) {
      return 'La fecha de inicio no puede ser en el pasado.';
    }
    return '';
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDate(value);
    
    if (value) {
      setError(validateDate(value));
    } else {
      setError('Debes seleccionar una fecha.');
    }
  };

  const handleConfirm = async () => {
    const validationError = validateDate(startDate);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsActivating(true);
    try {
      await onConfirm(startDate);
      setIsSuccess(true);
      setTimeout(() => {
        setIsActivating(false);
        onClose();
      }, 1000);
    } catch {
      setError('Ocurrió un error al activar el plan.');
      setIsActivating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={!isActivating && !isSuccess ? onClose : undefined}
          className="absolute top-4 right-4 p-2 text-muted hover:text-foreground bg-surface hover:bg-surface-hover rounded-full transition-colors disabled:opacity-50"
          disabled={isActivating || isSuccess}
        >
          <X size={20} />
        </button>

        {!isSuccess ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <PlayCircle size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Activar Plan</h2>
                <p className="text-sm text-muted">Para {patientName}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[13px] font-semibold text-muted mb-2 flex items-center gap-2">
                  <Calendar size={16} /> Fecha de Inicio del Plan
                </label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={handleDateChange}
                  className={`w-full bg-surface-hover border ${error ? 'border-red-500' : 'border-border'} rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                />
                {error && (
                  <p className="text-red-500 text-[12px] font-medium flex items-center gap-1 mt-2">
                    <AlertCircle size={14} /> {error}
                  </p>
                )}
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <p className="text-[13px] text-primary-hover font-medium">
                  El paciente tendrá acceso a su planificación, metas y pautas nutricionales a partir de la fecha seleccionada.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={onClose}
                disabled={isActivating}
                className="px-5 py-2.5 rounded-xl text-foreground font-semibold hover:bg-surface-hover transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirm}
                disabled={isActivating || !!error || !startDate}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isActivating ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  'Confirmar Activación'
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground">¡Plan Activado!</h3>
            <p className="text-muted text-sm mt-2">El paciente ya puede visualizar su planificación.</p>
          </div>
        )}
      </div>
    </div>
  );
}
