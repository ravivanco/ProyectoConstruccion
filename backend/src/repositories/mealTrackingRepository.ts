import { pool } from '../db/pool.js';
import { getFoodCompliance } from './adherenceRepository.js';
import { listMealLogs } from './mealLogRepository.js';
import { MEAL_TYPES } from '../types/tracking.js';

export interface MealTrackingSlot {
  mealType: string;
  logged: boolean;
  calories: number;
  foodName?: string;
  logDate: string;
}

export interface PatientMealTracking {
  patientId: string;
  logDate: string;
  compliancePercentage: number;
  mealsLogged: number;
  mealsExpected: number;
  slots: MealTrackingSlot[];
  logs: Awaited<ReturnType<typeof listMealLogs>>;
}

export async function getPatientMealTracking(
  patientId: string,
  logDate?: string,
): Promise<PatientMealTracking> {
  const date = logDate ?? new Date().toISOString().slice(0, 10);
  const logs = await listMealLogs(patientId, date);
  const loggedTypes = new Set(logs.map((log) => log.mealType));

  const slots: MealTrackingSlot[] = MEAL_TYPES.map((mealType) => {
    const log = logs.find((entry) => entry.mealType === mealType);
    return {
      mealType,
      logged: loggedTypes.has(mealType),
      calories: log?.calories ?? 0,
      foodName: log?.foodName,
      logDate: date,
    };
  });

  const compliance = await getFoodCompliance(patientId, 1);

  return {
    patientId,
    logDate: date,
    compliancePercentage: compliance.compliancePercentage,
    mealsLogged: slots.filter((slot) => slot.logged).length,
    mealsExpected: MEAL_TYPES.length,
    slots,
    logs,
  };
}
