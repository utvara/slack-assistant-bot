import { KnownEventFromType, SayFn } from '@slack/bolt';
import { Container } from 'inversify';
import { mock } from 'jest-mock-extended';
import { RespondApp } from '../application/RespondApp';
import ILogger from '../domain/ILogger';
import IThreadMapRepo from '../domain/interfaces/IThreadMapRepo';
import { MessageController } from './MessageController';

const container = new Container();
const threadMapRepo = mock<IThreadMapRepo>();
const respondApp = mock<RespondApp>();
const logger = mock<ILogger>();

beforeAll(() => {
  container.bind('IThreadMapRepo').toConstantValue(threadMapRepo);
  container.bind(RespondApp).toConstantValue(respondApp);
  container.bind('ILogger').toConstantValue(logger);
  container.bind(MessageController).toSelf();
});

describe('MessageController', () => {
  let messageController: MessageController;
  const say: SayFn = jest.fn();
  const slackThreadId = 'testSlackThreadId';
  const slackEventId = 'testSlackEventId';
  const userQuery = 'testUserQuery';
  const fromUser = 'testFromUser';
  const message = mock<KnownEventFromType<'message'>>({
    thread_ts: slackThreadId,
    ts: slackEventId,
    text: userQuery,
    user: fromUser,
  });

  beforeEach(() => {
    messageController = container.get(MessageController);
  });

  it('should handle message', async () => {
    const threadId = 'testThreadId';
    threadMapRepo.get.mockReturnValue(threadId);
    respondApp.processAndRespond.mockResolvedValue('testResponse');

    await messageController.handleEvent({ message, say });

    expect(threadMapRepo.get).toHaveBeenCalledWith(slackThreadId);
    expect(respondApp.processAndRespond).toHaveBeenCalledWith(
      threadId,
      userQuery,
      fromUser,
    );
    expect(say).toHaveBeenCalledWith({
      text: 'testResponse',
      thread_ts: slackEventId,
    });
  });

  it('should not handle message if thread does not exist', async () => {
    threadMapRepo.get.mockReturnValue(null);

    await messageController.handleEvent({ message, say });

    expect(threadMapRepo.get).toHaveBeenCalledWith(slackThreadId);
    expect(respondApp.processAndRespond).not.toHaveBeenCalled();
    expect(say).not.toHaveBeenCalled();
  });

  it('should log error', async () => {
    const error = new Error('testError');
    threadMapRepo.get.mockImplementation(() => {
      throw error;
    });

    await messageController.handleEvent({ message, say });

    expect(logger.error).toHaveBeenCalledWith('handleEvent', error);
    expect(say).not.toHaveBeenCalled();
  });
});
