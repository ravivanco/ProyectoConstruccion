import { useState } from 'react';
import { X, Activity, Weight, Ruler, Save } from 'lucide-react';

interface ClinicalEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export function ClinicalEvaluationModal({ isOpen, onClose, onSave }: ClinicalEvaluationModalProps) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!weight) newErrors.weight = 'Obligatorio';
    else if (Number(weight) <= 0) newErrors.weight = 'Debe ser > 0';

    if (!height) newErrors.height = 'Obligatorio';
    else if (Number(height) <= 0) newErrors.height = 'Debe ser > 0';

    if (!bodyFat) newErrors.bodyFat = 'Obligatorio';
    else if (Number(bodyFat) < 0 || Number(bodyFat) > 100) newErrors.bodyFat = 'Entre 0 y 100';

    if (!muscleMass) newErrors.muscleMass = 'Obligatorio';
    else if (Number(muscleMass) < 0 || Number(muscleMass) > 100) newErrors.muscleMass = 'Entre 0 y 100';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        weight: Number(weight),
        height: Number(height),
        bodyFat: Number(bodyFat),
        muscleMass: Number(muscleMass),
        date: new Date().toISOString()
      });
      // Limpiar formulario al éxito
      setWeight('');
      setHeight('');
      setBodyFat('');
      setMuscleMass('');
      onClose();
    } catch (error) {
      console.error("Error al guardar evaluación", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface-hover">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Activity size={20} className="text-primary" />
            Nueva Evaluación Clínica
          </h2>
          <button 
            onClick={onClose}
            className="text-muted hover:text-foreground p-1 rounded-full hover:bg-surface transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            {/* Peso */}
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Weight size={14} /> Peso (kg)
              </label>
              <input 
                type="number" 
                step="0.1"
                value={weight}
                onChange={(e) => { setWeight(e.target.value); setErrors({...errors, weight: ''}); }}
                className={`w-full px-4 py-2.5 bg-surface-hover border ${errors.weight ? 'border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'} text-foreground rounded-xl text-sm focus:outline-none focus:ring-1 transition-all`}
                placeholder="Ej. 70.5"
              />
              {errors.weight && <p className="text-red-500 text-xs mt-1 font-medium">{errors.weight}</p>}
            </div>

            {/* Talla */}
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Ruler size={14} /> Estatura (cm)
              </label>
              <input 
                type="number" 
                step="1"
                value={height}
                onChange={(e) => { setHeight(e.target.value); setErrors({...errors, height: ''}); }}
                className={`w-full px-4 py-2.5 bg-surface-hover border ${errors.height ? 'border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'} text-foreground rounded-xl text-sm focus:outline-none focus:ring-1 transition-all`}
                placeholder="Ej. 175"
              />
              {errors.height && <p className="text-red-500 text-xs mt-1 font-medium">{errors.height}</p>}
            </div>

            {/* Grasa Corporal */}
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                % Grasa Corporal
              </label>
              <input 
                type="number" 
                step="0.1"
                value={bodyFat}
                onChange={(e) => { setBodyFat(e.target.value); setErrors({...errors, bodyFat: ''}); }}
                className={`w-full px-4 py-2.5 bg-surface-hover border ${errors.bodyFat ? 'border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'} text-foreground rounded-xl text-sm focus:outline-none focus:ring-1 transition-all`}
                placeholder="Ej. 20.5"
              />
              {errors.bodyFat && <p className="text-red-500 text-xs mt-1 font-medium">{errors.bodyFat}</p>}
            </div>

            {/* Masa Muscular */}
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                % Masa Muscular
              </label>
              <input 
                type="number" 
                step="0.1"
                value={muscleMass}
                onChange={(e) => { setMuscleMass(e.target.value); setErrors({...errors, muscleMass: ''}); }}
                className={`w-full px-4 py-2.5 bg-surface-hover border ${errors.muscleMass ? 'border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'} text-foreground rounded-xl text-sm focus:outline-none focus:ring-1 transition-all`}
                placeholder="Ej. 45.0"
              />
              {errors.muscleMass && <p className="text-red-500 text-xs mt-1 font-medium">{errors.muscleMass}</p>}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary hover:bg-primary-hover text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Save size={16} />
              )}
              Guardar Evaluación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
