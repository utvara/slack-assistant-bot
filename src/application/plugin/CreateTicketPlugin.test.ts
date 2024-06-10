import { Container } from 'inversify';
import { mock, mockDeep } from 'jest-mock-extended';
import { IConfig } from '../../domain/IConfig';
import ILogger from '../../domain/ILogger';
import { SlackClient } from '../../infrastructure/SlackClient';
import { CreateTicketPlugin } from './CreateTicketPlugin';

const container = new Container();
const slackAppMock = mockDeep<SlackClient>();
const loggerMock = mock<ILogger>();
const configMock = mock<IConfig>({
  functions: {
    createTicket: {
      channel: 'testChannel',
    },
  },
});

beforeAll(() => {
  container.bind(SlackClient).toConstantValue(slackAppMock);
  container.bind('ILogger').toConstantValue(loggerMock);
  container.bind('IConfig').toConstantValue(configMock);
  container.bind(CreateTicketPlugin).toSelf();
});

describe('CreateTicketPlugin', () => {
  let createTicket: CreateTicketPlugin;

  beforeEach(() => {
    createTicket = container.get(CreateTicketPlugin);
  });

  it('should create ticket and return success response', async () => {
    const args = {
      subject: 'testSubject',
      typeOfQuestion: 'testQuestion',
      description: 'testDescription',
    };
    const fromUser = 'testUser';
    slackAppMock.client.client.chat.postMessage.mockResolvedValue({ ok: true });

    const result = await createTicket.handleAction(args, fromUser);

    expect(result).toEqual({ response: 'Ticket created successfully' });
    expect(slackAppMock.client.client.chat.postMessage).toHaveBeenCalledWith({
      channel: configMock.functions.createTicket.channel,
      text: expect.any(String),
      mrkdwn: true,
    });
  });

  it('should return error if failed to create ticket', async () => {
    const args = {
      subject: 'testSubject',
      typeOfQuestion: 'testQuestion',
      description: 'testDescription',
    };
    slackAppMock.client.client.chat.postMessage.mockResolvedValue({
      ok: false,
    });

    const result = await createTicket.handleAction(args);

    expect(result).toEqual({ error: 'Failed to create ticket' });
    expect(slackAppMock.client.client.chat.postMessage).toHaveBeenCalledWith({
      channel: configMock.functions.createTicket.channel,
      text: expect.any(String),
      mrkdwn: true,
    });
  });

  it('should return error if exception is thrown', async () => {
    const args = {
      subject: 'testSubject',
      typeOfQuestion: 'testQuestion',
      description: 'testDescription',
    };
    const error = new Error('Test error');
    slackAppMock.client.client.chat.postMessage.mockRejectedValue(error);

    const result = await createTicket.handleAction(args);

    expect(result).toEqual({ error: error.message });
    expect(slackAppMock.client.client.chat.postMessage).toHaveBeenCalledWith({
      channel: configMock.functions.createTicket.channel,
      text: expect.any(String),
      mrkdwn: true,
    });
  });
});
