import { PatientProfile } from '../../domain/models/Profile';
import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
export class CompleteProfile { constructor(private readonly repository: ProfileRepository) {} execute(profile: PatientProfile) { return this.repository.complete(profile); } }
