export interface IAgentInstance {
  agentId: string;
  status: 'SPAWNED' | 'RUNNING' | 'SUSPENDED' | 'TERMINATED';
  lastHeartbeat: string;
  cpuUsagePercent: number;
}

export class AgentRuntime {
  private static instance: AgentRuntime;
  private agents: Map<string, IAgentInstance> = new Map();

  private constructor() {
    this.spawnAgent('eos_cmo_agent');
  }

  public static getInstance(): AgentRuntime {
    if (!AgentRuntime.instance) {
      AgentRuntime.instance = new AgentRuntime();
    }
    return AgentRuntime.instance;
  }

  public spawnAgent(agentId: string): void {
    this.agents.set(agentId, {
      agentId,
      status: 'SPAWNED',
      lastHeartbeat: new Date().toISOString(),
      cpuUsagePercent: 5
    });
  }

  public getAgentStatus(agentId: string): IAgentInstance | undefined {
    return this.agents.get(agentId);
  }

  public sendHeartbeat(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.lastHeartbeat = new Date().toISOString();
      agent.status = 'RUNNING';
    }
  }
}
