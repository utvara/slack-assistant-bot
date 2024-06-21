import { AppMentionEvent, SayFn } from '@slack/bolt';
import { inject, injectable } from 'inversify';
import { RespondApp } from '../application/RespondApp';
import ILogger from '../domain/ILogger';
import ISlackRequest from '../domain/entities/dto/ISlackRequest';
import IAssistantThreadRepo from '../domain/interfaces/IAssistantThreadRepo';
import IThreadMapRepo from '../domain/interfaces/IThreadMapRepo';
import { captureError, logOutput } from '../domain/logger';
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

  @captureError()
  async handleEvent({ event, say }: { event: AppMentionEvent; say: SayFn }) {
    const request = slackRequestFactory(event);

    const response = await this.processAppMention(request);

    if (response) {
      await say({ text: response, thread_ts: request.slackEventId });
    }
  }

  private async processAppMention({
    slackThreadId,
    userQuery,
    fromUser,
  }: ISlackRequest): Promise<string | undefined> {
    if (this.doesThreadExist(slackThreadId)) {
      return undefined;
    }

    const threadId = await this.createNewThread(slackThreadId);

    return this.respondApp.processAndRespond(threadId, userQuery, fromUser);
  }

  @logOutput('New thread created.')
  private async createNewThread(slackThreadId: string) {
    const threadId = await this.assistantThreadRepo.create();

    this.threadMapRepo.set(slackThreadId, threadId);

    return threadId;
  }

  private doesThreadExist(slackThreadId: string) {
    return !!this.threadMapRepo.get(slackThreadId);
  }
}
