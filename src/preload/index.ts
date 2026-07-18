import { contextBridge, ipcRenderer } from 'electron';

const company = {
  get: () => ipcRenderer.invoke('company:get'),
  save: (data: Record<string, string | undefined>) => ipcRenderer.invoke('company:save', data)
};
const categories = { list:(q='')=>ipcRenderer.invoke('category:list',q), get:(id:number)=>ipcRenderer.invoke('category:get',id), create:(d:Record<string,unknown>)=>ipcRenderer.invoke('category:create',d), update:(id:number,d:Record<string,unknown>)=>ipcRenderer.invoke('category:update',id,d), setActive:(id:number,a:boolean)=>ipcRenderer.invoke('category:set-active',id,a) };
const products = { list:(q='',categoryId?:number,low=false)=>ipcRenderer.invoke('product:list',q,categoryId,low), get:(id:number)=>ipcRenderer.invoke('product:get',id), create:(d:Record<string,unknown>)=>ipcRenderer.invoke('product:create',d), update:(id:number,d:Record<string,unknown>)=>ipcRenderer.invoke('product:update',id,d), setActive:(id:number,a:boolean)=>ipcRenderer.invoke('product:set-active',id,a), findByBarcode:(b:string)=>ipcRenderer.invoke('product:find-by-barcode',b) };
contextBridge.exposeInMainWorld('pdv', { company, categories, products });
contextBridge.exposeInMainWorld('pdvMaster', {
  getAppStatus: () => ipcRenderer.invoke('app:status') as Promise<{ success: boolean; data?: { databaseReady: boolean } }>,
  auth: {
    login: (email: string, password: string) => ipcRenderer.invoke('auth:login', { email, password }),
    logout: () => ipcRenderer.invoke('auth:logout'),
    session: () => ipcRenderer.invoke('auth:session'),
    changePassword: (currentPassword: string, newPassword: string) => ipcRenderer.invoke('auth:change-password', { currentPassword, newPassword })
  },
  company, categories, products
});
