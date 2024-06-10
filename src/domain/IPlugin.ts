export interface IPlugin<T = string> {
  readonly name: string;

  handleAction: (
    args: unknown,
    fromUser?: string,
  ) => Promise<{ response: T } | { error: string }>;
}
