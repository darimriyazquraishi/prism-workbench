import React from 'react';
import { ToolCallRecord } from '../../types';
import { Terminal, Check, AlertCircle } from 'lucide-react';

interface ExecutionTimelineProps {
  toolCalls: ToolCallRecord[];
}

export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({ toolCalls }) => {
  if (!toolCalls || toolCalls.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-zinc-500 border border-zinc-800/60 rounded-lg">
        Tool execution logs will appear here during live agent runs.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
        <Terminal className="w-3.5 h-3.5 text-sky-400" />
        <span>Live Tool Call & Sandbox Log</span>
      </div>

      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
        {toolCalls.map((call) => (
          <div
            key={call.call_id}
            className="p-3 bg-zinc-950/80 border border-zinc-800/90 rounded-md font-mono text-[11px] space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {call.status === 'success' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : call.status === 'error' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>
                )}
                <span className="font-bold text-sky-300">{call.tool_name}</span>
                <span className="text-zinc-500 text-[10px]">({call.call_id})</span>
              </div>
              <span className="text-zinc-500 text-[10px]">{call.execution_time_ms} ms</span>
            </div>

            {/* Tool Arguments */}
            <div className="bg-zinc-900/90 p-2 rounded text-zinc-400 overflow-x-auto text-[10px]">
              <span className="text-zinc-500 font-semibold block mb-1">INPUT:</span>
              <pre>{JSON.stringify(call.arguments, null, 2)}</pre>
            </div>

            {/* Tool Output Summary */}
            {call.output && (
              <div className="bg-zinc-900/90 p-2 rounded text-emerald-400/90 overflow-x-auto text-[10px]">
                <span className="text-zinc-500 font-semibold block mb-1">OUTPUT:</span>
                <pre>{typeof call.output === 'string' ? call.output : JSON.stringify(call.output, null, 2)}</pre>
              </div>
            )}

            {call.error_message && (
              <div className="bg-rose-950/30 border border-rose-900/50 p-2 rounded text-rose-300 text-[10px]">
                {call.error_message}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
