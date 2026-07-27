import { useEffect, useState } from 'react';
import { api } from '../../../lib/axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

interface WeightData {
  date: string;
  weight: number;
}

export function DailyWeightChart({ patientId }: { patientId: string }) {
  const [data, setData] = useState<WeightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/adherence/patient/${patientId}/weight-trend`);
        setData(res.data);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTrend();
  }, [patientId]);

  if (loading) {
    return (
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm flex items-center justify-center min-h-[300px]">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-muted text-sm">Sin datos de peso diario registrados aún.</p>
      </div>
    );
  }

  const minWeight = Math.min(...data.map((d) => d.weight)) - 2;
  const maxWeight = Math.max(...data.map((d) => d.weight)) + 2;

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
        <p className="text-[13px] font-bold text-foreground">Evolución Diaria de Peso (Adherencia)</p>
      </div>
      
      <div className="h-64 w-full text-[11px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} />
            <YAxis domain={[minWeight, maxWeight]} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#111827', fontWeight: 'bold' }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              name="Peso (kg)"
              stroke="#eab308"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
