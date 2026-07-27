/**
 * BELLA EOS API: Observability Live Stream (SSE)
 * Specification: v21.0 - Enterprise Observability
 * 
 * Implements a Server-Sent Events (SSE) Route Handler to stream system telemetry 
 * in real-time from the central EnterpriseEventBus to the Control Tower Dashboard.
 */

import { NextRequest } from 'next/server';
import { EnterpriseEventBus } from '@/infrastructure/event-bus';
import { EnterpriseEvent } from '@/types/events';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  let unsubscribeCallbacks: Array<() => void> = [];

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (event: EnterpriseEvent) => {
        try {
          const payload = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch (err) {
          // If controller is closed, unsubscribe immediately
          cleanup();
        }
      };

      // Listen to generic workflow/task events on the bus
      const unsubTaskCompleted = EnterpriseEventBus.getInstance().subscribe('TaskCompleted', sendEvent);
      const unsubTaskFailed = EnterpriseEventBus.getInstance().subscribe('TaskFailed', sendEvent);
      
      // Listen to general application event types
      const unsubGoalVerified = EnterpriseEventBus.getInstance().subscribe('GoalVerified', sendEvent);
      const unsubGoalGenerated = EnterpriseEventBus.getInstance().subscribe('GoalGenerated', sendEvent);

      unsubscribeCallbacks.push(unsubTaskCompleted, unsubTaskFailed, unsubGoalVerified, unsubGoalGenerated);

      // Keepalive tick every 15s to keep the SSE connection open
      const intervalId = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch {
          cleanup();
        }
      }, 15000);

      const cleanup = () => {
        clearInterval(intervalId);
        unsubscribeCallbacks.forEach(unsub => unsub());
        unsubscribeCallbacks = [];
        try {
          controller.close();
        } catch {}
      };

      // Attach cleanup on abort
      req.signal.addEventListener('abort', () => {
        cleanup();
      });
    },
    cancel() {
      unsubscribeCallbacks.forEach(unsub => unsub());
      unsubscribeCallbacks = [];
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
