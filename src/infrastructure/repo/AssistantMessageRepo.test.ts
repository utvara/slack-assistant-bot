import { Container } from 'inversify';
import { mock, mockDeep } from 'jest-mock-extended';
import { OpenAI } from 'openai';
import ILogger from '../../domain/ILogger';
import IAssistantMessage from '../../domain/entities/IAssistantMessage';
import { OpenAIClient } from '../OpenAIClient';
import { AssistantMessageRepo } from './AssistantMessageRepo';

const container = new Container();
const mockClient = mockDeep<OpenAIClient>();
const mockLogger = mock<ILogger>();

beforeAll(() => {
  container.bind(OpenAIClient).toConstantValue(mockClient);
  container.bind('ILogger').toConstantValue(mockLogger);
  container.bind('IAssistantMessageRepo').to(AssistantMessageRepo);
});

describe('AssistantMessageRepo', () => {
  let repo: AssistantMessageRepo;

  beforeEach(() => {
    repo = container.get('IAssistantMessageRepo');
  });

  describe('create', () => {
    it('create should call the client and logger methods with the correct arguments', async () => {
      const mockThreadId = '123';
      const mockContent = 'Test content';

      await repo.create(mockThreadId, mockContent);

      expect(
        mockClient.client.beta.threads.messages.create,
      ).toHaveBeenCalledWith(mockThreadId, {
        role: 'user',
        content: mockContent,
      });
    });
  });

  describe('get', () => {
    it('get should call the getMessages and logger methods with the correct arguments and return the correct message', async () => {
      const mockThreadId = '123';
      const mockMessages = mock<OpenAI.Beta.Threads.Messages.MessagesPage>({
        data: [{}, {}],
      });
      mockClient.client.beta.threads.messages.list.mockResolvedValue(
        mockMessages,
      );

      const message = await repo.get(mockThreadId);

      expect(mockClient.client.beta.threads.messages.list).toHaveBeenCalledWith(
        mockThreadId,
      );
      expect(message).toEqual(mockMessages.data[0]);
    });
  });

  describe('getMessageText', () => {
    it('should return the text value of the assistant message', () => {
      const mockMessage = mock<IAssistantMessage>({
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: {
              value: 'Hello, how can I assist you?',
            },
          },
        ],
      });

      const result = repo.getMessageText(mockMessage);

      expect(result).toEqual('Hello, how can I assist you?');
    });

    it('should return undefined if the message role is not assistant', () => {
      const mockMessage = mock<IAssistantMessage>({
        role: 'user',
        content: [
          {
            type: 'text',
            text: {
              value: 'Hello, how can I assist you?',
            },
          },
        ],
      });

      const result = repo.getMessageText(mockMessage);

      expect(result).toBeUndefined();
    });

    it('should return undefined if the message does not contain any text content', () => {
      const mockMessage = mock<IAssistantMessage>({
        role: 'assistant',
        content: [
          {
            type: 'image_file',
          },
        ],
      });

      const result = repo.getMessageText(mockMessage);

      expect(result).toBeUndefined();
    });
  });
});
