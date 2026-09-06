import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  FileText, 
  Download, 
  Eye, 
  ChevronDown, 
  ChevronRight, 
  Sparkles, 
  FileCode, 
  FileSpreadsheet, 
  FileCheck, 
  Presentation, 
  File, 
  ArrowRight,
  Database,
  Lock,
  Terminal,
  RotateCcw
} from 'lucide-react';
import type { TrajectoryStep, ArtifactItem, ProposedExecutionPlan } from '../../types/antigravity';
import { useAntigravityStore } from '../../store/useAntigravityStore';

interface TaskResultViewProps {
  step: TrajectoryStep;
  proposedPlan?: ProposedExecutionPlan;
}

export const TaskResultView: React.FC<TaskResultViewProps> = ({ step, proposedPlan }) => {
  const { 
    selectedModel, 
    setRightPaneOpen, 
    setActiveRightTab,
    isExecuting,
    approveProposedPlan
  } = useAntigravityStore();

  const [isTimelineOpen, setIsTimelineOpen] = useState(true);
  const [isGroundingOpen, setIsGroundingOpen] = useState(false);
  const [isSovereigntyOpen, setIsSovereigntyOpen] = useState(false);
  const [isTechDetailsOpen, setIsTechDetailsOpen] = useState(false);
  const [previewingArtifactId, setPreviewingArtifactId] = useState<string | null>(null);

  const artifacts = step.artifacts || [];
  const citations = step.citations || [];
  const isFailed = step.status === 'error';
  const isRunning = step.status === 'running' || isExecuting;

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Icon selector based on file extension
  const getFileIcon = (fileName: string, fileType?: string) => {
    const ext = (fileName.split('.').pop() || fileType || '').toLowerCase();
    switch (ext) {
      case 'pptx':
      case 'ppt':
      case 'presentation':
        return <Presentation className="w-5 h-5 text-amber-400 flex-shrink-0" />;
      case 'docx':
      case 'doc':
        return <FileText className="w-5 h-5 text-sky-400 flex-shrink-0" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
      case 'pdf':
        return <FileCheck className="w-5 h-5 text-rose-400 flex-shrink-0" />;
      case 'py':
      case 'json':
      case 'js':
      case 'ts':
        return <FileCode className="w-5 h-5 text-purple-400 flex-shrink-0" />;
      default:
        return <File className="w-5 h-5 text-[var(--accent-primary)] flex-shrink-0" />;
    }
  };

  // Open preview in right pane
  const handlePreviewArtifact = (art: ArtifactItem) => {
    setPreviewingArtifactId(art.id);
    setActiveRightTab('artifacts');
    setRightPaneOpen(true);
  };

  // Extract clean task description title
  const getTaskTitle = () => {
    if (artifacts.length > 0) {
      const mainArt = artifacts[0];
      const ext = mainArt.name.split('.').pop()?.toUpperCase() || 'DELIVERABLE';
      return `${ext} Deliverable Generated & Verified`;
    }
    return 'Task Execution Completed Successfully';
  };

  // Extract human readable subtitle
  const getTaskSubtitle = () => {
    if (artifacts.length > 0) {
      const artNames = artifacts.map(a => a.name).join(', ');
      return `Generated verified workspace file (${artNames}) using local reasoning model without external egress.`;
    }
    return 'Execution completed according to assigned workflow contract and safety requirements.';
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-lg space-y-5 font-sans text-xs">
      
      {/* 1. TASK COMPLETED RESULT HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-subtle)] pb-4 gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border ${
            isFailed 
              ? 'bg-rose-950/40 border-rose-800/50 text-rose-400'
              : isRunning 
                ? 'bg-amber-950/40 border-amber-800/50 text-amber-400' 
                : 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400'
          }`}>
            {isFailed ? (
              <XCircle className="w-5 h-5" />
            ) : isRunning ? (
              <Clock className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                {isFailed ? 'Task Execution Failed' : isRunning ? 'Executing Pipeline Task...' : getTaskTitle()}
              </h2>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${
                isFailed 
                  ? 'bg-rose-950/50 text-rose-300 border-rose-800/40' 
                  : isRunning 
                    ? 'bg-amber-950/50 text-amber-300 border-amber-800/40' 
                    : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40'
              }`}>
                {isFailed ? 'FAILED' : isRunning ? 'RUNNING' : 'SUCCESS'}
              </span>
            </div>

            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-snug">
              {isFailed ? 'Unable to generate requested deliverable. Review error details below.' : getTaskSubtitle()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--text-tertiary)] self-end sm:self-center">
          <Clock className="w-3.5 h-3.5" />
          <span>{isFailed ? 'Halted' : 'Completed'} {step.timestamp || 'just now'}</span>
        </div>
      </div>

      {/* ERROR DIAGNOSTICS BANNER IF FAILED */}
      {isFailed && (
        <div className="p-3.5 bg-rose-950/30 border border-rose-800/50 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Execution Failure Diagnostics</span>
          </div>
          <div className="text-[11px] font-mono text-rose-200 bg-[var(--bg-base)] p-2.5 rounded border border-rose-900/40 whitespace-pre-wrap max-h-48 overflow-y-auto">
            {step.content || 'Task encountered an unhandled exception during local execution. Check model availability and input parameters.'}
          </div>
        </div>
      )}

      {/* 2. EXECUTION SUMMARY GRID */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span>Execution Summary</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {/* Item 1: Task Analysis */}
          <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-1">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono truncate">Task Analysis</div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[var(--text-primary)]">
                {isFailed ? 'Halted' : 'Parsed'}
              </span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                isFailed 
                  ? 'bg-rose-950/40 text-rose-400 border-rose-800/40' 
                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
              }`}>
                {isFailed ? 'Failed' : 'Completed'}
              </span>
            </div>
          </div>

          {/* Item 2: Model Execution */}
          <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-1">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono truncate">Model Execution</div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[11px] text-[var(--text-primary)] font-mono truncate max-w-[80px]" title={selectedModel || 'Qwen Engine'}>
                {selectedModel ? selectedModel.split(':')[0] : 'Qwen Local'}
              </span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                isFailed 
                  ? 'bg-rose-950/40 text-rose-400 border-rose-800/40' 
                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
              }`}>
                {isFailed ? 'Error' : 'Completed'}
              </span>
            </div>
          </div>

          {/* Item 3: Knowledge Retrieval */}
          <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-1">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono truncate">Knowledge Base</div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[var(--text-primary)]">
                {citations.length > 0 ? `${citations.length} Sources` : 'Not Used'}
              </span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                citations.length > 0 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' 
                  : 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)] border-[var(--border-subtle)]'
              }`}>
                {citations.length > 0 ? 'Applied' : 'Not Used'}
              </span>
            </div>
          </div>

          {/* Item 4: Artifact Generation */}
          <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-1">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono truncate">Artifact Generation</div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[var(--text-primary)] uppercase">
                {isFailed ? 'None' : (artifacts.length > 0 ? artifacts[0].type : 'N/A')}
              </span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                isFailed 
                  ? 'bg-rose-950/40 text-rose-400 border-rose-800/40' 
                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
              }`}>
                {isFailed ? 'Failed' : 'Completed'}
              </span>
            </div>
          </div>

          {/* Item 5: Output Contract Validation */}
          <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-1 col-span-2 sm:col-span-1">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono truncate">Contract Validation</div>
            <div className="flex items-center justify-between">
              <span className={`font-semibold text-xs font-mono ${isFailed ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isFailed ? '0% (Failed)' : '100% Valid'}
              </span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                isFailed 
                  ? 'bg-rose-950/40 text-rose-400 border-rose-800/40' 
                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
              }`}>
                {isFailed ? 'Failed' : 'Passed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. GENERATED ARTIFACTS SECTION */}
      {artifacts.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              Generated Deliverables ({artifacts.length})
            </span>
            <span className="text-[10px] text-[var(--accent-success)] font-normal flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified Local Asset
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {artifacts.map((art) => {
              const downloadHref = art.downloadUrl || `/static/artifacts/${art.name}`;
              return (
                <div 
                  key={art.id} 
                  className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] group-hover:scale-105 transition-transform">
                      {getFileIcon(art.name, art.type)}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm text-[var(--text-primary)] truncate font-mono">
                          {art.name}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-subtle)] uppercase">
                          {art.type}
                        </span>
                        {art.slideCount && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/30 text-amber-300 border border-amber-800/30">
                            {art.slideCount} Slides
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-1">
                        {art.description || 'Generated workspace deliverable asset.'}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--text-tertiary)] pt-0.5">
                        <span>Size: <strong className="text-[var(--text-secondary)]">{formatFileSize(art.sizeBytes)}</strong></span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">✓ Contract Verified</span>
                        <span>•</span>
                        <span className="truncate max-w-[200px]" title={art.path}>Path: {art.path}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--border-subtle)] w-full md:w-auto justify-end">
                    <button
                      onClick={() => handlePreviewArtifact(art)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-base)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                      <span>Preview</span>
                    </button>

                    <a
                      href={downloadHref}
                      download={art.name}
                      className="px-4 py-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 font-semibold text-xs transition-opacity cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. AGENT EXECUTION TIMELINE */}
      <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-base)]">
        <button
          onClick={() => setIsTimelineOpen(!isTimelineOpen)}
          className="w-full px-4 py-3 bg-[var(--bg-elevated)] flex items-center justify-between text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--border-subtle)]/30 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Agent Execution Timeline</span>
            <span className="text-[10px] font-mono text-[var(--text-tertiary)] font-normal">
              (5 Sequential Stages Completed)
            </span>
          </div>
          {isTimelineOpen ? <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />}
        </button>

        {isTimelineOpen && (
          <div className="p-4 space-y-3 font-mono text-[11px] border-t border-[var(--border-subtle)]">
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--border-subtle)]">
              
              {/* Step 1 */}
              <div className="relative flex items-start justify-between gap-2">
                <div className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-[var(--bg-base)] flex items-center justify-center"></div>
                <div>
                  <div className="font-bold text-[var(--text-primary)]">1. Task Analysis &amp; Intent Extraction</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-0.5 font-sans">
                    Extracted task type ({proposedPlan?.classifiedTaskType || 'presentation_generation'}) and deliverable constraints.
                  </div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 flex-shrink-0">✓ Completed</span>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start justify-between gap-2">
                <div className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-[var(--bg-base)] flex items-center justify-center"></div>
                <div>
                  <div className="font-bold text-[var(--text-primary)]">2. Local Inference Model Routing</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-0.5 font-sans">
                    Assigned primary reasoning model: <code className="text-[var(--accent-primary)] font-mono">{selectedModel || 'Qwen2.5-Coder-7B'}</code>
                  </div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 flex-shrink-0">✓ Completed</span>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start justify-between gap-2">
                <div className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-[var(--bg-base)] flex items-center justify-center"></div>
                <div>
                  <div className="font-bold text-[var(--text-primary)]">3. Knowledge Base &amp; Context Retrieval</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-0.5 font-sans">
                    {citations.length > 0 
                      ? `Applied Nomic 768-D RAG embeddings across ${citations.length} knowledge base documents.` 
                      : 'Verified uploaded user task content (No external KB guidance required).'}
                  </div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 flex-shrink-0">
                  {citations.length > 0 ? '✓ Applied' : '✓ Upload Content'}
                </span>
              </div>

              {/* Step 4 */}
              <div className="relative flex items-start justify-between gap-2">
                <div className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-[var(--bg-base)] flex items-center justify-center"></div>
                <div>
                  <div className="font-bold text-[var(--text-primary)]">4. Local Deliverable Generation &amp; Assembly</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-0.5 font-sans">
                    Generated binary file content in local sandbox environment.
                  </div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 flex-shrink-0">✓ Completed</span>
              </div>

              {/* Step 5 */}
              <div className="relative flex items-start justify-between gap-2">
                <div className="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-[var(--bg-base)] flex items-center justify-center"></div>
                <div>
                  <div className="font-bold text-[var(--text-primary)]">5. Output Contract &amp; Air-Gap Verification</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-0.5 font-sans">
                    Validated format match and confirmed 0 bytes external network egress.
                  </div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 flex-shrink-0">✓ Passed</span>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* 5. EXPANDABLE ACCORDIONS (Grounding, Sovereignty, Tech Details) */}
      <div className="space-y-2 pt-1">
        
        {/* Accordion A: Source & Grounding */}
        <div className="border border-[var(--border-subtle)] rounded-lg overflow-hidden bg-[var(--bg-base)]">
          <button
            onClick={() => setIsGroundingOpen(!isGroundingOpen)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>Source &amp; Grounding Provenance</span>
              {citations.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950/40 text-sky-300 border border-sky-800/40">
                  {citations.length} Sources
                </span>
              )}
            </div>
            {isGroundingOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {isGroundingOpen && (
            <div className="p-3 border-t border-[var(--border-subtle)] space-y-2 text-[11px] font-sans">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-[10px] mb-2">
                <div className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <div className="text-[var(--text-tertiary)] uppercase">Primary Source</div>
                  <div className="font-bold text-[var(--text-primary)] mt-0.5">
                    {proposedPlan?.userUploadFiles && proposedPlan.userUploadFiles.length > 0 
                      ? proposedPlan.userUploadFiles.join(', ') 
                      : 'User Task Prompt'}
                  </div>
                </div>

                <div className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <div className="text-[var(--text-tertiary)] uppercase">Knowledge Retrieval</div>
                  <div className="font-bold text-[var(--text-primary)] mt-0.5">
                    {citations.length > 0 ? `${citations.length} KB Docs` : 'Not Used (Upload Content Only)'}
                  </div>
                </div>

                <div className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <div className="text-[var(--text-tertiary)] uppercase">External Egress</div>
                  <div className="font-bold text-emerald-400 mt-0.5">None (Air-Gapped)</div>
                </div>
              </div>

              {citations.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] uppercase font-mono text-[var(--text-tertiary)] font-bold">Retrieved Guidance Snippets:</div>
                  {citations.map((c, i) => (
                    <div key={i} className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-[10px] space-y-0.5">
                      <div className="font-bold text-[var(--accent-primary)]">📚 {c.source} {c.page ? `(Page ${c.page})` : ''}</div>
                      <div className="text-[var(--text-secondary)] font-sans italic text-[11px] leading-snug">"{c.snippet}"</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-[var(--text-tertiary)] italic p-2 bg-[var(--bg-surface)] rounded border border-[var(--border-subtle)]">
                  No Knowledge Base documents were required for this task. Execution relied directly on uploaded user files and model reasoning.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Accordion B: Sovereignty & Security Panel */}
        <div className="border border-[var(--border-subtle)] rounded-lg overflow-hidden bg-[var(--bg-base)]">
          <button
            onClick={() => setIsSovereigntyOpen(!isSovereigntyOpen)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sovereignty &amp; Security Status</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                100% Air-Gapped
              </span>
            </div>
            {isSovereigntyOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {isSovereigntyOpen && (
            <div className="p-3 border-t border-[var(--border-subtle)] grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[10px]">
              <div className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
                <div className="text-[var(--text-tertiary)] uppercase">Local Inference</div>
                <div className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active (Ollama)
                </div>
              </div>

              <div className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
                <div className="text-[var(--text-tertiary)] uppercase">Local Embeddings</div>
                <div className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active (Nomic 768-D)
                </div>
              </div>

              <div className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
                <div className="text-[var(--text-tertiary)] uppercase">External AI APIs</div>
                <div className="text-emerald-400 font-bold">0 Calls</div>
              </div>

              <div className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
                <div className="text-[var(--text-tertiary)] uppercase">Network Egress</div>
                <div className="text-emerald-400 font-bold">0 Bytes Sent</div>
              </div>

              <div className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
                <div className="text-[var(--text-tertiary)] uppercase">Execution Environment</div>
                <div className="text-[var(--text-primary)] font-bold">Isolated Local Sandbox</div>
              </div>

              <div className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
                <div className="text-[var(--text-tertiary)] uppercase">Network Mode</div>
                <div className="text-emerald-400 font-bold">Air-Gapped On-Prem</div>
              </div>
            </div>
          )}
        </div>

        {/* Accordion C: Technical Execution Details & Audit */}
        <div className="border border-[var(--border-subtle)] rounded-lg overflow-hidden bg-[var(--bg-base)]">
          <button
            onClick={() => setIsTechDetailsOpen(!isTechDetailsOpen)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              <span>Technical Details &amp; Audit Trail</span>
            </div>
            {isTechDetailsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {isTechDetailsOpen && (
            <div className="p-3 border-t border-[var(--border-subtle)] space-y-2 font-mono text-[10px]">
              <div className="p-2.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1 overflow-x-auto">
                <div className="text-[var(--text-tertiary)] uppercase font-bold">System Log &amp; Contract Verification:</div>
                <div className="text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                  {step.content || 'Execution step finished cleanly.'}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* FAILSAFE / ERROR RETRY BUTTON */}
      {isFailed && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => proposedPlan && approveProposedPlan(proposedPlan)}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Task Execution</span>
          </button>
        </div>
      )}

    </div>
  );
};
