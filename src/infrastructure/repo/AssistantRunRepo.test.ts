import { Container } from 'inversify';
import { mock, mockDeep } from 'jest-mock-extended';
import { IConfig } from '../../domain/IConfig';
import ILogger from '../../domain/ILogger';
import IAssistantRun from '../../domain/entities/IAssistantRun';
import IRequiredActionFunctionToolCall from '../../domain/entities/IRequiredActionFunctionToolCall';
import { OpenAIClient } from '../OpenAIClient';
import { AssistantRunRepo } from './AssistantRunRepo';

const container = new Container();
const clientMock = mockDeep<OpenAIClient>();
const configMock = mock<IConfig>({
  openaiAssistantId: 'testId',
  openaiModel: 'testModel',
});
const loggerMock = mock<ILogger>();

beforeAll(() => {
  container.bind(OpenAIClient).toConstantValue(clientMock);
  container.bind('IConfig').toConstantValue(configMock);
  container.bind('ILogger').toConstantValue(loggerMock);
  container.bind('IAssistantRunRepo').to(AssistantRunRepo);
});

describe('AssistantRunRepo', () => {
  let assistantRunRepo: AssistantRunRepo;

  beforeEach(() => {
    assistantRunRepo = container.get('IAssistantRunRepo');
  });

  describe('create', () => {
    it('should create a run', async () => {
      const threadId = 'testThreadId';
      const run = mock<IAssistantRun>();

      clientMock.client.beta.threads.runs.create.mockResolvedValue(run);

      const result = await assistantRunRepo.create(threadId);

      expect(result).toBe(run);
      expect(clientMock.client.beta.threads.runs.create).toHaveBeenCalledWith(
        threadId,
        {
          assistant_id: configMock.openaiAssistantId,
          model: configMock.openaiModel,
        },
      );
    });
  });

  describe('checkStatus', () => {
    it('should check the status of a run', async () => {
      const run = mock<IAssistantRun>({
        thread_id: 'testThreadId',
        id: 'testRunId',
      });
      const newRun = mock<IAssistantRun>();

      clientMock.client.beta.threads.runs.retrieve.mockResolvedValue(newRun);

      const result = await assistantRunRepo.checkStatus(run);

      expect(result).toBe(newRun);
      expect(clientMock.client.beta.threads.runs.retrieve).toHaveBeenCalledWith(
        run.thread_id,
        run.id,
      );
    });
  });

  describe('submitToolOutput', () => {
    it('should submit tool outputs', async () => {
      const run = mock<IAssistantRun>({
        thread_id: 'testThreadId',
        id: 'testRunId',
      });
      const output = 'testOutput';
      const toolCall = mock<IRequiredActionFunctionToolCall>({
        id: 'testToolCallId',
      });

      clientMock.client.beta.threads.runs.submitToolOutputs.mockResolvedValue(
        run,
      );

      assistantRunRepo.getToolCall = jest.fn().mockReturnValue(toolCall);

      await assistantRunRepo.submitToolOutput(run, output);

      expect(assistantRunRepo.getToolCall).toHaveBeenCalledWith(run);
      expect(
        clientMock.client.beta.threads.runs.submitToolOutputs,
      ).toHaveBeenCalledWith(run.thread_id, run.id, {
        tool_outputs: [
          {
            tool_call_id: toolCall.id,
            output,
          },
        ],
      });
    });

    it('should throw an error if the tool call is not found', async () => {
      const run = mock<IAssistantRun>();

      assistantRunRepo.getToolCall = jest.fn().mockReturnValue(undefined);

      await expect(
        assistantRunRepo.submitToolOutput(run, 'testOutput'),
      ).rejects.toThrow('Tool call not found.');
    });
  });
});
