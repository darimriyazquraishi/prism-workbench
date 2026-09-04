import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Send, 
  Paperclip, 
  Sparkles, 
  FileText, 
  Download, 
  ChevronDown, 
  ChevronRight, 
  ExternalLink, 
  FileSpreadsheet, 
  X, 
  MessageSquare, 
  FileCode,
  Globe,
  Mic,
  ArrowUp,
  Cpu,
  Terminal as TerminalIcon,
  CheckCircle2,
  Check,
  Clock,
  Circle,
  HelpCircle,
  Info,
  AlertCircle
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';
import { api } from '../../services/api';
import type { ChatMessage } from '../../types';
import { SourcesPane } from '../perplexity/SourcesPane';

interface ChatWorkbenchProps {
  onExecutePrompt: (prompt: string, files: string[]) => void;
  activeView?: 'answer' | 'links' | 'images';
}

const renderFormattedMessage = (content: string) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];

  const renderInline = (text: string): React.ReactNode => {
    // Check for inline citation pattern like [1], [2], [cert-in.org], etc.
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[\d+\])/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-[#202222] text-[#20B8CD] font-mono text-[11.5px] border border-[#2E3133]">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (/^\[\d+\]$/.test(part)) {
        return (
          <span key={idx} className="inline-flex items-center justify-center text-[10px] font-mono font-bold text-[#20B8CD] bg-[#20B8CD]/10 border border-[#20B8CD]/30 rounded-full px-1.5 py-0.2 mx-0.5 align-super cursor-pointer hover:bg-[#20B8CD]/20">
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  const flushTable = (keyIdx: number) => {
    if (tableHeaders.length > 0 || tableRows.length > 0) {
      elements.push(
        <div key={`tbl-${keyIdx}`} className="overflow-x-auto my-4 border border-[#27292A] rounded-2xl bg-[#1C1D1E] shadow-sm">
          <table className="w-full text-left text-xs font-sans">
            {tableHeaders.length > 0 && (
              <thead className="bg-[#202222] border-b border-[#27292A] text-white font-semibold">
                <tr>
                  {tableHeaders.map((h, i) => (
                    <th key={i} className="p-3 text-[#E6E6E6] font-medium">{renderInline(h)}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-[#242627] text-[#D1D5DB]">
              {tableRows.map((r, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#202222]/50 transition-colors">
                  {r.map((c, cIdx) => (
                    <td key={cIdx} className="p-3">{renderInline(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      tableHeaders = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      if (line.includes('---')) {
        inTable = true;
        continue;
      }
      if (!inTable && tableHeaders.length === 0) {
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable || tableHeaders.length > 0) {
      flushTable(i);
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-base font-semibold text-white tracking-tight pt-3 pb-1 font-serif">
          {renderInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-xl font-medium text-white tracking-tight pt-4 pb-1 font-serif border-b border-[#27292A]">
          {renderInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith('• ') || line.startsWith('- ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2.5 pl-2 leading-relaxed">
          <span className="text-[#20B8CD] mt-1 text-xs">•</span>
          <span className="flex-1 text-[#DCDEDD]">{renderInline(line.slice(2))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <div key={i} className="flex items-start gap-2.5 pl-2 leading-relaxed">
          <span className="text-[#20B8CD] font-mono text-xs mt-0.5">{line.match(/^\d+\./)?.[0]}</span>
          <span className="flex-1 text-[#DCDEDD]">{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
    } else if (line.length > 0) {
      elements.push(
        <p key={i} className="leading-relaxed text-[#DCDEDD] text-[14.5px]">
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

export const ChatWorkbench: React.FC<ChatWorkbenchProps> = ({ 
  onExecutePrompt,
  activeView = 'answer'
}) => {
  const { 
    messages, 
    isProcessing, 
    attachedFiles, 
    attachFile, 
    removeAttachedFile, 
    clearAttachments,
    activeTask,
    isBottomPanelOpen,
    setBottomPanelOpen,
    selectedModel,
    setSelectedModel,
    setSettingsOpen,
    setSettingsTab
  } = useWorkbenchStore();

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedFocus, setSelectedFocus] = useState('All');
  const [isFocusOpen, setIsFocusOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isStepsExpanded, setIsStepsExpanded] = useState(false);
  const [expandedUserMessage, setExpandedUserMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Handle file selection with automatic background scrubbing
  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      attachFile(file.name);
      try {
        await api.cleanFileMetadata(file.name, file);
      } catch (err) {
        // Silent local fallback
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isProcessing) return;
    
    // If no model is selected, prompt user or open Settings
    if (!selectedModel) {
      setSettingsOpen(true);
      setSettingsTab('models');
      return;
    }

    const promptToSend = inputPrompt;
    const filesToSend = [...attachedFiles];
    setInputPrompt('');
    clearAttachments();
    onExecutePrompt(promptToSend, filesToSend);
  };

  // General-purpose productivity prompt cards
  const quickPrompts = [
    {
      title: 'Analyze & Summarize Documents',
      prompt: 'Analyze the attached document, extract all critical findings, summarize key takeaways, and format actionable next steps into a clean priority table.',
      desc: 'Local text extraction & structured action plan',
      icon: FileText
    },
    {
      title: 'Code Sandbox & Analytics',
      prompt: 'Write and execute a Python script inside the isolated local sandbox to compute summary statistics, analyze distributions, and report key insights.',
      desc: 'Sandboxed Python execution with zero external network',
      icon: FileCode
    },
    {
      title: 'Vision & Engineering Diagrams',
      prompt: 'Perform visual inspection on the provided technical drawing or schematic, identify component tags, and describe the piping/flow connections.',
      desc: 'Multimodal vision for drawings and P&ID schematics',
      icon: FileSpreadsheet
    },
    {
      title: 'Air-Gapped Knowledge Search',
      prompt: 'Search the local indexed documentation and standard operating procedures to verify operational guidelines and safety thresholds.',
      desc: 'Sub-millisecond local vector RAG search',
      icon: Globe
    }
  ];

  return (
    <div className="h-full flex flex-col bg-[#191A1A] font-sans text-sm overflow-hidden relative">
      {/* 1. CHAT MESSAGES STREAM (Full width scroll container, scrollbar on right-most edge) */}
      <div className="flex-1 overflow-y-auto w-full">
        {/* =======================================================
            A. EMPTY STATE / LANDING PAGE 
            Matching WhatsApp Image 2026-09-04 at 8.50.46 PM.jpeg
            ======================================================= */}
        {messages.length === 0 ? (
          <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 max-w-3xl w-full mx-auto space-y-7 py-12">
            {/* Title Block */}
            <div className="text-center space-y-2 select-none">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#858A8E]">
                Search
              </span>
              <h1 className="text-3xl sm:text-4xl text-[#F3F3EE] font-serif font-normal tracking-tight">
                What do you want to know?
              </h1>
            </div>

            {/* The Iconic Perplexity Search Box Card */}
            <div className="w-full bg-[#202222] border border-[#2E3133] rounded-2xl p-3.5 shadow-2xl space-y-3 transition-all focus-within:border-[#3D4143]">
              {/* Attached file pills inside search card */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 px-1 pb-1">
                  {attachedFiles.map((file, idx) => (
                    <div 
                      key={idx} 
                      className="px-2.5 py-1 rounded-lg bg-[#27292A] border border-[#323638] flex items-center gap-1.5 text-xs text-[#CCCCCC]"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-[#20B8CD]" />
                      <span className="font-mono text-white text-[11.5px]">{file.split('/').pop()}</span>
                      <button 
                        type="button" 
                        onClick={() => removeAttachedFile(file)}
                        className="text-[#858A8E] hover:text-white p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Main Input Field */}
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Type / for search modes"
                rows={3}
                className="w-full bg-transparent px-2 text-[15px] text-[#F3F3EE] placeholder-[#5F6467] outline-none resize-none leading-relaxed"
                autoFocus
              />

              {/* Bottom Search Controls Row */}
              <div className="flex items-center justify-between pt-1 border-t border-[#27292A] text-xs">
                {/* Left Controls: Attach (+), Search Focus pill, Computer pill */}
                <div className="flex items-center gap-2">
                  {/* File Upload Button (+) */}
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
                    title="Attach files or datasets"
                    className="p-1.5 rounded-lg hover:bg-[#282A2C] text-[#858A8E] hover:text-white transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* Search Focus Pill (e.g. Search v) */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsFocusOpen(!isFocusOpen)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1C1D1E] hover:bg-[#262829] border border-[#2E3133] text-[#A2A8AB] hover:text-white font-medium text-xs transition-colors cursor-pointer"
                    >
                      <Globe className="w-3 h-3 text-[#20B8CD]" />
                      <span>Search</span>
                      <ChevronDown className="w-3 h-3 text-[#858A8E]" />
                    </button>

                    {isFocusOpen && (
                      <div className="absolute left-0 mt-1.5 w-44 bg-[#1C1D1E] border border-[#2E3133] rounded-xl p-1.5 shadow-2xl z-40 text-xs space-y-0.5">
                        {['All', 'Academic', 'Writing', 'Computational'].map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => {
                              setSelectedFocus(f);
                              setIsFocusOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#262829] text-[#A2A8AB] hover:text-white transition-colors"
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Computer Pill (Terminal Execution) */}
                  <button
                    type="button"
                    onClick={() => setBottomPanelOpen(!isBottomPanelOpen)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                      isBottomPanelOpen
                        ? 'bg-[#20B8CD]/15 border-[#20B8CD] text-[#20B8CD]'
                        : 'bg-[#1C1D1E] hover:bg-[#262829] border-[#2E3133] text-[#A2A8AB] hover:text-white'
                    }`}
                  >
                    <TerminalIcon className="w-3 h-3" />
                    <span>Computer</span>
                  </button>
                </div>

                {/* Right Controls: Model dropdown, Mic, Submit Button */}
                <div className="flex items-center gap-2">
                  {/* Model Selector Dropdown */}
                  <div className="relative">
                    {selectedModel ? (
                      <button
                        type="button"
                        onClick={() => setIsModelOpen(!isModelOpen)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[#262829] text-[#A2A8AB] hover:text-white transition-colors cursor-pointer text-xs font-mono"
                      >
                        <Cpu className="w-3 h-3 text-[#20B8CD]" />
                        <span>{selectedModel}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSettingsOpen(true);
                          setSettingsTab('models');
                        }}
                        title="No model selected - Click to select in Settings"
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[#E58888] bg-[#292020] hover:bg-[#352525] border border-[#522929] hover:border-[#7A3F3F] transition-colors cursor-pointer text-xs font-mono"
                      >
                        <AlertCircle className="w-3 h-3 text-[#E58888]" />
                        <span>No model selected</span>
                      </button>
                    )}

                    {isModelOpen && (
                      <div className="absolute right-0 bottom-8 w-56 bg-[#1C1D1E] border border-[#2E3133] rounded-xl p-1.5 shadow-2xl z-40 text-xs space-y-0.5 font-mono">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedModel(null);
                            setIsModelOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#262829] text-[#E58888] hover:text-[#FFA0A0] transition-colors flex items-center justify-between"
                        >
                          <span>No model selected</span>
                          {selectedModel === null && <Check className="w-3 h-3 text-[#E58888]" />}
                        </button>

                        <div className="h-px bg-[#262829] my-1" />

                        {['Qwen3-14B', 'Qwen2.5-Coder-7B', 'Qwen3-VL-8B'].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              setSelectedModel(m);
                              setIsModelOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#262829] text-[#A2A8AB] hover:text-white transition-colors flex items-center justify-between"
                          >
                            <span>{m}</span>
                            {selectedModel === m && <Check className="w-3 h-3 text-[#20B8CD]" />}
                          </button>
                        ))}

                        <div className="h-px bg-[#262829] my-1" />

                        <button
                          type="button"
                          onClick={() => {
                            setIsModelOpen(false);
                            setSettingsOpen(true);
                            setSettingsTab('models');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#262829] text-[#20B8CD] hover:text-white transition-colors text-[11px]"
                        >
                          Open Settings...
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Microphone Icon */}
                  <button
                    type="button"
                    title="Voice input"
                    className="p-1.5 rounded-lg hover:bg-[#282A2C] text-[#858A8E] hover:text-white transition-colors cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Circular Send Button (Perplexity Audio Wave / Submit Pill) */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isProcessing || !inputPrompt.trim()}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow ${
                      inputPrompt.trim() && !isProcessing
                        ? 'bg-white text-black hover:bg-[#E0E0E0]'
                        : 'bg-[#2E3133] text-[#5F6467] cursor-not-allowed'
                    }`}
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Productivity Starters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-2">
              {quickPrompts.map((qp, idx) => {
                const Icon = qp.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputPrompt(qp.prompt);
                    }}
                    className="p-3.5 rounded-2xl bg-[#1C1D1E] hover:bg-[#222425] border border-[#27292A] hover:border-[#323638] text-left transition-all flex items-start gap-3 group cursor-pointer shadow-sm"
                  >
                    <Icon className="w-4 h-4 text-[#20B8CD] flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#D1D5DB] group-hover:text-white leading-snug">
                        {qp.title}
                      </div>
                      <div className="text-[11px] text-[#5F6467] mt-1 line-clamp-1 leading-snug">
                        {qp.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* =======================================================
             B. ACTIVE ANSWER & CONVERSATION VIEW 
             Matching 1image.png and image.png
             ======================================================= */
          <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-4">
                {/* 1. USER QUERY CARD (Rounded dark box with Read More) */}
                {msg.sender === 'user' ? (
                  <div className="max-w-3xl bg-[#202222] border border-[#2E3133] rounded-2xl p-4 sm:p-5 text-[#E6E6E6] space-y-2 shadow-sm">
                    {/* Attached files strip */}
                    {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 pb-1">
                        {msg.attachedFiles.map((file, idx) => (
                          <span 
                            key={idx} 
                            className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#191A1A] text-[#20B8CD] border border-[#2E3133] flex items-center gap-1.5"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>{file.split('/').pop()}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Query text with optional read more */}
                    <div className="text-[14.5px] leading-relaxed text-[#F3F3EE] whitespace-pre-wrap">
                      {msg.text.length > 300 && !expandedUserMessage ? (
                        <>
                          {msg.text.slice(0, 280)}...
                          <button 
                            onClick={() => setExpandedUserMessage(true)}
                            className="block text-xs text-[#858A8E] hover:text-white mt-1 cursor-pointer font-medium"
                          >
                            Read more &or;
                          </button>
                        </>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                ) : (
                  /* 2. ASSISTANT ANSWER WITH TWO-COLUMN SOURCES LAYOUT */
                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Main Content Column */}
                    <div className="flex-1 min-w-0 space-y-5">
                      {/* Collapsible Steps Disclosure: "Finished 3 steps >" */}
                      {msg.task && (
                        <div className="border-b border-[#242627] pb-3">
                          <button
                            onClick={() => setIsStepsExpanded(!isStepsExpanded)}
                            className="flex items-center gap-1.5 text-xs text-[#858A8E] hover:text-white transition-colors cursor-pointer font-medium"
                          >
                            <span>Finished {msg.task.plan.length} steps</span>
                            {isStepsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>

                          {/* Expanded Step Traces */}
                          {isStepsExpanded && (
                            <div className="mt-2.5 p-3 rounded-xl bg-[#1C1D1E] border border-[#27292A] space-y-2 text-xs font-mono">
                              {msg.task.plan.map((step) => (
                                <div key={step.step_id} className="flex items-center justify-between text-[#858A8E] text-[11px]">
                                  <div className="flex items-center gap-2">
                                    <Check className="w-3 h-3 text-[#20B8CD]" />
                                    <span className="text-white">{step.title}</span>
                                  </div>
                                  <span className="text-[#5F6467]">{step.duration_ms}ms</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Assistant Headline in Editorial Serif Typography */}
                      <div className="font-serif text-2xl sm:text-3xl font-normal text-[#F3F3EE] tracking-tight leading-snug">
                        {activeTask?.task_type || 'Sovereign Industrial AI Workbench'}
                      </div>

                      {/* Main Response Text with Markdown Rendering */}
                      <div className="space-y-4 text-[14.5px] leading-relaxed text-[#D1D5DB] select-text">
                        {renderFormattedMessage(msg.text)}
                      </div>

                      {/* Pro Preview Banner (Matching 1image.png) */}
                      <div className="p-3 rounded-xl bg-[#1C1D1E] border border-[#27292A] flex items-center justify-between text-xs text-[#A2A8AB]">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-[#20B8CD]/15 text-[#20B8CD] font-bold text-[10px] uppercase font-mono">
                            Local
                          </span>
                          <span>Air-gapped on-premise inference active. All weights resident in RAM.</span>
                        </div>
                        <button 
                          onClick={() => setBottomPanelOpen(true)}
                          className="px-2.5 py-1 rounded-lg bg-[#252829] hover:bg-[#2F3335] text-white text-xs font-medium cursor-pointer"
                        >
                          Inspect terminal
                        </button>
                      </div>

                      {/* Inline Generated Deliverables */}
                      {msg.artifacts && msg.artifacts.length > 0 && (
                        <div className="pt-2 border-t border-[#242627] space-y-2">
                          <span className="text-xs font-mono uppercase text-[#20B8CD] font-semibold block">
                            Generated Deliverables:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {msg.artifacts.map((art) => (
                              <div key={art.artifact_id} className="p-3 rounded-xl bg-[#1C1D1E] border border-[#27292A] flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 truncate">
                                  <div className="w-7 h-7 rounded-lg bg-[#20B8CD]/10 border border-[#20B8CD]/30 flex items-center justify-center font-bold text-[#20B8CD] text-[10px] uppercase font-mono">
                                    {art.file_type}
                                  </div>
                                  <div className="truncate">
                                    <div className="text-xs font-semibold text-white truncate">{art.file_name}</div>
                                    <div className="text-[10px] text-[#858A8E] font-mono">{(art.size_bytes / 1024).toFixed(1)} KB</div>
                                  </div>
                                </div>

                                <a
                                  href={art.file_path}
                                  download
                                  className="px-3 py-1.5 rounded-lg bg-[#252829] hover:bg-[#2E3234] border border-[#3A3E40] text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all flex-shrink-0"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right-Side Sources Pane (Matching 1image.png) */}
                    <SourcesPane 
                      sources={msg.citations?.map((c, i) => ({
                        id: `cite-${i}`,
                        source_file: c?.source_file || 'Document',
                        domain: (c?.source_file || 'source').split('/').pop()?.split('.').slice(0, -1).join('.') || 'source',
                        page_number: c?.page_number,
                        snippet: c?.snippet || '',
                        relevance_score: c?.relevance_score || 1.0
                      }))}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="max-w-md bg-[#202222] border border-[#2E3133] rounded-2xl p-4 flex items-center gap-3 text-xs text-[#CCCCCC] shadow-sm">
                <div className="w-4 h-4 border-2 border-[#20B8CD] border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                <span className="font-serif">Searching local knowledge &amp; synthesizing answer...</span>
              </div>
            )}

            <div ref={messagesEndRef} className="h-24" />
          </div>
        )}
      </div>

      {/* =======================================================
          C. BOTTOM FLOATING COMPOSER DOCK
          Matching 1image.png and image.png
          ======================================================= */}
      {messages.length > 0 && (
        <div className="p-4 bg-gradient-to-t from-[#191A1A] via-[#191A1A]/95 to-transparent flex-shrink-0 z-10">
          <form onSubmit={handleSubmit} className="max-w-3xl w-full mx-auto">
            <div className="bg-[#202222] border border-[#2E3133] rounded-2xl p-2.5 shadow-2xl space-y-2 focus-within:border-[#3D4143] transition-all">
              {/* Attached file chips above follow-up input */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 px-1">
                  {attachedFiles.map((file, idx) => (
                    <div 
                      key={idx} 
                      className="px-2.5 py-1 rounded-lg bg-[#27292A] border border-[#323638] flex items-center gap-1.5 text-xs text-[#CCCCCC]"
                    >
                      <Paperclip className="w-3 h-3 text-[#20B8CD]" />
                      <span className="font-mono text-white text-[11px]">{file.split('/').pop()}</span>
                      <button 
                        type="button" 
                        onClick={() => removeAttachedFile(file)}
                        className="text-[#858A8E] hover:text-white p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Follow-up input row */}
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask a follow-up"
                className="w-full bg-transparent px-2 py-1 text-sm text-[#F3F3EE] placeholder-[#5F6467] outline-none"
              />

              {/* Controls bar inside follow-up card */}
              <div className="flex items-center justify-between pt-1 border-t border-[#27292A] text-xs">
                <div className="flex items-center gap-2">
                  {/* File attach (+) */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach files"
                    className="p-1 rounded-lg hover:bg-[#282A2C] text-[#858A8E] hover:text-white transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* Search pill */}
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1C1D1E] border border-[#2E3133] text-[#A2A8AB] text-[11px]">
                    <Globe className="w-3 h-3 text-[#20B8CD]" />
                    <span>Search</span>
                  </div>

                  {/* Computer pill */}
                  <button
                    type="button"
                    onClick={() => setBottomPanelOpen(!isBottomPanelOpen)}
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] transition-colors cursor-pointer border ${
                      isBottomPanelOpen
                        ? 'bg-[#20B8CD]/15 border-[#20B8CD] text-[#20B8CD]'
                        : 'bg-[#1C1D1E] hover:bg-[#262829] border-[#2E3133] text-[#A2A8AB]'
                    }`}
                  >
                    <TerminalIcon className="w-3 h-3" />
                    <span>Computer</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsOpen(true);
                      setSettingsTab('models');
                    }}
                    title="Click to configure model in Settings"
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                      selectedModel 
                        ? 'text-[#858A8E] hover:text-white border-[#2A2C2E] bg-[#1C1D1E]' 
                        : 'text-[#E58888] border-[#522929] bg-[#292020]'
                    }`}
                  >
                    Model: {selectedModel || 'No model selected'}
                  </button>

                  <button
                    type="button"
                    title="Voice input"
                    className="p-1 text-[#858A8E] hover:text-white transition-colors"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="submit"
                    disabled={isProcessing || !inputPrompt.trim()}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow ${
                      inputPrompt.trim() && !isProcessing
                        ? 'bg-white text-black hover:bg-[#E0E0E0]'
                        : 'bg-[#2E3133] text-[#5F6467] cursor-not-allowed'
                    }`}
                  >
                    <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
