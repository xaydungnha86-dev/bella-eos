import { ReasoningCenter } from '../brain/reasoning';
import { BellaKernel } from '../kernel/kernel';

export type VerificationReport = {
  isCompleted: boolean;
  completionPercentage: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  disconnectedTasks: number;
  status: 'FULL_SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED_DISCONNECTED';
  failedSteps: {
    taskId: string;
    agentName: string;
    taskType: string;
    description: string;
    issueType: 'DISCONNECTED' | 'MISSING_API_KEY' | 'API_ERROR' | 'MISSING_INPUT';
    error: string;
    fixSuggestion: string;
  }[];
  verificationSummary: string;
};

export class GoalVerificationEngine {
  /**
   * Audits execution results of all AI agent tasks.
   * Identifies completed tasks vs missing connections / token issues / step failures.
   */
  static auditExecutionResults(objective: string, tasks: any[]): VerificationReport {
    let completedCount = 0;
    let failedCount = 0;
    let disconnectedCount = 0;
    const failedSteps: VerificationReport['failedSteps'] = [];

    for (const t of tasks || []) {
      const outputText = t.output || '';
      const errorText = t.error || '';
      const isStatusOk = t.success === true || t.status === 'COMPLETED' || t.isApproved === true;
      const isPendingOrRunning = t.status === 'PENDING_APPROVAL' || t.status === 'RUNNING' || t.status === 'PENDING' || t.status === 'AWAITING_APPROVAL';

      // Skip in-progress or queued tasks from failed steps audit
      if (isPendingOrRunning && !t.error && !outputText.includes('CONFIG_REQUIRED')) {
        continue;
      }

      // Check if task output/error indicates missing configuration, token, or network issue
      const isMissingConfig =
        outputText.includes('CONFIG_REQUIRED') ||
        outputText.includes('Cần cấu hình') ||
        outputText.includes('Chưa cấu hình') ||
        errorText.includes('Chưa cấu hình') ||
        t.meta?.status === 'CONFIG_REQUIRED';

      const isNetworkDisconnected =
        errorText.includes('Lỗi kết nối') ||
        errorText.includes('Network Error') ||
        errorText.includes('503') ||
        errorText.includes('502') ||
        t.status === 'FAILED';

      if (isMissingConfig) {
        disconnectedCount++;
        failedSteps.push({
          taskId: t.task_id,
          agentName: t.agent_name || t.agent_id,
          taskType: t.task_type,
          description: t.task_description,
          issueType: 'MISSING_API_KEY',
          error: errorText || outputText || 'Chưa cấu hình API Key / Token',
          fixSuggestion: 'Vào Cài đặt Tích hợp (/settings) để nhập API Key / Token cho dịch vụ này.'
        });
      } else if (isNetworkDisconnected) {
        disconnectedCount++;
        failedSteps.push({
          taskId: t.task_id,
          agentName: t.agent_name || t.agent_id,
          taskType: t.task_type,
          description: t.task_description,
          issueType: 'DISCONNECTED',
          error: errorText || 'Mất kết nối API',
          fixSuggestion: 'Kiểm tra đường truyền internet hoặc kết nối máy chủ API.'
        });
      } else if (!isStatusOk && t.status === 'FAILED') {
        failedCount++;
        failedSteps.push({
          taskId: t.task_id,
          agentName: t.agent_name || t.agent_id,
          taskType: t.task_type,
          description: t.task_description,
          issueType: 'API_ERROR',
          error: errorText || 'Nhiệm vụ thất bại',
          fixSuggestion: 'Kiểm tra thông số đầu vào và nhật ký thực thi của Agent.'
        });
      } else if (isStatusOk) {
        completedCount++;
      }
    }

    const total = tasks?.length || 1;
    const completionPct = Math.round((completedCount / total) * 100);
    const isFullyDone = completedCount === total && failedCount === 0 && disconnectedCount === 0;

    let overallStatus: VerificationReport['status'] = 'FULL_SUCCESS';
    if (failedCount > 0 || disconnectedCount > 0) {
      overallStatus = completedCount > 0 ? 'PARTIAL_SUCCESS' : 'FAILED_DISCONNECTED';
    }

    const summary = isFullyDone
      ? `🎉 Tất cả ${total} nhiệm vụ AI Agent đã hoàn thành 100%! Mục tiêu "${objective.substring(0, 40)}..." ĐẠT.`
      : `⚠️ Đã hoàn thành ${completedCount}/${total} nhiệm vụ (${completionPct}%). Phát hiện ${failedSteps.length} bước gặp sự cố/mất kết nối!`;

    BellaKernel.emitKernelEvent('GoalVerified', {
      objective,
      isFullyDone,
      completionPct,
      failedStepsCount: failedSteps.length
    });

    return {
      isCompleted: isFullyDone,
      completionPercentage: completionPct,
      totalTasks: total,
      completedTasks: completedCount,
      failedTasks: failedCount,
      disconnectedTasks: disconnectedCount,
      status: overallStatus,
      failedSteps,
      verificationSummary: summary
    };
  }
}

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

  static GoalVerification = GoalVerificationEngine;

  static CapabilityScheduler = {
    scheduleTaskByCapability(task: { id: number; name: string; agent: string }) {
      console.log(`[Capability Scheduler] Scheduling task: "${task.name}"`);
      
      let capabilityId = 'mgmt.strategy';
      if (task.name.includes('Sáng tạo') || task.name.includes('SEO')) {
        capabilityId = 'mkt.copywriting';
      } else if (task.name.includes('Duyệt') || task.name.includes('Ký')) {
        capabilityId = 'mgmt.approval';
      } else if (task.name.includes('Đăng') || task.name.includes('Fanpage')) {
        capabilityId = 'eip.facebook';
      }

      let workerId = 'hermes';
      if (capabilityId === 'mkt.copywriting') {
        workerId = 'gemini-3.6-flash';
      } else if (capabilityId === 'eip.facebook') {
        workerId = 'hermes';
      }

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
