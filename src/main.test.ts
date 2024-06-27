import { mock } from 'jest-mock-extended';
import { SlackBotApp } from './SlackBotApp';
import container from './dic';
import { HealthCheckServer } from './interfaces/HealthCheckServer';

describe('main.ts', () => {
  const slackBotApp = mock<SlackBotApp>();
  const healthCheckServerMock = mock<HealthCheckServer>();

  beforeEach(() => {
    container.snapshot();

    container.rebind(SlackBotApp).toConstantValue(slackBotApp);
    container.rebind(HealthCheckServer).toConstantValue(healthCheckServerMock);
  });

  afterEach(() => {
    container.restore();
  });

  it('should start the SlackBotApp', async () => {
    await import('./main');

    expect(slackBotApp.start).toHaveBeenCalled();
    expect(healthCheckServerMock.start).toHaveBeenCalled();
  });
});
