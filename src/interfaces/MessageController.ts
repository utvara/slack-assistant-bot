import { KnownEventFromType, SayFn } from '@slack/bolt';
import { inject, injectable } from 'inversify';
import { RespondApp } from '../application/RespondApp';
import ILogger from '../domain/ILogger';
import ISlackRequest from '../domain/entities/dto/ISlackRequest';
import IThreadMapRepo from '../domain/interfaces/IThreadMapRepo';
import { slackRequestFactory } from '../domain/slackRequestFactory';

@injectable()
export class MessageController {
  constructor(
    @inject('IThreadMapRepo') private threadMapRepo: IThreadMapRepo,
    @inject(RespondApp) private respondApp: RespondApp,
    @inject('ILogger') private logger: ILogger,
  ) {}

  async handleEvent({
    message,
    say,
  }: {
    message: KnownEventFromType<'message'>;
    say: SayFn;
  }) {
    try {
      const request = slackRequestFactory(message);

      const response = await this.processMessage(request);

      if (response) {
        await say({ text: response, thread_ts: request.slackEventId });
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  private processMessage({
    slackThreadId,
    userQuery,
    fromUser,
  }: ISlackRequest) {
    const threadId = this.threadMapRepo.get(slackThreadId);

    if (!threadId) {
      return;
    }

    this.logger.debug(`Got a thread with a mention: ${threadId}`);

    return this.respondApp.processAndRespond(threadId, userQuery, fromUser);
  }
}
