import { create } from 'zustand';
import { TaskState, SovereigntyReport, ModelMetadata } from '../types';

interface WorkbenchStore {
  activeTask: TaskState | null;
  tasksHistory: TaskState[];
  sovereignty: SovereigntyReport | null;
  models: ModelMetadata[];
  isProcessing: boolean;
  activeTab: string;
  setActiveTask: (task: TaskState | null) => void;
  updateActiveTask: (updater: (prev: TaskState | null) => TaskState | null) => void;
  setTasksHistory: (tasks: TaskState[]) => void;
  setSovereignty: (sov: SovereigntyReport) => void;
  setModels: (models: ModelMetadata[]) => void;
  setIsProcessing: (status: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export const useWorkbenchStore = create<WorkbenchStore>((set) => ({
  activeTask: null,
  tasksHistory: [],
  sovereignty: null,
  models: [],
  isProcessing: false,
  activeTab: 'agent',
  setActiveTask: (task) => set({ activeTask: task }),
  updateActiveTask: (updater) => set((state) => ({ activeTask: updater(state.activeTask) })),
  setTasksHistory: (tasks) => set({ tasksHistory: tasks }),
  setSovereignty: (sovereignty) => set({ sovereignty }),
  setModels: (models) => set({ models }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setActiveTab: (activeTab) => set({ activeTab }),
}));
