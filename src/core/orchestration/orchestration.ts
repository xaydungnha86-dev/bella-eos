import { ReasoningCenter } from '../brain/reasoning';
import { BellaKernel } from '../kernel/kernel';

export class OrchestrationEngine {
  static IntentEngine = {
    parseIntent(rawText: string) {
      console.log(`[Intent Engine] Parsing CEO command: "${rawText}"`);
      BellaKernel.emitKernelEvent('IntentCreated', { rawText });
      return {
        intentId: `intent_${Date.now()}`,
        parsedCommand: rawText,
        confidence: 96
      };
    }
  };

  static GoalEngine = {
    decomposeGoal(objectiveText: string) {
      console.log(`[Goal Engine] Decomposing objective: "${objectiveText}"`);
      const decomposed = ReasoningCenter.decomposeGoal(objectiveText);
      BellaKernel.emitKernelEvent('GoalGenerated', decomposed);
      return decomposed;
    }
  };

  static CapabilityScheduler = {
    scheduleTaskByCapability(task: { id: number; name: string; agent: string }) {
      console.log(`[Capability Scheduler] Scheduling task: "${task.name}"`);
      
      // Determine required capability
      let capabilityId = 'mgmt.strategy';
      if (task.name.includes('Sáng tạo') || task.name.includes('SEO')) {
        capabilityId = 'mkt.copywriting';
      } else if (task.name.includes('Duyệt') || task.name.includes('Ký')) {
        capabilityId = 'mgmt.approval';
      } else if (task.name.includes('Đăng') || task.name.includes('Fanpage')) {
        capabilityId = 'eip.facebook';
      }

      // Select worker
      let workerId = 'hermes';
      if (capabilityId === 'mkt.copywriting') {
        workerId = 'gemini-3.6-flash';
      } else if (capabilityId === 'eip.facebook') {
        workerId = 'hermes';
      }

      console.log(`[Capability Scheduler] Scheduled task [${task.name}] requiring [${capabilityId}] ➔ routed to [${workerId}]`);
      
      return {
        taskName: task.name,
        requiredCapability: capabilityId,
        assignedWorker: workerId,
        latencyMs: 800,
        costTokens: 1200
      };
    }
  };
}
