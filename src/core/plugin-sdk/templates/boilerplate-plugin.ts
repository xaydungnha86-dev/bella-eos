/**
 * BELLA EOS PLUGIN TEMPLATE
 * Specification: v20.0 BELLA EOS ENTERPRISE COGNITIVE OPERATING SYSTEM (ECOS)
 * 
 * This is a boilerplate template for implementing an external ECOS Plugin.
 * Copy this file to create your own capability provider plugin.
 */

import { IExtensionPlugin } from '../plugin-interface';

export class BoilerplatePlugin implements IExtensionPlugin {
  public readonly metadata = {
    pluginId: 'plg-boilerplate-example',
    pluginName: 'Boilerplate Example Plugin',
    version: '1.0.0',
    author: 'Ecosystem Partner',
    description: 'Provides a boilerplate implementation reference for capability-driven plugins.',
    pluginType: 'SKILL' as const,
    minEcosVersion: 'v22.0',
    // Declared capabilities provided by this plugin for O(1) routing
    capabilities: [
      'generic-capability-1',
      'generic-capability-2'
    ],
    // Declared permissions required by this plugin for security validation
    permissions: [
      'READ_FABRIC',
      'USE_MEMORY'
    ]
  };

  /**
   * Called exactly once when the plugin is registered.
   * Perform one-time setup (e.g., establishing connections, seeding initial memory).
   * Returning false or throwing an error will set the plugin's state to 'ERROR'.
   */
  public async initialize(): Promise<boolean> {
    console.log(`[Plugin] Initializing ${this.metadata.pluginId}...`);
    // Implement your initialization logic here
    return true;
  }

  /**
   * Executes a specific capability request in a try/catch wrapped sandbox.
   * Timeout protection is automatically managed by ECOS Core.
   */
  public async execute(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    console.log(`[Plugin] Executing action inside ${this.metadata.pluginId}...`);
    
    // 1. Validate inputs if necessary
    const { action } = input;
    if (!action) {
      throw new Error('Missing required field "action" in payload.');
    }

    // 2. Perform business logic or external call
    // (Ensure any external requests handle their own network timeout constraints if needed)
    const resultPayload = {
      status: 'SUCCESS',
      processedAt: Date.now(),
      echo: input
    };

    return resultPayload;
  }

  /**
   * Called when the plugin is unregistered.
   * Perform graceful teardown (closing sockets, flushing logs).
   */
  public async shutdown(): Promise<boolean> {
    console.log(`[Plugin] Shutting down ${this.metadata.pluginId}...`);
    // Implement your cleanup logic here
    return true;
  }
}
