import { z } from 'zod';

export const configSchema = z.object({
  openaiApiKey: z.string(),
  openaiAssistantId: z.string(),
  openaiModel: z.string(),
  slackBotToken: z.string(),
  slackAppToken: z.string(),
  slackSigningSecret: z.string(),
  functions: z.object({
    createTicket: z.object({
      channel: z.string(),
    }),
  }),
  logLevel: z.string().optional(),
  nodeEnv: z.string().default('development'),
  healthCheckPort: z.string(),
});

export type IConfig = z.infer<typeof configSchema>;
