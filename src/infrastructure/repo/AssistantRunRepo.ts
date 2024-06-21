import { inject, injectable } from 'inversify';
import OpenAI from 'openai';
import { IConfig } from '../../domain/IConfig';
import ILogger from '../../domain/ILogger';
import IAssistantRun from '../../domain/entities/IAssistantRun';
import IRequiredActionFunctionToolCall from '../../domain/entities/IRequiredActionFunctionToolCall';
import IAssistantRunRepo from '../../domain/interfaces/IAssistantRunRepo';
import { logCall, logOutput } from '../../domain/logger';
import { OpenAIClient } from '../OpenAIClient';

@injectable()
export class AssistantRunRepo implements IAssistantRunRepo {
  private client: OpenAI;

  constructor(
    @inject(OpenAIClient) openAIClient: OpenAIClient,
    @inject('IConfig') private config: IConfig,
    @inject('ILogger') private logger: ILogger,
  ) {
    this.client = openAIClient.client;
  }

  getToolCall(run: IAssistantRun): IRequiredActionFunctionToolCall | undefined {
    return run.required_action?.submit_tool_outputs.tool_calls[0];
  }

  @logCall('Creating a run to process the thread with the assistant...')
  @logOutput('Run created.', 'id')
  async create(threadId: string): Promise<IAssistantRun> {
    const run = await this.client.beta.threads.runs.create(threadId, {
      assistant_id: this.config.openaiAssistantId,
      model: this.config.openaiModel,
    });

    return run;
  }

  @logCall('Checking the status of the run...')
  @logOutput('Run status checked.', 'status')
  async checkStatus(run: IAssistantRun): Promise<IAssistantRun> {
    const newRun = await this.client.beta.threads.runs.retrieve(
      run.thread_id,
      run.id,
    );

    return newRun;
  }

  @logCall('Submitting the tool call...')
  @logOutput('Tool call submitted.')
  async submitToolOutput(run: IAssistantRun, output: string): Promise<void> {
    const toolCall = this.getToolCall(run);

    if (!toolCall) {
      throw new Error('Tool call not found.');
    }

    await this.client.beta.threads.runs.submitToolOutputs(
      run.thread_id,
      run.id,
      {
        tool_outputs: [
          {
            tool_call_id: toolCall.id,
            output,
          },
        ],
      },
    );
  }
}
