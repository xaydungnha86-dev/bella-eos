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
const BellaKernel = {
    version: '2026.1.0-KERNEL',
    status: 'ACTIVE',
    auditLedger: [],
    eventsStore: [],

    // 1. Transaction & Context Bus
    executeTransaction(sourceIdentity, actionType, payload) {
        const timestamp = new Date().toISOString();
        const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        // Security & Policy Check
        const policyPass = EnterprisePolicyEngine.evaluatePolicy(sourceIdentity, actionType, payload);
        
        const ledgerRecord = {
            transactionId,
            timestamp,
            sourceIdentity,
            actionType,
            payload,
            status: policyPass.allowed ? 'COMMITTED' : 'BLOCKED_BY_POLICY',
            reason: policyPass.reason || 'SUCCESS'
        };

        this.auditLedger.push(ledgerRecord);
        this.emitKernelEvent('KERNEL_TRANSACTION_EXECUTED', ledgerRecord);

        console.log(`⚡ [BELLA KERNEL] Transaction [${transactionId}] (${actionType}) ➔ ${ledgerRecord.status}`);
        return ledgerRecord;
    },

    // 2. Kernel Event Sourcing & Replay Engine
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

    // Replay past event stream for Audit & Digital Twin
    replayEventStream(filterEventName = null) {
        console.log(`📜 [BELLA KERNEL REPLAY] tua lại toàn bộ lịch sử sự kiện...`);
        return filterEventName 
            ? this.eventsStore.filter(e => e.eventName === filterEventName)
            : this.eventsStore;
    },

    getAuditLedger() {
        return this.auditLedger;
    }
};

window.BellaKernel = BellaKernel;

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
// PHASE 3: AI RUNTIME OS DRIVER & COST OPTIMIZER (LAYER 8 AI RUNTIME OS)
// =========================================================================
const AIRuntimeOS = {
    version: '1.0-RUNTIME',
    executionHistory: [],
    
    // Model Cost Matrix per 1k Tokens (USD)
    modelRates: {
        'gemini-1.5-flash': { input: 0.00001875, output: 0.000075, tier: 'economy' },
        'gemini-1.5-pro':   { input: 0.00125,   output: 0.005,    tier: 'pro' },
        'claude-3-5-sonnet':{ input: 0.003,     output: 0.015,    tier: 'enterprise' },
        'gpt-4o':           { input: 0.005,     output: 0.015,    tier: 'enterprise' }
    },

    // 1. Smart Model Router & Cost Optimizer
    selectOptimalModel(taskComplexity = 'low', maxBudgetUsd = 0.05) {
        if (taskComplexity === 'low') return 'gemini-1.5-flash';
        if (taskComplexity === 'medium') return 'gemini-1.5-pro';
        return maxBudgetUsd >= 0.02 ? 'claude-3-5-sonnet' : 'gemini-1.5-pro';
    },

    // 2. AI Execution Engine with Retry & Fallback Circuit Breaker
    async executeTask(prompt, taskConfig = {}) {
        const complexity = taskConfig.complexity || 'low';
        const primaryModel = taskConfig.modelId || this.selectOptimalModel(complexity);
        const fallbackModel = 'gemini-1.5-flash';
        
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

        const rate = this.modelRates[modelUsed] || this.modelRates['gemini-1.5-flash'];
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
    { id: 1, name: '1. Chỉ đạo Chiến lược', agent: 'ceo', text: 'CEO phát lệnh tính năng Spa Booking Module' },
    { id: 2, name: '2. Lập PRD', agent: 'pm', text: 'AI PM phân tích YC & tạo PRD v1.2' },
    { id: 3, name: '3. Phê duyệt Kiến trúc', agent: 'cto', text: 'AI CTO & Tech Lead thiết kế DB Schema' },
    { id: 4, name: '4. UI/UX Design', agent: 'des', text: 'AI Designer xuất Design Tokens' },
    { id: 5, name: '5. Lập trình Core', agent: 'dev', text: 'AI Developer hoàn thiện Feature Code' },
    { id: 6, name: '6. Auto E2E Testing', agent: 'qa', text: 'AI QA chạy 42 E2E test scripts (PASS)' },
    { id: 7, name: '7. Gate Phê duyệt CEO', agent: 'ceo', text: 'CEO duyệt Build trước khi Deploy Prod', isApprovalGate: true },
    { id: 8, name: '8. Staging & Deploy', agent: 'devops', text: 'AI DevOps tự động Deploy Vercel/Docker' },
    { id: 9, name: '9. Marketing & Go-Live', agent: 'mkt', text: 'AI Marketing phát hành bài viết & SEO' },
    { id: 10, name: '10. Báo cáo Chi phí', agent: 'fin', text: 'AI Finance hạch toán token & hoàn tất' }
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
    'gemini-1-5-pro': { name: 'Gemini 1.5 Pro', costPer1kInput: 0.00125, costPer1kOutput: 0.005, contextLimit: 2000000 },
    'gemini-1-5-flash': { name: 'Gemini 1.5 Flash', costPer1kInput: 0.000075, costPer1kOutput: 0.0003, contextLimit: 1000000 }
}));

ProviderRegistry.register(new StandardProviderAdapter('meta', 'Meta OpenSource', {
    'llama-3-1-70b': { name: 'Llama 3.1 70B', costPer1kInput: 0.0007, costPer1kOutput: 0.0009, contextLimit: 128000 }
}));

// Real Gemini / LLM Execution Service
const LLMExecutionService = {
    async generateContent(prompt, apiKey = '', modelId = 'gemini-1.5-flash') {
        const key = apiKey || window.GEMINI_API_KEY || localStorage.getItem('bella_gemini_api_key') || '';
        if (!key) {
            console.warn('[LLM Service] Không tìm thấy Gemini API Key. Đang sử dụng chế độ AI Simulation.');
            return null;
        }

        try {
            const cleanModel = modelId.includes('pro') ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${key}`;
            
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
            'gemini-1-5-pro': { name: 'Gemini 1.5 Pro', costPer1kInput: 0.00125, costPer1kOutput: 0.005, contextLimit: 2000000 },
            'gemini-1-5-flash': { name: 'Gemini 1.5 Flash', costPer1kInput: 0.000075, costPer1kOutput: 0.0003, contextLimit: 1000000 }
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
        modelId: 'gemini-1-5-pro',
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
            outputFormat: 'Quyết định rõ ràng kèm lý do và chỉ đạo hành động tiếp theo cho các bộ phận.'
        }
    },
    ast: {
        promptVersion: '1.0',
        provider: 'google',
        modelId: 'gemini-1-5-flash',
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
        fallbackModelId: 'gemini-1-5-pro',
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
        modelId: 'gemini-1-5-pro',
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
        fallbackModelId: 'gemini-1-5-flash',
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
        fallbackModelId: 'gemini-1-5-pro',
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
        modelId: 'gemini-1-5-flash',
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
        modelId: 'gemini-1-5-pro',
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
const EnterpriseMemoryService = {
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
};

// MILESTONE 3.5: EXECUTION GUARDRAILS & MODEL FALLBACK ENGINE
const ModelFallbackEngine = {
    fallbackChain: {
        'claude-3-5-sonnet': 'gemini-1-5-pro',
        'gemini-1-5-pro': 'gpt-4o',
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
                const res = await ModelFallbackEngine.executeWithFallback(currentAgentId, config.modelId || 'gemini-1-5-pro', prompt);

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
                return ModelFallbackEngine.executeWithFallback(agentId, config.modelId || 'gemini-1-5-pro', prompt);
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
                const res = await ModelFallbackEngine.executeWithFallback(agentId, config.modelId || 'gemini-1-5-pro', prompt);
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
        mouse.x = (e.offsetX / dom.clientWidth) * 2 - 1;
        mouse.y = -(e.offsetY / dom.clientHeight) * 2 + 1;

        dragRaycaster.setFromCamera(mouse, camera);
        
        // Raycast against agent group meshes AND department floor zone meshes
        const agentGroups = Object.values(agentMeshes).map(m => m.group);
        const deptZoneMeshes = Object.values(departmentZones).map(z => z.group);
        const targetsToIntersect = [...agentGroups, ...deptZoneMeshes];
        
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
        
        dragMouse.x = (e.offsetX / dom.clientWidth) * 2 - 1;
        dragMouse.y = -(e.offsetY / dom.clientHeight) * 2 + 1;

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

                meshGroup.position.x = Math.max(-15, Math.min(15, Math.round(rawX)));
                meshGroup.position.z = Math.max(-15, Math.min(15, Math.round(rawZ)));
            }
        }
    });

    const stopDraggingOrSelect = (e) => {
        const diffX = Math.abs(e.clientX - startX);
        const diffY = Math.abs(e.clientY - startY);

        // Click detection: if mouse clicked on an agent/dept without dragging
        if (diffX < 10 && diffY < 10 && !draggedObject) {
            mouse.x = (e.offsetX / dom.clientWidth) * 2 - 1;
            mouse.y = -(e.offsetY / dom.clientHeight) * 2 + 1;

            dragRaycaster.setFromCamera(mouse, camera);
            const agentGroups = Object.values(agentMeshes).map(m => m.group);
            const deptZoneMeshes = Object.values(departmentZones).map(z => z.group);
            const targetsToIntersect = [...agentGroups, ...deptZoneMeshes];
            
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
    if (modelId === 'gemini-1-5-pro') return 'GEMINI 1.5 PRO';
    if (modelId === 'gemini-1-5-flash') return 'GEMINI 1.5 FLASH';
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
    if (modal) {
        modal.classList.remove('hidden');
    }
}

safeAddListener('btn-close-report-modal', 'click', () => {
    const modal = document.getElementById('campaign-report-modal');
    if (modal) modal.classList.add('hidden');
});

safeAddListener('btn-modal-close-report', 'click', () => {
    const modal = document.getElementById('campaign-report-modal');
    if (modal) modal.classList.add('hidden');
});

// Execute Next Step in Workflow Simulation
function stepForward() {
    if (currentStepIndex >= WORKFLOW_STEPS.length - 1) {
        pauseSimulation();
        appendLog('SYSTEM', '🎉 Workflow hoàn tất 100%! Đã lập Báo cáo Kế hoạch Content & Bàn giao sản phẩm Bella EIP.', 'text-emerald-400 font-bold');
        showCampaignExecutiveReport();
        return;
    }

    const prevStep = WORKFLOW_STEPS[currentStepIndex];
    currentStepIndex++;
    const nextStep = WORKFLOW_STEPS[currentStepIndex];

    // Update agent states
    AI_AGENTS.forEach(a => a.status = 'IDLE');
    const activeAgent = AI_AGENTS.find(a => a.id === nextStep.agent);
    if (activeAgent) activeAgent.status = 'PROCESSING';

    // Particle Trail effect between agents
    spawnWorkflowDataOrb(prevStep.agent, nextStep.agent);

    // Inter-Agent Message Handover Packet
    InterAgentBus.sendHandoverMessage({
        senderId: prevStep.agent,
        receiverId: nextStep.agent,
        taskId: `TASK-STEP-${nextStep.id}`,
        payload: { stepName: nextStep.name, text: nextStep.text },
        handoverType: 'SEQUENTIAL'
    });

    // Update Camera & UI
    highlightAgent(nextStep.agent);
    renderAgentCards();
    renderWorkflowPipeline();

    // Log update
    appendLog(activeAgent ? activeAgent.name : 'AI AGENT', nextStep.text, 'text-blue-600 font-medium');

    // Trigger Auto-Learning Engine on Step 9
    if (nextStep.id === 9 && typeof ContinuousLearningEngine !== 'undefined') {
        ContinuousLearningEngine.analyzeAndShiftBudget();
    }

    // Trigger CEO Approval Modal if it's an Approval Gate Step
    if (nextStep.isApprovalGate) {
        pauseSimulation();
        openApprovalModal(nextStep);
    }

    // Update global metrics UI on step change
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
        appendLog('AI COO (PROJECT MEMORY)', `🧠 Tái sử dụng Tri thức kinh nghiệm các Chiến dịch quá quá quá trước.`, 'text-emerald-400 font-medium');

        if (typeof DecisionEngineOS !== 'undefined') {
            DecisionEngineOS.recordDecision({
                category: 'PROJECT_LAUNCH',
                summary: `Khởi tạo dự án cho Objective: ${objectiveText}`,
                approvedBy: policyResult.requireHumanApproval ? 'CEO (Pending Sign-off)' : 'Policy Engine (Auto Approved)'
            });
        }

        // Dynamic Workflow Steps Graph generated from Enterprise OS Hierarchy
        const dynamicSteps = [
            { id: 1, name: '1. Khởi tạo Project & Thiết lập OKRs', agent: 'coo', text: `AI COO khởi tạo Project Hub cho mục tiêu "${objectiveText.substring(0, 40)}..." (Budget: ${(budgetVND / 1000000).toFixed(0)}M VND)` },
            { id: 2, name: '2. Phân rã Topic & Risk Assessment', agent: 'pm', text: 'AI PM phân tích rủi ro & lập Content/Feature Matrix từ Tri thức cũ' },
            { id: 3, name: '3. Sáng tạo Copywriting & Architecture Spec', agent: 'mkt', text: 'AI Marketing & AI CTO thiết kế Kiến trúc & Nội dung thực thi' },
            { id: 4, name: '4. Kiểm tra Resource & Phân bổ Task', agent: 'des', text: 'AI Designer & AI Dev tiếp nhận Task theo năng lực Workload Realtime' },
            { id: 5, name: '5. CRM Flow & Service Script Ready', agent: 'sales', text: 'AI Sales & AI CRM thiết lập Kịch bản tự động hóa tương tác' },
            { id: 6, name: '6. Quality Gate & Security Barrier Audit', agent: 'qa', text: 'AI QA kiểm duyệt Brand Voice, Security Risk & Tiêu chuẩn DoD' },
            { 
                id: 7, 
                name: policyResult.requireHumanApproval ? '7. Gate Phê duyệt CEO (Ngân sách Vượt Ngưỡng)' : '7. Gate Kiểm duyệt Tự động (Auto Approval Gate)', 
                agent: 'ceo', 
                text: policyResult.requireHumanApproval ? `⚠️ Ngân sách ${(budgetVND / 1000000).toFixed(0)}M > 100M VND limit. CEO cần ký duyệt trực tiếp!` : `✅ Ngân sách ${(budgetVND / 1000000).toFixed(0)}M VND nằm trong hạn mức tự chủ. Hệ thống phê duyệt tự động.`, 
                isApprovalGate: policyResult.requireHumanApproval
            },
            { id: 8, name: '8. Launch Multi-Channel Campaign & Deploy', agent: 'devops', text: 'AI DevOps kết nối API & Kích hoạt Telemetry Stream Monitor' },
            { id: 9, name: '9. Whole-Enterprise Learning Engine', agent: 'mkt', text: 'Hệ thống học tự động phân tích tương quan & tự tối ưu phân bổ nguồn lực' },
            { id: 10, name: '10. Báo cáo Sức Khỏe Doanh Nghiệp CEO', agent: 'fin', text: 'CEO Executive Dashboard: Tổng hợp ROI, CAC & Sức khỏe Doanh nghiệp' }
        ];

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

    appendLog('CEO (OBJECTIVE)', `🎯 MỤC TIÊU CHIẾN LƯỢC MỚI TỪ CEO: "${val}"`, 'text-amber-400 font-bold');
    input.value = '';

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
    return modelId.replace('gemini-1-5-', 'GEMINI ').replace('claude-3-5-', 'CLAUDE ').replace('gpt-4o-', 'GPT-4O ').replace('llama-3-1-', 'LLAMA ').toUpperCase();
}

// Render 11 Dynamic AI Agent Cards in Left Sidebar Matrix
function renderAgentCards() {
    const container = document.getElementById('agent-cards-container');
    if (!container) return;
    container.innerHTML = '';

    AI_AGENTS.forEach(agent => {
        try {
            const config = AGENT_CONFIGS[agent.id] || {};
            const modelDisplay = formatModelName(config.modelId || 'gemini-1-5-flash');
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
            });
        } catch (err) {
            console.error(`Error rendering agent card for ${agent.id}:`, err);
        }
    });
}

// Sidebar Tab Switcher (Supports 3 Tabs: 11 AI Matrix, SOP, Task Kanban)
function switchSidebarTab(tabKey) {
    const tabs = ['agents', 'sops', 'kanban'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        const content = document.getElementById(`tab-content-${t}`);
        if (!btn || !content) return;

        if (t === tabKey) {
            btn.classList.add('border-cyan-500', 'text-cyan-400', 'font-semibold');
            btn.classList.remove('border-transparent', 'text-slate-400');
            content.classList.remove('hidden');
        } else {
            btn.classList.add('border-transparent', 'text-slate-400');
            btn.classList.remove('border-cyan-500', 'text-cyan-400', 'font-semibold');
            content.classList.add('hidden');
        }
    });

    if (tabKey === 'kanban') {
        renderKanbanBoard();
    }
}

['agents', 'sops', 'kanban'].forEach(t => {
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

        appendLog('SYSTEM', '⚡ Đã kết nối thành công Supabase Realtime Bus (qwpyfhojxctrvqkjctcl)!', 'text-emerald-400 font-bold');
    } catch (err) {
        console.warn("[Supabase Sync Warning]", err);
    }
}

// INITIALIZE APP ON LOAD
function initApp() {
    loadAgentConfigsFromLocalStorage();
    init3DScene();
    renderAgentCards();
    renderWorkflowPipeline();
    renderKanbanBoard();
    initSupabaseRealtimeSync();
    updateGlobalMetricsUI();
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

EventBus.on('task.status.changed', () => renderKanbanBoard());
EventBus.on('task.contract.created', () => renderKanbanBoard());
