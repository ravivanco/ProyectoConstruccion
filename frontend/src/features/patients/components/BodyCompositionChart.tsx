import { Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TrendData } from '../services/clinicalEvaluationApi';

interface BodyCompositionChartProps {
  trends: TrendData[];
}

export function BodyCompositionChart({ trends }: BodyCompositionChartProps) {
  if (trends.length < 2) return null;

  const chartData = trends.map(t => ({
    ...t,
    dateLabel: new Date(t.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 border-t border-border pt-8">
      <div>
        <h4 className="text-sm font-bold text-muted mb-4">Grasa Corporal (%)</h4>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="dateLabel" stroke="#94a3b8" fontSize={12} />
              <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#fb923c' }}
              />
              <Line 
                type="monotone" 
                dataKey="bodyFatPercentage" 
                name="Grasa" 
                stroke="#fb923c" 
                strokeWidth={3} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-bold text-muted mb-4">Masa Muscular (%)</h4>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="dateLabel" stroke="#94a3b8" fontSize={12} />
              <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#a855f7' }}
              />
              <Line 
                type="monotone" 
                dataKey="muscleMassPercentage" 
                name="Músculo" 
                stroke="#a855f7" 
                strokeWidth={3} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
