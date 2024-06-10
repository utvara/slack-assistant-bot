import { buildConfig } from './config';

describe('config', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old env
  });

  it('should correctly parse environment variables', async () => {
    process.env.OPENAI_API_KEY = 'test_openai_api_key';
    process.env.OPENAI_ASSISTANT_ID = 'test_openai_assistant_id';
    process.env.OPENAI_MODEL = 'test_openai_model';
    process.env.SLACK_BOT_TOKEN = 'test_slack_bot_token';
    process.env.SLACK_APP_TOKEN = 'test_slack_app_token';
    process.env.SLACK_SIGNING_SECRET = 'test_slack_signing_secret';
    process.env.CREATE_TICKET_SUPPORT_CHANNEL_ID = 'test_channel_id';
    process.env.LOG_LEVEL = 'test_log_level';

    const config = buildConfig();

    expect(config).toEqual({
      openaiApiKey: 'test_openai_api_key',
      openaiAssistantId: 'test_openai_assistant_id',
      openaiModel: 'test_openai_model',
      slackBotToken: 'test_slack_bot_token',
      slackAppToken: 'test_slack_app_token',
      slackSigningSecret: 'test_slack_signing_secret',
      functions: {
        createTicket: {
          channel: 'test_channel_id',
        },
      },
      logLevel: 'test_log_level',
    });
  });
});
