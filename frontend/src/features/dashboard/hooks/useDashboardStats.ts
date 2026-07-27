import { useState, useEffect } from 'react';
import { api } from '../../../lib/axios';
import { endpoints } from '../../../lib/endpoints';

export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  pendingPatients: number;
  totalFoods: number;
  totalExercises: number;
  totalPlans: number;
  activePlans: number;
  isLoading: boolean;
}

export function useDashboardStats(): DashboardStats {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    activePatients: 0,
    pendingPatients: 0,
    totalFoods: 0,
    totalExercises: 0,
    totalPlans: 0,
    activePlans: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(endpoints.dashboard.nutritionist);
        setStats({
          totalPatients: res.data.totalPatients || 0,
          activePatients: res.data.activePatients || 0,
          pendingPatients: res.data.pendingPatients || 0,
          totalFoods: res.data.totalFoods || 0,
          totalExercises: res.data.totalExercises || 0,
          totalPlans: res.data.totalPlans || 0,
          activePlans: res.data.activePlans || 0,
          isLoading: false,
        });
      } catch {
        setStats((prev) => ({ ...prev, isLoading: false }));
      }
    };
    fetchStats();
  }, []);

  return stats;
}
