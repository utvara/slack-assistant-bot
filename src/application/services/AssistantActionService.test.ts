import { Container } from 'inversify';
import { mock } from 'jest-mock-extended';
import ILogger from '../../domain/ILogger';
import { IPlugin } from '../../domain/IPlugin';
import IRequiredActionFunctionToolCall from '../../domain/entities/IRequiredActionFunctionToolCall';
import { AssistantActionService } from './AssistantActionService';

const container = new Container();
const logger = mock<ILogger>();
const pluginMock = mock<IPlugin>({
  name: 'testFunction',
});

beforeAll(() => {
  container.bind('ILogger').toConstantValue(logger);
  container.bind(AssistantActionService).toSelf();
});

describe('AssistantActionService', () => {
  let assistantActionService: AssistantActionService;

  beforeEach(() => {
    assistantActionService = container.get(AssistantActionService);
    assistantActionService.registerHandler(pluginMock);
  });

  describe('process', () => {
    it('should return undefined if toolCall is not provided', async () => {
      const result = await assistantActionService.process();

      expect(result).toBeUndefined();
    });

    it('should execute function and return response', async () => {
      const toolCall = mock<IRequiredActionFunctionToolCall>({
        function: {
          name: 'testFunction',
          arguments: '{}',
        },
      });
      const fromUser = 'testUser';
      const response = 'testResponse';

      pluginMock.handleAction.mockResolvedValue({ response });

      assistantActionService.registerHandler(pluginMock);

      const result = await assistantActionService.process(toolCall, fromUser);

      expect(result).toEqual(JSON.stringify({ response }));
      expect(pluginMock.handleAction).toHaveBeenCalledWith({}, fromUser);
    });

    it('should return error if function is not recognized', async () => {
      const toolCall = mock<IRequiredActionFunctionToolCall>({
        function: {
          name: 'unknownFunction',
          arguments: '{}',
        },
      });

      const result = await assistantActionService.process(toolCall);

      expect(result).toEqual(
        JSON.stringify({ error: 'Function not recognized' }),
      );
    });
  });
});
