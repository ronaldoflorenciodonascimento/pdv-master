import { IpcMain } from 'electron';
import { PersistenceController } from '../controllers/PersistenceController';
import { IPCManager } from './IPCManager';

export function registerIpcHandlers(ipcMain: IpcMain): IPCManager {
  const manager = new IPCManager(ipcMain);
  const persistence = new PersistenceController();
  manager.handle('app:status', () => persistence.status());
  return manager;
}
