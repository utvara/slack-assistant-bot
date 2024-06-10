import { Container } from 'inversify';
import { mock } from 'jest-mock-extended';
import ILogger from '../domain/ILogger';
import IAssistantMessage from '../domain/entities/IAssistantMessage';
import IAssistantRun from '../domain/entities/IAssistantRun';
import IAssistantMessageRepo from '../domain/interfaces/IAssistantMessageRepo';
import IAssistantRunRepo from '../domain/interfaces/IAssistantRunRepo';
import { sleep } from '../infrastructure/util';
import { RespondApp } from './RespondApp';
import { AssistantActionService } from './services/AssistantActionService';

jest.mock('../infrastructure/util');

const container = new Container();
const assistantMessageRepo = mock<IAssistantMessageRepo>();
const assistantRunRepo = mock<IAssistantRunRepo>();
const assistantActionService = mock<AssistantActionService>();
const logger = mock<ILogger>();
const sleepMock = jest.mocked(sleep);

beforeAll(() => {
  container.bind('IAssistantRunRepo').toConstantValue(assistantRunRepo);
  container.bind('IAssistantMessageRepo').toConstantValue(assistantMessageRepo);
  container
    .bind(AssistantActionService)
    .toConstantValue(assistantActionService);
  container.bind('ILogger').toConstantValue(logger);
  container.bind(RespondApp).toSelf();
});

describe('RespondApp', () => {
  let respondApp: RespondApp;

  beforeEach(() => {
    respondApp = container.get(RespondApp);
    sleepMock.mockResolvedValue();
  });

  describe('processAndRespond', () => {
    const threadId = 'testThreadId';
    const userQuery = 'testUserQuery';
    const fromUser = 'testUser';

    it('should process and respond to user query', async () => {
      const response = 'testResponse';
      assistantMessageRepo.create.mockResolvedValueOnce();
      assistantRunRepo.create.mockResolvedValueOnce(mock<IAssistantRun>());
      assistantRunRepo.checkStatus
        .mockResolvedValueOnce(
          mock<IAssistantRun>({
            status: 'in_progress',
          }),
        )
        .mockResolvedValueOnce(
          mock<IAssistantRun>({
            status: 'completed',
          }),
        );
      assistantMessageRepo.get.mockResolvedValueOnce(mock<IAssistantMessage>());
      assistantMessageRepo.getMessageText.mockReturnValueOnce(response);

      const result = await respondApp.processAndRespond(
        threadId,
        userQuery,
        fromUser,
      );

      expect(assistantRunRepo.checkStatus).toHaveBeenCalledTimes(2);
      expect(assistantMessageRepo.get).toHaveBeenCalled();
      expect(result).toEqual(response);
    });

    it('should process and respond to user query with requires action', async () => {
      const response = 'testActionResponse';
      assistantMessageRepo.create.mockResolvedValueOnce();
      assistantRunRepo.create.mockResolvedValueOnce(mock<IAssistantRun>());
      assistantRunRepo.checkStatus
        .mockResolvedValueOnce(
          mock<IAssistantRun>({
            status: 'in_progress',
          }),
        )
        .mockResolvedValueOnce(
          mock<IAssistantRun>({
            status: 'requires_action',
          }),
        )
        .mockResolvedValueOnce(
          mock<IAssistantRun>({
            status: 'completed',
          }),
        );
      assistantActionService.process.mockResolvedValueOnce('some result');
      assistantMessageRepo.get.mockResolvedValueOnce(mock<IAssistantMessage>());
      assistantMessageRepo.getMessageText.mockReturnValueOnce(response);

      const result = await respondApp.processAndRespond(
        threadId,
        userQuery,
        fromUser,
      );

      expect(assistantActionService.process).toHaveBeenCalled();
      expect(assistantRunRepo.submitToolOutput).toHaveBeenCalled();
      expect(result).toEqual(response);
    });

    it('should return error message if exception is thrown', async () => {
      const error = new Error('Test error');
      assistantMessageRepo.create.mockRejectedValue(error);

      const result = await respondApp.processAndRespond(
        threadId,
        userQuery,
        fromUser,
      );

      expect(result).toEqual('There was an error processing your request.');
      expect(logger.error).toHaveBeenCalledWith(
        'Error processing message: ',
        error,
      );
    });
  });
});
