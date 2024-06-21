import { KnownEventFromType, SayFn } from '@slack/bolt';
import { inject, injectable } from 'inversify';
import { RespondApp } from '../application/RespondApp';
import ILogger from '../domain/ILogger';
import ISlackRequest from '../domain/entities/dto/ISlackRequest';
import IThreadMapRepo from '../domain/interfaces/IThreadMapRepo';
import { captureError } from '../domain/logger';
import { slackRequestFactory } from '../domain/slackRequestFactory';

@injectable()
export class MessageController {
  constructor(
    @inject('IThreadMapRepo') private threadMapRepo: IThreadMapRepo,
    @inject(RespondApp) private respondApp: RespondApp,
    @inject('ILogger') private logger: ILogger,
  ) {}

  @captureError()
  async handleEvent({
    message,
    say,
  }: {
    message: KnownEventFromType<'message'>;
    say: SayFn;
  }) {
    const request = slackRequestFactory(message);

    const response = await this.processMessage(request);

    if (response) {
      await say({ text: response, thread_ts: request.slackEventId });
    }
  }

  private async processMessage({
    slackThreadId,
    userQuery,
    fromUser,
  }: ISlackRequest): Promise<string | undefined> {
    const threadId = this.threadMapRepo.get(slackThreadId);

    if (!threadId) {
      return undefined;
    }

    return this.respondApp.processAndRespond(threadId, userQuery, fromUser);
  }
}
