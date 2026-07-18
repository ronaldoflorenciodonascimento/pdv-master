import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('pdvMaster', {
  getAppStatus: () => ipcRenderer.invoke('app:status') as Promise<{ success: boolean; data?: { databaseReady: boolean } }>
});
