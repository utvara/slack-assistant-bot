import { inject, injectable } from 'inversify';
import OpenAI from 'openai';
import { IConfig } from '../../domain/IConfig';
import ILogger from '../../domain/ILogger';
import IAssistantRun from '../../domain/entities/IAssistantRun';
import IRequiredActionFunctionToolCall from '../../domain/entities/IRequiredActionFunctionToolCall';
import IAssistantRunRepo from '../../domain/interfaces/IAssistantRunRepo';
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

  async create(threadId: string): Promise<IAssistantRun> {
    this.logger.debug(
      'Creating a run to process the thread with the assistant...',
    );

    const run = await this.client.beta.threads.runs.create(threadId, {
      assistant_id: this.config.openaiAssistantId,
      model: this.config.openaiModel,
    });

    this.logger.debug(`Run created with ID: ${run.id}`);

    return run;
  }

  async checkStatus(run: IAssistantRun): Promise<IAssistantRun> {
    this.logger.debug('Checking the status of the run...');
    const newRun = await this.client.beta.threads.runs.retrieve(
      run.thread_id,
      run.id,
    );
    this.logger.debug(`Current status of the run: ${newRun.status}`);

    return newRun;
  }

  async submitToolOutput(run: IAssistantRun, output: string): Promise<void> {
    this.logger.debug('Submitting tool outputs...');
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

    this.logger.debug('Tool outputs submitted.');
  }
}
