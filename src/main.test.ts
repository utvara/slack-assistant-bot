import { mock } from 'jest-mock-extended';
import { SlackBotApp } from './SlackBotApp';
import container from './dic';

describe('main.ts', () => {
  const slackBotApp = mock<SlackBotApp>();

  beforeEach(() => {
    container.snapshot();

    container.rebind(SlackBotApp).toConstantValue(slackBotApp);
  });

  afterEach(() => {
    container.restore();
  });

  it('should start the SlackBotApp', async () => {
    await import('./main');

    expect(slackBotApp.start).toHaveBeenCalled();
  });
});
