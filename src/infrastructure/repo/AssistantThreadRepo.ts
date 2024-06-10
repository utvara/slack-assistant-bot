import { inject, injectable } from 'inversify';
import OpenAI from 'openai';
import ILogger from '../../domain/ILogger';
import IThread from '../../domain/entities/IThread';
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

  async create(): Promise<string> {
    this.logger.debug('Creating a thread with the assistant...');
    const thread = await this.client.beta.threads.create({});
    this.logger.debug(`Thread created with ID: ${thread.id}`);

    return thread.id;
  }

  async retrieve(threadId: string): Promise<IThread> {
    const thread = await this.client.beta.threads.retrieve(threadId);
    this.logger.debug(`Thread created with ID: ${thread.id}`);

    return thread;
  }
}
