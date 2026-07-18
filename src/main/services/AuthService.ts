import bcrypt from 'bcryptjs';
import { DatabaseManager } from '../database/DatabaseManager';
import { AuthRepository, AuthUserRecord } from '../repositories/AuthRepository';
import { AuthError } from '../shared/errors/AuthError';
import { Logger } from '../shared/logging/Logger';
import { AuthenticatedUserDto, AuthSession, ChangePasswordDto, LoginDto } from '../auth/auth.types';
import { validateLogin, validatePasswordChange } from '../auth/auth.validation';

const INITIAL_ADMIN_EMAIL = 'admin@pdvmaster.local';
const INITIAL_ADMIN_PASSWORD = 'PDVMaster!2026';
const BCRYPT_ROUNDS = 12;

export class AuthService {
  private static instance: AuthService | undefined;
  private session: AuthSession | undefined;
  private readonly repository = new AuthRepository();
  private readonly database = DatabaseManager.getInstance();

  static getInstance(): AuthService { AuthService.instance ??= new AuthService(); return AuthService.instance; }

  async ensureInitialAdministrator(): Promise<void> {
    if (this.repository.countUsers() > 0) return;
    const hash = await bcrypt.hash(INITIAL_ADMIN_PASSWORD, BCRYPT_ROUNDS);
    this.database.transaction(() => {
      if (this.repository.countUsers() > 0) return;
      const companyId = this.repository.firstCompanyId() ?? this.repository.createDefaultCompany();
      this.repository.createAdministrator(companyId, hash);
    });
    Logger.info('Administrador inicial criado.', { email: INITIAL_ADMIN_EMAIL });
  }

  async login(input: LoginDto): Promise<AuthenticatedUserDto> {
    const { email, password } = validateLogin(input);
    const user = this.repository.findByEmail(email);
    if (!user) throw new AuthError('Credenciais inválidas.');
    if (!user.active) throw new AuthError('Usuário inativo.', 'USER_INACTIVE');
    if (!(await bcrypt.compare(password, user.password_hash))) throw new AuthError('Credenciais inválidas.');
    this.repository.updateLastLogin(user.id);
    this.session = this.toSession(user);
    Logger.info('Login efetuado.', { userId: user.id, companyId: user.company_id });
    return this.toDto(this.session);
  }

  logout(): void { if (this.session) Logger.info('Logout efetuado.', { userId: this.session.id }); this.session = undefined; }
  currentSession(): AuthenticatedUserDto | null { return this.session ? this.toDto(this.session) : null; }

  async changePassword(input: ChangePasswordDto): Promise<AuthenticatedUserDto> {
    const session = this.requireSession();
    const { currentPassword, newPassword } = validatePasswordChange(input);
    const user = this.repository.findById(session.id);
    if (!user || !user.active) { this.logout(); throw new AuthError('Sessão inválida.'); }
    if (!(await bcrypt.compare(currentPassword, user.password_hash))) throw new AuthError('Senha atual inválida.');
    this.repository.updatePassword(user.id, await bcrypt.hash(newPassword, BCRYPT_ROUNDS));
    this.session = { ...this.toSession({ ...user, must_change_password: 0 }), createdAt: session.createdAt };
    Logger.info('Senha alterada.', { userId: user.id });
    return this.toDto(this.session);
  }

  private requireSession(): AuthSession { if (!this.session) throw new AuthError('Autenticação necessária.', 'UNAUTHENTICATED'); return this.session; }
  private toSession(user: AuthUserRecord): AuthSession { return { ...this.toDto(user), createdAt: new Date().toISOString() }; }
  private toDto(user: AuthUserRecord | AuthSession): AuthenticatedUserDto {
    const databaseUser = 'company_id' in user;
    return {
      id: user.id,
      companyId: databaseUser ? user.company_id : user.companyId,
      name: user.name,
      email: user.email,
      mustChangePassword: Boolean(databaseUser ? user.must_change_password : user.mustChangePassword),
    };
  }
}
