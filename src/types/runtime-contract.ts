export interface RuntimeError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'fatal';
  isRetryable: boolean;
  recoveryStage?: string;
  details?: Record<string, any>;
}

export interface RuntimeInput<T = any> {
  correlationId: string;
  timestamp: string;
  principalId: string;
  sessionContext?: {
    sessionId: string;
    stageId: string;
  };
  payload: T;
}

export interface RuntimeOutput<T = any> {
  correlationId: string;
  timestamp: string;
  status: 'success' | 'failed' | 'partial';
  payload: T | null;
  error?: RuntimeError;
}

export interface RuntimeEvent<T = any> {
  eventId: string;
  correlationId: string;
  name: string;
  source: string;
  timestamp: string;
  version: string;
  payload: T;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  activeTasks: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  dependencies: {
    id: string;
    status: 'up' | 'down';
  }[];
}

export interface RuntimeLifecycle {
  init(config: Record<string, any>): Promise<void>;
  start(): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  upgrade(newVersion: string, migrations?: any): Promise<void>;
  rollback(targetVersion: string): Promise<void>;
}

export interface RuntimeHealth {
  checkHealth(): Promise<HealthStatus>;
  getMetrics(): Promise<Record<string, number>>;
}

export interface CapabilityDescriptor {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies: {
    capabilityId: string;
    versionRange: string;
  }[];
  permissions: {
    network: {
      allowedDomains: string[];
    };
    fileSystem: {
      readablePaths: string[];
      writablePaths: string[];
    };
    environmentVariables: string[];
  };
}

export interface Capability {
  descriptor: CapabilityDescriptor;
  onLoad(context: Record<string, any>): Promise<void>;
  onUnload(): Promise<void>;
}
