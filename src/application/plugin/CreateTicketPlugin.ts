import { inject, injectable } from 'inversify';
import { isError } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { IConfig } from '../../domain/IConfig';
import ILogger from '../../domain/ILogger';
import { IPlugin } from '../../domain/IPlugin';
import { SlackClient } from '../../infrastructure/SlackClient';

@injectable()
export class CreateTicketPlugin implements IPlugin {
  readonly name = 'createTicket';

  private createTicketArgSchema = z.object({
    subject: z.string(),
    typeOfQuestion: z.string(),
    description: z.string(),
  });

  constructor(
    @inject(SlackClient) private slackApp: SlackClient,
    @inject('ILogger') private logger: ILogger,
    @inject('IConfig') private config: IConfig,
  ) {}

  async handleAction(args: unknown, fromUser?: string) {
    this.logger.debug('Creating ticket...', args, fromUser);
    try {
      const { subject, typeOfQuestion, description } =
        this.createTicketArgSchema.parse(args);

      const ticketId = uuidv4();
      const message =
        `:ticket: *Ticket ID*: ${ticketId}\n` +
        `:bulb: *Subject*: _${subject}_\n` +
        `:bust_in_silhouette: *From*: <@${fromUser}>\n` +
        `:question: *Type*: ${typeOfQuestion}\n` +
        `:memo: *Description*: \`\`\`${description}\`\`\`\n` +
        `:rocket: *Status*: \`New\``;

      const response = await this.slackApp.client.client.chat.postMessage({
        channel: this.config.functions.createTicket.channel,
        text: message,
        mrkdwn: true,
      });

      if (response.ok) {
        return { response: 'Ticket created successfully' };
      }

      return { error: 'Failed to create ticket' };
    } catch (e) {
      this.logger.error(e);
      return { error: isError(e) ? e.message : 'Failed to create ticket' };
    }
  }
}
