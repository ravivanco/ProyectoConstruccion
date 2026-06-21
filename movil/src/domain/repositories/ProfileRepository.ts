import { PatientProfile } from '../models/Profile';
export interface ProfileRepository { complete(profile: PatientProfile): Promise<void>; }
