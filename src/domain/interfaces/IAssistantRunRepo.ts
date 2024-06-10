import IAssistantRun from '../entities/IAssistantRun';
import IRequiredActionFunctionToolCall from '../entities/IRequiredActionFunctionToolCall';

export default interface IAssistantRunRepo {
  create(threadId: string): Promise<IAssistantRun>;
  checkStatus(run: IAssistantRun): Promise<IAssistantRun>;
  submitToolOutput(run: IAssistantRun, output: string): Promise<void>;
  getToolCall(run: IAssistantRun): IRequiredActionFunctionToolCall | undefined;
}
