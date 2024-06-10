import { Container } from 'inversify';
import { mock, mockDeep } from 'jest-mock-extended';
import { SlackBotApp } from './SlackBotApp';
import { CreateTicketPlugin } from './application/plugin/CreateTicketPlugin';
import { AssistantActionService } from './application/services/AssistantActionService';
import ILogger from './domain/ILogger';
import { SlackClient } from './infrastructure/SlackClient';
import { AppMentionController } from './interfaces/AppMentionController';
import { MessageController } from './interfaces/MessageController';

const container = new Container();
const appMentionController = mock<AppMentionController>();
const messageController = mock<MessageController>();
const assistantActionService = mock<AssistantActionService>();
const createTicketPlugin = mock<CreateTicketPlugin>();
const slackClient = mockDeep<SlackClient>();
const logger = mock<ILogger>();

beforeAll(() => {
  container.bind(SlackClient).toConstantValue(slackClient);
  container.bind(AppMentionController).toConstantValue(appMentionController);
  container.bind(MessageController).toConstantValue(messageController);
  container
    .bind(AssistantActionService)
    .toConstantValue(assistantActionService);
  container.bind(CreateTicketPlugin).toConstantValue(createTicketPlugin);
  container.bind('ILogger').toConstantValue(logger);
  container.bind(SlackBotApp).toSelf();
});

describe('SlackBotApp', () => {
  let slackBotApp: SlackBotApp;

  beforeEach(() => {
    slackBotApp = container.get(SlackBotApp);
  });

  it('should initialize slack client with event and message handlers', () => {
    expect(slackClient.client.event).toHaveBeenCalledWith(
      'app_mention',
      expect.any(Function),
    );
    expect(slackClient.client.message).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  it('should register create ticket plugin handler', () => {
    expect(assistantActionService.registerHandler).toHaveBeenCalledWith(
      createTicketPlugin,
    );
  });

  it('should start slack client and log info', async () => {
    await slackBotApp.start();

    expect(slackClient.client.start).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith('Bolt app started!!');
  });
});
