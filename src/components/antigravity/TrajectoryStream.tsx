import React, { useState } from 'react';
import { 
  Bot, 
  Terminal, 
  Check, 
  Clock, 
  ChevronDown, 
  ChevronRight, 
  Download, 
  ExternalLink, 
  Sparkles,
  Layers
} from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';
import logo from '../../assets/logo.jpg';

interface TrajectoryStreamProps {
  onRunDemo: (type: 'inspection' | 'pump_mtbf' | 'pid_vision' | 'sop_search') => void;
}

export const TrajectoryStream: React.FC<TrajectoryStreamProps> = ({ onRunDemo }) => {
  const { 
    sessions, 
    activeSessionId, 
    isExecuting, 
    setActiveRightTab, 
    setRightPaneOpen 
  } = useAntigravityStore();

  const currentSession = sessions.find(s => s.id === activeSessionId);
  const steps = currentSession?.steps || [];

  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});

  const toggleThought = (id: string) => {
    setExpandedThoughts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTool = (id: string) => {
    setExpandedTools(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 font-sans text-xs bg-[#1e1e1e]">
      {/* 1. Empty State: Antigravity Welcome */}
      {steps.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-6 max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded bg-[#252526] border border-[#3c3c3c] flex items-center justify-center text-[#569cd6] shadow-sm">
            <Bot className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-lg font-bold text-white tracking-tight">
              LUMI
            </h1>
            <p className="text-xs text-[#858585] leading-relaxed max-w-lg">
              Autonomous on-premise industrial AI workbench. Execute multi-step reasoning, OCR, engineering calculations, and artifact creation with open-weight local models.
            </p>
          </div>

          {/* Quick Demo Launchers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full pt-2">
            <button
              onClick={() => onRunDemo('inspection')}
              disabled={isExecuting}
              className="p-3.5 rounded bg-[#252526] hover:bg-[#2a2d2e] border border-[#3c3c3c] hover:border-[#007acc] text-left transition-all space-y-1.5 group cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#569cd6]">
                <span>Flagship Demo</span>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-white group-hover:text-[#569cd6] transition-colors leading-snug">
                Inspection PDF &rarr; API 570 Word Note (.docx)
              </div>
              <p className="text-[11px] text-[#858585]">
                Local OCR, RAG SOP check, deterministic math, and Word generation.
              </p>
            </button>

            <button
              onClick={() => onRunDemo('pump_mtbf')}
              disabled={isExecuting}
              className="p-3.5 rounded bg-[#252526] hover:bg-[#2a2d2e] border border-[#3c3c3c] hover:border-[#4ec9b0] text-left transition-all space-y-1.5 group cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#4ec9b0]">
                <span>Code Sandbox</span>
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-white group-hover:text-[#4ec9b0] transition-colors leading-snug">
                Pump Excel Data &rarr; Python Sandbox MTBF
              </div>
              <p className="text-[11px] text-[#858585]">
                Docker --network=none sandbox execution for reliability metrics.
              </p>
            </button>

            <button
              onClick={() => onRunDemo('pid_vision')}
              disabled={isExecuting}
              className="p-3.5 rounded bg-[#252526] hover:bg-[#2a2d2e] border border-[#3c3c3c] hover:border-[#cca700] text-left transition-all space-y-1.5 group cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#cca700]">
                <span>VLM Vision</span>
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-white group-hover:text-[#cca700] transition-colors leading-snug">
                P&amp;ID Drawing &rarr; Multimodal Tag Extraction
              </div>
              <p className="text-[11px] text-[#858585]">
                Spatial symbol recognition with local Qwen2.5-VL model.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* 2. Trajectory Steps Rendering */}
      {steps.map((step) => {
        if (step.type === 'user_input') {
          return (
            <div key={step.id} className="flex justify-end">
              <div className="max-w-2xl bg-[#252526] border border-[#3c3c3c] rounded p-3.5 text-[#cccccc] space-y-1.5 shadow-sm">
                <div className="text-xs font-semibold text-[#858585] flex items-center justify-between font-mono">
                  <span>You</span>
                  <span>{step.timestamp}</span>
                </div>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{step.content}</p>
              </div>
            </div>
          );
        }

        if (step.type === 'thought') {
          const isExpanded = expandedThoughts[step.id] ?? true;
          return (
            <div key={step.id} className="max-w-3xl bg-[#252526] border border-[#2d2d2d] rounded overflow-hidden shadow-sm font-mono text-xs">
              <button
                onClick={() => toggleThought(step.id)}
                className="w-full px-3 py-2 bg-[#2d2d2d] border-b border-[#2d2d2d] flex items-center justify-between text-left text-[#cccccc] hover:bg-[#333333] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 font-bold text-[#569cd6]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Thinking: {step.title || 'Autonomous Planning & Analysis'}</span>
                  {step.status === 'running' && (
                    <span className="w-2 h-2 rounded-full bg-[#569cd6] animate-ping ml-1"></span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#858585]">{step.timestamp}</span>
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-3 text-xs text-[#cccccc] bg-[#1e1e1e] whitespace-pre-wrap leading-relaxed border-l-2 border-[#007acc]">
                  {step.content}
                </div>
              )}
            </div>
          );
        }

        if (step.type === 'tool_call') {
          const isExpanded = expandedTools[step.id] ?? true;
          return (
            <div key={step.id} className="max-w-3xl bg-[#252526] border border-[#2d2d2d] rounded overflow-hidden shadow-sm font-mono text-xs">
              <button
                onClick={() => toggleTool(step.id)}
                className="w-full px-3 py-2 bg-[#2d2d2d] border-b border-[#2d2d2d] flex items-center justify-between text-left text-[#cccccc] hover:bg-[#333333] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-[#569cd6]" />
                  <span className="font-bold text-white">&gt; {step.toolName}</span>
                  {step.status === 'running' ? (
                    <Clock className="w-3 h-3 text-[#569cd6] animate-spin ml-1" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-[#4ec9b0] ml-1" />
                  )}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-[#858585]">
                  {step.durationMs && <span>{step.durationMs}ms</span>}
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-3 bg-[#181818] space-y-2 text-[11px]">
                  {step.toolArgs && (
                    <div>
                      <span className="text-[#858585] text-[10px] uppercase font-bold block mb-1">Inputs:</span>
                      <pre className="p-2 rounded bg-[#1e1e1e] border border-[#2d2d2d] text-[#9cdcfe] overflow-x-auto">
                        {JSON.stringify(step.toolArgs, null, 2)}
                      </pre>
                    </div>
                  )}

                  {step.toolOutput && (
                    <div>
                      <span className="text-[#858585] text-[10px] uppercase font-bold block mb-1">Output Result:</span>
                      <pre className="p-2 rounded bg-[#1e1e1e] border border-[#2d2d2d] text-[#4ec9b0] overflow-x-auto">
                        {JSON.stringify(step.toolOutput, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }

        if (step.type === 'response') {
          return (
            <div key={step.id} className="max-w-3xl bg-[#252526] border border-[#2d2d2d] rounded p-4 text-[#cccccc] space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#3c3c3c] pb-2 text-xs">
                <div className="flex items-center gap-2">
                  <img src={logo.src} alt="LUMI" className="w-4 h-4 rounded object-cover" />
                  <span className="font-bold text-white">LUMI Output</span>
                  <span className="text-[#858585] font-mono">· {step.timestamp}</span>
                </div>

                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1f3a2b] text-[#4ec9b0] border border-[#2e5d44] font-bold">
                  ● Air-Gap Verified
                </span>
              </div>

              {/* Response Markdown */}
              <div className="text-xs leading-relaxed whitespace-pre-wrap text-[#cccccc] font-sans">
                {step.content}
              </div>

              {/* Citations */}
              {step.citations && step.citations.length > 0 && (
                <div className="pt-2 border-t border-[#3c3c3c] space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-[#858585] font-bold block">
                    Grounded SOP Citations:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {step.citations.map((c, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveRightTab('rag_knowledge');
                          setRightPaneOpen(true);
                        }}
                        className="px-2 py-0.5 rounded bg-[#1e1e1e] hover:bg-[#333333] border border-[#3c3c3c] hover:border-[#007acc] text-xs font-mono text-[#569cd6] flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>[{c.source} · p{c.page || 1}]</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Artifacts Created */}
              {step.artifacts && step.artifacts.length > 0 && (
                <div className="pt-2 border-t border-[#3c3c3c] space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-[#4ec9b0] font-bold block">
                    Deliverables Created:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {step.artifacts.map((art) => (
                      <div key={art.id} className="p-2.5 rounded bg-[#1e1e1e] border border-[#3c3c3c] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-6 h-6 rounded bg-[#1f3a2b] border border-[#2e5d44] flex items-center justify-center font-bold text-[#4ec9b0] text-[9px] uppercase font-mono">
                            {art.type}
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-semibold text-white truncate">{art.name}</div>
                            <div className="text-[10px] text-[#858585] font-mono">{(art.sizeBytes / 1024).toFixed(1)} KB</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => {
                              setActiveRightTab('artifacts');
                              setRightPaneOpen(true);
                            }}
                            className="px-2 py-0.5 rounded bg-[#252526] hover:bg-[#333333] text-[#858585] hover:text-white text-[10px] font-mono cursor-pointer border border-[#3c3c3c]"
                          >
                            Inspect
                          </button>
                          <a
                            href={art.path}
                            download
                            className="px-2 py-0.5 rounded bg-[#007acc] hover:bg-[#1f8ad2] text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition-all"
                          >
                            <Download className="w-3 h-3" />
                            <span>Get</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
