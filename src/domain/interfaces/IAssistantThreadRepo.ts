import IThread from '../entities/IThread';

export default interface IAssistantThreadRepo {
  create(): Promise<string>;
  retrieve(threadId: string): Promise<IThread>;
}
