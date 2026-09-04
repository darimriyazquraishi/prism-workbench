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
  selectedModel: string | null;
  setSelectedModel: (model: string | null) => void;

  // Settings Modal & User Profile
  isSettingsOpen: boolean;
  setSettingsOpen: (isOpen: boolean) => void;
  settingsTab: 'models' | 'engine' | 'privacy' | 'profile';
  setSettingsTab: (tab: 'models' | 'engine' | 'privacy' | 'profile') => void;
  userProfile: { displayName: string; role: string; plan: string };
  setUserProfile: (profile: Partial<{ displayName: string; role: string; plan: string }>) => void;

  // Sessions History
  savedSessions: Array<{ id: string; title: string; createdAt: string; messageCount: number }>;
  saveCurrentSession: () => void;

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

  // New Chat
  clearMessages: () => void;
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
    local_inference_status: 'OFFLINE / UNLOADED',
    local_ocr_status: 'ONLINE (PyMuPDF / PaddleOCR)',
    local_rag_status: 'ONLINE (ChromaDB Local)',
    local_sandbox_status: 'ONLINE (Docker --net=none)',
    blocked_external_attempts: [],
    telemetry_policy: 'ZERO_OUTBOUND_TELEMETRY',
    active_services: ['chromadb', 'docker-sandbox', 'sqlite-audit']
  },
  models: [],
  selectedModel: null,
  setSelectedModel: (selectedModel) => set({ selectedModel }),

  isSettingsOpen: false,
  setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
  settingsTab: 'models',
  setSettingsTab: (settingsTab) => set({ settingsTab }),
  userProfile: {
    displayName: 'Local User',
    role: 'Security & Engineering Operator',
    plan: 'Offline Air-Gapped Edition'
  },
  setUserProfile: (profile) => set((state) => ({
    userProfile: { ...state.userProfile, ...profile }
  })),

  savedSessions: [],
  saveCurrentSession: () => set((state) => {
    if (state.messages.length === 0) return state;
    const firstUserMsg = state.messages.find(m => m.sender === 'user');
    const title = firstUserMsg ? firstUserMsg.text.slice(0, 40) + '...' : 'Air-Gap Session';
    const newSession = {
      id: `session-${Date.now()}`,
      title,
      createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      messageCount: state.messages.length
    };
    return {
      savedSessions: [newSession, ...state.savedSessions.slice(0, 19)]
    };
  }),

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
  clearMessages: () => set({ messages: [], activeTask: null, attachedFiles: [] }),
}));

