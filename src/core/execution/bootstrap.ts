/**
 * BELLA EOS PLATFORM CORE: Composition Root (Bootstrap)
 * Part of Task Governance Bounded Context v5.4
 */

import { LocalStoragePersistenceAdapter } from './persistence-adapter';
import { EventBus } from './event-bus';
import { 
  OutboxStore, 
  WorkflowRepository, 
  SubmissionStore, 
  WorkAssignmentReadRepository 
} from './repositories';
import { EvidenceValidationService } from './evidence-validation-service';
import { 
  WorkflowOutcomeCoordinator, 
  MeasurementScheduler, 
  OutcomeEvaluationService, 
  BusinessOutcomeService, 
  PilotLedgerService 
} from './business-outcome-service';
import { TelemetryService, TelemetryAdapter } from './telemetry-service';
import { WorkAssignmentService } from './assignment-service';

export interface BoundedContextContainer {
  persistenceAdapter: LocalStoragePersistenceAdapter;
  eventBus: EventBus;
  outboxStore: OutboxStore;
  workflowRepository: WorkflowRepository;
  submissionStore: SubmissionStore;
  readRepository: WorkAssignmentReadRepository;
  evidenceValidationService: EvidenceValidationService;
  outcomeCoordinator: WorkflowOutcomeCoordinator;
  measurementScheduler: MeasurementScheduler;
  outcomeEvaluationService: OutcomeEvaluationService;
  businessOutcomeService: BusinessOutcomeService;
  pilotLedgerService: PilotLedgerService;
  telemetryService: TelemetryService;
  telemetryAdapter: TelemetryAdapter;
  assignmentService: WorkAssignmentService;
}

let globalContainer: BoundedContextContainer | null = null;

export function bootstrapEosExecutionServices(): BoundedContextContainer {
  if (globalContainer) {
    return globalContainer;
  }

  // 1. Core Abstractions
  const persistenceAdapter = new LocalStoragePersistenceAdapter();
  const eventBus = EventBus.getInstance();

  // 2. Command Repositories & Stores
  const outboxStore = new OutboxStore(persistenceAdapter);
  const workflowRepository = new WorkflowRepository(persistenceAdapter, outboxStore);
  const submissionStore = new SubmissionStore(persistenceAdapter);

  // 3. Query Projections Read Repository
  const readRepository = new WorkAssignmentReadRepository(persistenceAdapter);

  // 4. Domain & Support Services
  const evidenceValidationService = new EvidenceValidationService();
  const telemetryService = new TelemetryService(persistenceAdapter);
  const outcomeEvaluationService = new OutcomeEvaluationService();

  // 5. Telemetry Filter Adapter
  const telemetryAdapter = new TelemetryAdapter(eventBus, telemetryService);
  telemetryAdapter.initialize();

  // 6. Workflow Outcome Coordinator & Schedulers
  const outcomeCoordinator = new WorkflowOutcomeCoordinator(workflowRepository, eventBus);
  outcomeCoordinator.initialize();

  const measurementScheduler = new MeasurementScheduler(persistenceAdapter, eventBus);
  measurementScheduler.initialize();

  const businessOutcomeService = new BusinessOutcomeService(outcomeEvaluationService, eventBus);
  businessOutcomeService.initialize();

  const pilotLedgerService = new PilotLedgerService(persistenceAdapter, eventBus);
  pilotLedgerService.initialize();

  // 7. Application Coordinator Service
  const assignmentService = new WorkAssignmentService(
    workflowRepository,
    submissionStore,
    evidenceValidationService,
    eventBus
  );

  globalContainer = {
    persistenceAdapter,
    eventBus,
    outboxStore,
    workflowRepository,
    submissionStore,
    readRepository,
    evidenceValidationService,
    outcomeCoordinator,
    measurementScheduler,
    outcomeEvaluationService,
    businessOutcomeService,
    pilotLedgerService,
    telemetryService,
    telemetryAdapter,
    assignmentService
  };

  console.log('[CompositionRoot] Task Governance Bounded Context v5.4 successfully booted.');
  return globalContainer;
}
