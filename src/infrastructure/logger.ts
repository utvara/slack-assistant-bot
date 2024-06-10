import pino from 'pino';
import ILogger from '../domain/ILogger';
import { buildConfig } from './config';

export function buildLogger(): ILogger {
  return pino({
    timestamp: true,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
    level: buildConfig().logLevel || 'info',
  });
}
