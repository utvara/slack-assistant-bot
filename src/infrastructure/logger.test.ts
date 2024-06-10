import { mock } from 'jest-mock-extended';
import pino from 'pino';
import { IConfig } from '../domain/IConfig';
import { buildConfig } from './config';
import { buildLogger } from './logger';

jest.mock('pino');
jest.mock('./config');

describe('buildLogger', () => {
  const buildConfigMock = jest.mocked(buildConfig);
  it('should be configured correctly', () => {
    buildConfigMock.mockReturnValue(mock<IConfig>({ logLevel: 'error' }));

    buildLogger();

    expect(pino).toHaveBeenCalledWith({
      timestamp: true,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
      level: 'error',
    });
  });

  it('should default to info log level', () => {
    buildConfigMock.mockReturnValue(mock<IConfig>({ logLevel: undefined }));

    buildLogger();

    expect(pino).toHaveBeenCalledWith({
      timestamp: true,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
      level: 'info',
    });
  });
});
