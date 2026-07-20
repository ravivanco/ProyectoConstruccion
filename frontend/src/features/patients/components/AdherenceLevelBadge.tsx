import { CheckCircle2, Activity, AlertCircle } from 'lucide-react';

export type AdherenceClassification = 'alta' | 'media' | 'baja' | 'Alta Adherencia' | 'Media Adherencia' | 'Baja Adherencia' | string;

interface AdherenceLevelBadgeProps {
  score?: number;
  level?: AdherenceClassification;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AdherenceLevelBadge({
  score,
  level,
  showScore = true,
  size = 'md',
}: AdherenceLevelBadgeProps) {
  // Clasificación automática basada en indicadores calculados (si se proporciona score) o en etiqueta directa
  const getClassification = (): { label: string; type: 'alta' | 'media' | 'baja' } => {
    if (typeof score === 'number') {
      if (score >= 80) return { label: 'Alta Adherencia', type: 'alta' };
      if (score >= 60) return { label: 'Media Adherencia', type: 'media' };
      return { label: 'Baja Adherencia', type: 'baja' };
    }

    if (level) {
      const normalized = level.toLowerCase();
      if (normalized.includes('alta') || normalized === 'high') {
        return { label: 'Alta Adherencia', type: 'alta' };
      }
      if (normalized.includes('media') || normalized === 'medium') {
        return { label: 'Media Adherencia', type: 'media' };
      }
      if (normalized.includes('baja') || normalized === 'low') {
        return { label: 'Baja Adherencia', type: 'baja' };
      }
    }

    return { label: 'Sin Clasificar', type: 'media' };
  };

  const { label, type } = getClassification();

  const getBadgeStyles = () => {
    switch (type) {
      case 'alta':
        return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
      case 'media':
        return 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
      case 'baja':
        return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'alta':
        return <CheckCircle2 size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />;
      case 'media':
        return <Activity size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />;
      case 'baja':
        return <AlertCircle size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />;
    }
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-extrabold rounded-full border shadow-sm transition-all ${getBadgeStyles()} ${sizeStyles[size]}`}
      title={`Etiqueta de nivel de adherencia calculada automáticamente: ${label}`}
    >
      {getIcon()}
      <span>{label}</span>
      {showScore && typeof score === 'number' && (
        <span className="opacity-80 font-black ml-0.5">({score}%)</span>
      )}
    </span>
  );
}
