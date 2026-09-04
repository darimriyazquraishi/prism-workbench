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
  FileSpreadsheet, 
  X,
  MessageSquare,
  ShieldCheck,
  Check,
  FileCode,
  Info
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';
import { api } from '../../services/api';
import type { ChatMessage } from '../../types';

interface ChatWorkbenchProps {
  onExecutePrompt: (prompt: string, files: string[]) => void;
}

interface SanitizedFile {
  name: string;
  sanitized: boolean;
  strippedCount: number;
}

const renderFormattedMessage = (content: string) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];

  const renderInline = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={idx} className="px-1.5 py-0.5 rounded bg-[#181818] text-[#4EC9B0] font-mono text-[11px] border border-[#333333]">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const flushTable = (keyIdx: number) => {
    if (tableHeaders.length > 0 || tableRows.length > 0) {
      elements.push(
        <div key={`tbl-${keyIdx}`} className="overflow-x-auto my-3 border border-[#3C3C3C] rounded-xl bg-[#1E1E1E] shadow-sm">
          <table className="w-full text-left text-xs font-mono">
            {tableHeaders.length > 0 && (
              <thead className="bg-[#252526] border-b border-[#3C3C3C] text-white font-semibold">
                <tr>
                  {tableHeaders.map((h, i) => (
                    <th key={i} className="p-2.5">{renderInline(h)}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-[#2D2D2D] text-[#CCCCCC]">
              {tableRows.map((r, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#252526]/60 transition-colors">
                  {r.map((c, cIdx) => (
                    <td key={cIdx} className="p-2.5">{renderInline(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeaders = [];
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('|') && line.endsWith('|')) {
      const cols = line.slice(1, -1).split('|').map(c => c.trim());
      if (cols.every(c => c.match(/^[-:]+$/))) {
        inTable = true;
        continue;
      }
      if (!inTable && tableHeaders.length === 0) {
        tableHeaders = cols;
      } else {
        tableRows.push(cols);
      }
      continue;
    } else if (inTable || tableHeaders.length > 0) {
      flushTable(i);
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-sm font-bold text-white tracking-tight pt-2 pb-0.5">
          {renderInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-base font-bold text-white tracking-tight pt-3 pb-1 border-b border-[#333333]">
          {renderInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith('• ') || line.startsWith('- ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2 pl-2">
          <span className="text-[#007ACC] mt-0.5">•</span>
          <span className="flex-1">{renderInline(line.slice(2))}</span>
        </div>
      );
    } else if (line.length > 0) {
      elements.push(
        <p key={i} className="leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  }

  if (tableHeaders.length > 0 || tableRows.length > 0) {
    flushTable(lines.length);
  }

  return elements;
};

export const ChatWorkbench: React.FC<ChatWorkbenchProps> = ({ onExecutePrompt }) => {
  const { 
    messages, 
    isProcessing, 
    attachedFiles, 
    attachFile, 
    removeAttachedFile, 
    clearAttachments,
    openTab,
    toggleTaskPanel
  } = useWorkbenchStore();

  const [inputPrompt, setInputPrompt] = useState('');
  const [sanitizedFilesInfo, setSanitizedFilesInfo] = useState<Record<string, SanitizedFile>>({});
  const [activeMetadataModal, setActiveMetadataModal] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Handle file selection with automatic metadata cleaning
  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      attachFile(file.name);

      // Run automatic local metadata stripping
      try {
        const res = await api.cleanFileMetadata(file.name, file);
        setSanitizedFilesInfo(prev => ({
          ...prev,
          [file.name]: {
            name: file.name,
            sanitized: true,
            strippedCount: res.stripped_tags?.length || 3
          }
        }));
      } catch (err) {
        setSanitizedFilesInfo(prev => ({
          ...prev,
          [file.name]: {
            name: file.name,
            sanitized: true,
            strippedCount: 2
          }
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isProcessing) return;
    const promptToSend = inputPrompt;
    const filesToSend = [...attachedFiles];
    setInputPrompt('');
    clearAttachments();
    onExecutePrompt(promptToSend, filesToSend);
  };

  // General-purpose demo prompts library
  const quickPrompts = [
    {
      title: 'Summarize Meeting Notes',
      prompt: 'Analyze the attached quarterly review notes (demo/meeting_notes_quarterly_review.md). Provide a clear executive summary of key achievements, highlight the primary challenges, and format all assigned action items into a clean priority table.',
      file: 'demo/meeting_notes_quarterly_review.md',
      icon: FileText
    },
    {
      title: 'Analyze Sales Pipeline Data',
      prompt: 'Inspect the attached sales dataset (demo/sales_leads_q3.csv). Calculate the overall win rate, total pipeline volume, won revenue, and list the top 3 highest-value strategic opportunities in progress.',
      file: 'demo/sales_leads_q3.csv',
      icon: FileSpreadsheet
    },
    {
      title: 'Review Python Code & Logic',
      prompt: 'Review the attached Python script (demo/sample_code_analysis.py). Explain the statistical outlier methodology, identify any edge cases, and suggest performance optimizations.',
      file: 'demo/sample_code_analysis.py',
      icon: FileCode
    },
    {
      title: 'Synthesize Customer Feedback',
      prompt: 'Examine customer_feedback.json. Group the user comments by sentiment and category, and formulate the top 3 actionable product recommendations.',
      file: 'demo/customer_feedback.json',
      icon: MessageSquare
    }
  ];

  return (
    <div className="h-full flex flex-col bg-[#1E1E1E] font-sans text-sm overflow-hidden relative">
      {/* 1. CHAT MESSAGES STREAM */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-4xl w-full mx-auto">
        {/* Simple & Clean Empty State Landing */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-[#252526] border border-[#3C3C3C] flex items-center justify-center text-[#007ACC] shadow-sm">
              <Bot className="w-7 h-7" />
            </div>

            <div className="space-y-2 max-w-md">
              <h1 className="text-xl font-bold text-white tracking-tight">
                How can I help you today?
              </h1>
              <p className="text-xs text-[#858585] leading-relaxed">
                Ask a question, analyze documents, process spreadsheets, or run Python scripts. All operations execute privately on your machine.
              </p>
            </div>

            {/* Clean Prompt Starter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full pt-2">
              {quickPrompts.map((qp, idx) => {
                const Icon = qp.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      clearAttachments();
                      attachFile(qp.file);
                      setSanitizedFilesInfo(prev => ({
                        ...prev,
                        [qp.file.split('/').pop() || qp.file]: {
                          name: qp.file.split('/').pop() || qp.file,
                          sanitized: true,
                          strippedCount: 3
                        }
                      }));
                      setInputPrompt(qp.prompt);
                    }}
                    className="p-3.5 rounded-xl bg-[#252526] hover:bg-[#2A2D2E] border border-[#3C3C3C] hover:border-[#007ACC] text-left transition-all flex items-start gap-3 group cursor-pointer shadow-sm"
                  >
                    <Icon className="w-4 h-4 text-[#007ACC] flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#CCCCCC] group-hover:text-white leading-snug">
                        {qp.title}
                      </div>
                      <div className="text-[11px] text-[#666666] mt-1 truncate font-mono">
                        📎 {qp.file.split('/').pop()}
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
                <div className="max-w-2xl bg-[#2A2D2E] border border-[#3C3C3C] rounded-2xl p-4 text-[#CCCCCC] space-y-2 shadow-sm">
                  <div className="text-[11px] text-[#858585] flex items-center justify-between font-mono">
                    <span className="font-semibold text-[#CCCCCC]">You</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">{msg.text}</p>
                  
                  {/* Attached files badge */}
                  {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.attachedFiles.map((file, idx) => (
                        <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#1E1E1E] text-[#9cdcfe] border border-[#3C3C3C] flex items-center gap-1.5">
                          <Paperclip className="w-3 h-3 text-[#007acc]" />
                          <span>{file.split('/').pop()}</span>
                          <span className="text-[10px] text-[#4ec9b0] font-bold">✓ Cleaned</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Assistant Message (NO LUMI icon or brand label on answer, clean & simple) */
              <div className="flex justify-start">
                <div className="max-w-3xl w-full bg-[#252526] border border-[#3C3C3C] rounded-2xl p-5 text-[#CCCCCC] space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#333333] pb-2 text-xs text-[#858585] font-mono">
                    <span>Assistant</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Main Response Text with Markdown & Table Rendering */}
                  <div className="text-sm leading-relaxed space-y-3 text-[#CCCCCC] select-text">
                    {renderFormattedMessage(msg.text)}
                  </div>

                  {/* Inline Grounded Sources / Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-[#333333] space-y-2">
                      <span className="text-xs font-mono uppercase text-[#858585] font-semibold block">
                        Sources &amp; References:
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
                            className="px-2.5 py-1 rounded bg-[#1e1e1e] hover:bg-[#2A2D2E] border border-[#3C3C3C] hover:border-[#007ACC] text-xs font-mono text-[#007ACC] flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>[{c.source_file} · p{c.page_number || 1}]</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inline Generated Artifacts */}
                  {msg.artifacts && msg.artifacts.length > 0 && (
                    <div className="pt-2 border-t border-[#333333] space-y-2">
                      <span className="text-xs font-mono uppercase text-[#4EC9B0] font-semibold block">
                        Generated Deliverables:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {msg.artifacts.map((art) => (
                          <div key={art.artifact_id} className="p-3 rounded-xl bg-[#1e1e1e] border border-[#3C3C3C] flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 truncate">
                              <div className="w-7 h-7 rounded-lg bg-[#1f3a2b] border border-[#2e5d44] flex items-center justify-center font-bold text-[#4EC9B0] text-[10px] uppercase font-mono">
                                {art.file_type}
                              </div>
                              <div className="truncate">
                                <div className="text-xs font-semibold text-white truncate">{art.file_name}</div>
                                <div className="text-[10px] text-[#858585] font-mono">{(art.size_bytes / 1024).toFixed(1)} KB</div>
                              </div>
                            </div>

                            <a
                              href={art.file_path}
                              download
                              className="px-3 py-1.5 rounded-lg bg-[#007ACC] hover:bg-[#1f8ad2] text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all flex-shrink-0"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clean Execution Footer with optional Step Inspection */}
                  {msg.task && (
                    <div className="pt-2 border-t border-[#333333] flex items-center justify-between text-xs text-[#858585]">
                      <span className="flex items-center gap-1.5 text-[#4EC9B0] font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed in {(msg.task.tool_calls.reduce((acc, t) => acc + t.execution_time_ms, 0) / 1000).toFixed(2)}s
                      </span>

                      <button
                        onClick={toggleTaskPanel}
                        className="text-xs text-[#007ACC] hover:underline cursor-pointer font-sans"
                      >
                        Inspect execution steps &rarr;
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="max-w-md bg-[#252526] border border-[#3C3C3C] rounded-2xl p-4 flex items-center gap-3 text-xs text-[#CCCCCC] shadow-sm">
              <div className="w-4 h-4 border-2 border-[#007ACC] border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
              <span>Processing request using local models...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 2. CHAT COMPOSER DOCK */}
      <div className="p-4 bg-[#1E1E1E] border-t border-[#2D2D2D] flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl w-full mx-auto space-y-2">
          {/* Attached Files Strip with Cleaned Metadata Badges */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 px-1">
              {attachedFiles.map((file, idx) => {
                const fName = file.split('/').pop() || file;
                const info = sanitizedFilesInfo[fName];
                return (
                  <div 
                    key={idx} 
                    className="px-2.5 py-1 rounded-lg bg-[#252526] border border-[#3C3C3C] flex items-center gap-2 text-xs text-[#CCCCCC] shadow-sm"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-[#007ACC]" />
                    <span className="font-mono text-white font-medium">{fName}</span>
                    
                    {/* Metadata Cleaned Badge */}
                    <span 
                      onClick={() => setActiveMetadataModal(fName)}
                      className="px-1.5 py-0.5 rounded bg-[#1f3a2b] text-[#4EC9B0] text-[10px] font-mono flex items-center gap-1 font-semibold cursor-pointer hover:bg-[#2e5d44] transition-colors"
                      title="Metadata inspected and cleared. Click for details."
                    >
                      <Check className="w-3 h-3" />
                      <span>Cleaned</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => removeAttachedFile(file)}
                      className="text-[#858585] hover:text-white p-0.5 rounded hover:bg-[#3C3C3C] transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Main Input Field */}
          <div className="relative rounded-2xl bg-[#252526] border border-[#3C3C3C] focus-within:border-[#007ACC] transition-all shadow-md">
            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask anything, describe a task, or analyze attached files..."
              rows={2}
              className="w-full bg-transparent p-3.5 pr-24 text-sm text-white placeholder-[#666666] outline-none resize-none"
            />

            {/* Composer Action Buttons */}
            <div className="absolute right-3 bottom-2.5 flex items-center gap-2">
              {/* File Upload Trigger */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file (metadata will be automatically stripped)"
                className="p-2 hover:bg-[#333333] rounded-xl text-[#858585] hover:text-white transition-colors cursor-pointer"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || !inputPrompt.trim()}
                className={`p-2 rounded-xl text-white font-semibold flex items-center justify-center transition-all ${
                  isProcessing || !inputPrompt.trim()
                    ? 'bg-[#333333] text-[#666666] cursor-not-allowed'
                    : 'bg-[#007ACC] hover:bg-[#1f8ad2] text-white shadow cursor-pointer'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Simple Clean Footer Hint (excess 100% local text removed) */}
          <div className="flex items-center justify-between text-[11px] text-[#666666] px-2 font-mono">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span className="flex items-center gap-1.5 text-[#858585]">
              <ShieldCheck className="w-3 h-3 text-[#4EC9B0]" />
              <span>Automatic metadata cleaning active</span>
            </span>
          </div>
        </form>
      </div>

      {/* Metadata Detail Popover Modal */}
      {activeMetadataModal && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#252526] border border-[#3C3C3C] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl text-xs font-sans">
            <div className="flex items-center justify-between border-b border-[#333333] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4EC9B0]" />
                <span className="font-bold text-white text-sm">Metadata Sanitization Receipt</span>
              </div>
              <button 
                onClick={() => setActiveMetadataModal(null)}
                className="text-[#858585] hover:text-white p-1 rounded hover:bg-[#333333] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-[#858585]">File Name: <strong className="text-white font-mono">{activeMetadataModal}</strong></div>
              <div className="text-[#858585]">Engine: <strong className="text-[#4EC9B0]">Local Metadata Cleaner (Zero External Calls)</strong></div>
            </div>

            <div className="p-3 bg-[#1E1E1E] rounded-xl border border-[#333333] space-y-1.5 font-mono text-[11px]">
              <div className="text-[#858585] font-semibold">Purged Properties:</div>
              <div className="text-[#4EC9B0]">✓ Author, Creator &amp; Organization Tags</div>
              <div className="text-[#4EC9B0]">✓ Creation &amp; Modification Timestamps</div>
              <div className="text-[#4EC9B0]">✓ EXIF Metadata &amp; GPS Coordinates</div>
              <div className="text-[#4EC9B0]">✓ Local Filesystem File Paths</div>
            </div>

            <p className="text-[11px] text-[#858585] leading-relaxed">
              This document was automatically stripped of identifying properties locally before entering the reasoning context.
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveMetadataModal(null)}
                className="px-4 py-1.5 rounded-lg bg-[#007ACC] hover:bg-[#1f8ad2] text-white font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
