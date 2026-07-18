import { DatabaseManager } from '../database/DatabaseManager';

export interface AuthUserRecord {
  id: number;
  company_id: number;
  name: string;
  email: string;
  password_hash: string;
  active: number;
  must_change_password: number;
}

export class AuthRepository {
  private readonly database = DatabaseManager.getInstance();

  countUsers(): number { return this.database.queryOne<{ total: number }>('SELECT COUNT(*) AS total FROM users')?.total ?? 0; }
  findByEmail(email: string): AuthUserRecord | undefined { return this.database.queryOne<AuthUserRecord>('SELECT id, company_id, name, email, password_hash, active, must_change_password FROM users WHERE email = ? LIMIT 1', [email]); }
  findById(id: number): AuthUserRecord | undefined { return this.database.queryOne<AuthUserRecord>('SELECT id, company_id, name, email, password_hash, active, must_change_password FROM users WHERE id = ?', [id]); }
  firstCompanyId(): number | undefined { return this.database.queryOne<{ id: number }>('SELECT id FROM companies ORDER BY id LIMIT 1')?.id; }
  createDefaultCompany(): number { return Number(this.database.execute('INSERT INTO companies (legal_name, trade_name, document_number) VALUES (?, ?, ?)', ['PDV Master', 'PDV Master', 'PENDING-SETUP']).lastInsertRowid); }
  createAdministrator(companyId: number, passwordHash: string): number { return Number(this.database.execute('INSERT INTO users (company_id, name, email, password_hash, active, must_change_password) VALUES (?, ?, ?, ?, 1, 1)', [companyId, 'Administrador', 'admin@pdvmaster.local', passwordHash]).lastInsertRowid); }
  updatePassword(userId: number, passwordHash: string): void { this.database.execute('UPDATE users SET password_hash = ?, must_change_password = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [passwordHash, userId]); }
  updateLastLogin(userId: number): void { this.database.execute('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [userId]); }
}
