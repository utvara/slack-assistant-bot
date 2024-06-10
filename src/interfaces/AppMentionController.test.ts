import { AppMentionEvent } from '@slack/bolt';
import { Container } from 'inversify';
import { mock } from 'jest-mock-extended';
import { RespondApp } from '../application/RespondApp';
import ILogger from '../domain/ILogger';
import IAssistantThreadRepo from '../domain/interfaces/IAssistantThreadRepo';
import IThreadMapRepo from '../domain/interfaces/IThreadMapRepo';
import { AppMentionController } from './AppMentionController';

const container = new Container();
const assistantThreadRepo = mock<IAssistantThreadRepo>();
const threadMapRepo = mock<IThreadMapRepo>();
const respondApp = mock<RespondApp>();
const logger = mock<ILogger>();

beforeAll(() => {
  container.bind('IAssistantThreadRepo').toConstantValue(assistantThreadRepo);
  container.bind('IThreadMapRepo').toConstantValue(threadMapRepo);
  container.bind(RespondApp).toConstantValue(respondApp);
  container.bind('ILogger').toConstantValue(logger);
  container.bind(AppMentionController).toSelf();
});

describe('AppMentionController', () => {
  let appMentionController: AppMentionController;

  beforeEach(() => {
    appMentionController = container.get(AppMentionController);
  });

  describe('handleEvent', () => {
    const slackThreadId = 'testSlackThreadId';
    const slackEventId = 'testSlackEventId';
    const userQuery = 'testUserQuery';
    const fromUser = 'testFromUser';
    const event = mock<AppMentionEvent>({
      thread_ts: slackThreadId,
      ts: slackEventId,
      text: userQuery,
      user: fromUser,
    });
    const say = jest.fn();
    const threadId = 'testThreadId';

    it('should create a new thread if it does not exist', async () => {
      threadMapRepo.get.mockReturnValue(null);
      assistantThreadRepo.create.mockResolvedValue(threadId);
      respondApp.processAndRespond.mockResolvedValue('testResponse');

      await appMentionController.handleEvent({ event, say });

      expect(threadMapRepo.get).toHaveBeenCalledWith(slackThreadId);
      expect(assistantThreadRepo.create).toHaveBeenCalled();
      expect(threadMapRepo.set).toHaveBeenCalledWith(slackThreadId, threadId);
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

    it('should not create a new thread if it already exists', async () => {
      threadMapRepo.get.mockReturnValue('existingThreadId');

      await appMentionController.handleEvent({ event, say });

      expect(threadMapRepo.get).toHaveBeenCalledWith(slackThreadId);
      expect(assistantThreadRepo.create).not.toHaveBeenCalled();
      expect(threadMapRepo.set).not.toHaveBeenCalled();
      expect(respondApp.processAndRespond).not.toHaveBeenCalled();
      expect(say).not.toHaveBeenCalled();
    });

    it('should log an error if an error occurs', async () => {
      threadMapRepo.get.mockReturnValue(null);
      const error = new Error('testError');
      assistantThreadRepo.create.mockRejectedValue(error);

      await appMentionController.handleEvent({ event, say });

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(say).not.toHaveBeenCalled();
    });
  });
});
