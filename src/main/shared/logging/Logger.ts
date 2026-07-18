import winston from 'winston';

type LogContext = Record<string, unknown>;
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
  transports: [new winston.transports.Console()],
});

export class Logger {
  static info(message: string, context: LogContext = {}): void { logger.info(message, context); }
  static error(message: string, context: LogContext = {}): void { logger.error(message, context); }
}
