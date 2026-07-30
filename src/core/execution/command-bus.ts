/**
 * Command Bus
 * Routes commands from Workflow Runtime to Tool Handlers.
 */

export interface Command {
  commandId: string;
  commandType: string;
  payload: Record<string, any>;
  timestamp: string;
  traceId?: string;
}

export type CommandHandler = (command: Command) => Promise<any>;

export class CommandBus {
  private static instance: CommandBus;
  private handlers = new Map<string, CommandHandler>();

  private constructor() {}

  public static getInstance(): CommandBus {
    if (!CommandBus.instance) {
      CommandBus.instance = new CommandBus();
    }
    return CommandBus.instance;
  }

  public registerHandler(commandType: string, handler: CommandHandler): void {
    this.handlers.set(commandType, handler);
    console.log(`[CommandBus] Registered handler for: "${commandType}"`);
  }

  public async dispatch(command: Command): Promise<any> {
    console.log(`[CommandBus] Dispatching command: "${command.commandType}" (ID: ${command.commandId})`);
    const handler = this.handlers.get(command.commandType);
    if (!handler) {
      throw new Error(`[CommandBus] No handler registered for command type: "${command.commandType}"`);
    }
    return await handler(command);
  }
}
