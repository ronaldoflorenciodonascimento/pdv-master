import { IpcMain } from 'electron';
import { PersistenceController } from '../controllers/PersistenceController';
import { AuthController } from '../controllers/AuthController';
import { IPCManager } from './IPCManager';

export function registerIpcHandlers(ipcMain: IpcMain): IPCManager {
  const manager = new IPCManager(ipcMain);
  const persistence = new PersistenceController();
  const auth = new AuthController();
  manager.handle('app:status', () => persistence.status());
  manager.handle('auth:login', (_, input) => auth.login(input as { email: string; password: string }));
  manager.handle('auth:logout', () => auth.logout());
  manager.handle('auth:session', () => auth.session());
  manager.handle('auth:change-password', (_, input) => auth.changePassword(input as { currentPassword: string; newPassword: string }));
  return manager;
}
