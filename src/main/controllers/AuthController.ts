import { ChangePasswordDto, LoginDto } from '../auth/auth.types';
import { AuthService } from '../services/AuthService';
import { BaseController, ControllerResponse } from './BaseController';

export class AuthController extends BaseController {
  constructor(private readonly service = AuthService.getInstance()) { super(); }
  login(input: LoginDto): Promise<ControllerResponse<ReturnType<AuthService['currentSession']>>> { return this.executeAsync(() => this.service.login(input)); }
  logout(): ControllerResponse<null> { return this.execute(() => { this.service.logout(); return null; }); }
  session(): ControllerResponse<ReturnType<AuthService['currentSession']>> { return this.execute(() => this.service.currentSession()); }
  changePassword(input: ChangePasswordDto): Promise<ControllerResponse<ReturnType<AuthService['currentSession']>>> { return this.executeAsync(() => this.service.changePassword(input)); }
}
