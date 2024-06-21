import { IConfig, configSchema } from '../domain/IConfig';

export function buildConfig(): IConfig {
  return configSchema.parse({
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiAssistantId: process.env.OPENAI_ASSISTANT_ID,
    openaiModel: process.env.OPENAI_MODEL,
    slackBotToken: process.env.SLACK_BOT_TOKEN,
    slackAppToken: process.env.SLACK_APP_TOKEN,
    slackSigningSecret: process.env.SLACK_SIGNING_SECRET,
    functions: {
      createTicket: {
        channel: process.env.CREATE_TICKET_SUPPORT_CHANNEL_ID,
      },
    },
    logLevel: process.env.LOG_LEVEL,
    nodeEnv: process.env.NODE_ENV,
    healthCheckPort: process.env.HEALTH_CHECK_PORT,
  });
}
