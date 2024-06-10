import { SlackBotApp } from './SlackBotApp';
import { RespondApp } from './application/RespondApp';
import { CreateTicketPlugin } from './application/plugin/CreateTicketPlugin';
import container from './dic';
import { AppMentionController } from './interfaces/AppMentionController';
import { MessageController } from './interfaces/MessageController';

jest.mock('@slack/bolt');

describe('Dependency Injection Container', () => {
  it('should bind CreateTicketPlugin to itself', () => {
    const instance = container.get<CreateTicketPlugin>(CreateTicketPlugin);
    expect(instance).toBeInstanceOf(CreateTicketPlugin);
  });

  it('should bind AppMentionController to itself', () => {
    const instance = container.get<AppMentionController>(AppMentionController);
    expect(instance).toBeInstanceOf(AppMentionController);
  });

  it('should bind MessageController to itself', () => {
    const instance = container.get<MessageController>(MessageController);
    expect(instance).toBeInstanceOf(MessageController);
  });

  it('should bind RespondApp to itself', () => {
    const instance = container.get<RespondApp>(RespondApp);
    expect(instance).toBeInstanceOf(RespondApp);
  });

  it('should bind SlackBotApp to itself', () => {
    const instance = container.get<SlackBotApp>(SlackBotApp);
    expect(instance).toBeInstanceOf(SlackBotApp);
  });
});
