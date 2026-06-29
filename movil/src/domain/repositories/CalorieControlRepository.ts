import { CalorieDashboard } from '../models/CalorieDashboard';

export interface CalorieControlRepository {
  getDashboard(): Promise<CalorieDashboard | null>;
}
