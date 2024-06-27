import { Container } from 'inversify';
import { mock } from 'jest-mock-extended';
import request from 'supertest';
import { IConfig } from '../domain/IConfig';
import ILogger from '../domain/ILogger';
import { HealthCheckServer } from './HealthCheckServer';

const container = new Container();

const loggerMock = mock<ILogger>();
const configMock = mock<IConfig>();

beforeAll(() => {
  container.bind('ILogger').toConstantValue(loggerMock);
  container.bind('IConfig').toConstantValue(configMock);
  container.bind(HealthCheckServer).toSelf();
});

describe('Health Check Server', () => {
  let healthServer: HealthCheckServer;

  beforeAll(async () => {
    healthServer = container.get(HealthCheckServer);
    await healthServer.start();
  });

  afterAll(async () => {
    await healthServer.stop();
  });

  it('should return 200 OK when /status is accessed', async () => {
    const response = await request(healthServer.server).get('/status');
    expect(response.status).toBe(200);
    expect(response.text).toBe('OK');
  });

  it('should return 404 Not Found when any other route is accessed', async () => {
    const response = await request(healthServer.server).get('/other');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Not Found');
  });
});
