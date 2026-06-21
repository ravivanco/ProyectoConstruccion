import { LoginInput, RegisterInput } from '../../domain/models/Auth';
import { AuthRepository, TokenStorage } from '../../domain/repositories/AuthRepository';
export class RegisterPatient { constructor(private readonly repository: AuthRepository, private readonly storage: TokenStorage) {} async execute(input: RegisterInput) { const session = await this.repository.register(input); await this.storage.save(session.accessToken); return session; } }
export class LoginPatient { constructor(private readonly repository: AuthRepository, private readonly storage: TokenStorage) {} async execute(input: LoginInput) { const session = await this.repository.login(input); await this.storage.save(session.accessToken); return session; } }
