import { UserRepository } from '../repositories/UserRepository';
import { User } from '../repositories/entities';
import { BaseService } from './BaseService';
export class UserService extends BaseService<User> { constructor(repository = new UserRepository()) { super(repository); } }
