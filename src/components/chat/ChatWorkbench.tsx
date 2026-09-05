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
    setTaskPanelOpen
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
    <div className="h-full flex flex-col bg-[var(--bg-primary)] font-sans text-[var(--text-primary)] overflow-hidden relative transition-colors duration-200">
      {/* 1. CHAT MESSAGES STREAM */}
      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 max-w-[760px] w-full mx-auto">
        {/* Empty State / Initial Landing */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-6">
            <div className="space-y-3 max-w-md">
              <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
                How can I assist?
              </h1>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-light">
                Secure, isolated, on-premise execution.
              </p>
            </div>

            {/* Quick Action Pills - Simplified */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full pt-4">
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
                    className="p-4 rounded-xl bg-[var(--bg-surface)] hover:border-[var(--accent-fuchsia-muted)] border border-[var(--border-subtle)] text-left transition-all duration-200 flex items-start gap-3 group cursor-pointer shadow-sm"
                  >
                    <Icon className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--accent-fuchsia)] transition-colors flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)] leading-snug">
                        {qp.title}
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
                <div className="max-w-[85%] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl rounded-tr-sm p-4 text-[var(--text-primary)] space-y-2 shadow-sm">
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  
                  {/* Attached files badge */}
                  {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {msg.attachedFiles.map((file, idx) => (
                        <span key={idx} className="text-[11px] font-mono px-2 py-1 rounded bg-[var(--bg-terminal)] text-[var(--text-secondary)] flex items-center gap-1">
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
                <div className="max-w-[95%] w-full rounded-2xl p-2 text-[var(--text-primary)] space-y-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-fuchsia)] font-bold text-[10px]">
                      S
                    </div>
                    <span className="text-xs text-[var(--text-secondary)] font-medium">Sovereign AI</span>
                  </div>

                  {/* Main Plain-Language Response */}
                  <div className="text-[15px] leading-[1.7] space-y-3 whitespace-pre-wrap font-light">
                    {msg.text}
                  </div>

                  {/* Inline Generated Business Artifacts */}
                  {msg.artifacts && msg.artifacts.length > 0 && (
                    <div className="pt-3 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {msg.artifacts.map((art) => (
                          <div key={art.artifact_id} className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 shadow-sm hover:border-[var(--accent-fuchsia-muted)] transition-colors">
                            <div className="flex items-center gap-3 truncate">
                              <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] font-medium text-xs uppercase">
                                {art.file_type}
                              </div>
                              <div className="truncate">
                                <div className="text-sm font-medium truncate">{art.file_name}</div>
                                <div className="text-xs text-[var(--text-secondary)] font-mono">{(art.size_bytes / 1024).toFixed(1)} KB</div>
                              </div>
                            </div>
                            <a
                              href={art.file_path}
                              download
                              title="Download Artifact"
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] hover:text-[var(--accent-fuchsia)] text-[var(--text-secondary)] transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inline Execution Summary Button */}
                  {msg.task && (
                    <div className="pt-3 flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1.5 text-[var(--status-healthy)] font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {(msg.task.tool_calls.reduce((acc, t) => acc + t.execution_time_ms, 0) / 1000).toFixed(2)}s
                      </span>
                      <span className="opacity-40">•</span>
                      <button
                        onClick={() => setTaskPanelOpen(true)}
                        className="hover:text-[var(--accent-fuchsia)] font-medium transition-colors cursor-pointer"
                      >
                        View task details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Live Processing Indicator */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3 text-[var(--text-secondary)] p-2">
              <div className="w-5 h-5 rounded-full border-2 border-[var(--border-subtle)] border-t-[var(--accent-fuchsia)] animate-spin"></div>
              <span className="text-sm font-medium">Executing local task...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 2. BOTTOM CHAT COMPOSER */}
      <div className="p-6 flex-shrink-0 flex justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-[760px] space-y-2">
          {/* Attached files bar */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pb-2">
              {attachedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)]">
                  <Paperclip className="w-3 h-3 text-[var(--text-secondary)]" />
                  <span>{file.split('/').pop()}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachedFile(file)}
                    className="text-[var(--text-secondary)] hover:text-[var(--accent-fuchsia)] ml-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-end bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus-within:border-[var(--accent-fuchsia-muted)] rounded-2xl transition-all duration-200 shadow-sm p-1.5">
            
            {/* File Tree / Explorer Toggle */}
            <button
              type="button"
              title="Toggle Project Explorer"
              className="p-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer rounded-xl hover:bg-[var(--bg-primary)] mb-0.5"
            >
              <FileText className="w-5 h-5" />
            </button>

            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask Sovereign AI..."
              rows={1}
              className="w-full bg-transparent border-none py-3 px-2 text-[15px] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none resize-none font-sans min-h-[44px] max-h-[200px]"
            />

            <div className="flex items-center gap-1 pr-1 mb-1">
              <button
                type="button"
                onClick={() => attachFile('demo/synthetic/Inspection_Report_001.pdf')}
                title="Attach file"
                className="p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] rounded-xl transition-colors cursor-pointer"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <button
                type="submit"
                disabled={isProcessing || !inputPrompt.trim()}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isProcessing || !inputPrompt.trim()
                    ? 'text-[var(--border-subtle)] cursor-not-allowed'
                    : 'bg-[var(--accent-fuchsia)] hover:opacity-90 text-[var(--text-primary)] shadow-md cursor-pointer'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="px-3 pt-1">
            <span className="text-[11px] text-[var(--text-secondary)] font-medium tracking-wide">
              Routed to Qwen2.5-VL (Local Vision)
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
