import { useState } from 'react';
import { X, Flame, Clock, Utensils, AlertCircle, Eye } from 'lucide-react';
import type { AdditionalFoodLog } from '../types';

interface AdditionalIntakeImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AdditionalFoodLog | null;
}

function ModalBody({
  log,
  onClose,
}: {
  log: AdditionalFoodLog;
  onClose: () => void;
}) {
  const [imageError, setImageError] = useState(!log.imageUrl);
  const [isLoadingImage, setIsLoadingImage] = useState(Boolean(log.imageUrl));

  const dateObj = new Date(log.createdAt || log.logDate + 'T12:00:00');
  const formattedDate = dateObj.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = log.createdAt
    ? dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    : 'Registro Diario';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface rounded-3xl border border-border w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Contenedor de Imagen Ampliada (Cloudinary / Evidencia Visual) */}
        <div className="w-full md:w-3/5 bg-gray-950 flex flex-col items-center justify-center p-6 relative min-h-[300px] md:min-h-[450px]">
          {isLoadingImage && !imageError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-950/90 text-gray-400">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider">Cargando evidencia visual...</span>
            </div>
          )}

          {imageError || !log.imageUrl ? (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 bg-gray-900/60 rounded-2xl border border-gray-800 text-gray-400">
              <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center text-gray-500">
                <AlertCircle size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-300">
                  {log.imageUrl ? 'Error de carga desde Cloudinary' : 'Evidencia no adjuntada'}
                </p>
                <p className="text-xs text-gray-500 max-w-xs mt-1">
                  {log.imageUrl
                    ? 'No se pudo acceder al recurso de imagen remoto. Verifique la conexión o el enlace de la imagen.'
                    : 'El paciente registró este alimento sin adjuntar una fotografía desde la aplicación móvil.'}
                </p>
              </div>
            </div>
          ) : (
            <img
              src={log.imageUrl}
              alt={log.foodName}
              onLoad={() => setIsLoadingImage(false)}
              onError={() => {
                setImageError(true);
                setIsLoadingImage(false);
              }}
              className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg transition-transform duration-300"
            />
          )}

          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
            <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1.5 border border-white/10">
              <Eye size={13} className="text-primary" /> Vista ampliada de evidencia real
            </span>
          </div>
        </div>

        {/* Panel lateral con datos vinculados al registro (Criterio: "Cada imagen debe vincularse a un registro") */}
        <div className="w-full md:w-2/5 p-6 flex flex-col justify-between overflow-y-auto bg-surface border-t md:border-t-0 md:border-l border-border">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted block mb-1">
                  Evidencia Fotográfica Vinculada
                </span>
                <h3 className="text-lg font-black text-foreground leading-tight">
                  {log.foodName}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-surface-hover hover:bg-border text-muted hover:text-foreground transition-colors"
                title="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            {log.quantity && (
              <div className="bg-surface-hover p-3 rounded-2xl border border-border">
                <span className="text-[11px] font-bold text-muted block uppercase">Porción Reportada</span>
                <span className="text-sm font-extrabold text-foreground">{log.quantity}</span>
              </div>
            )}

            {/* Impacto calórico y macros */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Flame size={18} />
                  <span className="text-xs font-black uppercase">Calorías Estimadas</span>
                </div>
                <span className="text-base font-black text-amber-600 dark:text-amber-400">
                  {log.calories ? `${log.calories} kcal` : '0 kcal'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                <div className="bg-blue-500/10 text-blue-500 p-2 rounded-xl border border-blue-500/20">
                  <span className="block text-[10px] uppercase text-muted">Prot</span>
                  {log.protein || 0}g
                </div>
                <div className="bg-purple-500/10 text-purple-500 p-2 rounded-xl border border-purple-500/20">
                  <span className="block text-[10px] uppercase text-muted">Carb</span>
                  {log.carbs || 0}g
                </div>
                <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-xl border border-emerald-500/20">
                  <span className="block text-[10px] uppercase text-muted">Grasa</span>
                  {log.fat || 0}g
                </div>
              </div>
            </div>

            {/* Contexto cronológico y notas */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div>
                <span className="text-[11px] font-bold text-muted uppercase flex items-center gap-1.5 mb-1">
                  <Clock size={13} /> Fecha y Hora de Toma
                </span>
                <p className="text-xs font-semibold text-foreground capitalize">
                  {formattedDate} • {formattedTime}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-muted uppercase flex items-center gap-1.5 mb-1">
                  <Utensils size={13} /> Contexto del Paciente
                </span>
                <p className="text-xs text-muted italic bg-surface-hover p-3 rounded-xl border border-border">
                  "{log.notes || 'Sin observations adicionales reportadas por el paciente.'}"
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-border">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-surface-hover hover:bg-border text-foreground transition-all flex items-center justify-center gap-2"
            >
              Cerrar Evidencia Visual
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export function AdditionalIntakeImageModal({
  isOpen,
  onClose,
  log,
}: AdditionalIntakeImageModalProps) {
  if (!isOpen || !log) return null;
  return <ModalBody key={log.id} log={log} onClose={onClose} />;
}
