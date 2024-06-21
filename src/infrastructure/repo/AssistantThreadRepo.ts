import { inject, injectable } from 'inversify';
import OpenAI from 'openai';
import ILogger from '../../domain/ILogger';
import IThread from '../../domain/entities/IThread';
import { logCall, logOutput } from '../../domain/logger';
import { OpenAIClient } from '../OpenAIClient';

@injectable()
export class AssistantThreadRepo {
  private client: OpenAI;

  constructor(
    @inject(OpenAIClient) openAIClient: OpenAIClient,
    @inject('ILogger') private logger: ILogger,
  ) {
    this.client = openAIClient.client;
  }

  @logCall('Creating a thread with the assistant...')
  @logOutput('Thread created.')
  async create(): Promise<string> {
    const thread = await this.client.beta.threads.create({});

    return thread.id;
  }

  @logOutput('Thread retrieved.', 'id')
  async retrieve(threadId: string): Promise<IThread> {
    const thread = await this.client.beta.threads.retrieve(threadId);

    return thread;
  }
}
