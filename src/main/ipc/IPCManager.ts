import { IpcMain, IpcMainInvokeEvent } from 'electron';
import { Logger } from '../shared/logging/Logger';

type Handler<T> = (event: IpcMainInvokeEvent, ...args: unknown[]) => Promise<T> | T;

/** Registro único dos canais IPC; impede duplicação acidental de handlers. */
export class IPCManager {
  private readonly channels = new Set<string>();
  constructor(private readonly ipcMain: IpcMain) {}

  handle<T>(channel: string, handler: Handler<T>): void {
    if (this.channels.has(channel)) throw new Error(`Canal IPC já registrado: ${channel}`);
    this.channels.add(channel);
    this.ipcMain.handle(channel, async (event, ...args) => {
      try { return await handler(event, ...args); }
      catch (error) {
        Logger.error('Erro em canal IPC.', { channel, error: String(error) });
        throw error;
      }
    });
  }

  dispose(): void { this.channels.forEach((channel) => this.ipcMain.removeHandler(channel)); this.channels.clear(); }
}
