import { inject, injectable } from 'inversify';
import OpenAI from 'openai';
import { TextContentBlock } from 'openai/resources/beta/threads/messages';
import ILogger from '../../domain/ILogger';
import IAssistantMessage from '../../domain/entities/IAssistantMessage';
import IAssistantMessageRepo from '../../domain/interfaces/IAssistantMessageRepo';
import { logCall, logOutput } from '../../domain/logger';
import { OpenAIClient } from '../OpenAIClient';

@injectable()
export class AssistantMessageRepo implements IAssistantMessageRepo {
  private client: OpenAI;

  constructor(
    @inject(OpenAIClient) openAIClient: OpenAIClient,
    @inject('ILogger') private logger: ILogger,
  ) {
    this.client = openAIClient.client;
  }

  @logCall('Adding the user query as a message to the thread...')
  @logOutput('User query added to the thread.')
  async create(threadId: string, content: string): Promise<void> {
    await this.client.beta.threads.messages.create(threadId, {
      role: 'user',
      content,
    });
  }

  @logCall('Fetching messages added by the assistant...')
  async get(threadId: string): Promise<IAssistantMessage> {
    const messages = await this.getMessages(threadId);

    return messages.data[0];
  }

  getMessageText(message: IAssistantMessage): string | undefined {
    if (message.role !== 'assistant') {
      return undefined;
    }

    const content = message.content.find(
      (c): c is TextContentBlock => c.type === 'text',
    );

    return content?.text.value;
  }

  @logCall('Fetching messages added by the assistant...')
  private async getMessages(threadId: string) {
    return this.client.beta.threads.messages.list(threadId);
  }
}
