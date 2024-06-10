import IAssistantMessage from '../entities/IAssistantMessage';

export default interface IAssistantMessageRepo {
  create(threadId: string, content: string): Promise<void>;
  get(threadId: string): Promise<IAssistantMessage>;
  getMessageText(message: IAssistantMessage): string | undefined;
}
