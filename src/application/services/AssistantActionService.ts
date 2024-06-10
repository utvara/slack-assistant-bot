import { inject, injectable } from 'inversify';
import ILogger from '../../domain/ILogger';
import { IPlugin } from '../../domain/IPlugin';
import IRequiredActionFunctionToolCall from '../../domain/entities/IRequiredActionFunctionToolCall';

@injectable()
export class AssistantActionService {
  private handlers: Record<string, IPlugin> = {};

  constructor(@inject('ILogger') private logger: ILogger) {}

  registerHandler(handler: IPlugin): void {
    this.handlers[handler.name] = handler;
  }

  async process(
    toolCall?: IRequiredActionFunctionToolCall,
    fromUser?: string,
  ): Promise<string | undefined> {
    if (!toolCall) {
      return undefined;
    }

    this.logger.debug('Run requires action. Executing specified function...');
    const functionName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);

    const functionOutput = await this.executeFunction(
      functionName,
      args,
      fromUser,
    );

    return JSON.stringify(functionOutput);
  }

  private getHandler(functionName: string): IPlugin | undefined {
    return this.handlers[functionName];
  }

  private async executeFunction(
    functionName: string,
    args: unknown,
    fromUser?: string,
  ): Promise<
    | {
        error: string;
      }
    | {
        response: string;
      }
  > {
    this.logger.debug('Running function...', functionName, args);
    const plugin = this.getHandler(functionName);

    if (!plugin) {
      return { error: 'Function not recognized' };
    }

    return plugin.handleAction(args, fromUser);
  }
}
