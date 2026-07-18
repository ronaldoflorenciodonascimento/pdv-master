import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { join } from 'node:path';
import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { AppController } from './controllers/AppController';
import { registerIpcHandlers } from './ipc/registerIpcHandlers';
import { registerGlobalExceptionHandlers } from './shared/errors/registerGlobalExceptionHandlers';

let mainWindow: BrowserWindow | undefined;
const appController = new AppController();
registerGlobalExceptionHandlers();

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280, height: 800, minWidth: 1024, minHeight: 680, show: false, autoHideMenuBar: true,
    webPreferences: { preload: join(__dirname, '../preload/index.js'), contextIsolation: true, nodeIntegration: false, sandbox: false }
  });
  mainWindow.on('ready-to-show', () => mainWindow?.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  if (is.dev && process.env.ELECTRON_RENDERER_URL) mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  else mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.pdvmaster.app');
  app.on('browser-window-created', (_, window) => optimizer.watchWindowShortcuts(window));
  await appController.initialize(app.getPath('userData'), join(app.getAppPath(), 'database', 'migrations'));
  registerIpcHandlers(ipcMain);
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
