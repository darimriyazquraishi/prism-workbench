import { create } from 'zustand';
import type { TaskState, SovereigntyReport, ModelMetadata, ChatMessage, WorkspaceTab } from '../types';

export interface TerminalLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error' | 'tool' | 'model';
  message: string;
  detail?: string;
}

interface WorkbenchStore {
  // Chat & Execution
  messages: ChatMessage[];
  activeTask: TaskState | null;
  tasksHistory: TaskState[];
  isProcessing: boolean;
  attachedFiles: string[];
  
  // UI & Navigation
  tabs: WorkspaceTab[];
  activeTabId: string;
  isSidebarOpen: boolean;
  isTaskPanelOpen: boolean;
  isCommandPaletteOpen: boolean;
  isSecurityModalOpen: boolean;
  isBottomPanelOpen: boolean;
  activeBottomTab: 'terminal' | 'activity' | 'workflow';
  activeNavSection: 'chat' | 'explorer' | 'documents' | 'knowledge' | 'drawing' | 'models' | 'security' | 'audit';

  // Compatibility aliases
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Live Demo Execution State
  demoRunning: boolean;
  demoStepIndex: number; // which step is currently animating
  terminalLogs: TerminalLogEntry[];

  // System & Models
  sovereignty: SovereigntyReport | null;
  models: ModelMetadata[];

  // Actions
  addMessage: (msg: ChatMessage) => void;
  updateMessage: (id: string, updater: Partial<ChatMessage>) => void;
  setActiveTask: (task: TaskState | null) => void;
  updateActiveTask: (updater: (prev: TaskState | null) => TaskState | null) => void;
  setIsProcessing: (status: boolean) => void;
  attachFile: (filePath: string) => void;
  removeAttachedFile: (filePath: string) => void;
  clearAttachments: () => void;
  
  // Tabs & Navigation
  openTab: (tab: WorkspaceTab) => void;
  closeTab: (tabId: string) => void;
  setActiveTabId: (tabId: string) => void;
  setActiveNavSection: (section: 'chat' | 'explorer' | 'documents' | 'knowledge' | 'drawing' | 'models' | 'security' | 'audit') => void;
  toggleTaskPanel: () => void;
  setTaskPanelOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setCommandPaletteOpen: (isOpen: boolean) => void;
  setSecurityModalOpen: (isOpen: boolean) => void;
  setSovereignty: (sov: SovereigntyReport) => void;
  setModels: (models: ModelMetadata[]) => void;

  // Bottom Panel
  setBottomPanelOpen: (isOpen: boolean) => void;
  toggleBottomPanel: () => void;
  setActiveBottomTab: (tab: 'terminal' | 'activity' | 'workflow') => void;

  // Terminal Logs
  addTerminalLog: (entry: Omit<TerminalLogEntry, 'id' | 'timestamp'>) => void;
  clearTerminalLogs: () => void;

  // Demo Execution
  runDemo: (scenario: 'inspection' | 'pump' | 'pid') => Promise<void>;
}

const defaultTabs: WorkspaceTab[] = [
  { id: 'tab-chat', title: 'Workbench Chat', type: 'chat', isClosable: false }
];

const DEMO_STEPS = {
  inspection: [
    { title: 'Extract & Run Local OCR', tool: 'ocr_document', model: 'PyMuPDF + PaddleOCR', ms: 320, log: 'Scanned 4 pages of Inspection_Report_001.pdf — extracted wall thickness 3.80 mm at Elbow E-102 extrados' },
    { title: 'Query Local SOP Knowledge Base', tool: 'search_internal_knowledge', model: 'nomic-embed-text', ms: 180, log: 'ChromaDB: Retrieved 2 chunks from SOP-OPS-014 (score=0.962) — alert limit: 4.00 mm, retirement: 3.00 mm' },
    { title: 'Calculate API 570 Corrosion Rate', tool: 'industrial_corrosion_calculator', model: 'Deterministic Python', ms: 25, log: 'RESULT: (5.00 - 3.80) / 3.5 = 0.343 mm/yr | Remaining Life: (3.80 - 3.00) / 0.343 = 2.33 years' },
    { title: 'Synthesize Findings & Draft Note', tool: 'qwen3_inference', model: 'qwen3:8b (Local)', ms: 2400, log: 'Agent synthesized 6 findings — 2 critical, 4 scheduled. Drafted approval note with engineering sign-off block.' },
    { title: 'Generate Word Approval Note (.docx)', tool: 'generate_docx', model: 'python-docx', ms: 450, log: 'Generated: Approval_Note_Unit5_Inspection.docx (41.3 KB) — includes API 570 table, SOP citations, sign-off block' },
  ],
  pump: [
    { title: 'Read Spreadsheet Schema', tool: 'read_excel', model: 'openpyxl', ms: 150, log: 'Read Pump_Failure_Data.xlsx — 24,813 rows × 18 columns. Columns: pump_id, timestamp, failure_mode, duration_h' },
    { title: 'Write Python MTBF Script', tool: 'qwen2.5-coder:7b', model: 'qwen2.5-coder:7b (Local)', ms: 1800, log: 'Generated calc_mtbf.py — pandas groupby, Weibull distribution fit, fleet reliability analysis' },
    { title: 'Execute Python in Docker Sandbox', tool: 'execute_python', model: 'Docker --net=none', ms: 600, log: 'RESULT: Fleet MTBF = 418.5 hrs | Pump P-102: β=2.41 (wear-out) | Recommendation: 2 API 610 seal cartridges' },
    { title: 'Generate Excel Workbook (.xlsx)', tool: 'generate_xlsx', model: 'openpyxl', ms: 350, log: 'Generated: Pump_Reliability_Analysis_2026.xlsx (27.7 KB) — 3 worksheets with charts and spares BOM' },
  ],
  pid: [
    { title: 'Load Engineering Drawing', tool: 'load_image', model: 'OpenCV', ms: 80, log: 'Loaded P_and_ID_Example.png — 2400×1800 px, detected 5 distinct equipment regions' },
    { title: 'Vision Analysis via Qwen2.5-VL', tool: 'analyze_image', model: 'qwen2.5-vl:7b (Local)', ms: 3100, log: 'Detected: P-102 (Pump), CV-101 (Control Valve, FO), V-14 (PSV, 32 kg/cm²), Line 04-CR-102-A1A (DEGRADED), TI-104' },
    { title: 'Cross-Reference with Asset Register', tool: 'search_internal_knowledge', model: 'nomic-embed-text', ms: 220, log: 'Matched 5/5 tags against MRPL asset register. Line 04-CR-102 flagged: last wall thickness 3.80 mm (ALERT)' },
    { title: 'Generate Executive Briefing (.pptx)', tool: 'generate_pptx', model: 'python-pptx', ms: 680, log: 'Generated: Executive_Briefing_CDU5.pptx (63.4 KB) — 8 slides with component diagrams and findings table' },
  ],
};

export const useWorkbenchStore = create<WorkbenchStore>((set, get) => ({
  messages: [],
  activeTask: null,
  tasksHistory: [],
  isProcessing: false,
  attachedFiles: [],
  
  tabs: defaultTabs,
  activeTabId: 'tab-chat',
  isSidebarOpen: true,
  isTaskPanelOpen: false,
  isCommandPaletteOpen: false,
  isSecurityModalOpen: false,
  isBottomPanelOpen: false,
  activeBottomTab: 'terminal',
  activeNavSection: 'chat',
  activeTab: 'chat',
  demoRunning: false,
  demoStepIndex: -1,
  terminalLogs: [],

  sovereignty: {
    is_air_gapped: true,
    external_api_calls: 0,
    internet_dependency: 'None (Physical Air-Gap Verified)',
    network_mode: 'HOST_ONLY_ISOLATED',
    local_inference_status: 'ONLINE (Qwen3 8B)',
    local_ocr_status: 'ONLINE (PyMuPDF / PaddleOCR)',
    local_rag_status: 'ONLINE (ChromaDB Local)',
    local_sandbox_status: 'ONLINE (Docker --net=none)',
    blocked_external_attempts: [],
    telemetry_policy: 'ZERO_OUTBOUND_TELEMETRY',
    active_services: ['ollama', 'chromadb', 'docker-sandbox', 'sqlite-audit']
  },
  models: [],

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  updateMessage: (id, updater) => set((state) => ({
    messages: state.messages.map((m) => m.id === id ? { ...m, ...updater } : m)
  })),
  setActiveTask: (task) => set({ activeTask: task }),
  updateActiveTask: (updater) => set((state) => ({ activeTask: updater(state.activeTask) })),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  attachFile: (filePath) => set((state) => ({
    attachedFiles: state.attachedFiles.includes(filePath) ? state.attachedFiles : [...state.attachedFiles, filePath]
  })),
  removeAttachedFile: (filePath) => set((state) => ({
    attachedFiles: state.attachedFiles.filter((f) => f !== filePath)
  })),
  clearAttachments: () => set({ attachedFiles: [] }),

  openTab: (tab) => set((state) => {
    const exists = state.tabs.find((t) => t.id === tab.id);
    if (exists) {
      return { activeTabId: tab.id };
    }
    return {
      tabs: [...state.tabs, tab],
      activeTabId: tab.id
    };
  }),
  closeTab: (tabId) => set((state) => {
    const filtered = state.tabs.filter((t) => t.id !== tabId);
    const newActive = state.activeTabId === tabId ? (filtered[filtered.length - 1]?.id || 'tab-chat') : state.activeTabId;
    return {
      tabs: filtered.length > 0 ? filtered : defaultTabs,
      activeTabId: newActive
    };
  }),
  setActiveTabId: (activeTabId) => set({ activeTabId }),
  setActiveNavSection: (activeNavSection) => set({ activeNavSection }),
  setActiveTab: (tab) => set({ activeTab: tab, activeTabId: tab }),
  toggleTaskPanel: () => set((state) => ({ isTaskPanelOpen: !state.isTaskPanelOpen })),
  setTaskPanelOpen: (isTaskPanelOpen) => set({ isTaskPanelOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
  setSecurityModalOpen: (isSecurityModalOpen) => set({ isSecurityModalOpen }),
  setSovereignty: (sovereignty) => set({ sovereignty }),
  setModels: (models) => set({ models }),

  setBottomPanelOpen: (isBottomPanelOpen) => set({ isBottomPanelOpen }),
  toggleBottomPanel: () => set((state) => ({ isBottomPanelOpen: !state.isBottomPanelOpen })),
  setActiveBottomTab: (activeBottomTab) => set({ activeBottomTab }),

  addTerminalLog: (entry) => {
    const log: TerminalLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ...entry
    };
    set((state) => ({ terminalLogs: [...state.terminalLogs, log] }));
  },
  clearTerminalLogs: () => set({ terminalLogs: [] }),

  runDemo: async (scenario) => {
    const { addTerminalLog, addMessage, setIsProcessing, setActiveTask, setTaskPanelOpen, setBottomPanelOpen, setActiveBottomTab, openTab, clearAttachments, attachFile } = get();
    const steps = DEMO_STEPS[scenario];

    const fileMap: Record<string, string> = {
      inspection: 'demo/synthetic/Inspection_Report_001.pdf',
      pump: 'demo/synthetic/Pump_Failure_Data.xlsx',
      pid: 'demo/synthetic/P_and_ID_Example.png',
    };

    const promptMap: Record<string, string> = {
      inspection: 'Analyze Inspection_Report_001.pdf, compare against SOP-OPS-014, calculate API 570 corrosion rate, and generate a formal Word approval note.',
      pump: 'Analyze Pump_Failure_Data.xlsx, write Python in the sandbox to calculate MTBF statistics, and produce an Excel reliability workbook.',
      pid: 'Perform vision analysis on P_and_ID_Example.png, identify all equipment tags, and generate an executive briefing deck.',
    };

    // Setup
    clearAttachments();
    attachFile(fileMap[scenario]);
    openTab({ id: 'tab-chat', title: 'Workbench Chat', type: 'chat', isClosable: false });
    setIsProcessing(true);
    setTaskPanelOpen(true);
    setBottomPanelOpen(true);
    setActiveBottomTab('terminal');
    set({ demoRunning: true, demoStepIndex: -1 });

    // Add user message
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    addMessage({
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      text: promptMap[scenario],
      timestamp: now,
      attachedFiles: [fileMap[scenario]]
    });

    addTerminalLog({ level: 'info', message: '── LUMI Agent Initiated ──', detail: `Task: ${promptMap[scenario].slice(0, 60)}...` });
    addTerminalLog({ level: 'info', message: 'Sandbox: Docker container started (--network=none --memory=256m)' });
    addTerminalLog({ level: 'model', message: `Model Router: Analyzing task type...` });

    await delay(600);
    addTerminalLog({ level: 'success', message: `Model selected: ${scenario === 'pid' ? 'qwen2.5-vl:7b (Vision/Multimodal)' : scenario === 'pump' ? 'qwen2.5-coder:7b (Code/Analysis)' : 'qwen3:8b (Reasoning/Synthesis)'}` });

    // Build plan
    const plan = steps.map((s, i) => ({
      step_id: i + 1,
      title: s.title,
      description: s.log,
      tool_name: s.tool,
      status: 'pending' as const,
      attempts: 1,
      duration_ms: s.ms,
    }));

    const isDoc = scenario === 'inspection';
    const isPump = scenario === 'pump';
    const taskId = `TASK-${Date.now().toString().slice(-6)}`;

    const taskBase: TaskState = {
      task_id: taskId,
      objective: promptMap[scenario],
      status: 'running',
      attached_files: [fileMap[scenario]],
      selected_model_id: scenario === 'pid' ? 'qwen2.5-vl:7b' : scenario === 'pump' ? 'qwen2.5-coder:7b' : 'qwen3:8b',
      selected_model_name: scenario === 'pid' ? 'Qwen2.5-VL 7B' : scenario === 'pump' ? 'Qwen2.5-Coder 7B' : 'Qwen3 8B',
      task_type: scenario === 'pid' ? 'Vision P&ID Intelligence' : scenario === 'pump' ? 'Code & Reliability Analysis' : 'Document & Compliance',
      routing_reason: scenario === 'inspection' ? 'Scanned PDF with engineering measurements detected. Routing to Qwen3-8B for document understanding, SOP retrieval, and formal note compilation.'
        : scenario === 'pump' ? 'Excel dataset with Python data analysis requested. Routing to Qwen2.5-Coder-7B for sandbox execution and statistical MTBF calculation.'
        : 'Engineering drawing (P&ID) image detected. Routing to Qwen2.5-VL-7B for spatial vision tag extraction.',
      plan,
      current_step_index: 0,
      tool_calls: [],
      citations: [],
      artifacts: [],
      errors: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setActiveTask(taskBase);

    // Animate each step
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      set({ demoStepIndex: i });

      // Update the plan step to 'running'
      set((state) => {
        if (!state.activeTask) return {};
        const updated = state.activeTask.plan.map((p, idx) =>
          idx === i ? { ...p, status: 'running' as const } : p
        );
        return { activeTask: { ...state.activeTask, plan: updated, current_step_index: i } };
      });

      addTerminalLog({ level: 'tool', message: `[${step.tool}] Starting...`, detail: `Model: ${step.model}` });

      await delay(step.ms + 200);

      addTerminalLog({ level: 'success', message: `[${step.tool}] Completed in ${step.ms}ms`, detail: step.log });

      // Update plan step to 'completed' and add tool call
      set((state) => {
        if (!state.activeTask) return {};
        const updatedPlan = state.activeTask.plan.map((p, idx) =>
          idx === i ? { ...p, status: 'completed' as const } : p
        );
        const newToolCall = {
          call_id: `TC-${100 + i + 1}`,
          tool_name: step.tool,
          arguments: { step: i + 1 },
          output: { result: step.log.slice(0, 80) },
          status: 'success' as const,
          execution_time_ms: step.ms,
          timestamp: new Date().toISOString(),
        };
        return {
          activeTask: {
            ...state.activeTask,
            plan: updatedPlan,
            tool_calls: [...state.activeTask.tool_calls, newToolCall],
          }
        };
      });
    }

    // Final state
    set({ demoRunning: false, demoStepIndex: -1 });

    const citations = isDoc ? [
      { source_file: 'Operations_SOP_014.pdf', page_number: 12, snippet: 'Section 4.2: Nominal wall thickness 5.0mm. Retirement limit 3.0mm. Any measurement below 4.0mm triggers mandatory approval note within 30 days.', relevance_score: 0.962 },
      { source_file: 'Maintenance_Standard_007.pdf', page_number: 8, snippet: 'Section 6.1: Valve packing gland leakage on high-temperature hydrocarbon streams requires formal engineering review and turnaround scheduling.', relevance_score: 0.884 },
    ] : [];

    const artifacts = isDoc ? [{
      artifact_id: 'ART-001',
      file_name: 'Approval_Note_Unit5_Inspection.docx',
      file_type: 'docx' as const,
      file_path: '/static/artifacts/Approval_Note_Unit5_Inspection.docx',
      size_bytes: 42350,
      created_at: new Date().toISOString(),
      approval_status: 'draft' as const,
      description: 'Technical approval note for Crude Column Feed Line P-102 with API 570 corrosion rate (0.343 mm/yr) and remaining life (2.33 years). Includes engineering sign-off block.'
    }] : isPump ? [{
      artifact_id: 'ART-002',
      file_name: 'Pump_Reliability_Analysis_2026.xlsx',
      file_type: 'xlsx' as const,
      file_path: '/static/artifacts/Pump_Reliability_Analysis_2026.xlsx',
      size_bytes: 28400,
      created_at: new Date().toISOString(),
      approval_status: 'draft' as const,
      description: 'Reliability metrics workbook with MTBF = 418.5 hrs, Weibull β = 2.41 for P-102. Includes spares BOM and turnaround schedule.'
    }] : [{
      artifact_id: 'ART-003',
      file_name: 'Executive_Briefing_CDU5.pptx',
      file_type: 'pptx' as const,
      file_path: '/static/artifacts/Executive_Briefing_CDU5.pptx',
      size_bytes: 65100,
      created_at: new Date().toISOString(),
      approval_status: 'draft' as const,
      description: 'Executive PowerPoint briefing with P&ID tag extraction, degraded component summary, and turnaround schedule for management review.'
    }];

    set((state) => ({
      activeTask: state.activeTask ? {
        ...state.activeTask,
        status: 'completed',
        citations,
        artifacts,
        updated_at: new Date().toISOString(),
      } : null
    }));

    addTerminalLog({ level: 'success', message: '── Task Completed Successfully ──', detail: `${steps.length} steps | ${artifacts[0]?.file_name} generated | 0 external calls` });

    // Assistant message
    const assistantText = isDoc
      ? `I analyzed **Inspection_Report_001.pdf** against **SOP-OPS-014** using local on-premise inference.\n\n**Critical Findings:**\n• Line 04-CR-102 wall thickness measured at **3.80 mm** — below the 4.00 mm mandatory alert threshold\n• Calculated corrosion rate: **(5.00 − 3.80) / 3.5 = 0.343 mm/year** (API 570)\n• Remaining safe operating life: **(3.80 − 3.00) / 0.343 = 2.33 years**\n• Recommendation: Secondary NDT within 90 days, spool replacement at Q3 turnaround\n\nAll calculations were executed deterministically in the local Python sandbox. The formal approval note has been generated below.`
      : isPump
      ? `I analyzed **Pump_Failure_Data.xlsx** and executed Python calculations in the isolated Docker sandbox (--network=none).\n\n**Reliability Findings:**\n• Fleet MTBF: **418.5 operating hours** across 6 crude feed pumps\n• Pump P-102: Weibull shape factor β = **2.41** (wear-out failure mode — accelerating)\n• Recommendation: Procure 2 API 610 mechanical seal cartridges before Q3 turnaround\n\nThe full reliability workbook has been generated below.`
      : `I performed multimodal vision analysis on **P_and_ID_Example.png** using local **Qwen2.5-VL-7B**.\n\n**Detected Components:**\n• Pump P-102 (Crude Charge, API 610)\n• Control Valve CV-101 (Globe, Fail-Open)\n• Safety Relief Valve V-14 (PSV 32 kg/cm²)\n• **Line 04-CR-102-A1A — DEGRADED** (wall thinning to 3.80 mm flagged)\n• Temperature Transmitter TI-104\n\nThe executive briefing deck has been compiled below.`;

    addMessage({
      id: `msg-${Date.now()}-a`,
      sender: 'assistant',
      text: assistantText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      task: get().activeTask || undefined,
      citations,
      artifacts,
    });

    setIsProcessing(false);
  },
}));

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
