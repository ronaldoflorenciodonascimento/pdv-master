import { AuthError } from '../shared/errors/AuthError';
import { ChangePasswordDto, LoginDto } from './auth.types';

export function validateLogin(input: LoginDto): LoginDto {
  const email = input.email?.trim().toLowerCase();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new AuthError('Credenciais inválidas.');
  if (!input.password) throw new AuthError('Credenciais inválidas.');
  return { email, password: input.password };
}

export function validatePasswordChange(input: ChangePasswordDto): ChangePasswordDto {
  if (!input.currentPassword) throw new AuthError('A senha atual é obrigatória.');
  if (!input.newPassword || input.newPassword.length < 12) throw new AuthError('A nova senha deve ter pelo menos 12 caracteres.');
  if (input.currentPassword === input.newPassword) throw new AuthError('A nova senha deve ser diferente da senha atual.');
  return input;
}
