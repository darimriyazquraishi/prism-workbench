import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Paperclip, 
  Sparkles, 
  FileText, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  AlertTriangle, 
  Clock, 
  Cpu, 
  FileSpreadsheet, 
  X,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';
import logo from '../../assets/logo.jpg';
import type { ChatMessage, ArtifactRecord, Citation } from '../../types';

interface ChatWorkbenchProps {
  onExecutePrompt: (prompt: string, files: string[]) => void;
}

export const ChatWorkbench: React.FC<ChatWorkbenchProps> = ({ onExecutePrompt }) => {
  const { 
    messages, 
    isProcessing, 
    attachedFiles, 
    attachFile, 
    removeAttachedFile, 
    clearAttachments,
    openTab,
    toggleTaskPanel,
    setTaskPanelOpen,
    demoRunning,
    demoStepIndex
  } = useWorkbenchStore();

  const [inputPrompt, setInputPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isProcessing) return;
    const promptToSend = inputPrompt;
    const filesToSend = attachedFiles.length > 0 ? [...attachedFiles] : ['demo/synthetic/Inspection_Report_001.pdf'];
    setInputPrompt('');
    clearAttachments();
    onExecutePrompt(promptToSend, filesToSend);
  };

  const quickPrompts = [
    {
      title: 'Analyze inspection files & create approval note',
      prompt: 'Analyze these inspection reports, compare them against our maintenance SOPs, identify critical issues, calculate the corrosion rate, and prepare an approval note in Word format.',
      files: ['demo/synthetic/Inspection_Report_001.pdf'],
      icon: FileText
    },
    {
      title: 'Run Python failure analysis on equipment data',
      prompt: 'Analyze Pump_Failure_Data.xlsx, write and execute Python code in the sandbox to calculate monthly MTBF statistics, and produce an Excel deliverable.',
      files: ['demo/synthetic/Pump_Failure_Data.xlsx'],
      icon: FileSpreadsheet
    },
    {
      title: 'Inspect P&ID drawing & extract equipment tags',
      prompt: 'Perform vision analysis on P_and_ID_Example.png, identify all pumps, valves, and flow lines, and generate an executive summary briefing deck.',
      files: ['demo/synthetic/P_and_ID_Example.png'],
      icon: Sparkles
    },
    {
      title: 'Search internal maintenance SOP standards',
      prompt: 'Search our maintenance knowledge base for crude distillation piping retirement limits and statutory replacement procedures.',
      files: ['demo/synthetic/Operations_SOP_014.pdf'],
      icon: ShieldCheck
    }
  ];

  return (
    <div className="h-full flex flex-col bg-[#1E1E1E] font-sans text-sm overflow-hidden relative">
      {/* 1. CHAT MESSAGES STREAM */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-4xl w-full mx-auto">
        {/* Empty State / Initial Landing */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-[#252526] border border-[#3C3C3C] flex items-center justify-center text-[#007ACC] shadow-sm">
              <Bot className="w-7 h-7" />
            </div>

            <div className="space-y-2 max-w-md">
              <h1 className="text-xl font-bold text-white tracking-tight">
                What do you want to accomplish?
              </h1>
              <p className="text-xs text-[#858585] leading-relaxed">
                Tell your private AI what you need done. It automatically selects local models and tools to perform the task without any cloud transmission.
              </p>
            </div>

            {/* Quick Action Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl w-full pt-2">
              {quickPrompts.map((qp, idx) => {
                const Icon = qp.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      clearAttachments();
                      qp.files.forEach(f => attachFile(f));
                      setInputPrompt(qp.prompt);
                    }}
                    className="p-3.5 rounded-lg bg-[#252526] hover:bg-[#2A2D2E] border border-[#3C3C3C] hover:border-[#007ACC] text-left transition-all flex items-start gap-3 group cursor-pointer shadow-sm"
                  >
                    <Icon className="w-4 h-4 text-[#007ACC] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-[#CCCCCC] group-hover:text-white leading-snug">
                        {qp.title}
                      </div>
                      <div className="text-[11px] text-[#666666] mt-1 font-mono">
                        📎 {qp.files[0].split('/').pop()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Render Chat Messages */}
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3">
            {/* User Message */}
            {msg.sender === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-2xl bg-[#252526] border border-[#3C3C3C] rounded-xl p-4 text-[#CCCCCC] space-y-2 shadow-sm">
                  <div className="text-xs font-semibold text-[#858585] flex items-center gap-1.5 font-mono">
                    <span>You</span>
                    <span className="text-[#666666]">· {msg.timestamp}</span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  
                  {/* Attached files badge */}
                  {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.attachedFiles.map((file, idx) => (
                        <span key={idx} className="text-xs font-mono px-2 py-0.5 rounded bg-[#1E1E1E] text-[#9cdcfe] border border-[#3C3C3C] flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          <span>{file.split('/').pop()}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Assistant Message */
              <div className="flex justify-start">
                <div className="max-w-2xl w-full bg-[#252526] border border-[#3C3C3C] rounded-xl p-5 text-[#CCCCCC] space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#3C3C3C] pb-2 text-xs">
                    <div className="flex items-center gap-2">
                      <img src={logo.src} alt="LUMI" className="w-5 h-5 rounded object-cover" />
                      <span className="font-semibold text-white">LUMI</span>
                      <span className="text-[#666666] font-mono">· {msg.timestamp}</span>
                    </div>

                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#252526] text-[#4EC9B0] border border-[#3C3C3C] font-semibold">
                      100% Local Execution
                    </span>
                  </div>

                  {/* Main Plain-Language Response */}
                  <div className="text-sm leading-relaxed space-y-2 whitespace-pre-wrap text-[#CCCCCC]">
                    {msg.text}
                  </div>

                  {/* Inline Grounded Sources / Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-[#3C3C3C] space-y-2">
                      <span className="text-xs font-mono uppercase text-[#858585] font-bold block">
                        Verified Evidence &amp; Citations:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {msg.citations.map((c, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              openTab({
                                id: `tab-citation-${idx}`,
                                title: `${c.source_file} (p.${c.page_number || 1})`,
                                type: 'document',
                                file: c.source_file,
                                isClosable: true
                              });
                            }}
                            className="px-2.5 py-1 rounded bg-[#252526] hover:bg-[#2A2D2E] border border-[#3C3C3C] hover:border-[#007ACC] text-xs font-mono text-[#007ACC] flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>[{c.source_file} · p{c.page_number || 1}]</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inline Generated Business Artifacts */}
                  {msg.artifacts && msg.artifacts.length > 0 && (
                    <div className="pt-2 border-t border-[#3C3C3C] space-y-2">
                      <span className="text-xs font-mono uppercase text-[#4EC9B0] font-bold block">
                        Generated Deliverables:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {msg.artifacts.map((art) => (
                          <div key={art.artifact_id} className="p-3 rounded-lg bg-[#252526] border border-[#3C3C3C] flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 truncate">
                              <div className="w-7 h-7 rounded bg-[#1f3a2b] border border-[#2e5d44] flex items-center justify-center font-bold text-[#4EC9B0] text-[10px] uppercase font-mono">
                                {art.file_type}
                              </div>
                              <div className="truncate">
                                <div className="text-xs font-semibold text-white truncate">{art.file_name}</div>
                                <div className="text-[10px] text-[#858585] font-mono">{(art.size_bytes / 1024).toFixed(1)} KB</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              <a
                                href={art.file_path}
                                download
                                className="px-2.5 py-1 rounded bg-[#007ACC] hover:bg-[#1f8ad2] text-white text-xs font-bold flex items-center gap-1 shadow transition-all"
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

                  {/* Inline Execution Summary Button */}
                  {msg.task && (
                    <div className="pt-2 border-t border-[#3C3C3C] flex items-center justify-between text-xs font-mono text-[#858585]">
                      <span className="flex items-center gap-1.5 text-[#4EC9B0]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed in {(msg.task.tool_calls.reduce((acc, t) => acc + t.execution_time_ms, 0) / 1000).toFixed(2)}s
                      </span>

                      <button
                        onClick={() => {
                          setTaskPanelOpen(true);
                        }}
                        className="text-[#007ACC] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Task Steps ({msg.task.plan.length})</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Live Processing Indicator */}
        {(isProcessing || demoRunning) && (
          <div className="flex justify-start">
            <div className="max-w-xl w-full bg-[#252526] border border-[#3C3C3C] rounded-xl p-4 text-[#CCCCCC] space-y-3 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-[#007ACC]">
                  <div className="w-3.5 h-3.5 border-2 border-[#007ACC]/30 border-t-[#007ACC] rounded-full animate-spin"></div>
                  <span className="font-bold">Autonomous Agent Working...</span>
                </div>
                <span className="text-[#858585]">Local Inference Active</span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                {useWorkbenchStore.getState().activeTask?.plan.map((step, idx) => {
                  const isDone = step.status === 'completed';
                  const isCurrent = useWorkbenchStore.getState().demoStepIndex === idx || step.status === 'running';
                  const isPending = step.status === 'pending' && !isCurrent;
                  
                  return (
                    <div key={step.step_id} className={`flex items-center gap-2 transition-all ${
                      isCurrent ? 'text-[#007ACC] font-bold' : isDone ? 'text-[#4EC9B0]' : 'text-[#666666]'
                    }`}>
                      {isDone ? <Check className="w-3.5 h-3.5" /> : isCurrent ? <span className="w-2 h-2 rounded-full bg-[#007ACC] animate-ping ml-0.5 mr-1"></span> : <Clock className="w-3 h-3 ml-0.5 mr-0.5" />}
                      <span>{step.title}</span>
                      {isCurrent && <span className="text-[#858585] text-[10px] ml-auto animate-pulse">Running {step.tool_name}...</span>}
                      {isDone && <span className="text-[#666666] text-[10px] ml-auto">{step.duration_ms}ms</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 2. BOTTOM CHAT COMPOSER */}
      <div className="border-t border-[#3C3C3C] bg-[#252526] p-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-2">
          {/* Attached files bar */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pb-1">
              <span className="text-xs text-[#858585] font-mono">Attached:</span>
              {attachedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#252526] border border-[#3C3C3C] text-xs font-mono text-[#CCCCCC]">
                  <Paperclip className="w-3 h-3 text-[#007ACC]" />
                  <span>{file.split('/').pop()}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachedFile(file)}
                    className="text-[#858585] hover:text-white ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-center bg-[#252526] border border-[#3C3C3C] focus-within:border-[#007ACC] rounded-xl transition-all shadow-inner">
            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask your local AI to analyze documents, calculate data, or produce deliverables..."
              rows={2}
              className="w-full bg-transparent border-none py-3 px-4 text-sm text-[#CCCCCC] placeholder-[#666666] focus:outline-none resize-none font-sans"
            />

            <div className="flex items-center gap-2 pr-3">
              {/* Attach File Button */}
              <button
                type="button"
                onClick={() => {
                  attachFile('demo/synthetic/Inspection_Report_001.pdf');
                }}
                title="Attach company document"
                className="p-2 hover:bg-[#2A2D2E] rounded-lg text-[#858585] hover:text-[#CCCCCC] transition-colors cursor-pointer"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || !inputPrompt.trim()}
                className={`p-2.5 rounded-lg text-white font-bold flex items-center justify-center transition-all ${
                  isProcessing || !inputPrompt.trim()
                    ? 'bg-[#3C3C3C] text-[#666666] cursor-not-allowed'
                    : 'bg-[#007ACC] hover:bg-[#1f8ad2] text-white shadow cursor-pointer'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#666666] px-1">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span className="text-[#4EC9B0] font-semibold">● 100% On-Premise Air-Gapped</span>
          </div>
        </form>
      </div>
    </div>
  );
};
