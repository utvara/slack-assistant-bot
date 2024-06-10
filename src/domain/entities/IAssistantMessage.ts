import OpenAI from 'openai';

export default interface IAssistantMessage
  extends OpenAI.Beta.Threads.Messages.Message {}
