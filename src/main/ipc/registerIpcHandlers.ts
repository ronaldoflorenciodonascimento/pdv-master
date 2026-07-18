import { IpcMain } from 'electron';
import { PersistenceController } from '../controllers/PersistenceController';
import { AuthController } from '../controllers/AuthController';
import { CompanyController } from '../controllers/CompanyController';
import { CategoryController, ProductController } from '../controllers/CatalogControllers';
import { IPCManager } from './IPCManager';

export function registerIpcHandlers(ipcMain: IpcMain): IPCManager {
  const manager = new IPCManager(ipcMain);
  const persistence = new PersistenceController();
  const auth = new AuthController();
  const company = new CompanyController();
  const categories = new CategoryController(); const products = new ProductController();
  manager.handle('app:status', () => persistence.status());
  manager.handle('auth:login', (_, input) => auth.login(input as { email: string; password: string }));
  manager.handle('auth:logout', () => auth.logout());
  manager.handle('auth:session', () => auth.session());
  manager.handle('auth:change-password', (_, input) => auth.changePassword(input as { currentPassword: string; newPassword: string }));
  manager.handle('company:get', () => company.get());
  manager.handle('company:save', (_, input) => company.save(input));
  manager.handle('category:list',(_,q)=>categories.list(String(q??''))); manager.handle('category:get',(_,id)=>categories.get(Number(id))); manager.handle('category:create',(_,d)=>categories.create(d)); manager.handle('category:update',(_,id,d)=>categories.update(Number(id),d)); manager.handle('category:set-active',(_,id,a)=>categories.setActive(Number(id),Boolean(a)));
  manager.handle('product:list',(_,q,c,l)=>products.list(String(q??''),c?Number(c):undefined,Boolean(l))); manager.handle('product:get',(_,id)=>products.get(Number(id))); manager.handle('product:create',(_,d)=>products.create(d)); manager.handle('product:update',(_,id,d)=>products.update(Number(id),d)); manager.handle('product:set-active',(_,id,a)=>products.setActive(Number(id),Boolean(a))); manager.handle('product:find-by-barcode',(_,b)=>products.barcode(String(b??'')));
  return manager;
}
