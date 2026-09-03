export interface ToolCallRecord {
  call_id: string;
  tool_name: string;
  arguments: Record<string, any>;
  output?: any;
  status: 'pending' | 'success' | 'error';
  error_message?: string;
  execution_time_ms: number;
  timestamp: string;
}

export interface Citation {
  source_file: string;
  page_number?: number;
  section_title?: string;
  snippet: string;
  relevance_score: number;
}

export interface ArtifactRecord {
  artifact_id: string;
  file_name: string;
  file_type: 'docx' | 'xlsx' | 'pptx' | 'py' | 'csv' | 'png' | 'pdf' | 'txt';
  file_path: string;
  size_bytes: number;
  created_at: string;
  approval_status: 'draft' | 'reviewed' | 'approved' | 'rejected';
  description: string;
}

export interface AgentStep {
  step_id: number;
  title: string;
  description: string;
  tool_name?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result_summary?: string;
  error?: string;
  attempts: number;
  duration_ms: number;
}

export interface TaskState {
  task_id: string;
  objective: string;
  status: 'pending' | 'planning' | 'running' | 'verifying' | 'completed' | 'failed';
  attached_files: string[];
  selected_model_id: string;
  selected_model_name: string;
  task_type: string;
  routing_reason: string;
  plan: AgentStep[];
  current_step_index: number;
  tool_calls: ToolCallRecord[];
  citations: Citation[];
  artifacts: ArtifactRecord[];
  errors: string[];
  final_output?: string;
  created_at: string;
  updated_at: string;
}

export interface ModelMetadata {
  id: string;
  ollama_name: string;
  type: string;
  capabilities: string[];
  context_window: number;
  vision: boolean;
  coding: boolean;
  vram_mb: number;
  description: string;
  is_installed: boolean;
}

export interface AuditEvent {
  event_id: string;
  timestamp: string;
  event_type: string;
  task_id?: string;
  user: string;
  model_used?: string;
  tool_used?: string;
  files_accessed: string[];
  artifact_created?: string;
  status: string;
  details: Record<string, any>;
}

export interface SovereigntyReport {
  is_air_gapped: boolean;
  external_api_calls: number;
  internet_dependency: string;
  network_mode: string;
  local_inference_status: string;
  local_ocr_status: string;
  local_rag_status: string;
  local_sandbox_status: string;
  blocked_external_attempts: any[];
  telemetry_policy: string;
  active_services: string[];
}
