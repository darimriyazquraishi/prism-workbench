import React, { useRef, useState, useEffect } from 'react';
import { 
  FolderOpen, 
  FileUp, 
  Cpu, 
  Eye, 
  Calculator, 
  BookOpen, 
  Trash2, 
  Layers, 
  Bot, 
  Zap, 
  ChevronDown,
  Save,
  RotateCcw,
  Check
} from 'lucide-react';
import { useAntigravityStore, detectModelInfo } from '../../store/useAntigravityStore';
import { useTelemetryStore } from '../../store/telemetryStore';
import type { DiscoveredModel } from '../../types/antigravity';

export const ModelManagementView: React.FC = () => {
  const {
    arsenalModels,
    setArsenalModels,
    removeArsenalModel,
    clearArsenalModels,
    saveCurrentModelLayout,
    loadSavedModelLayout,
    getSavedModelLayout
  } = useAntigravityStore();

  const [saveFeedback, setSaveFeedback] = useState(false);
  const [savedLayout, setSavedLayout] = useState<DiscoveredModel[] | null>(null);

  useEffect(() => {
    setSavedLayout(getSavedModelLayout());
  }, [arsenalModels, getSavedModelLayout]);

  const modelLatencies = useTelemetryStore((state) => state.aiTelemetry.modelLatenciesMs) || {};
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Latency lookup for discovered model cards
  const getLatencyDisplay = (tag?: string, name?: string): string => {
    if (!tag && !name) return '—';
    if (tag && modelLatencies[tag] !== undefined && modelLatencies[tag] !== null) {
      return `${(modelLatencies[tag] / 1000).toFixed(1)}s`;
    }
    if (name && modelLatencies[name] !== undefined && modelLatencies[name] !== null) {
      return `${(modelLatencies[name] / 1000).toFixed(1)}s`;
    }
    for (const [key, val] of Object.entries(modelLatencies)) {
      if (val !== null && val !== undefined) {
        const k = key.toLowerCase();
        if ((tag && k.includes(tag.toLowerCase())) || (name && k.includes(name.toLowerCase()))) {
          return `${(val / 1000).toFixed(1)}s`;
        }
      }
    }
    return '—';
  };

  /**
   * Unified processor for all selected files:
   * Handles both folders and individual model files (.gguf, .safetensors, .bin, .onnx).
   * Automatically groups multimodal projectors (mmproj) into their parent vision model,
   * ignores .cache, .git, .metadata, and auxiliary text files.
   */
  const processFilesList = (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const modelMap = new Map<string, {
      canonicalName: string;
      samplePath: string;
      totalBytes: number;
      hasProjector: boolean;
    }>();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relPath = (file as any).webkitRelativePath || file.name;
      const normPath = relPath.replace(/\\/g, '/');

      // 1. Strictly ignore cache, git, and hidden directories
      if (normPath.includes('/.cache/') || normPath.includes('/.git/') || normPath.startsWith('.')) {
        continue;
      }

      // 2. Ignore non-model files (.metadata, .gitkeep, .json, .txt, .md, .jinja, etc.)
      const isWeightFile = /\.(gguf|safetensors|bin|onnx|pt|pth)$/i.test(file.name) && 
                           !file.name.endsWith('.metadata') && 
                           !file.name.endsWith('.tmp') &&
                           !file.name.endsWith('.download');
      
      if (!isWeightFile) {
        continue;
      }

      // 3. Check if file is an auxiliary multimodal vision projector (e.g. mmproj-Qwen3VL-8B-Instruct-F16.gguf)
      const isProjector = file.name.toLowerCase().startsWith('mmproj-') || file.name.toLowerCase().startsWith('mmproj.');

      // 4. Identify canonical model directory name or clean model name
      const parts = normPath.split('/');
      let modelDirName = '';

      if (parts.length >= 2) {
        for (let p = parts.length - 2; p >= 0; p--) {
          const seg = parts[p];
          if (seg !== 'models' && seg !== 'model' && !seg.startsWith('.')) {
            modelDirName = seg;
            break;
          }
        }
      }

      // If loose file without parent directory or inside generic folder
      if (!modelDirName) {
        if (isProjector) {
          modelDirName = file.name.replace(/^mmproj[-_]/i, '').replace(/\.(gguf|safetensors|bin|onnx|pt|pth)$/i, '').trim();
        } else {
          modelDirName = file.name.replace(/\.(gguf|safetensors|bin|onnx|pt|pth)$/i, '').trim();
        }
      }

      if (!modelMap.has(modelDirName)) {
        modelMap.set(modelDirName, {
          canonicalName: modelDirName,
          samplePath: normPath,
          totalBytes: file.size,
          hasProjector: isProjector
        });
      } else {
        const entry = modelMap.get(modelDirName)!;
        entry.totalBytes += file.size;
        if (isProjector) entry.hasProjector = true;
      }
    }

    // Fallback if no standard extensions found but valid directories exist
    if (modelMap.size === 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const relPath = (file as any).webkitRelativePath || file.name;
        const normPath = relPath.replace(/\\/g, '/');
        if (normPath.includes('/.cache/') || normPath.includes('/.git/') || file.name.endsWith('.metadata')) continue;
        
        const parts = normPath.split('/');
        let dirName = parts.length >= 2 ? parts[parts.length - 2] : file.name;
        if (dirName && dirName !== 'models' && !modelMap.has(dirName)) {
          modelMap.set(dirName, {
            canonicalName: dirName,
            samplePath: normPath,
            totalBytes: file.size,
            hasProjector: false
          });
        }
      }
    }

    // Build discovered models list
    const discovered: DiscoveredModel[] = [];
    modelMap.forEach((val) => {
      const detected = detectModelInfo(val.canonicalName, val.samplePath, val.totalBytes);
      if (val.hasProjector && detected.role === 'vision') {
        detected.description = `${detected.description} (Includes multimodal vision projector).`;
      }
      discovered.push(detected);
    });

    if (discovered.length > 0) {
      setArsenalModels(discovered);
    }
  };

  // HTML Input Handlers
  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFilesList(e.target.files);
    }
    e.target.value = '';
    setIsDropdownOpen(false);
  };

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFilesList(e.target.files);
    }
    e.target.value = '';
    setIsDropdownOpen(false);
  };

  // Silent native drag & drop support without UI text
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    const collectedFiles: File[] = [];

    const traverseEntry = async (entry: any, path = ''): Promise<void> => {
      if (entry.isFile) {
        return new Promise<void>((resolve) => {
          entry.file((file: File) => {
            Object.defineProperty(file, 'webkitRelativePath', {
              value: path ? `${path}/${file.name}` : file.name,
              writable: false
            });
            collectedFiles.push(file);
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const readBatch = (): Promise<any[]> => {
          return new Promise((resolve) => {
            reader.readEntries((entries: any[]) => resolve(entries || []));
          });
        };
        let entries = await readBatch();
        while (entries.length > 0) {
          for (const child of entries) {
            await traverseEntry(child, path ? `${path}/${entry.name}` : entry.name);
          }
          entries = await readBatch();
        }
      }
    };

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
      if (entry) {
        await traverseEntry(entry);
      } else if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) collectedFiles.push(file);
      }
    }

    if (collectedFiles.length > 0) {
      processFilesList(collectedFiles);
    }
  };

  // Dynamic role lookups for agent roster
  const reasoningModel = arsenalModels.find(m => m.role === 'reasoning');
  const visionModel = arsenalModels.find(m => m.role === 'vision');
  const coderModel = arsenalModels.find(m => m.role === 'coder');
  const embeddingModel = arsenalModels.find(m => m.role === 'embedding');

  // Role badges formatting
  const getRoleBadge = (role: DiscoveredModel['role']) => {
    switch (role) {
      case 'vision':
        return {
          icon: Eye,
          label: 'Vision & Multimodal',
          color: 'text-sky-400 bg-sky-950/40 border-sky-800/50'
        };
      case 'coder':
        return {
          icon: Calculator,
          label: 'Code & Math Synthesis',
          color: 'text-amber-400 bg-amber-950/40 border-amber-800/50'
        };
      case 'embedding':
        return {
          icon: BookOpen,
          label: 'Vector Embeddings (RAG)',
          color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50'
        };
      case 'reranker':
        return {
          icon: Zap,
          label: 'Cross-Encoder Re-ranker',
          color: 'text-purple-400 bg-purple-950/40 border-purple-800/50'
        };
      case 'reasoning':
      default:
        return {
          icon: Cpu,
          label: 'Master Reasoning & Planning',
          color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/50'
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[var(--bg-base)] font-sans text-xs text-[var(--text-primary)] p-6 space-y-6">
      {/* Hidden File & Folder Inputs */}
      <input
        type="file"
        ref={folderInputRef}
        className="hidden"
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolderSelect}
      />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept=".gguf,.bin,.safetensors,.pt,.pth,.onnx,*"
        onChange={handleFilesSelect}
      />

      {/* Top Page Header (No Browse Models on Top Right) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-white" />
            <span>MODELS &amp; AGENTS</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Manage local offline models and monitor multi-agent orchestration assignments.
          </p>
        </div>

        {/* Top Right: Save Current Layout & Clear Arsenal */}
        {arsenalModels.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const ok = saveCurrentModelLayout();
                if (ok) {
                  setSaveFeedback(true);
                  setSavedLayout(getSavedModelLayout());
                  setTimeout(() => setSaveFeedback(false), 3000);
                }
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Save current model configuration as your persistent layout preset"
            >
              {saveFeedback ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5 text-black" />}
              <span>{saveFeedback ? 'Layout Saved ✓' : 'Save Current Model Layout'}</span>
            </button>

            <button
              onClick={clearArsenalModels}
              className="px-3 py-1.5 rounded-lg bg-rose-950/20 hover:bg-rose-950/40 border border-rose-800/40 text-rose-400 text-xs font-medium cursor-pointer transition-colors inline-flex items-center gap-1.5"
              title="Clear all models from the active arsenal"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Arsenal</span>
            </button>
          </div>
        )}
      </div>

      {/* BODY CONTENT: EMPTY STATE OR POPULATED ARSENAL */}
      {arsenalModels.length === 0 ? (
        /* CLEAN EMPTY STATE: ONLY "NO MODELS CONFIGURED" AND "BROWSE MODELS" */
        <div className="space-y-4">
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-12 bg-[var(--bg-surface)] text-center transition-all space-y-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto text-zinc-300 shadow-sm">
              <Cpu className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                No Models Configured
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Select your models folder or pick individual model files (.gguf, .safetensors) to get started.
              </p>
            </div>

            {/* Prominent Browse Models Button with Clean Dropdown + Load Saved Layout */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3" ref={dropdownRef}>
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <FolderOpen className="w-4 h-4 text-black" />
                  <span>Browse Models</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-black/70 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#121212] border border-[#262626] rounded-xl shadow-2xl p-1.5 z-50 text-left"
                    style={{ backdropFilter: 'blur(16px)' }}
                  >
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        folderInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#1f1f1f] text-white transition-colors cursor-pointer group"
                    >
                      <FolderOpen className="w-4 h-4 text-zinc-300 group-hover:text-white" />
                      <div>
                        <div className="font-medium text-xs text-white">Browse Models Folder</div>
                        <div className="text-[10px] text-zinc-400">Directory containing models (e.g. models/)</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#1f1f1f] text-white transition-colors cursor-pointer group"
                    >
                      <FileUp className="w-4 h-4 text-zinc-300 group-hover:text-white" />
                      <div>
                        <div className="font-medium text-xs text-white">Browse Model File(s)</div>
                        <div className="text-[10px] text-zinc-400">Choose .gguf, .safetensors, .bin files</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {savedLayout && savedLayout.length > 0 && (
                <button
                  type="button"
                  onClick={() => loadSavedModelLayout()}
                  className="px-4 py-2.5 bg-[var(--bg-elevated)] hover:bg-[#252525] border border-[var(--border-subtle)] hover:border-zinc-500 text-[var(--text-primary)] font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
                  title="Restore your previously saved model layout"
                >
                  <RotateCcw className="w-4 h-4 text-zinc-300" />
                  <span>Load Saved Layout ({savedLayout.length} models)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* POPULATED ARSENAL VIEW */
        <div className="space-y-6">
          {/* Status Sub-bar */}
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white border border-white/20">
                {arsenalModels.length} Models Active
              </span>
              <span>•</span>
              <span>Multi-model cooperative execution ready</span>
            </div>
          </div>

          {/* 1. ACTIVE MODELS SECTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-4 h-4 text-white" />
              <span>ACTIVE MODEL ARSENAL ({arsenalModels.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {arsenalModels.map((m) => {
                const latency = getLatencyDisplay(m.ollamaTag, m.name);
                const roleBadge = getRoleBadge(m.role);
                const RoleIcon = roleBadge.icon;

                return (
                  <div 
                    key={m.id}
                    className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-3 font-mono text-xs shadow-sm flex flex-col justify-between hover:border-zinc-500 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="font-bold text-sm text-[var(--text-primary)] font-sans truncate" title={m.name}>
                            {m.name}
                          </div>
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-sans font-medium border ${roleBadge.color}`}>
                            <RoleIcon className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{roleBadge.label}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => removeArsenalModel(m.id)}
                          title="Remove model from arsenal"
                          className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* What it does */}
                      <div className="text-[11px] font-sans text-[var(--text-secondary)] leading-relaxed pt-1">
                        <span className="text-[var(--text-tertiary)] block text-[10px] uppercase font-mono tracking-wider">What it does:</span>
                        {m.description}
                      </div>

                      {/* Assigned Agent */}
                      <div className="text-[11px] font-sans bg-[var(--bg-base)] p-2 rounded-lg border border-[var(--border-subtle)] flex items-center gap-1.5">
                        <span className="text-[var(--text-tertiary)] text-[10px]">Agent:</span>
                        <span className="font-medium text-[var(--text-primary)] truncate text-[11px]">{m.assignedAgent}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--text-tertiary)]">
                      <span className="truncate max-w-[140px]" title={m.path}>{m.sizeFormatted}</span>
                      <div className="flex items-center gap-1">
                        <span>Latency:</span>
                        <span className={`font-bold ${latency !== '—' ? 'text-white' : 'text-[var(--text-tertiary)]'}`}>
                          {latency}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. AGENTIC MULTI-MODEL PIPELINE ROSTER */}
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <h3 className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-white" />
                <span>AGENTIC WORKBENCH PIPELINE</span>
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Lumi utilizes its entire model arsenal cooperatively: images are routed to the <strong>Vision LLM</strong> to extract visual observations before being handed to the <strong>Master Orchestrator</strong>, while coding tasks are dispatched directly to the <strong>Coder LLM</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {/* Agent 1: Master Reasoning & Planning Agent */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-2.5 shadow-sm flex flex-col justify-between font-sans text-xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="font-bold text-xs text-[var(--text-primary)]">
                      Master Orchestrator
                    </div>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Task planning, ReAct step decomposition, visual finding synthesis, and direct engineering Q&amp;A.
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] font-mono text-[10px] flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Active Model:</span>
                  <span className="font-bold text-cyan-400 truncate max-w-[110px]" title={reasoningModel?.name || 'Qwen 3 14B'}>
                    {reasoningModel ? reasoningModel.name : 'Qwen 3 14B'}
                  </span>
                </div>
              </div>

              {/* Agent 2: Vision & Multimodal Agent */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-2.5 shadow-sm flex flex-col justify-between font-sans text-xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                      <Eye className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="font-bold text-xs text-[var(--text-primary)]">
                      Vision &amp; Multimodal Agent
                    </div>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Examines images, schematics &amp; OCR text, then feeds visual intelligence to the Master Orchestrator.
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] font-mono text-[10px] flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Active Model:</span>
                  <span className="font-bold text-sky-400 truncate max-w-[110px]" title={visionModel?.name || 'Qwen 3 VL 8B'}>
                    {visionModel ? visionModel.name : 'Qwen 3 VL 8B'}
                  </span>
                </div>
              </div>

              {/* Agent 3: Code & Math Agent */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-2.5 shadow-sm flex flex-col justify-between font-sans text-xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                      <Calculator className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="font-bold text-xs text-[var(--text-primary)]">
                      Code &amp; Math Agent
                    </div>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Dispatched by the Master Orchestrator for Python script synthesis, code debugging, and math verification.
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] font-mono text-[10px] flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Active Model:</span>
                  <span className="font-bold text-amber-400 truncate max-w-[110px]" title={coderModel?.name || 'Qwen 2.5 Coder 7B'}>
                    {coderModel ? coderModel.name : 'Qwen 2.5 Coder 7B'}
                  </span>
                </div>
              </div>

              {/* Agent 4: Knowledge Retrieval Agent (RAG) */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-2.5 shadow-sm flex flex-col justify-between font-sans text-xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="font-bold text-xs text-[var(--text-primary)]">
                      Knowledge Retrieval Agent
                    </div>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Vector embedding search and semantic retrieval against internal SOPs, manuals, and documents.
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] font-mono text-[10px] flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Active Model:</span>
                  <span className="font-bold text-emerald-400 truncate max-w-[110px]" title={embeddingModel?.name || 'Qwen 3 Embedding 0.6B'}>
                    {embeddingModel ? embeddingModel.name : 'Qwen 3 Embedding 0.6B'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
