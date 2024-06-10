import { inject, injectable } from 'inversify';
import OpenAI from 'openai';
import ILogger from '../domain/ILogger';
import IAssistantMessageRepo from '../domain/interfaces/IAssistantMessageRepo';
import IAssistantRunRepo from '../domain/interfaces/IAssistantRunRepo';
import { sleep } from '../infrastructure/util';
import { AssistantActionService } from './services/AssistantActionService';

const REQUIRES_ACTION = 'requires_action';
const MODEL_COMPLETED = ['completed', 'failed', 'cancelled'];

@injectable()
export class RespondApp {
  constructor(
    @inject('IAssistantRunRepo')
    private assistantRunRepo: IAssistantRunRepo,
    @inject('IAssistantMessageRepo')
    private assistantMessageRepo: IAssistantMessageRepo,
    @inject(AssistantActionService)
    private assistantActionService: AssistantActionService,
    @inject('ILogger') private logger: ILogger,
  ) {}

  async processAndRespond(
    threadId: string,
    userQuery: string,
    fromUser?: string,
  ): Promise<string | undefined> {
    try {
      return await this.processThreadWithAssistant({
        threadId,
        userQuery,
        fromUser,
      });
    } catch (error) {
      this.logger.error('Error processing message: ', error);
      return 'There was an error processing your request.';
    }
  }

  private async processThreadWithAssistant({
    threadId,
    userQuery,
    fromUser,
  }: {
    threadId: string;
    userQuery: string;
    fromUser?: string;
  }): Promise<string | undefined> {
    await this.assistantMessageRepo.create(threadId, userQuery);

    const run = await this.assistantRunRepo.create(threadId);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const runStatus = await this.assistantRunRepo.checkStatus(run);

      if (runStatus.status === REQUIRES_ACTION) {
        await this.handlerAction(runStatus, fromUser);
      } else if (MODEL_COMPLETED.includes(runStatus.status)) {
        return await this.handleMessage(threadId);
      }

      await sleep(1000);
    }
  }

  private async handleMessage(threadId: string) {
    const message = await this.assistantMessageRepo.get(threadId);

    return this.assistantMessageRepo.getMessageText(message);
  }

  private async handlerAction(
    runStatus: OpenAI.Beta.Threads.Run,
    fromUser: string | undefined,
  ) {
    const result = await this.assistantActionService.process(
      this.assistantRunRepo.getToolCall(runStatus),
      fromUser,
    );

    if (result) {
      await this.assistantRunRepo.submitToolOutput(runStatus, result);
    }
  }
}
