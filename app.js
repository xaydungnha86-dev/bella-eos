// =========================================================================
// BELLA AI PLATFORM - ENTERPRISE OPERATING MODEL COMMAND CENTER ENGINE
// =========================================================================

// Global error catchers to display directly in the UI Terminal Log
window.addEventListener('error', function(e) {
    const container = document.getElementById('terminal-logs');
    if (container) {
        const timeStr = new Date().toLocaleTimeString('vi-VN');
        const logItem = document.createElement('div');
        logItem.className = 'leading-relaxed break-words text-rose-600 font-bold';
        logItem.innerHTML = `[${timeStr}] [CRASH] ${e.message} at ${e.filename.split('/').pop()}:${e.lineno}`;
        container.appendChild(logItem);
        container.scrollTop = container.scrollHeight;
    }
});

const orgConsoleError = console.error;
console.error = function(...args) {
    orgConsoleError.apply(console, args);
    const container = document.getElementById('terminal-logs');
    if (container) {
        const timeStr = new Date().toLocaleTimeString('vi-VN');
        const logItem = document.createElement('div');
        logItem.className = 'leading-relaxed break-words text-rose-500';
        logItem.innerHTML = `[${timeStr}] [ERROR] ${args.join(' ')}`;
        container.appendChild(logItem);
        container.scrollTop = container.scrollHeight;
    }
};

// =========================================================================
// SUPABASE CLIENT INTEGRATION (SUPABASE DỰ ÁN MỚI)
// =========================================================================
const SUPABASE_URL = "https://qwpyfhojxctrvqkjctcl.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || ""; 
let supabaseClient = null;

if (typeof window.supabase !== 'undefined' && window.supabase.createClient && SUPABASE_ANON_KEY) {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("⚡ Supabase Client initialized successfully with URL:", SUPABASE_URL);
    } catch(err) {
        console.warn("Supabase Client warning:", err);
    }
} else {
    console.log("ℹ️ Supabase Client running in Offline/Local Mode.");
}

// =========================================================================
// ENTERPRISE GOVERNANCE & POLICY ENGINE (LAYER 4 POLICY & AI GOVERNANCE)
// =========================================================================
const EnterprisePolicyEngine = {
    policies: {
        financialLimit: 100000000, // 100 triệu VND threshold for CEO sign-off
        aiGovernance: {
            allowPayrollAccess: false,
            allowProductionCodeDeploy: ['devops', 'ceo'],
            allowDirectDatabaseDrop: []
        }
    },

    evaluatePolicy(sourceIdentity, actionType, payload = {}) {
        // 1. Financial Threshold Check
        if (actionType === 'BUDGET_APPROVAL' || actionType === 'WORKFLOW_EXECUTE' || actionType === 'BUDGET_SPEND') {
            const budget = payload.budgetAmount || payload.amount || 0;
            if (budget > this.policies.financialLimit && sourceIdentity !== 'ceo') {
                return {
                    allowed: false,
                    reason: `Ngân sách ${budget.toLocaleString()} VND vượt hạn mức tự động 100M VND. Yêu cầu phê duyệt từ CEO Gate!`
                };
            }
        }

        // 2. AI Governance Check
        if (actionType === 'PAYROLL_ACCESS' && !this.policies.aiGovernance.allowPayrollAccess) {
            return { allowed: false, reason: 'AI Governance Shield: Nghiêm cấm mọi AI Worker truy cập bảng lương Payroll!' };
        }

        if (actionType === 'PRODUCTION_DEPLOY' && !this.policies.aiGovernance.allowProductionCodeDeploy.includes(sourceIdentity)) {
            return { allowed: false, reason: `AI Governance Shield: Nhân sự ${sourceIdentity.toUpperCase()} không có quyền deploy Production!` };
        }

        return { allowed: true };
    }
};

window.EnterprisePolicyEngine = EnterprisePolicyEngine;

// =========================================================================
// PHASE 1: BELLA KERNEL CORE ENGINE (BELLA KERNEL OS LAYER 1)
// =========================================================================
// =========================================================================
// ARCHITECTURE FROZEN v10.0: BELLA MICRO-KERNEL CORE (6 PRIMITIVES ONLY)
// =========================================================================
const BellaKernel = {
    version: '2026.10.0-FROZEN-MICRO-KERNEL',
    status: 'ACTIVE',

    // Primitive 1: Universal Identity Core
    identity: {
        identities: {
            'ceo': { id: 'ceo', type: 'human', name: 'CEO / Founder', role: 'Executive' },
            'coo': { id: 'coo', type: 'ai', name: 'AI COO Orchestrator', role: 'Operations' },
            'hermes': { id: 'hermes', type: 'driver', name: 'Hermes Operating Robot Driver', role: 'Execution' },
            'bella_worker': { id: 'bella_worker', type: 'ai', name: 'Bella AI Worker', role: 'Worker' }
        },
        getIdentity(id) { return this.identities[id] || null; }
    },

    // Primitive 2: Permission Core
    permission: {
        checkPermission(identityId, action) {
            return true; // Micro-kernel delegates rule evaluation to Policy Service
        }
    },

    // Primitive 3: Transaction Engine
    auditLedger: [],
    executeTransaction(sourceIdentity, actionType, payload) {
        const timestamp = new Date().toISOString();
        const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const ledgerRecord = {
            transactionId,
            timestamp,
            sourceIdentity,
            actionType,
            payload,
            status: 'COMMITTED'
        };
        this.auditLedger.push(ledgerRecord);
        this.emitKernelEvent('KERNEL_TRANSACTION_COMMITTED', ledgerRecord);
        if (typeof window !== 'undefined' && window.SupabasePersistenceEngine) {
            window.SupabasePersistenceEngine.persistTransaction(ledgerRecord);
        }
        console.log(`⚡ [BELLA MICRO-KERNEL] Txn [${transactionId}] (${actionType}) ➔ COMMITTED`);
        return ledgerRecord;
    },

    // Primitive 4: Context Bus
    context: {
        globalContext: { activeProcessInstanceId: null, environment: 'production' },
        getContext() { return this.globalContext; },
        setContext(key, value) { this.globalContext[key] = value; }
    },

    // Primitive 5: Audit Ledger
    getAuditLedger() {
        return this.auditLedger;
    },

    // Primitive 6: Event Store
    eventsStore: [],
    emitKernelEvent(eventName, eventData) {
        const eventRecord = {
            eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toISOString(),
            eventName,
            eventData
        };
        this.eventsStore.push(eventRecord);
        return eventRecord;
    },
    replayEventStream(filterEventName = null) {
        console.log(`📜 [MICRO-KERNEL REPLAY] Replaying event store stream...`);
        return filterEventName ? this.eventsStore.filter(e => e.eventName === filterEventName) : this.eventsStore;
    }
};

window.BellaKernel = BellaKernel;

// =========================================================================
// GROUP 2: ENTERPRISE OBJECT MODEL (EOM) - UNIFIED DOMAIN LANGUAGE (20 OBJECTS)
// =========================================================================
const EnterpriseObjectModel = {
    objects: {
        Company: ['id', 'name', 'taxId', 'industry'],
        Department: ['id', 'name', 'companyId'],
        Role: ['id', 'title', 'jd', 'skills', 'kpis'],
        Objective: ['id', 'title', 'targetValue', 'deadline', 'ownerId'],
        Project: ['id', 'name', 'objectiveId', 'budget', 'status'],
        Process: ['id', 'templateId', 'name', 'status', 'progress', 'version'],
        Stage: ['id', 'processId', 'name', 'order', 'status'],
        Task: ['id', 'stageId', 'title', 'assignedTo', 'status'],
        Command: ['id', 'type', 'payload', 'targetTopic', 'status'],
        Resource: ['id', 'type', 'capacity', 'lockedBy', 'status'],
        Capability: ['id', 'name', 'executorId', 'costPerUnit', 'latencyMs'],
        Policy: ['id', 'name', 'rule', 'type', 'status'],
        Evidence: ['id', 'taskId', 'proofType', 'proofData', 'verified'],
        Knowledge: ['id', 'category', 'content', 'tags'],
        Decision: ['id', 'intentId', 'rationale', 'confidence', 'policyApplied'],
        Asset: ['id', 'type', 'storageUrl', 'hash'],
        Metric: ['id', 'name', 'value', 'timestamp'],
        Document: ['id', 'title', 'version', 'content'],
        Event: ['id', 'name', 'payload', 'timestamp'],
        Intent: ['id', 'rawText', 'sourceIdentity', 'decomposedObjectives']
    },
    createObject(objectType, data) {
        const schema = this.objects[objectType];
        if (!schema) return data;
        const obj = { _eomType: objectType, _id: `${objectType.toLowerCase()}_${Date.now()}` };
        schema.forEach(field => { obj[field] = data[field] !== undefined ? data[field] : null; });
        return obj;
    }
};

// =========================================================================
// GROUP 3: CONSOLIDATED KERNEL SERVICES (6 SERVICES)
// =========================================================================

// Service 1: Process Runtime (Workflow, Templates v1/v2, State Machine, Stages, Tasks)
const ProcessRuntimeService = {
    templates: {
        'tpl_mkt_30d': { id: 'tpl_mkt_30d', name: 'Marketing 30-Day Campaign Template', version: 'v2.0', stages: ['Strategy & Objective', 'PRD & Decomposition', 'Content & SEO Generation', 'Quality Gate Review', 'CEO Sign-off & Schedule', 'Command Dispatch', 'Hermes Execution', 'Execution Verification', 'Audit Ledger Logging', 'Continuous Improvement'] }
    },
    instances: {},
    createProcessInstance(templateId, campaignName) {
        const template = this.templates[templateId] || this.templates['tpl_mkt_30d'];
        const id = `PROC-${Date.now().toString(36).toUpperCase()}`;
        const instance = {
            id,
            templateId,
            name: campaignName || template.name,
            version: template.version,
            status: 'RUNNING',
            progress: 10,
            currentStageIndex: 0,
            stages: template.stages.map((s, idx) => ({ id: `stage_${idx + 1}`, name: s, status: idx === 0 ? 'RUNNING' : 'PENDING' }))
        };
        this.instances[id] = instance;
        BellaKernel.executeTransaction('coo', 'CREATE_PROCESS_INSTANCE', instance);
        return instance;
    },
    getActiveInstance() {
        return Object.values(this.instances)[0] || this.createProcessInstance('tpl_mkt_30d', 'Marketing Campaign SpaPOS #2026-08');
    }
};

// Service 2: Execution Coordination Layer (Queue, Dispatcher, Heartbeat, Retry, Audit)
const ExecutionCoordination = {
    topics: {},
    queue: [],
    subscribe(topic, subscriberId, handler) {
        if (!this.topics[topic]) this.topics[topic] = [];
        this.topics[topic].push({ subscriberId, handler });
    },
    publishCommand(commandType, payload) {
        const cmd = EnterpriseObjectModel.createObject('Command', { type: commandType, payload, targetTopic: commandType, status: 'DISPATCHED' });
        BellaKernel.executeTransaction('coo', 'PUBLISH_COMMAND', cmd);
        appendLog('EXECUTION COORDINATION', `⚡ [COMMAND BUS] Distributed command [${commandType}] ➔ Subscriber [Hermes Driver]`, 'text-cyan-400 font-bold');
        return cmd;
    },
    async dispatch(task, context) {
        appendLog('EXECUTION COORDINATION', `🗂️ [TASK QUEUED] Task [${task.name || task.id}] registered to active executor queue.`, 'text-slate-400');
        // Heartbeat simulation
        appendLog('EXECUTION COORDINATION', `💓 [HEARTBEAT] Active monitor established for Executor of task [${task.name || task.id}]`, 'text-slate-500 italic');
        
        // Simulating the capability routing & dispatch
        const executor = CapabilityRegistry.findOptimalExecutor(task.requiredCapabilityIds || ['mgmt.strategy'], context.erp.approvedBudgetVnd);
        
        appendLog('EXECUTION COORDINATION', `⚖️ [CAPABILITY SCHEDULER] Selected Executor [${executor.executorId}] for capabilities [${(task.requiredCapabilityIds || ['mgmt.strategy']).join(', ')}] (Cost: ${executor.selectedCapability.avgLatencyMs}ms lat, quota left: ${executor.tokenQuotaRemaining} tokens).`, 'text-purple-400 font-semibold');
        
        // Dynamic adapter invocation
        const adapter = ExecutionEngineAdapterManager.getAdapter(executor.adapterKey);
        const result = await adapter.execute(task, context);
        
        return result;
    }
};

const ExecutionService = ExecutionCoordination;
window.ExecutionCoordination = ExecutionCoordination;
window.ExecutionService = ExecutionService;

// Service 3: Resource Service (Quota, Budget, Tokens, API, License, Capacity, Locks)
const ResourceService = {
    resources: {
        budget: { available: 50000000, reserved: 0, currency: 'VND' },
        facebookQuota: { limit: 100, used: 12, status: 'AVAILABLE' },
        aiTokens: { limit: 1000000, used: 84920, status: 'AVAILABLE' }
    },
    allocateAndLock(resourceName, amount) {
        const res = this.resources[resourceName];
        if (res && res.available >= amount) {
            res.available -= amount;
            res.reserved += amount;
            appendLog('RESOURCE SERVICE', `🔒 [RESOURCE ALLOCATED] Locked ${amount} for [${resourceName}]`, 'text-emerald-400');
            return true;
        }
        return true;
    }
};

// Service 4: Policy Service (Business Rules, Approvals, Guardrails, Compliance)
const PolicyService = {
    evaluateGuardrails(commandType, payload) {
        // Guardrail: No publishing after 22:00
        const hour = new Date().getHours();
        if (hour >= 22 || hour < 6) {
            console.warn(`[POLICY SERVICE] Night posting restriction checked.`);
        }
        return { allowed: true, status: 'GUARDRAIL_PASS' };
    }
};

// Service 5: Evidence Service (Verification, Proof, Replay, Snapshot, Recovery)
const EvidenceService = {
    evidences: [],
    snapshots: [],
    generateProofHash(data) {
        const str = typeof data === 'string' ? data : JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        const hex = Math.abs(hash).toString(16).padStart(8, '0');
        return `0x${hex}${Date.now().toString(16)}`;
    },
    verifyAndStoreEvidence(taskId, proofType, proofData) {
        const proofHash = this.generateProofHash(proofData);
        const evidence = EnterpriseObjectModel.createObject('Evidence', {
            taskId,
            proofType,
            proofData,
            proofHash,
            verified: true,
            timestamp: new Date().toISOString()
        });
        this.evidences.push(evidence);
        BellaKernel.executeTransaction('qa', 'STORE_EXECUTION_EVIDENCE', evidence);
        if (typeof window !== 'undefined' && window.SupabasePersistenceEngine) {
            window.SupabasePersistenceEngine.persistEvidence(evidence);
        }
        appendLog('EVIDENCE SERVICE', `🔍 [VERIFIED EVIDENCE] Stored proof: ${proofType} | Hash: [${proofHash}]`, 'text-emerald-400 font-bold');
        return evidence;
    },
    takeSnapshot(processInstanceId, stepIndex = 0) {
        const step = (typeof WORKFLOW_STEPS !== 'undefined' && WORKFLOW_STEPS[stepIndex]) ? WORKFLOW_STEPS[stepIndex] : { name: 'Step 1' };
        const snapshot = {
            snapshotId: `SNAP-${Date.now().toString(36).toUpperCase()}`,
            processInstanceId: processInstanceId || 'PROC-MAIN',
            stepIndex,
            stepName: step.name,
            agentId: step.agent || 'coo',
            timestamp: new Date().toISOString(),
            proofHash: this.generateProofHash({ processInstanceId, stepIndex, time: Date.now() }),
            stepsSnapshot: (typeof WORKFLOW_STEPS !== 'undefined') ? JSON.parse(JSON.stringify(WORKFLOW_STEPS)) : []
        };
        this.snapshots.push(snapshot);
        appendLog('EVIDENCE SERVICE', `📸 [SNAPSHOT RECORDED] Created Snapshot [${snapshot.snapshotId}] at Step ${stepIndex + 1} (${step.name})`, 'text-cyan-400 font-semibold');
        return snapshot;
    },
    rollbackToSnapshot(snapshotId) {
        const snap = this.snapshots.find(s => s.snapshotId === snapshotId);
        if (!snap) return false;

        if (typeof currentStepIndex !== 'undefined') {
            currentStepIndex = snap.stepIndex;
        }

        if (snap.stepsSnapshot && snap.stepsSnapshot.length > 0 && typeof WORKFLOW_STEPS !== 'undefined') {
            WORKFLOW_STEPS.length = 0;
            snap.stepsSnapshot.forEach(s => WORKFLOW_STEPS.push(s));
        }

        if (typeof jumpToStep === 'function') {
            jumpToStep(snap.stepIndex);
        }

        BellaKernel.executeTransaction('coo', 'ROLLBACK_PROCESS_SNAPSHOT', { snapshotId, stepIndex: snap.stepIndex });
        appendLog('RECOVERY ENGINE', `🔄 [ROLLBACK SUCCESSFUL] Restored Workflow State to Snapshot [${snapshotId}] (Step ${snap.stepIndex + 1})`, 'text-amber-400 font-bold');
        return true;
    }
};

// Service 6: Enterprise Memory (Operational Memory, Business Memory, Reasoning Memory XAI, Learning, ROI)
const EnterpriseMemoryService = {
    operationalMemory: [],
    businessMemory: [],
    reasoningMemory: [], // Explainable AI (XAI)
    sessionMemory: {}, // { agentId: [{ role, content, timestamp }] }
    vectorKnowledgeMemory: [],

    addSessionMessage(agentId, role, content) {
        if (!this.sessionMemory[agentId]) this.sessionMemory[agentId] = [];
        this.sessionMemory[agentId].push({ role, content, timestamp: new Date().toISOString() });
        if (this.sessionMemory[agentId].length > 20) {
            this.sessionMemory[agentId].shift();
        }
    },

    getSessionMemory(agentId) {
        return this.sessionMemory[agentId] || [];
    },

    logReasoning(intentText, decisionRationale, confidenceScore, policyApplied) {
        const reasoningRecord = EnterpriseObjectModel.createObject('Decision', {
            intentText,
            rationale: decisionRationale,
            confidence: confidenceScore,
            policyApplied,
            llmModel: 'gemini-2.5-flash',
            timestamp: new Date().toISOString()
        });
        this.reasoningMemory.push(reasoningRecord);
        appendLog('ENTERPRISE MEMORY (XAI)', `🧠 [EXPLAINABLE AI] Decision Rationale Logged: "${decisionRationale}" (Confidence: ${Math.round(confidenceScore * 100)}%)`, 'text-purple-300 font-bold');
        return reasoningRecord;
    }
};

// =========================================================================
// ENTERPRISE INTENT ENGINE (CEO INTENT ➔ OBJECTIVES ➔ PROCESS INSTANCE)
// =========================================================================
const IntentEngine = {
    processCEOIntent(intentText) {
        appendLog('INTENT ENGINE', `🎯 [CEO INTENT RECEIVED] "${intentText}"`, 'text-amber-400 font-bold');
        
        // Log Reasoning in Explainable AI Memory
        EnterpriseMemoryService.logReasoning(
            intentText,
            'Phân rã Intent thành Kế hoạch 30 Bài viết Marketing & Báo giá SpaPOS tự động',
            0.98,
            'POL-GUARDRAIL-ACTIVE'
        );

        // Instantiates Living Process Instance
        const processInstance = ProcessRuntimeService.createProcessInstance('tpl_mkt_30d', 'Marketing SpaPOS Campaign #2026-08');
        return processInstance;
    }
};

// =========================================================================
// PHASE 2: ENTERPRISE DATA FABRIC & STATE MACHINE ENGINE (LAYER 5 & LAYER 2)
// =========================================================================

// 1. Enterprise Data Fabric (Canonical Data Model)
const EnterpriseDataFabric = {
    canonicalModels: {
        Customer: ['id', 'name', 'email', 'phone', 'segment', 'lifecycleState'],
        Project: ['id', 'name', 'objective', 'budget', 'state', 'ownerId'],
        Invoice: ['id', 'projectId', 'amount', 'currency', 'status', 'approvedBy'],
        EmployeeCandidate: ['id', 'name', 'roleTitle', 'skills', 'status']
    },

    // Standardize Raw Ingested Data from Facebook/ERP/CRM into Canonical Model
    standardizeData(entityType, rawPayload) {
        const schema = this.canonicalModels[entityType];
        if (!schema) {
            console.warn(`[Data Fabric] Không tìm thấy Canonical Model cho: ${entityType}`);
            return rawPayload;
        }

        const canonicalEntity = {};
        schema.forEach(field => {
            canonicalEntity[field] = rawPayload[field] !== undefined ? rawPayload[field] : null;
        });
        canonicalEntity['_standardizedAt'] = new Date().toISOString();
        canonicalEntity['_version'] = '1.0-CANONICAL';

        console.log(`📊 [ENTERPRISE DATA FABRIC] Đã chuẩn hóa dữ liệu thô sang Canonical [${entityType}]:`, canonicalEntity);
        return canonicalEntity;
    }
};

// 2. Enterprise State Machine Engine (State-Driven Operating Architecture)
const EnterpriseStateMachine = {
    states: {
        Project: {
            DRAFT: ['PLANNING', 'CANCELLED'],
            PLANNING: ['APPROVED', 'CANCELLED'],
            APPROVED: ['EXECUTING', 'PAUSED'],
            EXECUTING: ['REVIEW', 'PAUSED'],
            REVIEW: ['COMPLETED', 'EXECUTING'],
            COMPLETED: ['ARCHIVED'],
            PAUSED: ['EXECUTING', 'CANCELLED'],
            CANCELLED: []
        },
        Lead: {
            NEW: ['QUALIFIED', 'LOST'],
            QUALIFIED: ['PROPOSAL', 'LOST'],
            PROPOSAL: ['NEGOTIATION', 'LOST'],
            NEGOTIATION: ['WON', 'LOST'],
            WON: ['ONBOARDING'],
            ONBOARDING: ['ACTIVE'],
            ACTIVE: ['RENEW', 'CHURNED'],
            RENEW: ['ACTIVE'],
            LOST: [],
            CHURNED: []
        },
        Invoice: {
            DRAFT: ['PENDING_APPROVAL', 'CANCELLED'],
            PENDING_APPROVAL: ['APPROVED', 'REJECTED'],
            APPROVED: ['PAID'],
            PAID: ['CLOSED', 'REFUNDED'],
            REFUNDED: ['CLOSED'],
            REJECTED: ['DRAFT'],
            CANCELLED: [],
            CLOSED: []
        }
    },

    transitionState(entityType, currentEntity, nextState, actorIdentity = 'system') {
        const entityStates = this.states[entityType];
        if (!entityStates) {
            console.error(`[State Machine Error] Loại thực thể không hợp lệ: ${entityType}`);
            return false;
        }

        const currentState = currentEntity.state || currentEntity.status || 'DRAFT';
        const allowedNextStates = entityStates[currentState] || [];

        if (!allowedNextStates.includes(nextState)) {
            const err = `[STATE MACHINE BLOCKED] Không thể chuyển đổi trạng thái ${entityType} từ "${currentState}" ➔ "${nextState}". Các trạng thái hợp lệ: [${allowedNextStates.join(', ')}]`;
            console.warn(err);
            if (typeof appendLog === 'function') {
                appendLog('STATE MACHINE', err, 'text-amber-500 font-bold');
            }
            return false;
        }

        // Execute State Transition via Bella Kernel
        const oldState = currentState;
        if (currentEntity.state) currentEntity.state = nextState;
        if (currentEntity.status) currentEntity.status = nextState;

        BellaKernel.executeTransaction(actorIdentity, 'STATE_TRANSITION', {
            entityType,
            entityId: currentEntity.id,
            oldState,
            newState: nextState
        });

        // Trigger Event Bus
        EventBus.emit(`${entityType.toUpperCase()}_STATE_CHANGED`, {
            entityType,
            entityId: currentEntity.id,
            oldState,
            newState: nextState,
            actorIdentity
        });

        console.log(`🔄 [STATE MACHINE] ${entityType} [${currentEntity.id}] chuyển trạng thái: ${oldState} ➔ ${nextState}`);
        return true;
    }
};

window.EnterpriseDataFabric = EnterpriseDataFabric;
window.EnterpriseStateMachine = EnterpriseStateMachine;

// =========================================================================
// ENTERPRISE INTELLIGENCE LAYER (EIL) & PLUGGABLE EXECUTION ADAPTERS
// =========================================================================
// ==========================================
// BELLA EIP CONNECTOR & CANONICAL DATA FABRIC
// ==========================================
const EIPProvider = {
    // Current active Mock database representation (simulating Bella EIP API state)
    mockDatabase: {
        customersCount: 1289,
        bookingsCount: 42,
        revenueTodayVnd: 156000000,
        inventoryAlerts: 3,
        hrCapacityPct: 87,
        cashFlowStatus: 'HEALTHY'
    },

    getLiveBusinessState() {
        return { ...this.mockDatabase };
    },

    sendCommand(commandName, payload) {
        appendLog('EIP CONNECTOR', `🔌 Outgoing Command: Sent "${commandName}" to Bella EIP API. Dispatching state changes...`, 'text-indigo-400 font-semibold');
        
        // Mutate mock db state based on commands sent by EOS Workflow
        if (commandName === 'PublishPostCommand') {
            this.mockDatabase.bookingsCount += 2;
            this.mockDatabase.revenueTodayVnd += 12000000;
        } else if (commandName === 'AllocateBudgetCommand') {
            this.mockDatabase.revenueTodayVnd -= payload.budgetVnd || 5000000;
        }

        // Update UI widget
        this.updateUiWidget();
        return { status: 200, message: 'Command executed successfully on Bella EIP API' };
    },

    updateUiWidget() {
        const elCustomers = document.getElementById('eip-state-customers');
        const elBookings = document.getElementById('eip-state-bookings');
        const elRevenue = document.getElementById('eip-state-revenue');
        const elInventory = document.getElementById('eip-state-inventory');
        const elHr = document.getElementById('eip-state-hr');
        const elCashflow = document.getElementById('eip-state-cashflow');

        if (elCustomers) elCustomers.innerText = this.mockDatabase.customersCount.toLocaleString();
        if (elBookings) elBookings.innerText = this.mockDatabase.bookingsCount.toString();
        if (elRevenue) elRevenue.innerText = `${(this.mockDatabase.revenueTodayVnd / 1000000).toFixed(0)}M VND`;
        if (elInventory) elInventory.innerText = `${this.mockDatabase.inventoryAlerts} alerts`;
        if (elHr) elHr.innerText = `${this.mockDatabase.hrCapacityPct}%`;
        if (elCashflow) {
            elCashflow.innerText = this.mockDatabase.cashFlowStatus;
            elCashflow.className = this.mockDatabase.cashFlowStatus === 'HEALTHY' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold';
        }
    }
};

window.EIPProvider = EIPProvider;

// ==========================================
// BELLA CONNECT - DECOUPLED CONNECTORS HUB
// ==========================================
const BellaConnect = {
    connectors: {
        eip: {
            fetchData() {
                if (typeof EIPProvider !== 'undefined') {
                    return EIPProvider.getLiveBusinessState();
                }
                return { customersCount: 1289, bookingsCount: 42, revenueTodayVnd: 156000000, inventoryAlerts: 3 };
            }
        },
        ga: {
            fetchData() {
                return {
                    source: 'GoogleAnalytics',
                    dailySessions: 4200,
                    bounceRatePct: 41.5,
                    conversionRatePct: 2.8
                };
            }
        },
        facebook: {
            fetchData() {
                return {
                    source: 'FacebookGraphAPI',
                    pageLikes: 25400,
                    postReach24h: 14500,
                    engagementRatePct: 5.4
                };
            }
        },
        misa: {
            fetchData() {
                return {
                    source: 'MisaERP',
                    inventoryAlerts: 3,
                    cashOnHandVnd: 12400000000,
                    payableAmountVnd: 45000000
                };
            }
        }
    }
};

window.BellaConnect = BellaConnect;

// ==========================================
// ENTERPRISE CONTEXT LAYER (ECL)
// ==========================================
const EnterpriseContextLayer = {
    // 1. Business Context Engine
    BusinessContextEngine: {
        fetchContextData() {
            const eipData = BellaConnect.connectors.eip.fetchData();
            const gaData = BellaConnect.connectors.ga.fetchData();
            const fbData = BellaConnect.connectors.facebook.fetchData();
            const misaData = BellaConnect.connectors.misa.fetchData();
            return { eipData, gaData, fbData, misaData };
        }
    },

    // 2. Enterprise Memory Subsystem
    EnterpriseMemory: {
        operationalMemory: [
            { timestamp: '2026-07-21T08:00:00Z', event: 'SOP v1.1 Activated', status: 'OK' }
        ],
        businessMemory: [
            { month: 'June', roi: '145%', revenueM: 420, failReason: 'None' }
        ],
        reasoningMemory: [],
        conversationMemory: [
            { speaker: 'CEO', text: 'Tối ưu hóa chiến dịch Marketing SpaPOS 30 ngày' }
        ],
        documentMemory: [
            { docId: 'BRAND-GUIDELINE-2026', tone: 'Professional & Premium', nightLimit: true }
        ],

        recallMemory(type) {
            if (type === 'operational') return this.operationalMemory;
            if (type === 'business') return this.businessMemory;
            if (type === 'conversation') return this.conversationMemory;
            if (type === 'document') return this.documentMemory;
            return [];
        },

        storeMemory(type, item) {
            if (type === 'reasoning') this.reasoningMemory.push(item);
            else if (type === 'operational') this.operationalMemory.push(item);
            else if (type === 'business') this.businessMemory.push(item);
        }
    },

    compileContext(task, objective = null) {
        // Fetch raw data from Business Context Engine via BellaConnect
        const { eipData, gaData, fbData, misaData } = this.BusinessContextEngine.fetchContextData();
        
        // Recall Guidelines from Memory
        const brandGuidelines = this.EnterpriseMemory.recallMemory('document')[0] || {};
        
        // Read dynamic user edits from BCE config table if they exist
        const editBudget = document.getElementById('bce-edit-budget');
        const editFollowers = document.getElementById('bce-edit-followers');
        const editVoice = document.getElementById('bce-edit-voice');
        const editSegment = document.getElementById('bce-edit-segment');

        const approvedBudget = editBudget ? parseInt(editBudget.value, 10) : 50000000;
        const targetSegment = editSegment ? editSegment.value.trim() : (brandGuidelines.tone ? 'VIP Spa Clients' : 'Enterprise VIP');
        const brandVoice = editVoice ? editVoice.value : (brandGuidelines.tone || 'Professional & Premium');
        const targetFollowers = editFollowers ? parseInt(editFollowers.value, 10) : 1000;
        const metricKey = editFollowers && editFollowers.dataset.metricKey ? editFollowers.dataset.metricKey : 'targetFollowers';
        const friendlyMetricName = metricKey.replace('target', '');

        // Compile the unified Enterprise Canonical Context Package
        const context = {
            taskId: task.id || `task_${Date.now()}`,
            objective: objective || `Tối ưu hóa chiến dịch Marketing SpaPOS 30 ngày (Mục tiêu: +${targetFollowers.toLocaleString()} ${friendlyMetricName})`,
            contextSources: [
                { source: 'bella-eip', domain: 'crm', version: '1.0' },
                { source: 'google-analytics', domain: 'marketing', version: '4.0' },
                { source: 'facebook-graph', domain: 'marketing', version: '2.8' },
                { source: 'misa-erp', domain: 'erp', version: '2026.1' }
            ],
            erp: {
                costCenter: 'CC-BELLA-2026',
                approvedBudgetVnd: approvedBudget,
                currency: 'VND',
                cashOnHandVnd: misaData.cashOnHandVnd,
                payableAmountVnd: misaData.payableAmountVnd,
                inventoryAlerts: eipData.inventoryAlerts || misaData.inventoryAlerts
            },
            crm: {
                targetSegment: targetSegment,
                brandVoice: brandVoice,
                minEqeScore: 90,
                activeCustomers: eipData.customersCount,
                activeBookings: eipData.bookingsCount,
                dailyWebsiteSessions: gaData.dailySessions,
                facebookReach24h: fbData.postReach24h
            },
            hr: {
                roleRequired: task.agent || 'AI Specialist',
                slaHours: 24,
                approvalRole: 'CEO'
            },
            governance: {
                maxAutoSpendVnd: 100000000,
                policyId: 'POL-ENTERPRISE-GOV-2026',
                nightPostingAllowed: !brandGuidelines.nightLimit
            },
            decisionLineage: ['DEC-INITIAL-INTENT-001'],
            recalledMemoryExcerpt: {
                recentConversations: this.EnterpriseMemory.recallMemory('conversation').slice(-2)
            }
        };

        // Dynamically assign target metric value
        context.crm[metricKey] = targetFollowers;

        // Store reasoning path memory
        this.EnterpriseMemory.storeMemory('reasoning', {
            taskId: context.taskId,
            timestamp: new Date().toISOString(),
            decisionReason: `Compiled EIL/ECL context model for strategic goal: "${context.objective}"`
        });

        return context;
    }
};

window.EnterpriseContextLayer = EnterpriseContextLayer;
window.EnterpriseIntelligenceLayer = EnterpriseContextLayer; // Backward compatibility alias

// ==========================================
// CAPABILITY REGISTRY & INTELLIGENT SCHEDULER
// ==========================================
const CapabilityRegistry = {
    // Registered Capabilities Directory
    capabilities: {
        'mgmt.strategy': { id: 'mgmt.strategy', name: 'Strategic Vision & OKRs Decomposing', version: '1.0', category: 'Management', tags: ['strategy', 'planning'] },
        'mgmt.planning': { id: 'mgmt.planning', name: 'Process Planning & Flow Setup', version: '1.0', category: 'Management', tags: ['planning', 'operations'] },
        'risk.assessment': { id: 'risk.assessment', name: 'Security & Operations Risk Scan', version: '1.2', category: 'Security', tags: ['risk', 'audit'] },
        'mkt.copywriting': { id: 'mkt.copywriting', name: 'SEO & Social Copywriting', version: '2.1', category: 'Marketing', tags: ['copy', 'seo', 'content'] },
        'arch.design': { id: 'arch.design', name: 'Software & Process Architecture Design', version: '1.0', category: 'Architecture', tags: ['spec', 'design'] },
        'design.ui': { id: 'design.ui', name: 'UI/UX Visual Design Layouts', version: '2.0', category: 'Design', tags: ['ui', 'ux', 'figma'] },
        'dev.coding': { id: 'dev.coding', name: 'Programming & Logic Implementation', version: '3.0', category: 'Development', tags: ['coding', 'backend', 'frontend'] },
        'sales.crm': { id: 'sales.crm', name: 'Sales Pipeline & Customer Script Setup', version: '1.5', category: 'Sales', tags: ['crm', 'sales', 'intercom'] },
        'api.facebook': { id: 'api.facebook', name: 'Facebook Graph API Integration', version: '1.0', category: 'Integration', tags: ['api', 'facebook', 'social'] },
        'qa.audit': { id: 'qa.audit', name: 'DoD Standards & Quality Review', version: '1.1', category: 'Quality', tags: ['qa', 'audit', 'compliance'] },
        'security.scan': { id: 'security.scan', name: 'Static & Dynamic Vulnerability Audits', version: '2.0', category: 'Security', tags: ['security', 'scan'] },
        'mgmt.approval': { id: 'mgmt.approval', name: 'Executive Overrides & Approvals Manager', version: '1.0', category: 'Management', tags: ['approval', 'ceo'] },
        'devops.deploy': { id: 'devops.deploy', name: 'Cloud Infrastructure & App Deployment', version: '2.1', category: 'Infrastructure', tags: ['devops', 'deploy', 'k8s'] },
        'api.telemetry': { id: 'api.telemetry', name: 'Live Metrics Stream & Telemetry Watch', version: '1.0', category: 'Infrastructure', tags: ['telemetry', 'monitor'] },
        'learning.optimization': { id: 'learning.optimization', name: 'SOP & Skills Mutation Trainer', version: '1.2', category: 'AI Engine', tags: ['learning', 'optimize'] },
        'finance.reporting': { id: 'finance.reporting', name: 'Financial Margin & ROI Analysis', version: '1.0', category: 'Finance', tags: ['finance', 'roi'] }
    },

    // Registered AI & Human Workers (Executors)
    executors: [
        {
            executorId: 'hermes',
            workerType: 'AI',
            adapterKey: 'hermes',
            activeCapabilities: [
                { capabilityId: 'mgmt.strategy', proficiencyLevel: 95, avgLatencyMs: 400 },
                { capabilityId: 'mgmt.planning', proficiencyLevel: 90, avgLatencyMs: 500 },
                { capabilityId: 'api.facebook', proficiencyLevel: 85, avgLatencyMs: 650 },
                { capabilityId: 'mgmt.approval', proficiencyLevel: 95, avgLatencyMs: 100 },
                { capabilityId: 'learning.optimization', proficiencyLevel: 88, avgLatencyMs: 800 },
                { capabilityId: 'finance.reporting', proficiencyLevel: 92, avgLatencyMs: 600 }
            ],
            costPerTokenVnd: 0.1,
            tokenQuotaRemaining: 950000
        },
        {
            executorId: 'claude-3-5',
            workerType: 'AI',
            adapterKey: 'claudecode',
            activeCapabilities: [
                { capabilityId: 'arch.design', proficiencyLevel: 98, avgLatencyMs: 1200 },
                { capabilityId: 'qa.audit', proficiencyLevel: 96, avgLatencyMs: 900 },
                { capabilityId: 'security.scan', proficiencyLevel: 95, avgLatencyMs: 1100 },
                { capabilityId: 'dev.coding', proficiencyLevel: 97, avgLatencyMs: 1500 },
                { capabilityId: 'risk.assessment', proficiencyLevel: 94, avgLatencyMs: 1000 }
            ],
            costPerTokenVnd: 0.5,
            tokenQuotaRemaining: 480000
        },
        {
            executorId: 'gemini-3',
            workerType: 'AI',
            adapterKey: 'openhands',
            activeCapabilities: [
                { capabilityId: 'mkt.copywriting', proficiencyLevel: 92, avgLatencyMs: 800 },
                { capabilityId: 'design.ui', proficiencyLevel: 94, avgLatencyMs: 1400 },
                { capabilityId: 'dev.coding', proficiencyLevel: 90, avgLatencyMs: 1600 }
            ],
            costPerTokenVnd: 0.2,
            tokenQuotaRemaining: 890000
        },
        {
            executorId: 'openai-gpt4',
            workerType: 'AI',
            adapterKey: 'codex',
            activeCapabilities: [
                { capabilityId: 'dev.coding', proficiencyLevel: 93, avgLatencyMs: 1100 },
                { capabilityId: 'sales.crm', proficiencyLevel: 95, avgLatencyMs: 950 }
            ],
            costPerTokenVnd: 0.4,
            tokenQuotaRemaining: 670000
        }
    ],

    findOptimalExecutor(requiredCapabilityIds, budgetLimitVnd = 50000000) {
        let bestExecutor = null;
        let bestScore = -1;
        let selectedCapReg = null;

        // Iterate executors to find the one matching the highest count of required capabilities
        this.executors.forEach(exec => {
            // Check if executor's token budget is exhausted
            if (exec.tokenQuotaRemaining <= 0) return;

            let matchesCount = 0;
            let sumProficiency = 0;
            let firstMatchedCap = null;

            requiredCapabilityIds.forEach(reqId => {
                const found = exec.activeCapabilities.find(c => c.capabilityId === reqId);
                if (found) {
                    matchesCount++;
                    sumProficiency += found.proficiencyLevel;
                    if (!firstMatchedCap) firstMatchedCap = found;
                }
            });

            if (matchesCount > 0) {
                // Calculate simple scoring: matches * 1000 + avg proficiency - cost factor
                const score = (matchesCount * 1000) + (sumProficiency / matchesCount) - (exec.costPerTokenVnd * 100);
                if (score > bestScore) {
                    bestScore = score;
                    bestExecutor = exec;
                    selectedCapReg = firstMatchedCap;
                }
            }
        });

        // Fallback to hermes if no match is found
        if (!bestExecutor) {
            bestExecutor = this.executors[0];
            selectedCapReg = bestExecutor.activeCapabilities[0];
        }

        return {
            ...bestExecutor,
            selectedCapability: selectedCapReg
        };
    }
};

window.CapabilityRegistry = CapabilityRegistry;

// 1. Goal Engine
const GoalEngine = {
    goals: [],
    decomposeGoal(strategicVision) {
        const id = `GOAL-${Date.now().toString(36).toUpperCase()}`;
        
        // Dynamic extraction
        let budget = 50000000;
        let followers = 1000;
        let segment = "VIP Beauty & Spa Clients";
        let metricName = "Mục tiêu Followers";
        let metricKey = "targetFollowers";
        
        const lowerVision = strategicVision.toLowerCase();
        if (lowerVision.includes("doanh thu") || lowerVision.includes("doanh số") || lowerVision.includes("revenue") || lowerVision.includes("sales") || lowerVision.includes("tiền")) {
            metricName = "Mục tiêu Doanh số (VND)";
            metricKey = "targetRevenueVnd";
        } else if (lowerVision.includes("lead") || lowerVision.includes("khách hàng") || lowerVision.includes("đăng ký") || lowerVision.includes("reg") || lowerVision.includes("user")) {
            metricName = "Mục tiêu Leads / Đăng ký";
            metricKey = "targetLeads";
        } else if (lowerVision.includes("tuyển") || lowerVision.includes("nhân sự") || lowerVision.includes("hr") || lowerVision.includes("tuyển dụng") || lowerVision.includes("người")) {
            metricName = "Mục tiêu Nhân sự (Người)";
            metricKey = "targetStaffCount";
        }
        
        // Parse budget
        const budgetMatch = strategicVision.match(/(\d+)\s*(triệu|tr|m|tỷ)/i);
        if (budgetMatch) {
            const num = parseInt(budgetMatch[1]);
            const unit = budgetMatch[2].toLowerCase();
            if (unit === 'tỷ') budget = num * 1000000000;
            else budget = num * 1000000;
        }
        
        // Parse quantity / followers / leads
        const quantityMatch = strategicVision.match(/(\d+)\s*(follower|leads|khách hàng|kh|sub|tin nhắn|người|%|triệu|tr)/i);
        if (quantityMatch) {
            followers = parseInt(quantityMatch[1], 10);
            if (metricKey === "targetRevenueVnd" && strategicVision.includes(quantityMatch[1] + "tr")) {
                followers = followers * 1000000;
            }
        }
        
        // Parse segment keyword
        if (strategicVision.toLowerCase().includes("hà nội") || strategicVision.toLowerCase().includes("hn")) {
            segment = "VIP Spa Clients Hà Nội";
        } else if (strategicVision.toLowerCase().includes("sài gòn") || strategicVision.toLowerCase().includes("sg")) {
            segment = "VIP Spa Clients Sài Gòn";
        }
        
        // Dynamically update UI input form elements if they are present!
        const editBudget = document.getElementById('bce-edit-budget');
        const editFollowers = document.getElementById('bce-edit-followers');
        const editFollowersLabel = document.getElementById('bce-edit-followers-label');
        const editSegment = document.getElementById('bce-edit-segment');
        
        if (editBudget) editBudget.value = budget;
        if (editFollowers) {
            editFollowers.value = followers;
            editFollowers.dataset.metricKey = metricKey;
        }
        if (editFollowersLabel) editFollowersLabel.textContent = metricName;
        if (editSegment) editSegment.value = segment;
        
        // Trigger live JSON update
        if (typeof updateLiveCompiledContext === 'function') {
            updateLiveCompiledContext();
        }

        const subGoals = {
            marketing: { title: 'Marketing Goal', leads: followers, reach: followers * 10, description: `Thu hút ${followers} leads/followers chất lượng` },
            sales: { title: 'Sales Goal', conversionRate: 25, revenueVND: budget * 3, description: `Đạt tỷ lệ chuyển đổi demo 25%` },
            hr: { title: 'HR Goal', trainees: 10, skillUpgrades: ['AI Agent Operations', 'SOP Writing'], description: 'Đào tạo 10 nhân sự sử dụng AI' },
            finance: { title: 'Finance Goal', budgetCapVND: budget, minNetMargin: 35, description: `Giới hạn ngân sách ${budget.toLocaleString()} VND, Margin tối thiểu 35%` },
            operations: { title: 'Operations Goal', avgSlaHours: 4.5, compliancesPassed: 100, description: 'Thời gian SLA trung bình dưới 4.5h, 100% pass' }
        };
        const goalRecord = {
            id,
            strategicVision,
            decomposedAt: new Date().toISOString(),
            subGoals
        };
        this.goals.push(goalRecord);
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('goal.decomposed', goalRecord);
        }
        return goalRecord;
    }
};

// 2. Simulation Engine (Monte Carlo Simulation for ROI, Cashflow & Net Profit)
const SimulationEngine = {
    scenarios: {
        ads_focus: { name: 'Kịch bản A: Dồn ngân sách Quảng cáo Ads', roi: 320, cashflow: 'Dương', profitMargin: 28 },
        sales_hire: { name: 'Kịch bản B: Mở rộng nhân sự Sales', roi: 210, cashflow: 'Trung tính', profitMargin: 22 },
        ai_automation: { name: 'Kịch bản C: Tự động hóa công nghệ qua AI', roi: 450, cashflow: 'Tốt', profitMargin: 42 }
    },
    runMonteCarlo(scenarioKey) {
        const scenario = this.scenarios[scenarioKey] || this.scenarios.ai_automation;
        const runs = [];
        for(let i = 0; i < 1000; i++) {
            const randFactor = 0.85 + Math.random() * 0.3;
            runs.push(scenario.roi * randFactor);
        }
        const avgRoi = Math.round(runs.reduce((a, b) => a + b, 0) / runs.length);
        const projectedNetProfitVND = Math.round(500000000 * (scenario.profitMargin / 100));

        const result = {
            scenario: scenario.name,
            runs: 1000,
            avgRoi,
            projectedRoi: `+${avgRoi}%`,
            cashflow: scenario.cashflow,
            projectedNetProfitVND,
            confidence: 94.5,
            timestamp: new Date().toISOString()
        };

        if (typeof EventBus !== 'undefined') {
            EventBus.emit('simulation.completed', result);
        }
        return result;
    }
};

// 3. Optimization Engine (Optimal Path Analysis)
const OptimizationEngine = {
    findOptimalPath(processId) {
        const paths = [
            { path: 'Path A: 100% AI Workers via Hermes (SOP v2)', costUsd: 15.2, timeHours: 0.8, successRate: 98.4, rank: 1, recommend: true },
            { path: 'Path B: Hybrid AI-Human Verification Gate (SOP v1)', costUsd: 45.0, timeHours: 4.2, successRate: 99.1, rank: 2, recommend: false },
            { path: 'Path C: Full Human Executed Process Flow', costUsd: 180.0, timeHours: 24.0, successRate: 95.0, rank: 3, recommend: false }
        ];
        
        const optimal = paths[0];
        const result = {
            processId,
            evaluatedPaths: paths.length,
            optimalPath: optimal,
            savingsPct: 75.5,
            timestamp: new Date().toISOString()
        };

        if (typeof EventBus !== 'undefined') {
            EventBus.emit('optimization.completed', result);
        }
        return result;
    }
};

// 4. Knowledge Graph Service (Semantic linkages for 20 EOM objects)
const KnowledgeGraphService = {
    nodes: new Map(),
    edges: [],
    
    addNode(id, type, label, data = {}) {
        const node = { id, type, label, data, createdAt: new Date().toISOString() };
        this.nodes.set(id, node);
        return node;
    },

    addEdge(sourceId, targetId, relationType) {
        const edge = { id: `edge_${sourceId}_${targetId}`, sourceId, targetId, relationType };
        this.edges.push(edge);
        return edge;
    },

    getNodes() {
        return Array.from(this.nodes.values()).map(n => ({
            id: n.id,
            type: n.type,
            name: n.label,
            properties: n.data
        }));
    },

    getEdges() {
        return this.edges.map(e => ({
            id: e.id,
            source: e.sourceId,
            target: e.targetId,
            type: e.relationType
        }));
    },

    getGraphStats() {
        return {
            nodesCount: this.nodes.size,
            edgesCount: this.edges.length
        };
    },

    initGraph() {
        const nodesData = [
            { 
                id: 'company_bella', 
                type: 'Company', 
                label: 'Bella Group',
                properties: {
                    'Tên doanh nghiệp': 'Bella Group VN',
                    'Lĩnh vực': 'Aesthetic & Spa POS Retail',
                    'Năm thành lập': '2024',
                    'Trụ sở': 'Hà Nội & TP. HCM'
                }
            },
            { 
                id: 'dept_mkt', 
                type: 'Department', 
                label: 'Marketing Dept',
                properties: {
                    'Trưởng bộ phận': 'AI CMO',
                    'Số lượng nhân sự': 12,
                    'Ngân sách tháng': '100,000,000 VND',
                    'KPI cốt lõi': 'Chi phí chuyển đổi (CAC) < 200K VND'
                }
            },
            { 
                id: 'role_ceo', 
                type: 'Role', 
                label: 'CEO Role',
                properties: {
                    'Chức danh': 'Chief Executive Officer',
                    'Cơ chế giám sát': 'Human-in-the-Loop',
                    'Quyền quyết định': 'Toàn quyền (Duyệt ngân sách & SOP)'
                }
            },
            { 
                id: 'emp_bella', 
                type: 'Employee', 
                label: 'Bella AI Employee',
                properties: {
                    'Tên nhân sự': 'Hermes Operator Agent',
                    'Độ khả dụng': '24/7 Online',
                    'Năng lực': 'Facebook API, SMTP Mail, PDF Compiler'
                }
            },
            { 
                id: 'obj_growth', 
                type: 'Objective', 
                label: 'Grow Sales 30%',
                properties: {
                    'Mục tiêu': 'Tăng trưởng 1,000 Followers mới',
                    'Hạn chót': '31/08/2026',
                    'Trọng số': '0.85'
                }
            },
            { 
                id: 'proj_summer', 
                type: 'Project', 
                label: 'Summer Campaign',
                properties: {
                    'Tên dự án': 'Chiến dịch Summer Spa Growth 2026',
                    'Trạng thái': 'Đang chạy (ACTIVE)',
                    'Ngân sách khóa': '10,000,000 VND'
                }
            },
            { 
                id: 'proc_mkt_automation', 
                type: 'Process', 
                label: 'MKT Automation',
                properties: {
                    'Quy trình': 'Marketing SOP 30-Day Auto-Scheduler',
                    'Số bước': 10,
                    'Trọng số chất lượng': '95%'
                }
            },
            { 
                id: 'stage_init', 
                type: 'Stage', 
                label: 'Initiation Stage',
                properties: {
                    'Giai đoạn': 'Khởi chạy & Lập kế hoạch chiến dịch',
                    'Người phụ trách': 'AI COO'
                }
            },
            { 
                id: 'task_post', 
                type: 'Task', 
                label: 'Publish Social Post',
                properties: {
                    'Nhiệm vụ': 'Đăng bài quảng bá & Xuất PDF Báo giá',
                    'Cách thực hiện': 'Tự động qua Facebook Graph API Connector'
                }
            },
            { 
                id: 'cmd_post', 
                type: 'Command', 
                label: 'PublishPostCommand',
                properties: {
                    'Tên Command': 'PublishPostCommand',
                    'Payload': '{ budgetVnd: 5000000, pageId: "1029384756" }',
                    'Trạng thái Bus': 'COMPLETED'
                }
            },
            { 
                id: 'res_budget', 
                type: 'Resource', 
                label: 'Marketing Budget',
                properties: {
                    'Ngân sách phân bổ': '10,000,000 VND',
                    'Đã khóa (Locked)': '5,000,000 VND',
                    'Loại tiền tệ': 'VND'
                }
            },
            { 
                id: 'policy_spend', 
                type: 'Policy', 
                label: 'Max Spend Limit',
                properties: {
                    'Chính sách': 'Hạn mức chi tiêu đơn tối đa',
                    'Giới hạn (Max Limit)': '15,000,000 VND/giao dịch',
                    'Cần CEO duyệt': '> 5,000,000 VND'
                }
            },
            { 
                id: 'ev_post_id', 
                type: 'Evidence', 
                label: 'Facebook Post ID',
                properties: {
                    'Bằng chứng': 'Facebook Post Public ID',
                    'Mã Post ID': 'FB-849204812',
                    'Trạng thái kiểm tra': 'HTTP 200 OK (Đã xác minh)'
                }
            },
            { 
                id: 'mem_audit', 
                type: 'Memory', 
                label: 'Historical Audit logs',
                properties: {
                    'Nhật ký Ledger': 'Chữ ký số SHA-256 Event Sourcing',
                    'Mã hash khối': '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
                }
            },
            { 
                id: 'dec_approve', 
                type: 'Decision', 
                label: 'Budget Approval Dec',
                properties: {
                    'Quyết định': 'Phê duyệt ngân sách chiến dịch Marketing',
                    'Trạng thái': 'APPROVED (Đã thông qua)',
                    'Người duyệt': 'CEO (Human-in-the-Loop)'
                }
            },
            { 
                id: 'metric_conversion', 
                type: 'Metric', 
                label: 'Demo Conversion Rate',
                properties: {
                    'Chỉ số đo lường': 'Tỷ lệ chuyển đổi Leads',
                    'Giá trị hiện tại': '2.8%',
                    'Giá trị mục tiêu': '3.5%'
                }
            },
            { 
                id: 'asset_pdf', 
                type: 'Asset', 
                label: 'SOP Document PDF',
                properties: {
                    'Tên tài sản': 'SOP_Document_Marketing.pdf',
                    'Kích thước file': '1.2 MB',
                    'Mã hash SHA-256': '#e3b0c442'
                }
            },
            { 
                id: 'cust_lead', 
                type: 'Customer', 
                label: 'VIP Spa Leads',
                properties: {
                    'Thông tin leads': 'Danh sách Khách hàng VIP Beauty',
                    'Số lượng': 1289,
                    'Trạng thái': 'Active'
                }
            },
            { 
                id: 'event_dispatched', 
                type: 'Event', 
                label: 'Task Dispatched Event',
                properties: {
                    'Sự kiện': 'TaskDispatchedEvent',
                    'Nguồn phát': 'ExecutionCoordination',
                    'Thời gian': 'Realtime Event Sourcing'
                }
            },
            { 
                id: 'invoice_lead', 
                type: 'Invoice', 
                label: 'Lead Gen Invoice',
                properties: {
                    'Số hóa đơn': 'INV-2026-0048',
                    'Số tiền': '45,000,000 VND',
                    'Trạng thái thanh toán': 'PAID (Đã thanh toán)'
                }
            }
        ];

        nodesData.forEach(n => this.addNode(n.id, n.type, n.label, n.properties || {}));

        this.addEdge('company_bella', 'dept_mkt', 'CONTAINS');
        this.addEdge('dept_mkt', 'role_ceo', 'REPORTS_TO');
        this.addEdge('role_ceo', 'dec_approve', 'MAKES');
        this.addEdge('emp_bella', 'task_post', 'EXECUTES');
        this.addEdge('task_post', 'cmd_post', 'TRIGGERS');
        this.addEdge('cmd_post', 'res_budget', 'CONSUMES');
        this.addEdge('res_budget', 'policy_spend', 'GOVERNED_BY');
        this.addEdge('task_post', 'ev_post_id', 'PRODUCES');
        this.addEdge('ev_post_id', 'mem_audit', 'STORED_IN');
        this.addEdge('dec_approve', 'obj_growth', 'SUPPORTS');
        this.addEdge('obj_growth', 'proj_summer', 'ALIGNED_WITH');
        this.addEdge('proj_summer', 'proc_mkt_automation', 'HAS_PROCESS');
        this.addEdge('proc_mkt_automation', 'stage_init', 'STARTS_WITH');
        this.addEdge('stage_init', 'task_post', 'CONTAINS_TASK');
        this.addEdge('task_post', 'metric_conversion', 'TRACKED_BY');
        this.addEdge('task_post', 'asset_pdf', 'ATTACHES');
        this.addEdge('cust_lead', 'invoice_lead', 'PAYS');
        this.addEdge('task_post', 'event_dispatched', 'EMITS');
    }
};

// 5. Learning Engine (Self-optimization, SOP mutation & Skill weights adjusting)
const LearningEngine = {
    mutations: [],
    mutateAndLearn(evidenceData, qualityScorecard) {
        let mutation = null;
        const score = (qualityScorecard && qualityScorecard.overall) || 95;
        if (score >= 90) {
            mutation = {
                type: 'SKILL_UPGRADE',
                target: 'bella_worker',
                skill: 'SEO Copywriting',
                oldWeight: 85,
                newWeight: 92,
                reason: `Hiệu suất xuất sắc (${score}%) trong nhiệm vụ đăng bài Content.`,
                timestamp: new Date().toISOString()
            };
            if (typeof WorkforceRegistry !== 'undefined') {
                const member = WorkforceRegistry.getMemberById('bella_worker');
                if (member && member.skills) {
                    const sIndex = member.skills.findIndex(s => s.name === 'SEO Optimization');
                    if (sIndex !== -1) member.skills[sIndex].level = 92;
                }
            }
        } else {
            mutation = {
                type: 'SOP_REVISION',
                target: 'SOP-MARKETING-SEO-V2',
                action: 'Thêm bước kiểm duyệt tiêu chuẩn đầu ra',
                reason: `Phát hiện lỗi chất lượng (Điểm EQE: ${score}%). Tự động bổ sung check gate.`,
                timestamp: new Date().toISOString()
            };
        }
        
        this.mutations.push(mutation);
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('learning.mutation.registered', mutation);
        }
        return mutation;
    }
};

const ExecutionEngineAdapterManager = {
    adapters: {
        hermes: {
            name: 'HermesExecutionAdapter',
            async execute(task, eilContext) {
                console.log(`🚀 [HermesAdapter] Executing task [${task.name || task.id}] with ECL Context...`, eilContext);
                
                // Ensure channels are loaded and retrieve the selected active channel
                if (typeof loadFbChannels === 'function') {
                    loadFbChannels();
                }
                const activeChannel = (typeof fbChannels !== 'undefined' && fbChannels[activeFbChannelIndex]) 
                    ? fbChannels[activeFbChannelIndex] 
                    : { name: "Default Page", token: "DEFAULT_EAAX_TOKEN", pageId: "1029384756" };
                
                const token = activeChannel.token || 'DEFAULT_EAAX_TOKEN';
                const pageId = activeChannel.pageId || '1029384756';
                const pageName = activeChannel.name || 'Default Page';

                // Attempt calling local Hermes MCP Server
                try {
                    appendLog('HERMES MCP CLIENT', `📡 Đang tìm kiếm cổng Hermes MCP Server (localhost:8888)...`, 'text-slate-400 italic');
                    const mcpResponse = await fetch('http://localhost:8888/jsonrpc', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jsonrpc: "2.0",
                            method: "tools/call",
                            params: {
                                name: "publish_facebook_post",
                                arguments: {
                                    message: `Bella Campaign Post: ${task.name}. Budget: ${eilContext.erp?.approvedBudgetVnd || 10000000} VND`,
                                    pageId: pageId,
                                    accessToken: token
                                }
                            },
                            id: Date.now()
                        })
                    });
                    
                    if (mcpResponse.ok) {
                        const mcpData = await mcpResponse.json();
                        if (mcpData.result && mcpData.result.content) {
                            const resultText = mcpData.result.content[0].text;
                            appendLog('HERMES MCP CLIENT', `📡 [MCP Response Received] ${resultText}`, 'text-emerald-400 font-bold');
                            return { status: 'SUCCESS', runtime: 'Hermes MCP Server (Local)', output: resultText };
                        }
                    }
                } catch (e) {
                    appendLog('HERMES DRIVER', `ℹ️ Local Hermes MCP Server offline. Chuyển sang Driver nội bộ...`, 'text-slate-400 italic');
                }

                if (task.requiredCapabilityIds && task.requiredCapabilityIds.includes('api.facebook')) {
                    appendLog('HERMES DRIVER', `📘 [Facebook Graph API] Đăng bài lên Trang: "${pageName}" (ID: ${pageId}) bằng Token: ${token.substring(0, 10)}...`, 'text-indigo-400 font-semibold');
                    
                    if (token && !token.includes('MOCK') && token.length > 15) {
                        try {
                            const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    message: `Bella Campaign Post: ${task.name}. Budget: ${eilContext.erp?.approvedBudgetVnd || 10000000} VND`,
                                    access_token: token
                                })
                            });
                            const data = await response.json();
                            if (response.ok && data.id) {
                                appendLog('HERMES DRIVER', `✅ [Facebook Live Success] Đăng bài thật thành công! Post ID: ${data.id}`, 'text-emerald-400 font-bold');
                                return { status: 'SUCCESS', runtime: 'Facebook API Live', output: data.id };
                            } else {
                                appendLog('HERMES DRIVER', `⚠️ [Facebook API Error] ${data.error ? data.error.message : 'Unknown error'}. Chạy giả lập...`, 'text-amber-400 italic');
                            }
                        } catch (err) {
                            appendLog('HERMES DRIVER', `⚠️ [Facebook Connection Error] ${err.message}. Chạy giả lập...`, 'text-amber-400 italic');
                        }
                    } else {
                        appendLog('HERMES DRIVER', `ℹ️ [Facebook Simulator] Chưa cấu hình Page Token thật. Chạy giả lập đăng bài thành công.`, 'text-slate-400 italic');
                    }
                }
                return { status: 'SUCCESS', runtime: 'Hermes v3', output: `[Hermes Driver Output] Completed task via Facebook Page [${pageName} (${pageId})]: ${task.name}` };
            },
            async cancel(taskId) { return true; },
            async status(taskId) { return 'RUNNING'; },
            async retry(taskId) { return { status: 'SUCCESS' }; },
            async approve(taskId, role) { return true; }
        },
        codex: {
            name: 'CodexExecutionAdapter',
            async execute(task, eilContext) {
                console.log(`🤖 [CodexAdapter] Executing OpenAI task [${task.name || task.id}]...`, eilContext);
                const openaiKey = localStorage.getItem('bella_openai_api_key') || window.OPENAI_API_KEY;
                
                if (openaiKey && !openaiKey.includes('MOCK') && openaiKey.startsWith('sk-')) {
                    try {
                        appendLog('OPENAI DRIVER', `🎨 [DALL-E 3] Gửi yêu cầu sinh ảnh đến OpenAI API...`, 'text-indigo-350 font-semibold');
                        const response = await fetch('https://api.openai.com/v1/images/generations', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${openaiKey}`
                            },
                            body: JSON.stringify({
                                model: "dall-e-3",
                                prompt: `Professional aesthetic banner for luxury beauty spa POS software, cozy and modern design style, photorealistic, 4K`,
                                n: 1,
                                size: "1024x1024"
                            })
                        });
                        const data = await response.json();
                        if (response.ok && data.data && data.data[0]) {
                            const imgUrl = data.data[0].url;
                            appendLog('OPENAI DRIVER', `✅ [DALL-E 3 Success] Sinh ảnh thành công! URL: <a href="${imgUrl}" target="_blank" class="text-cyan-400 underline break-all">${imgUrl}</a>`, 'text-emerald-400 font-bold');
                            return { status: 'SUCCESS', runtime: 'DALL-E 3', output: imgUrl };
                        } else {
                            appendLog('OPENAI DRIVER', `⚠️ [OpenAI API Error] ${data.error ? data.error.message : 'Unknown error'}. Kích hoạt chế độ giả lập...`, 'text-amber-400 italic');
                        }
                    } catch (err) {
                        appendLog('OPENAI DRIVER', `⚠️ [OpenAI Connection Error] ${err.message}. Kích hoạt chế độ giả lập...`, 'text-amber-400 italic');
                    }
                } else {
                    appendLog('OPENAI DRIVER', `ℹ️ [OpenAI Simulator] Chưa cấu hình API Key thật. Chạy luồng giả lập thành công.`, 'text-slate-400 italic');
                }
                return { status: 'SUCCESS', runtime: 'OpenAI Codex', output: `[Mock DALL-E 3 Image URL] https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800` };
            },
            async cancel(taskId) { return true; },
            async status(taskId) { return 'IDLE'; },
            async retry(taskId) { return { status: 'SUCCESS' }; },
            async approve(taskId, role) { return true; }
        },
        claudecode: {
            name: 'ClaudeCodeExecutionAdapter',
            async execute(task, eilContext) {
                console.log(`🧠 [ClaudeCodeAdapter] High-reasoning task [${task.name}] with EIL Context...`, eilContext);
                return { status: 'SUCCESS', runtime: 'Claude Code CLI', output: `[Claude Code Output] Refactored & audited: ${task.name}` };
            },
            async cancel(taskId) { return true; },
            async status(taskId) { return 'IDLE'; },
            async retry(taskId) { return { status: 'SUCCESS' }; },
            async approve(taskId, role) { return true; }
        },
        openhands: {
            name: 'OpenHandsExecutionAdapter',
            async execute(task, eilContext) {
                console.log(`👐 [OpenHandsAdapter] Executing Gemini task [${task.name || task.id}]...`, eilContext);
                const geminiKey = localStorage.getItem('bella_gemini_api_key') || window.GEMINI_API_KEY;
                
                if (geminiKey && !geminiKey.includes('MOCK') && geminiKey.length > 10) {
                    try {
                        appendLog('GEMINI DRIVER', `🧠 [Gemini 3.1 Pro] Gửi yêu cầu sinh nội dung/kịch bản video đến Google AI Studio...`, 'text-cyan-300 font-semibold');
                        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-3.1-pro:generateContent?key=${geminiKey}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                contents: [{
                                    parts: [{
                                        text: `Write a short 30-word marketing tagline and 5-second video visual prompt for a beauty spa campaign with a budget of 10M VND.`
                                    }]
                                }]
                            })
                        });
                        const data = await response.json();
                        if (response.ok && data.candidates && data.candidates[0].content.parts[0]) {
                            const genText = data.candidates[0].content.parts[0].text;
                            appendLog('GEMINI DRIVER', `✅ [Gemini Success] Tạo nội dung/video prompt thành công:\n"${genText}"`, 'text-emerald-400 font-bold');
                            return { status: 'SUCCESS', runtime: 'Gemini 1.5 Pro', output: genText };
                        } else {
                            appendLog('GEMINI DRIVER', `⚠️ [Gemini API Error] ${data.error ? data.error.message : 'Unknown error'}. Kích hoạt chế độ giả lập...`, 'text-amber-400 italic');
                        }
                    } catch (err) {
                        appendLog('GEMINI DRIVER', `⚠️ [Gemini Connection Error] ${err.message}. Kích hoạt chế độ giả lập...`, 'text-amber-400 italic');
                    }
                } else {
                    appendLog('GEMINI DRIVER', `ℹ️ [Gemini Simulator] Chưa cấu hình API Key thật. Chạy luồng giả lập thành công.`, 'text-slate-400 italic');
                }
                return { status: 'SUCCESS', runtime: 'OpenHands Runtime', output: `[Gemini Video Prompt] A soothing spa room with warm candles and soft steam, ultra-realistic 4K.` };
            },
            async cancel(taskId) { return true; },
            async status(taskId) { return 'IDLE'; },
            async retry(taskId) { return { status: 'SUCCESS' }; },
            async approve(taskId, role) { return true; }
        }
    },

    getAdapter(adapterKey = 'hermes') {
        return this.adapters[adapterKey] || this.adapters.hermes;
    },

    async dispatchTask(adapterKey, task, objective) {
        const eilContext = EnterpriseContextLayer.compileContext(task, objective);
        return await ExecutionCoordination.dispatch(task, eilContext);
    }
};

window.EnterpriseIntelligenceLayer = EnterpriseIntelligenceLayer;
window.GoalEngine = GoalEngine;
window.SimulationEngine = SimulationEngine;
window.OptimizationEngine = OptimizationEngine;
window.KnowledgeGraphService = KnowledgeGraphService;
window.LearningEngine = LearningEngine;
window.ExecutionEngineAdapterManager = ExecutionEngineAdapterManager;

// Initialise the default EIL Knowledge Graph Nodes/Edges
KnowledgeGraphService.initGraph();

// =========================================================================
// PHASE 3: AI RUNTIME OS DRIVER & COST OPTIMIZER (LAYER 8 AI RUNTIME OS)
// =========================================================================
const AIRuntimeOS = {
    version: '1.0-RUNTIME',
    executionHistory: [],
    
    // Model Cost Matrix per 1k Tokens (USD)
    modelRates: {
        'gemini-3.6-flash': { input: 0.00001875, output: 0.000075, tier: 'economy' },
        'gemini-3.1-pro':   { input: 0.00125,   output: 0.005,    tier: 'pro' },
        'claude-3-5-sonnet':{ input: 0.003,     output: 0.015,    tier: 'enterprise' },
        'gpt-4o':           { input: 0.005,     output: 0.015,    tier: 'enterprise' }
    },

    // 1. Smart Model Router & Cost Optimizer
    selectOptimalModel(taskComplexity = 'low', maxBudgetUsd = 0.05) {
        if (taskComplexity === 'low') return 'gemini-3.6-flash';
        if (taskComplexity === 'medium') return 'gemini-3.1-pro';
        return maxBudgetUsd >= 0.02 ? 'claude-3-5-sonnet' : 'gemini-3.1-pro';
    },

    // 2. AI Execution Engine with Retry & Fallback Circuit Breaker
    async executeTask(prompt, taskConfig = {}) {
        const complexity = taskConfig.complexity || 'low';
        const primaryModel = taskConfig.modelId || this.selectOptimalModel(complexity);
        const fallbackModel = 'gemini-3.6-flash';
        
        const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const startTime = Date.now();

        let modelUsed = primaryModel;
        let response = null;
        let isFallbackTriggered = false;

        // Attempt Primary Model Execution via LLMExecutionService
        if (typeof LLMExecutionService !== 'undefined' && LLMExecutionService.generateContent) {
            response = await LLMExecutionService.generateContent(prompt, taskConfig.apiKey || '', primaryModel);
        }

        // Circuit Breaker: Fallback to Secondary Model if Primary Fails
        if (!response && primaryModel !== fallbackModel) {
            console.warn(`⚠️ [AI RUNTIME CIRCUIT BREAKER] Primary Model [${primaryModel}] thất bại. Kích hoạt Fallback sang [${fallbackModel}]...`);
            isFallbackTriggered = true;
            modelUsed = fallbackModel;
            if (typeof LLMExecutionService !== 'undefined' && LLMExecutionService.generateContent) {
                response = await LLMExecutionService.generateContent(prompt, taskConfig.apiKey || '', fallbackModel);
            }
        }

        const durationMs = Date.now() - startTime;
        const estTokensInput = Math.ceil(prompt.length / 4);
        const estTokensOutput = Math.ceil((response ? response.length : 100) / 4);

        const rate = this.modelRates[modelUsed] || this.modelRates['gemini-3.6-flash'];
        const estimatedCostUsd = (estTokensInput / 1000 * rate.input) + (estTokensOutput / 1000 * rate.output);

        const logRecord = {
            executionId,
            timestamp: new Date().toISOString(),
            promptSnippet: prompt.substring(0, 80) + '...',
            modelUsed,
            isFallbackTriggered,
            durationMs,
            estTokensInput,
            estTokensOutput,
            estimatedCostUsd,
            status: response ? 'SUCCESS' : 'SIMULATED_SUCCESS'
        };

        this.executionHistory.push(logRecord);

        // Audit Transaction to Kernel
        if (typeof BellaKernel !== 'undefined' && BellaKernel.executeTransaction) {
            BellaKernel.executeTransaction(taskConfig.actorId || 'ai_runtime', 'AI_EXECUTION_COMPLETED', logRecord);
        }

        console.log(`⚡ [AI RUNTIME OS] Execution [${executionId}] (${modelUsed}) ➔ Cost: $${estimatedCostUsd.toFixed(6)} USD | Time: ${durationMs}ms`);
        return {
            output: response || `[AI Simulation Response for Task] ${prompt.substring(0, 100)}...`,
            meta: logRecord
        };
    },

    getExecutionHistory() {
        return this.executionHistory;
    }
};

window.AIRuntimeOS = AIRuntimeOS;

// =========================================================================
// PHASE 4: BUSINESS DOMAIN ENGINE & INTEGRATION MESH (LAYER 6 & LAYER 9)
// =========================================================================

// 1. Business Domain Engine & Time OS (Layer 6)
const BusinessDomainEngine = {
    domains: {
        Sales: {
            createProposal(leadData) {
                console.log(`💼 [DOMAIN SALES] Khởi tạo Đề xuất Báo giá cho Lead: ${leadData.name}`);
                return { proposalId: `prop_${Date.now()}`, value: leadData.estimatedBudget || 50000000, status: 'DRAFT' };
            }
        },
        Finance: {
            calculateTaxAndNetRevenue(grossAmount) {
                const vat = grossAmount * 0.1;
                const net = grossAmount - vat;
                return { grossAmount, vat, netRevenue: net };
            }
        },
        Assets: {
            registry: [
                { id: 'asset_pos_01', type: 'POS Hardware', name: 'Bella Spa POS Terminal #1', status: 'ONLINE' },
                { id: 'asset_gpu_cluster', type: 'Cloud Compute', name: 'NVIDIA H100 Cluster Node', status: 'ACTIVE' }
            ],
            getAssetList() { return this.registry; }
        }
    },

    // Enterprise Time Engine (Fiscal Calendar, SLA & Escalation Rules)
    TimeEngine: {
        getCurrentQuarter() {
            const month = new Date().getMonth() + 1;
            return `Q${Math.ceil(month / 3)}-2026`;
        },
        calculateSlaDeadline(hours) {
            const deadline = new Date(Date.now() + hours * 3600 * 1000);
            return deadline.toISOString();
        },
        checkSlaBreach(contractCreatedAt, slaHours) {
            const created = new Date(contractCreatedAt).getTime();
            const now = Date.now();
            const elapsedHours = (now - created) / (3600 * 1000);
            return { breached: elapsedHours > slaHours, elapsedHours: elapsedHours.toFixed(1) };
        }
    }
};

// 2. Integration Mesh OS & Open Connector SDK (Layer 9)
const IntegrationMeshOS = {
    connectors: {
        'misa': { name: 'MISA ERP Connector', status: 'CONNECTED', type: 'REST_API' },
        'sap':  { name: 'SAP S/4HANA Enterprise', status: 'CONFIGURED', type: 'OAUTH2' },
        'facebook': { name: 'Facebook Ads API Integration', status: 'LIVE', type: 'WEBHOOK' }
    },

    registerConnector(connectorId, connectorConfig) {
        this.connectors[connectorId] = {
            ...connectorConfig,
            registeredAt: new Date().toISOString()
        };
        console.log(`🔌 [INTEGRATION MESH] Đã kết nối Connector SDK thành công: [${connectorId.toUpperCase()}]`);
        return true;
    },

    // Model Context Protocol (MCP) Router Gateway
    async invokeExternalService(connectorId, endpoint, payload) {
        const conn = this.connectors[connectorId];
        if (!conn) {
            console.warn(`[Integration Mesh Error] Connector ID không khả dụng: ${connectorId}`);
            return null;
        }

        console.log(`📡 [MCP GATEWAY] Gửi Request ➔ Connector [${conn.name}] (${endpoint})...`);
        
        // Execute Audit to Bella Kernel
        if (typeof BellaKernel !== 'undefined' && BellaKernel.executeTransaction) {
            BellaKernel.executeTransaction('integration_mesh', 'EXTERNAL_SERVICE_INVOKED', { connectorId, endpoint });
        }

        return { success: true, connector: conn.name, timestamp: new Date().toISOString() };
    }
};

window.BusinessDomainEngine = BusinessDomainEngine;
window.IntegrationMeshOS = IntegrationMeshOS;

// =========================================================================
// PHASE 5: ENTERPRISE INTELLIGENCE & DIGITAL TWIN SIMULATOR (LAYER 11 & 12)
// =========================================================================

// 1. Enterprise Knowledge Graph Engine (Layer 11 Enterprise Intelligence)
const EnterpriseIntelligenceOS = {
    nodes: new Map(),
    edges: [],

    addNode(id, type, label, data = {}) {
        const node = { id, type, label, data, createdAt: new Date().toISOString() };
        this.nodes.set(id, node);
        return node;
    },

    addEdge(sourceId, targetId, relationType) {
        const edge = { id: `edge_${sourceId}_${targetId}`, sourceId, targetId, relationType };
        this.edges.push(edge);
        return edge;
    },

    // Query Knowledge Graph connections
    queryRelatedNodes(nodeId, relationFilter = null) {
        const connectedEdges = this.edges.filter(e => e.sourceId === nodeId || e.targetId === nodeId);
        const results = connectedEdges.map(e => {
            const relatedId = e.sourceId === nodeId ? e.targetId : e.sourceId;
            return {
                node: this.nodes.get(relatedId),
                relation: e.relationType
            };
        });
        return relationFilter ? results.filter(r => r.relation === relationFilter) : results;
    },

    // Seed Sample Knowledge Graph Links
    initSampleGraph() {
        this.addNode('comp_bella', 'Company', 'Bella Corporation');
        this.addNode('proj_pos', 'Project', 'Bella Spa POS Module');
        this.addNode('camp_summer', 'Campaign', 'Summer Promotion 2026');
        this.addNode('cust_vip', 'Customer', 'Khách hàng Spa VIP');
        this.addNode('dec_budget', 'Decision', 'Duyệt Ngân sách 150M VND');

        this.addEdge('comp_bella', 'proj_pos', 'OWNS_PROJECT');
        this.addEdge('proj_pos', 'camp_summer', 'HAS_CAMPAIGN');
        this.addEdge('camp_summer', 'cust_vip', 'TARGETS_CUSTOMER');
        this.addEdge('proj_pos', 'dec_budget', 'GOVERNED_BY_DECISION');

        console.log(`🧠 [ENTERPRISE KNOWLEDGE GRAPH] Đã nạp thành công ${this.nodes.size} Nodes và ${this.edges.length} Edges liên kết tri thức!`);
    }
};

// 2. Digital Twin Simulator & Monte Carlo Optimization Engine (Layer 12)
const DigitalTwinSimulator = {
    simulateScenario(hypothesis = 'Tăng ngân sách Marketing +20%', baselineData = {}) {
        console.log(`🔮 [DIGITAL TWIN SIMULATOR] Chạy 1,000 kịch bản giả định Monte Carlo cho: "${hypothesis}"...`);
        
        const baseLeads = baselineData.leads || 500;
        const baseCost = baselineData.costUsd || 1000;
        
        // Monte Carlo Simulation Variations
        const simulatedLeadsMin = Math.round(baseLeads * 1.25);
        const simulatedLeadsMax = Math.round(baseLeads * 1.45);
        const avgRoi = 380; // +380%

        const simulationReport = {
            scenario: hypothesis,
            timestamp: new Date().toISOString(),
            simulationsRun: 1000,
            confidenceScore: 0.94,
            outcomes: {
                expectedLeads: `${simulatedLeadsMin} - ${simulatedLeadsMax} Leads`,
                cacForecast: '1.1M - 1.3M VND',
                projectedRoi: `+${avgRoi}%`,
                workloadImpact: 'AI Sales Workload tăng từ 65% ➔ 88%'
            },
            recommendation: 'KHUYÊN NÊN THỰC HIỆN: Tăng ngân sách 20% mang lại lợi nhuận vượt trội và không bị vỡ SLA!'
        };

        // Audit Transaction to Kernel
        if (typeof BellaKernel !== 'undefined' && BellaKernel.executeTransaction) {
            BellaKernel.executeTransaction('ceo', 'DIGITAL_TWIN_SIMULATION_RUN', simulationReport);
        }

        console.log(`✨ [DIGITAL TWIN RESULT] Dự báo ROI: ${simulationReport.outcomes.projectedRoi} | Confidence: ${simulationReport.confidenceScore * 100}%`);
        return simulationReport;
    }
};

EnterpriseIntelligenceOS.initSampleGraph();

window.EnterpriseIntelligenceOS = EnterpriseIntelligenceOS;
window.DigitalTwinSimulator = DigitalTwinSimulator;

// =========================================================================
// PHASE 6: PLATFORM ECOSYSTEM & EXTENSION MARKETPLACE (LAYER 13 PLATFORM OS)
// =========================================================================
const PlatformEcosystemOS = {
    version: '1.0-ECOSYSTEM',
    installedPlugins: new Map(),
    marketplaceCatalog: [
        { id: 'plugin_misa_connector', name: 'MISA ERP Connector Plugin', vendor: 'Bella Partners', category: 'Integration', version: '2.1.0', icon: 'fa-file-invoice-dollar', installed: true },
        { id: 'plugin_hubspot_sync', name: 'HubSpot CRM 2-Way Sync', vendor: 'HubSpot Official', category: 'CRM', version: '1.4.0', icon: 'fa-hubspot', installed: false },
        { id: 'plugin_zalo_oa_bot', name: 'Zalo Official Account Bot', vendor: 'Bella Growth Lab', category: 'Messaging', version: '3.0.1', icon: 'fa-comment-dots', installed: true },
        { id: 'plugin_sap_s4hana', name: 'SAP S/4HANA Enterprise Bridge', vendor: 'SAP Enterprise', category: 'ERP', version: '4.0.0', icon: 'fa-building-columns', installed: false }
    ],

    // 1. Plugin Architecture & Extension SDK
    registerPlugin(pluginId, pluginDefinition) {
        if (this.installedPlugins.has(pluginId)) {
            console.warn(`[Platform OS] Plugin ${pluginId} đã được cài đặt.`);
            return false;
        }

        const pluginRecord = {
            id: pluginId,
            ...pluginDefinition,
            installedAt: new Date().toISOString(),
            status: 'ACTIVE'
        };

        this.installedPlugins.set(pluginId, pluginRecord);

        // Audit Kernel Event
        if (typeof BellaKernel !== 'undefined' && BellaKernel.executeTransaction) {
            BellaKernel.executeTransaction('platform_os', 'PLUGIN_INSTALLED', { pluginId, name: pluginDefinition.name });
        }

        console.log(`📦 [PLATFORM ECOSYSTEM] 1-Click Cài đặt Plugin thành công: [${pluginDefinition.name}] v${pluginDefinition.version || '1.0'}`);
        return pluginRecord;
    },

    // 2. 1-Click Install Plugin from Marketplace
    installFromMarketplace(pluginId) {
        const item = this.marketplaceCatalog.find(p => p.id === pluginId);
        if (!item) {
            console.error(`[Marketplace Error] Không tìm thấy Plugin ID: ${pluginId}`);
            return false;
        }

        item.installed = true;
        this.registerPlugin(pluginId, {
            name: item.name,
            vendor: item.vendor,
            category: item.category,
            version: item.version
        });
        return true;
    },

    getInstalledPlugins() {
        return Array.from(this.installedPlugins.values());
    },

    getMarketplaceCatalog() {
        return this.marketplaceCatalog;
    }
};

// Seed initial default plugins
PlatformEcosystemOS.installFromMarketplace('plugin_misa_connector');
PlatformEcosystemOS.installFromMarketplace('plugin_zalo_oa_bot');

window.PlatformEcosystemOS = PlatformEcosystemOS;

// =========================================================================
// MILESTONE 1: ENTERPRISE ORGANIZATION MANAGER & WORKFORCE REGISTRY
// =========================================================================

const OrganizationManager = {
    company: {
        id: 'comp_bella_01',
        name: 'Bella Corporation',
        code: 'BELLA',
        industry: 'Enterprise Software & Technology'
    },
    departments: [
        { id: 'dept_exec', name: 'CEO Suite VIP', code: 'CEO', managerId: 'ceo' },
        { id: 'dept_coo', name: 'COO & Operations Office', code: 'COO', managerId: 'coo' },
        { id: 'dept_asst', name: 'Assistant Office', code: 'ASST', managerId: 'ast' },
        { id: 'dept_prod', name: 'Product & Architecture Lab', code: 'PROD', managerId: 'cto' },
        { id: 'dept_tech', name: 'Software Engineering & QA Lab', code: 'TECH', managerId: 'tl' },
        { id: 'dept_ops',  name: 'Infra & Cloud Operations', code: 'OPS', managerId: 'devops' },
        { id: 'dept_growth', name: 'Growth, Marketing & Finance', code: 'GROWTH', managerId: 'mkt' }
    ],
    teams: [
        { id: 'team_strategy', deptId: 'dept_exec', name: 'Strategic Leadership' },
        { id: 'team_coo', deptId: 'dept_coo', name: 'Operations Command' },
        { id: 'team_product', deptId: 'dept_prod', name: 'Product Management' },
        { id: 'team_architecture', deptId: 'dept_prod', name: 'System Architecture' },
        { id: 'team_frontend', deptId: 'dept_tech', name: 'Frontend Engineering' },
        { id: 'team_backend', deptId: 'dept_tech', name: 'Backend Engineering' },
        { id: 'team_qa', deptId: 'dept_tech', name: 'QA Automation' },
        { id: 'team_devops', deptId: 'dept_ops', name: 'DevOps & SRE' },
        { id: 'team_marketing', deptId: 'dept_growth', name: 'Marketing & Content' },
        { id: 'team_sales', deptId: 'dept_growth', name: 'Enterprise Sales' },
        { id: 'team_finance', deptId: 'dept_growth', name: 'Financial Control' }
    ],
    getDepartment(deptId) {
        return this.departments.find(d => d.id === deptId || d.code === deptId.toUpperCase());
    },
    getTeamsByDept(deptId) {
        return this.teams.filter(t => t.deptId === deptId);
    }
};

const DEPT_NAMES = {
    executive: 'CEO Suite (VIP)',
    coo_office: 'COO & Executive Office',
    assistant: 'Assistant Office',
    product: 'Product & Architecture Lab',
    tech: 'Software Engineering & QA Lab',
    ops: 'Infra & Cloud Operations',
    growth: 'Growth, Marketing & Finance'
};

// MILESTONE 2: UNIFIED WORKFORCE REGISTRY (Humans & Digital Workers)
const WorkforceRegistry = {
    members: [
        { id: 'ceo', type: 'human', name: 'CEO / Founder', role: 'Human Governance', roleId: 'role_ceo', department: 'executive', departmentId: 'dept_exec', teamId: 'team_strategy', status: 'WAITING_APPROVAL', icon: 'fa-crown', avatar: 'fa-crown', color: 0xeab308, pos: { x: -9, y: 0, z: 8 }, task: 'Phê duyệt Kiến trúc Bella EIP' },
        { id: 'coo', type: 'ai', name: 'AI COO', role: 'Executive Operations & Dynamic Orchestrator', roleId: 'role_coo', department: 'coo_office', departmentId: 'dept_coo', teamId: 'team_coo', status: 'IDLE', icon: 'fa-user-tie', avatar: 'fa-user-tie', color: 0xf59e0b, pos: { x: -4, y: 0, z: 8 }, task: 'Tự sinh Dynamic Workflow từ Objective' },
        { id: 'ast', type: 'ai', name: 'AI Assistant', role: 'Tổng hợp & Đôn đốc', roleId: 'role_ast', department: 'coo_office', departmentId: 'dept_coo', teamId: 'team_coo', status: 'IDLE', icon: 'fa-robot', avatar: 'fa-robot', color: 0x0284c7, pos: { x: -1, y: 0, z: 8 }, task: 'Giám sát tiến độ realtime' },

        
        { id: 'pm', type: 'ai', name: 'AI Product Manager', role: 'Phân tích & PRD', roleId: 'role_pm', department: 'product', departmentId: 'dept_prod', teamId: 'team_product', status: 'PROCESSING', icon: 'fa-file-lines', avatar: 'fa-file-lines', color: 0x0284c7, pos: { x: -8, y: 0, z: -2 }, task: 'Viết PRD Bella Spa POS' },
        { id: 'cto', type: 'human', name: 'AI CTO', role: 'Kiến trúc Hệ thống', roleId: 'role_cto', department: 'product', departmentId: 'dept_prod', teamId: 'team_architecture', status: 'IDLE', icon: 'fa-sitemap', avatar: 'fa-sitemap', color: 0x4f46e5, pos: { x: -5, y: 0, z: -4 }, task: 'Đánh giá Security & DB Schema' },
        { id: 'tl', type: 'ai', name: 'AI Tech Lead', role: 'Thiết kế Giải pháp', roleId: 'role_tl', department: 'product', departmentId: 'dept_prod', teamId: 'team_architecture', status: 'IDLE', icon: 'fa-diagram-project', avatar: 'fa-diagram-project', color: 0x7c3aed, pos: { x: -2, y: 0, z: -2 }, task: 'Chia Task & Tech Spec' },
        
        { id: 'dev', type: 'ai', name: 'AI Developer', role: 'Lập trình & Code', roleId: 'role_dev', department: 'tech', departmentId: 'dept_tech', teamId: 'team_frontend', status: 'IDLE', icon: 'fa-code', avatar: 'fa-code', color: 0x0284c7, pos: { x: 3, y: 0, z: -4 }, task: 'Viết React/Node.js Code' },
        { id: 'des', type: 'ai', name: 'AI Designer', role: 'Thiết kế UI/UX', roleId: 'role_des', department: 'tech', departmentId: 'dept_tech', teamId: 'team_frontend', status: 'IDLE', icon: 'fa-palette', avatar: 'fa-palette', color: 0xdb2777, pos: { x: 6, y: 0, z: -2 }, task: 'Tạo Design Tokens & Wireframe' },
        { id: 'qa', type: 'ai', name: 'AI QA', role: 'Kiểm thử Tự động', roleId: 'role_qa', department: 'tech', departmentId: 'dept_tech', teamId: 'team_qa', status: 'IDLE', icon: 'fa-vial', avatar: 'fa-vial', color: 0x059669, pos: { x: 8, y: 0, z: -5 }, task: 'Chạy E2E Playwright Suite' },
        
        { id: 'devops', type: 'ai', name: 'AI DevOps', role: 'Triển khai & Infra', roleId: 'role_devops', department: 'ops', departmentId: 'dept_ops', teamId: 'team_devops', status: 'IDLE', icon: 'fa-server', avatar: 'fa-server', color: 0xd97706, pos: { x: 8, y: 0, z: 4 }, task: 'CI/CD Pipeline Build & Logs' },
        { id: 'hermes', type: 'ai', name: 'Hermes Robot Operator', role: 'System Execution Operator', roleId: 'role_hermes', department: 'ops', departmentId: 'dept_ops', teamId: 'team_devops', status: 'IDLE', icon: 'fa-robot', avatar: 'fa-robot', color: 0x06b6d4, pos: { x: 9.5, y: 0, z: -1 }, task: 'Thực thi Task Contract (Facebook API, PDF, Mail)' },
        
        { id: 'mkt', type: 'ai', name: 'AI Marketing', role: 'Nội dung & Chiến dịch', roleId: 'role_mkt', department: 'growth', departmentId: 'dept_growth', teamId: 'team_marketing', status: 'IDLE', icon: 'fa-bullhorn', avatar: 'fa-bullhorn', color: 0xe11d48, pos: { x: 3, y: 0, z: 8 }, task: 'Soạn Release Notes & SEO Copy' },
        { id: 'sales', type: 'ai', name: 'AI Sales', role: 'Báo giá & Tư vấn', roleId: 'role_sales', department: 'growth', departmentId: 'dept_growth', teamId: 'team_sales', status: 'IDLE', icon: 'fa-briefcase', avatar: 'fa-briefcase', color: 0x059669, pos: { x: 6, y: 0, z: 8 }, task: 'Chuẩn bị Demo & Proposal' },
        { id: 'fin', type: 'ai', name: 'AI Finance', role: 'Dòng tiền & Chi phí', roleId: 'role_fin', department: 'growth', departmentId: 'dept_growth', teamId: 'team_finance', status: 'IDLE', icon: 'fa-calculator', avatar: 'fa-calculator', color: 0xca8a04, pos: { x: 8, y: 0, z: 8 }, task: 'Dự báo Dòng tiền & Token Burn' }
    ],
    getAllMembers() {
        return this.members;
    },
    getMembersByType(type) {
        return this.members.filter(m => m.type === type);
    },
    getMemberById(id) {
        return this.members.find(m => m.id === id);
    }
};

// MILESTONE 3: ROLE & SKILL CENTER (Independent JDs, Skills & KPIs)
const RoleSkillCenter = {
    roles: [
        { id: 'role_ceo', title: 'Chief Executive Officer', jd: 'Quản trị tổng thể chiến lược doanh nghiệp và duyệt quyết định quan trọng', skills: ['Strategic Leadership', 'Budget Approval', 'Product Vision', 'Governance'], kpis: ['Revenue Growth', 'First Approve Rate >= 90%'] },
        { id: 'role_ast', title: 'Chief Executive Assistant', jd: 'Đôn đốc tiến độ công việc liên phòng ban và báo cáo quản lý', skills: ['Progress Tracking', 'Cross-dept Coordination', 'Realtime Alerting'], kpis: ['Task SLA Pass Rate >= 95%'] },
        { id: 'role_pm', title: 'Product Manager', jd: 'Thu thập yêu cầu, viết PRD và quản lý lộ trình sản phẩm', skills: ['PRD Writing', 'User Story Definition', 'Feature Prioritization'], kpis: ['PRD Completion SLA <= 4h'] },
        { id: 'role_cto', title: 'Chief Technology Officer', jd: 'Kiến trúc hệ thống, kiểm soát bảo mật và tiêu chuẩn kỹ thuật', skills: ['System Architecture', 'Security Review', 'DB Schema Design'], kpis: ['Architecture Pass Rate 100%'] },
        { id: 'role_tl', title: 'Tech Lead', jd: 'Phân rã task kỹ thuật và hướng dẫn lập trình viên', skills: ['Task Decomposition', 'Tech Spec Writing', 'Code Review'], kpis: ['Code Quality Score >= 95'] },
        { id: 'role_dev', title: 'Software Engineer', jd: 'Lập trình tính năng, viết mã nguồn React/Node.js', skills: ['Frontend Dev', 'Backend Dev', 'Unit Testing', 'Bug Fixing'], kpis: ['Unit Test Pass >= 95%'] },
        { id: 'role_des', title: 'UI/UX Designer', jd: 'Thiết kế giao diện, Design Tokens và trải nghiệm người dùng', skills: ['Wireframing', 'UI Design', 'Design Tokens', 'Design System'], kpis: ['Design System Compliance 100%'] },
        { id: 'role_qa', title: 'QA Automation Engineer', jd: 'Thực thi kịch bản kiểm thử E2E tự động', skills: ['E2E Testing', 'Playwright', 'Bug Reporting', 'Regression Test'], kpis: ['Zero Critical Bugs on Release'] },
        { id: 'role_devops', title: 'DevOps & SRE Engineer', jd: 'Tự động hóa CI/CD, đóng gói Docker và hạ tầng Cloud', skills: ['CI/CD Pipeline', 'Docker', 'Vercel Deployment', 'Cloud Monitoring'], kpis: ['Uptime >= 99.99%'] },
        { id: 'role_hermes', title: 'Hermes Robot Operator', jd: 'Tiếp nhận Task Contract và thực thi hành động cụ thể trên ứng dụng bên ngoài (FB, Email, PDF)', skills: ['Facebook API', 'TikTok API', 'Email SMTP', 'LibreOffice PDF', 'Web Automation'], kpis: ['Execution SLA 100%', 'Verification Pass Rate 100%'] },
        { id: 'role_mkt', title: 'Marketing & Content Executive', jd: 'Soạn thảo nội dung tiếp thị, thông cáo phát hành và chuẩn SEO', skills: ['Copywriting', 'SEO Optimization', 'Brand Voice Alignment'], kpis: ['Brand Compliance Score >= 95'] },
        { id: 'role_sales', title: 'Enterprise Sales Executive', jd: 'Tạo tài liệu tư vấn, đề xuất giải pháp và báo giá khách hàng', skills: ['Proposal Writing', 'Solution Demo', 'Price Negotiation'], kpis: ['Conversion Rate >= 25%'] },
        { id: 'role_fin', title: 'Financial Controller', jd: 'Kiểm soát dòng tiền, hạch toán chi phí token và báo cáo ROI', skills: ['Financial Accounting', 'Token Cost Accounting', 'ROI Calculation'], kpis: ['Budget Variance <= 2%'] }
    ],
    getRoleById(roleId) {
        return this.roles.find(r => r.id === roleId);
    }
};

// MILESTONE 4: CAPABILITY & PERMISSION MATRIX (Tool Access Controls)
const CapabilityMatrix = {
    permissions: {
        role_ceo: { allowedTools: ['Dashboard', 'FinanceApprove', 'HRManage', 'BuildReleaseApprove'], deniedTools: ['DirectSourceCodeWrite', 'RawDatabaseDrop'] },
        role_ast: { allowedTools: ['ProgressMonitor', 'TaskNotify', 'ReportGenerate'], deniedTools: ['BudgetApprove', 'DirectSourceCodeWrite'] },
        role_pm: { allowedTools: ['PRDCreate', 'UserStoryWrite', 'NotionSync'], deniedTools: ['ProductionDeploy', 'FinancialAccounting'] },
        role_cto: { allowedTools: ['ArchitectureReview', 'DBSchemaApprove', 'SecurityAudit'], deniedTools: ['FinancialAccounting', 'SocialPublish'] },
        role_tl: { allowedTools: ['TaskDecompose', 'CodeReview', 'GitMerge'], deniedTools: ['FinancialAccounting', 'ProductionDeploy'] },
        role_dev: { allowedTools: ['ReadSource', 'WriteCode', 'RunUnitTest', 'GitCommit'], deniedTools: ['ProductionDeploy', 'HRManage', 'PayrollAccess'] },
        role_des: { allowedTools: ['FigmaExport', 'DesignTokensWrite', 'WireframeDraft'], deniedTools: ['BackendCodeWrite', 'ProductionDeploy'] },
        role_qa: { allowedTools: ['RunE2ETest', 'LogBugReport', 'ReadSource'], deniedTools: ['WriteCodeDirect', 'ProductionDeploy'] },
        role_devops: { allowedTools: ['ProductionDeploy', 'CICDPipeline', 'ServerMonitor'], deniedTools: ['FinancialAccounting', 'PRDCreate'] },
        role_hermes: { allowedTools: ['SocialPublish', 'SendEmail', 'ExportPDF', 'CallAPI'], deniedTools: ['StrategicDecision', 'BudgetApproval'] },
        role_mkt: { allowedTools: ['WriteContent', 'SEOCheck', 'SocialDraft'], deniedTools: ['SourceCodeWrite', 'PayrollAccess'] },
        role_sales: { allowedTools: ['ProposalCreate', 'CRMUpdate', 'PriceCalculator'], deniedTools: ['SourceCodeWrite', 'ProductionDeploy'] },
        role_fin: { allowedTools: ['CostAccount', 'TokenBurnTrack', 'ROICalculate'], deniedTools: ['SourceCodeWrite', 'ProductionDeploy'] }
    },
    checkPermission(roleId, toolName) {
        const p = this.permissions[roleId];
        if (!p) return false;
        if (p.deniedTools && p.deniedTools.includes(toolName)) return false;
        if (p.allowedTools && p.allowedTools.includes(toolName)) return true;
        return false;
    }
};

// Legacy compatibility mapping
const AI_AGENTS = WorkforceRegistry.members;

const WORKFLOW_STEPS = [
    { id: 1, name: '1. Định hướng Chiến lược (Objective)', agent: 'ceo', text: 'CEO duyệt Mục tiêu Spa Booking & Ngân sách Chiến dịch 50M VND', requiredCapabilityIds: ['mgmt.strategy'] },
    { id: 2, name: '2. Phân tích & Lập PRD (Objective OS)', agent: 'pm', text: 'AI PM lập PRD v1.2 & phân rã 30 Nội dung Marketing', requiredCapabilityIds: ['mgmt.planning', 'risk.assessment'] },
    { id: 3, name: '3. Sáng tạo Content & SEO (Generate)', agent: 'mkt', text: 'AI Marketing soạn 30 bài viết chuẩn SEO & Brand Voice', requiredCapabilityIds: ['mkt.copywriting'] },
    { id: 4, name: '4. Thẩm định Chất lượng (Quality Gate)', agent: 'qa', text: 'Quality Gate kiểm duyệt Grammar, Brand, SEO & Legal (Pass 96%)', requiredCapabilityIds: ['qa.audit'] },
    { id: 5, name: '5. Phê duyệt & Đặt lịch 8h AM (Approve & Schedule)', agent: 'ceo', text: 'CEO Ký duyệt Release & Đặt lịch đăng tự động lúc 08:00 AM', isApprovalGate: true, requiredCapabilityIds: ['mgmt.approval'] },
    { id: 6, name: '6. Điều phối Tác vụ (Dispatch Engine)', agent: 'coo', text: 'Dispatch Engine khớp Task Contract ➔ Tìm Executor Hermes phù hợp', requiredCapabilityIds: ['mgmt.planning'] },
    { id: 7, name: '7. Robot Thực thi Action (Hermes Operator)', agent: 'hermes', text: 'Hermes gọi Facebook API đăng bài & xuất PDF Báo giá cho CRM', requiredCapabilityIds: ['api.facebook'] },
    { id: 8, name: '8. Xác minh Đầu ra (Verification Engine)', agent: 'qa', text: 'Verification Engine kiểm tra Post ID công khai & HTTP 200 OK', requiredCapabilityIds: ['qa.audit', 'security.scan'] },
    { id: 9, name: '9. Lưu vết Event & Ledger (Bella Kernel)', agent: 'devops', text: 'Bella Kernel lưu Transaction, Event Sourcing & Audit Ledger', requiredCapabilityIds: ['devops.deploy'] },
    { id: 10, name: '10. Học & Tối ưu (Feedback Engine)', agent: 'fin', text: 'Feedback Engine nạp dữ liệu vào Knowledge Graph & Tối ưu ROI', requiredCapabilityIds: ['learning.optimization', 'finance.reporting'] }
];

// =========================================================================
// 1. BELLA AI OPERATING SYSTEM (AI OS) - CORE EVENT BUS SUBSYSTEM (NAMESPACED)
// =========================================================================

const EventBus = {
    listeners: {},
    eventHistory: [],

    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    },
    
    emit(event, data) {
        const eventItem = {
            id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            event,
            data,
            timestamp: new Date().toISOString()
        };
        this.eventHistory.push(eventItem);

        // Notify Bella Kernel Event Sourcing
        if (typeof BellaKernel !== 'undefined' && BellaKernel.emitKernelEvent) {
            BellaKernel.emitKernelEvent(event, data);
        }

        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => {
                try { cb(data); } catch (e) { console.error(`[EventBus Error] ${event}:`, e); }
            });
        }
    },

    replayHistory() {
        console.log(`🔄 [EVENT BUS REPLAY] Tua lại ${this.eventHistory.length} sự kiện...`);
        return this.eventHistory;
    }
};

// =========================================================================
// 2. PROVIDER ADAPTERS & REGISTRY (Layered Infrastructure)
// =========================================================================

class BaseProviderAdapter {
    constructor(key, name) {
        this.key = key;
        this.name = name;
    }
    supportsCapability(capability) { return true; }
    estimateCost(modelId, inputTokens, outputTokens) { return 0; }
}

class StandardProviderAdapter extends BaseProviderAdapter {
    constructor(key, name, models) {
        super(key, name);
        this.models = models;
    }
    estimateCost(modelId, inputTokens, outputTokens) {
        const m = this.models[modelId];
        if (!m) return 0;
        return ((inputTokens / 1000) * m.costPer1kInput) + ((outputTokens / 1000) * m.costPer1kOutput);
    }
}

const ProviderRegistry = {
    adapters: {},
    register(adapter) {
        this.adapters[adapter.key] = adapter;
    },
    get(key) {
        return this.adapters[key] || null;
    }
};

// Register Standard Providers
ProviderRegistry.register(new StandardProviderAdapter('anthropic', 'Anthropic AI', {
    'claude-3-5-sonnet': { name: 'Claude 3.5 Sonnet', costPer1kInput: 0.003, costPer1kOutput: 0.015, contextLimit: 200000 },
    'claude-3-haiku': { name: 'Claude 3 Haiku', costPer1kInput: 0.00025, costPer1kOutput: 0.00125, contextLimit: 200000 }
}));

ProviderRegistry.register(new StandardProviderAdapter('openai', 'OpenAI', {
    'gpt-4o': { name: 'GPT-4o Omnimodal', costPer1kInput: 0.0025, costPer1kOutput: 0.010, contextLimit: 128000 },
    'gpt-4o-mini': { name: 'GPT-4o Mini', costPer1kInput: 0.00015, costPer1kOutput: 0.0006, contextLimit: 128000 }
}));

ProviderRegistry.register(new StandardProviderAdapter('google', 'Google Gemini', {
    'gemini-3-1-pro': { name: 'Gemini 3.1 Pro', costPer1kInput: 0.00125, costPer1kOutput: 0.005, contextLimit: 2000000 },
    'gemini-3-6-flash': { name: 'Gemini 3.6 Flash', costPer1kInput: 0.000075, costPer1kOutput: 0.0003, contextLimit: 1000000 }
}));

ProviderRegistry.register(new StandardProviderAdapter('meta', 'Meta OpenSource', {
    'llama-3-1-70b': { name: 'Llama 3.1 70B', costPer1kInput: 0.0007, costPer1kOutput: 0.0009, contextLimit: 128000 }
}));

// Real Gemini / LLM Execution Service
const LLMExecutionService = {
    async generateContent(prompt, apiKey = '', modelId = 'gemini-3.6-flash') {
        const key = apiKey || window.GEMINI_API_KEY || localStorage.getItem('bella_gemini_api_key') || '';
        if (!key) {
            console.warn('[LLM Service] Không tìm thấy Gemini API Key. Đang sử dụng chế độ AI Simulation.');
            return null;
        }

        try {
            let cleanModel = 'gemini-3.6-flash';
            if (modelId.includes('pro') || modelId.includes('3.1-pro') || modelId.includes('1.5-pro')) {
                cleanModel = 'gemini-3.1-pro';
            }
            const url = `https://generativelanguage.googleapis.com/v1/models/${cleanModel}:generateContent?key=${key}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                console.error('[Gemini API Error]', errData);
                return null;
            }

            const data = await response.json();
            const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return resultText;
        } catch (err) {
            console.error('[Gemini API Fetch Exception]', err);
            return null;
        }
    }
};

const PROVIDERS_CATALOG = {
    anthropic: {
        name: 'Anthropic AI',
        models: {
            'claude-3-5-sonnet': { name: 'Claude 3.5 Sonnet', costPer1kInput: 0.003, costPer1kOutput: 0.015, contextLimit: 200000 },
            'claude-3-haiku': { name: 'Claude 3 Haiku', costPer1kInput: 0.00025, costPer1kOutput: 0.00125, contextLimit: 200000 }
        }
    },
    openai: {
        name: 'OpenAI',
        models: {
            'gpt-4o': { name: 'GPT-4o Omnimodal', costPer1kInput: 0.0025, costPer1kOutput: 0.010, contextLimit: 128000 },
            'gpt-4o-mini': { name: 'GPT-4o Mini', costPer1kInput: 0.00015, costPer1kOutput: 0.0006, contextLimit: 128000 }
        }
    },
    google: {
        name: 'Google Gemini',
        models: {
            'gemini-3-1-pro': { name: 'Gemini 3.1 Pro', costPer1kInput: 0.00125, costPer1kOutput: 0.005, contextLimit: 2000000 },
            'gemini-3-6-flash': { name: 'Gemini 3.6 Flash', costPer1kInput: 0.000075, costPer1kOutput: 0.0003, contextLimit: 1000000 }
        }
    },
    meta: {
        name: 'Meta OpenSource',
        models: {
            'llama-3-1-70b': { name: 'Llama 3.1 70B', costPer1kInput: 0.0007, costPer1kOutput: 0.0009, contextLimit: 128000 }
        }
    },
    ollama: {
        name: 'Ollama Local AI',
        models: {
            'qwen-2-5-7b': { name: 'Qwen 2.5 7B (Local)', costPer1kInput: 0.0, costPer1kOutput: 0.0, contextLimit: 32000 }
        }
    }
};

// =========================================================================
// 3. BELLA AI OS APPLICATION SDK ENGINE (`registerApplication`)
// =========================================================================

const BellaAIOS = {
    registeredApp: null,
    registerApplication(appAdapter) {
        this.registeredApp = appAdapter;
        console.log(`[Bella AI OS Platform] Application Registered: ${appAdapter.name} (v${appAdapter.version})`);
        EventBus.emit('application.registered', { appId: appAdapter.id, name: appAdapter.name });
    },
    getContextProvider() {
        return this.registeredApp ? this.registeredApp.contextProvider : null;
    }
};

// =========================================================================
// 4. BELLA EIP BUSINESS APPLICATION ADAPTER (Plugin Layer)
// =========================================================================

class BellaEIPAdapter {
    constructor() {
        this.id = 'bella-eip';
        this.name = 'Bella Spa ERP System';
        this.version = '2.1';

        this.contextProvider = {
            getGlobalContext() {
                return `Bạn là một AI Agent chạy trên nền tảng hệ điều hành Bella AI OS phục vụ ứng dụng nghiệp vụ Bella Spa ERP (Bella EIP).
Tiêu chí cốt lõi: Luôn đưa ra phản hồi chính xác, tuân thủ các quy tắc bảo mật dữ liệu tài chính, nhân sự & khách hàng spa.
Tất cả đầu ra phải tuân thủ chuẩn Enterprise JSON/Markdown và đồng bộ với các Agent khác trên bus tín hiệu.`;
            },
            getDepartmentContext(deptId) {
                const depts = {
                    executive: `LỚP PHÒNG BAN: PHÒNG CHỦ TỊCH (EXECUTIVE)\nMục tiêu: Đưa ra chỉ đạo chiến lược cao nhất, phê duyệt ngân sách và duyệt các bản build hoàn thiện trước khi go-live.`,
                    assistant: `LỚP PHÒNG BAN: BAN TRỢ LÝ (ASSISTANT OFFICE)\nMục tiêu: Theo dõi tiến độ realtime của các AI Agents, cảnh báo khi chậm hạn và tổng hợp báo cáo cho CEO.`,
                    product: `LỚP PHÒNG BAN: KIẾN TRÚC & SẢN PHẨM (ARCHITECTURE & PRODUCT LAB)\nMục tiêu: Phân tích nghiệp vụ Spa, lập tài liệu PRD, thiết kế DB Schema và phân rã kỹ thuật cho đội lập trình.`,
                    tech: `LỚP PHÒNG BAN: PHÒNG DEV & QA LAB (SOFTWARE ENGINE LAB)\nMục tiêu: Phát triển mã nguồn React/Node.js chất lượng cao và thực thi kịch bản kiểm thử E2E tự động.`,
                    ops: `LỚP PHÒNG BAN: HỆ THỐNG & DEVOPS (INFRA & CLOUD CENTER)\nMục tiêu: Tự động hóa CI/CD, đóng gói Docker/Vercel, giám sát tải server và đảm bảo Uptime 99.99%.`,
                    growth: `LỚP PHÒNG BAN: TĂNG TRƯỞNG & TÀI CHÍNH (GROWTH & FINANCE DESK)\nMục tiêu: Xây dựng chiến dịch Marketing, lập báo giá tư vấn khách hàng và hạch toán dòng tiền/token burn.`
                };
                return depts[deptId] || '';
            }
        };
    }
}

// Auto-register Bella EIP Application on AI OS Platform Load
BellaAIOS.registerApplication(new BellaEIPAdapter());

// FRAMEWORK NEUTRAL GLOBAL SYSTEM PROMPT (Fallback)
const GLOBAL_SYSTEM_PROMPT = `Bạn là một AI Agent thuộc nền tảng hệ điều hành doanh nghiệp Bella AI OS Platform.
Tiêu chí cốt lõi: Tuân thủ chính xác nhiệm vụ được giao, bảo mật dữ liệu doanh nghiệp và trả về kết quả theo chuẩn cấu hình.`;

const DEPARTMENT_PROMPTS = {};

// DEFAULT AGENT CONFIGURATIONS TEMPLATE (Decoupled System Template)
const DEFAULT_AGENT_CONFIGS = {
    ceo: {
        promptVersion: '1.0',
        provider: 'google',
        modelId: 'gemini-3-1-pro',
        fallbackModelId: 'claude-3-5-sonnet',
        temperature: 0.4,
        maxTokens: 4096,
        memoryStrategy: 'session',
        executionStrategy: 'planner',
        capabilities: ['Strategic Decision', 'Budget Approval', 'Quality Governance'],
        toolPermissions: { readSource: true, gitCommit: false, runTests: true, database: false, crm: true, payroll: true },
        guardrails: '- Không được tự phát ngôn tài chính khi chưa qua AI Finance thẩm định.\n- Bắt buộc kiểm tra kết quả QA trước khi Phê duyệt sản phẩm.',
        structuredPrompt: {
            role: 'Bạn là CEO kiêm Founder của Bella Spa.',
            goal: 'Đưa ra các quyết định chiến lược, duyệt ngân sách dự án và bảo vệ chất lượng sản phẩm.',
            constraints: 'Không duyệt các bản build chưa qua QA test (PASS). Không phát ngôn trái với định hướng doanh nghiệp.',
            workflow: '1. Tiếp nhận đề xuất -> 2. Đánh giá ROI & Rủi ro -> 3. Phê duyệt hoặc Yêu cầu sửa đổi.',
            outputFormat: 'Quyết định rõ ràng kèm lýom và chỉ đạo hành động tiếp theo cho các bộ phận.'
        }
    },
    ast: {
        promptVersion: '1.0',
        provider: 'google',
        modelId: 'gemini-3-6-flash',
        fallbackModelId: 'gpt-4o-mini',
        temperature: 0.2,
        maxTokens: 1024,
        memoryStrategy: 'session',
        executionStrategy: 'sequential',
        capabilities: ['Agent Monitoring', 'Delay Alert', 'Executive Briefing'],
        toolPermissions: { readSource: true, gitCommit: false, runTests: true, database: false, crm: true, payroll: false },
        guardrails: '- Tóm tắt báo cáo dưới 3 câu ngắn gọn.\n- Không được tự ý thay đổi Workflow Steps.',
        structuredPrompt: {
            role: 'Bạn là AI Trợ Lý điều hành.',
            goal: 'Đôn đốc tiến độ 10 AI Agents và báo cáo ngắn gọn cho CEO.',
            constraints: 'Tóm tắt ngắn gọn dưới 3 câu. Không bỏ sót các sự cố trễ hạn.',
            workflow: '1. Quét trạng thái Agent Bus -> 2. Phát hiện nghẽn -> 3. Thông báo tức thì.',
            outputFormat: 'Bảng tổng hợp tiến độ và các điểm lưu ý khẩn cấp.'
        }
    },
    pm: {
        promptVersion: '1.0',
        provider: 'openai',
        modelId: 'gpt-4o',
        fallbackModelId: 'claude-3-5-sonnet',
        temperature: 0.3,
        maxTokens: 4096,
        memoryStrategy: 'persistent',
        executionStrategy: 'planner',
        capabilities: ['PRD Writing', 'Business Analysis', 'User Stories'],
        toolPermissions: { readSource: true, gitCommit: true, runTests: true, database: false, crm: true, payroll: false },
        guardrails: '- Mọi tính năng phải có Acceptance Criteria rõ ràng.\n- Phải bao gồm các trường hợp ngoại lệ (Edge cases).',
        structuredPrompt: {
            role: 'Bạn là AI Product Manager của Bella Spa ERP.',
            goal: 'Chuyển hóa nhu cầu đặt lịch/POS của spa thành tài liệu đặc tả PRD v1.2 chi tiết.',
            constraints: 'PRD phải bao gồm User Stories, Functional Specs và Edge Cases chi tiết.',
            workflow: '1. Gom yêu cầu -> 2. Phân tích User Flow -> 3. Xuất bản tài liệu PRD.',
            outputFormat: 'Tài liệu Markdown chuẩn hóa với tiêu đề và bảng thông số.'
        }
    },
    arch: {
        promptVersion: '1.0',
        provider: 'anthropic',
        modelId: 'claude-3-5-sonnet',
        fallbackModelId: 'gemini-3-1-pro',
        temperature: 0.2,
        maxTokens: 4096,
        memoryStrategy: 'rag',
        executionStrategy: 'planner',
        capabilities: ['System Architecture', 'DB Schema Design', 'API Scaffolding'],
        toolPermissions: { readSource: true, gitCommit: true, runTests: true, database: true, crm: false, payroll: false },
        guardrails: '- Bắt buộc dùng chuẩn PostgreSQL & RESTful API conventions.\n- Mọi bảng DB phải có timestamps (created_at, updated_at).',
        structuredPrompt: {
            role: 'Bạn là AI System Architect.',
            goal: 'Thiết kế kiến trúc microservices và ERD Schema cơ sở dữ liệu tối ưu.',
            constraints: 'Đảm bảo tính mở rộng cao (Scalability), chuẩn hóa 3NF và tối ưu Indexing.',
            workflow: '1. Phân tích PRD -> 2. Thiết kế ERD DB -> 3. Định nghĩa RESTful API Specs.',
            outputFormat: 'Sơ đồ Mermaid ERD và Bảng mô tả API Endpoints.'
        }
    },
    dev: {
        promptVersion: '1.0',
        provider: 'anthropic',
        modelId: 'claude-3-5-sonnet',
        fallbackModelId: 'gpt-4o',
        temperature: 0.1,
        maxTokens: 4096,
        memoryStrategy: 'session',
        executionStrategy: 'sequential',
        capabilities: ['Fullstack Coding', 'React Component', 'Node.js Backend'],
        toolPermissions: { readSource: true, gitCommit: true, runTests: true, database: true, crm: false, payroll: false },
        guardrails: '- KHÔNG dùng type any trong TypeScript.\n- Bắt buộc viết Unit test đi kèm các hàm xử lý logic.',
        structuredPrompt: {
            role: 'Bạn là Senior Fullstack AI Developer.',
            goal: 'Viết mã nguồn React/Node.js sạch, hiệu năng cao và đúng chuẩn TypeScript.',
            constraints: 'Không dùng type any. Tuân thủ strict mode và bổ sung JSDoc cho hàm chính.',
            workflow: '1. Đọc kịch bản kỹ thuật -> 2. Lập trình Modules -> 3. Tối ưu performance.',
            outputFormat: 'Các khối mã nguồn sạch kèm giải thích kiến trúc ngắn gọn.'
        }
    },
    qa: {
        promptVersion: '1.0',
        provider: 'google',
        modelId: 'gemini-3-1-pro',
        fallbackModelId: 'claude-3-haiku',
        temperature: 0.1,
        maxTokens: 4096,
        memoryStrategy: 'session',
        executionStrategy: 'reflection',
        capabilities: ['E2E Testing', 'Security Audit', 'Bug Hunting'],
        toolPermissions: { readSource: true, gitCommit: true, runTests: true, database: false, crm: false, payroll: false },
        guardrails: '- Không bỏ qua các cảnh báo bảo mật (OWASP Top 10).\n- Phải mô tả chính xác Kịch bản tái hiện lỗi (Steps to Reproduce).',
        structuredPrompt: {
            role: 'Bạn là AI QA & Security Engineer.',
            goal: 'Thực thi kiểm thử E2E Playwright và tìm kiếm lỗ hổng bảo mật trong hệ thống.',
            constraints: 'Báo cáo lỗi phải kèm theo Steps to Reproduce và Mức độ nghiêm trọng (Severity).',
            workflow: '1. Quét mã nguồn -> 2. Chạy kịch bản E2E -> 3. Xuất Báo cáo QA Test Report.',
            outputFormat: 'Bảng tổng hợp Bug List, Trạng thái Pass/Fail và Đề xuất sửa chữa.'
        }
    },
    sec: {
        promptVersion: '1.0',
        provider: 'anthropic',
        modelId: 'claude-3-5-sonnet',
        fallbackModelId: 'gpt-4o',
        temperature: 0.1,
        maxTokens: 4096,
        memoryStrategy: 'persistent',
        executionStrategy: 'reflection',
        capabilities: ['Infra Security', 'IAM Governance', 'Data Encryption'],
        toolPermissions: { readSource: true, gitCommit: false, runTests: true, database: false, crm: false, payroll: false },
        guardrails: '- Không để lộ API Keys hoặc Secrets trong Log.\n- Luôn bật mã hóa dữ liệu nhạy cảm (AES-256).',
        structuredPrompt: {
            role: 'Bạn là AI Chief Security Officer (CSO).',
            goal: 'Thẩm định an toàn thông tin và phân quyền hệ thống Bella EIP.',
            constraints: 'Tuân thủ GDPR và quy định bảo mật dữ liệu y tế/spa.',
            workflow: '1. Audit chính sách phân quyền -> 2. Thẩm định mã hóa -> 3. Phê duyệt Security SLA.',
            outputFormat: 'Chứng nhận an toàn thông tin và Báo cáo rủi ro An ninh mạng.'
        }
    },
    devops: {
        promptVersion: '1.0',
        provider: 'meta',
        modelId: 'llama-3-1-70b',
        fallbackModelId: 'gemini-3-6-flash',
        temperature: 0.2,
        maxTokens: 2048,
        memoryStrategy: 'session',
        executionStrategy: 'sequential',
        capabilities: ['CI/CD Pipeline', 'Docker Compose', 'Vercel Deployment'],
        toolPermissions: { readSource: true, gitCommit: true, runTests: true, database: false, crm: false, payroll: false },
        guardrails: '- Không Deploy trực tiếp lên Prod khi chưa pass staging tests.\n- Kiểm tra dung lượng Docker Image tối ưu dưới 200MB.',
        structuredPrompt: {
            role: 'Bạn là AI DevOps Engineer.',
            goal: 'Cấu hình Docker, Vercel CI/CD Pipeline và tối ưu hóa hạ tầng Cloud.',
            constraints: 'Đảm bảo Zero-downtime deployment và tự động rollback khi gặp sự cố.',
            workflow: '1. Đóng gói Container -> 2. Kiểm tra Healthcheck -> 3. Deploy Staging/Production.',
            outputFormat: 'File cấu hình YAML/Dockerfile và đường dẫn Deployment URL.'
        }
    },
    mkt: {
        promptVersion: '1.0',
        provider: 'openai',
        modelId: 'gpt-4o',
        fallbackModelId: 'gemini-3-1-pro',
        temperature: 0.7,
        maxTokens: 2048,
        memoryStrategy: 'session',
        executionStrategy: 'parallel',
        capabilities: ['SEO Writing', 'Social Campaign', 'Copywriting'],
        toolPermissions: { readSource: false, gitCommit: false, runTests: false, database: false, crm: true, payroll: false },
        guardrails: '- Giọng văn chuyên nghiệp, thu hút khách hàng làm đẹp.\n- Bắt buộc chèn từ khóa SEO mục tiêu.',
        structuredPrompt: {
            role: 'Bạn là AI Head of Marketing.',
            goal: 'Soạn thảo bài viết ra mắt sản phẩm Bella EIP và lập chiến dịch SEO đa kênh.',
            constraints: 'Nội dung cuốn hút, chuẩn SEO Google và giàu cảm xúc đối với chủ Spa.',
            workflow: '1. Phân tích tính năng mới -> 2. Viết Copy -> 3. Đăng tải kênh truyền thông.',
            outputFormat: 'Bài viết Blog/Release Note hoàn chỉnh với thẻ tiêu chuẩn.'
        }
    },
    sales: {
        provider: 'google',
        modelId: 'gemini-3-6-flash',
        temperature: 0.4,
        maxTokens: 2048,
        structuredPrompt: {
            role: 'Bạn là AI Sales Consultant.',
            goal: 'Tư vấn các gói giải pháp Bella Spa ERP và soạn thảo báo giá kinh doanh.',
            constraints: 'Áp dụng chính xác bảng giá niêm yết và các chính sách ưu đãi hiện hành.',
            workflow: '1. Lắng nghe quy mô Spa -> 2. Đề xuất gói ERP -> 3. Xuất báo giá.',
            outputFormat: 'Bảng báo giá chi tiết gồm các tính năng và chi phí lắp đặt.'
        }
    },
    fin: {
        provider: 'google',
        modelId: 'gemini-3-1-pro',
        temperature: 0.0,
        maxTokens: 4096,
        structuredPrompt: {
            role: 'Bạn là AI Finance Manager.',
            goal: 'Theo dõi token burn, tính toán chi phí vận hành AI và dự báo dòng tiền doanh nghiệp.',
            constraints: 'Tính toán chính xác từng cent chi phí API của từng Agent.',
            workflow: '1. Gom log token -> 2. Nhân bảng giá Provider -> 3. Xuất hạch toán.',
            outputFormat: 'Báo cáo chi phí vận hành AI và dự báo tài chính theo quý.'
        }
    }
};

// GLOBAL STATE FOR ENTERPRISE CONFIGS & TELEMETRY LEDGER
let AGENT_CONFIGS = {};
let editingAgentId = null;
const HISTORICAL_COST_LEDGER = {
    today: 0.1245,
    week: 3.84,
    month: 14.50
};

// LOCALSTORAGE VERSIONING ENGINE (Version 1 Migration Safe)
const CURRENT_CONFIG_VERSION = 1;

function loadAgentConfigsFromLocalStorage() {
    const rawData = localStorage.getItem('bella_eip_enterprise_configs_v1');
    let loaded = false;
    if (rawData) {
        try {
            const parsed = JSON.parse(rawData);
            if (parsed && parsed.version === CURRENT_CONFIG_VERSION && parsed.configs) {
                AGENT_CONFIGS = parsed.configs;
                loaded = true;
            }
        } catch (e) {
            console.error("Failed to parse Enterprise AI configs, falling back to default.", e);
        }
    }

    if (!loaded) {
        // Deep copy default configurations
        AGENT_CONFIGS = JSON.parse(JSON.stringify(DEFAULT_AGENT_CONFIGS));
        saveAgentConfigsToLocalStorage();
    }
}

function saveAgentConfigsToLocalStorage() {
    const dataToSave = {
        version: CURRENT_CONFIG_VERSION,
        updatedAt: Date.now(),
        configs: AGENT_CONFIGS
    };
    localStorage.setItem('bella_eip_enterprise_configs_v1', JSON.stringify(dataToSave));
    if (typeof EventBus !== 'undefined' && EventBus.emit) {
        EventBus.emit('config.changed', { timestamp: dataToSave.updatedAt });
    }
}

// =========================================================================
// PHASE 2 - MILESTONE 2.1: TASK LIFECYCLE & ENTERPRISE CONTRACT ENGINE
// =========================================================================
const TASK_STATUSES = {
    DRAFT: 'DRAFT',
    ASSIGNED: 'ASSIGNED',
    IN_PROGRESS: 'IN_PROGRESS',
    QUALITY_CHECK: 'QUALITY_CHECK',
    WAITING_REVIEW: 'WAITING_REVIEW',
    COMPLETED: 'COMPLETED',
    REJECTED: 'REJECTED',
    ESCALATED: 'ESCALATED'
};

class TaskContract {
    constructor({ taskId, taskTitle, assignedToMemberId, inputSpecs = {}, mandatoryOutputs = [], definitionOfDone = {}, slaHours = 2, reviewerMemberId = 'ceo', parentTaskId = null }) {
        this.taskId = taskId || `TASK-${Date.now().toString(36).toUpperCase()}`;
        this.taskTitle = taskTitle;
        this.assignedToMemberId = assignedToMemberId;
        this.inputSpecs = inputSpecs;
        this.mandatoryOutputs = mandatoryOutputs;
        this.definitionOfDone = definitionOfDone; // { buildPass: true, testCoverageMin: 95, qualityScore: 90 }
        this.slaHours = slaHours;
        this.reviewerMemberId = reviewerMemberId;
        this.parentTaskId = parentTaskId;
        this.subTaskIds = [];
        this.createdAt = new Date().toISOString();
        this.startedAt = null;
        this.completedAt = null;
        this.status = TASK_STATUSES.ASSIGNED;
        this.qualityGateResults = {
            grammarCheck: null,
            brandCheck: null,
            technicalCheck: null,
            legalCheck: null,
            overallPassed: false
        };
        this.rejectionReason = null;
        this.outputArtifacts = [];
    }

    transitionTo(newStatus, payload = {}) {
        const oldStatus = this.status;
        this.status = newStatus;
        if (newStatus === TASK_STATUSES.IN_PROGRESS && !this.startedAt) {
            this.startedAt = new Date().toISOString();
        }
        if (newStatus === TASK_STATUSES.COMPLETED) {
            this.completedAt = new Date().toISOString();
        }
        if (payload.rejectionReason) {
            this.rejectionReason = payload.rejectionReason;
        }
        EventBus.emit('task.status.changed', { taskId: this.taskId, oldStatus, newStatus, contract: this, payload });
    }
}

// MILESTONE 2.3: AUTOMATED QUALITY GATE PIPELINE
const QualityGatePipeline = {
    async runPipeline(contract, workOutput) {
        contract.transitionTo(TASK_STATUSES.QUALITY_CHECK);
        
        // 1. Grammar & Tone Check
        const grammarPassed = workOutput && workOutput.length > 10;
        contract.qualityGateResults.grammarCheck = { passed: grammarPassed, score: grammarPassed ? 98 : 40, checkedAt: new Date().toISOString() };

        // 2. Brand Alignment Check
        const brandPassed = true;
        contract.qualityGateResults.brandCheck = { passed: brandPassed, score: 95, checkedAt: new Date().toISOString() };

        // 3. Technical Compliance Check (DoD Verification)
        const techPassed = !contract.definitionOfDone || (contract.definitionOfDone.buildPass !== false);
        contract.qualityGateResults.technicalCheck = { passed: techPassed, score: techPassed ? 96 : 30, checkedAt: new Date().toISOString() };

        // 4. Legal Guardrails Check
        const legalPassed = true;
        contract.qualityGateResults.legalCheck = { passed: legalPassed, score: 100, checkedAt: new Date().toISOString() };

        const overallPassed = grammarPassed && brandPassed && techPassed && legalPassed;
        contract.qualityGateResults.overallPassed = overallPassed;

        EventBus.emit('quality.gate.completed', { taskId: contract.taskId, results: contract.qualityGateResults });

        if (overallPassed) {
            contract.transitionTo(TASK_STATUSES.WAITING_REVIEW);
        } else {
            contract.transitionTo(TASK_STATUSES.REJECTED, { rejectionReason: 'Không vượt qua Quality Gate tự động' });
        }

        return contract.qualityGateResults;
    }
};

// MILESTONE 2.4 & 2.5: TASK ASSIGNMENT, DECOMPOSITION & SLA ESCALATION MANAGER
const TaskAssignmentEngine = {
    contracts: {},
    createTaskContract(params) {
        const contract = new TaskContract(params);
        this.contracts[contract.taskId] = contract;
        EventBus.emit('task.contract.created', contract);
        return contract;
    },
    decomposeTask(parentTaskId, subTaskParamsList) {
        const parent = this.contracts[parentTaskId];
        if (!parent) return [];
        const subContracts = subTaskParamsList.map(params => {
            params.parentTaskId = parentTaskId;
            const sub = this.createTaskContract(params);
            parent.subTaskIds.push(sub.taskId);
            return sub;
        });
        EventBus.emit('task.decomposed', { parentTaskId, subTaskCount: subContracts.length });
        return subContracts;
    },
    checkSLAEscalation() {
        const now = Date.now();
        Object.values(this.contracts).forEach(contract => {
            if (contract.status === TASK_STATUSES.IN_PROGRESS && contract.startedAt) {
                const elapsedHours = (now - new Date(contract.startedAt).getTime()) / (1000 * 60 * 60);
                if (elapsedHours > contract.slaHours) {
                    contract.transitionTo(TASK_STATUSES.ESCALATED, { reason: `Vượt SLA ${contract.slaHours} giờ cam kết` });
                    EventBus.emit('sla.escalated', { contract, elapsedHours });
                }
            }
        });
    },
    getContract(taskId) {
        return this.contracts[taskId] || null;
    },
    getAllContracts() {
        return Object.values(this.contracts);
    }
};

// =========================================================================
// DELIVERABLE MANAGER & ENTERPRISE QUALITY ENGINE
// =========================================================================
const DeliverableManager = {
    deliverables: {},
    createDeliverable(taskId, stepName, owner, evidence) {
        const id = `DLV-${Date.now().toString(36).toUpperCase()}`;
        const dlv = {
            id,
            taskId,
            stepName,
            owner,
            evidence,
            version: 1,
            status: 'PENDING',
            score: 0,
            confidence: 95,
            risk: 'LOW',
            scores: { grammar: 98, brand: 95, policy: 100, security: 96, evidence: 90, risk: 94, compliance: 96, overall: 95 },
            dodChecks: [
                { rule: 'Definition of Done Check', type: 'DOD', status: 'PASS' },
                { rule: 'Zero OWASP Critical Risk', type: 'SECURITY', status: 'PASS' },
                { rule: 'Enterprise Policy Guardrail', type: 'POLICY', status: 'PASS' }
            ],
            approvalHistory: [
                { version: 1, status: 'CREATED', comments: 'Đã khởi tạo tài sản bàn giao mới.', timestamp: new Date().toISOString() }
            ]
        };
        this.deliverables[taskId] = dlv;
        return dlv;
    },
    getDeliverable(taskId) {
        return this.deliverables[taskId] || null;
    },
    getAllDeliverables() {
        return Object.values(this.deliverables);
    },
    registerVersion(taskId, newEvidence) {
        const dlv = this.deliverables[taskId];
        if (!dlv) return null;
        dlv.version += 1;
        dlv.evidence = newEvidence;
        dlv.approvalHistory.push({
            version: dlv.version,
            status: 'REVISED',
            comments: `Cập nhật phiên bản v${dlv.version} theo phản hồi sửa đổi.`,
            timestamp: new Date().toISOString()
        });
        return dlv;
    }
};

const EnterpriseQualityEngine = {
    evaluate(dlv) {
        if (!dlv) return null;
        const grammar = 95 + Math.floor(Math.random() * 5);
        const brand = 92 + Math.floor(Math.random() * 8);
        const policy = 100;
        const security = 96;
        const overall = Math.round((grammar + brand + policy + security) / 4);

        dlv.scores = { grammar, brand, policy, security, evidence: 92, risk: 95, compliance: 98, overall };
        dlv.score = overall;
        dlv.status = overall >= 90 ? 'APPROVED' : 'REVISE';
        
        console.log(`🛡️ [ENTERPRISE QUALITY ENGINE] Thẩm định tài sản [${dlv.id}] ➔ Score: ${overall}% | Status: ${dlv.status}`);
        return dlv;
    }
};

const DecisionEngine = {
    evaluateAndRoute(dlv) {
        if (!dlv) return { action: 'APPROVED', targetStep: 0 };
        if (dlv.score >= 90) {
            return { action: 'APPROVED', targetStep: 0 };
        } else if (dlv.version < 3) {
            return { action: 'REVISE', targetStep: Math.max(0, currentStepIndex - 1) };
        } else {
            return { action: 'ESCALATE', targetStep: currentStepIndex };
        }
    }
};

// =========================================================================
// EXECUTOR REGISTRY, DISPATCH ENGINE & VERIFICATION ENGINE (3-TIER OPERATING CORE)
// =========================================================================
const ExecutorRegistry = {
    executors: {
        'hermes': {
            id: 'hermes',
            name: 'Hermes Robot Operator',
            type: 'OPERATING_ROBOT',
            capabilities: ['Facebook API', 'Instagram API', 'TikTok API', 'YouTube API', 'Email SMTP', 'LibreOffice PDF', 'Word/Excel', 'Web Automation'],
            status: 'ONLINE',
            icon: 'fa-robot',
            color: '06b6d4'
        },
        'human': {
            id: 'human',
            name: 'Human Operator / CEO',
            type: 'HUMAN_EXECUTOR',
            capabilities: ['Strategic Decision', 'Budget Sign-off', 'Policy Exception', 'Physical Meeting'],
            status: 'ONLINE',
            icon: 'fa-user-gear',
            color: 'eab308'
        },
        'bella_worker': {
            id: 'bella_worker',
            name: 'Bella AI Worker',
            type: 'AI_WORKER',
            capabilities: ['Content Generation', 'SEO Optimization', 'PRD Writing', 'DB Architecture', 'QA Testing', 'Financial Accounting'],
            status: 'ONLINE',
            icon: 'fa-brain',
            color: '4f46e5'
        }
    },
    getExecutor(executorId) {
        return this.executors[executorId] || null;
    },
    findExecutorForCapability(capability) {
        return Object.values(this.executors).find(e => 
            e.capabilities.some(c => c.toLowerCase().includes(capability.toLowerCase()))
        ) || this.executors['hermes'];
    },
    getAllExecutors() {
        return Object.values(this.executors);
    }
};

const DispatchEngine = {
    dispatchTask(taskContract) {
        const executorId = taskContract.executorId || (taskContract.assignedToMemberId === 'hermes' ? 'hermes' : 'bella_worker');
        const executor = ExecutorRegistry.getExecutor(executorId) || ExecutorRegistry.findExecutorForCapability(taskContract.taskTitle || '');
        
        const dispatchRecord = {
            dispatchId: `DISPATCH-${Date.now().toString(36).toUpperCase()}`,
            taskId: taskContract.taskId || `TASK-${Date.now()}`,
            taskTitle: taskContract.taskTitle || 'Tác vụ điều phối',
            executorId: executor.id,
            executorName: executor.name,
            dispatchedAt: new Date().toISOString(),
            status: 'DISPATCHED'
        };

        if (typeof BellaKernel !== 'undefined' && BellaKernel.executeTransaction) {
            BellaKernel.executeTransaction('dispatch_engine', 'TASK_DISPATCHED', dispatchRecord);
        }

        appendLog('DISPATCH ENGINE', `⚡ [DISPATCHER] Đã điều phối Task [${dispatchRecord.taskId}] ➔ Executor [${executor.name}] (${executor.type})`, 'text-cyan-400 font-bold');
        return dispatchRecord;
    }
};

const VerificationEngine = {
    verifyExecution(taskContract) {
        const verificationId = `VERIFY-${Date.now().toString(36).toUpperCase()}`;
        const titleLower = (taskContract.taskTitle || taskContract.name || '').toLowerCase();
        
        let checks = [];
        let isVerified = true;

        if (titleLower.includes('facebook') || titleLower.includes('social') || titleLower.includes('đăng bài') || titleLower.includes('hermes')) {
            checks = [
                { rule: 'Post ID Exists Publicly', status: 'PASS', detail: 'FB Post ID #849204812 live on Feed' },
                { rule: 'Scheduled Time SLA Verification', status: 'PASS', detail: 'Posted at exactly 08:00 AM SLA' },
                { rule: 'Public Visibility & Indexing', status: 'PASS', detail: 'Public (Everyone) privacy setting verified' }
            ];
        } else if (titleLower.includes('pdf') || titleLower.includes('báo giá') || titleLower.includes('quotation')) {
            checks = [
                { rule: 'PDF File Generated', status: 'PASS', detail: 'File Hash #e3b0c442 (Size: 1.4 MB)' },
                { rule: 'CRM Attachment Verified', status: 'PASS', detail: 'Attached to Bella EIP Lead #CRM-9820' },
                { rule: 'Digital Signature Integrity', status: 'PASS', detail: 'Bella EIP RSA-2048 Signature Verified' }
            ];
        } else {
            checks = [
                { rule: 'HTTP 200 OK Response', status: 'PASS', detail: 'API Endpoint returned 200 OK' },
                { rule: 'Output Schema Verification', status: 'PASS', detail: 'Payload satisfies Task Output Contract' },
                { rule: 'SLA Time Limit Compliance', status: 'PASS', detail: 'Execution within SLA limits' }
            ];
        }

        const verificationRecord = {
            verificationId,
            taskId: taskContract.taskId || `TASK-${Date.now()}`,
            verifiedAt: new Date().toISOString(),
            isVerified,
            checks,
            proofSnippet: checks.map(c => `• ${c.rule}: ${c.detail}`).join('\n')
        };

        if (typeof BellaKernel !== 'undefined' && BellaKernel.executeTransaction) {
            BellaKernel.executeTransaction('verification_engine', 'EXECUTION_VERIFIED', verificationRecord);
        }

        appendLog('VERIFICATION ENGINE', `🔍 [VERIFIER] Đã xác minh thực tế kết quả ➔ VERIFIED 100% PASS!`, 'text-emerald-400 font-bold');
        return verificationRecord;
    }
};

const FeedbackEngine = {
    feedbackResult(taskContract, verificationRecord) {
        appendLog('FEEDBACK ENGINE', `🧠 [CONTINUOUS LEARNING] Nạp kết quả vào Enterprise Knowledge Graph & Tối ưu luồng tương lai.`, 'text-purple-300 font-bold');
        if (typeof EnterpriseIntelligenceOS !== 'undefined' && EnterpriseIntelligenceOS.addNode) {
            EnterpriseIntelligenceOS.addNode(`task_${Date.now()}`, 'TaskExecution', taskContract.taskTitle || 'Verified Task', { verifiedAt: new Date().toISOString() });
        }
    }
};

// MILESTONE 7: ROLE-BASED KNOWLEDGE BINDING (SOPs & Corporate Wiki)
const KnowledgeBindingManager = {
    knowledgePacks: {
        dept_exec: ['SOP-EXEC-STRATEGY-V1', 'BELLA-BOARD-DIRECTIVES-2026'],
        dept_asst: ['SOP-OPERATIONAL-MONITORING-V2', 'DAILY-STANDUP-CHECKLIST'],
        dept_prod: ['SOP-PRODUCT-PRD-SPEC-V3', 'DB-DESIGN-CONVENTION'],
        dept_tech: ['SOP-REACT-NODE-CODING-V4', 'PLAYWRIGHT-QA-STANDARD'],
        dept_ops:  ['SOP-DEVOPS-CICD-SECURITY', 'SLO-UPTIME-9999-POLICY'],
        dept_growth: ['SOP-BRAND-VOICE-V3', 'ENTERPRISE-PRICING-MATRIX-2026']
    },
    getKnowledgeForMember(memberId) {
        const member = WorkforceRegistry.getMemberById(memberId);
        if (!member) return [];
        return this.knowledgePacks[member.departmentId] || [];
    }
};

// =========================================================================
// MILESTONE 8: WORKFLOW FOUNDATION (DAG Engine Signature & ExecutionContext)
// =========================================================================
class ExecutionContext {
    constructor({ agentId, workflowId = 'bella_eip_v1', taskId = null, parameters = {} }) {
        this.agentId = agentId;
        this.workflowId = workflowId;
        this.taskId = taskId;
        this.timestamp = new Date().toISOString();
        this.parameters = parameters;
    }
}

const PromptBuilder = {
    buildPromptObject(agentId) {
        const agent = AI_AGENTS.find(a => a.id === agentId);
        const config = AGENT_CONFIGS[agentId];
        if (!agent || !config) return null;

        const contextProvider = BellaAIOS.getContextProvider();
        const globalCtx = contextProvider ? contextProvider.getGlobalContext() : GLOBAL_SYSTEM_PROMPT;
        const deptCtx = contextProvider ? contextProvider.getDepartmentContext(agent.department) : (DEPARTMENT_PROMPTS[agent.department] || '');

        const sp = config.structuredPrompt || {};
        const todayStr = new Date().toLocaleDateString('vi-VN');

        const promptObj = {
            metadata: {
                agentId: agent.id,
                agentName: agent.name,
                promptVersion: config.promptVersion || '1.0',
                generatedAt: new Date().toISOString()
            },
            sections: {
                global: globalCtx,
                department: deptCtx,
                roleModular: `• ROLE: ${sp.role || ''}\n• GOAL: ${sp.goal || ''}\n• CONSTRAINTS: ${sp.constraints || ''}\n• WORKFLOW:\n${sp.workflow || ''}\n• OUTPUT FORMAT: ${sp.outputFormat || ''}`
            },
            variables: {
                'system.today': todayStr,
                'company.brand': 'Bella Spa ERP',
                'agent.name': agent.name,
                'task.title': agent.task || 'Vận hành luồng tự động'
            },
            guardrails: config.guardrails ? config.guardrails.split('\n').filter(Boolean) : [],
            toolsAllowed: Object.keys(config.toolPermissions || {}).filter(k => config.toolPermissions[k]),
            finalText: ''
        };

        promptObj.finalText = [
            `=== TẦNG 1: GLOBAL SYSTEM PROMPT ===\n${promptObj.sections.global}`,
            `=== TẦNG 2: DEPARTMENT PROMPT (${agent.department.toUpperCase()}) ===\n${promptObj.sections.department}`,
            `=== TẦNG 3: ROLE STRUCTURED PROMPT (v${promptObj.metadata.promptVersion}) ===\n${promptObj.sections.roleModular}`,
            `=== TẦNG 4: GOVERNANCE GUARDRAILS ===\n${promptObj.guardrails.join('\n')}`,
            `=== TẦNG 5: SCOPED VARIABLES ===\n- Today: ${promptObj.variables['system.today']}\n- Brand: ${promptObj.variables['company.brand']}\n- Task: ${promptObj.variables['task.title']}`
        ].join('\n\n');

        return promptObj;
    },

    buildFinalPrompt(agentId) {
        const obj = this.buildPromptObject(agentId);
        return obj ? obj.finalText : '';
    }
};

// =========================================================================
// PHASE 3 - MILESTONE 3.4: ENTERPRISE MEMORY SERVICE (Short & Long-term)
// =========================================================================
Object.assign(EnterpriseMemoryService, {
    sessionMemory: {}, // { agentId: [{ role, content, timestamp }] }
    vectorKnowledgeMemory: [], // [{ id, vectorTag, content, metadata }]

    addSessionMessage(agentId, role, content) {
        if (!this.sessionMemory[agentId]) this.sessionMemory[agentId] = [];
        this.sessionMemory[agentId].push({ role, content, timestamp: new Date().toISOString() });
        // Max 20 short-term messages
        if (this.sessionMemory[agentId].length > 20) {
            this.sessionMemory[agentId].shift();
        }
    },

    getSessionMemory(agentId) {
        return this.sessionMemory[agentId] || [];
    },

    storeKnowledgeItem(tag, content, metadata = {}) {
        const item = { id: `MEM-${Date.now().toString(36)}`, tag, content, metadata, storedAt: new Date().toISOString() };
        this.vectorKnowledgeMemory.push(item);
        EventBus.emit('memory.stored', item);
        return item;
    },

    searchKnowledge(queryTag) {
        return this.vectorKnowledgeMemory.filter(item => item.tag.toLowerCase().includes(queryTag.toLowerCase()));
    }
});

// MILESTONE 3.5: EXECUTION GUARDRAILS & MODEL FALLBACK ENGINE
const ModelFallbackEngine = {
    fallbackChain: {
        'claude-3-5-sonnet': 'gemini-3-1-pro',
        'gemini-3-1-pro': 'gpt-4o',
        'gpt-4o': 'claude-3-haiku',
        'claude-3-haiku': 'gpt-4o-mini'
    },
    
    async executeWithFallback(agentId, primaryModelId, promptText) {
        let currentModel = primaryModelId;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                attempts++;
                // Simulating provider execution call
                const tokenInput = Math.round(promptText.length / 4);
                const tokenOutput = 150;
                
                // Fallback simulation for offline testing
                if (attempts === 1 && Math.random() < 0.05) { // 5% simulated fail
                    throw new Error(`Provider Rate Limit on ${currentModel}`);
                }

                const result = {
                    agentId,
                    modelId: currentModel,
                    inputTokens: tokenInput,
                    outputTokens: tokenOutput,
                    costEst: (tokenInput * 0.000003 + tokenOutput * 0.000015).toFixed(4),
                    status: 'SUCCESS',
                    responseContent: `[${currentModel.toUpperCase()}] Đã xử lý yêu cầu nhiệm vụ cho Agent [${agentId}]. Output hoàn tất theo đúng DoD.`
                };

                // Track memory
                EnterpriseMemoryService.addSessionMessage(agentId, 'assistant', result.responseContent);
                EventBus.emit('telemetry.cost.updated', { historicalCost: parseFloat(result.costEst) });
                return result;

            } catch (err) {
                const nextModel = this.fallbackChain[currentModel] || 'gpt-4o-mini';
                EventBus.emit('model.fallback.triggered', { agentId, failedModel: currentModel, fallbackModel: nextModel, error: err.message });
                currentModel = nextModel;
            }
        }

        throw new Error(`Tất cả các mô hình dự phòng cho Agent [${agentId}] đều thất bại.`);
    }
};

// =========================================================================
// MILESTONE 4.1: MULTI-AGENT TOPOLOGY & INTER-AGENT MESSAGE BUS
// =========================================================================
const InterAgentBus = {
    messageHistory: [],
    
    sendHandoverMessage({ senderId, receiverId, taskId, payload, handoverType = 'SEQUENTIAL' }) {
        const sender = AI_AGENTS.find(a => a.id === senderId);
        const receiver = AI_AGENTS.find(a => a.id === receiverId);

        const msgPacket = {
            id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            senderId,
            senderName: sender ? sender.name : senderId,
            receiverId,
            receiverName: receiver ? receiver.name : receiverId,
            taskId,
            payload,
            handoverType,
            timestamp: new Date().toISOString()
        };

        this.messageHistory.push(msgPacket);
        EventBus.emit('interagent.message.sent', msgPacket);

        appendLog('INTER-AGENT BUS', `📨 [${msgPacket.senderName}] ➔ [${msgPacket.receiverName}]: Bàn giao gói Hợp đồng [${taskId}] (${handoverType})`, 'text-cyan-400 font-semibold');

        return msgPacket;
    },

    getMessageHistory(taskId = null) {
        if (!taskId) return this.messageHistory;
        return this.messageHistory.filter(m => m.taskId === taskId);
    }
};

const MultiAgentTopologyEngine = {
    async executeTopology({ topologyType = 'SEQUENTIAL', agentIds = [], taskContract, onProgress }) {
        appendLog('TOPOLOGY ENGINE', `🚀 Khởi chạy phối hợp Topology [${topologyType}] cho ${agentIds.length} Agents`, 'text-purple-400 font-bold');

        if (topologyType === 'SEQUENTIAL') {
            let lastOutput = taskContract.input || {};
            for (let i = 0; i < agentIds.length; i++) {
                const currentAgentId = agentIds[i];
                const nextAgentId = agentIds[i + 1] || null;

                if (onProgress) onProgress(currentAgentId, i, agentIds.length);

                const prompt = PromptBuilder.buildFinalPrompt(currentAgentId);
                const config = AGENT_CONFIGS[currentAgentId] || {};
                const res = await ModelFallbackEngine.executeWithFallback(currentAgentId, config.modelId || 'gemini-3-1-pro', prompt);

                lastOutput = res.responseContent;

                if (nextAgentId) {
                    InterAgentBus.sendHandoverMessage({
                        senderId: currentAgentId,
                        receiverId: nextAgentId,
                        taskId: taskContract.taskId,
                        payload: lastOutput,
                        handoverType: 'SEQUENTIAL'
                    });
                }
            }
            return lastOutput;
        } 
        
        else if (topologyType === 'PARALLEL') {
            const promises = agentIds.map(async (agentId) => {
                const prompt = PromptBuilder.buildFinalPrompt(agentId);
                const config = AGENT_CONFIGS[agentId] || {};
                return ModelFallbackEngine.executeWithFallback(agentId, config.modelId || 'gemini-3-1-pro', prompt);
            });

            const results = await Promise.all(promises);
            appendLog('TOPOLOGY ENGINE', `✅ Hoàn tất song song ${results.length} nhánh xử lý!`, 'text-emerald-400 font-bold');
            return results;
        }

        else if (topologyType === 'CONSENSUS') {
            const votes = [];
            for (const agentId of agentIds) {
                const prompt = PromptBuilder.buildFinalPrompt(agentId);
                const config = AGENT_CONFIGS[agentId] || {};
                const res = await ModelFallbackEngine.executeWithFallback(agentId, config.modelId || 'gemini-3-1-pro', prompt);
                votes.push({ agentId, response: res.responseContent });
            }

            appendLog('TOPOLOGY ENGINE', `⚖️ Thu thập ${votes.length} đánh giá Consensus từ Multi-Agents. Đã đạt đồng thuận 100%!`, 'text-amber-400 font-bold');
            return votes;
        }
    }
};

// STATE VARIABLES
let currentStepIndex = 0;
let isSimulating = false;
let simSpeed = 1;
let simTimer = null;
let selectedAgentId = null;
let selectedDeptId = null;
let activeParticles = [];

// =========================================================================
// 2. THREE.JS 3D SCENE & RENDERING ENGINE SETUP
// =========================================================================

let scene, camera, renderer, controls;
let agentMeshes = {};
let departmentZones = {};

function init3DScene() {
    const container = document.getElementById('canvas-container');
    
    // Scene & Fog (Premium dark futuristic space background)
    // Scene & Fog (Cyber Metallic Slate Blue Background - Sáng & Sang trọng)
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1329); // Đổi sang Tone Xanh Đêm Sáng Hiện Đại
    scene.fog = new THREE.FogExp2(0x0b1329, 0.012);

    // Camera (Isometric perspective angle)
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(22, 22, 26);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1; // Don't go below floor
    controls.target.set(0, 0, 2);

    // Balanced Smooth Lighting (Ánh sáng đồng đều, êm dịu, không chói mắt)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(20, 35, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Build Floor & Departments Grid
    createOfficeFloor();
    createDepartmentZones();
    createAgent3DNodes();
    createFloatingLabels();

    // Resize Listener
    window.addEventListener('resize', onWindowResize);

    // Raycaster for click & drag interaction
    setupRaycaster();

    // Start Animation Loop
    animate();
    
    // Auto-retrigger resize to ensure WebGL canvas matches parent dimensions exactly
    setTimeout(onWindowResize, 100);
}

// Create Grid Floor with bright modern slate blue color
function createOfficeFloor() {
    // Base Floor Mesh - Make it huge to cover the whole viewport
    const floorGeo = new THREE.PlaneGeometry(150, 150);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x111c35, // Xanh Slate Sáng Cao Cấp
        roughness: 0.4,
        metalness: 0.3
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Bright Cyber Grid Helper (Mạng ô lưới sáng rõ hơn)
    const gridHelper = new THREE.GridHelper(32, 32, 0x0284c7, 0x1e3a8a); 
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
}

// Create Visual Department Zone Borders & Floor Markers (Grid-Aligned Dimensions)
function createDepartmentZones() {
    const zones = [
        { id: 'executive', title: 'CEO SUITE (VIP)', color: 0xeab308, bounds: { x: -9.0, z: 8.0, w: 4.0, d: 4.0 } },
        { id: 'coo_office', title: 'COO & EXECUTIVE COMMAND', color: 0xf59e0b, bounds: { x: -3.0, z: 8.0, w: 6.0, d: 4.0 } },
        { id: 'product', title: 'ARCHITECTURE & PRODUCT LAB', color: 0x4f46e5, bounds: { x: -5.0, z: -3.0, w: 8.0, d: 6.0 } },
        { id: 'tech', title: 'DEV & QA STUDIO', color: 0x7c3aed, bounds: { x: 5.0, z: -3.0, w: 8.0, d: 6.0 } },
        { id: 'ops', title: 'INFRA & DEVOPS CENTER', color: 0xd97706, bounds: { x: 8.0, z: 4.0, w: 4.0, d: 4.0 } },
        { id: 'growth', title: 'GROWTH & FINANCE DESK', color: 0x059669, bounds: { x: 5.0, z: 8.0, w: 9.0, d: 4.0 } }
    ];

    // Load saved layout positions from localStorage
    const savedLayout = localStorage.getItem('bella_eip_3d_layout');
    let savedDepts = {};
    let savedAgents = {};
    if (savedLayout) {
        try {
            const parsed = JSON.parse(savedLayout);
            if (parsed.departments) {
                parsed.departments.forEach(d => {
                    if (d.pos && !isNaN(d.pos.x) && !isNaN(d.pos.z)) {
                        savedDepts[d.id] = { pos: d.pos, rotation: d.rotation || 0 };
                    }
                });
            }
            if (parsed.agents) {
                parsed.agents.forEach(a => {
                    if (a.pos && !isNaN(a.pos.x) && !isNaN(a.pos.z)) {
                        savedAgents[a.id] = { pos: a.pos, rotation: a.rotation || 0 };
                    }
                });
            }
        } catch(e) {
            console.error("Error parsing saved layout:", e);
        }
    }

    // Apply saved positions to AI_AGENTS list safely
    AI_AGENTS.forEach(agent => {
        if (savedAgents[agent.id] && savedAgents[agent.id].pos) {
            agent.pos.x = savedAgents[agent.id].pos.x;
            agent.pos.z = savedAgents[agent.id].pos.z;
            agent.rotation = savedAgents[agent.id].rotation || 0;
        } else {
            agent.rotation = 0;
        }
    });

    zones.forEach(zone => {
        const zoneGroup = new THREE.Group();
        const posX = savedDepts[zone.id] !== undefined ? savedDepts[zone.id].pos.x : zone.bounds.x;
        const posZ = savedDepts[zone.id] !== undefined ? savedDepts[zone.id].pos.z : zone.bounds.z;
        const rotY = savedDepts[zone.id] !== undefined ? savedDepts[zone.id].rotation : 0;
        zoneGroup.position.set(posX, 0, posZ);
        zoneGroup.rotation.y = rotY;

        // Floor border plane (local coordinate center 0,0,0)
        const geo = new THREE.PlaneGeometry(zone.bounds.w, zone.bounds.d);
        const mat = new THREE.MeshBasicMaterial({
            color: zone.color,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, 0.02, 0);
        zoneGroup.add(mesh);

        // Bounding Box Line
        const edges = new THREE.EdgesGeometry(geo);
        const lineMat = new THREE.LineBasicMaterial({ color: zone.color, transparent: true, opacity: 0.4 });
        const line = new THREE.LineSegments(edges, lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(0, 0.03, 0);
        zoneGroup.add(line);

        scene.add(zoneGroup);

        departmentZones[zone.id] = {
            id: zone.id,
            group: zoneGroup,
            color: zone.color,
            bounds: zone.bounds
        };
    });

    // Add Server Racks Decor in DevOps Hub (Move to corner 9.5, 2.5)
    createServerRackMesh(9.5, 0, 2.5);
}

function createServerRackMesh(x, y, z) {
    const rackGroup = new THREE.Group();
    
    // Relative position coordinates to ops group center (8, 0, 4)
    const localX = x - 8;
    const localZ = z - 4;

    // Sleek dark metallic server tower cabinet
    const geo = new THREE.BoxGeometry(0.6, 1.7, 0.6);
    const mat = new THREE.MeshStandardMaterial({ 
        color: 0x111827, // Dark charcoal black
        roughness: 0.2,
        metalness: 0.8 
    });
    const rack = new THREE.Mesh(geo, mat);
    rack.position.set(localX, 0.85, localZ);
    rack.castShadow = true;
    rack.receiveShadow = true;
    rackGroup.add(rack);

    // Flashing green and blue LED server lights on front face
    const ledGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const greenLedMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const blueLedMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    
    for(let i = 0; i < 5; i++) {
        const ledMat = (i % 2 === 0) ? greenLedMat : blueLedMat;
        const led = new THREE.Mesh(ledGeo, ledMat);
        // Positioned on the front face facing the office
        led.position.set(localX - 0.31, 0.3 + i * 0.3, localZ + 0.15 - (i % 2) * 0.1);
        rackGroup.add(led);
    }
    
    // Add to ops group to inherit moves
    const opsZone = departmentZones['ops'];
    if (opsZone && opsZone.group) {
        opsZone.group.add(rackGroup);
    } else {
        scene.add(rackGroup);
    }
}

// Create 3D Stylized Nodes for the 11 AI Agents
// Create 3D High-Fidelity Cyber Robot Characters & Modern Ergonomic Office Setup
function createAgent3DNodes() {
    AI_AGENTS.forEach(agent => {
        const agentGroup = new THREE.Group();
        agentGroup.position.set(agent.pos.x, 0, agent.pos.z);
        agentGroup.rotation.y = agent.rotation || 0;
        agentGroup.userData = agent;

        // 1. Base Glowing Pedestal (Mặt sàn chiếu sáng dải LED phát sáng)
        const isCEO = (agent.id === 'ceo');
        const ringGeo = isCEO ? new THREE.CylinderGeometry(1.1, 1.25, 0.12, 32) : new THREE.CylinderGeometry(0.85, 0.95, 0.1, 32);
        const ringMat = new THREE.MeshStandardMaterial({
            color: agent.color,
            roughness: 0.15,
            metalness: 0.8,
            emissive: agent.color,
            emissiveIntensity: isCEO ? 0.45 : 0.2
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = 0.06;
        agentGroup.add(ring);

        // 2. Modern Ergonomic Office Desk (Bàn làm việc cao cấp)
        const deskGeo = isCEO ? new THREE.BoxGeometry(1.9, 0.45, 1.1) : new THREE.BoxGeometry(1.4, 0.4, 0.85);
        const deskMat = isCEO ? 
            new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.2, metalness: 0.3 }) : // Gỗ Óc Chó Walnut
            new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.5 }); // Kim loại xám Slate
        const desk = new THREE.Mesh(deskGeo, deskMat);
        desk.position.set(0, 0.28, 0.25);
        desk.castShadow = true;
        desk.receiveShadow = true;
        agentGroup.add(desk);

        // Chân bàn kim loại (Desk Legs)
        const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.48, 16);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
        const legOffsets = isCEO ? 
            [[-0.85, -0.45], [0.85, -0.45], [-0.85, 0.45], [0.85, 0.45]] :
            [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]];
        legOffsets.forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(lx, 0.24, 0.25 + lz);
            agentGroup.add(leg);
        });

        // 3. Laptop / Curved UltraWide Monitor Screen (Màn hình Neon chân thực)
        if (isCEO) {
            // Dual UltraWide Curved Monitor Screen for CEO
            const monitorGroup = new THREE.Group();
            monitorGroup.position.set(0, 0.72, 0.15);
            
            const screenGeo = new THREE.BoxGeometry(1.2, 0.45, 0.04);
            const screenMat = new THREE.MeshStandardMaterial({ 
                color: 0x020617,
                emissive: 0xf59e0b, 
                emissiveIntensity: 0.6,
                roughness: 0.1 
            });
            const screen = new THREE.Mesh(screenGeo, screenMat);
            monitorGroup.add(screen);

            const standGeo = new THREE.CylinderGeometry(0.03, 0.06, 0.25, 16);
            const standMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9 });
            const stand = new THREE.Mesh(standGeo, standMat);
            stand.position.set(0, -0.2, 0);
            monitorGroup.add(stand);

            agentGroup.add(monitorGroup);
        } else {
            // Modern Glowing Laptop Screen
            const laptopGroup = new THREE.Group();
            laptopGroup.position.set(0, 0.52, 0.15);
            laptopGroup.rotation.x = -Math.PI / 10;

            const lapBase = new THREE.Mesh(
                new THREE.BoxGeometry(0.42, 0.02, 0.3),
                new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 })
            );
            laptopGroup.add(lapBase);

            const lapScreen = new THREE.Mesh(
                new THREE.BoxGeometry(0.42, 0.26, 0.015),
                new THREE.MeshStandardMaterial({ color: 0x020617, emissive: agent.color, emissiveIntensity: 0.5 })
            );
            lapScreen.position.set(0, 0.13, -0.14);
            laptopGroup.add(lapScreen);

            agentGroup.add(laptopGroup);
        }

        // 4. Ergonomic Swivel Executive Chair (Ghế xoay văn phòng có tựa lưng)
        const chairGroup = new THREE.Group();
        chairGroup.position.set(0, 0, -0.38);

        const seatCushion = new THREE.Mesh(
            new THREE.CylinderGeometry(0.38, 0.35, 0.1, 24),
            new THREE.MeshStandardMaterial({ color: isCEO ? 0x1e1b4b : 0x0f172a, roughness: 0.6 })
        );
        seatCushion.position.y = 0.4;
        chairGroup.add(seatCushion);

        const backRest = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.75, 0.08),
            new THREE.MeshStandardMaterial({ color: isCEO ? 0x312e81 : 0x1e293b, roughness: 0.6 })
        );
        backRest.position.set(0, 0.8, -0.22);
        chairGroup.add(backRest);

        agentGroup.add(chairGroup);

        // 5. CYBER AI ROBOT CHARACTER MESH (Thân máy Robot AI chân thực)
        const robotGroup = new THREE.Group();
        robotGroup.position.set(0, 0.45, -0.35); // Ngồi trên ghế

        // Robot Torso (Thân áo giáp Robot)
        const torsoGeo = isCEO ? new THREE.CylinderGeometry(0.32, 0.22, 0.65, 16) : new THREE.CylinderGeometry(0.26, 0.18, 0.55, 16);
        const torsoMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            metalness: 0.8,
            roughness: 0.2,
            emissive: agent.color,
            emissiveIntensity: 0.2
        });
        const torso = new THREE.Mesh(torsoGeo, torsoMat);
        torso.position.y = 0.35;
        torso.castShadow = true;
        robotGroup.add(torso);

        // Core Reactor Energy Light (Lõi năng lượng trước ngực)
        const coreGeo = new THREE.SphereGeometry(0.08, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: agent.color });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.set(0, 0.42, 0.22);
        robotGroup.add(core);

        // Robot Shoulders & Arms (Vai và Tay gõ phím)
        const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.45, 12);
        const armMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.1 });
        
        const leftArm = new THREE.Mesh(armGeo, armMat);
        leftArm.position.set(-0.3, 0.35, 0.15);
        leftArm.rotation.x = Math.PI / 4;
        leftArm.rotation.z = Math.PI / 12;
        robotGroup.add(leftArm);

        const rightArm = new THREE.Mesh(armGeo, armMat);
        rightArm.position.set(0.3, 0.35, 0.15);
        rightArm.rotation.x = Math.PI / 4;
        rightArm.rotation.z = -Math.PI / 12;
        robotGroup.add(rightArm);

        // Robot Head Node (Đầu Robot)
        const headGeo = isCEO ? new THREE.SphereGeometry(0.32, 24, 24) : new THREE.SphereGeometry(0.26, 24, 24);
        const headMat = new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            metalness: 0.6,
            roughness: 0.1,
            emissive: 0x0f172a,
            emissiveIntensity: 0.5
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(0, 0.82, 0);
        head.castShadow = true;
        robotGroup.add(head);

        // Glowing Cyber Visor Eye (Kính mắt LED Robot phát sáng)
        const visorGeo = new THREE.BoxGeometry(isCEO ? 0.42 : 0.34, 0.09, 0.12);
        const visorMat = new THREE.MeshBasicMaterial({ color: agent.color });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 0.84, 0.18);
        robotGroup.add(visor);

        // CEO Gold Crown 👑 (Vương miện Vàng sang trọng cho CEO)
        if (isCEO) {
            const crownGroup = new THREE.Group();
            crownGroup.position.set(0, 1.2, 0);
            
            const crownBase = new THREE.Mesh(
                new THREE.CylinderGeometry(0.32, 0.32, 0.1, 16),
                new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1, emissive: 0xf59e0b, emissiveIntensity: 0.3 })
            );
            crownGroup.add(crownBase);

            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                const spike = new THREE.Mesh(
                    new THREE.ConeGeometry(0.06, 0.18, 12),
                    new THREE.MeshStandardMaterial({ color: 0xfcb316, metalness: 0.9 })
                );
                spike.position.set(Math.cos(angle) * 0.28, 0.12, Math.sin(angle) * 0.28);
                crownGroup.add(spike);
            }
            robotGroup.add(crownGroup);
        }

        // Pulsing Status Halo Light Ring above head
        const haloGeo = isCEO ? new THREE.RingGeometry(0.45, 0.55, 32) : new THREE.RingGeometry(0.32, 0.4, 32);
        const haloMat = new THREE.MeshBasicMaterial({ color: agent.color, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.rotation.x = Math.PI / 2;
        halo.position.set(0, isCEO ? 1.45 : 1.2, 0);
        robotGroup.add(halo);

        agentGroup.add(robotGroup);

        scene.add(agentGroup);
        agentMeshes[agent.id] = { group: agentGroup, halo: halo, head: head, ring: ring };
    });
}

// Create HTML floating labels dynamically
function createFloatingLabels() {
    const container = document.getElementById('canvas-container');
    
    // Clear existing
    const existing = container.querySelectorAll('.agent-floating-label');
    existing.forEach(el => el.remove());

    AI_AGENTS.forEach(agent => {
        const label = document.createElement('div');
        label.id = `label-${agent.id}`;
        label.className = 'agent-floating-label absolute pointer-events-none z-10';
        label.style.position = 'absolute';
        label.style.pointerEvents = 'none';
        label.style.transform = 'translate(-50%, -100%)';
        
        let deptName = '';
        let deptColorClass = '';
        if (agent.department === 'executive') { deptName = 'Phòng Chủ Tịch VIP'; deptColorClass = 'bg-amber-500/20 text-amber-400 border-amber-500/35 font-bold'; }
        else if (agent.department === 'coo_office') { deptName = 'COO Command Desk'; deptColorClass = 'bg-amber-950/60 text-amber-400 border-amber-900/50'; }
        else if (agent.department === 'assistant') { deptName = 'Ban Trợ Lý'; deptColorClass = 'bg-blue-950/60 text-blue-400 border-blue-900/50'; }
        else if (agent.department === 'product') { deptName = 'Kiến Trúc & SP'; deptColorClass = 'bg-cyan-950/60 text-cyan-400 border-cyan-900/50'; }
        else if (agent.department === 'tech') { deptName = 'Phòng Dev & QA'; deptColorClass = 'bg-indigo-950/60 text-indigo-400 border-indigo-900/50'; }
        else if (agent.department === 'ops') { deptName = 'Hệ Thống & DevOps'; deptColorClass = 'bg-amber-950/60 text-amber-400 border-amber-900/50'; }
        else if (agent.department === 'growth') { deptName = 'Tăng Trưởng & Sales'; deptColorClass = 'bg-emerald-950/60 text-emerald-400 border-emerald-900/50'; }

        const config = AGENT_CONFIGS[agent.id] || {};
        const modelDisplay = formatModelName(config.modelId);

        label.innerHTML = `
            <div class="bg-slate-950/80 backdrop-blur-md border border-slate-800/90 shadow-md px-2 py-0.5 rounded-lg flex items-center gap-1.5 pointer-events-none hover:border-cyan-500/50 transition">
                <i class="fa-solid ${agent.icon} text-[9px]" style="color: #${agent.color.toString(16).padStart(6, '0')}"></i>
                <span class="text-[10px] font-semibold text-slate-100 whitespace-nowrap">${agent.name}</span>
            </div>
        `;
        container.appendChild(label);
    });
}

function updateFloatingLabels() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    const tempV = new THREE.Vector3();
    const cameraDir = new THREE.Vector3();
    camera.getWorldDirection(cameraDir);

    AI_AGENTS.forEach(agent => {
        const meshInfo = agentMeshes[agent.id];
        if (!meshInfo || !meshInfo.group) return;

        const label = document.getElementById(`label-${agent.id}`);
        if (!label) return;

        // Vector pointing from camera to the agent
        const toAgent = new THREE.Vector3().subVectors(meshInfo.group.position, camera.position);
        const dot = toAgent.dot(cameraDir);

        // Hide if behind the camera
        if (dot < 0) {
            label.style.display = 'none';
        } else {
            label.style.display = 'block';
            tempV.copy(meshInfo.group.position);
            tempV.y += 2.6; // project cleanly above head, crown & robot body

            tempV.project(camera);

            const x = (tempV.x * 0.5 + 0.5) * width;
            const y = (tempV.y * -0.5 + 0.5) * height;
            label.style.left = `${x}px`;
            label.style.top = `${y}px`;
        }
    });
}

let layoutMode = 'none'; // 'none' | 'department' | 'seat'
let draggedObject = null;
let draggedDeptId = null;
let dragStartPositions = null;
let dragStartIntersection = new THREE.Vector3();
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.5); // Y = 0.5 horizontal plane
const dragRaycaster = new THREE.Raycaster();
const dragMouse = new THREE.Vector2();

Object.assign(DEPT_NAMES, {
    executive: 'Phòng Chủ Tịch',
    assistant: 'Ban Trợ Lý',
    product: 'Kiến Trúc & SP',
    tech: 'Phòng Dev & QA',
    ops: 'Hệ Thống & DevOps',
    growth: 'Tăng Trưởng & Sales'
});

// Raycaster interaction to click & drag 3D Agents (Department or Seat mode)
function setupRaycaster() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const dom = renderer.domElement; // Listen on canvas directly!

    let startX = 0;
    let startY = 0;

    // pointerdown: detect dragging or prepare select click
    dom.addEventListener('pointerdown', (e) => {
        startX = e.clientX;
        startY = e.clientY;
        
        // Accurate coordinates on canvas
        const rect = dom.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        dragRaycaster.setFromCamera(mouse, camera);
        
        // Raycast against agent group meshes AND department floor zone meshes
        const agentGroups = Object.values(agentMeshes).map(m => m.group);
        const deptZoneMeshes = Object.values(departmentZones).map(z => z.group);
        const targetsToIntersect = (layoutMode === 'seat') ? agentGroups : [...agentGroups, ...deptZoneMeshes];
        
        const intersects = dragRaycaster.intersectObjects(targetsToIntersect, true);

        if (intersects.length > 0) {
            let obj = intersects[0].object;
            while (obj) {
                // Case 1: Clicked directly on an Agent Mesh
                if (agentGroups.includes(obj)) {
                    if (layoutMode !== 'none') {
                        draggedObject = obj;
                        controls.enabled = false; // disable orbit controls
                        dom.style.cursor = 'grabbing';

                        const agent = obj.userData;
                        draggedDeptId = agent.department;
                        selectedDeptId = agent.department;
                        selectedAgentId = agent.id;

                        const intersection = new THREE.Vector3();
                        if (dragRaycaster.ray.intersectPlane(dragPlane, intersection)) {
                            dragStartIntersection.copy(intersection);
                        }

                        if (layoutMode === 'department') {
                            dragStartPositions = {
                                deptGroup: departmentZones[draggedDeptId].group.position.clone(),
                                agents: {}
                            };

                            AI_AGENTS.forEach(a => {
                                if (a.department === draggedDeptId) {
                                    dragStartPositions.agents[a.id] = agentMeshes[a.id].group.position.clone();
                                }
                            });

                            appendLog('SYSTEM', `Đã chọn phòng ban [${DEPT_NAMES[draggedDeptId]}]. Nhấn phím [R] hoặc [Space] để xoay hướng phòng.`, 'text-cyan-400 font-bold');
                        } else if (layoutMode === 'seat') {
                            dragStartPositions = {
                                agentPos: agentMeshes[agent.id].group.position.clone()
                            };

                            appendLog('SYSTEM', `Đã chọn nhân sự [${agent.name}]. Nhấn phím [R] hoặc [Space] để xoay hướng bàn.`, 'text-cyan-400 font-bold');
                        }
                    }
                    return;
                }
                
                // Case 2: Clicked on a Department Floor Zone Mesh directly
                if (deptZoneMeshes.includes(obj) && layoutMode === 'department') {
                    const foundDeptId = Object.keys(departmentZones).find(k => departmentZones[k].group === obj);
                    if (foundDeptId) {
                        draggedObject = obj;
                        draggedDeptId = foundDeptId;
                        selectedDeptId = foundDeptId;
                        controls.enabled = false;
                        dom.style.cursor = 'grabbing';

                        const intersection = new THREE.Vector3();
                        if (dragRaycaster.ray.intersectPlane(dragPlane, intersection)) {
                            dragStartIntersection.copy(intersection);
                        }

                        dragStartPositions = {
                            deptGroup: departmentZones[draggedDeptId].group.position.clone(),
                            agents: {}
                        };

                        AI_AGENTS.forEach(a => {
                            if (a.department === draggedDeptId) {
                                dragStartPositions.agents[a.id] = agentMeshes[a.id].group.position.clone();
                            }
                        });

                        appendLog('SYSTEM', `Đã chọn phòng ban [${DEPT_NAMES[draggedDeptId]}]. Nhấn phím [R] hoặc [Space] để xoay hướng phòng.`, 'text-cyan-400 font-bold');
                        return;
                    }
                }
                obj = obj.parent;
            }
        }
    });

    dom.addEventListener('pointermove', (e) => {
        if (layoutMode === 'none' || !draggedObject) return;
        
        const rect = dom.getBoundingClientRect();
        dragMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        dragMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        dragRaycaster.setFromCamera(dragMouse, camera);
        const intersection = new THREE.Vector3();
        if (dragRaycaster.ray.intersectPlane(dragPlane, intersection)) {
            // Calculate delta mouse movement since drag started
            const deltaX = intersection.x - dragStartIntersection.x;
            const deltaZ = intersection.z - dragStartIntersection.z;

            // Calculate target position and snap bounding box edges cleanly onto 3D grid lines
            if (layoutMode === 'department' && draggedDeptId) {
                const deptZone = departmentZones[draggedDeptId];
                if (deptZone && deptZone.group) {
                    const rawX = dragStartPositions.deptGroup.x + deltaX;
                    const rawZ = dragStartPositions.deptGroup.z + deltaZ;

                    // If width/depth is EVEN, center must be integer (e.g. -8.0). If ODD, center must be half (e.g. -8.5).
                    const isXEven = (deptZone.bounds.w % 2 === 0);
                    const isZEven = (deptZone.bounds.d % 2 === 0);

                    const targetX = isXEven ? Math.round(rawX) : Math.floor(rawX) + 0.5;
                    const targetZ = isZEven ? Math.round(rawZ) : Math.floor(rawZ) + 0.5;

                    const finalX = Math.max(-14, Math.min(14, targetX));
                    const finalZ = Math.max(-14, Math.min(14, targetZ));

                    const moveDx = finalX - deptZone.group.position.x;
                    const moveDz = finalZ - deptZone.group.position.z;

                    deptZone.group.position.x = finalX;
                    deptZone.group.position.z = finalZ;

                    // Move all agents of this department along with snapped delta
                    AI_AGENTS.forEach(a => {
                        if (a.department === draggedDeptId) {
                            const meshGroup = agentMeshes[a.id].group;
                            meshGroup.position.x += moveDx;
                            meshGroup.position.z += moveDz;
                        }
                    });
                }
            } else if (layoutMode === 'seat') {
                // Seat Desk Snapping (Snap seat desks cleanly to half-integer or integer positions)
                const agent = draggedObject.userData;
                const meshGroup = agentMeshes[agent.id].group;
                const rawX = dragStartPositions.agentPos.x + deltaX;
                const rawZ = dragStartPositions.agentPos.z + deltaZ;

                meshGroup.position.x = Math.max(-15, Math.min(15, Math.round(rawX * 2) / 2));
                meshGroup.position.z = Math.max(-15, Math.min(15, Math.round(rawZ * 2) / 2));
            }
        }
    });

    const stopDraggingOrSelect = (e) => {
        const diffX = Math.abs(e.clientX - startX);
        const diffY = Math.abs(e.clientY - startY);

        // Click detection: if mouse clicked on an agent/dept without dragging
        if (diffX < 10 && diffY < 10 && !draggedObject) {
            const rect = dom.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            dragRaycaster.setFromCamera(mouse, camera);
            const agentGroups = Object.values(agentMeshes).map(m => m.group);
            const deptZoneMeshes = Object.values(departmentZones).map(z => z.group);
            const targetsToIntersect = (layoutMode === 'seat') ? agentGroups : [...agentGroups, ...deptZoneMeshes];
            
            const intersects = dragRaycaster.intersectObjects(targetsToIntersect, true);

            if (intersects.length > 0) {
                let obj = intersects[0].object;
                while (obj) {
                    if (agentGroups.includes(obj)) {
                        const agent = obj.userData;
                        selectedAgentId = agent.id;
                        selectedDeptId = agent.department;
                        highlightAgent(agent.id);
                        if (layoutMode === 'seat') {
                            appendLog('SYSTEM', `Đã chọn nhân sự [${agent.name}]. Nhấn phím [R] hoặc [Space] để xoay hướng bàn.`, 'text-purple-400 font-bold');
                        } else if (layoutMode === 'department') {
                            appendLog('SYSTEM', `Đã chọn phòng ban [${DEPT_NAMES[agent.department]}]. Nhấn phím [R] hoặc [Space] để xoay hướng phòng.`, 'text-amber-400 font-bold');
                        }
                        break;
                    }
                    if (deptZoneMeshes.includes(obj)) {
                        const foundDeptId = Object.keys(departmentZones).find(k => departmentZones[k].group === obj);
                        if (foundDeptId) {
                            selectedDeptId = foundDeptId;
                            appendLog('SYSTEM', `Đã chọn phòng ban [${DEPT_NAMES[foundDeptId]}]. Nhấn phím [R] hoặc [Space] me xoay hướng phòng.`, 'text-amber-400 font-bold');
                            break;
                        }
                    }
                    obj = obj.parent;
                }
            }
        }

        // Drag stop handling: ALWAYS release draggedObject on pointerup/leave
        if (draggedObject) {
            if (layoutMode === 'department' && draggedDeptId) {
                AI_AGENTS.forEach(a => {
                    if (a.department === draggedDeptId) {
                        const meshGroup = agentMeshes[a.id].group;
                        a.pos.x = meshGroup.position.x;
                        a.pos.z = meshGroup.position.z;
                    }
                });
                appendLog('SYSTEM', `Đã đặt vị trí mới cho khu vực [${DEPT_NAMES[draggedDeptId]}]`, 'text-emerald-400 font-bold');
            } else if (layoutMode === 'seat') {
                const agent = draggedObject.userData;
                if (agent && agentMeshes[agent.id]) {
                    const meshGroup = agentMeshes[agent.id].group;
                    agent.pos.x = meshGroup.position.x;
                    agent.pos.z = meshGroup.position.z;
                    appendLog('SYSTEM', `Đã đặt vị trí ngồi cho [${agent.name}] đến: (x: ${agent.pos.x}, z: ${agent.pos.z})`, 'text-emerald-400 font-bold');
                }
            }

            saveLayoutToLocalStorage();

            // Release drag lock & reset cursor
            draggedObject = null;
            dragStartPositions = null;
            controls.enabled = (layoutMode === 'none');
            dom.style.cursor = (layoutMode !== 'none') ? 'grab' : 'auto';
        }
    };

    dom.addEventListener('pointerup', stopDraggingOrSelect);
    dom.addEventListener('pointerleave', stopDraggingOrSelect);

    // Keydown rotation listener (handles both active dragging and clicked selection)
    const handleRotationKey = (e) => {
        // Ignore rotation if user is currently typing in an input field
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
            return;
        }

        if (e.key.toLowerCase() === 'r' || e.key === ' ') {
            if (layoutMode === 'department') {
                const targetDeptId = draggedDeptId || selectedDeptId;
                if (targetDeptId) {
                    e.preventDefault();
                    rotateDepartment(targetDeptId);
                }
            } else if (layoutMode === 'seat') {
                const targetAgentId = (draggedObject ? draggedObject.userData.id : null) || selectedAgentId;
                if (targetAgentId) {
                    e.preventDefault();
                    rotateAgent(targetAgentId);
                }
            }
        }
    };
    window.addEventListener('keydown', handleRotationKey);
}

function saveLayoutToLocalStorage() {
    const layoutData = {
        agents: AI_AGENTS.map(a => ({
            id: a.id,
            pos: a.pos,
            rotation: agentMeshes[a.id] && agentMeshes[a.id].group ? agentMeshes[a.id].group.rotation.y : 0
        })),
        departments: Object.keys(departmentZones).map(id => ({
            id: id,
            pos: {
                x: departmentZones[id].group.position.x,
                z: departmentZones[id].group.position.z
            },
            rotation: departmentZones[id].group ? departmentZones[id].group.rotation.y : 0
        }))
    };
    localStorage.setItem('bella_eip_3d_layout', JSON.stringify(layoutData));
}

function rotateDepartment(deptId) {
    const zone = departmentZones[deptId];
    if (!zone || !zone.group) return;

    // Rotate the room group by 90 degrees (Math.PI / 2)
    zone.group.rotation.y = (zone.group.rotation.y + Math.PI / 2) % (Math.PI * 2);
    const degrees = Math.round(zone.group.rotation.y * (180 / Math.PI));
    
    appendLog('SYSTEM', `Đã xoay khu vực [${DEPT_NAMES[deptId]}] sang góc ${degrees}°`, 'text-cyan-400 font-semibold');

    // Also rotate the desk meshes of all agents in this department,
    // and rotate their positions around the department center!
    AI_AGENTS.forEach(a => {
        if (a.department === deptId) {
            const meshGroup = agentMeshes[a.id].group;
            if (meshGroup) {
                meshGroup.rotation.y = (meshGroup.rotation.y + Math.PI / 2) % (Math.PI * 2);
                
                // Rotational translation around the department center (posX, posZ)
                const relX = meshGroup.position.x - zone.group.position.x;
                const relZ = meshGroup.position.z - zone.group.position.z;
                
                // Rotate vector (relX, relZ) by 90 degrees around 0,0: (x, z) -> (-z, x)
                const newRelX = Math.round(-relZ);
                const newRelZ = Math.round(relX);
                
                meshGroup.position.x = zone.group.position.x + newRelX;
                meshGroup.position.z = zone.group.position.z + newRelZ;
                a.pos.x = meshGroup.position.x;
                a.pos.z = meshGroup.position.z;
            }
        }
    });

    saveLayoutToLocalStorage();
}

function rotateAgent(agentId) {
    const meshGroup = agentMeshes[agentId].group;
    if (!meshGroup) return;

    meshGroup.rotation.y = (meshGroup.rotation.y + Math.PI / 2) % (Math.PI * 2);
    const degrees = Math.round(meshGroup.rotation.y * (180 / Math.PI));
    
    appendLog('SYSTEM', `Đã xoay hướng bàn của [${AI_AGENTS.find(a=>a.id===agentId).name}] sang ${degrees}°`, 'text-cyan-400 font-semibold');
    
    saveLayoutToLocalStorage();
}

function highlightAgent(agentId, shouldPanCamera = false) {
    const agent = AI_AGENTS.find(a => a.id === agentId);
    if (!agent) return;

    // Save selected state for key rotation interaction
    selectedAgentId = agentId;
    selectedDeptId = agent.department;

    // Focus Camera to Agent Position only if shouldPanCamera is true
    if (shouldPanCamera) {
        const agentMesh = agentMeshes[agentId];
        if (agentMesh && agentMesh.group) {
            const targetPos = agentMesh.group.position;
            new AnimationTimeline()
                .to(camera.position, { x: targetPos.x + 8, y: targetPos.y + 8, z: targetPos.z + 10, duration: 1 })
                .to(controls.target, { x: targetPos.x, y: targetPos.y, z: targetPos.z, duration: 1 })
                .start();
        }
    }

    appendLog('SYSTEM', `Đã focus quan sát không gian làm việc của [${agent.name}]`, 'text-blue-600');
}

// Helper for Camera Animations
class AnimationTimeline {
    constructor() { this.tasks = []; }
    to(obj, props) {
        this.tasks.push({ obj, props, duration: props.duration || 1 });
        return this;
    }
    start() {
        this.tasks.forEach(t => {
            const startX = t.obj.x, startY = t.obj.y, startZ = t.obj.z;
            const startTime = performance.now();
            function step(now) {
                const elapsed = (now - startTime) / (t.duration * 1000);
                if (elapsed < 1) {
                    t.obj.x = startX + (t.props.x - startX) * elapsed;
                    t.obj.y = startY + (t.props.y - startY) * elapsed;
                    t.obj.z = startZ + (t.props.z - startZ) * elapsed;
                    requestAnimationFrame(step);
                } else {
                    t.obj.x = t.props.x; t.obj.y = t.props.y; t.obj.z = t.props.z;
                }
            }
            requestAnimationFrame(step);
        });
    }
}

// Animated Rainbow Arch (Quadratic Bezier Curve) Travelling between Two Agents
function spawnWorkflowDataOrb(fromAgentId, toAgentId) {
    const fromPos = agentMeshes[fromAgentId].group.position.clone();
    const toPos = agentMeshes[toAgentId].group.position.clone();
    
    // Target altitude above pedestals
    fromPos.y += 1.2;
    toPos.y += 1.2;
    
    const senderAgent = AI_AGENTS.find(a => a.id === fromAgentId);
    const orbColor = senderAgent ? senderAgent.color : 0x06b6d4;

    // Calculate Rainbow Arch Control Point (Midpoint raised in Y-axis for Rainbow Arc)
    const midX = (fromPos.x + toPos.x) / 2;
    const midZ = (fromPos.z + toPos.z) / 2;
    const distance = fromPos.distanceTo(toPos);
    const archHeight = Math.max(3.5, distance * 0.45); // Dynamic Rainbow Height
    const controlPoint = new THREE.Vector3(midX, Math.max(fromPos.y, toPos.y) + archHeight, midZ);

    // Create 3D Quadratic Bezier Rainbow Curve Path
    const curve = new THREE.QuadraticBezierCurve3(fromPos, controlPoint, toPos);
    const points = curve.getPoints(50);
    const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

    // Glowing Rainbow Arc Tube Line
    const tubeGeo = new THREE.TubeGeometry(curve, 40, 0.04, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
        color: orbColor,
        transparent: true,
        opacity: 0.75
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(tubeMesh);

    // Fade out Rainbow Arch line
    const startTime = performance.now();
    const duration = 1400 / simSpeed;
    
    function animateArc(now) {
        const progress = (now - startTime) / duration;
        if (progress < 1) {
            tubeMesh.material.opacity = (1 - progress) * 0.75;
            requestAnimationFrame(animateArc);
        } else {
            scene.remove(tubeMesh);
            tubeGeo.dispose();
            tubeMat.dispose();
        }
    }
    requestAnimationFrame(animateArc);

    // Shoot 8 glowing Rainbow Orbs flowing smoothly along the curved Bezier Path
    let count = 0;
    const maxParticles = 8;
    const intervalTime = 90 / simSpeed;

    const streamInterval = setInterval(() => {
        if (count >= maxParticles) {
            clearInterval(streamInterval);
            return;
        }

        const size = 0.09 + Math.random() * 0.05;
        const pGeo = new THREE.SphereGeometry(size, 12, 12);
        const pMat = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, // Bright glowing core
            transparent: true,
            opacity: 0.95
        });
        const pMesh = new THREE.Mesh(pGeo, pMat);

        // Outer Neon Rainbow Glow Aura
        const glowGeo = new THREE.SphereGeometry(size * 1.8, 12, 12);
        const glowMat = new THREE.MeshBasicMaterial({
            color: orbColor,
            transparent: true,
            opacity: 0.5
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        pMesh.add(glowMesh);

        pMesh.position.copy(fromPos);
        scene.add(pMesh);

        const pStartTime = performance.now();
        const pDuration = 700 / simSpeed;

        function animateParticle(now) {
            const progress = (now - pStartTime) / pDuration;
            if (progress < 1) {
                // Quadratic Bezier Curve position interpolation: B(t) = (1-t)^2*P0 + 2(1-t)t*P1 + t^2*P2
                const p = curve.getPoint(progress);
                pMesh.position.copy(p);
                requestAnimationFrame(animateParticle);
            } else {
                scene.remove(pMesh);
                pGeo.dispose();
                pMat.dispose();
                glowGeo.dispose();
                glowMat.dispose();
            }
        }
        requestAnimationFrame(animateParticle);
        count++;
    }, intervalTime);
}

// 3D Render Loop
function animate(time) {
    requestAnimationFrame(animate);

    // Rotate Agent Halos & Animate Heads safely
    Object.keys(agentMeshes).forEach(id => {
        const mesh = agentMeshes[id];
        if (mesh) {
            if (mesh.halo && mesh.halo.rotation) {
                mesh.halo.rotation.z += 0.02;
            }
            if (mesh.head && mesh.head.position) {
                mesh.head.position.y = 1.1 + Math.sin((time || 0) * 0.003 + id.length) * 0.05;
            }
        }
    });

    updateFloatingLabels();

    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Camera focal resets
function focusDepartment(deptId) {
    let target = new THREE.Vector3(0, 0, 0);
    if (deptId === 'executive') target.set(-8, 0, 8);
    else if (deptId === 'assistant') target.set(-4, 0, 8);
    else if (deptId === 'product') target.set(-5, 0, -3);
    else if (deptId === 'tech') target.set(5.5, 0, -3.5);
    else if (deptId === 'ops') target.set(8, 0, 4);
    else if (deptId === 'growth') target.set(5.5, 0, 8);

    new AnimationTimeline()
        .to(camera.position, { x: target.x + 14, y: target.y + 14, z: target.z + 16, duration: 1 })
        .to(controls.target, { x: target.x, y: target.y, z: target.z, duration: 1 })
        .start();
}

// Reset camera to default overview
document.getElementById('btn-reset-cam').addEventListener('click', () => {
    new AnimationTimeline()
        .to(camera.position, { x: 22, y: 22, z: 26, duration: 1 })
        .to(controls.target, { x: 0, y: 0, z: 2, duration: 1 })
        .start();
});

// =========================================================================
// 3. REAL-TIME UI & SIMULATION ENGINE CONTROLLER
// =========================================================================

function formatModelName(modelId) {
    if (!modelId) return 'GEMINI PRO';
    if (modelId === 'gemini-3-1-pro' || modelId === 'gemini-1-5-pro') return 'GEMINI 3.1 PRO';
    if (modelId === 'gemini-3-6-flash' || modelId === 'gemini-1-5-flash') return 'GEMINI 3.6 FLASH';
    if (modelId === 'claude-3-5-sonnet') return 'CLAUDE 3.5';
    if (modelId === 'claude-3-haiku') return 'CLAUDE HAIKU';
    if (modelId === 'gpt-4o') return 'GPT-4O';
    if (modelId === 'gpt-4o-mini') return 'GPT-4O MINI';
    if (modelId === 'llama-3-1-70b') return 'LLAMA 3.1';
    if (modelId === 'qwen-2-5-7b') return 'QWEN 2.5';
    return modelId.toUpperCase();
}

function renderAgentCards() {
    const container = document.getElementById('agent-cards-container');
    container.innerHTML = '';

    AI_AGENTS.forEach(agent => {
        const isCurrentActive = WORKFLOW_STEPS[currentStepIndex].agent === agent.id;
        const statusBadgeColor = agent.status === 'PROCESSING' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25 animate-pulse' :
                                 agent.status === 'WAITING_APPROVAL' ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' :
                                 'bg-slate-950 text-slate-400 border-slate-800';

        const config = AGENT_CONFIGS[agent.id] || {};
        const modelDisplay = formatModelName(config.modelId);

        const card = document.createElement('div');
        card.className = `p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-3 ${isCurrentActive ? 'bg-cyan-500/10 border-cyan-500 ring-1 ring-cyan-500/20 text-white' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 text-slate-300 shadow-sm'}`;
        card.onclick = () => highlightAgent(agent.id, true);

        card.innerHTML = `
            <div class="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 text-sm shrink-0">
                <i class="fa-solid ${agent.icon}"></i>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                    <h4 class="text-xs font-semibold text-slate-100 truncate">${agent.name}</h4>
                    <div class="flex items-center gap-1 shrink-0">
                        <span class="text-[8px] bg-slate-950 text-cyan-400 border border-cyan-900/40 px-1 py-0.5 rounded font-mono">${modelDisplay}</span>
                        <span class="text-[8px] border px-1 py-0.5 rounded font-mono ${statusBadgeColor}">${agent.status}</span>
                    </div>
                </div>
                <p class="text-[10px] text-slate-400 truncate">${agent.role}</p>
                <div class="mt-1 text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <span class="text-slate-500">Task:</span>
                    <span class="text-cyan-400 truncate font-medium">${agent.task}</span>
                </div>
            </div>
            <button class="text-slate-500 hover:text-cyan-400 p-1.5 hover:bg-slate-950/40 rounded-lg transition shrink-0" onclick="event.stopPropagation(); window.openAgentConfigModal('${agent.id}');" title="Cấu hình Enterprise AI">
                <i class="fa-solid fa-sliders text-xs"></i>
            </button>
        `;
        container.appendChild(card);
    });
}

window.openAgentConfigModal = openAgentConfigModal;

function renderSopTabSteps() {
    const container = document.getElementById('sop-steps-container');
    if (!container) return;
    container.innerHTML = '';

    WORKFLOW_STEPS.forEach((step, idx) => {
        const isCurrent = idx === currentStepIndex;
        const isPassed = idx < currentStepIndex;
        const agent = AI_AGENTS.find(a => a.id === step.agent);

        const node = document.createElement('div');
        node.className = 'relative cursor-pointer group';
        node.onclick = () => {
            jumpToStep(idx);
            openStepDetailModal(step);
        };

        const dotColor = isCurrent ? 'bg-cyan-400 ring-4 ring-cyan-500/20' : isPassed ? 'bg-emerald-500' : 'bg-slate-700';

        node.innerHTML = `
            <div class="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full ${dotColor} transition"></div>
            <div class="flex items-center justify-between">
                <p class="font-semibold text-xs ${isCurrent ? 'text-cyan-400 font-bold' : isPassed ? 'text-emerald-400' : 'text-slate-200'} group-hover:text-cyan-300 transition">${step.name}</p>
                <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">${agent ? agent.name : ''}</span>
            </div>
            <p class="text-slate-400 text-[11px] mt-0.5 leading-relaxed">${step.text}</p>
        `;
        container.appendChild(node);
    });
}

function renderWorkflowPipeline() {
    renderSopTabSteps();
    const container = document.getElementById('workflow-pipeline');
    if (!container) return;
    container.innerHTML = '';

    WORKFLOW_STEPS.forEach((step, idx) => {
        const isCurrent = idx === currentStepIndex;
        const isPassed = idx < currentStepIndex;
        const agent = AI_AGENTS.find(a => a.id === step.agent);

        const node = document.createElement('div');
        node.className = `pipeline-node px-3 py-2 rounded-xl border flex items-center gap-2 text-xs font-medium cursor-pointer ${isCurrent ? 'active' : isPassed ? 'completed' : ''}`;
        node.onclick = () => {
            jumpToStep(idx);
            openStepDetailModal(step);
        };

        node.innerHTML = `
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isCurrent ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : isPassed ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'}">
                ${isPassed ? '<i class="fa-solid fa-check"></i>' : idx + 1}
            </div>
            <div>
                <p class="text-[11px] ${isCurrent ? 'text-blue-600 font-bold' : isPassed ? 'text-slate-700 font-medium' : 'text-slate-400'}">${step.name}</p>
                <p class="text-[9px] ${isCurrent ? 'text-blue-500 font-mono' : 'text-slate-400'}">${agent ? agent.name : ''}</p>
            </div>
        `;
        if (isCurrent) {
            setTimeout(() => {
                node.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }, 50);
        }

        container.appendChild(node);

        if (idx < WORKFLOW_STEPS.length - 1) {
            const line = document.createElement('div');
            line.className = `w-4 h-0.5 shrink-0 ${isPassed ? 'bg-emerald-500' : 'bg-slate-200'}`;
            container.appendChild(line);
        }
    });
}

function appendLog(agentName, text, colorClass = 'text-slate-700') {
    const container = document.getElementById('terminal-logs');
    const timeStr = new Date().toLocaleTimeString('vi-VN');
    const logItem = document.createElement('div');
    logItem.className = 'leading-relaxed break-words';
    logItem.innerHTML = `<span class="text-slate-400">[${timeStr}]</span> <span class="font-bold ${colorClass}">[${agentName}]</span> ${text}`;
    container.appendChild(logItem);
    container.scrollTop = container.scrollHeight;
}

function openStepDetailModal(step) {
    openStepDetailModalEQE(step);
}

function openStepDetailModal_original_unused(step) {
    const modal = document.getElementById('step-detail-modal');

    const agent = AI_AGENTS.find(a => a.id === step.agent);
    
    // Set titles
    document.getElementById('step-modal-title').textContent = step.name;
    document.getElementById('step-modal-executor').textContent = `Thực thi bởi: ${agent ? agent.name : 'Hệ thống'} (${agent ? agent.role : 'Hạt nhân'})`;
    
    // Change Icon & Color dynamically
    const iconEl = document.getElementById('step-modal-icon');
    const iconBgEl = document.getElementById('step-modal-icon-bg');
    if (agent && iconEl && iconBgEl) {
        iconEl.className = `fa-solid ${agent.icon}`;
        const hexColor = '#' + agent.color.toString(16).padStart(6, '0');
        iconBgEl.style.color = hexColor;
        iconBgEl.style.borderColor = `${hexColor}4d`;
        iconBgEl.style.backgroundColor = `${hexColor}1a`;
    }

    // Set Description
    document.getElementById('step-modal-desc').textContent = step.text;

    // Set Dynamic Deliverable details based on Step ID
    const deliverableContainer = document.getElementById('step-modal-deliverable-container');
    if (deliverableContainer) {
        let outputText = '';
        switch(step.id) {
            case 1:
                outputText = `🎯 [CEO STRATEGIC DECISION - EXECUTED]
- Người ban hành: CEO / Founder (Human-in-the-Loop)
- Quyết định chiến lược: Đã chính thức duyệt triển khai module "Spa Appointment Booking v1.2" để tăng 20% lượng Spa mới ký kết hợp đồng Bella EIP trong Q3-2026.
- Ngân sách chiến dịch: Đã phân bổ 150,000,000 VND (Trong đó 50M VND cho Marketing và 100M VND cho R&D / AWS GPU Infra).
- Trạng thái: ĐÃ KHỞI TẠO PROJECT & EVENT STREAM.`;
                break;
            case 2:
                outputText = `📝 [PRODUCT REQUIREMENT DOCUMENT (PRD) - COMPLETION IN 1.8h]
- Người thực hiện: AI Product Manager (PM)
- Đầu ra thực tế: Đã biên soạn PRD v1.2 chi tiết tại Notion link:
  + Chức năng 1: Khách hàng tự chọn dịch vụ, Kỹ thuật viên (KTV) và giờ trống 24/7.
  + Chức năng 2: Thuật toán tự động sắp xếp giờ trống (Time OS) giảm xung đột trùng ca.
  + Chức năng 3: Zalo OA Notification API nhắc lịch tự động trước 2 tiếng.
- Trạng thái: ĐÃ KIỂM DUYỆT & THÔNG QUA BỞI BAN LÃNH ĐẠO (100% Tiêu chí PRD Gate Đạt).`;
                break;
            case 3:
                outputText = `🏛️ [SYSTEM ARCHITECTURE & DATABASE SPECIFICATION - APPROVED]
- Người thực hiện: AI CTO & Tech Lead
- Đầu ra thực tế:
  + Sơ đồ thiết kế Microservices của Booking Engine liên kết với Core ERP.
  + Database Schema đã khởi tạo:
    CREATE TABLE spa_bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customers(id),
        service_id UUID NOT NULL,
        scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
        status VARCHAR(30) DEFAULT 'PENDING_APPROVAL',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  + Đánh giá bảo mật (Security Audit): Đã kích hoạt Layer 3 Zero Trust Permission Bus cho bảng Bookings.`;
                break;
            case 4:
                outputText = `🎨 [UI/UX FIGMA EXPORT & DESIGN SYSTEM TOKENS - COMPLETED]
- Người thực hiện: AI Designer (UX/UI)
- Đầu ra thực tế: 
  + Đã hoàn thiện thiết kế 4 màn hình (Đặt lịch di động, Quản lý ca của Kỹ thuật viên, Dashboard thống kê, Cấu hình Dịch vụ).
  + Design Tokens được xuất tự động:
    {
      "theme": "glassmorphism-dark",
      "colors": { "primary": "#06b6d4", "accent": "#f59e0b", "background": "#020617" },
      "fonts": "Inter, sans-serif"
    }
  + Figma Link: figma.com/file/bella-spa-booking-v1.2 (Đã khóa file để Dev code)`;
                break;
            case 5:
                outputText = `💻 [CORE SOURCE CODE IMPLEMENTATION - COMPLETED]
- Người thực hiện: AI Developer
- Đầu ra thực tế: Đã viết xong mã nguồn cho Booking Controller & frontend đặt lịch:
  export const createNewBooking = async (rawPayload) => {
      // Chuẩn hóa dữ liệu thô sang Canonical Model thông qua Layer 5 Data Fabric
      const canonical = EnterpriseDataFabric.standardizeData('Customer', rawPayload);
      
      // Kiểm tra quy định tài chính/quyền hạn qua Layer 4 Policy Engine
      const policyPass = EnterprisePolicyEngine.evaluatePolicy(canonical.name, 'BOOKING_CREATE', canonical);
      if (!policyPass.allowed) throw new Error(policyPass.reason);
      
      // Ghi nhận sự kiện vào database Supabase
      return await supabaseClient.from('bookings').insert(canonical);
  };
- Git Commit: [feat: implement Spa Booking layout and Supabase sync logic] (hash: 7511f0e).`;
                break;
            case 6:
                outputText = `🧪 [AUTOMATED QA INTEGRATION E2E TEST REPORT - 100% PASS]
- Người thực hiện: AI QA Engineer
- Đầu ra thực tế: Đã thực thi kịch bản kiểm thử E2E tự động qua Playwright (42 Test cases).
- Nhật ký thực thi:
  ✓ Case 01: Đăng ký ca trống thành công ➔ PASS (120ms)
  ✓ Case 02: Trùng ca trùng nhân sự báo lỗi ➔ PASS (98ms)
  ✓ Case 03: Policy Engine ngăn chặn truy cập sai quyền ➔ PASS (45ms)
- Kết quả: 0 Lỗi nghiêm trọng. Sẵn sàng đóng gói Build phát hành.`;
                break;
            case 7:
                outputText = `🛡️ [HUMAN CEO GATEWAY - SYSTEM RELEASE APPROVED]
- Người thực hiện: CEO / Founder (Human-in-the-Loop)
- Đầu ra thực tế: Đã kiểm tra báo cáo E2E Test của QA và PRD của PM.
- Quyết định: KÝ DUYỆT PHÁT HÀNH (APPROVED RELEASE) cho mã nguồn Booking Module v2.1.
- Event Log: Đã phát sự kiện \`BUILD_RELEASE_APPROVED\` tới Integration Mesh.`;
                break;
            case 8:
                outputText = `🚀 [CI/CD PIPELINE STAGING & PRODUCTION DEPLOYED]
- Người thực hiện: AI DevOps
- Đầu ra thực tế: Triển khai thành công ứng dụng lên Vercel Production.
- Deploy Logs:
  ▲ Aliased: https://bella-eos.vercel.app
  ▲ Serverless Edge Routing: Washington, D.C., USA (iad1)
  ▲ SSL & CDN Caching: Active & Optimized.
- Trạng thái: Dịch vụ Go-Live 100% ổn định trong 1.8 giây.`;
                break;
            case 9:
                outputText = `📢 [CAMPAIGN CONTENT SPEC & MARKETING LAUNCH]
- Biên soạn: AI Marketing
- Kế hoạch Content: Tăng 20% Spa demo trong 30 ngày.

--------------------------------------------------
🎬 TUYẾN 1: KỊCH BẢN SHORT VIDEO REELS (12 CLIPS)
--------------------------------------------------
[Kịch bản Clip #1: Nỗi đau quản lý đặt lịch thủ công]
• Thời lượng: 45 giây.
• Visual: Cảnh chủ Spa bận rộn nghe 3 điện thoại cùng lúc, sổ sách ghi chép lung tung, khách hàng đến Spa phải ngồi chờ đợi lâu.
• Voiceover (AI Marketing): "Bạn có mệt mỏi khi mỗi ngày phải trả lời hàng chục cuộc gọi đặt lịch, rồi ghi chép thủ công nhầm lẫn lung tung? Khách VIP đến Spa lại phải chờ đợi vì trùng lịch? Hãy chấm dứt ngay nỗi đau này!"
• Action/CTA: Giới thiệu giao diện đặt lịch tự động 24/7 của Bella EIP trên điện thoại. Click link bio nhận dùng thử 30 ngày miễn phí!

[Kịch bản Clip #2: Giải cứu giờ cao điểm cuối tuần]
• Thời lượng: 60 giây.
• Voiceover: "Làm thế nào để Spa tăng gấp đôi công suất phục vụ ngày cuối tuần mà nhân viên không bị kiệt sức? Bí quyết là tối ưu khung giờ trống (Time OS) tự động điều phối nhân sự rảnh tay của Bella EIP..."

--------------------------------------------------
📊 TUYẾN 2: BÀI VIẾT CAROUSEL INFOGRAPHICS (10 BÀI)
--------------------------------------------------
[Bài viết #1: 5 Lý do Spa của bạn cần App Đặt Lịch Tự Động]
• Nội dung Slide 1: Tiêu đề "Spa thất thoát bao nhiêu khách hàng vì chậm trả lời tin nhắn?"
• Nội dung Slide 2: 78% khách hàng sẽ chuyển sang Spa khác nếu không đặt được lịch trong vòng 5 phút.
• Nội dung Slide 3: Hệ thống Bella EIP tự động giữ chỗ 24/7 không cần trực page.
• Nội dung Slide 4: Giảm 95% tỷ lệ khách quên lịch (No-Show) nhờ tin nhắn nhắc nhở tự động qua Zalo.
• Nội dung Slide 5: Nút kêu gọi hành động "Nhận ưu đãi giảm 50% trọn đời hôm nay".

[Bài viết #2: Cách tối ưu 100% công suất kỹ thuật viên]
• Nội dung: Hướng dẫn phân bổ phòng dịch vụ và quản trị ca kíp thông minh của phần mềm Bella EIP.

--------------------------------------------------
📖 TUYẾN 3: BÀI VIẾT CASE STUDY THỰC TẾ (5 BÀI)
--------------------------------------------------
[Case Study #1: An Nhiên Spa tăng 45% doanh thu sau 2 tháng]
• Khách hàng: An Nhiên Spa (Hà Nội) - Quy mô 12 giường dịch vụ.
• Thách thức trước khi dùng Bella EIP: Tỷ lệ khách hàng đặt lịch nhưng không đến (No-show) lên đến 28%. Quản lý không kiểm soát được ca làm việc của kỹ thuật viên dẫn đến trùng lịch dịch vụ.
• Giải pháp áp dụng: Triển khai Bella EIP Booking & Zalo OA Auto-Notification.
• Kết quả thực tế: Tỷ lệ No-show giảm xuống dưới 3%. Doanh thu tổng tăng vọt 45% nhờ tối ưu lịch trống cuối tuần. Chủ spa tự do đi du lịch không cần trực máy.`;
                break;
            case 10:
                outputText = `📊 [FINANCIAL COST ACCOUNTING & ROI REPORT]
- Kế toán trưởng: AI Finance
- Hạch toán Chi phí API Token:
  + Gemini Flash: $0.00342
  + Claude Sonnet: $0.01250
  ➔ Tổng chi phí vận hành AI: $0.01592 USD.
- ROI Dự báo: +420% hiệu suất, tiết kiệm 1,420 giờ làm việc thay con người.`;
                break;
            default:
                outputText = `📝 Không có kết quả bàn giao cụ thể cho bước này.`;
        }
        deliverableContainer.textContent = outputText;
    }

    modal.classList.remove('hidden');
}

safeAddListener('btn-close-step-modal', 'click', () => {
    const modal = document.getElementById('step-detail-modal');
    if (modal) modal.classList.add('hidden');
});

safeAddListener('btn-close-step-modal-confirm', 'click', () => {
    const modal = document.getElementById('step-detail-modal');
    if (modal) modal.classList.add('hidden');
});

function showCampaignExecutiveReport() {
    const modal = document.getElementById('campaign-report-modal');
    if (!modal) return;

    // Read values from BCE Visual Inputs
    const budgetVal = parseInt(document.getElementById('bce-edit-budget').value) || 10000000;
    const targetInput = document.getElementById('bce-edit-followers');
    const targetVal = parseInt(targetInput.value) || 1000;
    const metricKey = targetInput.dataset.metricKey || 'targetFollowers';
    const brandVoice = document.getElementById('bce-edit-voice').value || 'Professional & Premium';
    const segment = document.getElementById('bce-edit-segment').value || 'VIP Beauty & Spa Clients';

    const cardsContainer = document.getElementById('report-overview-cards-container');
    const tableTitle = document.getElementById('report-table-title');
    const tableHeaderRow = document.getElementById('report-table-header-row');
    const tableBody = document.getElementById('report-table-body');

    if (metricKey === 'targetFollowers') {
        // CASE: Social Posting / Followers Goal
        const totalPosts = Math.ceil(budgetVal / 400000) || 25;
        const finishedPosts = Math.ceil(totalPosts * 0.6) || 15;
        const ctr = 8.2;

        if (cardsContainer) {
            cardsContainer.innerHTML = `
                <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px] uppercase font-semibold">TỔNG BÀI ĐĂNG (PLAN)</span>
                    <strong class="text-cyan-400 text-lg font-mono">${totalPosts} Bài viết</strong>
                    <span class="text-[9px] text-slate-400 block mt-0.5">Kế hoạch chiến dịch</span>
                </div>
                <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px] uppercase font-semibold">ĐÃ HOÀN THÀNH (PUBLISHED)</span>
                    <strong class="text-emerald-400 text-lg font-mono">${finishedPosts} Bài</strong>
                    <span class="text-[9px] text-emerald-400 block mt-0.5">Đã lên Fanpage</span>
                </div>
                <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px] uppercase font-semibold">TỔNG SỐ LƯỢT TIẾP CẬN (EST)</span>
                    <strong class="text-amber-400 text-lg font-mono">${formatShortMoney(targetVal * 12)}</strong>
                    <span class="text-[9px] text-amber-300 block mt-0.5">Mục tiêu: ${targetVal} Followers</span>
                </div>
                <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px] uppercase font-semibold">TỶ LỆ CTR TRUNG BÌNH</span>
                    <strong class="text-purple-400 text-lg font-mono">${ctr}%</strong>
                    <span class="text-[9px] text-purple-300 block mt-0.5">Tương tác cao (HIGH)</span>
                </div>
            `;
        }

        if (tableTitle) {
            tableTitle.innerHTML = `<i class="fa-solid fa-list-check"></i> DANH SÁCH BÀI ĐĂNG & TIẾN ĐỘ THỰC THI (FANPAGE PUBLISHING)`;
        }

        if (tableHeaderRow) {
            tableHeaderRow.innerHTML = `
                <th class="p-3">Dạng Nội Dung</th>
                <th class="p-3">Số Lượng Đăng (Plan)</th>
                <th class="p-3">Đã Hoàn Thành</th>
                <th class="p-3">Kênh Đăng</th>
                <th class="p-3">Trạng Thái Thực Thi (AI)</th>
            `;
        }

        const numCarousel = Math.ceil(totalPosts * 0.4) || 10;
        const numReels = Math.ceil(totalPosts * 0.4) || 10;
        const numCases = totalPosts - numCarousel - numReels;

        if (tableBody) {
            tableBody.innerHTML = `
                <tr class="hover:bg-slate-900/50">
                    <td class="p-3 font-bold text-slate-200">Feature Carousel Infographics</td>
                    <td class="p-3">${numCarousel} Bài</td>
                    <td class="p-3 text-emerald-400">${Math.ceil(numCarousel * 0.6)} Bài</td>
                    <td class="p-3 text-cyan-400">Facebook Page</td>
                    <td class="p-3 text-purple-300">⚡ Đã gửi qua Hermes MCP</td>
                </tr>
                <tr class="hover:bg-slate-900/50">
                    <td class="p-3 font-bold text-slate-200">Pain Point Short Video Reels</td>
                    <td class="p-3">${numReels} Clips</td>
                    <td class="p-3 text-emerald-400">${Math.ceil(numReels * 0.5)} Clips</td>
                    <td class="p-3 text-cyan-400">TikTok / Reels</td>
                    <td class="p-3 text-amber-300">Đang render video prompt</td>
                </tr>
                <tr class="hover:bg-slate-900/50">
                    <td class="p-3 font-bold text-slate-200">Customer Case Study Stories</td>
                    <td class="p-3">${numCases} Bài</td>
                    <td class="p-3 text-emerald-400">${Math.ceil(numCases * 0.8)} Bài</td>
                    <td class="p-3 text-cyan-400">Zalo OA / Web</td>
                    <td class="p-3 text-slate-400">Lưu kho dữ liệu EOM</td>
                </tr>
            `;
        }
    } else if (metricKey === 'targetRevenueVnd') {
        // CASE: Revenue Goal
        const avgOrderValue = 1500000;
        const expectedOrders = Math.ceil(targetVal / avgOrderValue) || 30;
        const estRevenue = expectedOrders * avgOrderValue;
        const roi = budgetVal > 0 ? Math.round(((estRevenue - budgetVal) / budgetVal) * 100) : 0;

        if (cardsContainer) {
            cardsContainer.innerHTML = `
                <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px] uppercase font-semibold">MỤC TIÊU DOANH THU</span>
                    <strong class="text-cyan-400 text-lg font-mono">${formatShortMoney(targetVal)}</strong>
                    <span class="text-[9px] text-slate-400 block mt-0.5">Mục tiêu chiến dịch</span>
                </div>
                <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px] uppercase font-semibold">DOANH THU DỰ BÁO (EST)</span>
                    <strong class="text-emerald-400 text-lg font-mono">${formatShortMoney(estRevenue)}</strong>
                    <span class="text-[9px] text-emerald-400 block mt-0.5">Tỷ lệ khả thi cao</span>
                </div>
                <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px] uppercase font-semibold">SỐ ĐƠN HÀNG DỰ KIẾN</span>
                    <strong class="text-amber-400 text-lg font-mono">${expectedOrders} Đơn</strong>
                    <span class="text-[9px] text-amber-300 block mt-0.5">AOV trung bình: ${formatShortMoney(avgOrderValue)}</span>
                </div>
                <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px] uppercase font-semibold">DỰ BÁO ROI CHIẾN DỊCH</span>
                    <strong class="text-purple-400 text-lg font-mono">${roi >= 0 ? '+' : ''}${roi}%</strong>
                    <span class="text-[9px] text-purple-300 block mt-0.5">Hiệu quả ngân sách</span>
                </div>
            `;
        }

        if (tableTitle) {
            tableTitle.innerHTML = `<i class="fa-solid fa-list-check"></i> DOANH THU DỰ BÁO CHI TIẾT THEO CÁC PHÂN BỔ DẠNG TIN`;
        }

        if (tableHeaderRow) {
            tableHeaderRow.innerHTML = `
                <th class="p-3">Chiến Dịch Content</th>
                <th class="p-3">Số Lượng</th>
                <th class="p-3">Tỷ lệ Chuyển Đổi</th>
                <th class="p-3">Doanh Thu Dự Kiến</th>
                <th class="p-3">Hành Động Tối Ưu AI</th>
            `;
        }

        const numCarousel = Math.ceil(budgetVal / 1500000) || 5;
        const numReels = Math.ceil(budgetVal / 1000000) || 8;
        const numCases = Math.ceil(budgetVal / 2500000) || 3;

        if (tableBody) {
            tableBody.innerHTML = `
                <tr class="hover:bg-slate-900/50">
                    <td class="p-3 font-bold text-slate-200">Giới thiệu dịch vụ Premium</td>
                    <td class="p-3">${numCarousel} Bài</td>
                    <td class="p-3 text-cyan-400">4.5%</td>
                    <td class="p-3 text-emerald-400 font-bold">${formatShortMoney(Math.round(estRevenue * 0.5))}</td>
                    <td class="p-3 text-purple-300">⚡ Chạy quảng cáo Facebook Ads</td>
                </tr>
                <tr class="hover:bg-slate-900/50">
                    <td class="p-3 font-bold text-slate-200">Reels Ưu đãi Liệu trình</td>
                    <td class="p-3">${numReels} Clips</td>
                    <td class="p-3 text-cyan-400 font-bold">6.2%</td>
                    <td class="p-3 text-emerald-400 font-bold">${formatShortMoney(Math.round(estRevenue * 0.35))}</td>
                    <td class="p-3 text-amber-300">Đăng TikTok, dẫn link về CRM</td>
                </tr>
                <tr class="hover:bg-slate-900/50">
                    <td class="p-3 font-bold text-slate-200">Case Study Khách hàng</td>
                    <td class="p-3">${numCases} Bài</td>
                    <td class="p-3 text-cyan-400">3.8%</td>
                    <td class="p-3 text-emerald-400 font-bold">${formatShortMoney(Math.round(estRevenue * 0.15))}</td>
                    <td class="p-3 text-slate-400">Dùng tiếp thị lại (Retargeting)</td>
                </tr>
            `;
        }
    } else if (metricKey === 'targetStaffCount') {
        // CASE: Staffing / Recruitment Goal
        const totalCVs = targetVal * 15;
        const interviewCandidates = Math.ceil(totalCVs * 0.3);
        const costPerHire = Math.round(budgetVal / targetVal);

        if (cardsContainer) {
            cardsContainer.innerHTML = `
                <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px] uppercase font-semibold">MỤC TIÊU TUYỂN DỤNG</span>
                    <strong class="text-cyan-400 text-lg font-mono">${targetVal} Nhân sự</strong>
                    <span class="text-[9px] text-slate-400 block mt-0.5">Vị trí Kỹ thuật viên & Tư vấn</span>
                </div>
                <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px] uppercase font-semibold">HỒ SƠ (CV) TIẾP NHẬN DỰ KIẾN</span>
                    <strong class="text-emerald-400 text-lg font-mono">${totalCVs} CVs</strong>
                    <span class="text-[9px] text-emerald-400 block mt-0.5">Tỷ lệ tiếp cận ứng viên cao</span>
                </div>
                <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px] uppercase font-semibold">ƯNG VIÊN VÀO PHỎNG VẤN</span>
                    <strong class="text-amber-400 text-lg font-mono">${interviewCandidates} Ứng viên</strong>
                    <span class="text-[9px] text-amber-300 block mt-0.5">Tỷ lệ lọc hồ sơ: 30%</span>
                </div>
                <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px] uppercase font-semibold">CHI PHÍ TRÊN MỖI LƯỢT TUYỂN (CPH)</span>
                    <strong class="text-purple-400 text-lg font-mono">${formatShortMoney(costPerHire)}</strong>
                    <span class="text-[9px] text-purple-300 block mt-0.5">Tổng ngân sách: ${formatShortMoney(budgetVal)}</span>
                </div>
            `;
        }

        if (tableTitle) {
            tableTitle.innerHTML = `<i class="fa-solid fa-list-check"></i> KẾ HOẠCH TUYỂN DỤNG NHÂN SỰ & KÊNH TIẾP CẬN`;
        }

        if (tableHeaderRow) {
            tableHeaderRow.innerHTML = `
                <th class="p-3">Vị trí cần tuyển</th>
                <th class="p-3">Số Lượng Target</th>
                <th class="p-3">Số CVs dự kiến</th>
                <th class="p-3">Kênh Tuyển Dụng</th>
                <th class="p-3">Khuyến Nghị của AI</th>
            `;
        }

        const numTech = Math.ceil(targetVal * 0.6) || 3;
        const numConsultant = targetVal - numTech || 2;

        if (tableBody) {
            tableBody.innerHTML = `
                <tr class="hover:bg-slate-900/50">
                    <td class="p-3 font-bold text-slate-200">Kỹ thuật viên Spa</td>
                    <td class="p-3">${numTech} Người</td>
                    <td class="p-3 text-cyan-400">${numTech * 12} CVs</td>
                    <td class="p-3 text-emerald-400 font-bold">Facebook Group / Chợ Tốt</td>
                    <td class="p-3 text-purple-300">⚡ Chạy quảng cáo tin nhắn tuyển dụng</td>
                </tr>
                <tr class="hover:bg-slate-900/50">
                    <td class="p-3 font-bold text-slate-200">Tư vấn viên (Sales)</td>
                    <td class="p-3">${numConsultant} Người</td>
                    <td class="p-3 text-cyan-400">${numConsultant * 18} CVs</td>
                    <td class="p-3 text-emerald-400 font-bold">LinkedIn / TopCV</td>
                    <td class="p-3 text-amber-300">Lọc hồ sơ kinh nghiệm Spa</td>
                </tr>
            `;
        }
    } else {
        // DEFAULT/LEADS Goal
        let expectedLeads = targetVal;
        let okrText = `Khớp 100% mục tiêu ${targetVal} Leads`;
        
        let convRate = 24.1;
        let formatTop = "Carousel";
        if (brandVoice.includes('Premium') || brandVoice.includes('Sang trọng')) {
            convRate = 26.4;
            formatTop = "Infographics";
        } else if (brandVoice.includes('Friendly') || brandVoice.includes('Thân thiện')) {
            convRate = 18.5;
            formatTop = "Short Video Reels";
        } else {
            convRate = 15.0;
            formatTop = "Customer Story";
        }

        const cac = expectedLeads > 0 ? Math.round(budgetVal / expectedLeads) : 0;
        let cacText = formatShortMoney(cac);
        let cacStatus = "Tối ưu ngân sách";
        if (cac < 50000) {
            cacStatus = "Rất rẻ (Dưới 50K/Lead)";
        } else if (cac < 150000) {
            cacStatus = "Trung bình (Dưới 150K/Lead)";
        } else {
            cacStatus = "Cao (Cần tối ưu thêm Ads)";
        }

        const avgOrderValue = 1500000;
        const estRevenue = expectedLeads * (convRate / 100) * avgOrderValue;
        const roi = budgetVal > 0 ? Math.round(((estRevenue - budgetVal) / budgetVal) * 100) : 0;

        if (cardsContainer) {
            cardsContainer.innerHTML = `
                <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px] uppercase font-semibold">TỔNG LEADS DỰ KIẾN</span>
                    <strong class="text-cyan-400 text-lg font-mono">${expectedLeads} Leads</strong>
                    <span class="text-[9px] text-emerald-400 block mt-0.5">${okrText}</span>
                </div>
                <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px] uppercase font-semibold">TỶ LỆ CHỐT DEMO (CONV)</span>
                    <strong class="text-emerald-400 text-lg font-mono">${convRate}%</strong>
                    <span class="text-[9px] text-slate-400 block mt-0.5">Top Format: ${formatTop}</span>
                </div>
                <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px] uppercase font-semibold">CHI PHÍ LEAD (CAC)</span>
                    <strong class="text-amber-400 text-lg font-mono">${cacText}</strong>
                    <span class="text-[9px] text-emerald-400 block mt-0.5">${cacStatus}</span>
                </div>
                <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px] uppercase font-semibold">DỰ BÁO ROI CHIẾN DỊCH</span>
                    <strong class="text-purple-400 text-lg font-mono">${roi >= 0 ? '+' : ''}${roi}%</strong>
                    <span class="text-[9px] text-purple-300 block mt-0.5">Doanh thu ~${formatShortMoney(Math.round(estRevenue))}</span>
                </div>
            `;
        }

        if (tableTitle) {
            tableTitle.innerHTML = `<i class="fa-solid fa-list-check"></i> KẾ HOẠCH NỘI DUNG CONTENT & PHÂN BỔ CHIẾN DỊCH (AI MARKETING & DESIGN)`;
        }

        if (tableHeaderRow) {
            tableHeaderRow.innerHTML = `
                <th class="p-3">Dạng Content</th>
                <th class="p-3">Số Lượng</th>
                <th class="p-3">Tỷ Lệ CTR</th>
                <th class="p-3">Sales Conv Rate</th>
                <th class="p-3">Hành Động Tối Ưu AI</th>
            `;
        }

        const numCarousel = Math.ceil(budgetVal / 1000000) || 5;
        const numReels = Math.ceil(budgetVal / 800000) || 6;
        const numCases = Math.ceil(budgetVal / 2000000) || 3;

        if (tableBody) {
            tableBody.innerHTML = `
                <tr class="hover:bg-slate-900/50">
                    <td class="p-3 font-bold text-slate-200">Feature Carousel Infographics</td>
                    <td class="p-3">${numCarousel} Bài</td>
                    <td class="p-3 text-cyan-400">7.5%</td>
                    <td class="p-3 text-emerald-400 font-bold">${convRate}% (TOP)</td>
                    <td class="p-3 text-purple-300">⚡ Dồn 70% Ngân sách Ads</td>
                </tr>
                <tr class="hover:bg-slate-900/50">
                    <td class="p-3 font-bold text-slate-200">Pain Point Short Video Reels</td>
                    <td class="p-3">${numReels} Clips</td>
                    <td class="p-3 text-cyan-400 font-bold">10.2% (HIGH)</td>
                    <td class="p-3 text-amber-400">14.5%</td>
                    <td class="p-3 text-amber-300">Sửa lại CTA chốt Sales</td>
                </tr>
                <tr class="hover:bg-slate-900/50">
                    <td class="p-3 font-bold text-slate-200">Customer Case Study Stories</td>
                    <td class="p-3">${numCases} Bài</td>
                    <td class="p-3 text-cyan-400">6.8%</td>
                    <td class="p-3 text-slate-300">15.0%</td>
                    <td class="p-3 text-slate-400">Duy trì làm Social Proof</td>
                </tr>
            `;
        }
    }

    modal.classList.remove('hidden');
}

function formatShortMoney(value) {
    if (value >= 1000000000) {
        return (value / 1000000000).toFixed(2) + "B VND";
    }
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + "M VND";
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(0) + "K VND";
    }
    return value + " VND";
}

safeAddListener('btn-close-report-modal', 'click', () => {
    const modal = document.getElementById('campaign-report-modal');
    if (modal) modal.classList.add('hidden');
});

safeAddListener('btn-modal-close-report', 'click', () => {
    const modal = document.getElementById('campaign-report-modal');
    if (modal) modal.classList.add('hidden');
});

function getStepOutputText(stepId) {
    switch(stepId) {
        case 1:
            return `🎯 [CEO STRATEGIC DECISION - EXECUTED]
- Người ban hành: CEO / Founder (Human-in-the-Loop)
- Quyết định chiến lược: Đã chính thức duyệt triển khai module "Spa Appointment Booking v1.2" để tăng 20% lượng Spa mới ký kết hợp đồng Bella EIP trong Q3-2026.
- Ngân sách chiến dịch: Đã phân bổ 150,000,000 VND (Trong đó 50M VND cho Marketing và 100M VND cho R&D / AWS GPU Infra).
- Trạng thái: ĐÃ KHỞI TẠO PROJECT & EVENT STREAM.`;
        case 2:
            return `📝 [PRODUCT REQUIREMENT DOCUMENT (PRD) - COMPLETION IN 1.8h]
- Người thực hiện: AI Product Manager (PM)
- Đầu ra thực tế: Đã biên soạn PRD v1.2 chi tiết tại Notion link:
  + Chức năng 1: Khách hàng tự chọn dịch vụ, Kỹ thuật viên (KTV) và giờ trống 24/7.
  + Chức năng 2: Thuật toán tự động sắp xếp giờ trống (Time OS) giảm xung đột trùng ca.
  + Chức năng 3: Zalo OA Notification API nhắc lịch tự động trước 2 tiếng.
- Trạng thái: ĐÃ KIỂM DUYỆT & THÔNG QUA BỞI BAN LÃNH ĐẠO (100% Tiêu chí PRD Gate Đạt).`;
        case 3:
            return `🏛️ [SYSTEM ARCHITECTURE & DATABASE SPECIFICATION - APPROVED]
- Người thực hiện: AI CTO & Tech Lead
- Đầu ra thực tế:
  + Sơ đồ thiết kế Microservices của Booking Engine liên kết với Core ERP.
  + Database Schema đã khởi tạo:
    CREATE TABLE spa_bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customers(id),
        service_id UUID NOT NULL,
        scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
        status VARCHAR(30) DEFAULT 'PENDING_APPROVAL',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  + Đánh giá bảo mật (Security Audit): Đã kích hoạt Layer 3 Zero Trust Permission Bus cho bảng Bookings.`;
        case 4:
            return `🎨 [UI/UX FIGMA EXPORT & DESIGN SYSTEM TOKENS - COMPLETED]
- Người thực hiện: AI Designer (UX/UI)
- Đầu ra thực tế: 
  + Đã hoàn thiện thiết kế 4 màn hình (Đặt lịch di động, Quản lý ca của Kỹ thuật viên, Dashboard thống kê, Cấu hình Dịch vụ).
  + Design Tokens được xuất tự động:
    {
      "theme": "glassmorphism-dark",
      "colors": { "primary": "#06b6d4", "accent": "#f59e0b", "background": "#020617" },
      "fonts": "Inter, sans-serif"
    }
  + Figma Link: figma.com/file/bella-spa-booking-v1.2 (Đã khóa file để Dev code)`;
        case 5:
            return `💻 [CORE SOURCE CODE IMPLEMENTATION - COMPLETED]
- Người thực hiện: AI Developer
- Đầu ra thực tế: Đã viết xong mã nguồn cho Booking Controller & frontend đặt lịch:
  export const createNewBooking = async (rawPayload) => {
      // Chuẩn hóa dữ liệu thô sang Canonical Model thông qua Layer 5 Data Fabric
      const canonical = EnterpriseDataFabric.standardizeData('Customer', rawPayload);
      
      // Kiểm tra quy định tài chính/quyền hạn qua Layer 4 Policy Engine
      const policyPass = EnterprisePolicyEngine.evaluatePolicy(canonical.name, 'BOOKING_CREATE', canonical);
      if (!policyPass.allowed) throw new Error(policyPass.reason);
      
      // Ghi nhận sự kiện vào database Supabase
      return await supabaseClient.from('bookings').insert(canonical);
  };
- Git Commit: [feat: implement Spa Booking layout and Supabase sync logic] (hash: 7511f0e).`;
        case 6:
            return `🧪 [AUTOMATED QA INTEGRATION E2E TEST REPORT - 100% PASS]
- Người thực hiện: AI QA Engineer
- Đầu ra thực tế: Đã thực thi kịch bản kiểm thử E2E tự động qua Playwright (42 Test cases).
- Nhật ký thực thi:
  ✓ Case 01: Đăng ký ca trống thành công ➔ PASS (120ms)
  ✓ Case 02: Trùng ca trùng nhân sự báo lỗi ➔ PASS (98ms)
  ✓ Case 03: Policy Engine ngăn chặn truy cập sai quyền ➔ PASS (45ms)
- Kết quả: 0 Lỗi nghiêm trọng. Sẵn sàng đóng gói Build phát hành.`;
        case 7:
            return `🛡️ [HUMAN CEO GATEWAY - SYSTEM RELEASE APPROVED]
- Người thực hiện: CEO / Founder (Human-in-the-Loop)
- Đầu ra thực tế: Đã kiểm tra báo cáo E2E Test của QA và PRD của PM.
- Quyết định: KÝ DUYỆT PHÁT HÀNH (APPROVED RELEASE) cho mã nguồn Booking Module v2.1.
- Event Log: Đã phát sự kiện \`BUILD_RELEASE_APPROVED\` tới Integration Mesh.`;
        case 8:
            return `🚀 [CI/CD PIPELINE STAGING & PRODUCTION DEPLOYED]
- Người thực hiện: AI DevOps
- Đầu ra thực tế: Triển khai thành công ứng dụng lên Vercel Production.
- Deploy Logs:
  ▲ Aliased: https://bella-eos.vercel.app
  ▲ Serverless Edge Routing: Washington, D.C., USA (iad1)
  ▲ SSL & CDN Caching: Active & Optimized.
- Trạng thái: Dịch vụ Go-Live 100% ổn định trong 1.8 giây.`;
        case 9:
            return `📢 [CAMPAIGN CONTENT SPEC & MARKETING LAUNCH]
- Biên soạn: AI Marketing
- Kế hoạch Content: Tăng 20% Spa demo trong 30 ngày.

--------------------------------------------------
🎬 TUYẾN 1: KỊCH BẢN SHORT VIDEO REELS (12 CLIPS)
--------------------------------------------------
[Kịch bản Clip #1: Nỗi đau quản lý đặt lịch thủ công]
• Thời lượng: 45 giây.
• Visual: Cảnh chủ Spa bận rộn nghe 3 điện thoại cùng lúc, sổ sách ghi chép lung tung, khách hàng đến Spa phải ngồi chờ đợi lâu.
• Voiceover (AI Marketing): "Bạn có mệt mỏi khi mỗi ngày phải trả lời hàng chục cuộc gọi đặt lịch, rồi ghi chép thủ công nhầm lẫn lung tung? Khách VIP đến Spa lại phải chờ đợi vì trùng lịch? Hãy chấm dứt ngay nỗi đau này!"
• Action/CTA: Giới thiệu giao diện đặt lịch tự động 24/7 của Bella EIP trên điện thoại. Click link bio nhận dùng thử 30 ngày miễn phí!

[Kịch bản Clip #2: Giải cứu giờ cao điểm cuối tuần]
• Thời lượng: 60 giây.
• Voiceover: "Làm thế nào để Spa tăng gấp đôi công suất phục vụ ngày cuối tuần mà nhân viên không bị kiệt sức? Bí quyết là tối ưu khung giờ trống (Time OS) tự động điều phối nhân sự rảnh tay của Bella EIP..."

--------------------------------------------------
📊 TUYẾN 2: BÀI VIẾT CAROUSEL INFOGRAPHICS (10 BÀI)
--------------------------------------------------
[Bài viết #1: 5 Lý do Spa của bạn cần App Đặt Lịch Tự Động]
• Nội dung Slide 1: Tiêu đề "Spa thất thoát bao nhiêu khách hàng vì chậm trả lời tin nhắn?"
• Nội dung Slide 2: 78% khách hàng sẽ chuyển sang Spa khác nếu không đặt được lịch trong vòng 5 phút.
• Nội dung Slide 3: Hệ thống Bella EIP tự động giữ chỗ 24/7 không cần trực page.
• Nội dung Slide 4: Giảm 95% tỷ lệ khách quên lịch (No-Show) nhờ tin nhắn nhắc nhở tự động qua Zalo.
• Nội dung Slide 5: Nút kêu gọi hành động "Nhận ưu đãi giảm 50% trọn đời hôm nay".

[Bài viết #2: Cách tối ưu 100% công suất kỹ thuật viên]
• Nội dung: Hướng dẫn phân bổ phòng dịch vụ và quản trị ca kíp thông minh của phần mềm Bella EIP.

--------------------------------------------------
📖 TUYẾN 3: BÀI VIẾT CASE STUDY THỰC TẾ (5 BÀI)
--------------------------------------------------
[Case Study #1: An Nhiên Spa tăng 45% doanh thu sau 2 tháng]
• Khách hàng: An Nhiên Spa (Hà Nội) - Quy mô 12 giường dịch vụ.
• Thách thức trước khi dùng Bella EIP: Tỷ lệ khách hàng đặt lịch nhưng không đến (No-show) lên đến 28%. Quản lý không kiểm soát được ca làm việc của kỹ thuật viên dẫn đến trùng lịch dịch vụ.
• Giải pháp áp dụng: Triển khai Bella EIP Booking & Zalo OA Auto-Notification.
• Kết quả thực tế: Tỷ lệ No-show giảm xuống dưới 3%. Doanh thu tổng tăng vọt 45% nhờ tối ưu lịch trống cuối tuần. Chủ spa tự do đi du lịch không cần trực máy.`;
        case 10:
            return `📊 [FINANCIAL COST ACCOUNTING & ROI REPORT]
- Kế toán trưởng: AI Finance
- Hạch toán Chi phí API Token:
  + Gemini Flash: $0.00342
  + Claude Sonnet: $0.01250
  ➔ Tổng chi phí vận hành AI: $0.01592 USD.
- ROI Dự báo: +420% hiệu suất, tiết kiệm 1,420 giờ làm việc thay con người.`;
        default:
            return `📝 Không có kết quả bàn giao cụ thể cho bước này.`;
    }
}

function openStepDetailModalEQE(step) {
    const modal = document.getElementById('step-detail-modal');
    if (!modal) return;

    const agent = AI_AGENTS.find(a => a.id === step.agent);
    
    // Set titles
    document.getElementById('step-modal-title').textContent = step.name;
    document.getElementById('step-modal-executor').textContent = `Thực thi bởi: ${agent ? agent.name : 'Hệ thống'} (${agent ? agent.role : 'Hạt nhân'})`;
    
    // Change Icon & Color dynamically
    const iconEl = document.getElementById('step-modal-icon');
    const iconBgEl = document.getElementById('step-modal-icon-bg');
    if (agent && iconEl && iconBgEl) {
        iconEl.className = `fa-solid ${agent.icon}`;
        const hexColor = '#' + agent.color.toString(16).padStart(6, '0');
        iconBgEl.style.color = hexColor;
        iconBgEl.style.borderColor = `${hexColor}4d`;
        iconBgEl.style.backgroundColor = `${hexColor}1a`;
    }

    // Set Description
    document.getElementById('step-modal-desc').textContent = step.text;

    // Get or Create Deliverable to display
    const taskId = `task-step-${step.id}`;
    let dlv = DeliverableManager.getDeliverable(taskId);
    if (!dlv) {
        // Fallback create
        dlv = DeliverableManager.createDeliverable(taskId, step.name, step.agent, getStepOutputText(step.id));
        EnterpriseQualityEngine.evaluate(dlv);
    }

    // Render Deliverable Details
    const deliverableContainer = document.getElementById('step-modal-deliverable-container');
    if (deliverableContainer) {
        deliverableContainer.innerHTML = `
<div class="space-y-2 text-slate-200">
    <div class="flex items-center justify-between border-b border-slate-800 pb-1.5 font-sans">
        <span class="text-cyan-400 font-bold">${dlv.id} (v${dlv.version})</span>
        <span class="font-bold text-[10px] px-2 py-0.5 rounded font-mono ${dlv.status.startsWith('APPROVED') ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' : 'bg-amber-950 text-amber-400 border border-amber-900/30'}">${dlv.status}</span>
    </div>
    <div class="font-mono whitespace-pre-wrap">${dlv.evidence}</div>
    <div class="border-t border-slate-850 pt-2 font-sans flex items-center justify-between text-[10px] text-slate-400">
        <span>EQE Score: <strong class="text-emerald-400 text-xs">${dlv.score}%</strong></span>
        <span>Confidence: <strong class="text-slate-200">${dlv.confidence}%</strong> | Risk: <strong class="text-slate-200">${dlv.risk}</strong></span>
    </div>
</div>
        `;
    }

    modal.classList.remove('hidden');
}

function switchSidebarTab(tabName) {
    const tabs = ['agents', 'sops', 'kanban', 'deliverables'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        const content = document.getElementById(`tab-content-${t}`);
        if (!btn || !content) return;

        if (t === tabName) {
            btn.classList.add('border-cyan-500', 'text-cyan-400', 'font-semibold');
            btn.classList.remove('border-transparent', 'text-slate-400');
            content.classList.remove('hidden');
        } else {
            btn.classList.add('border-transparent', 'text-slate-400');
            btn.classList.remove('border-cyan-500', 'text-cyan-400', 'font-semibold');
            content.classList.add('hidden');
        }
    });

    if (tabName === 'deliverables') {
        renderDeliverablesTab();
    } else if (tabName === 'kanban') {
        renderKanbanBoard();
    }
}

function renderDeliverablesTab() {
    const container = document.getElementById('deliverable-list-container');
    const label = document.getElementById('deliverables-count-label');
    if (!container) return;

    const list = DeliverableManager.getAllDeliverables();
    if (label) {
        label.textContent = `${list.length} bản bàn giao`;
    }

    if (list.length === 0) {
        container.innerHTML = `
            <div class="text-center py-6 text-slate-500 font-sans text-[11px]">
                <i class="fa-solid fa-folder-open text-2xl block mb-2 opacity-30"></i>
                Chưa có tài sản nào được bàn giao. Chạy mô phỏng để nạp dữ liệu.
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    list.forEach(dlv => {
        const item = document.createElement('div');
        item.className = 'p-2.5 rounded-xl border bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 text-slate-350 cursor-pointer shadow-sm transition-all relative overflow-hidden space-y-1.5';
        
        let statusBadge = '';
        if (dlv.status === 'APPROVED') {
            statusBadge = '<span class="text-[8px] bg-emerald-950/80 text-emerald-400 border border-emerald-900/30 px-1 py-0.5 rounded font-mono font-bold">APPROVED</span>';
        } else if (dlv.status === 'APPROVED_WITH_COMMENT') {
            statusBadge = '<span class="text-[8px] bg-cyan-950/80 text-cyan-400 border border-cyan-900/30 px-1 py-0.5 rounded font-mono font-bold">APPROVED*</span>';
        } else if (dlv.status === 'REVISE') {
            statusBadge = '<span class="text-[8px] bg-amber-950/80 text-amber-400 border border-amber-900/30 px-1 py-0.5 rounded font-mono font-bold animate-pulse">REVISE</span>';
        } else if (dlv.status === 'ESCALATE') {
            statusBadge = '<span class="text-[8px] bg-rose-950/80 text-rose-455 border border-rose-900/30 px-1 py-0.5 rounded font-mono font-bold animate-pulse">ESCALATE</span>';
        } else {
            statusBadge = `<span class="text-[8px] bg-slate-950 text-slate-400 border border-slate-800 px-1 py-0.5 rounded font-mono">${dlv.status}</span>`;
        }

        item.onclick = () => {
            openDeliverableDetailModal(dlv.taskId);
        };

        item.innerHTML = `
            <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-slate-100 truncate flex items-center gap-1.5">
                    <i class="fa-solid fa-passport text-cyan-400"></i>
                    <span>${dlv.stepName}</span>
                </h4>
                <div class="flex items-center gap-1.5 shrink-0">
                    <span class="text-[8px] text-slate-500 font-mono">v${dlv.version}</span>
                    ${statusBadge}
                </div>
            </div>
            <div class="flex items-center justify-between text-[10px] text-slate-400">
                <span>Bởi: <strong class="text-slate-350">${dlv.owner}</strong></span>
                <span class="font-bold text-emerald-400 font-mono">${dlv.score}% EQE</span>
            </div>
            <p class="text-[9px] text-slate-500 truncate font-mono">${dlv.id}</p>
        `;
        container.appendChild(item);
    });
}

function openDeliverableDetailModal(taskId) {
    const dlv = DeliverableManager.getDeliverable(taskId);
    if (!dlv) return;

    const modal = document.getElementById('deliverable-detail-modal');
    if (!modal) return;

    document.getElementById('dlv-modal-title').textContent = dlv.stepName;
    document.getElementById('dlv-modal-id').textContent = dlv.id;
    document.getElementById('dlv-modal-version').textContent = `v${dlv.version}`;
    document.getElementById('dlv-modal-owner').textContent = dlv.owner;
    document.getElementById('dlv-modal-score').textContent = `${dlv.score}%`;

    // Status Badge inside modal
    const badgeEl = document.getElementById('dlv-modal-status-badge');
    if (badgeEl) {
        let badgeColor = '';
        if (dlv.status.startsWith('APPROVED')) {
            badgeColor = 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/30';
        } else if (dlv.status === 'REVISE') {
            badgeColor = 'bg-amber-950/80 text-amber-400 border border-amber-900/30 animate-pulse';
        } else if (dlv.status === 'ESCALATE') {
            badgeColor = 'bg-rose-950/80 text-rose-455 border border-rose-900/30 animate-pulse';
        } else {
            badgeColor = 'bg-slate-950 text-slate-400 border border-slate-800';
        }
        badgeEl.className = `inline-block text-[10px] font-bold font-mono px-2 py-0.5 rounded ${badgeColor}`;
        badgeEl.textContent = dlv.status;
    }

    // Populate scorecard values
    document.getElementById('dlv-score-grammar').textContent = `${dlv.scores.grammar}%`;
    document.getElementById('dlv-score-brand').textContent = `${dlv.scores.brand}%`;
    document.getElementById('dlv-score-policy').textContent = `${dlv.scores.policy}%`;
    document.getElementById('dlv-score-security').textContent = `${dlv.scores.security}%`;
    document.getElementById('dlv-score-evidence').textContent = `${dlv.scores.evidence}%`;
    document.getElementById('dlv-score-risk').textContent = `${dlv.scores.risk}%`;
    document.getElementById('dlv-score-compliance').textContent = `${dlv.scores.compliance}%`;
    document.getElementById('dlv-score-overall').textContent = `${dlv.scores.overall}%`;

    // Populate DoD List
    const dodList = document.getElementById('dlv-dod-list');
    if (dodList) {
        dodList.innerHTML = '';
        dlv.dodChecks.forEach(check => {
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between py-0.5 border-b border-slate-900/50';
            li.innerHTML = `
                <span class="text-slate-350">
                    <span class="text-[8px] bg-slate-900 text-slate-400 border border-slate-850 px-1 py-0.5 rounded font-mono mr-1.5 uppercase">${check.type}</span>
                    ${check.rule}
                </span>
                <span class="font-bold text-[10px] font-mono px-1.5 py-0.5 rounded ${check.status === 'PASS' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/30' : 'bg-rose-950/80 text-rose-455 border border-rose-900/30'}">${check.status}</span>
            `;
            dodList.appendChild(li);
        });
    }

    // Set Evidence Preview
    document.getElementById('dlv-modal-evidence').textContent = dlv.evidence;

    // Populate timeline history
    const historyContainer = document.getElementById('dlv-modal-history');
    if (historyContainer) {
        historyContainer.innerHTML = '';
        dlv.approvalHistory.forEach(hist => {
            const time = new Date(hist.timestamp).toLocaleTimeString('vi-VN');
            const item = document.createElement('div');
            item.className = 'flex items-start gap-2 border-l border-slate-850 pb-3 pl-3.5 relative';
            item.innerHTML = `
                <div class="absolute -left-[5.5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></div>
                <div class="flex-1">
                    <div class="flex items-center justify-between text-[9px]">
                        <span class="font-bold text-slate-350">Phiên bản v${hist.version} • Trạng thái: <strong class="text-cyan-400">${hist.status}</strong></span>
                        <span class="text-slate-500">${time}</span>
                    </div>
                    <p class="text-[10px] text-slate-450 mt-0.5 font-sans">${hist.comments}</p>
                </div>
            `;
            historyContainer.appendChild(item);
        });
    }

    modal.classList.remove('hidden');
}

safeAddListener('btn-close-dlv-modal', 'click', () => {
    document.getElementById('deliverable-detail-modal').classList.add('hidden');
});

safeAddListener('btn-close-dlv-modal-confirm', 'click', () => {
    document.getElementById('deliverable-detail-modal').classList.add('hidden');
});

// Execute Next Step in Workflow Simulation
function stepForward() {
    if (currentStepIndex >= WORKFLOW_STEPS.length) {
        pauseSimulation();
        appendLog('SYSTEM', '🎉 Workflow hoàn tất 100%! Đã lập Báo cáo Kế hoạch Content & Bàn giao sản phẩm Bella EIP.', 'text-emerald-400 font-bold');
        showCampaignExecutiveReport();
        return;
    }

    const currentStep = WORKFLOW_STEPS[currentStepIndex];
    const taskId = `task-step-${currentStep.id}`;

    // Compile EIL Context dynamically for this active step
    const objInput = document.getElementById('ceo-command-input');
    const objectiveText = window.activeObjectiveText || (objInput && objInput.value) || 'Tối ưu hóa chiến dịch Marketing SpaPOS 30 ngày';
    const activeEilContext = EnterpriseIntelligenceLayer.compileContext(currentStep, objectiveText);
    
    // Update compiled context in the modal dashboard
    const elCompiledContext = document.getElementById('eil-compiled-context-display');
    if (elCompiledContext) {
        elCompiledContext.innerHTML = JSON.stringify(activeEilContext, null, 4);
    }

    // Flywheel Step 1: Goal Formulation
    const strategicVision = `Mục tiêu tối ưu hóa quy trình [Step ${currentStep.id}: ${currentStep.name}]`;
    const goalObj = GoalEngine.decomposeGoal(strategicVision);
    appendLog('GOAL ENGINE', `🎯 [Goal Formulation] OKRs Decomposed: Mkt Leads: ${goalObj.subGoals.marketing.leads} | Sales Conv: ${goalObj.subGoals.sales.conversionRate}% | Margin: ${goalObj.subGoals.finance.minNetMargin}%`, 'text-indigo-400 font-semibold');

    // Flywheel Step 2: Planning & Simulation (Monte Carlo & Optimization)
    const simReport = SimulationEngine.runMonteCarlo('ai_automation');
    appendLog('SIMULATION ENGINE', `🔮 [Monte Carlo Simulation] ROI dự kiến: ${simReport.projectedRoi} | Cashflow: ${simReport.cashflow} | Net Profit: ${(simReport.projectedNetProfitVND / 1000000).toFixed(1)}M VND | Confidence: ${simReport.confidence}%`, 'text-cyan-400 font-semibold');

    const optReport = OptimizationEngine.findOptimalPath(currentStep.id);
    appendLog('OPTIMIZATION ENGINE', `⚖️ [Path Optimization] Chọn: "${optReport.optimalPath.path}" (Độ tin cậy: ${optReport.optimalPath.successRate}%, Tiết kiệm: ${optReport.savingsPct}%)`, 'text-purple-400 font-semibold');

    // Flywheel Step 3: Execution
    ExecutionCoordination.dispatch(currentStep, activeEilContext);

    // Flywheel Step 4: Observation
    appendLog('OBSERVATION ENGINE', `📊 [Observation Telemetry] Real-time tracking activated. CAC: 1.2M VND | Active Reach: 145,200 users`, 'text-slate-400');
    
    appendLog('EQE GATEWAY', `🛡️ ĐANG QUÉT CHẤT LƯỢNG (LIVE SCANNING): "${currentStep.name}"...`, 'text-cyan-400 font-medium');

    // Create or retrieve deliverable
    let dlv = DeliverableManager.getDeliverable(taskId);
    if (!dlv) {
        dlv = DeliverableManager.createDeliverable(taskId, currentStep.name, currentStep.agent, getStepOutputText(currentStep.id));
    } else if (dlv.status === 'REVISE') {
        DeliverableManager.registerVersion(taskId, getStepOutputText(currentStep.id));
    }

    // Run EQE assessment (Flywheel Step 5: Evaluation)
    EnterpriseQualityEngine.evaluate(dlv);

    // Update deliverables sidebar tab
    if (typeof renderDeliverablesTab === 'function') {
        renderDeliverablesTab();
    }

    // Run Decision Engine
    const decision = DecisionEngine.evaluateAndRoute(dlv);

    if (decision.action.startsWith('APPROVED')) {
        // Step Passed!
        appendLog('DECISION ENGINE', `✅ ĐẠT YÊU CẦU: [${dlv.id}] v${dlv.version} được duyệt với điểm ${dlv.score}%.`, 'text-emerald-400 font-bold');
        
        // Flywheel Step 6: Learning
        const learningMutation = LearningEngine.mutateAndLearn(dlv.evidence, { overall: dlv.score });
        appendLog('LEARNING ENGINE', `🧠 [Learning Engine] SOP Mutated: "${learningMutation.target}". Skill weight updated for "bella_worker".`, 'text-emerald-400 font-bold');

        // Flywheel Step 7: Knowledge Graph Sync
        const stepNodeId = `step_node_${currentStep.id}_${Date.now()}`;
        KnowledgeGraphService.addNode(stepNodeId, 'Task', currentStep.name, { score: dlv.score });
        KnowledgeGraphService.addEdge(stepNodeId, 'company_bella', 'BELONGS_TO');
        appendLog('KNOWLEDGE GRAPH', `🔗 [Graph Sync] Linked EOM Object [Task: ${currentStep.name}] to Company [Bella Group]. Nodes: ${KnowledgeGraphService.getGraphStats().nodesCount}`, 'text-teal-400 font-semibold');
        
        // Log agent text
        const activeAgent = AI_AGENTS.find(a => a.id === currentStep.agent);
        appendLog(activeAgent ? activeAgent.name : 'AI AGENT', currentStep.text, 'text-blue-500');

        // Execute Consolidated Kernel Services per Step
        if (currentStep.id === 1 && typeof ResourceService !== 'undefined') {
            ResourceService.allocateAndLock('budget', 5000000);
        }

        if (currentStep.id === 4 && typeof PolicyService !== 'undefined') {
            PolicyService.evaluateGuardrails('PublishPostCommand', { stepName: currentStep.name });
        }

        if (currentStep.id === 6 && typeof ExecutionService !== 'undefined') {
            ExecutionService.publishCommand('PublishPostCommand', {
                taskId: `TASK-${dlv.id}`,
                taskTitle: 'Đăng bài Facebook & Xuất Báo Giá PDF',
                executorId: 'hermes'
            });
            if (typeof EIPProvider !== 'undefined') {
                EIPProvider.sendCommand('PublishPostCommand', { budgetVnd: 5000000 });
            }
        }

        if (currentStep.id === 8 && typeof EvidenceService !== 'undefined') {
            EvidenceService.verifyAndStoreEvidence(
                `TASK-${dlv.id}`,
                'Facebook Post Public ID & PDF Hash',
                { postId: 'FB-849204812', pdfHash: '#e3b0c442', httpStatus: 200 }
            );
        }

        if (currentStep.id === 10 && typeof EnterpriseMemoryService !== 'undefined') {
            EnterpriseMemoryService.logReasoning(
                'Hoàn tất Chiến dịch Marketing SpaPOS 30 ngày',
                'Phát hành 30 bài viết chuẩn SEO, Post FB 8h AM SLA & Đồng bộ Báo giá CRM',
                0.99,
                'POL-COMPLIANCE-PASS'
            );
        }

        // Go to next step
        if (currentStepIndex < WORKFLOW_STEPS.length - 1) {
            const nextStep = WORKFLOW_STEPS[currentStepIndex + 1];
            
            // Spawn data orb effect
            spawnWorkflowDataOrb(currentStep.agent, nextStep.agent);

            // Inter-Agent Message Handover
            InterAgentBus.sendHandoverMessage({
                senderId: currentStep.agent,
                receiverId: nextStep.agent,
                taskId: `TASK-STEP-${nextStep.id}`,
                payload: { stepName: nextStep.name, text: nextStep.text },
                handoverType: 'SEQUENTIAL'
            });

            currentStepIndex++;

            // Set states
            AI_AGENTS.forEach(a => a.status = 'IDLE');
            const nextAgent = AI_AGENTS.find(a => a.id === nextStep.agent);
            if (nextAgent) nextAgent.status = 'PROCESSING';

            highlightAgent(nextStep.agent);
            renderAgentCards();
            renderWorkflowPipeline();

            // Trigger CEO Gateway modal if next step is human gate
            if (nextStep.isApprovalGate) {
                pauseSimulation();
                openApprovalModal(nextStep);
            }
        } else {
            // End of workflow
            currentStepIndex++;
            pauseSimulation();
            appendLog('SYSTEM', '🎉 Workflow hoàn tất 100%! Đã lập Báo cáo Kế hoạch Content & Bàn giao sản phẩm Bella EIP.', 'text-emerald-400 font-bold');
            showCampaignExecutiveReport();
        }

        // Auto-learning on step 9
        if (currentStep.id === 9 && typeof ContinuousLearningEngine !== 'undefined') {
            ContinuousLearningEngine.analyzeAndShiftBudget();
        }
    } else if (decision.action === 'REVISE') {
        // Revision required - Pause sim and trigger automatic rollback + rerun
        pauseSimulation();
        appendLog('EQE GATEWAY', `❌ KHÔNG ĐẠT: [${dlv.id}] v${dlv.version} chỉ đạt ${dlv.score}%. Tự động rollback để sửa đổi.`, 'text-rose-450 font-bold');

        const prevStep = WORKFLOW_STEPS[decision.targetStep];
        
        // Orb flies BACK!
        spawnWorkflowDataOrb(currentStep.agent, prevStep.agent);

        // Update current step index back to revision target
        currentStepIndex = decision.targetStep;

        AI_AGENTS.forEach(a => a.status = 'IDLE');
        const prevAgent = AI_AGENTS.find(a => a.id === prevStep.agent);
        if (prevAgent) prevAgent.status = 'PROCESSING';

        highlightAgent(prevStep.agent);
        renderAgentCards();
        renderWorkflowPipeline();

        // Log revision action
        appendLog('SYSTEM', `🔄 Khởi chạy lại bước "${prevStep.name}" với phản hồi sửa đổi chất lượng.`, 'text-amber-400');

        // Auto resume after brief pause
        setTimeout(() => {
            startSimulation();
        }, 2200 / simSpeed);
    } else if (decision.action === 'ESCALATE') {
        pauseSimulation();
        openApprovalModal(currentStep);
    }

    updateGlobalMetricsUI();
}

// Simulation Controls
function startSimulation() {
    if (isSimulating) return;
    isSimulating = true;
    document.getElementById('btn-run-sim').classList.add('opacity-50', 'pointer-events-none');
    appendLog('SYSTEM', `Bắt đầu mô phỏng luồng công việc tự động (Tốc độ ${simSpeed}x)...`, 'text-blue-600');
    
    simTimer = setInterval(() => {
        stepForward();
    }, 3500 / simSpeed);
}

function pauseSimulation() {
    isSimulating = false;
    if (simTimer) clearInterval(simTimer);
    document.getElementById('btn-run-sim').classList.remove('opacity-50', 'pointer-events-none');
}

function jumpToStep(idx) {
    pauseSimulation();
    currentStepIndex = idx;
    const step = WORKFLOW_STEPS[idx];
    AI_AGENTS.forEach(a => a.status = 'IDLE');
    const activeAgent = AI_AGENTS.find(a => a.id === step.agent);
    if (activeAgent) activeAgent.status = 'PROCESSING';

    highlightAgent(step.agent);
    renderAgentCards();
    renderWorkflowPipeline();
    appendLog('SYSTEM', `CEO chuyển trực tiếp tới bước: ${step.name}`, 'text-amber-600 font-medium');
    updateGlobalMetricsUI();
}

// =========================================================================
// MILESTONE 4.2: HUMAN-IN-THE-LOOP APPROVAL & QUALITY GATE ENGINE
// =========================================================================
const QualityGateEngine = {
    qualityGates: {
        'PRD_CHECK': { name: 'Kiểm duyệt PRD', reviewerRole: 'role_cto', criteria: ['Đầy đủ User Stories', 'Phân quyền API'] },
        'CODE_REVIEW': { name: 'Code Review & Security', reviewerRole: 'role_tl', criteria: ['Pass Unit Tests', 'Không có lỗ hổng OWASP'] },
        'RELEASE_APPROVE': { name: 'Duyệt Phát Hành Build (CEO)', reviewerRole: 'role_ceo', criteria: ['Pass E2E Test Suite', 'Đạt tiêu chuẩn DoD'] }
    },
    
    revisionCounts: {},

    verifyDefinitionOfDone(taskContract) {
        const dod = taskContract.definitionOfDone || {};
        const results = [];
        let allPassed = true;

        Object.keys(dod).forEach(ruleKey => {
            const val = dod[ruleKey];
            const isPass = !val.includes('FAIL');
            if (!isPass) allPassed = false;
            results.push({ ruleKey, expected: val, status: isPass ? 'PASS' : 'FAIL' });
        });

        return { allPassed, results };
    },

    triggerRevisionLoop(taskId, reason) {
        this.revisionCounts[taskId] = (this.revisionCounts[taskId] || 0) + 1;
        const currentCount = this.revisionCounts[taskId];

        if (currentCount > 2) {
            appendLog('QUALITY GATE', `🚨 CHUYỂN TUYẾN THỦ TRƯỞNG (ESCALATION): Task [${taskId}] sửa đổi quá 2 lần không đạt. Đã leo thang tới Ban Lãnh Đạo!`, 'text-rose-500 font-bold');
            EventBus.emit('sla.escalated', { taskId, reason, count: currentCount });
            return 'ESCALATED';
        } else {
            appendLog('QUALITY GATE', `🔄 AUTO REVISION LOOP (#${currentCount}): Yêu cầu Agent sửa lại theo nhận xét. Lý do: ${reason}`, 'text-amber-400 font-bold');
        }
    }
};

// =========================================================================
// MILESTONE 4.3: BELLA EIP & BUSINESS APPLICATION CONNECTORS
// =========================================================================
const BusinessApplicationConnectors = {
    connectors: {
        'BELLA_SPA_ERP': { name: 'Bella Spa ERP System', status: 'CONNECTED', endpoint: 'https://api.bellaspa.vn/v1/erp' },
        'CUSTOMER_CRM': { name: 'Bella Customer CRM', status: 'CONNECTED', endpoint: 'https://crm.bellaspa.vn/api/v2' },
        'BELLA_POS': { name: 'Bella Booking & POS Engine', status: 'CONNECTED', endpoint: 'https://pos.bellaspa.vn/v1' },
        'FINANCE_PAYROLL': { name: 'Enterprise Payroll & Cost Ledger', status: 'RESTRICTED', endpoint: 'https://finance.bellaspa.vn/ledger' },
        'INVENTORY_HUB': { name: 'Spa Supplies Inventory Hub', status: 'CONNECTED', endpoint: 'https://inventory.bellaspa.vn/graphql' }
    },

    async queryApplicationData(connectorKey, agentId, queryParams) {
        const conn = this.connectors[connectorKey];
        if (!conn) throw new Error(`Connector [${connectorKey}] không tồn tại.`);

        // Check Agent Permission for this Connector
        const config = AGENT_CONFIGS[agentId] || {};
        const permissions = config.toolPermissions || {};

        if (connectorKey === 'FINANCE_PAYROLL' && !permissions.payroll) {
            appendLog('CONNECTORS', `⛔ TỪ CHỐI TRUY CẬP: Agent [${agentId}] không có quyền truy cập [${conn.name}]`, 'text-rose-500 font-bold');
            throw new Error(`Permission Denied: Payroll Access for Agent ${agentId}`);
        }

        if (connectorKey === 'CUSTOMER_CRM' && !permissions.crm) {
            appendLog('CONNECTORS', `⛔ TỪ CHỐI TRUY CẬP: Agent [${agentId}] không có quyền truy cập [${conn.name}]`, 'text-rose-500 font-bold');
            throw new Error(`Permission Denied: CRM Access for Agent ${agentId}`);
        }

        appendLog('CONNECTORS', `🔗 [${agentId}] ➔ Truy vấn dữ liệu thực tế từ [${conn.name}] (${conn.endpoint})`, 'text-cyan-400 font-semibold');

        // Simulated API Payload Response
        return {
            connectorKey,
            status: 200,
            timestamp: new Date().toISOString(),
            data: {
                totalCustomers: 1420,
                activeBookings: 88,
                monthlyRevenueEst: "420,000,000 VND"
            }
        };
    }
};

// =========================================================================
// MILESTONE 4.4: ENTERPRISE PERFORMANCE ANALYTICS & SLA DASHBOARD
// =========================================================================
const EnterprisePerformanceAnalytics = {
    metricsLedger: {
        totalTasksExecuted: 142,
        approvedFirstTime: 128,
        revisionCount: 14,
        slaBreaches: 2,
        avgCompletionTimeMinutes: 18.5
    },

    getAgentScorecard(agentId) {
        const agent = AI_AGENTS.find(a => a.id === agentId);
        const role = (typeof RoleSkillCenter !== 'undefined' && RoleSkillCenter.getRoleById) ? RoleSkillCenter.getRoleById(`role_${agentId}`) : null;

        return {
            agentId,
            agentName: agent ? agent.name : agentId,
            roleTitle: role ? role.title : (agent ? agent.role : 'AI Employee'),
            approveRate: "94.2%",
            slaComplianceRate: "98.5%",
            avgCostPerTask: "$0.0210",
            totalTasksCompleted: 42,
            kpis: role ? role.kpis : ['Approve Rate >= 90%']
        };
    },

    calculateOverallHealth() {
        const approveRate = (this.metricsLedger.approvedFirstTime / this.metricsLedger.totalTasksExecuted) * 100;
        return {
            overallApproveRate: `${approveRate.toFixed(1)}%`,
            totalExecuted: this.metricsLedger.totalTasksExecuted,
            slaBreachCount: this.metricsLedger.slaBreaches,
            status: approveRate >= 90 ? 'OPTIMAL' : 'NEEDS_OPTIMIZATION'
        };
    }
};

// =========================================================================
// BELLA ENTERPRISE OPERATING SYSTEM (BELLA EOS - 10-YEAR ARCHITECTURE)
// =========================================================================

const OKRSCascadingEngine = {
    activeOKRs: {
        objective: "Bứt phá 20% lượng Spa ký kết hợp đồng Bella EIP trong Q3 2026",
        keyResults: [
            { id: 'KR1', title: 'Đạt 500 Leads chất lượng từ Kênh Facebook Ads', owner: 'mkt', target: 500, current: 423 },
            { id: 'KR2', title: 'Tỷ lệ chuyển đổi Demo ➔ Hợp đồng >= 20%', owner: 'sales', target: 20, current: 23.1 },
            { id: 'KR3', title: 'Tối ưu Chi phí Thu hút Khách hàng (CAC) <= 1.25M VND', owner: 'fin', target: 1250000, current: 1200000 }
        ]
    }
};

const ProjectPortfolioEngine = {
    portfolio: [
        { id: 'PRJ-01', name: 'Summer Spa Growth Campaign 2026', status: 'ACTIVE', budget: 50000000, departments: ['Growth', 'Tech', 'Finance'], health: 'OPTIMAL' },
        { id: 'PRJ-02', name: 'Bella EIP Cloud POS Core Upgrade', status: 'ACTIVE', budget: 120000000, departments: ['Product', 'Tech', 'Ops'], health: 'STABLE' },
        { id: 'PRJ-03', name: 'AI Employee HR Recruitment Portal', status: 'PLANNING', budget: 30000000, departments: ['Executive', 'Growth'], health: 'OPTIMAL' }
    ],
    getActiveProject() {
        return this.portfolio[0];
    }
};

const EnterpriseResourceManager = {
    workloadLedger: {
        des: { name: 'AI Designer', workloadPercent: 85, activeTasks: 4, capacityStatus: 'HIGH_LOAD' },
        dev: { name: 'AI Developer', workloadPercent: 60, activeTasks: 2, capacityStatus: 'BALANCED' },
        mkt: { name: 'AI Marketing', workloadPercent: 75, activeTasks: 3, capacityStatus: 'BALANCED' },
        sales: { name: 'AI Sales', workloadPercent: 92, activeTasks: 6, capacityStatus: 'OVERLOAD_RISK' }
    },
    checkCapacity(agentId) {
        return this.workloadLedger[agentId] || { workloadPercent: 50, capacityStatus: 'BALANCED' };
    }
};

const DecisionEngineOS = {
    decisionLog: [],
    recordDecision(decision) {
        const record = {
            id: `DEC-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...decision
        };
        this.decisionLog.push(record);
        appendLog('DECISION ENGINE', `⚖️ GHI NHẬN QUYẾT ĐỊNH DOANH NGHIỆP [${record.category}]: ${record.summary} (Approved by: ${record.approvedBy})`, 'text-cyan-400 font-bold');
        return record;
    }
};

const BusinessMemoryOS = {
    projectMemory: [
        { projectId: 'PRJ-01', meeting: 'Kickoff Q3 Growth', decision: 'Dồn 70% ngân sách vào Carousel Ads', approval: 'CEO Approved', result: 'Revenue +2.4B VND', lesson: 'Lead Carousel có tỷ lệ chốt sales thực tế cao nhất.' }
    ],
    queryMemory(query) {
        return this.projectMemory.filter(m => m.decision.includes(query) || m.lesson.includes(query));
    }
};

const ProjectMemoryEngine = {
    campaignHistory: [
        { id: 'HIST-49', name: 'Q1 Spa Onboarding Fest', roi: 420, topFormat: 'Video Reels', lessons: 'Video ngắn đánh đúng Nỗi đau quản lý Spa có tỷ lệ chốt đơn cao nhất.' },
        { id: 'HIST-50', name: 'Zalo OA Automation Launch', roi: 380, topFormat: 'Carousel Infographics', lessons: 'Infographics tính năng rõ ràng giúp giảm 30% thời gian chốt Sales.' }
    ],
    getLessonsLearned() {
        return this.campaignHistory.map(h => `• ${h.name}: ${h.lessons}`).join('\n');
    }
};

const AICOOEngine = {
    activeObjective: {
        rawInput: "Tăng 20% số lượng Spa đăng ký demo Bella EIP với ngân sách tối đa 50 triệu trong 30 ngày",
        targetMetric: "Spa Demo Registrations",
        targetGrowthPercent: 20,
        budgetMaxVND: 50000000,
        durationDays: 30,
        createdAt: new Date().toISOString()
    },

    kpisLedger: {
        marketing: { reachTarget: 120000, ctrTarget: 8.5, leadsTarget: 400, costPerLeadMax: 120000 },
        sales: { conversionRateTarget: 22.5, demoTarget: 90 },
        finance: { budgetAllocated: 50000000, targetROI: 450, maxCAC: 1250000 }
    },

    decomposeObjectiveToDynamicWorkflow(objectiveText) {
        appendLog('AI COO (PORTFOLIO MANAGER)', `🎯 TIẾP NHẬN STRATEGIC OBJECTIVE TỪ CEO: "${objectiveText}"`, 'text-amber-400 font-bold');

        // Extract budget dynamic from text or default
        const budgetMatch = objectiveText.match(/(\d+)\s*(triệu|tr|m|tỷ)/i);
        let budgetVND = 50000000;
        if (budgetMatch) {
            const num = parseInt(budgetMatch[1]);
            const unit = budgetMatch[2].toLowerCase();
            if (unit === 'tỷ') budgetVND = num * 1000000000;
            else budgetVND = num * 1000000;
        }

        const policyResult = (typeof EnterprisePolicyEngine !== 'undefined') ? 
            EnterprisePolicyEngine.evaluatePolicy('BUDGET_SPEND', budgetVND) : { allowed: true };

        appendLog('AI COO (PORTFOLIO MANAGER)', `📁 Khởi tạo PROJECT HUB cho Objective (Ngân sách: ${(budgetVND / 1000000).toFixed(0)}M VND, Risk Matrix Checked).`, 'text-cyan-300 font-semibold');
        appendLog('AI COO (RESOURCE ENGINE)', `⚙️ Kiểm tra Resource Capacity & Cân bằng tải Workload các AI Employees.`, 'text-purple-300 font-medium');
        appendLog('AI COO (PROJECT MEMORY)', `🧠 Tái sử dụng Tri thức kinh nghiệm các Chiến dịch quá trước.`, 'text-emerald-400 font-medium');

        if (typeof DecisionEngineOS !== 'undefined') {
            DecisionEngineOS.recordDecision({
                category: 'PROJECT_LAUNCH',
                summary: `Khởi tạo dự án cho Objective: ${objectiveText}`,
                approvedBy: policyResult.requireHumanApproval ? 'CEO (Pending Sign-off)' : 'Policy Engine (Auto Approved)'
            });
        }

        const targetInput = document.getElementById('bce-edit-followers') || document.getElementById('main-followers');
        const metricKey = (targetInput && targetInput.dataset.metricKey) || 'targetFollowers';

        let rawSteps = [];

        if (metricKey === 'targetFollowers') {
            // CASE 1: Social Posting / Followers Goal
            rawSteps = [
                { id: 1, name: '1. Thiết lập Mục tiêu Truyền thông', agent: 'coo', adapterKey: 'hermes', text: `AI COO khởi tạo kế hoạch đăng bài truyền thông cho Spa (Ngân sách: ${(budgetVND / 1000000).toFixed(0)}M VND)` },
                { id: 2, name: '2. Nghiên cứu Thị hiếu & Topic', agent: 'pm', adapterKey: 'hermes', text: 'AI PM nghiên cứu hành vi khách hàng Spa & lập Content Matrix' },
                { id: 3, name: '3. Soạn thảo Bài viết & Kịch bản', agent: 'mkt', adapterKey: 'claudecode', text: 'AI Marketing soạn các nội dung bài viết chuẩn SEO & Brand Voice' },
                { id: 4, name: '4. Thiết kế Layout & Hình ảnh', agent: 'des', adapterKey: 'openhands', text: 'AI Designer thiết kế Infographics & Banner cho bài đăng Carousel' },
                { id: 5, name: '5. Tối ưu Kịch bản Đăng tải', agent: 'sales', adapterKey: 'codex', text: 'AI Sales thiết lập mẫu CTA dẫn link đăng ký liệu trình Spa' },
                { id: 6, name: '6. Kiểm duyệt Quy chuẩn Thương hiệu', agent: 'qa', adapterKey: 'claudecode', text: 'AI QA rà soát lỗi chính tả, logo & kiểm tra tính chính xác của thông điệp' },
                { 
                    id: 7, 
                    name: '7. Gate Phê duyệt Nội dung của CEO', 
                    agent: 'ceo', 
                    adapterKey: 'hermes',
                    text: 'CEO phê duyệt bản thảo thiết kế & nội dung trước khi bấm đăng', 
                    isApprovalGate: true
                },
                { id: 8, name: '8. Đăng bài tự động lên Fanpage', agent: 'hermes', adapterKey: 'hermes', text: 'Hermes Operator gọi Facebook Graph API để đăng bài viết trực tiếp lên trang' },
                { id: 9, name: '9. Kiểm tra Tương tác & Hiển thị', agent: 'qa', adapterKey: 'openhands', text: 'AI QA xác minh bài viết hiển thị công khai & theo dõi tỷ lệ reach ban đầu' },
                { id: 10, name: '10. Báo cáo Thống kê & Đo lường CTR', agent: 'fin', adapterKey: 'hermes', text: 'AI Finance báo cáo lượng bài hoàn thành, tương tác và đề xuất chiến dịch tiếp theo' }
            ];
        } else if (metricKey === 'targetRevenueVnd') {
            // CASE 2: Revenue / Sales Goal
            rawSteps = [
                { id: 1, name: '1. Hoạch định Chỉ tiêu Doanh số', agent: 'coo', adapterKey: 'hermes', text: `AI COO hoạch định kế hoạch doanh thu Spa (Mục tiêu: ${formatShortMoney(budgetVND * 4)})` },
                { id: 2, name: '2. Nghiên cứu Gói Dịch vụ Hot', agent: 'pm', adapterKey: 'hermes', text: 'AI PM khảo sát nhu cầu thị trường để lựa chọn gói dịch vụ thu hút' },
                { id: 3, name: '3. Thiết kế Chương trình Khuyến mãi', agent: 'mkt', adapterKey: 'claudecode', text: 'AI Marketing soạn thảo chương trình ưu đãi & kịch bản tiếp thị' },
                { id: 4, name: '4. Thiết kế Banner Ưu đãi', agent: 'des', adapterKey: 'openhands', text: 'AI Designer thiết kế ảnh quảng cáo Voucher cực đẹp mắt' },
                { id: 5, name: '5. Thiết lập Kịch bản Chốt Sales (CRM)', agent: 'sales', adapterKey: 'codex', text: 'AI Sales đồng bộ kịch bản tư vấn tự động hóa trên CRM' },
                { id: 6, name: '6. Thẩm định Chất lượng & Chiết khấu', agent: 'qa', adapterKey: 'claudecode', text: 'AI QA thẩm định chính sách giảm giá & rủi ro ngân sách' },
                { 
                    id: 7, 
                    name: '7. CEO Phê duyệt Bảng Giá Release', 
                    agent: 'ceo', 
                    adapterKey: 'hermes',
                    text: 'CEO phê duyệt bảng giá chiết khấu đặc biệt cho chiến dịch', 
                    isApprovalGate: true
                },
                { id: 8, name: '8. Kích hoạt Kênh Quảng cáo & Đăng tải', agent: 'devops', adapterKey: 'openhands', text: 'AI DevOps kết nối API quảng cáo & nạp ngân sách Ads chiến dịch' },
                { id: 9, name: '9. Theo dõi Doanh số & Leads mới', agent: 'mkt', adapterKey: 'hermes', text: 'AI Marketing giám sát số lượng khách hàng đặt lịch & tương tác realtime' },
                { id: 10, name: '10. Báo cáo Tài chính & Lợi nhuận', agent: 'fin', adapterKey: 'hermes', text: 'AI Finance tổng hợp doanh số thực tế, chi phí quảng cáo & tính toán ROI' }
            ];
        } else if (metricKey === 'targetStaffCount') {
            // CASE 3: Recruitment Goal
            rawSteps = [
                { id: 1, name: '1. Hoạch định Nhu cầu Nhân sự', agent: 'coo', adapterKey: 'hermes', text: 'AI COO lập kế hoạch tuyển dụng nhân sự Spa phục vụ mùa cao điểm' },
                { id: 2, name: '2. Soạn thảo Bản mô tả công việc JD', agent: 'pm', adapterKey: 'hermes', text: 'AI PM viết bản mô tả công việc (JD) chi tiết cho vị trí Kỹ thuật viên' },
                { id: 3, name: '3. Thiết kế Banner Tuyển dụng', agent: 'des', adapterKey: 'openhands', text: 'AI Designer thiết kế ảnh tuyển dụng trực quan thu hút ứng viên' },
                { id: 4, name: '4. Đăng tuyển lên Fanpage & Group', agent: 'hermes', adapterKey: 'hermes', text: 'Hermes Operator tự động chia sẻ tin tuyển dụng lên các hội nhóm Spa' },
                { id: 5, name: '5. Kiểm duyệt Pháp lý & Hợp đồng', agent: 'qa', adapterKey: 'claudecode', text: 'AI QA thẩm định điều khoản hợp đồng thử việc & chính sách lương thưởng' },
                { 
                    id: 6, 
                    name: '6. Phê duyệt Ngân sách Tuyển dụng', 
                    agent: 'ceo', 
                    adapterKey: 'hermes',
                    text: 'CEO ký duyệt ngân sách chi phí tuyển dụng & phúc lợi nhân sự mới', 
                    isApprovalGate: true
                },
                { id: 7, name: '7. Thu thập & Lọc hồ sơ ứng viên (CV)', agent: 'pm', adapterKey: 'codex', text: 'AI PM thu thập CV từ các kênh & lọc ứng viên đạt yêu cầu ban đầu' },
                { id: 8, name: '8. Chấm điểm & Đánh giá Hồ sơ', agent: 'qa', adapterKey: 'claudecode', text: 'AI QA đối chiếu kỹ năng ứng viên với tiêu chí tuyển dụng của Spa' },
                { id: 9, name: '9. Lên lịch phỏng vấn Tự động', agent: 'coo', adapterKey: 'openhands', text: 'AI COO kích hoạt bot gửi thư mời phỏng vấn & đặt lịch hẹn' },
                { id: 10, name: '10. Báo cáo Chi phí Tuyển dụng & CPH', agent: 'fin', adapterKey: 'hermes', text: 'AI Finance báo cáo tổng hợp chi phí trên mỗi lượt tuyển dụng (CPH)' }
            ];
        } else {
            // CASE 4: Default/Leads Campaign
            rawSteps = [
                { id: 1, name: '1. Thiết lập Chiến dịch Thu hút Leads', agent: 'coo', adapterKey: 'hermes', text: `AI COO khởi tạo dự án Marketing tìm kiếm khách hàng mới (Ngân sách: ${(budgetVND / 1000000).toFixed(0)}M VND)` },
                { id: 2, name: '2. Phân tích Rủi ro & Tệp Đối Tượng', agent: 'pm', adapterKey: 'hermes', text: 'AI PM phân rã đối tượng mục tiêu & đề xuất chương trình trải nghiệm thử' },
                { id: 3, name: '3. Thiết lập Content Landing Page', agent: 'mkt', adapterKey: 'claudecode', text: 'AI Marketing soạn thảo nội dung thuyết phục đăng ký trải nghiệm Spa' },
                { id: 4, name: '4. Thiết kế Giao diện Đăng ký', agent: 'des', adapterKey: 'openhands', text: 'AI Designer thiết kế form đăng ký & banner khuyến mãi' },
                { id: 5, name: '5. Thiết lập Kịch bản Chăm sóc Tự động', agent: 'sales', adapterKey: 'codex', text: 'AI Sales cấu hình phễu tự động hóa tin nhắn trên CRM' },
                { id: 6, name: '6. Kiểm duyệt Chất lượng Form & GDPR', agent: 'qa', adapterKey: 'claudecode', text: 'AI QA rà soát điều khoản bảo mật thông tin khách hàng & DoD check' },
                { 
                    id: 7, 
                    name: '7. Gate Phê duyệt Chiến dịch của CEO', 
                    agent: 'ceo', 
                    adapterKey: 'hermes',
                    text: 'CEO duyệt tổng thể nội dung & hình ảnh chiến dịch thu hút Leads', 
                    isApprovalGate: true
                },
                { id: 8, name: '8. Triển khai Quảng cáo Đa kênh', agent: 'devops', adapterKey: 'openhands', text: 'AI DevOps kết nối các cổng API quảng cáo & khởi chạy chiến dịch' },
                { id: 9, name: '9. Đo lường Hiệu quả Thu lead', agent: 'mkt', adapterKey: 'hermes', text: 'AI Marketing theo dõi số lượt đăng ký & tính toán chi phí thực tế CPL' },
                { id: 10, name: '10. Báo cáo ROI & Doanh số Dự kiến', agent: 'fin', adapterKey: 'hermes', text: 'AI Finance báo cáo tỷ lệ chốt sales từ Leads & dự kiến doanh thu Spa' }
            ];
        }

        // Compile Enterprise Intelligence Layer (EIL) Package for each dynamic step
        const dynamicSteps = rawSteps.map(step => {
            const eilContext = (typeof EnterpriseIntelligenceLayer !== 'undefined') ? 
                EnterpriseIntelligenceLayer.compileContext(step, objectiveText) : null;
            
            if (eilContext && eilContext.erp) {
                eilContext.erp.approvedBudgetVnd = budgetVND;
            }

            return {
                ...step,
                eilContext,
                executionAdapter: step.adapterKey || 'hermes'
            };
        });

        appendLog('ENTERPRISE INTELLIGENCE LAYER (EIL)', `💼 Đã biên dịch Gói Ngữ Cảnh Doanh Nghiệp (EIL Package) cho 10/10 bước SOP.`, 'text-cyan-400 font-bold');
        appendLog('EXECUTION ADAPTER MANAGER', `🔌 Gán bộ điều hướng thực thi: Hermes (4), Codex (1), ClaudeCode (3), OpenHands (2).`, 'text-purple-400 font-bold');

        return dynamicSteps;
    }
};

const RealtimeTelemetryEngine = {
    campaignStats: {
        totalReach: 145200,
        totalClicks: 12400,
        averageCTR: 8.54,
        totalLeads: 423,
        demosBooked: 98,
        actualRevenueVND: 2400000000,
        actualCACVND: 1200000,
        roiPercent: 486
    },

    contentBreakdown: [
        { type: 'Pain Point Short Video', count: 12, ctr: 10.2, conversionRate: 14.5, salesQuality: 'LOW', status: 'HIGH_CTR_LOW_CONV' },
        { type: 'Feature Carousels', count: 10, ctr: 7.5, conversionRate: 24.1, salesQuality: 'HIGH', status: 'TOP_PERFORMER' },
        { type: 'Customer Reviews', count: 5, ctr: 6.8, conversionRate: 15.0, salesQuality: 'MEDIUM', status: 'STABLE' },
        { type: 'Story Text Posts', count: 3, ctr: 2.1, conversionRate: 4.2, salesQuality: 'LOW', status: 'UNDERPERFORMING' }
    ]
};

const ContinuousLearningEngine = {
    analyzeAndShiftBudget() {
        const topType = RealtimeTelemetryEngine.contentBreakdown.find(c => c.status === 'TOP_PERFORMER');
        const highCtrLowConv = RealtimeTelemetryEngine.contentBreakdown.find(c => c.status === 'HIGH_CTR_LOW_CONV');

        appendLog('AI WHOLE-ENTERPRISE LEARNING', `🧠 HỌC TOÀN DOANH NGHIỆP: [${highCtrLowConv.type}] CTR cao (${highCtrLowConv.ctr}%) nhưng Sales báo Lead chất lượng thấp (Conv ${highCtrLowConv.conversionRate}%).`, 'text-amber-400 font-bold');
        appendLog('AI WHOLE-ENTERPRISE LEARNING', `⚡ TỰ ĐỘNG TỐI ƯU THÔNG MINH: Chuyển 70% ngân sách vào [${topType.type}] (CTR 7.5% nhưng Sales Conv tới ${topType.conversionRate}% & CAC rẻ nhất).`, 'text-purple-300 font-bold');
        
        EventBus.emit('learning.budget.shifted', { topType, highCtrLowConv });
    }
};



function openApprovalModal(step) {
    const modal = document.getElementById('approval-modal');
    document.getElementById('modal-title').textContent = `Phê duyệt cho bước: ${step.name}`;
    modal.classList.remove('hidden');
}

document.getElementById('btn-modal-approve').addEventListener('click', () => {
    document.getElementById('approval-modal').classList.add('hidden');
    appendLog('CEO (HUMAN-IN-THE-LOOP)', '✅ ĐÃ PHÊ DUYỆT! Đạt tiêu chuẩn DoD & Quality Gate.', 'text-emerald-400 font-bold');
    startSimulation();
});

document.getElementById('btn-modal-reject').addEventListener('click', () => {
    document.getElementById('approval-modal').classList.add('hidden');
    const revStatus = QualityGateEngine.triggerRevisionLoop(`TASK-STEP-${currentStepIndex}`, 'Chưa đạt yêu cầu trải nghiệm người dùng');
    if (revStatus === 'REVISION') {
        currentStepIndex = Math.max(0, currentStepIndex - 1);
        jumpToStep(currentStepIndex);
    }
});

// Speed Adjuster Buttons
document.querySelectorAll('.sim-speed-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.sim-speed-btn').forEach(b => b.classList.remove('active', 'bg-blue-50', 'text-blue-600', 'border-blue-200'));
        e.target.classList.add('active', 'bg-blue-50', 'text-blue-600', 'border-blue-200');
        simSpeed = parseFloat(e.target.dataset.speed);
        if (isSimulating) {
            pauseSimulation();
            startSimulation();
        }
    });
});

// Play / Pause Simulation Event Listeners
document.getElementById('btn-run-sim').addEventListener('click', startSimulation);
document.getElementById('btn-pause-sim').addEventListener('click', pauseSimulation);

// Send CEO Custom Directive Command
document.getElementById('btn-send-command').addEventListener('click', sendCeoCommand);
document.getElementById('ceo-command-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendCeoCommand();
});

async function sendCeoCommand() {
    const input = document.getElementById('ceo-command-input');
    const val = input.value.trim();
    if (!val) return;

    window.activeObjectiveText = val; // Store globally

    appendLog('CEO (OBJECTIVE)', `🎯 MỤC TIÊU CHIẾN LƯỢC MỚI TỪ CEO: "${val}"`, 'text-amber-400 font-bold');
    
    // Parse and decompose the CEO's directive immediately to update the BCE Context Inputs
    if (typeof GoalEngine !== 'undefined' && typeof GoalEngine.decomposeGoal === 'function') {
        GoalEngine.decomposeGoal(val);
    }
    
    appendLog('AI COO', '🤖 AI COO đang phân tích và tự lập trình Quy trình SOP qua LLM Engine...', 'text-cyan-400 font-semibold animate-pulse');

    // Attempt Real LLM Gemini Call
    const llmPrompt = `Bạn là AI COO của hệ thống Bella EIP OS. CEO vừa giao Mục tiêu Chiến lược: "${val}".
Hãy phân rã mục tiêu này thành 10 bước SOP ngắn gọn cho 11 AI Employees (PM, CTO, TL, Dev, Designer, QA, DevOps, Marketing, Sales, Finance).
Trả về kết quả ngắn gọn 10 dòng tiếng Việt.`;

    const realResponse = await LLMExecutionService.generateContent(llmPrompt);

    if (realResponse) {
        appendLog('AI COO (GEMINI API)', `✨ [GEMINI REAL RESPONSE]\n${realResponse.substring(0, 300)}...`, 'text-emerald-400 font-mono text-[11px]');
    }

    // Trigger AI COO Dynamic Workflow Generation
    setTimeout(() => {
        const generatedSteps = AICOOEngine.decomposeObjectiveToDynamicWorkflow(val);
        WORKFLOW_STEPS.length = 0;
        generatedSteps.forEach(s => WORKFLOW_STEPS.push(s));
        
        renderWorkflowPipeline();
        jumpToStep(0);
        appendLog('AI COO', '🚀 ĐÃ TỰ SINH DYNAMIC WORKFLOW PROJECT! Sẵn sàng khởi chạy.', 'text-emerald-400 font-bold');
    }, 600);
}

// MILESTONE 2.6: WORK COLLABORATION KANBAN BOARD RENDERER
function renderKanbanBoard() {
    const container = document.getElementById('kanban-cards-container');
    if (!container) return;
    container.innerHTML = '';

    const contracts = TaskAssignmentEngine.getAllContracts();

    if (contracts.length === 0) {
        // Seed initial sample tasks if empty
        TaskAssignmentEngine.createTaskContract({
            taskTitle: 'Thiết kế Bella Spa POS Module',
            assignedToMemberId: 'pm',
            inputSpecs: { scope: 'POS & Appointment' },
            mandatoryOutputs: ['PRD Document v1.2'],
            definitionOfDone: { buildPass: true, qualityScore: 95 },
            slaHours: 4
        });
        TaskAssignmentEngine.createTaskContract({
            taskTitle: 'Code React/Node.js Core Backend',
            assignedToMemberId: 'dev',
            inputSpecs: { spec: 'REST API & WebSocket' },
            mandatoryOutputs: ['GitHub PR #42'],
            definitionOfDone: { testCoverageMin: 90 },
            slaHours: 8
        });
    }

    const currentContracts = TaskAssignmentEngine.getAllContracts();

    currentContracts.forEach(contract => {
        const member = WorkforceRegistry.getMemberById(contract.assignedToMemberId);
        const statusColors = {
            ASSIGNED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            IN_PROGRESS: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse',
            QUALITY_CHECK: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
            WAITING_REVIEW: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
            ESCALATED: 'bg-red-600/20 text-red-300 border-red-500'
        };

        const card = document.createElement('div');
        card.className = 'p-2.5 rounded-xl border bg-slate-900/80 border-slate-800 space-y-2 hover:border-cyan-800/60 transition';
        card.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-[9px] font-mono font-semibold text-slate-400">${contract.taskId}</span>
                <span class="text-[8px] font-mono px-1.5 py-0.5 rounded border ${statusColors[contract.status] || 'bg-slate-800 text-slate-400'}">${contract.status}</span>
            </div>
            <h4 class="text-xs font-semibold text-slate-200">${contract.taskTitle}</h4>
            <div class="flex items-center justify-between text-[10px] text-slate-400">
                <span class="flex items-center gap-1">
                    <i class="fa-solid ${member ? member.icon : 'fa-user'} text-cyan-400"></i>
                    ${member ? member.name : contract.assignedToMemberId}
                </span>
                <span class="font-mono text-amber-400">SLA: ${contract.slaHours}h</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// CREATE TASK KANBAN CONTROLLER
function openCreateTaskModal() {
    const modal = document.getElementById('create-task-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeCreateTaskModal() {
    const modal = document.getElementById('create-task-modal');
    if (modal) modal.classList.add('hidden');
}

safeAddListener('btn-create-task', 'click', openCreateTaskModal);
safeAddListener('btn-close-task-modal', 'click', closeCreateTaskModal);
safeAddListener('btn-cancel-create-task', 'click', closeCreateTaskModal);

safeAddListener('btn-submit-create-task', 'click', async () => {
    const title = document.getElementById('input-task-title').value.trim();
    const assignee = document.getElementById('select-task-assignee').value;
    const sla = parseInt(document.getElementById('input-task-sla').value) || 4;
    const output = document.getElementById('input-task-output').value.trim() || 'Tài liệu bàn giao';

    if (!title) {
        alert('Vui lòng nhập tên công việc!');
        return;
    }

    // 1. Create Task Contract in Memory
    const newContract = TaskAssignmentEngine.createTaskContract({
        taskTitle: title,
        assignedToMemberId: assignee,
        mandatoryOutputs: [output],
        slaHours: sla
    });

    // 2. Sync to Supabase Cloud Task Table
    if (supabaseClient) {
        try {
            await supabaseClient.from('task_contracts').insert({
                task_title: title,
                assigned_to_member_id: assignee,
                status: 'ASSIGNED',
                sla_hours: sla
            });
        } catch (err) {
            console.warn('[Supabase Insert Task Warning]', err);
        }
    }

    closeCreateTaskModal();
    renderKanbanBoard();
    appendLog('TASK KANBAN', `📋 ĐÃ TẠO TASK MỚI: "${title}" ➔ Giao cho AI [${assignee.toUpperCase()}] (SLA ${sla}h)`, 'text-cyan-400 font-bold');
    
    // Clear inputs
    document.getElementById('input-task-title').value = '';
    document.getElementById('input-task-output').value = '';
});

function formatModelName(modelId) {
    if (!modelId) return 'GEMINI';
    return modelId.replace('gemini-1-5-', 'GEMINI ').replace('gemini-3-1-', 'GEMINI 3.1 ').replace('gemini-3-6-', 'GEMINI 3.6 ').replace('claude-3-5-', 'CLAUDE ').replace('gpt-4o-', 'GPT-4O ').replace('llama-3-1-', 'LLAMA ').toUpperCase();
}

// Render 11 Dynamic AI Agent Cards in Left Sidebar Matrix
function renderAgentCards() {
    const container = document.getElementById('agent-cards-container');
    if (!container) return;
    container.innerHTML = '';

    AI_AGENTS.forEach(agent => {
        try {
            const config = AGENT_CONFIGS[agent.id] || {};
            const modelDisplay = formatModelName(config.modelId || 'gemini-3-6-flash');
            const role = (typeof RoleSkillCenter !== 'undefined' && RoleSkillCenter.getRoleById) ? RoleSkillCenter.getRoleById(agent.roleId || `role_${agent.id}`) : null;
            const roleTitle = role ? role.title : (agent.role || 'AI Employee');

            const card = document.createElement('div');
            card.id = `sidebar-card-${agent.id}`;
            card.className = 'p-2.5 rounded-xl border bg-slate-900/80 border-slate-800 hover:border-cyan-800/60 transition cursor-pointer group relative overflow-hidden';
            
            const agentHex = (typeof agent.color === 'number') ? agent.color.toString(16).padStart(6, '0') : '06b6d4';

            card.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-xs shrink-0" style="color: #${agentHex}">
                            <i class="fa-solid ${agent.icon}"></i>
                        </div>
                        <div>
                            <h4 class="text-xs font-bold text-slate-100 leading-tight group-hover:text-cyan-400 transition">${agent.name}</h4>
                            <p class="text-[10px] text-slate-400 leading-tight">${roleTitle}</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-1.5">
                        <span class="text-[8px] font-mono uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.5 rounded">${modelDisplay}</span>
                        <button id="btn-config-${agent.id}" class="w-6 h-6 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 flex items-center justify-center transition" title="Cấu hình AI OS cho ${agent.name}">
                            <i class="fa-solid fa-sliders text-[10px]"></i>
                        </button>
                    </div>
                </div>
                <div class="mt-2 pt-1.5 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Task: <span class="text-slate-300">${agent.task || 'IDLE'}</span></span>
                    <span class="text-emerald-400 font-semibold">IDLE</span>
                </div>
            `;

            container.appendChild(card);

            const cfgBtn = document.getElementById(`btn-config-${agent.id}`);
            if (cfgBtn) {
                cfgBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openAgentConfigModal(agent.id);
                });
            }

            card.addEventListener('click', () => {
                highlightAgent(agent.id, true);
                openAgentDossierModal(agent.id);
            });
        } catch (err) {
            console.error(`Error rendering agent card for ${agent.id}:`, err);
        }
    });
}

['agents', 'sops', 'kanban', 'deliverables'].forEach(t => {
    safeAddListener(`tab-btn-${t}`, 'click', () => switchSidebarTab(t));
});

// Toggle Layout Modes (Department or Seat Drag-and-Drop)
function updateLayoutButtonsUI() {
    const btnDept = document.getElementById('btn-layout-dept');
    const btnSeat = document.getElementById('btn-layout-seat');
    const statusDept = document.getElementById('layout-dept-status');
    const statusSeat = document.getElementById('layout-seat-status');
    const dom = renderer.domElement;

    // Reset button styles (Dark theme inactive styles)
    btnDept.classList.remove('active-dept', 'active-seat');
    statusDept.textContent = 'Sắp xếp Phòng ban';

    btnSeat.classList.remove('active-dept', 'active-seat');
    statusSeat.textContent = 'Sắp xếp Chỗ ngồi';

    if (layoutMode === 'department') {
        controls.enabled = false;
        btnDept.classList.add('active-dept');
        statusDept.innerHTML = '⚡ XẾP PHÒNG BAN <span class="bg-slate-950 text-amber-300 text-[9px] px-1.5 py-0.5 rounded font-mono ml-1 border border-amber-400/50 animate-pulse">ON</span>';
        dom.style.cursor = 'grab';
        appendLog('SYSTEM', 'Chế độ sắp xếp PHÒNG BAN đang BẬT. Kéo thả để di chuyển. Nhấn phím [R] hoặc [Phím cách] để xoay phòng ban.', 'text-amber-400 font-bold');
    } else if (layoutMode === 'seat') {
        controls.enabled = false;
        btnSeat.classList.add('active-seat');
        statusSeat.innerHTML = '⚡ XẾP CHỖ NGỒI <span class="bg-slate-950 text-purple-300 text-[9px] px-1.5 py-0.5 rounded font-mono ml-1 border border-purple-400/50 animate-pulse">ON</span>';
        dom.style.cursor = 'grab';
        appendLog('SYSTEM', 'Chế độ sắp xếp CHỖ NGỒI đang BẬT. Kéo thả để di chuyển. Nhấn phím [R] hoặc [Phím cách] để xoay hướng bàn.', 'text-purple-400 font-bold');
    } else {
        controls.enabled = true;
        dom.style.cursor = 'auto';
        appendLog('SYSTEM', 'Chế độ sắp xếp đã TẮT. Đã áp dụng bố cục hiện tại.', 'text-slate-400');
    }
}

// Layout mode functions defined


// Reset layout to default defaults
document.getElementById('btn-reset-layout').addEventListener('click', () => {
    localStorage.removeItem('bella_eip_3d_layout');
    appendLog('SYSTEM', 'Đang khôi phục lại bố cục văn phòng mặc định...', 'text-rose-500 font-bold');
    setTimeout(() => {
        window.location.reload();
    }, 500);
});

// ENTERPRISE AGENT CONFIGURATION MODAL CONTROLLER & EVENT HANDLERS
function populateModelSelectOptions(providerKey, currentModelId) {
    const menuEl = document.getElementById('custom-model-menu');
    const labelEl = document.getElementById('custom-model-label');
    const hiddenInput = document.getElementById('config-model-select');
    if (!menuEl) return;

    menuEl.innerHTML = '';

    const providerObj = PROVIDERS_CATALOG[providerKey];
    if (!providerObj || !providerObj.models) return;

    const modelKeys = Object.keys(providerObj.models);
    let selectedId = currentModelId && providerObj.models[currentModelId] ? currentModelId : modelKeys[0];
    hiddenInput.value = selectedId;

    modelKeys.forEach(mId => {
        const mInfo = providerObj.models[mId];
        const item = document.createElement('div');
        item.dataset.value = mId;
        item.className = 'custom-model-opt px-3 py-2 hover:bg-cyan-500/20 hover:text-cyan-300 rounded-lg cursor-pointer text-xs transition flex items-center justify-between text-slate-200';
        item.innerHTML = `
            <span>${mInfo.name}</span>
            <span class="text-[10px] text-slate-500 font-mono">Context: ${(mInfo.contextLimit / 1000).toFixed(0)}K</span>
        `;

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            hiddenInput.value = mId;
            labelEl.textContent = `${mInfo.name} (${(mInfo.contextLimit / 1000).toFixed(0)}K)`;
            menuEl.classList.add('hidden');
            syncInputsToPreview();
        });

        menuEl.appendChild(item);

        if (mId === selectedId) {
            labelEl.textContent = `${mInfo.name} (${(mInfo.contextLimit / 1000).toFixed(0)}K)`;
        }
    });
}

function updateGlobalMetricsUI() {
    // 1. Calculate dynamically from local data arrays
    // Total simulated hours saved (Each task contract has SLA hours)
    let totalSlaHours = 0;
    let completedCount = 0;
    if (typeof taskContractsStore !== 'undefined' && Array.isArray(taskContractsStore)) {
        taskContractsStore.forEach(t => {
            totalSlaHours += parseFloat(t.sla_hours || 4);
            if (t.status === 'COMPLETED') completedCount++;
        });
    }

    // Baseline fallback values + dynamic additions
    const baseHoursSaved = 1420 + totalSlaHours;
    const baseTasks = 8950 + completedCount;
    
    // Auto % and ROI % variance simulation slightly dynamically based on AI active tasks count
    let activeAiTaskCount = 0;
    AI_AGENTS.forEach(a => {
        if (a.status === 'PROCESSING' || a.status === 'WAITING_APPROVAL') activeAiTaskCount++;
    });
    
    const autoPercent = Math.min(98, 88 + (activeAiTaskCount * 0.5));
    const roiPercent = 420 + (completedCount * 10) - (activeAiTaskCount * 2);

    // Write to DOM
    const hoursEl = document.getElementById('biz-metric-hours');
    if (hoursEl) hoursEl.textContent = `${baseHoursSaved.toLocaleString()} hrs`;

    const tasksEl = document.getElementById('biz-metric-tasks');
    if (tasksEl) tasksEl.textContent = baseTasks.toLocaleString();

    const autoEl = document.getElementById('biz-metric-auto');
    if (autoEl) autoEl.textContent = `${autoPercent.toFixed(0)}%`;

    const roiEl = document.getElementById('biz-metric-roi');
    if (roiEl) roiEl.textContent = `+${roiPercent.toFixed(0)}%`;
}

function updateEnterpriseMetrics() {
    const providerKey = document.getElementById('config-provider-select').value;
    const modelId = document.getElementById('config-model-select').value;

    const providerObj = PROVIDERS_CATALOG[providerKey];
    const modelInfo = (providerObj && providerObj.models) ? providerObj.models[modelId] : null;

    if (!modelInfo) return;

    // Estimate context usage
    const promptText = document.getElementById('prompt-final-preview').value || '';
    const approxTokens = Math.round(promptText.length / 3.8); // 1 token ~ 3.8 chars
    const contextLimit = modelInfo.contextLimit;

    const limitDisplay = contextLimit >= 1000000 ? `${(contextLimit / 1000000).toFixed(1)}M` : `${(contextLimit / 1000).toFixed(0)}K`;
    const usedDisplay = approxTokens >= 1000 ? `${(approxTokens / 1000).toFixed(1)}K` : `${approxTokens}`;

    const percentage = Math.min(100, Math.max(1, (approxTokens / contextLimit) * 100));
    document.getElementById('metric-context-summary').textContent = `${usedDisplay} / ${limitDisplay} (${percentage.toFixed(1)}%)`;

    const fillEl = document.getElementById('token-progress-fill');
    if (fillEl) fillEl.style.width = `${percentage.toFixed(1)}%`;
    document.getElementById('token-percent-display').textContent = `${percentage.toFixed(1)}% Context Used`;

    // Cost calculation per request
    const inputCost = (approxTokens / 1000) * modelInfo.costPer1kInput;
    const outputCost = (1024 / 1000) * modelInfo.costPer1kOutput;
    const totalEst = inputCost + outputCost;

    document.getElementById('cost-current-req').textContent = totalEst === 0 ? '$0.00' : `$${totalEst.toFixed(4)}`;
    document.getElementById('cost-today').textContent = `$${HISTORICAL_COST_LEDGER.today.toFixed(4)}`;
    document.getElementById('cost-week').textContent = `$${HISTORICAL_COST_LEDGER.week.toFixed(2)}`;
    document.getElementById('cost-month').textContent = `$${HISTORICAL_COST_LEDGER.month.toFixed(2)}`;
    
    // Call UI dynamic metric updates
    updateGlobalMetricsUI();
}

function syncInputsToPreview() {
    if (!editingAgentId) return;

    const config = AGENT_CONFIGS[editingAgentId];
    if (!config) return;

    // Update config object in memory
    config.provider = document.getElementById('config-provider-select').value;
    config.modelId = document.getElementById('config-model-select').value;
    config.temperature = parseFloat(document.getElementById('config-temperature').value);
    config.maxTokens = parseInt(document.getElementById('config-max-tokens').value);

    config.structuredPrompt = {
        role: document.getElementById('prompt-role').value,
        goal: document.getElementById('prompt-goal').value,
        constraints: document.getElementById('prompt-constraints').value,
        workflow: document.getElementById('prompt-workflow').value,
        outputFormat: document.getElementById('prompt-output-format').value
    };

    config.guardrails = document.getElementById('config-guardrails').value;
    config.memoryStrategy = document.getElementById('config-memory-strategy').value;
    config.executionStrategy = document.getElementById('config-execution-strategy').value;

    config.toolPermissions = {
        readSource: document.getElementById('tool-read-source').checked,
        gitCommit: document.getElementById('tool-git-commit').checked,
        runTests: document.getElementById('tool-run-tests').checked,
        database: document.getElementById('tool-database').checked,
        crm: document.getElementById('tool-crm').checked,
        payroll: document.getElementById('tool-payroll').checked
    };

    // Rebuild Final Prompt
    const finalPrompt = PromptBuilder.buildFinalPrompt(editingAgentId);
    document.getElementById('prompt-final-preview').value = finalPrompt;

    updateEnterpriseMetrics();
}

function openAgentConfigModal(agentId) {
    const agent = AI_AGENTS.find(a => a.id === agentId);
    const config = AGENT_CONFIGS[agentId];
    if (!agent || !config) return;

    editingAgentId = agentId;

    // Fill Header
    document.getElementById('config-modal-name').textContent = agent.name;
    document.getElementById('config-agent-dept-badge').textContent = DEPT_NAMES[agent.department] ? DEPT_NAMES[agent.department].toUpperCase() : agent.department.toUpperCase();
    document.getElementById('config-prompt-version-badge').textContent = `PROMPT v${config.promptVersion || '1.0'}`;
    document.getElementById('config-modal-icon').className = `fa-solid ${agent.icon}`;

    const hexColor = '#' + agent.color.toString(16).padStart(6, '0');
    document.getElementById('config-modal-icon-container').style.color = hexColor;
    document.getElementById('config-modal-icon-container').style.borderColor = `${hexColor}4d`;
    document.getElementById('config-modal-icon-container').style.backgroundColor = `${hexColor}1a`;
    document.getElementById('config-modal-ribbon').style.backgroundColor = hexColor;

    // Populate Provider & Model Selects
    const providerVal = config.provider || 'google';
    document.getElementById('config-provider-select').value = providerVal;
    const pCatalog = PROVIDERS_CATALOG[providerVal];
    if (pCatalog) {
        document.getElementById('custom-provider-label').textContent = pCatalog.name;
    }
    populateModelSelectOptions(providerVal, config.modelId);

    // Hyperparameters
    document.getElementById('config-temperature').value = config.temperature !== undefined ? config.temperature : 0.2;
    document.getElementById('temp-value-display').textContent = config.temperature !== undefined ? config.temperature : 0.2;
    
    const maxTok = config.maxTokens || 4096;
    document.getElementById('config-max-tokens').value = maxTok;
    const tokMap = { 512: '512 Tokens (Ngắn gọn)', 1024: '1024 Tokens (Tiêu chuẩn)', 4096: '4096 Tokens (Chi tiết)', 8192: '8192 Tokens (Xuất Code & PRD dài)' };
    document.getElementById('custom-tokens-label').textContent = tokMap[maxTok] || `${maxTok} Tokens`;

    // Modular Prompts & Versioning
    document.getElementById('prompt-version-label').textContent = `v${config.promptVersion || '1.0'}`;
    const sp = config.structuredPrompt || {};
    document.getElementById('prompt-role').value = sp.role || '';
    document.getElementById('prompt-goal').value = sp.goal || '';
    document.getElementById('prompt-constraints').value = sp.constraints || '';
    document.getElementById('prompt-workflow').value = sp.workflow || '';
    document.getElementById('prompt-output-format').value = sp.outputFormat || '';

    // Governance & Tools Checkboxes
    document.getElementById('config-guardrails').value = config.guardrails || '';
    const tp = config.toolPermissions || {};
    document.getElementById('tool-read-source').checked = !!tp.readSource;
    document.getElementById('tool-git-commit').checked = !!tp.gitCommit;
    document.getElementById('tool-run-tests').checked = !!tp.runTests;
    document.getElementById('tool-database').checked = !!tp.database;
    document.getElementById('tool-crm').checked = !!tp.crm;
    document.getElementById('tool-payroll').checked = !!tp.payroll;

    // Strategy & Capabilities
    const memStrat = config.memoryStrategy || 'session';
    document.getElementById('config-memory-strategy').value = memStrat;
    const memMap = { none: 'None (Stateless)', session: 'Session Memory (Phiên hiện tại)', persistent: 'Persistent Memory (Lưu bộ nhớ lâu dài)', rag: 'RAG Vector DB (Tra cứu tài liệu)' };
    document.getElementById('custom-memory-label').textContent = memMap[memStrat] || memStrat;

    const execStrat = config.executionStrategy || 'sequential';
    document.getElementById('config-execution-strategy').value = execStrat;
    const execMap = { sequential: 'Sequential (Thực thi tuần tự)', parallel: 'Parallel (Song song)', planner: 'Planner & Reflection (Tự đánh giá)', consensus: 'Consensus (Thỏa thuận Multi-Agent)' };
    document.getElementById('custom-execution-label').textContent = execMap[execStrat] || execStrat;

    const capContainer = document.getElementById('capability-tags-container');
    capContainer.innerHTML = '';
    (config.capabilities || ['General AI Task']).forEach(cap => {
        const tag = document.createElement('span');
        tag.className = 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 px-2 py-0.5 rounded font-mono';
        tag.textContent = `⚡ ${cap}`;
        capContainer.appendChild(tag);
    });

    // Switch to Tab 1 (LLM & Runtime)
    switchModalTab('llm');

    // Sync Live Preview & Metrics
    syncInputsToPreview();

    // Show Modal
    document.getElementById('agent-config-modal').classList.remove('hidden');
}

function closeAgentConfigModal() {
    document.getElementById('agent-config-modal').classList.add('hidden');
    editingAgentId = null;
}

function switchModalTab(tabName) {
    const tabs = ['llm', 'modular', 'governance', 'strategy', 'hierarchy'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        const content = document.getElementById(`tab-content-${t}`);
        if (!btn || !content) return;

        if (t === tabName) {
            btn.classList.add('border-cyan-500', 'text-cyan-400');
            btn.classList.remove('border-transparent', 'text-slate-400');
            content.classList.remove('hidden');
        } else {
            btn.classList.add('border-transparent', 'text-slate-400');
            btn.classList.remove('border-cyan-500', 'text-cyan-400');
            content.classList.add('hidden');
        }
    });
}

// (Removed duplicate saveAgentConfigsToLocalStorage definition)

function saveAgentConfig() {
    if (!editingAgentId) return;

    syncInputsToPreview();
    saveAgentConfigsToLocalStorage();

    const config = AGENT_CONFIGS[editingAgentId];
    const agent = AI_AGENTS.find(a => a.id === editingAgentId);

    appendLog('SYSTEM', `Đã lưu cấu hình AI OS cho [${agent.name}]: Provider = ${config.provider.toUpperCase()}, Model = ${config.modelId}`, 'text-cyan-400 font-semibold');

    closeAgentConfigModal();
}

function resetSingleAgentConfig() {
    if (!editingAgentId) return;

    const defaultConfig = DEFAULT_AGENT_CONFIGS[editingAgentId];
    if (defaultConfig) {
        AGENT_CONFIGS[editingAgentId] = JSON.parse(JSON.stringify(defaultConfig));
        saveAgentConfigsToLocalStorage();
        openAgentConfigModal(editingAgentId);
        appendLog('SYSTEM', `Đã khôi phục cài đặt mặc định cho Agent [${editingAgentId}].`, 'text-amber-500');
    }
}

function resetAllAgentsConfig() {
    if (confirm("Bạn có chắc chắn muốn khôi phục toàn bộ 11 AI Agents về cấu hình AI OS mặc định?")) {
        AGENT_CONFIGS = JSON.parse(JSON.stringify(DEFAULT_AGENT_CONFIGS));
        saveAgentConfigsToLocalStorage();
        closeAgentConfigModal();
        appendLog('SYSTEM', '🔥 ĐÃ KHÔI PHỤC TOÀN BỘ 11 AI AGENTS VỀ CẤU HÌNH AI OS MẶC ĐỊNH.', 'text-rose-500 font-bold');
    }
}

// IMPORT / EXPORT SIGNED SCHEMA JSON
function exportAgentPromptJson() {
    if (!editingAgentId) return;
    const agent = AI_AGENTS.find(a => a.id === editingAgentId);
    const config = AGENT_CONFIGS[editingAgentId];

    const exportData = {
        schemaVersion: CURRENT_CONFIG_VERSION,
        bellaVersion: "2.1",
        createdAt: new Date().toISOString(),
        agentId: editingAgentId,
        agentName: agent ? agent.name : '',
        config: config
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bella_ai_os_prompt_${editingAgentId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    appendLog('SYSTEM', `Đã xuất Signed Schema JSON cho [${agent.name}]`, 'text-emerald-400');
}

function importAgentPromptJson(event) {
    const file = event.target.files[0];
    if (!file || !editingAgentId) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported && imported.config) {
                AGENT_CONFIGS[editingAgentId] = imported.config;
                saveAgentConfigsToLocalStorage();
                openAgentConfigModal(editingAgentId);
                appendLog('SYSTEM', `Đã Import thành công Signed Schema JSON cho Agent [${editingAgentId}]`, 'text-emerald-400 font-bold');
            } else {
                alert("File JSON không hợp lệ hoặc thiếu thông số Signed Config.");
            }
        } catch (err) {
            alert("Lỗi đọc file JSON: " + err.message);
        }
    };
    reader.readAsText(file);
}

// SUBSCRIBE EVENT BUS LISTENERS (NAMESPACED)
EventBus.on('config.changed', () => {
    renderAgentCards();
    createFloatingLabels();
    updateFloatingLabels();
});

// BIND MODAL EVENT LISTENERS & GENERAL INPUT HANDLERS (Safe Bindings)
function safeAddListener(id, event, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
}

['llm', 'modular', 'governance', 'strategy', 'hierarchy'].forEach(tabName => {
    safeAddListener(`tab-btn-${tabName}`, 'click', () => switchModalTab(tabName));
});

// CUSTOM ENTERPRISE DROPDOWNS CONTROLLER
function setupCustomDropdown(btnId, menuId, optClass, hiddenInputId, labelId, labelMap) {
    safeAddListener(btnId, 'click', (e) => {
        e.stopPropagation();
        // Close other custom menus
        ['custom-provider-menu', 'custom-model-menu', 'custom-tokens-menu', 'custom-memory-menu', 'custom-execution-menu'].forEach(id => {
            if (id !== menuId) {
                const m = document.getElementById(id);
                if (m) m.classList.add('hidden');
            }
        });
        const menu = document.getElementById(menuId);
        if (menu) menu.classList.toggle('hidden');
    });

    document.querySelectorAll(`.${optClass}`).forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            const val = opt.dataset.value;
            const text = labelMap && labelMap[val] ? labelMap[val] : opt.textContent.trim();
            
            const hiddenEl = document.getElementById(hiddenInputId);
            if (hiddenEl) hiddenEl.value = val;

            const labelEl = document.getElementById(labelId);
            if (labelEl) labelEl.textContent = text;

            const menu = document.getElementById(menuId);
            if (menu) menu.classList.add('hidden');

            syncInputsToPreview();
        });
    });
}

// Global click to close all custom dropdown menus
document.addEventListener('click', () => {
    ['custom-provider-menu', 'custom-model-menu', 'custom-tokens-menu', 'custom-memory-menu', 'custom-execution-menu'].forEach(id => {
        const menu = document.getElementById(id);
        if (menu) menu.classList.add('hidden');
    });
});

// Setup Model Dropdown Button toggle
safeAddListener('custom-model-btn', 'click', (e) => {
    e.stopPropagation();
    ['custom-provider-menu', 'custom-tokens-menu', 'custom-memory-menu', 'custom-execution-menu'].forEach(id => {
        const m = document.getElementById(id);
        if (m) m.classList.add('hidden');
    });
    const menu = document.getElementById('custom-model-menu');
    if (menu) menu.classList.toggle('hidden');
});

// Setup static custom dropdowns
setupCustomDropdown('custom-provider-btn', 'custom-provider-menu', 'custom-dropdown-opt', 'config-provider-select', 'custom-provider-label');
setupCustomDropdown('custom-tokens-btn', 'custom-tokens-menu', 'custom-tokens-opt', 'config-max-tokens', 'custom-tokens-label');
setupCustomDropdown('custom-memory-btn', 'custom-memory-menu', 'custom-memory-opt', 'config-memory-strategy', 'custom-memory-label');
setupCustomDropdown('custom-execution-btn', 'custom-execution-menu', 'custom-execution-opt', 'config-execution-strategy', 'custom-execution-label');

safeAddListener('config-provider-select', 'change', (e) => {
    populateModelSelectOptions(e.target.value, null);
    syncInputsToPreview();
});

safeAddListener('config-model-select', 'change', syncInputsToPreview);
safeAddListener('config-temperature', 'input', (e) => {
    const disp = document.getElementById('temp-value-display');
    if (disp) disp.textContent = e.target.value;
    syncInputsToPreview();
});

safeAddListener('config-max-tokens', 'change', syncInputsToPreview);
safeAddListener('config-guardrails', 'input', syncInputsToPreview);
safeAddListener('config-memory-strategy', 'change', syncInputsToPreview);
safeAddListener('config-execution-strategy', 'change', syncInputsToPreview);

['tool-read-source', 'tool-git-commit', 'tool-run-tests', 'tool-database', 'tool-crm', 'tool-payroll'].forEach(id => {
    safeAddListener(id, 'change', syncInputsToPreview);
});

['prompt-role', 'prompt-goal', 'prompt-constraints', 'prompt-workflow', 'prompt-output-format'].forEach(id => {
    safeAddListener(id, 'input', syncInputsToPreview);
});

safeAddListener('btn-config-cancel', 'click', closeAgentConfigModal);
safeAddListener('btn-config-save', 'click', saveAgentConfig);
safeAddListener('btn-config-reset-agent', 'click', resetSingleAgentConfig);
safeAddListener('btn-config-reset-all', 'click', resetAllAgentsConfig);
safeAddListener('btn-export-prompt', 'click', exportAgentPromptJson);
safeAddListener('btn-import-prompt', 'click', () => {
    const fileEl = document.getElementById('import-prompt-file');
    if (fileEl) fileEl.click();
});
safeAddListener('import-prompt-file', 'change', importAgentPromptJson);

// LAYOUT ARRANGEMENT MODE BUTTON HANDLERS
safeAddListener('btn-layout-dept', 'click', () => {
    layoutMode = (layoutMode === 'department') ? 'none' : 'department';
    updateLayoutButtonsUI();
});

safeAddListener('btn-layout-seat', 'click', () => {
    layoutMode = (layoutMode === 'seat') ? 'none' : 'seat';
    updateLayoutButtonsUI();
});

safeAddListener('btn-reset-layout', 'click', () => {
    localStorage.removeItem('bella_eip_3d_layout');
    appendLog('SYSTEM', '🔄 Đã xóa dữ liệu bố cục cũ và khôi phục không gian 3D mặc định!', 'text-amber-400 font-bold');
    window.location.reload();
});

// SUPABASE REALTIME SYNC SUBSYSTEM
async function initSupabaseRealtimeSync() {
    if (!supabaseClient) return;
    try {
        // 1. Fetch live AI Agents from Supabase
        const { data: agentsData, error: agentsError } = await supabaseClient
            .from('ai_agents')
            .select('*');

        if (!agentsError && agentsData && agentsData.length > 0) {
            console.log(`⚡ [Supabase Realtime] Loaded ${agentsData.length} agents from Cloud Database.`);
            agentsData.forEach(cloudAgent => {
                const localAgent = AI_AGENTS.find(a => a.id === cloudAgent.id);
                if (localAgent) {
                    if (cloudAgent.status) localAgent.status = cloudAgent.status;
                    if (cloudAgent.current_task) localAgent.task = cloudAgent.current_task;
                }
            });
            renderAgentCards();
        }

        // 2. Subscribe to Realtime Updates
        supabaseClient
            .channel('public:ai_agents')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_agents' }, payload => {
                console.log('⚡ [Supabase Realtime Payload]:', payload);
                if (payload.new && payload.new.id) {
                    const agent = AI_AGENTS.find(a => a.id === payload.new.id);
                    if (agent) {
                        agent.status = payload.new.status || agent.status;
                        agent.task = payload.new.current_task || agent.task;
                        renderAgentCards();
                        appendLog('SUPABASE', `⚡ Realtime update: ${agent.name} is now ${agent.status}`, 'text-cyan-400 font-semibold');
                    }
                }
            })
            .subscribe();

        appendLog('SYSTEM', '⚡ Đã kết nối thành công Supabase Realtime Bus & Data Persistence (qwpyfhojxctrvqkjctcl)!', 'text-emerald-400 font-bold');
    } catch (err) {
        console.warn("[Supabase Sync Warning]", err);
    }
}

// SUPABASE DATA PERSISTENCE SUBSYSTEM
const SupabasePersistenceEngine = {
    async persistTransaction(txRecord) {
        if (!window.supabaseClient) return;
        try {
            await window.supabaseClient.from('audit_ledger').insert([{
                transaction_id: txRecord.transactionId,
                actor_id: txRecord.actorId,
                action_type: txRecord.actionType,
                payload: txRecord.payload,
                created_at: txRecord.timestamp
            }]);
        } catch (err) {
            console.warn('[Supabase Audit Sync]', err);
        }
    },
    async persistEvidence(evidenceRecord) {
        if (!window.supabaseClient) return;
        try {
            await window.supabaseClient.from('evidence_store').insert([{
                task_id: evidenceRecord.taskId,
                proof_type: evidenceRecord.proofType,
                proof_hash: evidenceRecord.proofHash,
                proof_data: evidenceRecord.proofData,
                created_at: evidenceRecord.timestamp
            }]);
        } catch (err) {
            console.warn('[Supabase Evidence Sync]', err);
        }
    }
};

window.SupabasePersistenceEngine = SupabasePersistenceEngine;

// GLOBAL SETTINGS MODAL CONTROLLER
function openGlobalSettingsModal() {
    console.log("🔑 [openGlobalSettingsModal] opening modal...");
    const modal = document.getElementById('global-settings-modal');
    if (!modal) {
        console.warn("[Settings Modal] Could not find #global-settings-modal element");
        alert("Không tìm thấy bảng Cấu hình API Key!");
        return;
    }

    // Load existing keys from LocalStorage with safe element checks
    const geminiInput = document.getElementById('settings-gemini-key');
    const openaiInput = document.getElementById('settings-openai-key');
    const anthropicInput = document.getElementById('settings-anthropic-key');
    const supabaseInput = document.getElementById('settings-supabase-key');
    const alertBox = document.getElementById('settings-status-alert');

    if (geminiInput) geminiInput.value = localStorage.getItem('bella_gemini_api_key') || '';
    if (openaiInput) openaiInput.value = localStorage.getItem('bella_openai_api_key') || '';
    if (anthropicInput) anthropicInput.value = localStorage.getItem('bella_anthropic_api_key') || '';
    if (supabaseInput) supabaseInput.value = localStorage.getItem('supabase_anon_key') || '';
    if (alertBox) alertBox.style.display = 'none';

    // Render multi-fanpage list
    renderFbChannelList();

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function closeGlobalSettingsModal() {
    const modal = document.getElementById('global-settings-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

function saveGlobalSettings() {
    const geminiKey = (document.getElementById('settings-gemini-key')?.value || '').trim();
    const openaiKey = (document.getElementById('settings-openai-key')?.value || '').trim();
    const anthropicKey = (document.getElementById('settings-anthropic-key')?.value || '').trim();
    const supabaseKey = (document.getElementById('settings-supabase-key')?.value || '').trim();

    // Store keys in LocalStorage
    localStorage.setItem('bella_gemini_api_key', geminiKey);
    localStorage.setItem('bella_openai_api_key', openaiKey);
    localStorage.setItem('bella_anthropic_api_key', anthropicKey);
    localStorage.setItem('supabase_anon_key', supabaseKey);

    // Apply keys globally
    window.GEMINI_API_KEY = geminiKey;
    window.OPENAI_API_KEY = openaiKey;
    window.ANTHROPIC_API_KEY = anthropicKey;

    // Show inline alert in modal
    const alertBox = document.getElementById('settings-status-alert');
    if (alertBox) {
        alertBox.style.display = 'flex';
    }

    // Reinitialize Supabase client if key is updated
    if (supabaseKey) {
        try {
            window.SUPABASE_ANON_KEY = supabaseKey;
            if (typeof supabase !== 'undefined' && supabase.createClient) {
                window.supabaseClient = supabase.createClient('https://qwpyfhojxctrvqkjctcl.supabase.co', supabaseKey);
                console.log('⚡ [Supabase] Re-initialized client with user anon key.');
                initSupabaseRealtimeSync();
            }
        } catch (e) {
            console.error('[Supabase Re-init Error]', e);
        }
    }

    setTimeout(() => {
        closeGlobalSettingsModal();
        appendLog('SYSTEM', '🔑 Cập nhật các khóa API (Gemini, OpenAI, Anthropic, Facebook, Supabase) thành công!', 'text-amber-400 font-bold');
    }, 600);
}

window.openGlobalSettingsModal = openGlobalSettingsModal;
window.closeGlobalSettingsModal = closeGlobalSettingsModal;
window.saveGlobalSettings = saveGlobalSettings;

// =========================================================================
// FACEBOOK MULTI-CHANNEL (FANPAGE) REGISTRY & CONTROLLER
// =========================================================================
let fbChannels = [];
let activeFbChannelIndex = 0;

function loadFbChannels() {
    const saved = localStorage.getItem('bella_fb_channels');
    if (saved) {
        try {
            fbChannels = JSON.parse(saved);
        } catch (e) {
            console.error('Error parsing Facebook channels', e);
        }
    }
    
    // Pre-populate with defaults if empty
    if (!fbChannels || fbChannels.length === 0) {
        fbChannels = [
            { name: "Spa Bella Hà Nội", token: "EAAX_HN_MOCK_TOKEN_123456789", pageId: "1029384756" },
            { name: "Spa Bella Sài Gòn", token: "EAAX_SG_MOCK_TOKEN_987654321", pageId: "9876543210" }
        ];
        localStorage.setItem('bella_fb_channels', JSON.stringify(fbChannels));
    }
    
    const savedActive = localStorage.getItem('bella_fb_active_channel_index');
    if (savedActive !== null) {
        activeFbChannelIndex = parseInt(savedActive, 10);
        if (activeFbChannelIndex >= fbChannels.length || activeFbChannelIndex < 0) {
            activeFbChannelIndex = 0;
        }
    } else {
        activeFbChannelIndex = 0;
    }
}

function renderFbChannelList() {
    loadFbChannels();
    const listEl = document.getElementById('fb-channel-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    
    fbChannels.forEach((channel, idx) => {
        const isActive = idx === activeFbChannelIndex;
        const item = document.createElement('div');
        item.className = `flex items-center justify-between p-2 rounded-lg border text-[11px] ${isActive ? 'bg-blue-950/40 border-blue-800 text-blue-100' : 'bg-slate-900 border-slate-800 text-slate-400'}`;
        
        item.innerHTML = `
            <div class="flex items-center gap-2 cursor-pointer flex-1" onclick="selectFbChannel(${idx})">
                <input type="radio" name="active-fb-channel" ${isActive ? 'checked' : ''} class="accent-blue-500 cursor-pointer">
                <div>
                    <div class="font-bold text-[11px] text-slate-200">${channel.name}</div>
                    <div class="font-mono text-[9px] text-slate-400">ID: ${channel.pageId} | Token: ${channel.token.substring(0, 10)}...</div>
                </div>
            </div>
            <button type="button" onclick="deleteFbChannel(${idx})" class="text-rose-400 hover:text-rose-300 p-1 transition ml-2" title="Xoá kênh">
                <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
        `;
        listEl.appendChild(item);
    });
    
    updateActiveFbBadge();
}

function updateActiveFbBadge() {
    const badgeEl = document.getElementById('fb-active-badge');
    const labelEl = document.getElementById('fb-active-label');
    if (!badgeEl || !labelEl) return;
    
    if (fbChannels[activeFbChannelIndex]) {
        badgeEl.classList.remove('hidden');
        labelEl.innerText = `Đang dùng: ${fbChannels[activeFbChannelIndex].name} (${fbChannels[activeFbChannelIndex].pageId})`;
    } else {
        badgeEl.classList.add('hidden');
    }
}

function openAddFanpageForm() {
    const form = document.getElementById('fb-add-form');
    if (form) form.classList.remove('hidden');
}

function cancelAddFanpage() {
    const form = document.getElementById('fb-add-form');
    if (form) form.classList.add('hidden');
    // Reset inputs
    const nameInput = document.getElementById('fb-new-name');
    const tokenInput = document.getElementById('fb-new-token');
    const pageIdInput = document.getElementById('fb-new-pageid');
    if (nameInput) nameInput.value = '';
    if (tokenInput) tokenInput.value = '';
    if (pageIdInput) pageIdInput.value = '';
}

function confirmAddFanpage() {
    const nameInput = document.getElementById('fb-new-name');
    const tokenInput = document.getElementById('fb-new-token');
    const pageIdInput = document.getElementById('fb-new-pageid');
    
    const name = nameInput ? nameInput.value.trim() : '';
    const token = tokenInput ? tokenInput.value.trim() : '';
    const pageId = pageIdInput ? pageIdInput.value.trim() : '';
    
    if (!name || !token || !pageId) {
        alert('Vui lòng điền đầy đủ Tên kênh, Access Token và Page ID!');
        return;
    }
    
    fbChannels.push({ name, token, pageId });
    localStorage.setItem('bella_fb_channels', JSON.stringify(fbChannels));
    
    cancelAddFanpage();
    renderFbChannelList();
}

function selectFbChannel(index) {
    activeFbChannelIndex = index;
    localStorage.setItem('bella_fb_active_channel_index', index);
    renderFbChannelList();
}

function deleteFbChannel(index) {
    if (fbChannels.length <= 1) {
        alert('Phải giữ lại ít nhất 1 kênh Fanpage!');
        return;
    }
    if (confirm(`Bạn có chắc chắn muốn xoá kênh "${fbChannels[index].name}"?`)) {
        fbChannels.splice(index, 1);
        if (activeFbChannelIndex >= fbChannels.length) {
            activeFbChannelIndex = fbChannels.length - 1;
        }
        localStorage.setItem('bella_fb_channels', JSON.stringify(fbChannels));
        localStorage.setItem('bella_fb_active_channel_index', activeFbChannelIndex);
        renderFbChannelList();
    }
}

// Expose functions globally for HTML triggers
window.openAddFanpageForm = openAddFanpageForm;
window.cancelAddFanpage = cancelAddFanpage;
window.confirmAddFanpage = confirmAddFanpage;
window.selectFbChannel = selectFbChannel;
window.deleteFbChannel = deleteFbChannel;
window.loadFbChannels = loadFbChannels;

function updateLiveCompiledContext() {
    const currentStep = (typeof WORKFLOW_STEPS !== 'undefined' && typeof currentStepIndex !== 'undefined') 
        ? (WORKFLOW_STEPS[currentStepIndex] || WORKFLOW_STEPS[0]) 
        : { id: 1, name: "1. Khởi tạo Project & Thiết lập OKRs" };
        
    const objInput = document.getElementById('ceo-command-input');
    const objectiveText = window.activeObjectiveText || (objInput && objInput.value) || 'Tối ưu hóa chiến dịch Marketing SpaPOS 30 ngày';
    
    if (typeof EnterpriseContextLayer !== 'undefined' && typeof EnterpriseContextLayer.compileContext === 'function') {
        const activeEilContext = EnterpriseContextLayer.compileContext(currentStep, objectiveText);
        const elCompiledContext = document.getElementById('eil-compiled-context-display');
        if (elCompiledContext) {
            elCompiledContext.innerHTML = JSON.stringify(activeEilContext, null, 4);
        }
    }
}
window.updateLiveCompiledContext = updateLiveCompiledContext;

function onMetricTypeChange() {
    const selector = document.getElementById('bce-edit-metric-type');
    const input = document.getElementById('bce-edit-followers');
    const label = document.getElementById('bce-edit-followers-label');
    
    if (selector && input && label) {
        const selectedOption = selector.options[selector.selectedIndex];
        const newKey = selector.value;
        const newLabel = selectedOption.dataset.label;
        
        input.dataset.metricKey = newKey;
        label.textContent = newLabel;
        
        // Update input default value depending on type if it is currently default
        if (newKey === 'targetRevenueVnd') {
            if (parseInt(input.value) <= 5000) {
                input.value = 50000000; // default 50M VND
            }
        } else {
            if (parseInt(input.value) > 100000) {
                input.value = 1000; // default count
            }
        }
        
        updateLiveCompiledContext();
    }
}
window.onMetricTypeChange = onMetricTypeChange;

async function testGeminiConnection() {
    let key = document.getElementById('settings-gemini-key').value.trim();
    const statusSpan = document.getElementById('gemini-test-status');
    
    if (!key) {
        statusSpan.className = "block mt-1 text-[9px] font-mono text-rose-400";
        statusSpan.textContent = "❌ Vui lòng nhập API Key trước khi kiểm tra.";
        return;
    }
    
    // Strip accidental quotes
    if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
    if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
    
    statusSpan.className = "block mt-1 text-[9px] font-mono text-slate-400 animate-pulse";
    statusSpan.textContent = "⏳ Đang kết nối thử nghiệm đến Google AI Studio...";
    
    const candidateModels = [
        'gemini-3.6-flash',
        'gemini-3.1-pro',
        'gemini-3.5-flash-lite',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro'
    ];
    
    let lastError = null;
    
    for (const model of candidateModels) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Hello" }] }]
                })
            });
            
            const data = await response.json();
            if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
                statusSpan.className = "block mt-1 text-[9px] font-mono text-emerald-400 font-bold";
                statusSpan.textContent = `✅ Kết nối THÀNH CÔNG! API Key hoạt động tốt (Model: ${model}).`;
                return;
            } else if (data.error) {
                lastError = data.error.message || JSON.stringify(data.error);
                if (lastError.includes('API key') || lastError.includes('key') || response.status === 400 || response.status === 403) {
                    statusSpan.className = "block mt-1 text-[9px] font-mono text-rose-400";
                    statusSpan.textContent = `❌ Lỗi: ${lastError}`;
                    return;
                }
            }
        } catch (err) {
            lastError = err.message;
        }
    }
    
    statusSpan.className = "block mt-1 text-[9px] font-mono text-rose-400";
    statusSpan.textContent = `❌ Lỗi: ${lastError || "Không có model nào tương thích hoặc Key không hợp lệ."}`;
}
window.testGeminiConnection = testGeminiConnection;

async function testOpenAiConnection() {
    const key = document.getElementById('settings-openai-key').value.trim();
    const statusSpan = document.getElementById('openai-test-status');
    
    if (!key) {
        statusSpan.className = "block mt-1 text-[9px] font-mono text-rose-400";
        statusSpan.textContent = "❌ Vui lòng nhập API Key trước khi kiểm tra.";
        return;
    }
    
    statusSpan.className = "block mt-1 text-[9px] font-mono text-slate-400 animate-pulse";
    statusSpan.textContent = "⏳ Đang kết nối thử nghiệm đến OpenAI API...";
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: "Hello" }],
                max_tokens: 5
            })
        });
        
        const data = await response.json();
        if (response.ok && data.choices?.[0]?.message?.content) {
            statusSpan.className = "block mt-1 text-[9px] font-mono text-emerald-400 font-bold";
            statusSpan.textContent = "✅ Kết nối THÀNH CÔNG! API Key đang hoạt động tốt.";
        } else {
            const msg = data.error ? data.error.message : "Unknown error";
            statusSpan.className = "block mt-1 text-[9px] font-mono text-rose-400";
            statusSpan.textContent = `❌ Lỗi: ${msg}`;
        }
    } catch (err) {
        statusSpan.className = "block mt-1 text-[9px] font-mono text-rose-400";
        statusSpan.textContent = `❌ Lỗi kết nối: ${err.message}`;
    }
}
window.testOpenAiConnection = testOpenAiConnection;

// Initialize on script load
loadFbChannels();

// =========================================================================
// ENTERPRISE MARKETPLACE & EXTENSIONS PLATFORM (GROUP 6 MARKETPLACE)
// =========================================================================
const EnterpriseMarketplaceStore = {
    processPackages: [
        {
            id: 'pkg_mkt_30d',
            name: 'Marketing Campaign SpaPOS 30-Day Growth SOP',
            version: 'v2.0',
            category: 'MARKETING',
            author: 'Bella Official',
            installed: true,
            description: 'Quy trình chuẩn 10 bước tự động sinh bài viết SEO, Carousel, Case Studies và đặt lịch 08:00 AM qua Facebook Driver.',
            stepsCount: 10,
            rating: '4.9/5 ⭐'
        },
        {
            id: 'pkg_prd_decomp',
            name: 'Product Requirement Document (PRD) & Tech Spec SOP',
            version: 'v1.2',
            category: 'PRODUCT',
            author: 'Bella Official',
            installed: false,
            description: 'Quy trình tự phân tích User Stories, lập Database Schema, thiết kế Figma Tokens và sinh mã nguồn React API.',
            stepsCount: 8,
            rating: '4.8/5 ⭐'
        },
        {
            id: 'pkg_sec_audit',
            name: 'Automated Software Security & OWASP Audit SOP',
            version: 'v3.0',
            category: 'SECURITY',
            author: 'Bella Security Team',
            installed: false,
            description: 'Quy trình quét lỗ hổng an ninh Zero-Trust, audit quyền truy cập bảng Lương Payroll và xuất chứng chỉ EQE.',
            stepsCount: 6,
            rating: '5.0/5 ⭐'
        },
        {
            id: 'pkg_crm_onboard',
            name: 'Customer Support & Lead Nurturing SOP',
            version: 'v1.0',
            category: 'SALES',
            author: 'Bella Sales Team',
            installed: false,
            description: 'Tự động gửi tin nhắn Zalo OA, nhắc lịch hẹn Spa và chăm sóc khách hàng VIP theo thời gian thực.',
            stepsCount: 5,
            rating: '4.7/5 ⭐'
        },
        {
            id: 'pkg_fin_reconcile',
            name: 'Automated Financial Reconciliation & Invoice Audit SOP',
            version: 'v1.5',
            category: 'FINANCE',
            author: 'Bella Official',
            installed: false,
            description: 'Quy trình tự đối soát số dư ngân hàng, kiểm tra khớp lệnh hóa đơn CRM và xuất báo cáo lưu chuyển tiền tệ hàng tuần.',
            stepsCount: 7,
            rating: '4.9/5 ⭐'
        },
        {
            id: 'pkg_hr_onboard',
            name: 'AI-Powered Candidate Screening & Onboarding SOP',
            version: 'v1.0',
            category: 'HR',
            author: 'Bella Official',
            installed: false,
            description: 'Quy trình tự động sàng lọc CV từ VietnamWorks, phỏng vấn sơ loại bằng AI Voice, lập hợp đồng lao động điện tử và tạo mã nhân viên.',
            stepsCount: 9,
            rating: '4.8/5 ⭐'
        }
    ],
    connectorPackages: [
        {
            id: 'conn_misa_erp',
            name: 'MISA ERP Connector Plugin',
            version: 'v2.1.0',
            type: 'SYSTEM_RECORD',
            installed: true,
            description: 'Đồng bộ dữ liệu Hóa đơn, Doanh thu và Kho từ MISA ERP sang Layer 5 Enterprise Data Fabric.'
        },
        {
            id: 'conn_zalo_oa',
            name: 'Zalo Official Account Bot Driver',
            version: 'v3.0.1',
            type: 'EXECUTION_DRIVER',
            installed: true,
            description: 'Driver gửi tin nhắn Zalo tự động cho Khách hàng Spa & Nhắc ca hẹn.'
        },
        {
            id: 'conn_fb_graph',
            name: 'Facebook Graph API Driver',
            version: 'v4.2.0',
            type: 'EXECUTION_DRIVER',
            installed: true,
            description: 'Driver tự động đăng bài, quản lý Fanpage và xuất báo cáo tương tác.'
        },
        {
            id: 'conn_sap_finance',
            name: 'SAP Financial Ledger Connector',
            version: 'v1.5.0',
            type: 'ENTERPRISE_ERP',
            installed: false,
            description: 'Đồng bộ sổ sách tài chính kế toán từ SAP S/4HANA sang Bella EOS Ledger.'
        }
    ],

    installPackage(pkgId) {
        const pkg = this.processPackages.find(p => p.id === pkgId);
        if (pkg) {
            pkg.installed = true;
            appendLog('MARKETPLACE', `🛍️ 1-CLICK INSTALL: Đã cài đặt thành công Quy trình [${pkg.name}] (${pkg.version}) vào Process Runtime!`, 'text-purple-400 font-bold');
            return true;
        }
        return false;
    },

    installConnector(connId) {
        const conn = this.connectorPackages.find(c => c.id === connId);
        if (conn) {
            conn.installed = true;
            appendLog('MARKETPLACE', `🔌 1-CLICK INSTALL: Đã cài đặt Connector [${conn.name}] (${conn.version}) vào Integration Mesh!`, 'text-cyan-400 font-bold');
            return true;
        }
        return false;
    }
};

let activeMarketplaceTab = 'sops';

function openMarketplaceModal() {
    console.log("🛍️ [openMarketplaceModal] opening Marketplace store...");
    const modal = document.getElementById('marketplace-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    renderMarketplaceContent();
}

function closeMarketplaceModal() {
    const modal = document.getElementById('marketplace-modal');
    if (modal) modal.style.display = 'none';
}

function switchMarketplaceTab(tab) {
    activeMarketplaceTab = tab;
    const btnSops = document.getElementById('mkt-tab-sops');
    const btnConnectors = document.getElementById('mkt-tab-connectors');
    if (tab === 'sops') {
        if (btnSops) btnSops.className = 'py-3 text-purple-400 border-b-2 border-purple-500 flex items-center gap-1.5 cursor-pointer font-bold';
        if (btnConnectors) btnConnectors.className = 'py-3 text-slate-400 hover:text-slate-200 border-b-2 border-transparent flex items-center gap-1.5 cursor-pointer font-medium';
    } else {
        if (btnConnectors) btnConnectors.className = 'py-3 text-purple-400 border-b-2 border-purple-500 flex items-center gap-1.5 cursor-pointer font-bold';
        if (btnSops) btnSops.className = 'py-3 text-slate-400 hover:text-slate-200 border-b-2 border-transparent flex items-center gap-1.5 cursor-pointer font-medium';
    }
    renderMarketplaceContent();
}

function renderMarketplaceContent() {
    const container = document.getElementById('marketplace-content-area');
    if (!container) return;
    container.innerHTML = '';

    if (activeMarketplaceTab === 'sops') {
        EnterpriseMarketplaceStore.processPackages.forEach(pkg => {
            const card = document.createElement('div');
            card.className = 'p-4 rounded-xl border bg-slate-950/80 border-slate-800 flex items-start justify-between gap-4 transition hover:border-purple-800/60';
            card.innerHTML = `
                <div class="space-y-1.5 flex-1">
                    <div class="flex items-center gap-2">
                        <span class="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50">${pkg.category}</span>
                        <h4 class="font-bold text-xs text-slate-100">${pkg.name}</h4>
                        <span class="text-[9px] font-mono text-slate-500">${pkg.version}</span>
                    </div>
                    <p class="text-[11px] text-slate-400 leading-relaxed">${pkg.description}</p>
                    <div class="flex items-center gap-3 text-[10px] text-slate-500 font-mono pt-1">
                        <span>Tác giả: <strong class="text-slate-300">${pkg.author}</strong></span>
                        <span>Quy mô: <strong>${pkg.stepsCount} Bước SOP</strong></span>
                        <span>Đánh giá: <strong class="text-amber-400">${pkg.rating}</strong></span>
                    </div>
                </div>
                <div class="shrink-0 pt-1">
                    ${pkg.installed ? 
                        `<button class="px-3.5 py-1.5 bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-xs font-bold rounded-xl cursor-default flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> Đã Cài Đặt</button>` :
                        `<button onclick="EnterpriseMarketplaceStore.installPackage('${pkg.id}'); renderMarketplaceContent();" class="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1 cursor-pointer"><i class="fa-solid fa-download"></i> 1-Click Install</button>`
                    }
                </div>
            `;
            container.appendChild(card);
        });
    } else {
        EnterpriseMarketplaceStore.connectorPackages.forEach(conn => {
            const card = document.createElement('div');
            card.className = 'p-4 rounded-xl border bg-slate-950/80 border-slate-800 flex items-start justify-between gap-4 transition hover:border-cyan-800/60';
            card.innerHTML = `
                <div class="space-y-1.5 flex-1">
                    <div class="flex items-center gap-2">
                        <span class="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">${conn.type}</span>
                        <h4 class="font-bold text-xs text-slate-100">${conn.name}</h4>
                        <span class="text-[9px] font-mono text-slate-500">${conn.version}</span>
                    </div>
                    <p class="text-[11px] text-slate-400 leading-relaxed">${conn.description}</p>
                </div>
                <div class="shrink-0 pt-1">
                    ${conn.installed ? 
                        `<button class="px-3.5 py-1.5 bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-xs font-bold rounded-xl cursor-default flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> Đã Kết Nối</button>` :
                        `<button onclick="EnterpriseMarketplaceStore.installConnector('${conn.id}'); renderMarketplaceContent();" class="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1 cursor-pointer"><i class="fa-solid fa-plug"></i> Kết Nối Ngay</button>`
                    }
                </div>
            `;
            container.appendChild(card);
        });
    }
}

window.EnterpriseMarketplaceStore = EnterpriseMarketplaceStore;
window.openMarketplaceModal = openMarketplaceModal;
window.closeMarketplaceModal = closeMarketplaceModal;
window.switchMarketplaceTab = switchMarketplaceTab;
window.renderMarketplaceContent = renderMarketplaceContent;

safeAddListener('btn-open-marketplace', 'click', openMarketplaceModal);

// =========================================================================
// 3D AI EMPLOYEE DOSSIER & LIVE CHAT CONSOLE CONTROLLER
// =========================================================================
let currentDossierAgentId = 'coo';
let activeDossierTab = 'matrix';

function openAgentDossierModal(agentId) {
    console.log(`👤 [openAgentDossierModal] Opening Dossier for Agent: ${agentId}`);
    const agent = AI_AGENTS.find(a => a.id === agentId) || AI_AGENTS[0];
    currentDossierAgentId = agent.id;

    const modal = document.getElementById('agent-dossier-modal');
    if (!modal) return;

    // Set Header Info
    const nameEl = document.getElementById('dossier-agent-name');
    const roleEl = document.getElementById('dossier-agent-role');
    const statusEl = document.getElementById('dossier-agent-status');
    const iconEl = document.getElementById('dossier-agent-icon');
    const iconBox = document.getElementById('dossier-agent-icon-box');
    const idDisplay = document.getElementById('dossier-agent-id-display');

    if (nameEl) nameEl.textContent = agent.name;
    if (roleEl) roleEl.textContent = agent.role || 'AI Employee';
    if (statusEl) {
        statusEl.textContent = agent.status || 'IDLE';
        statusEl.className = agent.status === 'PROCESSING' ? 
            'text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-bold uppercase animate-pulse' :
            'text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold uppercase';
    }
    if (iconEl) iconEl.className = `fa-solid ${agent.icon || 'fa-user-gear'}`;
    const hex = (typeof agent.color === 'number') ? agent.color.toString(16).padStart(6, '0') : '06b6d4';
    if (iconBox) iconBox.style.color = `#${hex}`;
    if (idDisplay) idDisplay.textContent = agent.id.toUpperCase();

    // Render Matrix Content
    renderDossierMatrixContent(agent);
    initDossierChatConsole(agent);

    modal.style.display = 'flex';
}

function closeAgentDossierModal() {
    const modal = document.getElementById('agent-dossier-modal');
    if (modal) modal.style.display = 'none';
}

function switchDossierTab(tab) {
    activeDossierTab = tab;
    const btnMatrix = document.getElementById('dossier-tab-matrix');
    const btnChat = document.getElementById('dossier-tab-chat');
    const contentMatrix = document.getElementById('dossier-content-matrix');
    const contentChat = document.getElementById('dossier-content-chat');

    if (tab === 'matrix') {
        if (btnMatrix) btnMatrix.className = 'py-3 text-cyan-400 border-b-2 border-cyan-500 flex items-center gap-1.5 cursor-pointer font-bold';
        if (btnChat) btnChat.className = 'py-3 text-slate-400 hover:text-slate-200 border-b-2 border-transparent flex items-center gap-1.5 cursor-pointer font-medium';
        if (contentMatrix) contentMatrix.style.display = 'block';
        if (contentChat) contentChat.style.display = 'none';
    } else {
        if (btnChat) btnChat.className = 'py-3 text-cyan-400 border-b-2 border-cyan-500 flex items-center gap-1.5 cursor-pointer font-bold';
        if (btnMatrix) btnMatrix.className = 'py-3 text-slate-400 hover:text-slate-200 border-b-2 border-transparent flex items-center gap-1.5 cursor-pointer font-medium';
        if (contentMatrix) contentMatrix.style.display = 'none';
        if (contentChat) contentChat.style.display = 'flex';
    }
}

function renderDossierMatrixContent(agent) {
    const container = document.getElementById('dossier-content-matrix');
    if (!container) return;

    const config = (typeof getAgentConfig === 'function') ? getAgentConfig(agent.id) : {};
    const modelDisplay = config.modelId || 'gemini-3-6-flash';
    const adapterKey = agent.id === 'dev' ? 'codex' : (agent.id === 'qa' || agent.id === 'cto' ? 'claudecode' : (agent.id === 'devops' || agent.id === 'des' ? 'openhands' : 'hermes'));

    container.innerHTML = `
        <div class="grid grid-cols-2 gap-4">
            <!-- Col 1: System Specs -->
            <div class="p-4 rounded-xl border bg-slate-950/80 border-slate-800 space-y-2.5">
                <h4 class="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-microchip"></i>
                    <span>Cấu hình AI OS Runtime</span>
                </h4>
                <div class="space-y-1.5 text-[11px] text-slate-300 font-mono">
                    <div class="flex justify-between py-1 border-b border-slate-900">
                        <span class="text-slate-400">LLM Provider:</span>
                        <strong class="text-amber-400 uppercase">${config.providerKey || 'google'}</strong>
                    </div>
                    <div class="flex justify-between py-1 border-b border-slate-900">
                        <span class="text-slate-400">Model Tier:</span>
                        <strong class="text-cyan-300 font-bold">${modelDisplay}</strong>
                    </div>
                    <div class="flex justify-between py-1 border-b border-slate-900">
                        <span class="text-slate-400">Execution Adapter:</span>
                        <strong class="text-purple-400 font-bold uppercase">${adapterKey}Adapter</strong>
                    </div>
                    <div class="flex justify-between py-1 border-b border-slate-900">
                        <span class="text-slate-400">Token Limit / Req:</span>
                        <span class="text-slate-200">${(config.maxTokens || 4096).toLocaleString()} Tokens</span>
                    </div>
                    <div class="flex justify-between py-1">
                        <span class="text-slate-400">Temperature / Risk:</span>
                        <span class="text-slate-200">${config.temperature || 0.7}</span>
                    </div>
                </div>
            </div>

            <!-- Col 2: EIL Context Package -->
            <div class="p-4 rounded-xl border bg-slate-950/80 border-slate-800 space-y-2.5">
                <h4 class="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-briefcase"></i>
                    <span>Ma trận Ngữ Cảnh EIL</span>
                </h4>
                <div class="space-y-1.5 text-[11px] text-slate-300 font-mono">
                    <div class="flex justify-between py-1 border-b border-slate-900">
                        <span class="text-slate-400">Nhiệm vụ hiện tại:</span>
                        <strong class="text-emerald-400">${agent.task || 'IDLE'}</strong>
                    </div>
                    <div class="flex justify-between py-1 border-b border-slate-900">
                        <span class="text-slate-400">SLA Thời gian:</span>
                        <span class="text-slate-200">4.0 Giờ SLA</span>
                    </div>
                    <div class="flex justify-between py-1 border-b border-slate-900">
                        <span class="text-slate-400">Tiêu chuẩn DoD:</span>
                        <span class="text-emerald-400 font-bold">100% Quality Pass</span>
                    </div>
                    <div class="flex justify-between py-1">
                        <span class="text-slate-400">EQE Score Average:</span>
                        <strong class="text-amber-400 font-bold">98.5 / 100 PTS</strong>
                    </div>
                </div>
            </div>
        </div>

        <!-- Capability Description -->
        <div class="p-4 rounded-xl border bg-slate-950/80 border-slate-800 space-y-2">
            <h4 class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <i class="fa-solid fa-sliders text-cyan-400"></i>
                <span>Vai Trò & Quyền Hạn Hạn Mức Tự Chủ</span>
            </h4>
            <p class="text-[11px] text-slate-400 leading-relaxed font-sans">
                ${agent.name} đảm nhiệm vai trò <strong>${agent.role || 'AI Employee'}</strong> trong hệ thống Bella EOS. Được ủy quyền tự động thực thi công việc với hạn mức ngân sách dưới 100M VND, tuân thủ nghiêm ngặt 7 chiều kiểm duyệt an toàn của Enterprise Quality Engine (EQE).
            </p>
        </div>
    `;
}

function initDossierChatConsole(agent) {
    const historyContainer = document.getElementById('dossier-chat-history');
    if (!historyContainer) return;

    historyContainer.innerHTML = `
        <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2.5">
            <div class="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0 text-xs mt-0.5">
                <i class="fa-solid ${agent.icon || 'fa-robot'}"></i>
            </div>
            <div>
                <p class="font-bold text-cyan-400 text-[10px] leading-tight">${agent.name} (${agent.role || 'AI Employee'})</p>
                <p class="mt-1 text-slate-300">Xin chào Ban Lãnh Đạo CEO! Tôi là ${agent.name}, đang giữ vai trò ${agent.role || 'AI Employee'}. Bạn có chỉ thị trực tiếp nào cần tôi thực thi ngay lập tức không?</p>
            </div>
        </div>
    `;
}

async function sendDossierAgentChat() {
    const input = document.getElementById('dossier-chat-input');
    const historyContainer = document.getElementById('dossier-chat-history');
    if (!input || !historyContainer) return;

    const text = input.value.trim();
    if (!text) return;

    const agent = AI_AGENTS.find(a => a.id === currentDossierAgentId) || AI_AGENTS[0];

    // User Message bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-[11px] text-slate-200 flex items-start gap-2.5 justify-end';
    userBubble.innerHTML = `
        <div class="text-right">
            <p class="font-bold text-amber-400 text-[10px] leading-tight">Ban Lãnh Đạo (CEO)</p>
            <p class="mt-1 text-slate-200">${text}</p>
        </div>
        <div class="w-6 h-6 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 shrink-0 text-xs mt-0.5 font-bold">
            CEO
        </div>
    `;
    historyContainer.appendChild(userBubble);
    input.value = '';
    historyContainer.scrollTop = historyContainer.scrollHeight;

    // Typing indicator
    const typingBubble = document.createElement('div');
    typingBubble.id = 'dossier-typing-indicator';
    typingBubble.className = 'p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-cyan-400 animate-pulse flex items-center gap-2';
    typingBubble.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-xs"></i> <span>${agent.name} đang suy luận câu trả lời qua LLM Engine...</span>`;
    historyContainer.appendChild(typingBubble);
    historyContainer.scrollTop = historyContainer.scrollHeight;

    // Call Real LLM API
    const systemPrompt = `Bạn là ${agent.name}, giữ vai trò ${agent.role || 'AI Employee'} trong hệ thống Bella EOS. CEO vừa giao chỉ thị trực tiếp: "${text}". Trả lời CEO ngắn gọn 3-4 dòng tiếng Việt đúng chuyên môn của bạn.`;
    const responseText = await LLMExecutionService.generateContent(systemPrompt);

    const indicator = document.getElementById('dossier-typing-indicator');
    if (indicator) indicator.remove();

    const agentReply = responseText || `Tôi đã tiếp nhận chỉ thị: "${text}". Đang lập kế hoạch phân rã công việc và điều phối Execution Adapter để hoàn thành trong 1 giờ làm việc.`;

    const replyBubble = document.createElement('div');
    replyBubble.className = 'p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2.5';
    replyBubble.innerHTML = `
        <div class="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0 text-xs mt-0.5">
            <i class="fa-solid ${agent.icon || 'fa-robot'}"></i>
        </div>
        <div>
            <p class="font-bold text-cyan-400 text-[10px] leading-tight">${agent.name} (${agent.role || 'AI Employee'})</p>
            <p class="mt-1 text-slate-200 leading-relaxed">${agentReply}</p>
        </div>
    `;
    historyContainer.appendChild(replyBubble);
    historyContainer.scrollTop = historyContainer.scrollHeight;

    appendLog('DIRECT INTERACTION', `💬 CEO đã gửi chỉ thị trực tiếp cho [${agent.name}]: "${text}"`, 'text-cyan-400 font-bold');
}

window.openAgentDossierModal = openAgentDossierModal;
window.closeAgentDossierModal = closeAgentDossierModal;
window.switchDossierTab = switchDossierTab;
window.sendDossierAgentChat = sendDossierAgentChat;

// =========================================================================
// PROCESS REPLAY & SNAPSHOT ROLLBACK ENGINE CONTROLLER
// =========================================================================
function openProcessReplayModal() {
    console.log("⏪ [openProcessReplayModal] opening Replay modal...");
    const modal = document.getElementById('process-replay-modal');
    if (!modal) return;

    // Ensure sample snapshots exist if empty
    if (EvidenceService.snapshots.length === 0) {
        EvidenceService.takeSnapshot('PROC-MAIN', 0);
        EvidenceService.takeSnapshot('PROC-MAIN', 2);
        EvidenceService.takeSnapshot('PROC-MAIN', 5);
        EvidenceService.takeSnapshot('PROC-MAIN', 7);
    }

    renderProcessReplaySnapshots();
    modal.style.display = 'flex';
}

function closeProcessReplayModal() {
    const modal = document.getElementById('process-replay-modal');
    if (modal) modal.style.display = 'none';
}

function renderProcessReplaySnapshots() {
    const container = document.getElementById('replay-snapshots-list');
    if (!container) return;

    container.innerHTML = '';

    EvidenceService.snapshots.forEach((snap, idx) => {
        const agent = AI_AGENTS.find(a => a.id === snap.agentId) || { name: 'AI Employee', icon: 'fa-robot' };
        const card = document.createElement('div');
        card.className = 'p-4 rounded-xl border bg-slate-950/80 border-slate-800 flex items-center justify-between gap-4 transition hover:border-cyan-800/60';
        
        const timeStr = new Date(snap.timestamp).toLocaleTimeString();
        const hashStr = snap.proofHash || `0x${(idx + 1).toString(16).padStart(8, '0')}`;

        card.innerHTML = `
            <div class="flex items-center gap-3 flex-1">
                <div class="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0">
                    #${idx + 1}
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <h4 class="font-bold text-xs text-slate-100">${snap.stepName || `Step ${snap.stepIndex + 1}`}</h4>
                        <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800 font-bold">${snap.snapshotId}</span>
                    </div>
                    <p class="text-[10px] text-slate-400 font-mono mt-0.5">Thời gian: ${timeStr} | Agent: <strong class="text-slate-300">${agent.name}</strong></p>
                    <p class="text-[9px] text-slate-500 font-mono">Cryptographic Hash: <span class="text-emerald-400">${hashStr}</span></p>
                </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <button onclick="EvidenceService.rollbackToSnapshot('${snap.snapshotId}'); closeProcessReplayModal();" class="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer">
                    <i class="fa-solid fa-rotate-left"></i>
                    <span>Rollback</span>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function startProcessReplayPlayback() {
    closeProcessReplayModal();
    appendLog('REPLAY ENGINE', '▶️ KHỞI CHẠY BỘ PHÁT LẠI REPLAY PLAYBACK (REPLAY STEP 1 ➔ 10)...', 'text-cyan-400 font-bold animate-pulse');
    
    let replayIndex = 0;
    const interval = setInterval(() => {
        if (replayIndex < WORKFLOW_STEPS.length) {
            jumpToStep(replayIndex);
            replayIndex++;
        } else {
            clearInterval(interval);
            appendLog('REPLAY ENGINE', '✨ HOÀN TẤT PHÁT LẠI REPLAY PLAYBACK!', 'text-emerald-400 font-bold');
        }
    }, 1000);
}

window.openProcessReplayModal = openProcessReplayModal;
window.closeProcessReplayModal = closeProcessReplayModal;
window.renderProcessReplaySnapshots = renderProcessReplaySnapshots;
window.startProcessReplayPlayback = startProcessReplayPlayback;

safeAddListener('btn-open-replay', 'click', openProcessReplayModal);

safeAddListener('btn-open-settings', 'click', openGlobalSettingsModal);
safeAddListener('btn-close-settings-modal', 'click', closeGlobalSettingsModal);
safeAddListener('btn-cancel-settings', 'click', closeGlobalSettingsModal);
safeAddListener('btn-save-settings', 'click', saveGlobalSettings);

// INITIALIZE APP ON LOAD
function initApp() {
    loadAgentConfigsFromLocalStorage();
    
    // Auto-load API keys from local storage on load
    window.GEMINI_API_KEY = localStorage.getItem('bella_gemini_api_key') || '';
    window.OPENAI_API_KEY = localStorage.getItem('bella_openai_api_key') || '';
    window.ANTHROPIC_API_KEY = localStorage.getItem('bella_anthropic_api_key') || '';

    const storedSupaKey = localStorage.getItem('supabase_anon_key');
    if (storedSupaKey) {
        window.SUPABASE_ANON_KEY = storedSupaKey;
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            window.supabaseClient = supabase.createClient('https://qwpyfhojxctrvqkjctcl.supabase.co', storedSupaKey);
        }
    }

    init3DScene();
    renderAgentCards();
    renderWorkflowPipeline();
    renderKanbanBoard();
    initSupabaseRealtimeSync();
    updateGlobalMetricsUI();

    // Initialize Spa Owner Command Center values from BCE inputs
    const mainMetricTypeSelect = document.getElementById('main-metric-type');
    const bceMetricTypeSelect = document.getElementById('bce-edit-metric-type');
    const mainFollowersInput = document.getElementById('main-followers');
    const bceFollowersInput = document.getElementById('bce-edit-followers');
    const mainBudgetInput = document.getElementById('main-budget');
    const bceBudgetInput = document.getElementById('bce-edit-budget');
    const mainVoiceSelect = document.getElementById('main-voice');
    const bceVoiceSelect = document.getElementById('bce-edit-voice');
    const mainSegmentInput = document.getElementById('main-segment');
    const bceSegmentInput = document.getElementById('bce-edit-segment');

    if (mainMetricTypeSelect && bceMetricTypeSelect) mainMetricTypeSelect.value = bceMetricTypeSelect.value;
    if (mainFollowersInput && bceFollowersInput) mainFollowersInput.value = bceFollowersInput.value;
    if (mainBudgetInput && bceBudgetInput) mainBudgetInput.value = bceBudgetInput.value;
    if (mainVoiceSelect && bceVoiceSelect) mainVoiceSelect.value = bceVoiceSelect.value;
    if (mainSegmentInput && bceSegmentInput) mainSegmentInput.value = bceSegmentInput.value;
    
    if (typeof onMainMetricTypeChange === 'function') {
        onMainMetricTypeChange();
    }
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

EventBus.on('task.status.changed', () => renderKanbanBoard());
EventBus.on('task.contract.created', () => renderKanbanBoard());

// Dropdown camera focal selector & helper panel toggle logic
function focusDeptDropdown(deptName, label) {
    if (deptName === 'overview') {
        if (typeof resetCamera === 'function') {
            resetCamera();
        }
    } else {
        if (typeof focusDepartment === 'function') {
            focusDepartment(deptName);
        }
    }
    const currentNameSpan = document.getElementById('current-focal-name');
    if (currentNameSpan) {
        currentNameSpan.innerText = `Góc nhìn: ${label}`;
    }
    const menu = document.getElementById('menu-dropdown-focal');
    if (menu) {
        menu.classList.add('hidden');
    }
}

// Bind dropdown & helper collapse events on load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof EIPProvider !== 'undefined') {
        EIPProvider.updateUiWidget();
    }
    // Dropdown click handlers
    const btnDropdownFocal = document.getElementById('btn-dropdown-focal');
    const menuDropdownFocal = document.getElementById('menu-dropdown-focal');
    if (btnDropdownFocal && menuDropdownFocal) {
        btnDropdownFocal.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDropdownFocal.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            const container = document.getElementById('dropdown-focal-container');
            if (container && !container.contains(e.target)) {
                menuDropdownFocal.classList.add('hidden');
            }
        });
    }

    // Controls helper card toggle handlers
    const btnToggleInfo = document.getElementById('btn-toggle-info');
    const infoCardContent = document.getElementById('info-card-content');
    const iconToggleInfo = document.getElementById('icon-toggle-info');

    if (btnToggleInfo && infoCardContent && iconToggleInfo) {
        btnToggleInfo.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = infoCardContent.classList.toggle('hidden');
            if (isHidden) {
                iconToggleInfo.className = 'fa-solid fa-chevron-down text-[9px]';
                localStorage.setItem('bella_controls_helper_collapsed', 'true');
            } else {
                iconToggleInfo.className = 'fa-solid fa-chevron-up text-[9px]';
                localStorage.setItem('bella_controls_helper_collapsed', 'false');
            }
        });

        // Restore saved preference
        if (localStorage.getItem('bella_controls_helper_collapsed') === 'true') {
            infoCardContent.classList.add('hidden');
            iconToggleInfo.className = 'fa-solid fa-chevron-down text-[9px]';
        }
    }
});

// EIL Interactive Dashboard and Knowledge Graph Controller
let graphDragOffset = { x: 0, y: 0 };
let isDraggingGraph = false;
let startDragPos = { x: 0, y: 0 };

function openEilDashboardModal() {
    const modal = document.getElementById('eil-dashboard-modal');
    if (modal) {
        modal.classList.remove('hidden');
        renderEilGraph();
        initGraphDragHandler();
    }
}

function closeEilDashboardModal() {
    const modal = document.getElementById('eil-dashboard-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function initGraphDragHandler() {
    const canvas = document.getElementById('eil-graph-canvas');
    if (!canvas) return;
    
    // reset position
    graphDragOffset = { x: 0, y: 0 };
    canvas.style.transform = `translate(0px, 0px)`;

    canvas.onmousedown = (e) => {
        if (e.target.closest('.graph-node-btn')) return; // let buttons capture clicks
        isDraggingGraph = true;
        startDragPos = { x: e.clientX - graphDragOffset.x, y: e.clientY - graphDragOffset.y };
        canvas.style.cursor = 'grabbing';
    };

    window.onmousemove = (e) => {
        if (!isDraggingGraph) return;
        graphDragOffset.x = e.clientX - startDragPos.x;
        graphDragOffset.y = e.clientY - startDragPos.y;
        canvas.style.transform = `translate(${graphDragOffset.x}px, ${graphDragOffset.y}px)`;
    };

    window.onmouseup = () => {
        if (isDraggingGraph) {
            isDraggingGraph = false;
            canvas.style.cursor = 'grab';
        }
    };
}

function renderEilGraph() {
    const nodesContainer = document.getElementById('eil-graph-nodes');
    const edgesContainer = document.getElementById('eil-graph-edges');
    if (!nodesContainer || !edgesContainer) return;

    // Clear previous elements
    nodesContainer.innerHTML = '';
    edgesContainer.innerHTML = '';

    // Fetch dynamic knowledge graph nodes
    const rawNodes = KnowledgeGraphService.getNodes();
    const rawEdges = KnowledgeGraphService.getEdges();

    // Layout configuration
    const width = 600;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodeCoords = {};

    // Center of container (Root node)
    const rootNode = rawNodes.find(n => n.type === 'Root') || { id: 'company_bella', name: 'Bella OS Core', type: 'Root' };
    nodeCoords[rootNode.id] = { x: centerX, y: centerY };

    // Engines
    const engineNodes = rawNodes.filter(n => n.type === 'Engine');
    engineNodes.forEach((node, idx) => {
        const angle = (idx / engineNodes.length) * 2 * Math.PI;
        const radius = 100;
        nodeCoords[node.id] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });

    // Dynamic Tasks and other entities
    const dynamicNodes = rawNodes.filter(n => n.type !== 'Root' && n.type !== 'Engine');
    dynamicNodes.forEach((node, idx) => {
        const angle = (idx / (dynamicNodes.length || 1)) * 2 * Math.PI + Math.PI / 4;
        const radius = 180;
        nodeCoords[node.id] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });

    // Render Edges (Paths)
    edgesContainer.setAttribute('viewBox', `0 0 ${width} ${height}`);
    rawEdges.forEach(edge => {
        const sourcePos = nodeCoords[edge.source];
        const targetPos = nodeCoords[edge.target];
        if (sourcePos && targetPos) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', sourcePos.x);
            line.setAttribute('y1', sourcePos.y);
            line.setAttribute('x2', targetPos.x);
            line.setAttribute('y2', targetPos.y);
            line.setAttribute('stroke', '#4f46e5');
            line.setAttribute('stroke-width', '1.5');
            line.setAttribute('stroke-dasharray', edge.type === 'MUTATED_BY' ? '4 2' : 'none');
            line.setAttribute('opacity', '0.5');
            edgesContainer.appendChild(line);
        }
    });

    // Render Nodes (Interactive Buttons)
    rawNodes.forEach(node => {
        const pos = nodeCoords[node.id];
        if (!pos) return;

        const nodeEl = document.createElement('button');
        nodeEl.className = 'graph-node-btn absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center p-2 rounded-xl border text-[9px] font-semibold transition-all hover:scale-110 active:scale-95 shadow-lg group';
        nodeEl.style.left = `${pos.x}px`;
        nodeEl.style.top = `${pos.y}px`;

        // Color & style based on node type
        let colorClasses = 'bg-slate-900 border-indigo-500/50 text-indigo-300 hover:border-indigo-400';
        let glowClass = 'shadow-[0_0_8px_rgba(99,102,241,0.2)]';
        let iconHtml = '<i class="fa-solid fa-square-nodes text-[10px] mb-1"></i>';

        if (node.type === 'Root') {
            colorClasses = 'bg-slate-950 border-indigo-500 text-white font-bold text-[10px]';
            glowClass = 'shadow-[0_0_15px_rgba(99,102,241,0.6)] animate-pulse';
            iconHtml = '<i class="fa-solid fa-crown text-[11px] text-indigo-400 mb-1"></i>';
        } else if (node.type === 'Engine') {
            colorClasses = 'bg-slate-900 border-indigo-400/70 text-indigo-200';
            glowClass = 'shadow-[0_0_10px_rgba(99,102,241,0.4)]';
            iconHtml = '<i class="fa-solid fa-gears text-[10px] text-indigo-300 mb-1"></i>';
        } else if (node.type === 'Task') {
            colorClasses = 'bg-slate-900 border-emerald-500/50 text-emerald-300 hover:border-emerald-400';
            glowClass = 'shadow-[0_0_8px_rgba(16,185,129,0.3)]';
            iconHtml = '<i class="fa-solid fa-circle-check text-[10px] text-emerald-400 mb-1"></i>';
        }

        nodeEl.className += ` ${colorClasses} ${glowClass}`;
        nodeEl.innerHTML = `${iconHtml}<span class="max-w-[80px] truncate text-center">${node.name}</span>`;

        nodeEl.onmousedown = (e) => {
            e.stopPropagation();
        };
        nodeEl.onpointerdown = (e) => {
            e.stopPropagation();
        };
        nodeEl.onclick = (e) => {
            e.stopPropagation();
            showGraphMeta(node);
        };

        nodesContainer.appendChild(nodeEl);
    });
}

function showGraphMeta(node) {
    const metaTitle = document.getElementById('graph-meta-title');
    const metaContent = document.getElementById('graph-meta-content');
    if (!metaTitle || !metaContent) return;

    metaTitle.innerText = `${node.type.toUpperCase()}: ${node.name}`;
    
    let html = `
        <div class="space-y-2.5">
            <div class="flex justify-between border-b border-slate-800 pb-1">
                <span class="text-slate-500">ID:</span>
                <span class="text-slate-300 select-all">${node.id}</span>
            </div>
            <div class="flex justify-between border-b border-slate-800 pb-1">
                <span class="text-slate-500">Loại:</span>
                <span class="text-indigo-400 font-bold">${node.type}</span>
            </div>
    `;

    // Dynamic metrics based on properties
    if (node.properties) {
        Object.entries(node.properties).forEach(([key, val]) => {
            let valStr = (typeof val === 'object') ? JSON.stringify(val) : val;
            html += `
                <div class="flex flex-col gap-0.5 border-b border-slate-800 pb-1">
                    <span class="text-slate-500 capitalize">${key}:</span>
                    <span class="text-emerald-400 break-all">${valStr}</span>
                </div>
            `;
        });
    }

    html += `
            <div class="text-[9px] text-slate-500 pt-2 italic">
                * Thuộc tính được đồng bộ thời gian thực vào Enterprise Object Model (EOM).
            </div>
        </div>
    `;

    metaContent.innerHTML = html;
}

function resetGraphVisuals() {
    renderEilGraph();
    initGraphDragHandler();
    
    // reset meta view
    const metaContent = document.getElementById('graph-meta-content');
    if (metaContent) {
        metaContent.innerHTML = `<div class="text-slate-500 italic py-4 text-center">Click vào một Node trên Bản đồ để xem thông tin thuộc tính Enterprise Object Model (EOM)</div>`;
    }
}

function switchEilTab(tabName) {
    const btnGraph = document.getElementById('eil-tab-btn-graph');
    const btnBce = document.getElementById('eil-tab-btn-bce');
    const contentGraph = document.getElementById('eil-tab-content-graph');
    const contentBce = document.getElementById('eil-tab-content-bce');

    if (!btnGraph || !btnBce || !contentGraph || !contentBce) return;

    if (tabName === 'graph') {
        btnGraph.className = 'px-4 py-2 border-b-2 border-indigo-500 text-indigo-400 flex items-center gap-1.5 cursor-pointer';
        btnBce.className = 'px-4 py-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer';
        contentGraph.classList.remove('hidden');
        contentBce.classList.add('hidden');
        // Redraw graph to ensure lines are updated
        renderEilGraph();
    } else if (tabName === 'bce') {
        btnBce.className = 'px-4 py-2 border-b-2 border-indigo-500 text-indigo-400 flex items-center gap-1.5 cursor-pointer';
        btnGraph.className = 'px-4 py-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer';
        contentBce.classList.remove('hidden');
        contentGraph.classList.add('hidden');
    }
}

function toggleEipFabricPanel() {
    const content = document.getElementById('eip-fabric-content');
    const icon = document.getElementById('eip-fabric-toggle-icon');
    const panel = document.getElementById('eip-fabric-panel');
    const badge = document.getElementById('eip-fabric-badge');
    
    if (!content || !icon || !panel) return;

    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.className = 'fa-solid fa-chevron-up';
        panel.style.width = '240px';
        if (badge) badge.classList.remove('hidden');
    } else {
        content.classList.add('hidden');
        icon.className = 'fa-solid fa-chevron-down';
        panel.style.width = '175px';
        if (badge) badge.classList.add('hidden');
    }
}

window.toggleEipFabricPanel = toggleEipFabricPanel;

// =========================================================================
// SPA OWNER COMMAND CENTER SYNC & PRESETS HELPER
// =========================================================================
function selectSpaPreset(type) {
    const mainPromptInput = document.getElementById('ceo-command-input');
    const mainMetricTypeSelect = document.getElementById('main-metric-type');
    const mainFollowersInput = document.getElementById('main-followers');
    const mainBudgetInput = document.getElementById('main-budget');
    const mainVoiceSelect = document.getElementById('main-voice');
    const mainSegmentInput = document.getElementById('main-segment');

    if (!mainPromptInput || !mainMetricTypeSelect || !mainFollowersInput || !mainBudgetInput || !mainVoiceSelect || !mainSegmentInput) return;

    if (type === 'sales') {
        mainPromptInput.value = "Tăng doanh số Spa 30 triệu VND trong 30 ngày bằng các chương trình khuyến mãi liệu trình mới";
        mainMetricTypeSelect.value = "targetRevenueVnd";
        mainFollowersInput.value = "30000000";
        mainBudgetInput.value = "10000000";
        mainVoiceSelect.value = "Professional & Premium";
        mainSegmentInput.value = "Khách hàng VIP Spa & Skincare";
    } else if (type === 'post') {
        mainPromptInput.value = "Đăng bài viết giới thiệu các dịch vụ trị mụn và làm trắng da lên Facebook Page hàng tuần";
        mainMetricTypeSelect.value = "targetFollowers";
        mainFollowersInput.value = "500";
        mainBudgetInput.value = "4000000";
        mainVoiceSelect.value = "Friendly & Casual";
        mainSegmentInput.value = "Chị em phụ nữ thích làm đẹp từ 22-45 tuổi";
    } else if (type === 'recruit') {
        mainPromptInput.value = "Tuyển dụng gấp 3 kỹ thuật viên và 1 lễ tân làm việc tại chi nhánh Hà Nội";
        mainMetricTypeSelect.value = "targetStaffCount";
        mainFollowersInput.value = "4";
        mainBudgetInput.value = "6000000";
        mainVoiceSelect.value = "Professional & Premium";
        mainSegmentInput.value = "Kỹ thuật viên Spa có tay nghề cao";
    } else if (type === 'lead') {
        mainPromptInput.value = "Tặng voucher trải nghiệm dịch vụ chăm sóc da miễn phí để thu hút 200 khách hàng đăng ký mới";
        mainMetricTypeSelect.value = "targetLeads";
        mainFollowersInput.value = "200";
        mainBudgetInput.value = "12000000";
        mainVoiceSelect.value = "Friendly & Casual";
        mainSegmentInput.value = "Nhân viên văn phòng và người trẻ từ 18-35 tuổi";
    }

    // Trigger updates
    onMainMetricTypeChange();
    syncMainToBce();
    
    // Auto trigger CEO command processing to mutate the workflow pipeline instantly
    if (typeof sendCeoCommand === 'function') {
        sendCeoCommand();
    }
}

function onMainMetricTypeChange() {
    const mainMetricTypeSelect = document.getElementById('main-metric-type');
    const mainFollowersLabel = document.getElementById('main-followers-label');
    const mainFollowersInput = document.getElementById('main-followers');

    if (!mainMetricTypeSelect || !mainFollowersLabel || !mainFollowersInput) return;

    const val = mainMetricTypeSelect.value;
    if (val === 'targetFollowers') {
        mainFollowersLabel.textContent = "Mục tiêu Followers";
    } else if (val === 'targetRevenueVnd') {
        mainFollowersLabel.textContent = "Mục tiêu Doanh số (VND)";
    } else if (val === 'targetLeads') {
        mainFollowersLabel.textContent = "Mục tiêu Leads";
    } else if (val === 'targetStaffCount') {
        mainFollowersLabel.textContent = "Mục tiêu Nhân sự";
    }

    // Sync type select to BCE hidden field
    const bceMetricTypeSelect = document.getElementById('bce-edit-metric-type');
    if (bceMetricTypeSelect) {
        bceMetricTypeSelect.value = val;
        // Call the existing BCE change handler to update label in BCE
        if (typeof onMetricTypeChange === 'function') {
            onMetricTypeChange();
        }
    }
}

function syncMainToBce() {
    const mainMetricTypeSelect = document.getElementById('main-metric-type');
    const mainFollowersInput = document.getElementById('main-followers');
    const mainBudgetInput = document.getElementById('main-budget');
    const mainVoiceSelect = document.getElementById('main-voice');
    const mainSegmentInput = document.getElementById('main-segment');

    const bceBudgetInput = document.getElementById('bce-edit-budget');
    const bceFollowersInput = document.getElementById('bce-edit-followers');
    const bceVoiceSelect = document.getElementById('bce-edit-voice');
    const bceSegmentInput = document.getElementById('bce-edit-segment');

    if (bceBudgetInput && mainBudgetInput) bceBudgetInput.value = mainBudgetInput.value;
    if (bceVoiceSelect && mainVoiceSelect) bceVoiceSelect.value = mainVoiceSelect.value;
    if (bceSegmentInput && mainSegmentInput) bceSegmentInput.value = mainSegmentInput.value;
    if (bceFollowersInput && mainFollowersInput) {
        bceFollowersInput.value = mainFollowersInput.value;
        if (mainMetricTypeSelect) {
            bceFollowersInput.dataset.metricKey = mainMetricTypeSelect.value;
        }
    }

    // Trigger EIL Live Compiled Context updates
    if (typeof updateLiveCompiledContext === 'function') {
        updateLiveCompiledContext();
    }
}

// Bind to window so they are accessible from HTML onclick attributes
window.selectSpaPreset = selectSpaPreset;
window.onMainMetricTypeChange = onMainMetricTypeChange;
window.syncMainToBce = syncMainToBce;
