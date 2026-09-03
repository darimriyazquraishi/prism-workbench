import React from 'react';
import { CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';
import type { AgentStep } from '../../types';

interface TaskGraphProps {
  steps: AgentStep[];
  currentStepIndex: number;
}

export const TaskGraph: React.FC<TaskGraphProps> = ({ steps, currentStepIndex }) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
        Plan graph will generate when an industrial task is submitted.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
        <span>Agentic Task Execution Graph</span>
        <span className="text-[11px] font-mono text-sky-400">
          Step {Math.min(currentStepIndex + 1, steps.length)} of {steps.length}
        </span>
      </div>

      <div className="space-y-2">
        {steps.map((step) => {
          const isCompleted = step.status === 'completed';
          const isRunning = step.status === 'running';
          const isFailed = step.status === 'failed';

          return (
            <div
              key={step.step_id}
              className={`p-3 rounded-lg border transition-all ${
                isRunning
                  ? 'bg-sky-950/30 border-sky-500/50 shadow-sm shadow-sky-900/20'
                  : isCompleted
                  ? 'bg-zinc-900/40 border-zinc-800 text-zinc-300'
                  : isFailed
                  ? 'bg-rose-950/20 border-rose-800 text-rose-300'
                  : 'bg-zinc-950/40 border-zinc-850 text-zinc-500'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : isRunning ? (
                    <Clock className="w-4 h-4 text-sky-400 animate-spin flex-shrink-0" />
                  ) : isFailed ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-medium text-zinc-200">
                      {step.step_id}. {step.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{step.description}</div>
                  </div>
                </div>

                {step.tool_name && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-sky-300 border border-zinc-700/50 flex-shrink-0">
                    {step.tool_name}
                  </span>
                )}
              </div>

              {step.duration_ms > 0 && (
                <div className="text-[10px] font-mono text-zinc-500 mt-2 text-right">
                  {step.duration_ms.toFixed(0)} ms
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
