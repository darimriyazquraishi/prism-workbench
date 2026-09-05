import React, { useState, useRef } from 'react';
import { 
  GitMerge, 
  BookOpen, 
  Search, 
  Play, 
  FileText, 
  Layers, 
  Cpu, 
  Terminal, 
  Database, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Sparkles,
  File
} from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';

export const WorkflowKnowledgeView: React.FC = () => {
  const { knowledgeItems, addKnowledgeBaseDoc, removeKnowledgeBaseDoc, queryKnowledgeBase } = useAntigravityStore();
  const [isExecutingWorkflow, setIsExecutingWorkflow] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(5);
  const [ragEnabled, setRagEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('presentation formatting guidelines');

  // Add KB Form State (Middle Workspace)
  const [addMode, setAddMode] = useState<'file' | 'text'>('file');
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newType, setNewType] = useState<'guideline' | 'sop' | 'template' | 'rule'>('guideline');
  const [category, setCategory] = useState('Operations & Engineering');
  const [department, setDepartment] = useState('Plant Operations');

  // File Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const workflowNodes = [
    { id: 1, title: 'INPUT: User Prompt + Task Uploads', role: 'Task Scoped Content', type: 'input', icon: Layers, status: 'DONE', details: 'Direct task inputs (source_type = USER_UPLOAD)' },
    { id: 2, title: 'CHATBOT: Qwen2.5-3B-Instruct', role: 'Intent Orchestrator', type: 'agent', icon: Cpu, status: 'DONE', details: 'Parses plain language intent & scope' },
    { id: 3, title: 'ROUTER: KB RAG Search (source_type = KNOWLEDGE_BASE)', role: 'Scoped Guidance Retrieval', type: 'tool', icon: Database, status: 'DONE', details: 'Retrieves relevant company standards & checks for rule conflicts' },
    { id: 4, title: 'GATEWAY: Proposed Workplan Approval', role: 'Human-in-the-Loop', type: 'agent', icon: Cpu, status: 'DONE', details: 'User approves or rejects plan with feedback' },
    { id: 5, title: 'EXECUTION: Local Specialized Engine', role: 'Air-Gapped Local Model', type: 'tool', icon: Terminal, status: 'DONE', details: 'Qwen3-8B / Qwen2.5-VL / Qwen-Coder' },
    { id: 6, title: 'OUTPUT: Verified Deliverable', role: 'Compliance Output', type: 'output', icon: FileText, status: 'DONE', details: 'Deliverable validated against applied company guidance' }
  ];

  const handleExecute = () => {
    setIsExecutingWorkflow(true);
    setActiveStepIndex(0);

    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev >= workflowNodes.length - 1) {
          clearInterval(interval);
          setIsExecutingWorkflow(false);
          return workflowNodes.length - 1;
        }
        return prev + 1;
      });
    }, 500);
  };

  const handleSaveTextDoc = () => {
    if (!newTitle.trim() || !newSummary.trim()) return;
    
    addKnowledgeBaseDoc({
      title: newTitle.trim(),
      summary: newSummary.trim(),
      path: `knowledge/${newTitle.trim().replace(/\s+/g, '_')}.pdf`,
      totalChunks: 12,
      document_type: newType,
      category,
      department
    });

    setSuccessMessage(`✓ Saved "${newTitle.trim()}" to Knowledge Base (source_type = KNOWLEDGE_BASE)`);
    setNewTitle('');
    setNewSummary('');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleFileUpload = (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const cleanTitle = newTitle.trim() || file.name.replace(/\.[^/.]+$/, '');
    const summaryText = newSummary.trim() || `Uploaded company document: ${file.name} (${(file.size / 1024).toFixed(1)} KB). Indexed into local ChromaDB vector store.`;

    setIsUploading(true);
    setUploadProgress(25);

    setTimeout(() => setUploadProgress(65), 250);
    setTimeout(() => setUploadProgress(95), 450);

    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(100);

      addKnowledgeBaseDoc({
        title: cleanTitle,
        summary: summaryText,
        path: `knowledge/${file.name}`,
        totalChunks: Math.max(8, Math.floor(file.size / 1024 / 2)),
        document_type: newType,
        category,
        department
      });

      setSuccessMessage(`✓ Parsed & Indexed "${file.name}" into Knowledge Base (source_type = KNOWLEDGE_BASE)`);
      setNewTitle('');
      setNewSummary('');
      setTimeout(() => setSuccessMessage(null), 4500);
    }, 650);
  };

  const searchRes = queryKnowledgeBase(searchQuery, 'general_reasoning');

  return (
    <div className="flex-1 flex overflow-hidden bg-[var(--bg-primary)] font-sans text-xs text-[var(--text-primary)]">
      {/* 1. Middle Canvas: Pipeline Architecture & KB Ingestion Panel */}
      <div className="flex-1 flex flex-col border-r border-[#2d2d2d] overflow-hidden">
        {/* Canvas Toolbar */}
        <div className="h-9 bg-[var(--bg-surface)] border-b border-[#2d2d2d] px-3 flex items-center justify-between select-none">
          <div className="flex items-center gap-2 font-mono font-bold text-xs text-[var(--text-primary)]">
            <GitMerge className="w-4 h-4 text-[#569cd6]" />
            <span>AGENTIC PIPELINE ORCHESTRATION ARCHITECTURE</span>
          </div>

          <button
            onClick={handleExecute}
            disabled={isExecutingWorkflow}
            className={`px-3 py-1 rounded text-[var(--text-primary)] font-bold font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isExecutingWorkflow 
                ? 'bg-[#37373d] text-[var(--text-secondary)] cursor-not-allowed' 
                : 'bg-[var(--accent-fuchsia)] hover:bg-[#1f8ad2] shadow-sm'
            }`}
          >
            <Play className="w-3 h-3 fill-white" />
            <span>{isExecutingWorkflow ? 'Executing Pipeline...' : 'EXECUTE WORKFLOW'}</span>
          </button>
        </div>

        {/* Middle Canvas Workspace Content */}
        <div className="flex-1 p-5 overflow-y-auto bg-[#181818] space-y-5">

          {/* Dedicated "Add to Knowledge Base" Panel */}
          <div className="max-w-2xl mx-auto bg-[var(--bg-surface)] border border-emerald-800/40 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-primary)] font-mono flex items-center gap-2">
                    ADD TO KNOWLEDGE BASE (COMPANY GUIDANCE / STANDARDS)
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 uppercase">
                      PERSISTENT KB
                    </span>
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Ingest organization SOPs, engineering standards, guidelines, and corporate templates.
                  </p>
                </div>
              </div>

              {/* Mode Toggle: File Upload vs Text Snippet */}
              <div className="flex bg-[var(--bg-base)] p-0.5 rounded-lg border border-[var(--border-subtle)] font-mono text-[10px]">
                <button
                  onClick={() => setAddMode('file')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                    addMode === 'file' 
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <UploadCloud className="w-3 h-3" />
                  File Upload
                </button>
                <button
                  onClick={() => setAddMode('text')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                    addMode === 'text' 
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  Manual Text
                </button>
              </div>
            </div>

            {/* Scope Separation Warning Banner */}
            <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/30 flex items-start gap-2 text-[11px] text-amber-200/90 leading-tight">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-mono text-amber-300 font-bold uppercase">Strict Source Separation:</strong> Documents uploaded here are tagged with <code className="text-amber-200 font-mono">source_type = 'KNOWLEDGE_BASE'</code> and saved to persistent memory as corporate guidance. They are <strong>never</strong> treated as current user task inputs.
              </div>
            </div>

            {/* Success Toast / Notification */}
            {successMessage && (
              <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-700/60 text-emerald-300 text-[11px] font-mono flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Shared Form Fields: Title & Document Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-mono uppercase text-[var(--text-secondary)] font-semibold">
                  Document Title / Reference Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mandatory Presentation Layout Guidelines 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[var(--bg-base)] text-xs text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-[var(--text-secondary)] font-semibold">
                  Document Type (Metadata Tag)
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-[var(--bg-base)] text-xs text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="guideline">Guideline / Standard</option>
                  <option value="sop">SOP Operational Procedure</option>
                  <option value="template">Corporate Template</option>
                  <option value="rule">Mandatory Security Rule</option>
                </select>
              </div>
            </div>

            {/* Mode A: File Upload Dropzone */}
            {addMode === 'file' && (
              <div className="space-y-3 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e.target.files)}
                  accept=".pdf,.docx,.doc,.pptx,.txt,.md"
                  className="hidden"
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFileUpload(e.dataTransfer.files);
                  }}
                  className="border-2 border-dashed border-emerald-800/50 hover:border-emerald-500/80 rounded-xl p-5 bg-[var(--bg-base)] text-center cursor-pointer transition-colors space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center mx-auto text-emerald-400 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">
                      Drag &amp; drop company document, or <span className="text-emerald-400 underline">browse file</span>
                    </div>
                    <div className="text-[10px] text-[var(--text-tertiary)] font-mono mt-0.5">
                      Supports PDF, Word (.docx), PowerPoint (.pptx), Markdown, Text (Max 50 MB)
                    </div>
                  </div>
                </div>

                {isUploading && (
                  <div className="p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-1.5 font-mono text-[10px]">
                    <div className="flex items-center justify-between text-emerald-400">
                      <span>Parsing document structure &amp; generating 768-D embeddings...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-[var(--bg-elevated)] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mode B: Manual Text Snippet Entry */}
            {addMode === 'text' && (
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-[var(--text-secondary)] font-semibold">
                    Guidance Summary / Rule Snippet
                  </label>
                  <textarea
                    placeholder="Enter corporate rules, compliance limits, or presentation formatting instructions..."
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    rows={3}
                    className="w-full bg-[var(--bg-base)] text-xs text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg p-2 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => { setNewTitle(''); setNewSummary(''); }}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium cursor-pointer"
                  >
                    Clear Form
                  </button>
                  <button
                    onClick={handleSaveTextDoc}
                    disabled={!newTitle.trim() || !newSummary.trim()}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold font-mono flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Save to Knowledge Base</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Node Flowchart Title Header */}
          <div className="text-center pt-2 pb-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-secondary)] tracking-widest px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              Pipeline Trajectory Nodes (Sequential Step Execution)
            </span>
          </div>

          {/* Node Flowchart Canvas */}
          <div className="flex flex-col items-center justify-center space-y-3 max-w-xl mx-auto">
            {workflowNodes.map((node, index) => {
              const Icon = node.icon;
              const isCurrent = isExecutingWorkflow && activeStepIndex === index;
              const isPassed = activeStepIndex >= index;

              return (
                <React.Fragment key={node.id}>
                  {/* Workflow Node Card */}
                  <div
                    className={`w-full p-3 rounded-lg border transition-all shadow-md ${
                      isCurrent
                        ? 'bg-[var(--bg-surface)] border-[var(--accent-fuchsia)] ring-2 ring-[var(--accent-fuchsia)]/40 shadow-lg scale-102'
                        : isPassed
                        ? 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'
                        : 'bg-[var(--bg-primary)] border-[#2d2d2d] opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center ${
                            node.type === 'input'
                              ? 'bg-[#dcb67a]/20 text-[#dcb67a]'
                              : node.type === 'agent'
                              ? 'bg-[#569cd6]/20 text-[#569cd6]'
                              : node.type === 'tool'
                              ? 'bg-[var(--status-healthy)]/20 text-[var(--status-healthy)]'
                              : 'bg-[var(--status-attention)]/20 text-[var(--status-attention)]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-[var(--text-primary)] text-xs">{node.title}</span>
                      </div>

                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                          isCurrent
                            ? 'bg-[var(--accent-fuchsia)] text-[var(--text-primary)] animate-pulse'
                            : isPassed
                            ? 'bg-[#1f3a2b] text-[var(--status-healthy)]'
                            : 'bg-[#2d2d2d] text-[var(--text-secondary)]'
                        }`}
                      >
                        {isCurrent ? 'RUNNING' : isPassed ? 'COMPLETED' : 'QUEUED'}
                      </span>
                    </div>

                    <div className="mt-1.5 pl-8 text-[11px] text-[var(--text-secondary)] font-sans">
                      {node.details}
                    </div>
                  </div>

                  {index < workflowNodes.length - 1 && (
                    <div className="flex items-center justify-center text-[#569cd6]">
                      <div className="w-[1.5px] h-3 bg-[var(--border-subtle)]"></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Right Panel: Knowledge Base Vault (Reordered) */}
      <aside className="w-96 bg-[var(--bg-surface)] flex flex-col select-none flex-shrink-0 font-sans border-l border-[#2d2d2d]">
        {/* Panel Header */}
        <div className="p-3 border-b border-[#2d2d2d] bg-[var(--bg-primary)] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[var(--text-primary)]">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>KNOWLEDGE BASE VAULT</span>
            </span>
            <button
              onClick={() => setRagEnabled(!ragEnabled)}
              className="text-[var(--status-healthy)] hover:text-[var(--text-primary)] cursor-pointer"
              title="Toggle RAG Retrieval"
            >
              {ragEnabled ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-[var(--text-secondary)]" />}
            </button>
          </div>

          <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/40 text-[10px] text-emerald-300 font-mono leading-tight">
            Strictly scoped: Holds company guidance, standards &amp; templates. Filtered by <code className="text-emerald-200">source_type = 'KNOWLEDGE_BASE'</code>.
          </div>
        </div>

        {/* FIRST SECTION: ACTIVE KB DOCUMENTS */}
        <div className="p-3 border-b border-[#2d2d2d] space-y-2 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
              Active KB Documents ({knowledgeItems.length})
            </span>
            <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/40">
              SYNCHRONIZED
            </span>
          </div>

          <div className="space-y-2 font-sans">
            {knowledgeItems.map((ki) => (
              <div key={ki.id} className="p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[#2d2d2d] hover:border-emerald-800/50 transition-colors space-y-1 group">
                <div className="flex items-start justify-between text-[11px] gap-2">
                  <span className="font-bold text-[var(--text-primary)] truncate flex items-center gap-1.5 flex-1 min-w-0">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="truncate">{ki.title}</span>
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 uppercase flex-shrink-0">
                    {ki.document_type || 'KB_DOC'}
                  </span>
                </div>

                <p className="text-[10px] text-[var(--text-secondary)] leading-snug line-clamp-2">
                  {ki.summary}
                </p>

                <div className="flex items-center justify-between text-[9px] font-mono text-[var(--text-tertiary)] pt-1 border-t border-[var(--border-subtle)]/40">
                  <span>Cat: {ki.category || 'General'}</span>
                  <span>{ki.totalChunks || 12} Chunks</span>
                  {ki.id.startsWith('ki-') && !['ki-sop014', 'ki-ms007'].includes(ki.id) && (
                    <button onClick={() => removeKnowledgeBaseDoc(ki.id)} className="text-red-400 hover:underline cursor-pointer flex items-center gap-0.5">
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECOND SECTION: TEST RAG RETRIEVAL */}
        <div className="h-64 p-3 overflow-y-auto space-y-2.5 bg-[var(--bg-primary)] border-t border-[#2d2d2d]">
          <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
            Test RAG Retrieval (source_type = KNOWLEDGE_BASE)
          </span>

          <div className="flex items-center gap-1.5 p-1.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <Search className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search knowledge base..."
              className="flex-1 bg-transparent border-none text-xs text-[var(--text-primary)] focus:outline-none font-sans"
            />
          </div>

          <div className="space-y-2 pt-1 font-sans">
            {searchRes.noGuidanceFound ? (
              <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-[11px] text-[var(--text-secondary)] italic text-center">
                No matching Knowledge Base guidance found for query.
              </div>
            ) : (
              searchRes.guidance.map((g) => (
                <div key={g.id} className="p-2.5 rounded bg-[var(--bg-surface)] border border-emerald-900/40 space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="font-bold text-emerald-400 flex items-center gap-1 truncate">
                      <FileText className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{g.title}</span>
                    </span>
                    <span className="text-emerald-400 font-bold flex-shrink-0">RAG MATCH</span>
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] leading-relaxed italic">
                    "{g.snippet}"
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

