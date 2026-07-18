import { BaseRepository } from './BaseRepository';
import { User } from './entities';
export class UserRepository extends BaseRepository<User> {
  constructor() { super('users'); }
  findByEmail(companyId: number, email: string): User | undefined { return this.queryOne<User>('SELECT * FROM users WHERE company_id = ? AND email = ?', [companyId, email]); }
}
