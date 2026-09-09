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
  User,
  Zap,
  RotateCw,
  Pencil,
  Copy,
  Square
} from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';
import { PlanApprovalCard } from '../agent/PlanApprovalCard';
import { LivePipelineTelemetryPanel } from '../antigravity/LivePipelineTelemetryPanel';
import { TaskResultView } from '../antigravity/TaskResultView';

function formatCleanText(content?: string): string {
  if (!content) return '';
  let text = content.trim();

  // If content is wrapped in or is a JSON string, try to parse it
  if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === 'string') {
        text = parsed;
      } else if (parsed.response) {
        text = parsed.response;
      } else if (parsed.answer) {
        text = parsed.answer;
      } else if (parsed.content) {
        text = parsed.content;
      } else if (parsed.summary) {
        text = parsed.summary;
      } else if (parsed.message) {
        text = parsed.message;
      } else if (parsed.final_answer) {
        text = parsed.final_answer;
      } else {
        text = Object.entries(parsed)
          .map(([k, v]) => `• ${k.replace(/_/g, ' ')}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
          .join('\n');
      }
    } catch {
      // Not parseable, proceed with raw text
    }
  }

  // Strip excessive markdown wrapping quotes if present
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    try {
      const inner = JSON.parse(text);
      if (typeof inner === 'string') text = inner;
      else if (inner.answer) text = inner.answer;
      else if (inner.response) text = inner.response;
      else if (inner.summary) text = inner.summary;
    } catch {}
  }

  return text;
}

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
    clearAttachments,
    uploadedFiles,
    addUploadedFiles,
    removeUploadedFile,
    activeDocumentContext,
    setActiveDocumentContext,
    isComputerAccessEnabled,
    toggleComputerAccess,
    setNetworkModalOpen,
    isExecuting,
    stopExecution,
    selectedModel,
    selectedGeneralModel,
    isThinkHarderMode,
    toggleThinkHarderMode,
    regenerateResponse,
    editUserMessageAndRegenerate,
    selectedImageModel,
    setSelectedImageModel,
    generateImageTask,
    setActivePreviewArtifact
  } = useAntigravityStore();

  const [isCreateImageMode, setIsCreateImageMode] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [followUpText, setFollowUpText] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showDocSelector, setShowDocSelector] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [copiedStepId, setCopiedStepId] = useState<string | null>(null);
  const [regeneratingStepId, setRegeneratingStepId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleCopy = async (stepId: string, text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(formatCleanText(text));
      setCopiedStepId(stepId);
      setTimeout(() => setCopiedStepId(null), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const startEditing = (step: any) => {
    setEditingStepId(step.id);
    setEditingText(step.content || '');
  };

  const cancelEditing = () => {
    setEditingStepId(null);
    setEditingText('');
  };

  const saveAndRegenerateEdit = async (stepId: string) => {
    if (!editingText.trim() || isExecuting) return;
    const newContent = editingText.trim();
    setEditingStepId(null);
    setEditingText('');
    await editUserMessageAndRegenerate(stepId, newContent);
  };

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
    { cmd: '/image', label: 'Create Image with FLUX / SDXL', icon: Sparkles, prompt: 'Create image: ' },
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
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-primary)] font-semibold flex items-center gap-1 mr-1">
                      <span>📄</span> Attached Context:
                    </span>
                    {attachedFiles.map((file) => (
                      <div key={file} className="flex items-center gap-1.5 bg-[var(--bg-elevated)] border border-[var(--accent-primary)]/30 px-2 py-0.5 rounded-md text-[11px] font-mono text-[var(--text-primary)] shadow-sm">
                        <FileText className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                        <span className="truncate max-w-[180px] font-medium">{file}</span>
                        <button 
                          type="button"
                          onClick={() => removeAttachedFile(file)}
                          className="p-0.5 hover:text-rose-400 cursor-pointer rounded transition-colors"
                          title="Remove attached file"
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

                {/* Create Image Model Selector Banner */}
                {isCreateImageMode && (
                  <div className="mb-2 p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)] animate-pulse" />
                      <span className="font-semibold text-[var(--text-primary)]">Create Image</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[var(--text-secondary)] font-mono">Model:</span>
                      <select
                        value={selectedImageModel}
                        onChange={(e) => setSelectedImageModel(e.target.value)}
                        className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs text-[var(--text-primary)] font-mono outline-none cursor-pointer hover:border-[var(--text-secondary)]"
                      >
                        <option value="z-image-turbo">Z-Image Turbo (DiT BF16 + Qwen 3 4B)</option>
                        <option value="sdxl-lightning">SDXL-Lightning (Safetensors - Fast GPU)</option>
                        <option value="flux1-schnell">FLUX.1 [schnell] (GGUF)</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsCreateImageMode(false)}
                        className="p-1 hover:bg-[var(--bg-surface)] rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                        title="Exit Create Image mode"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                <textarea
                  value={promptText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPromptText(val);
                    setShowSlashMenu(val.startsWith('/'));
                  }}
                  placeholder={
                    isCreateImageMode
                      ? `Describe the image to generate with ${selectedImageModel === 'z-image-turbo' ? 'Z-Image Turbo' : (selectedImageModel === 'flux1-schnell' ? 'FLUX.1 [schnell]' : 'SDXL-Lightning')}...`
                      : "Type / for commands, or ask your local AI to analyze documents..."
                  }
                  className="w-full bg-transparent border-none text-[15px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-tertiary)] resize-none h-14 p-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      const toSend = promptText.trim();
                      if (toSend) {
                        if (isCreateImageMode) {
                          generateImageTask(toSend, selectedImageModel);
                        } else {
                          proposePlanForTask(toSend);
                        }
                        setPromptText('');
                        setShowSlashMenu(false);
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

                    {/* Think Harder Mode Toggle */}
                    <button 
                      type="button"
                      onClick={toggleThinkHarderMode}
                      title="Think Harder: Maximum local compute power, 32k context & deep multi-perspective chain of thought"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                        isThinkHarderMode 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold shadow-md shadow-amber-500/20 hover:opacity-95' 
                          : 'hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-subtle)]'
                      }`}
                    >
                      <Zap className={`w-3.5 h-3.5 ${isThinkHarderMode ? 'fill-black' : 'text-amber-400'}`} />
                      <span>{isThinkHarderMode ? 'Think Harder ON' : 'Think Harder'}</span>
                    </button>

                    {/* Create Image Toggle */}
                    <button 
                      type="button"
                      onClick={() => setIsCreateImageMode(prev => !prev)}
                      title="Create image with local models"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                        isCreateImageMode 
                          ? 'bg-[var(--text-primary)] text-[var(--bg-base)] font-bold shadow-md' 
                          : 'hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-subtle)]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Create Image</span>
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
                    {isExecuting ? (
                      <button
                        type="button"
                        onClick={stopExecution}
                        className="p-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition-all shadow-md flex items-center justify-center animate-pulse"
                        title="Stop Generation"
                      >
                        <Square className="w-4 h-4 fill-white" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          if (promptText.trim()) {
                            clearAttachments();
                            if (isCreateImageMode) {
                              generateImageTask(promptText.trim(), selectedImageModel);
                            } else {
                              proposePlanForTask(promptText.trim());
                            }
                            setPromptText('');
                            setShowSlashMenu(false);
                          }
                        }} 
                        className="p-2 rounded-full bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 cursor-pointer transition-opacity"
                        title={isCreateImageMode ? "Generate Image" : "Submit Task Query"}
                      >
                        {isCreateImageMode ? <Sparkles className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Scrollable Conversation Stream - Clean Centered Layout Without Avatar Gutter */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {sessionSteps.map((step) => {
                  if (step.type === 'user_input') {
                    const isEditing = editingStepId === step.id;

                    return (
                      <div key={step.id} className="max-w-3xl mx-auto w-full pt-1 group">
                        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm space-y-2 transition-all">
                          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                            <span className="font-semibold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                              User Directive
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-[var(--text-tertiary)]">{step.timestamp}</span>
                              {!isEditing && !isExecuting && (
                                <button
                                  onClick={() => startEditing(step)}
                                  title="Edit message & regenerate"
                                  className="opacity-70 group-hover:opacity-100 hover:text-[var(--accent-primary)] text-[var(--text-tertiary)] p-1 rounded hover:bg-[var(--bg-elevated)] transition-all flex items-center gap-1 text-[11px]"
                                >
                                  <Pencil className="w-3 h-3" />
                                  <span className="text-[10px] font-mono">Edit</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {step.attachedFiles && step.attachedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {step.attachedFiles.map((file) => (
                                <div key={file} className="flex items-center gap-1.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-md text-[11px] font-mono text-[var(--text-primary)] shadow-sm">
                                  <FileText className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                                  <span className="truncate max-w-[200px]">{file}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {isEditing ? (
                            <div className="space-y-2 pt-1">
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    saveAndRegenerateEdit(step.id);
                                  } else if (e.key === 'Escape') {
                                    e.preventDefault();
                                    cancelEditing();
                                  }
                                }}
                                rows={3}
                                autoFocus
                                className="w-full bg-[var(--bg-elevated)] border border-[var(--accent-primary)]/50 focus:border-[var(--accent-primary)] rounded-lg p-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] resize-y font-sans leading-relaxed"
                              />
                              <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
                                <span>Ctrl + Enter to send • Esc to cancel</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={cancelEditing}
                                    disabled={isExecuting}
                                    className="px-2.5 py-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => saveAndRegenerateEdit(step.id)}
                                    disabled={!editingText.trim() || isExecuting}
                                    className="px-3 py-1 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 disabled:opacity-50 text-white font-medium rounded-md shadow-sm transition-all flex items-center gap-1.5"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Save & Regenerate
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-[var(--text-primary)] font-sans leading-relaxed whitespace-pre-wrap">{step.content}</div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (step.type === 'chatbot_routing') {
                    return (
                      <div key={step.id} className="max-w-3xl mx-auto w-full">
                        <div className="bg-blue-950/20 border border-blue-800/30 rounded-xl p-4 shadow-sm space-y-2">
                          <div className="flex items-center justify-between border-b border-blue-800/30 pb-2">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                              <span className="font-bold text-xs text-blue-300">{selectedModel || 'General Reasoning LLM'}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/50 text-blue-200 border border-blue-700/40">
                                LOCAL ORCHESTRATOR
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-blue-400">{step.timestamp}</span>
                          </div>
                          <div className="text-xs text-[var(--text-primary)] whitespace-pre-line leading-relaxed font-sans">
                            {formatCleanText(step.content)}
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
                        <div key={step.id} className="max-w-3xl mx-auto w-full">
                          <PlanApprovalCard 
                            plan={activeProposedPlan}
                            onApprove={(plan) => approveProposedPlan(plan)}
                            onReject={(feedback) => rejectProposedPlan(feedback)}
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={step.id} className="max-w-3xl mx-auto w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3.5 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[var(--accent-success)]" />
                            <span className="font-semibold text-[var(--text-primary)]">
                              Implementation Plan ({planToRender.classifiedTaskType.replace('_', ' ')})
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
                      <div key={step.id} className="max-w-3xl mx-auto w-full bg-red-950/20 border border-red-800/30 rounded-xl p-3.5 space-y-1">
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
                      <div key={step.id} className="max-w-3xl mx-auto w-full flex items-center gap-2 py-1 px-2 text-xs font-mono text-[var(--text-secondary)]">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse"></span>
                        <span className="font-semibold text-[var(--text-primary)]">{step.title || 'Agent Thought'}:</span>
                        <span>{step.content}</span>
                      </div>
                    );
                  }

                  if (step.type === 'tool_call') {
                    const isStepError = step.status === 'error';
                    const isStepSuccess = step.status === 'success';
                    return (
                      <div key={step.id} className={`max-w-3xl mx-auto w-full p-3 rounded-xl border font-mono text-xs ${
                        isStepError 
                          ? 'bg-rose-950/20 border-rose-800/40 text-rose-300' 
                          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <Terminal className={`w-3.5 h-3.5 flex-shrink-0 ${isStepError ? 'text-rose-400' : 'text-[var(--accent-primary)]'}`} />
                            <span className="font-bold text-[var(--text-primary)]">{step.toolName}</span>
                            <span className="text-[var(--text-secondary)] truncate max-w-md">{step.toolArgs?.description}</span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium flex-shrink-0 ${
                            isStepSuccess 
                              ? 'text-[var(--accent-success)] bg-emerald-950/40 border border-emerald-800/40' 
                              : isStepError
                                ? 'text-rose-400 bg-rose-950/50 border border-rose-800/50 font-bold'
                                : 'text-amber-400 bg-amber-950/40 border border-amber-800/40 animate-pulse'
                          }`}>
                            {isStepSuccess ? '✓ Executed' : isStepError ? '✗ Failed' : 'Running...'}
                          </span>
                        </div>
                        {isStepError && (step.toolOutput?.error || step.content) && (
                          <div className="mt-2 pt-2 border-t border-rose-800/30 text-[11px] text-rose-300 font-sans">
                            {step.toolOutput?.error || step.content}
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (step.type === 'response') {
                    // Only show deliverable card if an artifact was actually generated
                    if (step.artifacts && step.artifacts.length > 0) {
                      return (
                        <div key={step.id} className="max-w-3xl mx-auto w-full">
                          <TaskResultView step={step} proposedPlan={activeProposedPlan || undefined} />
                        </div>
                      );
                    }

                    // Direct conversational response from General LLM
                    const isCurrentStreaming = isExecuting && step.id === sessionSteps[sessionSteps.length - 1]?.id;
                    const isCopied = copiedStepId === step.id;
                    const isRegenerating = isExecuting && regeneratingStepId === step.id;

                    return (
                      <div key={step.id} className="max-w-3xl mx-auto w-full group flex items-start gap-3 py-3 px-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-sans shadow-sm animate-in fade-in duration-150">
                        <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-cyan-400 font-bold shrink-0 shadow-sm">
                          L
                        </div>
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[var(--text-primary)]">LUMI</span>
                              <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{step.timestamp}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isCurrentStreaming && (
                                <button
                                  type="button"
                                  onClick={stopExecution}
                                  className="px-2 py-0.5 rounded bg-rose-600/90 hover:bg-rose-600 text-white text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                                  title="Stop generation immediately"
                                >
                                  <Square className="w-2.5 h-2.5 fill-white" />
                                  <span>Stop</span>
                                </button>
                              )}
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                Local Air-Gapped
                              </span>
                            </div>
                          </div>
                          <div className="text-[13px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap select-text font-sans">
                            {formatCleanText(step.content)}
                            {isCurrentStreaming && (
                              <span className="inline-block w-1.5 h-3.5 ml-1 bg-cyan-400 animate-pulse align-middle rounded-sm" />
                            )}
                          </div>

                          {/* Image Card Preview */}
                          {step.imageCard && (
                            <div className="my-2 border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-elevated)] shadow-md">
                              <div className="p-2.5 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded font-mono font-semibold bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30 text-[11px]">
                                    {step.imageCard.modelName}
                                  </span>
                                  <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                                    {step.imageCard.width}×{step.imageCard.height}
                                  </span>
                                  <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                                    {(step.imageCard.durationMs / 1000).toFixed(1)}s
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                                  Local Air-Gapped
                                </span>
                              </div>
                              <div 
                                className="p-2 flex items-center justify-center bg-[#0d0d10] cursor-pointer group/img relative"
                                onClick={() => {
                                  setActivePreviewArtifact({
                                    id: `art-${Date.now()}`,
                                    name: step.imageCard!.filename,
                                    type: 'png',
                                    path: step.imageCard!.path,
                                    sizeBytes: step.imageCard!.sizeBytes,
                                    description: step.imageCard!.prompt,
                                    createdAt: step.timestamp,
                                    previewUrl: step.imageCard!.rawUrl,
                                    downloadUrl: step.imageCard!.rawUrl
                                  });
                                }}
                              >
                                <img
                                  src={step.imageCard.rawUrl}
                                  alt={step.imageCard.prompt}
                                  className="max-h-[380px] w-auto max-w-full rounded-lg object-contain shadow-lg group-hover/img:scale-[1.01] transition-transform"
                                  title="Click to expand full screen preview"
                                />
                              </div>
                              <div className="px-3 py-2 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex items-center justify-between text-xs gap-2">
                                <span className="text-[11px] text-[var(--text-secondary)] italic truncate flex-1" title={step.imageCard.prompt}>
                                  "{step.imageCard.prompt}"
                                </span>
                                <div className="flex items-center gap-1.5 font-mono text-[11px] shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActivePreviewArtifact({
                                        id: `art-${Date.now()}`,
                                        name: step.imageCard!.filename,
                                        type: 'png',
                                        path: step.imageCard!.path,
                                        sizeBytes: step.imageCard!.sizeBytes,
                                        description: step.imageCard!.prompt,
                                        createdAt: step.timestamp,
                                        previewUrl: step.imageCard!.rawUrl,
                                        downloadUrl: step.imageCard!.rawUrl
                                      });
                                    }}
                                    className="px-2 py-0.5 rounded bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] cursor-pointer transition-colors"
                                  >
                                    Preview
                                  </button>
                                  <a
                                    href={step.imageCard.rawUrl}
                                    download={step.imageCard.filename}
                                    className="px-2 py-0.5 rounded bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] flex items-center gap-1"
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>Download</span>
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action Bar: Copy & Regenerate */}
                          {!isCurrentStreaming && step.content && !step.content.startsWith('💭 *Thinking...*') && (
                            <div className="flex items-center gap-2 pt-1 border-t border-[var(--border-subtle)]/50 text-[11px] text-[var(--text-tertiary)]">
                              <button
                                onClick={() => handleCopy(step.id, step.content)}
                                title="Copy response"
                                className="hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={async () => {
                                  if (isExecuting) return;
                                  setRegeneratingStepId(step.id);
                                  try {
                                    await regenerateResponse(step.id);
                                  } finally {
                                    setRegeneratingStepId(null);
                                  }
                                }}
                                disabled={isExecuting}
                                title="Regenerate this response"
                                className="hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <RotateCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin text-cyan-400' : ''}`} />
                                <span>Regenerate</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}

                {isExecuting && !sessionSteps.some(s => s.type === 'response') && (
                  <div className="max-w-3xl mx-auto w-full flex items-center justify-between p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl font-mono text-xs text-[var(--text-secondary)] shadow-sm">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-[var(--accent-primary)] animate-spin" />
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--text-primary)]">
                          {selectedModel ? selectedModel : (selectedGeneralModel || 'Local Sovereign Engine')}
                        </span>
                        <span className="animate-pulse">generating response...</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={stopExecution}
                      className="px-2.5 py-1 bg-rose-600/90 hover:bg-rose-600 text-white rounded-md text-[11px] font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      title="Stop Generation"
                    >
                      <Square className="w-3 h-3 fill-white" />
                      <span>Stop</span>
                    </button>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Bottom Input Section */}
              <div className="p-4 bg-[var(--bg-base)] border-t border-[var(--border-subtle)]">
                <div className="max-w-3xl mx-auto">
                  <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-2 shadow-sm focus-within:border-[var(--text-secondary)] transition-colors">
                    {/* Attached File Pills */}
                    {attachedFiles.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mb-2 pb-2 border-b border-[var(--border-subtle)]">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-primary)] font-semibold flex items-center gap-1 mr-1">
                          <span>📄</span> Attached Context:
                        </span>
                        {attachedFiles.map((file) => (
                          <div key={file} className="flex items-center gap-1.5 bg-[var(--bg-elevated)] border border-[var(--accent-primary)]/30 px-2 py-0.5 rounded-md text-[11px] font-mono text-[var(--text-primary)] shadow-sm">
                            <FileText className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                            <span className="truncate max-w-[180px] font-medium">{file}</span>
                            <button 
                              type="button"
                              onClick={() => removeAttachedFile(file)}
                              className="p-0.5 hover:text-rose-400 cursor-pointer rounded transition-colors"
                              title="Remove attached file"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Create Image Model Selector Banner in Follow-up */}
                    {isCreateImageMode && (
                      <div className="mb-2 p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)] animate-pulse" />
                          <span className="font-semibold text-[var(--text-primary)]">Create Image</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[var(--text-secondary)] font-mono">Model:</span>
                          <select
                            value={selectedImageModel}
                            onChange={(e) => setSelectedImageModel(e.target.value)}
                            className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs text-[var(--text-primary)] font-mono outline-none cursor-pointer hover:border-[var(--text-secondary)]"
                          >
                            <option value="z-image-turbo">Z-Image Turbo (DiT BF16 + Qwen 3 4B)</option>
                            <option value="sdxl-lightning">SDXL-Lightning (Safetensors - Fast GPU)</option>
                            <option value="flux1-schnell">FLUX.1 [schnell] (GGUF)</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => setIsCreateImageMode(false)}
                            className="p-1 hover:bg-[var(--bg-surface)] rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                            title="Exit Create Image mode"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    <textarea
                      value={followUpText}
                      onChange={(e) => setFollowUpText(e.target.value)}
                      placeholder={
                        isCreateImageMode
                          ? `Describe the image to generate with ${selectedImageModel === 'z-image-turbo' ? 'Z-Image Turbo' : (selectedImageModel === 'flux1-schnell' ? 'FLUX.1 [schnell]' : 'SDXL-Lightning')}...`
                          : "Ask a follow-up or provide next instructions..."
                      }
                      className="w-full bg-transparent border-none text-[14px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-tertiary)] resize-none h-12 p-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (followUpText.trim()) {
                            if (isCreateImageMode) {
                              generateImageTask(followUpText.trim(), selectedImageModel);
                            } else {
                              proposePlanForTask(followUpText.trim());
                            }
                            setFollowUpText('');
                          }
                        }
                      }}
                    />
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-[var(--border-subtle)]/50">
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          title="Attach Document" 
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium cursor-pointer transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Attach
                        </button>

                        {/* Think Harder Mode Toggle */}
                        <button 
                          type="button"
                          onClick={toggleThinkHarderMode}
                          title="Think Harder: Maximum local compute power, 32k context & deep multi-perspective chain of thought"
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                            isThinkHarderMode 
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold shadow-md shadow-amber-500/20 hover:opacity-95' 
                              : 'hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-subtle)]'
                          }`}
                        >
                          <Zap className={`w-3.5 h-3.5 ${isThinkHarderMode ? 'fill-black' : 'text-amber-400'}`} />
                          <span>{isThinkHarderMode ? 'Think Harder ON' : 'Think Harder'}</span>
                        </button>

                        {/* Create Image Mode Toggle in Follow-up */}
                        <button 
                          type="button"
                          onClick={() => setIsCreateImageMode(prev => !prev)}
                          title="Create image with local models"
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                            isCreateImageMode 
                              ? 'bg-[var(--text-primary)] text-[var(--bg-base)] font-bold shadow-md' 
                              : 'hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-subtle)]'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Create Image</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={handleMicClick}
                          className="p-1.5 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                        {isExecuting ? (
                          <button
                            type="button"
                            onClick={stopExecution}
                            className="p-1.5 px-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition-all shadow-md flex items-center gap-1 text-xs font-semibold animate-pulse"
                            title="Stop Generation"
                          >
                            <Square className="w-3.5 h-3.5 fill-white" />
                            <span>Stop</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              if (followUpText.trim()) {
                                if (isCreateImageMode) {
                                  generateImageTask(followUpText.trim(), selectedImageModel);
                                } else {
                                  proposePlanForTask(followUpText.trim());
                                }
                                setFollowUpText('');
                              }
                            }}
                            className="p-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 cursor-pointer transition-opacity"
                            title={isCreateImageMode ? "Generate Image" : "Send Query"}
                          >
                            {isCreateImageMode ? <Sparkles className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
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
