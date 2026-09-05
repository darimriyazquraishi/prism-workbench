import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  ChevronDown, 
  ChevronRight,
  Check,
  Circle,
  Cpu,
  List,
  Activity
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

export const TaskActivityPanel: React.FC = () => {
  const { activeTask, isTaskPanelOpen, setTaskPanelOpen } = useWorkbenchStore();
  const [expandedStepId, setExpandedStepId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'model' | 'output' | 'audit'>('output');
  const [isModelDetailsExpanded, setIsModelDetailsExpanded] = useState(false);

  if (!isTaskPanelOpen) return null;

  return (
    <aside className="w-[320px] bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] flex flex-col font-sans select-none flex-shrink-0 z-20 shadow-[-4px_0_24px_rgba(0,0,0,0.1)] transition-transform duration-300">
      {/* Panel Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <span className="font-semibold text-sm text-[var(--text-primary)]">
          Task Details
        </span>
        <button
          onClick={() => setTaskPanelOpen(false)}
          className="p-1.5 hover:bg-[var(--bg-primary)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-subtle)] px-2">
        <button
          onClick={() => setActiveTab('model')}
          className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'model' 
              ? 'border-[var(--accent-fuchsia)] text-[var(--accent-fuchsia)]' 
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Model
        </button>
        <button
          onClick={() => setActiveTab('output')}
          className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'output' 
              ? 'border-[var(--accent-fuchsia)] text-[var(--accent-fuchsia)]' 
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Output
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'audit' 
              ? 'border-[var(--accent-fuchsia)] text-[var(--accent-fuchsia)]' 
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Audit
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto font-sans">
        {activeTask ? (
          <>
            {activeTab === 'model' && (
              <div className="space-y-4">
                <button 
                  onClick={() => setIsModelDetailsExpanded(!isModelDetailsExpanded)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl p-3 flex flex-col gap-2 hover:border-[var(--accent-fuchsia-muted)] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--status-healthy)] shadow-[0_0_8px_var(--status-healthy)]"></span>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{activeTask.selected_model_id}</span>
                    </div>
                    {isModelDetailsExpanded ? <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />}
                  </div>
                  
                  <div className="text-xs text-[var(--text-secondary)] line-clamp-1">
                    {activeTask.routing_reason}
                  </div>

                  {isModelDetailsExpanded && (
                    <div className="pt-3 mt-1 border-t border-[var(--border-subtle)] space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                          <span>VRAM Allocation</span>
                          <span>14.2 GB / 24 GB</span>
                        </div>
                        <div className="w-full h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--accent-fuchsia-muted)]" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        Local isolation enforced. No external telemetry.
                      </div>
                    </div>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'output' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Real-Time Logs
                </div>
                <div className="space-y-2">
                  {activeTask.tool_calls.map((call) => (
                    <div key={call.call_id} className="p-3 rounded-xl bg-[var(--bg-terminal)] border border-[var(--border-subtle)] space-y-2 font-mono">
                      <div className="flex items-center justify-between text-[var(--text-primary)] font-medium text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="text-[var(--accent-fuchsia)]">$</span> 
                          {call.tool_name}
                        </span>
                        <span className="text-[var(--text-secondary)] text-[10px]">{call.execution_time_ms}ms</span>
                      </div>
                      {call.output && (
                        <div className="text-[var(--status-healthy)] text-[11px] overflow-x-auto opacity-90">
                          <pre className="whitespace-pre-wrap">{typeof call.output === 'string' ? call.output : JSON.stringify(call.output, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                  {activeTask.tool_calls.length === 0 && (
                    <div className="text-center text-xs text-[var(--text-secondary)] py-4">
                      No tool executions logged yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Execution Trace
                </div>
                <div className="space-y-2">
                  {activeTask.plan.map((step) => {
                    const isCompleted = step.status === 'completed';
                    const isRunning = step.status === 'running';

                    return (
                      <div
                        key={step.step_id}
                        className={`rounded-xl border p-3 flex gap-3 transition-colors ${
                          isRunning
                            ? 'bg-[var(--bg-primary)] border-[var(--accent-fuchsia-muted)]'
                            : isCompleted
                            ? 'bg-[var(--bg-primary)] border-[var(--border-subtle)]'
                            : 'bg-transparent border-dashed border-[var(--border-subtle)] opacity-50'
                        }`}
                      >
                        <div className="pt-0.5">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-[var(--status-healthy)]" />
                          ) : isRunning ? (
                            <div className="w-4 h-4 border-2 border-[var(--border-subtle)] border-t-[var(--accent-fuchsia)] rounded-full animate-spin"></div>
                          ) : (
                            <Circle className="w-4 h-4 text-[var(--text-secondary)]" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className={`text-xs font-semibold ${isCompleted ? 'text-[var(--text-primary)]' : isRunning ? 'text-[var(--accent-fuchsia)]' : 'text-[var(--text-secondary)]'}`}>
                            {step.title}
                          </div>
                          <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                            {step.description}
                          </div>
                          {isCompleted && (
                            <div className="text-[10px] text-[var(--text-secondary)] font-mono mt-2">
                              {step.duration_ms}ms • Validated
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-3">
            <List className="w-8 h-8 opacity-20" />
            <p className="text-sm">No active task selected</p>
          </div>
        )}
      </div>
    </aside>
  );
};
