import { create } from 'zustand';
import type { 
  AntigravitySession, 
  TrajectoryStep, 
  ArtifactItem, 
  SkillItem, 
  KnowledgeItem 
} from '../types/antigravity';

interface AntigravityStore {
  // Session & Trajectory
  sessions: AntigravitySession[];
  activeSessionId: string;
  activeMode: 'agent' | 'planning' | 'fast';
  selectedModel: string;
  attachedFiles: string[];
  isExecuting: boolean;
  
  // Right Pane State
  activeRightTab: 'artifacts' | 'pdf_viewer' | 'pid_cad' | 'rag_knowledge' | 'telemetry';
  isRightPaneOpen: boolean;
  selectedArtifactId: string | null;

  // Skills & KIs
  skills: SkillItem[];
  knowledgeItems: KnowledgeItem[];

  // Modals & Palette
  isCommandPaletteOpen: boolean;
  isSecurityModalOpen: boolean;

  // Actions
  createNewSession: (title?: string) => string;
  selectSession: (id: string) => void;
  setActiveMode: (mode: 'agent' | 'planning' | 'fast') => void;
  setSelectedModel: (model: string) => void;
  attachFile: (file: string) => void;
  removeAttachedFile: (file: string) => void;
  clearAttachments: () => void;
  
  // Trajectory Execution Actions
  addStepToActiveSession: (step: TrajectoryStep) => void;
  updateStepInActiveSession: (stepId: string, updates: Partial<TrajectoryStep>) => void;
  setIsExecuting: (val: boolean) => void;
  runIndustrialDemo: (demoType: 'inspection' | 'pump_mtbf' | 'pid_vision' | 'sop_search') => Promise<void>;
  approveStep: (stepId: string) => void;

  // Right Pane Actions
  setActiveRightTab: (tab: 'artifacts' | 'pdf_viewer' | 'pid_cad' | 'rag_knowledge' | 'telemetry') => void;
  toggleRightPane: () => void;
  setRightPaneOpen: (val: boolean) => void;
  setSelectedArtifactId: (id: string | null) => void;

  // Modals
  setCommandPaletteOpen: (val: boolean) => void;
  setSecurityModalOpen: (val: boolean) => void;
}

const initialSkills: SkillItem[] = [
  { id: 'ocr-parser', name: 'pdf-ocr-intelligence', description: 'Local PyMuPDF & PaddleOCR parser for scanned industrial forms', tools: ['ocr_document', 'extract_tables'], isLocal: true },
  { id: 'api570-calc', name: 'industrial-corrosion-engine', description: 'Deterministic ASME B31.3 & API 570 remaining life calculator', tools: ['api570_corrosion_calc', 'validate_asme_limits'], isLocal: true },
  { id: 'pid-vision', name: 'pid-schematic-vision', description: 'Multimodal Qwen2.5-VL vector symbol and line tag extraction', tools: ['detect_pid_symbols', 'trace_piping_flow'], isLocal: true },
  { id: 'chroma-rag', name: 'chromadb-sop-retriever', description: 'Local 768-D semantic RAG across MRPL refinery standards', tools: ['query_sop_standards', 'get_chunk_provenance'], isLocal: true },
  { id: 'docker-sandbox', name: 'docker-python-sandbox', description: 'Hardened Docker container execution with --network=none', tools: ['execute_python_sandbox', 'generate_excel_chart'], isLocal: true }
];

const initialKIs: KnowledgeItem[] = [
  { id: 'ki-sop014', title: 'SOP-OPS-014 (Rev 4)', summary: 'Crude Distillation Unit Operating Standards & Integrity Gating', path: 'demo/synthetic/Operations_SOP_014.pdf', totalChunks: 38 },
  { id: 'ki-ms007', title: 'MS-ENG-007 (Rev 2)', summary: 'Refinery Maintenance Guideline for High-Temperature Hydrocarbon Containment', path: 'demo/synthetic/Maintenance_Standard_007.pdf', totalChunks: 24 }
];

const initialSessionId = 'session-cdu5-001';

const initialSessions: AntigravitySession[] = [
  {
    id: initialSessionId,
    title: 'CDU-5 Line 04-CR-102 Corrosion Life Assessment',
    createdAt: 'Just now',
    model: 'qwen3:8b (Local Resident)',
    mode: 'agent',
    attachedFiles: ['demo/synthetic/Inspection_Report_001.pdf'],
    status: 'idle',
    steps: []
  }
];

export const useAntigravityStore = create<AntigravityStore>((set, get) => ({
  sessions: initialSessions,
  activeSessionId: initialSessionId,
  activeMode: 'agent',
  selectedModel: 'qwen3:8b (Local Resident)',
  attachedFiles: [],
  isExecuting: false,
  
  activeRightTab: 'artifacts',
  isRightPaneOpen: true,
  selectedArtifactId: 'art-docx-001',

  skills: initialSkills,
  knowledgeItems: initialKIs,

  isCommandPaletteOpen: false,
  isSecurityModalOpen: false,

  createNewSession: (title = 'New Agentic Task') => {
    const newId = `session-${Date.now().toString().slice(-6)}`;
    const newSession: AntigravitySession = {
      id: newId,
      title,
      createdAt: 'Just now',
      model: get().selectedModel,
      mode: get().activeMode,
      attachedFiles: [],
      status: 'idle',
      steps: []
    };
    set((state) => ({
      sessions: [newSession, ...state.sessions],
      activeSessionId: newId,
      attachedFiles: []
    }));
    return newId;
  },

  selectSession: (id) => set({ activeSessionId: id }),
  setActiveMode: (activeMode) => set({ activeMode }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  attachFile: (file) => set((state) => ({
    attachedFiles: state.attachedFiles.includes(file) ? state.attachedFiles : [...state.attachedFiles, file]
  })),
  removeAttachedFile: (file) => set((state) => ({
    attachedFiles: state.attachedFiles.filter((f) => f !== file)
  })),
  clearAttachments: () => set({ attachedFiles: [] }),

  addStepToActiveSession: (step) => set((state) => ({
    sessions: state.sessions.map((s) => 
      s.id === state.activeSessionId ? { ...s, steps: [...s.steps, step] } : s
    )
  })),

  updateStepInActiveSession: (stepId, updates) => set((state) => ({
    sessions: state.sessions.map((s) => 
      s.id === state.activeSessionId 
        ? { ...s, steps: s.steps.map((st) => st.id === stepId ? { ...st, ...updates } : st) }
        : s
    )
  })),

  setIsExecuting: (isExecuting) => set({ isExecuting }),

  approveStep: (stepId) => {
    get().updateStepInActiveSession(stepId, {
      status: 'success',
      content: 'Authorized by Lead Inspection Engineer. Proceeding with deliverable compilation.'
    });
  },

  runIndustrialDemo: async (demoType) => {
    const { addStepToActiveSession, updateStepInActiveSession, setIsExecuting, setActiveRightTab } = get();
    setIsExecuting(true);

    const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (demoType === 'inspection') {
      // 1. User Step
      const userStepId = `step-${Date.now()}-u`;
      addStepToActiveSession({
        id: userStepId,
        type: 'user_input',
        content: 'Read Inspection_Report_001.pdf, identify the major ultrasonic findings, compare them against SOP-OPS-014, calculate the corrosion rate and remaining life under API 570, and compile an official Word (.docx) approval note.',
        timestamp: now()
      });

      // 2. Antigravity Thought
      const thoughtStepId = `step-${Date.now()}-t1`;
      addStepToActiveSession({
        id: thoughtStepId,
        type: 'thought',
        title: 'Task Understanding & Execution Planning',
        content: 'Goal: Industrial compliance audit and deterministic calculation.\nPlan:\n1. Execute local PaddleOCR & PyMuPDF to extract thickness measurements.\n2. Query ChromaDB for SOP-OPS-014 process piping limits (Section 4.2).\n3. Trigger API 570 calculator tool for corrosion rate: (t_prev - t_act) / time.\n4. Require human safety confirmation before final .docx generation.\n5. Compile Approval_Note_Unit5_Inspection.docx and verify air-gap isolation.',
        status: 'running',
        timestamp: now()
      });

      await new Promise(r => setTimeout(r, 600));
      updateStepInActiveSession(thoughtStepId, { status: 'success' });

      // 3. Tool Call: OCR Document
      const toolOcrId = `step-${Date.now()}-tool1`;
      addStepToActiveSession({
        id: toolOcrId,
        type: 'tool_call',
        toolName: 'pdf_ocr_intelligence.ocr_document',
        toolArgs: { file: 'demo/synthetic/Inspection_Report_001.pdf', pages: [1, 2, 3, 4] },
        status: 'running',
        timestamp: now()
      });

      await new Promise(r => setTimeout(r, 700));
      updateStepInActiveSession(toolOcrId, {
        status: 'success',
        durationMs: 340,
        toolOutput: {
          scanned_document: 'CDU-5 Wall Thickness Survey',
          equipment_tag: 'Line 04-CR-102 (P-102 Suction)',
          measured_thickness: '3.80 mm',
          nominal_thickness: '5.00 mm',
          previous_survey_thickness: '5.00 mm (2022)',
          service_years: 3.5,
          ocr_confidence: '98.9%'
        }
      });

      // 4. Tool Call: ChromaDB Search
      const toolRagId = `step-${Date.now()}-tool2`;
      addStepToActiveSession({
        id: toolRagId,
        type: 'tool_call',
        toolName: 'chromadb_sop_retriever.query_sop_standards',
        toolArgs: { query: 'crude distillation process piping retirement thickness limit', top_k: 2 },
        status: 'running',
        timestamp: now()
      });

      await new Promise(r => setTimeout(r, 600));
      updateStepInActiveSession(toolRagId, {
        status: 'success',
        durationMs: 180,
        toolOutput: {
          retrieved_chunks: 2,
          embedding_model: 'nomic-embed-text (768-D Local)',
          top_match: {
            source_file: 'Operations_SOP_014.pdf',
            page: 12,
            section: 'Section 4.2: Critical Process Piping Integrity Thresholds',
            similarity: 0.962,
            rule: 'Nominal thickness 5.0mm, retirement limit 3.0mm. Measured thickness under 4.0mm triggers mandatory formal approval note and secondary scan.'
          }
        }
      });

      // 5. Tool Call: API 570 Calculation
      const toolCalcId = `step-${Date.now()}-tool3`;
      addStepToActiveSession({
        id: toolCalcId,
        type: 'tool_call',
        toolName: 'industrial_corrosion_engine.api570_corrosion_calc',
        toolArgs: { t_prev: 5.0, t_act: 3.8, t_retire: 3.0, service_years: 3.5 },
        status: 'running',
        timestamp: now()
      });

      await new Promise(r => setTimeout(r, 500));
      updateStepInActiveSession(toolCalcId, {
        status: 'success',
        durationMs: 25,
        toolOutput: {
          formula: 'Corrosion Rate = (5.0 - 3.8) / 3.5 = 0.343 mm/year',
          remaining_life: 'Remaining Life = (3.8 - 3.0) / 0.343 = 2.33 Years',
          status: 'ACTION_REQUIRED',
          breach: 'Measured value 3.80mm is below 4.00mm alert limit.'
        }
      });

      // 6. Tool Call: Generate Word Deliverable
      const toolDocxId = `step-${Date.now()}-tool4`;
      addStepToActiveSession({
        id: toolDocxId,
        type: 'tool_call',
        toolName: 'document_generator.generate_docx',
        toolArgs: { template: 'approval_note', file_name: 'Approval_Note_Unit5_Inspection.docx' },
        status: 'running',
        timestamp: now()
      });

      await new Promise(r => setTimeout(r, 600));
      updateStepInActiveSession(toolDocxId, {
        status: 'success',
        durationMs: 450,
        toolOutput: {
          file_created: 'Approval_Note_Unit5_Inspection.docx',
          size_bytes: 42350,
          sign_off_status: 'Pending Chief Inspection Engineer Review'
        }
      });

      // 7. Final Agent Response
      const responseStepId = `step-${Date.now()}-resp`;
      addStepToActiveSession({
        id: responseStepId,
        type: 'response',
        content: `I analyzed **Inspection_Report_001.pdf** using local open-weight models (**Qwen3-8B** + **PaddleOCR**) with zero external network transmission.\n\n### Executive Summary & Technical Audit\n• **Equipment Unit:** CDU-5 Crude Charge Feed Piping (Line 04-CR-102)\n• **Measured Thickness:** **3.80 mm** (Nominal: 5.00 mm, Previous: 5.00 mm, Service: 3.5 Yrs)\n• **SOP Compliance Breach:** Measured value **3.80 mm** is below the **4.00 mm** review limit defined in **SOP-OPS-014 (Section 4.2)**.\n• **Deterministic API 570 Calculations:**\n  - **Corrosion Rate:** $\\frac{5.00 - 3.80}{3.50} = \\mathbf{0.343\\text{ mm/year}}$\n  - **Remaining Safe Operating Life:** $\\frac{3.80 - 3.00}{0.343} = \\mathbf{2.33\\text{ Years}}$ (Retirement Limit: 3.00 mm)\n\n### Action Items\n1. Scheduled secondary ultrasonic re-scan prior to Q3 turnaround.\n2. Official approval note compiled with digital sign-off block for engineering authorization.`,
        citations: [
          { source: 'Operations_SOP_014.pdf', page: 12, snippet: 'Measured thickness under 4.0mm triggers mandatory formal approval note within 30 days.' },
          { source: 'Inspection_Report_001.pdf', page: 2, snippet: 'Elbow section extrados recorded wall thinning to 3.80 mm.' }
        ],
        artifacts: [
          {
            id: 'art-docx-001',
            name: 'Approval_Note_Unit5_Inspection.docx',
            type: 'docx',
            path: '/static/artifacts/Approval_Note_Unit5_Inspection.docx',
            sizeBytes: 42350,
            description: 'Formal Word approval note with API 570 math breakdown and sign-off stamp.',
            createdAt: now(),
            approvalStatus: 'draft'
          }
        ],
        timestamp: now()
      });

      setActiveRightTab('artifacts');
    }

    setIsExecuting(false);
  },

  setActiveRightTab: (activeRightTab) => set({ activeRightTab }),
  toggleRightPane: () => set((state) => ({ isRightPaneOpen: !state.isRightPaneOpen })),
  setRightPaneOpen: (isRightPaneOpen) => set({ isRightPaneOpen }),
  setSelectedArtifactId: (selectedArtifactId) => set({ selectedArtifactId }),
  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
  setSecurityModalOpen: (isSecurityModalOpen) => set({ isSecurityModalOpen }),
}));
