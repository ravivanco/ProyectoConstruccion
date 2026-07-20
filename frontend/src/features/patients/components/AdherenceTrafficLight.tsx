import { AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import type { AdherenceClassification } from './AdherenceLevelBadge';

interface AdherenceTrafficLightProps {
  score?: number;
  level?: AdherenceClassification;
  compact?: boolean;
}

export function AdherenceTrafficLight({ score, level, compact = false }: AdherenceTrafficLightProps) {
  const getClassificationType = (): 'alta' | 'media' | 'baja' => {
    if (typeof score === 'number') {
      if (score >= 80) return 'alta';
      if (score >= 60) return 'media';
      return 'baja';
    }

    if (level) {
      const normalized = level.toLowerCase();
      if (normalized.includes('alta') || normalized === 'high') return 'alta';
      if (normalized.includes('media') || normalized === 'medium') return 'media';
      if (normalized.includes('baja') || normalized === 'low') return 'baja';
    }

    return 'media';
  };

  const currentType = getClassificationType();

  const details = {
    alta: {
      title: 'Adherencia Óptima (Verde)',
      desc: 'El paciente cumple rigurosamente con sus planes alimentarios y rutinas físicas asignadas.',
      recommendation: 'Mantener el esquema actual y reforzar positivamente sus logros.',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgHeader: 'bg-emerald-500/10 border-emerald-500/30',
      icon: <CheckCircle className="text-emerald-500 shrink-0" size={18} />,
    },
    media: {
      title: 'Adherencia Moderada (Amarillo)',
      desc: 'El paciente presenta cierta irregularidad en sus registros de comidas o ejercicios.',
      recommendation: 'Revisar preferencias del menú, ajustar porciones o verificar barreras de tiempo.',
      color: 'text-amber-600 dark:text-amber-400',
      bgHeader: 'bg-amber-500/10 border-amber-500/30',
      icon: <AlertCircle className="text-amber-500 shrink-0" size={18} />,
    },
    baja: {
      title: 'Alerta Clínica: Adherencia Baja (Rojo)',
      desc: 'El paciente se encuentra por debajo del umbral mínimo de cumplimiento (60%).',
      recommendation: 'Contactar de inmediato para entrevista de re-evaluación o rediseño del plan.',
      color: 'text-red-600 dark:text-red-400',
      bgHeader: 'bg-red-500/10 border-red-500/30',
      icon: <AlertCircle className="text-red-500 shrink-0" size={18} />,
    },
  }[currentType];

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 bg-surface-hover px-3 py-1.5 rounded-xl border border-border shadow-2xs">
        <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider">Semáforo:</span>
        <div className="flex items-center gap-1.5">
          {/* Luz Roja */}
          <span
            className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
              currentType === 'baja'
                ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] scale-110 ring-2 ring-red-500/30 animate-pulse'
                : 'bg-red-500/20 opacity-30 grayscale'
            }`}
            title="Saturación/Alerta - Baja Adherencia (< 60%)"
          />
          {/* Luz Amarilla */}
          <span
            className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
              currentType === 'media'
                ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] scale-110 ring-2 ring-amber-400/30 animate-pulse'
                : 'bg-amber-400/20 opacity-30 grayscale'
            }`}
            title="Precaución - Media Adherencia (60% - 79%)"
          />
          {/* Luz Verde */}
          <span
            className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
              currentType === 'alta'
                ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] scale-110 ring-2 ring-emerald-500/30 animate-pulse'
                : 'bg-emerald-500/20 opacity-30 grayscale'
            }`}
            title="Cumplimiento Óptimo - Alta Adherencia (>= 80%)"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-3xl border border-border p-5 shadow-sm space-y-4 transition-all">
      <div className="flex items-center justify-between border-b border-border pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="text-sm font-black text-foreground">Semáforo de Adherencia</h4>
            <p className="text-[11px] text-muted">Indicador visual de riesgo y cumplimiento del tratamiento</p>
          </div>
        </div>

        {/* Las 3 Luces del Semáforo */}
        <div className="flex items-center gap-3 bg-gray-950/80 dark:bg-gray-900/90 px-4 py-2 rounded-2xl border border-border shadow-inner">
          {/* Luz Roja */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-5 h-5 rounded-full transition-all duration-500 ${
                currentType === 'baja'
                  ? 'bg-red-500 shadow-[0_0_16px_rgba(239,68,68,0.9)] scale-125 ring-4 ring-red-500/20 animate-pulse'
                  : 'bg-red-950/60 opacity-30 border border-red-500/20'
              }`}
            />
            <span className={`text-[9px] font-black uppercase ${currentType === 'baja' ? 'text-red-400 font-extrabold' : 'text-muted opacity-40'}`}>
              Bajo
            </span>
          </div>

          <div className="w-px h-6 bg-border/40" />

          {/* Luz Amarilla */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-5 h-5 rounded-full transition-all duration-500 ${
                currentType === 'media'
                  ? 'bg-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.9)] scale-125 ring-4 ring-amber-400/20 animate-pulse'
                  : 'bg-amber-950/60 opacity-30 border border-amber-500/20'
              }`}
            />
            <span className={`text-[9px] font-black uppercase ${currentType === 'media' ? 'text-amber-400 font-extrabold' : 'text-muted opacity-40'}`}>
              Medio
            </span>
          </div>

          <div className="w-px h-6 bg-border/40" />

          {/* Luz Verde */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-5 h-5 rounded-full transition-all duration-500 ${
                currentType === 'alta'
                  ? 'bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.9)] scale-125 ring-4 ring-emerald-500/20 animate-pulse'
                  : 'bg-emerald-950/60 opacity-30 border border-emerald-500/20'
              }`}
            />
            <span className={`text-[9px] font-black uppercase ${currentType === 'alta' ? 'text-emerald-400 font-extrabold' : 'text-muted opacity-40'}`}>
              Alto
            </span>
          </div>
        </div>
      </div>

      {/* Tarjeta con Descripción Clínica y Acción Recomendada */}
      <div className={`p-4 rounded-2xl border ${details.bgHeader} flex items-start gap-3 transition-colors`}>
        {details.icon}
        <div className="space-y-1">
          <h5 className={`text-xs font-black ${details.color}`}>{details.title}</h5>
          <p className="text-xs text-foreground/90 font-medium leading-relaxed">{details.desc}</p>
          <div className="pt-1.5 mt-1.5 border-t border-border/40 flex items-center gap-1.5">
            <span className="text-[11px] font-extrabold text-muted">Recomendación:</span>
            <span className="text-[11px] font-semibold text-foreground">{details.recommendation}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
