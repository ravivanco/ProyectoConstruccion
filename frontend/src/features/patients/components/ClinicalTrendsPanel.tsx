import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { clinicalEvaluationAPI, type TrendData } from '../services/clinicalEvaluationApi';
import { BodyCompositionChart } from './BodyCompositionChart';

interface ClinicalTrendsPanelProps {
  patientId: string;
}

export function ClinicalTrendsPanel({ patientId }: ClinicalTrendsPanelProps) {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setIsLoading(true);
        const data = await clinicalEvaluationAPI.trends(patientId);
        setTrends(data.trends);
      } catch (err) {
        setError('Error al cargar tendencias');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrends();
  }, [patientId]);

  if (isLoading) {
    return <div className="text-center py-8 text-muted">Cargando tendencias...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (trends.length < 2) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Activity size={20} className="text-primary" />
          Tendencias Clínicas
        </h3>
        <p className="text-sm text-muted">Se requieren al menos 2 evaluaciones para mostrar las tendencias.</p>
      </div>
    );
  }

  // format date for x axis
  const chartData = trends.map(t => ({
    ...t,
    dateLabel: new Date(t.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }));

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <Activity size={20} className="text-primary" />
        Tendencias Clínicas
      </h3>
      
      <div className="space-y-8">
        <div>
          <h4 className="text-sm font-bold text-muted mb-4">Evolución de Peso (kg)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="dateLabel" stroke="#94a3b8" fontSize={12} />
                <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="weightKg" 
                  name="Peso" 
                  stroke="#38bdf8" 
                  strokeWidth={3}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <BodyCompositionChart trends={trends} />
      </div>
    </div>
  );
}
