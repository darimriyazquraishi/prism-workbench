import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  ChevronDown, 
  ShieldCheck, 
  Sparkles,
  Send,
  AlertTriangle,
  Search,
  Mic,
  Monitor,
  Plus,
  Layers,
  Download,
  Cpu,
  Terminal,
  Play,
  X,
  Check,
  Code,
  Calculator,
  BookOpen,
  FileCode,
  User
} from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';
import { PlanApprovalCard } from '../agent/PlanApprovalCard';
import { LivePipelineTelemetryPanel } from '../antigravity/LivePipelineTelemetryPanel';

export const MainWorkspaceView: React.FC = () => {
  const { 
    activeTaskStarted, 
    setActiveTaskStarted, 
    isRightPaneOpen, 
    toggleRightPane,
    activeProposedPlan,
    proposePlanForTask,
    approveProposedPlan,
    rejectProposedPlan,
    sessions,
    activeSessionId,
    attachedFiles,
    attachFile,
    removeAttachedFile,
    uploadedFiles,
    addUploadedFiles,
    removeUploadedFile,
    activeDocumentContext,
    setActiveDocumentContext,
    isComputerAccessEnabled,
    toggleComputerAccess,
    setNetworkModalOpen,
    isExecuting,
    selectedModel
  } = useAntigravityStore();

  const [promptText, setPromptText] = useState('');
  const [followUpText, setFollowUpText] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showDocSelector, setShowDocSelector] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const sessionSteps = activeSession ? activeSession.steps : [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessionSteps.length, activeProposedPlan]);

  // Speech recognition handler
  const handleMicClick = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPromptText(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      setPromptText('Run API 570 remaining life calculation on Line 04-CR-102');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addUploadedFiles(e.target.files);
      e.target.value = '';
    }
  };

  const slashCommands = [
    { cmd: '/inspect', label: 'Run API 570 Wall Thickness Survey Audit', icon: ShieldCheck, prompt: 'Read attached inspection files and evaluate API 570 corrosion limits' },
    { cmd: '/calculate', label: 'Execute Remaining Life & Degradation Math', icon: Calculator, prompt: 'Calculate corrosion rate and safe operating life for Line 04-CR-102' },
    { cmd: '/model', label: 'Switch Primary Local Inference Engine', icon: Cpu, prompt: 'Switch active model router to Qwen2.5-Coder-7B' },
    { cmd: '/sop', label: 'Query SOP-OPS-014 Operating Standards', icon: BookOpen, prompt: 'Search local ChromaDB for SOP-OPS-014 retirement threshold limit' },
    { cmd: '/export', label: 'Compile Formal Word (.docx) Approval Note', icon: FileCode, prompt: 'Compile formal approval note report to Generated/ folder' }
  ];

  return (
    <div className="flex-1 flex overflow-hidden bg-[var(--bg-base)] font-sans text-xs text-[var(--text-primary)]">
      {/* Central Pane: Agent Chat & Task Execution */}
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--bg-base)] border-r border-[var(--border-subtle)]">
        {/* Permanently mounted hidden file input element */}
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
        />

        {/* Core Agent Chat & Task Execution Interface */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!activeTaskStarted ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-3xl mx-auto w-full">
              <div className="flex flex-col items-center mb-6">
                <div className="flex items-center justify-center mb-6">
                  <img src="/lumi-logo-horizontal.jpeg" alt="Lumi Logo" className="h-64 object-contain mix-blend-screen opacity-90" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-normal text-[var(--text-primary)] tracking-tight">What do you want to accomplish?</h1>
              </div>
              
              {/* Central Input Box */}
              <div className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-sm focus-within:border-[var(--text-secondary)] transition-colors relative">
                {/* Attached File Pills */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-2 pb-2 border-b border-[var(--border-subtle)]">
                    {attachedFiles.map((file) => (
                      <div key={file} className="flex items-center gap-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-md text-[11px] font-mono text-[var(--text-primary)]">
                        <FileText className="w-3 h-3 text-[var(--accent-primary)]" />
                        <span className="truncate max-w-[150px]">{file}</span>
                        <button 
                          onClick={() => removeAttachedFile(file)}
                          className="p-0.5 hover:text-rose-400 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Slash Commands Dropdown */}
                {showSlashMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-2 z-50 space-y-1 font-sans">
                    <div className="text-[10px] font-bold text-[var(--text-secondary)] px-2 py-1 font-mono uppercase">Quick Slash Commands</div>
                    {slashCommands.map((sc) => {
                      const IconComponent = sc.icon;
                      return (
                        <div 
                          key={sc.cmd}
                          onClick={() => {
                            setPromptText(sc.prompt);
                            setShowSlashMenu(false);
                          }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-elevated)] cursor-pointer text-xs group transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4 text-[var(--accent-primary)]" />
                            <span className="font-mono font-bold text-[var(--text-primary)]">{sc.cmd}</span>
                            <span className="text-[var(--text-secondary)] truncate">{sc.label}</span>
                          </div>
                          <span className="text-[10px] text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Document Selector Popover */}
                {showDocSelector && (
                  <div className="absolute bottom-full left-12 mb-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-xl p-2 z-50 w-64 space-y-1 text-xs">
                    <div className="text-[10px] font-bold text-[var(--text-secondary)] px-2 py-1 font-mono uppercase">Select Scoping Context</div>
                    {uploadedFiles.length === 0 ? (
                      <div 
                        onClick={() => {
                          setShowDocSelector(false);
                          fileInputRef.current?.click();
                        }}
                        className="p-3 text-center cursor-pointer hover:bg-[var(--bg-elevated)] rounded-lg text-[var(--text-secondary)]"
                      >
                        <p className="text-xs font-medium">No uploaded documents</p>
                        <p className="text-[10px] text-[var(--accent-primary)] mt-1">+ Click to upload file</p>
                      </div>
                    ) : (
                      uploadedFiles.map((f) => f.name).map((doc) => (
                        <div 
                          key={doc}
                          onClick={() => {
                            setActiveDocumentContext(doc);
                            setShowDocSelector(false);
                          }}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            activeDocumentContext === doc ? 'bg-[var(--bg-elevated)] font-bold text-[var(--accent-primary)]' : 'hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                          }`}
                        >
                          <span className="truncate">{doc}</span>
                          {activeDocumentContext === doc && <Check className="w-3.5 h-3.5" />}
                        </div>
                      ))
                    )}
                  </div>
                )}

                <textarea
                  value={promptText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPromptText(val);
                    setShowSlashMenu(val.startsWith('/'));
                  }}
                  placeholder="Type / for commands, or ask your local AI to analyze documents..."
                  className="w-full bg-transparent border-none text-[15px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-tertiary)] resize-none h-14 p-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (promptText.trim()) {
                        proposePlanForTask(promptText, 'flow_a_inspection');
                        setPromptText('');
                        setShowSlashMenu(false);
                      } else {
                        proposePlanForTask('Read Inspection_Report_001.pdf, identify ultrasonic findings, compare against SOP-OPS-014, and compile Word (.docx) approval note.', 'flow_a_inspection');
                      }
                    }
                  }}
                />
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-subtle)]/50">
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload file to session context"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Attach
                    </button>

                    <button 
                      onClick={() => setShowDocSelector(!showDocSelector)}
                      title="Select active document context"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium cursor-pointer transition-colors"
                    >
                      <Search className="w-4 h-4 text-[var(--accent-primary)]" />
                      <span className="truncate max-w-[110px]">{activeDocumentContext}</span>
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>

                    <button 
                      onClick={toggleComputerAccess}
                      title={isComputerAccessEnabled ? "Local tool execution enabled (--network=none)" : "Local tool execution disabled by policy"}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors border ${
                        isComputerAccessEnabled 
                          ? 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-primary)]' 
                          : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                      }`}
                    >
                      <Monitor className={`w-4 h-4 ${isComputerAccessEnabled ? 'text-[var(--accent-success)]' : 'text-rose-400'}`} />
                      <span>Computer {isComputerAccessEnabled ? '' : '(Off)'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleMicClick}
                      title={isListening ? "Listening... Speak now" : "Speech-to-text input"}
                      className={`p-2 rounded-full transition-colors cursor-pointer ${
                        isListening ? 'bg-rose-500 text-white animate-pulse' : 'hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (promptText.trim()) {
                          proposePlanForTask(promptText, 'flow_a_inspection');
                          setPromptText('');
                          setShowSlashMenu(false);
                        }
                      }} 
                      className="p-2 rounded-full bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 cursor-pointer transition-opacity"
                      title="Submit Task Query"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex items-center gap-4 text-xs text-[var(--text-secondary)] opacity-80">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[var(--accent-success)]" /> 100% On-Premise Local</span>
                <span className="w-1 h-1 rounded-full bg-[var(--border-subtle)]"></span>
                <span>Qwen3-8B &amp; Qwen2.5-VL Local Engines</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Scrollable Conversation Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {sessionSteps.map((step) => {
                  if (step.type === 'user_input') {
                    return (
                      <div key={step.id} className="max-w-4xl mx-auto w-full flex items-start gap-3 pt-2">
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] shadow-sm">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-1.5 border-b border-[var(--border-subtle)] pb-1.5">
                            <span className="font-semibold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                              User Input Directive
                            </span>
                            <span className="font-mono text-[10px] text-[var(--text-tertiary)]">{step.timestamp}</span>
                          </div>
                          <div className="text-sm text-[var(--text-primary)] font-sans leading-relaxed">{step.content}</div>
                        </div>
                      </div>
                    );
                  }

                  if (step.type === 'chatbot_routing') {
                    return (
                      <div key={step.id} className="max-w-4xl mx-auto w-full flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-950/60 border border-blue-500/40 flex items-center justify-center font-bold text-xs text-blue-400 shadow-sm">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex-1 bg-blue-950/20 border border-blue-800/30 rounded-xl p-4 shadow-sm space-y-2">
                          <div className="flex items-center justify-between border-b border-blue-800/30 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-blue-300">Qwen2.5-3B-Instruct</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/50 text-blue-200 border border-blue-700/40">
                                FRONT-FACING CHATBOT &amp; INTENT ROUTER
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-blue-400">{step.timestamp}</span>
                          </div>
                          <div className="text-xs text-[var(--text-primary)] whitespace-pre-line leading-relaxed font-sans">
                            {step.content}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (step.type === 'plan_proposed') {
                    const isCurrentActive = activeProposedPlan && activeProposedPlan.id === step.proposedPlan?.id;
                    const planToRender = isCurrentActive ? activeProposedPlan : step.proposedPlan;

                    if (!planToRender) return null;

                    if (planToRender.userDecision === 'pending' && activeProposedPlan) {
                      return (
                        <div key={step.id} className="max-w-4xl mx-auto w-full">
                          <PlanApprovalCard 
                            plan={activeProposedPlan}
                            onApprove={(plan) => approveProposedPlan(plan)}
                            onReject={(feedback) => rejectProposedPlan(feedback)}
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={step.id} className="max-w-4xl mx-auto w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3.5 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[var(--accent-success)]" />
                            <span className="font-semibold text-[var(--text-primary)]">
                              Workplan Evaluation ({planToRender.classifiedTaskType})
                            </span>
                          </div>
                          <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase border ${
                            planToRender.userDecision === 'approved' || planToRender.userDecision === 'edited'
                              ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/40'
                              : 'bg-red-950/50 text-red-400 border-red-800/40'
                          }`}>
                            {planToRender.userDecision}
                          </span>
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] font-mono">
                          Model: {planToRender.primaryModel} | Steps: {planToRender.steps.length} | Deliverables: {planToRender.expectedDeliverables.join(', ')}
                        </div>
                      </div>
                    );
                  }

                  if (step.type === 'rejection_feedback') {
                    return (
                      <div key={step.id} className="max-w-4xl mx-auto w-full bg-red-950/20 border border-red-800/30 rounded-xl p-3.5 space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-red-300">
                          <span>User Revision Feedback</span>
                          <span className="font-mono text-[10px] text-red-400">{step.timestamp}</span>
                        </div>
                        <div className="text-xs text-[var(--text-primary)] font-sans">{step.content}</div>
                      </div>
                    );
                  }

                  if (step.type === 'thought') {
                    return (
                      <div key={step.id} className="max-w-4xl mx-auto w-full flex items-center gap-2 py-1 px-2 text-xs font-mono text-[var(--text-secondary)]">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse"></span>
                        <span className="font-semibold text-[var(--text-primary)]">{step.title || 'Agent Thought'}:</span>
                        <span>{step.content}</span>
                      </div>
                    );
                  }

                  if (step.type === 'tool_call') {
                    return (
                      <div key={step.id} className="max-w-4xl mx-auto w-full p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                          <span className="font-bold text-[var(--text-primary)]">{step.toolName}</span>
                          <span className="text-[var(--text-secondary)] truncate max-w-md">{step.toolArgs?.description}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${step.status === 'success' ? 'text-[var(--accent-success)] bg-emerald-950/30' : 'text-amber-400 bg-amber-950/30'}`}>
                          {step.status === 'success' ? '✓ Executed (Zero Egress)' : 'Running...'}
                        </span>
                      </div>
                    );
                  }

                  if (step.type === 'response') {
                    return (
                      <div key={step.id} className="max-w-4xl mx-auto w-full flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center shadow-sm">
                          <img src="/favicon.svg" alt="Lumi" className="w-5 h-5" />
                        </div>
                        <div className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm space-y-4 font-sans text-xs">
                          <div className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center justify-between">
                            <span>{step.artifacts && step.artifacts.length > 0 ? 'Task Execution Deliverables & Output' : 'Lumi Assistant'}</span>
                            <span className="font-mono text-[10px] text-[var(--text-secondary)]">{step.timestamp}</span>
                          </div>
                          <div className="text-sm leading-relaxed text-[var(--text-primary)] whitespace-pre-line font-sans">
                            {step.content}
                          </div>

                          {step.citations && step.citations.length > 0 && (
                            <div className="p-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg space-y-1 font-mono text-[11px]">
                              <div className="font-bold text-[var(--text-secondary)] uppercase">Grounding Provenance</div>
                              {step.citations.map((c, i) => (
                                <div key={i} className="text-[var(--text-primary)]">
                                  • <span className="text-[var(--accent-primary)] font-bold">{c.source}</span> {c.page ? `(Page ${c.page})` : ''}: "{c.snippet}"
                                </div>
                              ))}
                            </div>
                          )}

                          {step.artifacts && step.artifacts.length > 0 && (
                            <div className="pt-2">
                              <div className="text-[10px] uppercase font-mono font-bold text-[var(--text-secondary)] mb-2">Generated Workspace Files</div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {step.artifacts.map((art) => (
                                  <div key={art.id} className="p-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
                                    <div className="flex items-center gap-2 truncate">
                                      <FileText className="w-4 h-4 text-[var(--accent-primary)]" />
                                      <div className="truncate">
                                        <div className="font-semibold text-xs text-[var(--text-primary)] truncate">{art.name}</div>
                                        <div className="text-[9px] font-mono text-[var(--text-tertiary)]">{art.path}</div>
                                      </div>
                                    </div>
                                    <a 
                                      href={art.downloadUrl || `/static/artifacts/${art.name}`}
                                      download={art.name}
                                      className="px-2.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-primary)] hover:border-[var(--accent-primary)] cursor-pointer font-mono flex items-center gap-1"
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
                      </div>
                    );
                  }

                  return null;
                })}

                {isExecuting && (
                  <div className="max-w-4xl mx-auto w-full flex items-center gap-3 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl animate-pulse font-mono text-xs text-[var(--text-secondary)]">
                    <div className="w-6 h-6 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0 border border-[var(--border-subtle)]">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)] animate-spin" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {selectedModel ? selectedModel : 'Local Reasoning Engine'}
                      </span>
                      <span>generating response...</span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Bottom Input Section */}
              <div className="p-4 bg-[var(--bg-base)] border-t border-[var(--border-subtle)]">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-2 shadow-sm focus-within:border-[var(--text-secondary)] transition-colors">
                    {/* Attached File Pills */}
                    {attachedFiles.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mb-2 pb-2 border-b border-[var(--border-subtle)]">
                        {attachedFiles.map((file) => (
                          <div key={file} className="flex items-center gap-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-md text-[11px] font-mono text-[var(--text-primary)]">
                            <FileText className="w-3 h-3 text-[var(--accent-primary)]" />
                            <span className="truncate max-w-[150px]">{file}</span>
                            <button 
                              onClick={() => removeAttachedFile(file)}
                              className="p-0.5 hover:text-rose-400 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <textarea
                      value={followUpText}
                      onChange={(e) => setFollowUpText(e.target.value)}
                      placeholder="Ask a follow-up or provide next instructions..."
                      className="w-full bg-transparent border-none text-[14px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-tertiary)] resize-none h-12 p-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (followUpText.trim()) {
                            proposePlanForTask(followUpText.trim());
                            setFollowUpText('');
                          }
                        }
                      }}
                    />
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-[var(--border-subtle)]/50">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          title="Attach Document" 
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium cursor-pointer transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Attach
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={handleMicClick}
                          className="p-1.5 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (followUpText.trim()) {
                              proposePlanForTask(followUpText.trim());
                              setFollowUpText('');
                            }
                          }}
                          className="p-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 cursor-pointer transition-opacity"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center mt-2 text-[10px] text-[var(--text-secondary)]">
                    <span>Local Workstation · Zero External Network Traffic</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Right Pane: System Status + Tool Output */}
      <aside className={`relative transition-[width] duration-200 ease-in-out ${isRightPaneOpen ? 'w-[300px]' : 'w-0'} bg-[var(--bg-surface)] flex flex-col select-none flex-shrink-0 font-sans border-l border-[var(--border-subtle)] z-10 h-full group/rightpane`}>
        <div className="w-[300px] h-full flex flex-col overflow-hidden">
          <LivePipelineTelemetryPanel />
        </div>

        <button 
          onClick={toggleRightPane}
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded flex items-center justify-center opacity-0 group-hover/rightpane:opacity-100 transition-opacity z-20 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[10px]"
          title={isRightPaneOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isRightPaneOpen ? '›' : '‹'}
        </button>
      </aside>
    </div>
  );
};
