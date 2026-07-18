import { Logger } from '../logging/Logger';

export function registerGlobalExceptionHandlers(): void {
  process.on('uncaughtException', (error) => Logger.error('Exceção não tratada.', { error: error.message, stack: error.stack }));
  process.on('unhandledRejection', (reason) => Logger.error('Promise rejeitada sem tratamento.', { reason: String(reason) }));
}
