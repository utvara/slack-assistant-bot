import { App, LogLevel } from '@slack/bolt';
import { inject, injectable } from 'inversify';
import { IConfig } from '../domain/IConfig';

@injectable()
export class SlackClient {
  client: App;

  constructor(@inject('IConfig') config: IConfig) {
    this.client = new App({
      token: config.slackBotToken,
      appToken: config.slackAppToken,
      logLevel: LogLevel.WARN,
      signingSecret: config.slackSigningSecret,
      socketMode: true,
    });
  }
}
