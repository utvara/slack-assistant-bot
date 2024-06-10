import { AppMentionEvent, SayFn } from '@slack/bolt';
import { inject, injectable } from 'inversify';
import { RespondApp } from '../application/RespondApp';
import ILogger from '../domain/ILogger';
import ISlackRequest from '../domain/entities/dto/ISlackRequest';
import IAssistantThreadRepo from '../domain/interfaces/IAssistantThreadRepo';
import IThreadMapRepo from '../domain/interfaces/IThreadMapRepo';
import { slackRequestFactory } from '../domain/slackRequestFactory';

@injectable()
export class AppMentionController {
  constructor(
    @inject('IThreadMapRepo') private threadMapRepo: IThreadMapRepo,
    @inject('IAssistantThreadRepo')
    private assistantThreadRepo: IAssistantThreadRepo,
    @inject(RespondApp) private respondApp: RespondApp,
    @inject('ILogger') private logger: ILogger,
  ) {}

  async handleEvent({ event, say }: { event: AppMentionEvent; say: SayFn }) {
    try {
      const request = slackRequestFactory(event);

      const response = await this.processAppMention(request);

      if (response) {
        await say({ text: response, thread_ts: request.slackEventId });
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async processAppMention({
    slackThreadId,
    userQuery,
    fromUser,
  }: ISlackRequest) {
    if (this.doesThreadExist(slackThreadId)) {
      return undefined;
    }

    const threadId = await this.createNewThread(slackThreadId);

    return this.respondApp.processAndRespond(threadId, userQuery, fromUser);
  }

  private async createNewThread(slackThreadId: string) {
    const threadId = await this.assistantThreadRepo.create();

    this.threadMapRepo.set(slackThreadId, threadId);

    this.logger.debug(`New thread created: ${threadId}`);

    return threadId;
  }

  private doesThreadExist(slackThreadId: string) {
    return !!this.threadMapRepo.get(slackThreadId);
  }
}
