import { z } from 'zod';
import ISlackRequest from './entities/dto/ISlackRequest';

const slackEventSchema = z.object({
  text: z.string(),
  user: z.string().optional(),
  ts: z.string(),
  thread_ts: z.string().optional(),
});

export function slackRequestFactory(event: unknown): ISlackRequest {
  const parsedEvent = slackEventSchema.parse(event);

  return {
    slackThreadId: parsedEvent.thread_ts ?? parsedEvent.ts,
    slackEventId: parsedEvent.ts,
    userQuery: parsedEvent.text.replace(/<@.*>/, '').trim(),
    fromUser: parsedEvent.user,
  };
}
