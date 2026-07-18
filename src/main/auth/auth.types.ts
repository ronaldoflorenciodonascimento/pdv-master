export interface AuthenticatedUserDto {
  id: number;
  companyId: number;
  name: string;
  email: string;
  mustChangePassword: boolean;
}

export interface LoginDto { email: string; password: string; }
export interface ChangePasswordDto { currentPassword: string; newPassword: string; }

export interface AuthSession extends AuthenticatedUserDto { createdAt: string; }
