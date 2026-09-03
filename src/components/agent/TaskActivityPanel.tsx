import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  Cpu, 
  FileText, 
  AlertTriangle, 
  ChevronDown, 
  ChevronRight,
  ShieldCheck,
  Check,
  Circle
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

export const TaskActivityPanel: React.FC = () => {
  const { activeTask, isTaskPanelOpen, setTaskPanelOpen } = useWorkbenchStore();
  const [expandedStepId, setExpandedStepId] = useState<number | null>(null);

  if (!isTaskPanelOpen) return null;

  return (
    <aside className="w-80 bg-[#252526] border-l border-[#3C3C3C] flex flex-col font-sans select-none flex-shrink-0 z-20 text-xs shadow-xl">
      {/* Panel Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[#3C3C3C] text-[#858585] font-mono text-[11px] uppercase font-bold tracking-wider">
        <span className="flex items-center gap-2 text-white">
          <Terminal className="w-3.5 h-3.5 text-[#007ACC]" />
          TASK ACTIVITY &amp; EVIDENCE
        </span>
        <button
          onClick={() => setTaskPanelOpen(false)}
          className="p-1 hover:bg-[#2A2D2E] rounded text-[#858585] hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto font-sans">
        {activeTask ? (
          <>
            {/* Auto Model Selected Card */}
            <div className="bg-[#252526] border border-[#3C3C3C] rounded-lg p-3 space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between text-[#858585]">
                <span className="text-[10px] font-bold">MODEL AUTO-SELECTED:</span>
                <span className="text-[#4EC9B0] font-bold">LOCAL</span>
              </div>
              <div className="text-sm font-bold text-white">
                {activeTask.selected_model_id}
              </div>
              <p className="text-xs text-[#858585] font-sans leading-relaxed">
                {activeTask.routing_reason}
              </p>
            </div>

            {/* Stepper Progress */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#858585] font-bold block px-1">
                Autonomous Execution Plan ({activeTask.plan.length} Steps):
              </span>

              <div className="space-y-1.5 font-mono text-xs">
                {activeTask.plan.map((step) => {
                  const isCompleted = step.status === 'completed';
                  const isRunning = step.status === 'running';
                  const isExpanded = expandedStepId === step.step_id;

                  return (
                    <div
                      key={step.step_id}
                      className={`rounded-lg border transition-all overflow-hidden ${
                        isRunning
                          ? 'bg-[#252526] border-[#007ACC]'
                          : isCompleted
                          ? 'bg-[#252526] border-[#3C3C3C]'
                          : 'bg-[#1E1E1E] border-[#3C3C3C] opacity-60'
                      }`}
                    >
                      <button
                        onClick={() => setExpandedStepId(isExpanded ? null : step.step_id)}
                        className="w-full p-2.5 flex items-start justify-between text-left cursor-pointer hover:bg-[#2A2D2E] transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          {isCompleted ? (
                            <Check className="w-3.5 h-3.5 text-[#4EC9B0] flex-shrink-0 mt-0.5" />
                          ) : isRunning ? (
                            <Clock className="w-3.5 h-3.5 text-[#007ACC] animate-spin flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-[#666666] flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="text-xs font-semibold text-white">
                              {step.title}
                            </div>
                            <div className="text-[11px] text-[#858585] font-sans mt-0.5 leading-snug">
                              {step.description}
                            </div>
                          </div>
                        </div>

                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />}
                      </button>

                      {/* Expanded Step Telemetry */}
                      {isExpanded && (
                        <div className="p-2.5 bg-[#1E1E1E] border-t border-[#3C3C3C] text-[11px] text-[#858585] space-y-1.5">
                          {step.tool_name && (
                            <div>
                              <span className="text-[#666666]">TOOL INVOKED:</span>{' '}
                              <span className="text-[#007ACC] font-bold">{step.tool_name}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-[#666666]">EXECUTION DURATION:</span>{' '}
                            <span className="text-white">{step.duration_ms} ms</span>
                          </div>
                          <div>
                            <span className="text-[#666666]">STATUS:</span>{' '}
                            <span className="text-[#4EC9B0] font-bold uppercase">{step.status}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tool Logs Summary */}
            <div className="space-y-1.5 pt-2 border-t border-[#3C3C3C]">
              <span className="text-[10px] font-mono uppercase text-[#858585] font-bold block px-1">
                Isolated Tool Calls ({activeTask.tool_calls.length}):
              </span>

              <div className="space-y-1 font-mono text-[11px]">
                {activeTask.tool_calls.map((call) => (
                  <div key={call.call_id} className="p-2 rounded bg-[#252526] border border-[#3C3C3C] space-y-1">
                    <div className="flex items-center justify-between text-[#007ACC] font-bold">
                      <span>&gt; {call.tool_name}</span>
                      <span className="text-[#858585] text-[10px]">{call.execution_time_ms}ms</span>
                    </div>
                    {call.output && (
                      <div className="text-[#4EC9B0] bg-[#1E1E1E] p-1.5 rounded text-[10px] overflow-x-auto">
                        <pre>{typeof call.output === 'string' ? call.output : JSON.stringify(call.output, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-[#666666] space-y-2">
            <Terminal className="w-8 h-8 mx-auto text-[#3C3C3C]" />
            <p>No active background task.</p>
            <p className="text-[11px]">Tasks will log their step-by-step telemetry here automatically.</p>
          </div>
        )}
      </div>
    </aside>
  );
};
