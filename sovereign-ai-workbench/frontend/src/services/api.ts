import { TaskState, ModelMetadata, AuditEvent, SovereigntyReport, ArtifactRecord } from '../types';

const API_BASE = '/api';

export const api = {
  // Tasks
  createTask: async (objective: string, attached_files: string[] = [], force_model?: string): Promise<TaskState> => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objective, attached_files, force_model })
    });
    return res.json();
  },

  getTask: async (taskId: string): Promise<TaskState> => {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`);
    return res.json();
  },

  listTasks: async (): Promise<TaskState[]> => {
    const res = await fetch(`${API_BASE}/tasks`);
    return res.json();
  },

  // Documents
  listDocuments: async () => {
    const res = await fetch(`${API_BASE}/documents`);
    return res.json();
  },

  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  // Knowledge Base
  listKnowledge: async () => {
    const res = await fetch(`${API_BASE}/knowledge/collections`);
    return res.json();
  },

  searchKnowledge: async (query: string) => {
    const res = await fetch(`${API_BASE}/knowledge/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    return res.json();
  },

  // Artifacts
  listArtifacts: async (): Promise<ArtifactRecord[]> => {
    const res = await fetch(`${API_BASE}/artifacts`);
    return res.json();
  },

  // Models
  listModels: async (): Promise<{ models: ModelMetadata[]; total_vram_budget_mb: number }> => {
    const res = await fetch(`${API_BASE}/models`);
    return res.json();
  },

  // Tools
  listTools: async () => {
    const res = await fetch(`${API_BASE}/tools`);
    return res.json();
  },

  // Audit
  listAuditEvents: async (): Promise<AuditEvent[]> => {
    const res = await fetch(`${API_BASE}/audit/events`);
    return res.json();
  },

  // System & Sovereignty
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/system/health`);
    return res.json();
  },

  getSovereignty: async (): Promise<SovereigntyReport> => {
    const res = await fetch(`${API_BASE}/system/sovereignty`);
    return res.json();
  },

  getResources: async () => {
    const res = await fetch(`${API_BASE}/system/resources`);
    return res.json();
  }
};
