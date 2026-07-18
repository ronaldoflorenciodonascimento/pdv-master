import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('pdvMaster', {
  getAppStatus: () => ipcRenderer.invoke('app:status') as Promise<{ success: boolean; data?: { databaseReady: boolean } }>,
  auth: {
    login: (email: string, password: string) => ipcRenderer.invoke('auth:login', { email, password }),
    logout: () => ipcRenderer.invoke('auth:logout'),
    session: () => ipcRenderer.invoke('auth:session'),
    changePassword: (currentPassword: string, newPassword: string) => ipcRenderer.invoke('auth:change-password', { currentPassword, newPassword })
  }
});
