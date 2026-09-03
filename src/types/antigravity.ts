export type StepType = 
  | 'user_input' 
  | 'thought' 
  | 'tool_call' 
  | 'tool_result' 
  | 'response' 
  | 'human_approval' 
  | 'artifact_created';

export interface TrajectoryStep {
  id: string;
  type: StepType;
  title?: string;
  content?: string;
  toolName?: string;
  toolArgs?: Record<string, any>;
  toolOutput?: any;
  durationMs?: number;
  status?: 'pending' | 'running' | 'success' | 'error' | 'waiting_approval';
  timestamp: string;
  citations?: { source: string; page?: number; snippet: string }[];
  artifacts?: ArtifactItem[];
  isExpanded?: boolean;
}

export interface ArtifactItem {
  id: string;
  name: string;
  type: 'docx' | 'xlsx' | 'pptx' | 'pdf' | 'png' | 'py' | 'json';
  path: string;
  sizeBytes: number;
  description: string;
  createdAt: string;
  previewUrl?: string;
  approvalStatus?: 'draft' | 'approved';
}

export interface SkillItem {
  id: string;
  name: string;
  description: string;
  tools: string[];
  isLocal: boolean;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  summary: string;
  path: string;
  totalChunks: number;
}

export interface AntigravitySession {
  id: string;
  title: string;
  createdAt: string;
  model: string;
  mode: 'agent' | 'planning' | 'fast';
  steps: TrajectoryStep[];
  attachedFiles: string[];
  status: 'idle' | 'running' | 'waiting_approval' | 'completed' | 'failed';
}
