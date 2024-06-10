import { inject, injectable } from 'inversify';
import OpenAI from 'openai';
import { TextContentBlock } from 'openai/resources/beta/threads/messages';
import ILogger from '../../domain/ILogger';
import IAssistantMessage from '../../domain/entities/IAssistantMessage';
import IAssistantMessageRepo from '../../domain/interfaces/IAssistantMessageRepo';
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

  async create(threadId: string, content: string): Promise<void> {
    this.logger.debug('Adding the user query as a message to the thread...');

    await this.client.beta.threads.messages.create(threadId, {
      role: 'user',
      content,
    });

    this.logger.debug('User query added to the thread.');
  }

  async get(threadId: string): Promise<IAssistantMessage> {
    this.logger.debug('Fetching messages added by the assistant...');
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

  private async getMessages(threadId: string) {
    this.logger.debug('Fetching messages added by the assistant...');
    const messages = await this.client.beta.threads.messages.list(threadId);

    return messages;
  }
}
