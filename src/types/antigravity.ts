export type DocumentSourceType = 'USER_UPLOAD' | 'KNOWLEDGE_BASE';

export type TaskType = 
  | 'presentation_generation'
  | 'document_summary'
  | 'code_generation'
  | 'inspection_analysis'
  | 'general_reasoning';

export type DeliverableFormat = 'pptx' | 'docx' | 'xlsx' | 'py' | 'json' | 'markdown';

export type RoutingIntent = 'DIRECT_QA' | 'AMBIGUOUS_TASK' | 'WORKFLOW';

export interface IntentRoutingResult {
  intent: RoutingIntent;
  requires_workflow: boolean;
  requires_vision: boolean;
  requires_rag: boolean;
  requires_python: boolean;
  requires_document_generation: boolean;
  input_files: string[];
  output_format: DeliverableFormat | null;
  deliverable: string | null;
  clarifying_question?: string;
  reason?: string;
}

export interface OutputContract {
  task_type: TaskType;
  requested_output_type: DeliverableFormat | null;
  primary_inputs: string[];
  knowledge_requirements: string[];
  rag_needed: boolean;
  rag_query?: string;
  expected_artifact_type?: DeliverableFormat | null;
  expected_filename?: string | null;
  deliverable_name: string | null;
  validation_rules: {
    must_match_output_type: boolean;
    must_use_user_upload: boolean;
    must_apply_kb_guidance: boolean;
  };
}

export interface ContractValidationResult {
  passed: boolean;
  requested_type: DeliverableFormat;
  generated_type: DeliverableFormat;
  user_files_used: string[];
  kb_guidance_used: string[];
  embedding_model_used: string;
  validation_errors: string[];
}

export interface KbChunk {
  chunk_id: string;
  doc_id: string;
  doc_title: string;
  source_type: 'KNOWLEDGE_BASE';
  content: string;
  embedding: number[];
  metadata: {
    document_type?: string;
    category?: string;
    chunk_index: number;
    total_chunks: number;
  };
}

export type StepType = 
  | 'user_input' 
  | 'chatbot_routing'
  | 'thought' 
  | 'plan_proposed'
  | 'rejection_feedback'
  | 'tool_call' 
  | 'tool_result' 
  | 'response' 
  | 'human_approval' 
  | 'artifact_created';

export interface ProposedStepItem {
  id: string;
  stepNumber: number;
  toolName: string;
  description: string;
  targetModel: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface KbGuidanceRef {
  id: string;
  title: string;
  document_type?: string;
  category?: string;
  snippet: string;
  relevanceScore?: number;
}

export interface ProposedExecutionPlan {
  id: string;
  classifiedTaskType: TaskType | 'document_vision' | 'code_generation' | 'general_reasoning' | 'spreadsheet_work';
  outputContract?: OutputContract;
  primaryModel: string;
  secondaryModel?: string;
  steps: ProposedStepItem[];
  expectedDeliverables: string[];
  userDecision: 'pending' | 'approved' | 'rejected' | 'edited';
  userFeedback?: string;
  revisionCount?: number;
  intentSummary?: string;
  targetFileNames?: string[];
  userUploadFiles?: string[];
  relevantKbGuidance?: KbGuidanceRef[];
  noKbGuidanceFound?: boolean;
  kbConflictDetected?: boolean;
  kbConflictSummary?: string;
}

export interface NetworkAuditLog {
  id: string;
  timestamp: string;
  source: string;
  destination: string;
  protocol: 'HTTP' | 'SOCKET' | 'IPC' | 'SANDBOX_ISOLATED';
  bytesSent: number;
  bytesReceived: number;
  isExternal: boolean;
  modelOrTool: string;
}

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
  groundedStatus?: 'grounded' | 'routed' | 'insufficient';
  timestamp: string;
  citations?: { source: string; page?: number; snippet: string }[];
  artifacts?: ArtifactItem[];
  proposedPlan?: ProposedExecutionPlan;
  isExpanded?: boolean;
}

export interface ValidationResult {
  grounded: boolean;
  answers_question: boolean;
  evidence_sufficient: boolean;
  confidence: number;
  unsupported_claims: string[];
  missing_information: string[];
  contradictions: string[];
  reason: string;
  route: 'RETURN' | 'REEVALUATE' | 'RETURN_LOW_CONFIDENCE' | 'GENERAL_REASONING' | 'INSUFFICIENT_EVIDENCE';
}

export interface ValidationAuditLog {
  id: string;
  timestamp: string;
  user_query: string;
  retrieved_context: string;
  selected_initial_model: string;
  initial_answer: string;
  validation_confidence: number;
  initial_confidence?: number;
  reevaluation_confidence?: number;
  evaluation_count?: number;
  max_evaluations?: number;
  disclaimer_added?: boolean;
  validation_result: ValidationResult;
  unsupported_claims: string[];
  missing_information: string[];
  contradictions: string[];
  routing_decision: 'ACCEPTED_INITIAL' | 'REEVALUATED' | 'ACCEPTED_AFTER_REEVALUATION' | 'RETURN_LOW_CONFIDENCE' | 'ROUTED_TO_REASONING' | 'INSUFFICIENT_EVIDENCE_RETURN';
  reasoning_model_used?: string;
  reasoning_answer?: string;
  final_answer: string;
  final_validation_result?: ValidationResult;
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
  downloadUrl?: string;
  blob?: Blob;
  approvalStatus?: 'draft' | 'approved';
  slideCount?: number;
  slides?: { title: string; bullets: string[]; layout?: string }[];
}

export interface PptxSlide {
  title: string;
  purpose?: string;
  content: string[];
  speakerNotes?: string;
  layout?: 'title' | 'content' | 'split' | 'summary';
  visualSuggestion?: string;
  sourceReferences?: string[];
}

export interface PptxStructuredContent {
  title: string;
  subtitle: string;
  executiveSummary?: string;
  slides: PptxSlide[];
}

export interface DocxSection {
  heading: string;
  paragraphs: string[];
  bulletPoints?: string[];
  keyMetrics?: Record<string, string>;
}

export interface DocxStructuredContent {
  documentTitle: string;
  documentType: string;
  metadata?: Record<string, string>;
  executiveSummary: string;
  sections: DocxSection[];
  signOffBlock?: {
    preparedBy?: string;
    verifiedBy?: string;
    status?: string;
  };
}

export interface XlsxSheet {
  name: string;
  purpose?: string;
  headers: string[];
  rows: (string | number)[][];
  formulas?: string[];
  summary?: string;
}

export interface XlsxStructuredContent {
  workbookTitle: string;
  summary?: string;
  sheets: XlsxSheet[];
}

export interface WorkflowContext {
  userRequest: string;
  sourceFiles: { name: string; content?: string; dataUrl?: string; type: string }[];
  extractedContent: string;
  ragContext: KbGuidanceRef[];
  visionFindings?: string;
  sensorReadings?: Record<string, any>;
  calculations?: { formula: string; result: any; summary: string };
  llmOutputs: Record<string, string>;
  structuredDeliverable?: any;
  artifact?: ArtifactItem;
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
  source_type: 'KNOWLEDGE_BASE';
  document_type?: 'guideline' | 'sop' | 'template' | 'rule' | 'other';
  category?: string;
  department?: string;
  version?: string;
  content?: string;
  chunks?: KbChunk[];
  conflictWithDocId?: string;
  conflictDetails?: string;
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
  activeProposedPlan?: ProposedExecutionPlan;
}

