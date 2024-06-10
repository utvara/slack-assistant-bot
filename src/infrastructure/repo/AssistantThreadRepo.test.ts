import { Container } from 'inversify';
import { mock, mockDeep } from 'jest-mock-extended';
import ILogger from '../../domain/ILogger';
import IThread from '../../domain/entities/IThread';
import { OpenAIClient } from '../OpenAIClient';
import { AssistantThreadRepo } from './AssistantThreadRepo';

const container = new Container();
const clientMock = mockDeep<OpenAIClient>();
const loggerMock = mock<ILogger>();

beforeAll(() => {
  container.bind(OpenAIClient).toConstantValue(clientMock);
  container.bind('ILogger').toConstantValue(loggerMock);
  container.bind('IAssistantThreadRepo').to(AssistantThreadRepo);
});

describe('AssistantThreadRepo', () => {
  let assistantThreadRepo: AssistantThreadRepo;

  beforeEach(() => {
    assistantThreadRepo = container.get('IAssistantThreadRepo');
  });

  describe('create', () => {
    it('should create a thread', async () => {
      const thread = mock<IThread>({ id: 'testThreadId' });

      clientMock.client.beta.threads.create.mockResolvedValue(thread);

      const result = await assistantThreadRepo.create();

      expect(result).toBe(thread.id);
      expect(clientMock.client.beta.threads.create).toHaveBeenCalledWith({});
    });
  });

  describe('retrieve', () => {
    it('should retrieve a thread', async () => {
      const threadId = 'testThreadId';
      const thread = mock<IThread>({ id: 'testThreadId' });

      clientMock.client.beta.threads.retrieve.mockResolvedValue(thread);

      const result = await assistantThreadRepo.retrieve(threadId);

      expect(result).toBe(thread);
      expect(clientMock.client.beta.threads.retrieve).toHaveBeenCalledWith(
        threadId,
      );
    });
  });
});
