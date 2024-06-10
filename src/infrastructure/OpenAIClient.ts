import { inject, injectable } from 'inversify';
import OpenAI from 'openai';
import { IConfig } from '../domain/IConfig';

@injectable()
export class OpenAIClient {
  client: OpenAI;

  constructor(@inject('IConfig') config: IConfig) {
    this.client = new OpenAI({ apiKey: config.openaiApiKey });
  }
}
