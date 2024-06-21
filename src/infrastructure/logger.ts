import pino, { TransportSingleOptions } from 'pino';
import ILogger from '../domain/ILogger';
import { buildConfig } from './config';

export function buildLogger(): ILogger {
  const config = buildConfig();

  const transport: TransportSingleOptions | undefined =
    config.nodeEnv === 'production'
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        };

  return pino({
    timestamp: true,
    transport,
    level: config.logLevel || 'info',
  });
}
