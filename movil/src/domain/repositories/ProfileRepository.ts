import { PatientProfile } from '../models/Profile';
export interface ProfileRepository { getMe(): Promise<PatientProfile | null>; complete(profile: PatientProfile): Promise<void>; }
