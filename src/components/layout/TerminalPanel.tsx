import React, { useRef, useEffect } from 'react';
import { Terminal, Activity, GitMerge, X, ChevronDown, Circle, CheckCircle2, Clock, Loader } from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';
import type { TerminalLogEntry } from '../../store/useWorkbenchStore';

const LOG_COLORS: Record<TerminalLogEntry['level'], { text: string; prefix: string }> = {
  info:    { text: '#858585', prefix: '  ' },
  success: { text: '#4EC9B0', prefix: '✓ ' },
  warn:    { text: '#CCA700', prefix: '⚠ ' },
  error:   { text: '#F14C4C', prefix: '✗ ' },
  tool:    { text: '#007ACC', prefix: '→ ' },
  model:   { text: '#BC8CFF', prefix: '⬡ ' },
};

export const TerminalPanel: React.FC = () => {
  const {
    isBottomPanelOpen,
    setBottomPanelOpen,
    activeBottomTab,
    setActiveBottomTab,
    terminalLogs,
    clearTerminalLogs,
    activeTask,
    demoRunning,
    demoStepIndex,
  } = useWorkbenchStore();

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  if (!isBottomPanelOpen) {
    return (
      <div
        className="h-6 bg-[#252526] border-t border-[#3C3C3C] flex items-center px-3 gap-4 select-none cursor-pointer hover:bg-[#252526] transition-colors"
        onClick={() => setBottomPanelOpen(true)}
      >
        <button
          className="flex items-center gap-1.5 text-[#858585] hover:text-white text-[11px] font-mono transition-colors"
        >
          <Terminal className="w-3 h-3 text-[#007ACC]" />
          <span>TERMINAL</span>
        </button>
        <button
          className="flex items-center gap-1.5 text-[#858585] hover:text-white text-[11px] font-mono transition-colors"
        >
          <Activity className="w-3 h-3 text-[#4EC9B0]" />
          <span>ACTIVITY</span>
        </button>
        {terminalLogs.length > 0 && (
          <span className="text-[10px] font-mono text-[#4EC9B0] ml-auto">
            ● {terminalLogs.length} logs
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="h-52 bg-[#1E1E1E] border-t border-[#3C3C3C] flex flex-col flex-shrink-0 font-mono text-xs select-none">
      {/* Tab strip */}
      <div className="h-8 bg-[#252526] border-b border-[#3C3C3C] flex items-center px-2 gap-0.5 flex-shrink-0">
        {[
          { id: 'terminal', label: 'TERMINAL', Icon: Terminal, color: '#007ACC' },
          { id: 'activity', label: 'ACTIVITY', Icon: Activity, color: '#4EC9B0' },
          { id: 'workflow', label: 'WORKFLOW', Icon: GitMerge, color: '#BC8CFF' },
        ].map(({ id, label, Icon, color }) => (
          <button
            key={id}
            onClick={() => setActiveBottomTab(id as any)}
            className={`h-full px-3 flex items-center gap-1.5 text-[11px] border-b-2 transition-all cursor-pointer ${
              activeBottomTab === id
                ? 'border-[#007ACC] text-white'
                : 'border-transparent text-[#858585] hover:text-[#CCCCCC]'
            }`}
          >
            <Icon className="w-3 h-3" style={{ color: activeBottomTab === id ? color : undefined }} />
            <span>{label}</span>
            {id === 'terminal' && terminalLogs.length > 0 && (
              <span
                className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ backgroundColor: '#4EC9B020', color: '#4EC9B0' }}
              >
                {terminalLogs.length}
              </span>
            )}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1 pr-1">
          {activeBottomTab === 'terminal' && terminalLogs.length > 0 && (
            <button
              onClick={clearTerminalLogs}
              className="px-2 py-0.5 text-[10px] text-[#858585] hover:text-white transition-colors cursor-pointer"
              title="Clear logs"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setBottomPanelOpen(false)}
            className="p-1 text-[#858585] hover:text-white hover:bg-[#3C3C3C] rounded transition-colors cursor-pointer"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {/* Terminal Tab */}
        {activeBottomTab === 'terminal' && (
          <div className="h-full overflow-y-auto p-3 space-y-0.5 bg-[#1E1E1E]">
            {terminalLogs.length === 0 ? (
              <div className="text-[#666666] text-[11px] pt-2">
                <span className="text-[#007ACC]">$</span> Awaiting agent task execution...
              </div>
            ) : (
              terminalLogs.map((log) => {
                const { text: color, prefix } = LOG_COLORS[log.level];
                return (
                  <div key={log.id} className="flex gap-2 leading-relaxed">
                    <span className="text-[#666666] flex-shrink-0 text-[10px] pt-[1px]">{log.timestamp}</span>
                    <span className="flex-shrink-0" style={{ color }}>{prefix}</span>
                    <span style={{ color }} className="text-[11px]">
                      {log.message}
                      {log.detail && (
                        <span className="text-[#666666] ml-2 font-sans text-[10px]">— {log.detail}</span>
                      )}
                    </span>
                  </div>
                );
              })
            )}
            {demoRunning && (
              <div className="flex items-center gap-2 text-[#007ACC] pt-1">
                <Loader className="w-3 h-3 animate-spin" />
                <span className="text-[11px] animate-pulse">Agent executing...</span>
              </div>
            )}
            <div ref={logEndRef} />
          </div>
        )}

        {/* Activity Tab */}
        {activeBottomTab === 'activity' && (
          <div className="h-full overflow-y-auto p-3">
            {!activeTask ? (
              <div className="text-[#666666] text-[11px] pt-2">No active task. Run a demo to see step activity.</div>
            ) : (
              <div className="space-y-1.5">
                {activeTask.plan.map((step, idx) => {
                  const isRunning = demoRunning && demoStepIndex === idx;
                  const isDone = step.status === 'completed';
                  const isPending = step.status === 'pending' && !isRunning;

                  return (
                    <div key={step.step_id} className={`flex items-start gap-2.5 p-2 rounded transition-all ${
                      isRunning ? 'bg-[#252526] border border-[#007ACC]'
                        : isDone ? 'bg-[#1E1E1E] border border-[#3C3C3C]'
                        : 'opacity-40'
                    }`}>
                      <div className="flex-shrink-0 mt-0.5">
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-[#4EC9B0]" />
                          : isRunning ? <Loader className="w-3.5 h-3.5 text-[#007ACC] animate-spin" />
                          : <Circle className="w-3.5 h-3.5 text-[#666666]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold" style={{ color: isRunning ? '#CCCCCC' : isDone ? '#858585' : '#666666' }}>
                          {step.title}
                        </div>
                        {step.tool_name && (
                          <div className="text-[10px] text-[#007ACC] font-mono mt-0.5">
                            tool: {step.tool_name}
                            {isDone && <span className="text-[#666666] ml-2">{step.duration_ms}ms</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Workflow Tab */}
        {activeBottomTab === 'workflow' && (
          <div className="h-full overflow-x-auto overflow-y-hidden flex items-center px-4 py-3 gap-0">
            {[
              { label: 'SCAN', sub: 'OCR / Vision', color: '#CCA700', done: true },
              { label: 'PARSE', sub: 'Entity Extract', color: '#007ACC', done: true },
              { label: 'SEARCH', sub: 'RAG / ChromaDB', color: '#BC8CFF', done: true },
              { label: 'REASON', sub: 'Local LLM', color: '#4EC9B0', done: true },
              { label: 'VERIFY', sub: 'Deterministic', color: '#4EC9B0', done: true },
              { label: 'GENERATE', sub: 'DOCX/XLSX', color: '#4EC9B0', done: true },
            ].map((node, i, arr) => (
              <React.Fragment key={node.label}>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div
                    className="w-16 h-10 rounded flex flex-col items-center justify-center border text-[10px] font-bold"
                    style={{
                      backgroundColor: node.done ? node.color + '20' : '#2A2D2E',
                      borderColor: node.done ? node.color : '#3C3C3C',
                      color: node.done ? node.color : '#666666',
                    }}
                  >
                    {node.label}
                  </div>
                  <div className="text-[9px] text-[#666666] font-sans">{node.sub}</div>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex items-center flex-shrink-0 pb-5">
                    <div className="w-6 h-[1.5px] bg-[#3C3C3C]" />
                    <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-t-transparent border-b-transparent border-l-[#3C3C3C]" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
