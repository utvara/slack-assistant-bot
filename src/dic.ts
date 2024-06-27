import { Container, interfaces } from 'inversify';
import { LocalStorage } from 'node-localstorage';
import { SlackBotApp } from './SlackBotApp';
import { RespondApp } from './application/RespondApp';
import { CreateTicketPlugin } from './application/plugin/CreateTicketPlugin';
import { AssistantActionService } from './application/services/AssistantActionService';
import { IConfig } from './domain/IConfig';
import ILogger from './domain/ILogger';
import IAssistantMessageRepo from './domain/interfaces/IAssistantMessageRepo';
import IAssistantRunRepo from './domain/interfaces/IAssistantRunRepo';
import IAssistantThreadRepo from './domain/interfaces/IAssistantThreadRepo';
import IThreadMapRepo from './domain/interfaces/IThreadMapRepo';
import { KeyValueStore } from './infrastructure/KeyValueStore';
import { OpenAIClient } from './infrastructure/OpenAIClient';
import { SlackClient } from './infrastructure/SlackClient';
import { buildConfig } from './infrastructure/config';
import { buildLogger } from './infrastructure/logger';
import { AssistantMessageRepo } from './infrastructure/repo/AssistantMessageRepo';
import { AssistantRunRepo } from './infrastructure/repo/AssistantRunRepo';
import { AssistantThreadRepo } from './infrastructure/repo/AssistantThreadRepo';
import { ThreadMapRepo } from './infrastructure/repo/ThreadMapRepo';
import { AppMentionController } from './interfaces/AppMentionController';
import { HealthCheckServer } from './interfaces/HealthCheckServer';
import { MessageController } from './interfaces/MessageController';

const container = new Container();
const config = buildConfig();

container.bind<IConfig>('IConfig').toConstantValue(config);
container.bind<ILogger>('ILogger').toConstantValue(buildLogger());
container
  .bind<interfaces.Newable<LocalStorage>>('Newable<LocalStorage>')
  .toConstructor<LocalStorage>(LocalStorage);

container.bind<OpenAIClient>(OpenAIClient).to(OpenAIClient).inSingletonScope();

container.bind<SlackClient>(SlackClient).to(SlackClient).inSingletonScope();

container
  .bind<AssistantActionService>(AssistantActionService)
  .to(AssistantActionService)
  .inSingletonScope();

container
  .bind<KeyValueStore>(KeyValueStore)
  .to(KeyValueStore)
  .inSingletonScope();

container.bind<IAssistantRunRepo>('IAssistantRunRepo').to(AssistantRunRepo);
container.bind<IThreadMapRepo>('IThreadMapRepo').to(ThreadMapRepo);
container
  .bind<IAssistantMessageRepo>('IAssistantMessageRepo')
  .to(AssistantMessageRepo);
container
  .bind<IAssistantThreadRepo>('IAssistantThreadRepo')
  .to(AssistantThreadRepo);

container.bind(CreateTicketPlugin).to(CreateTicketPlugin);

container.bind(AppMentionController).to(AppMentionController);
container.bind(MessageController).to(MessageController);

container.bind(RespondApp).to(RespondApp);

container.bind(HealthCheckServer).to(HealthCheckServer);

container.bind(SlackBotApp).to(SlackBotApp);

export default container;
