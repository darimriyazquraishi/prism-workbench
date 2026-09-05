import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  ChevronDown, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  XCircle, 
  Search, 
  FileCode, 
  Layers, 
  ArrowRight,
  Database
} from 'lucide-react';
import { useTelemetryStore } from '../../store/telemetryStore';

export const LivePipelineTelemetryPanel: React.FC = () => {
  const currentExecution = useTelemetryStore((state) => state.currentExecution);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  // If no execution exists yet
  if (!currentExecution) {
    return (
      <div className="h-full flex flex-col p-4 bg-[var(--bg-surface)] text-[var(--text-primary)] font-sans text-xs select-none">
        <div className="border-b border-[var(--border-subtle)] pb-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider">
              System Telemetry &amp; Routing
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)]">
            <span>Network:</span>
            <span className="text-[var(--accent-success)] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> No egress (Local Only)
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2 border border-dashed border-[var(--border-subtle)] rounded-lg bg-[var(--bg-base)]">
          <Cpu className="w-6 h-6 text-[var(--text-tertiary)] animate-pulse" />
          <div className="font-mono font-bold text-[11px] text-[var(--text-secondary)]">
            Pipeline Idle
          </div>
          <div className="text-[10px] text-[var(--text-tertiary)] max-w-[200px] leading-relaxed">
            Submit a prompt in the chat to monitor live model routing, RAG retrieval, and answer validation.
          </div>
        </div>
      </div>
    );
  }

  const {
    requestId,
    prompt,
    status,
    currentStage,
    stages,
    activeModel,
    modelsUsed,
    retrieval,
    tools,
    validation,
    routing,
    startedAt,
    completedAt,
    elapsedTimeMs,
    error,
    outputDeliverable
  } = currentExecution;

  // Status Badge Rendering
  const getStatusBadge = () => {
    switch (status) {
      case 'running':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            RUNNING
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            COMPLETED
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-400" />
            FAILED
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
            IDLE
          </span>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-surface)] text-[var(--text-primary)] font-sans text-xs select-none overflow-y-auto p-4 space-y-4">
      {/* 1. TOP HEADER & NETWORK INDICATOR */}
      <div className="border-b border-[var(--border-subtle)] pb-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>System Telemetry &amp; Routing</span>
          </span>
          {getStatusBadge()}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-base)] p-2 rounded border border-[var(--border-subtle)]">
          <span>Network Egress:</span>
          <span className="text-[var(--accent-success)] font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> No egress (Local Only)
          </span>
        </div>

        <div className="flex items-center justify-between text-[9px] font-mono text-[var(--text-tertiary)] px-1">
          <span>Req ID: <code className="text-[var(--accent-primary)] font-bold">{requestId}</code></span>
          <span>Started: {startedAt}</span>
        </div>
      </div>

      {/* 2. LIVE PIPELINE STAGES PROGRESS */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span>Execution Pipeline Stages</span>
        </div>

        <div className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-2.5 space-y-2 font-mono text-[11px]">
          {/* Stage 1: Prompt Received */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[var(--text-primary)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Prompt received</span>
            </span>
            <span className="text-[9px] text-[var(--text-tertiary)] truncate max-w-[100px]">
              "{prompt.slice(0, 15)}..."
            </span>
          </div>

          {/* Stage 2: Context Retrieval / RAG */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[var(--text-primary)]">
              {retrieval.status === 'completed' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              ) : retrieval.status === 'running' ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin flex-shrink-0" />
              ) : retrieval.status === 'failed' ? (
                <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-slate-600 flex-shrink-0" />
              )}
              <span>Context retrieval</span>
            </span>
            <span className="text-[9px] text-[var(--text-secondary)]">
              {retrieval.status === 'completed'
                ? `${retrieval.chunksRetrieved} chunks`
                : retrieval.status === 'running'
                ? 'Retrieving...'
                : retrieval.status === 'failed'
                ? 'Failed'
                : 'Not required'}
            </span>
          </div>

          {/* Stage 3: Active Model Generation */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[var(--text-primary)]">
              {status === 'completed' || status === 'failed' || validation ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              ) : status === 'running' ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin flex-shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-slate-600 flex-shrink-0" />
              )}
              <span>Response generation</span>
            </span>
            <span className="text-[9px] font-bold text-[var(--accent-primary)]">
              {activeModel || 'qwen3:8b'}
            </span>
          </div>

          {/* Stage 4: Answer Validation */}
          {validation && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[var(--text-primary)]">
                {validation.status === 'passed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                ) : validation.status === 'failed' ? (
                  <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin flex-shrink-0" />
                )}
                <span>Answer validation</span>
              </span>
              <span className={`text-[9px] font-bold ${
                validation.status === 'passed' ? 'text-emerald-400' :
                validation.status === 'failed' ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {validation.confidence !== null ? `${(validation.confidence * 100).toFixed(1)}%` : validation.status.toUpperCase()}
              </span>
            </div>
          )}

          {/* Stage 5: Routing Decision */}
          {routing && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[var(--text-primary)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Routing decision</span>
              </span>
              <span className="text-[9px] font-bold text-[var(--accent-primary)] truncate max-w-[140px]">
                {routing.decision === 'return_initial' ? 'Return Initial' :
                 routing.decision === 'reevaluate' ? 'Re-evaluating' :
                 routing.decision === 'return_after_reevaluation' ? 'Return (Validated)' :
                 routing.decision === 'return_low_confidence' ? 'Return w/ Disclaimer' :
                 `→ ${routing.targetModel || 'General Reasoning'}`}
              </span>
            </div>
          )}

          {/* Stage 6: Final Response / Deliverable */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[var(--text-primary)]">
              {status === 'completed' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              ) : status === 'failed' ? (
                <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-slate-600 flex-shrink-0" />
              )}
              <span>Final response</span>
            </span>
            <span className="text-[9px] text-[var(--text-secondary)]">
              {status === 'completed' ? '✓ Ready' : status === 'failed' ? '✕ Halted' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. MODEL ROUTER & MODEL CHAIN */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-3 space-y-2 font-mono text-[10px]">
        <div className="flex items-center justify-between text-[var(--text-secondary)]">
          <span>Active Model:</span>
          <span className="text-[var(--text-primary)] font-bold flex items-center gap-1">
            <Cpu className="w-3 h-3 text-[var(--accent-primary)]" />
            {activeModel}
          </span>
        </div>

        {modelsUsed.length > 1 && (
          <div className="space-y-1 pt-1 border-t border-[var(--border-subtle)]">
            <div className="text-[var(--text-secondary)] text-[9px]">Model Chain Sequence:</div>
            <div className="flex flex-wrap items-center gap-1 text-[9px]">
              {modelsUsed.map((m, idx) => (
                <React.Fragment key={idx}>
                  <span className="px-1.5 py-0.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-[var(--text-primary)] font-bold">
                    {m}
                  </span>
                  {idx < modelsUsed.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-[var(--accent-primary)]" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. VALIDATION & ROUTING CARD (Max 2 Evaluations Display) */}
      {validation && (
        <div className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-3 space-y-2 font-mono text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)] uppercase font-bold flex items-center gap-1">
              <span>Answer Validator</span>
              <span className="text-[9px] font-normal text-[var(--text-tertiary)]">
                ({validation.evaluationCount || 1}/{validation.maxEvaluations || 2})
              </span>
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              validation.status === 'passed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
              validation.status === 'low_confidence' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
              validation.status === 'reevaluating' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
              validation.status === 'failed' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
              'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {validation.status === 'low_confidence' ? 'LOW CONFIDENCE' : validation.status.toUpperCase()}
            </span>
          </div>

          <div className="space-y-1 pt-1 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span>Initial Evaluation Confidence:</span>
              <span className="font-bold text-[var(--text-primary)]">
                {validation.initialConfidence !== undefined && validation.initialConfidence !== null
                  ? (validation.initialConfidence * 100).toFixed(1) + '%'
                  : validation.confidence !== null ? (validation.confidence * 100).toFixed(1) + '%' : 'N/A'}
              </span>
            </div>

            {validation.reevaluationConfidence !== undefined && validation.reevaluationConfidence !== null && (
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Re-evaluation Confidence:</span>
                <span className="font-bold text-[var(--accent-primary)]">
                  {(validation.reevaluationConfidence * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {routing && (
            <div className="pt-1.5 border-t border-[var(--border-subtle)] space-y-1">
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Routing Action:</span>
                <span className="font-bold text-[var(--accent-primary)] text-[9px]">
                  {routing.decision === 'return_initial' ? 'Return Initial Response' :
                   routing.decision === 'reevaluate' ? 'Re-evaluating Answer' :
                   routing.decision === 'return_after_reevaluation' ? 'Return (Validated after Re-eval)' :
                   routing.decision === 'return_low_confidence' ? 'Return w/ Low-Confidence Disclaimer' :
                   'Route to Reasoning Model'}
                </span>
              </div>
              {routing.reason && (
                <div className="text-[9px] text-[var(--text-tertiary)] leading-snug italic">
                  Reason: {routing.reason}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. TOOL EXECUTION STREAM */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Tool Execution</span>
          </span>
          <span className="text-[9px] text-[var(--text-tertiary)] font-normal">
            {tools.length} executed
          </span>
        </div>

        <div className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-2.5 space-y-1.5 font-mono text-[10px] max-h-36 overflow-y-auto">
          {tools.length === 0 ? (
            <div className="text-[10px] text-[var(--text-tertiary)] italic text-center py-2">
              No external tools invoked for this request
            </div>
          ) : (
            tools.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-1.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 min-w-0">
                  {t.status === 'completed' ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  ) : t.status === 'running' ? (
                    <span className="w-3 h-3 rounded-full border-2 border-amber-400 border-t-transparent animate-spin flex-shrink-0" />
                  ) : (
                    <XCircle className="w-3 h-3 text-rose-400 flex-shrink-0" />
                  )}
                  <span className="font-bold text-[var(--text-primary)] truncate">{t.name}</span>
                </div>
                <span className="text-[9px] text-[var(--text-secondary)] flex-shrink-0">
                  {t.durationMs ? `${t.durationMs}ms` : t.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 6. EXPANDABLE TECHNICAL DETAILS */}
      <details 
        className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg overflow-hidden group flex-shrink-0"
        open={detailsExpanded}
        onToggle={(e) => setDetailsExpanded((e.target as HTMLDetailsElement).open)}
      >
        <summary className="px-3 py-2 text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-elevated)] flex items-center justify-between transition-colors list-none">
          <span>Show technical details</span>
          <ChevronDown className="w-3.5 h-3.5 group-open:rotate-180 transition-transform" />
        </summary>

        <div className="p-3 font-mono text-[10px] text-[var(--text-primary)] space-y-2 border-t border-[var(--border-subtle)] max-h-56 overflow-y-auto">
          <div><span className="text-[var(--text-secondary)]">Request ID:</span> {requestId}</div>
          <div><span className="text-[var(--text-secondary)]">Prompt:</span> "{prompt}"</div>
          <div><span className="text-[var(--text-secondary)]">Status:</span> <span className="font-bold uppercase">{status}</span></div>
          <div><span className="text-[var(--text-secondary)]">Initial Model:</span> {routing?.initialModel || activeModel}</div>
          <div><span className="text-[var(--text-secondary)]">Final Model:</span> {activeModel}</div>
          <div><span className="text-[var(--text-secondary)]">Models Used:</span> {modelsUsed.join(', ')}</div>
          <div><span className="text-[var(--text-secondary)]">RAG Chunks:</span> {retrieval.chunksRetrieved} retrieved</div>

          {validation && (
            <div className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
              <div><span className="text-[var(--text-secondary)]">Validator Confidence:</span> {validation.confidence !== null ? `${(validation.confidence * 100).toFixed(1)}%` : 'N/A'}</div>
              <div><span className="text-[var(--text-secondary)]">Validator Result:</span> {validation.status.toUpperCase()}</div>
              {validation.ungroundedClaims && validation.ungroundedClaims.length > 0 && (
                <div className="text-rose-400">
                  <span>Ungrounded Claims:</span>
                  <ul className="list-disc list-inside pl-1 text-[9px]">
                    {validation.ungroundedClaims.map((c, i) => (
                      <li key={i} className="truncate">{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {outputDeliverable && (
            <div className="p-2 rounded bg-emerald-950/30 border border-emerald-800/40 text-emerald-300">
              <div className="font-bold">Generated Output Deliverable:</div>
              <div>File: {outputDeliverable.name} ({outputDeliverable.sizeKb} KB)</div>
              <div>Type: {outputDeliverable.type.toUpperCase()}</div>
            </div>
          )}

          {error && (
            <div className="p-2 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 font-bold">
              Execution Error: {error}
            </div>
          )}

          {completedAt && (
            <div className="text-[9px] text-[var(--text-tertiary)] pt-1">
              Completed at: {completedAt}
            </div>
          )}
        </div>
      </details>
    </div>
  );
};
