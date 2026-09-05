import { create } from 'zustand';
import type { TaskState, SovereigntyReport, ModelMetadata, ChatMessage, WorkspaceTab } from '../types';

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
  isTaskPanelOpen: boolean;
  isCommandPaletteOpen: boolean;
  isSecurityModalOpen: boolean;
  activeNavSection: 'chat' | 'explorer' | 'documents' | 'knowledge' | 'drawing' | 'models' | 'security' | 'audit';

  // Compatibility aliases
  activeTab: string;
  setActiveTab: (tab: string) => void;

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
  setCommandPaletteOpen: (isOpen: boolean) => void;
  setSecurityModalOpen: (isOpen: boolean) => void;
  setSovereignty: (sov: SovereigntyReport) => void;
  setModels: (models: ModelMetadata[]) => void;
}

const defaultTabs: WorkspaceTab[] = [
  { id: 'tab-chat', title: 'Workbench Chat', type: 'chat', isClosable: false }
];

export const useWorkbenchStore = create<WorkbenchStore>((set) => ({
  messages: [],
  activeTask: null,
  tasksHistory: [],
  isProcessing: false,
  attachedFiles: [],
  
  tabs: defaultTabs,
  activeTabId: 'tab-chat',
  isTaskPanelOpen: false,
  isCommandPaletteOpen: false,
  isSecurityModalOpen: false,
  activeNavSection: 'chat',
  activeTab: 'chat',

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
  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
  setSecurityModalOpen: (isSecurityModalOpen) => set({ isSecurityModalOpen }),
  setSovereignty: (sovereignty) => set({ sovereignty }),
  setModels: (models) => set({ models }),
}));
