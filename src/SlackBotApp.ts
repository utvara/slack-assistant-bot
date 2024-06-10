import { inject, injectable } from 'inversify';
import { CreateTicketPlugin } from './application/plugin/CreateTicketPlugin';
import { AssistantActionService } from './application/services/AssistantActionService';
import ILogger from './domain/ILogger';
import { SlackClient } from './infrastructure/SlackClient';
import { AppMentionController } from './interfaces/AppMentionController';
import { MessageController } from './interfaces/MessageController';

const APP_MENTION = 'app_mention';

@injectable()
export class SlackBotApp {
  constructor(
    @inject(SlackClient) private slackClient: SlackClient,
    @inject(AppMentionController)
    private appMentionController: AppMentionController,
    @inject(MessageController) private messageController: MessageController,
    @inject(AssistantActionService)
    private assistantActionService: AssistantActionService,
    @inject(CreateTicketPlugin) private createTicketPlugin: CreateTicketPlugin,
    @inject('ILogger') private logger: ILogger,
  ) {
    this.registerHandlers();
    this.init();
  }

  async start() {
    await this.slackClient.client.start();
    this.logger.info('Bolt app started!!');
  }

  private init() {
    this.slackClient.client.event(
      APP_MENTION,
      this.appMentionController.handleEvent.bind(this.appMentionController),
    );

    this.slackClient.client.message(
      this.messageController.handleEvent.bind(this.messageController),
    );
  }

  private registerHandlers() {
    this.assistantActionService.registerHandler(this.createTicketPlugin);
  }
}
