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

  clearTerminalLogs: () => void;
}

const defaultTabs: WorkspaceTab[] = [
  { id: 'tab-chat', title: 'Workbench Chat', type: 'chat', isClosable: false }
];

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
}));

