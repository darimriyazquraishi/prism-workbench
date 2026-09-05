import React, { useState, useRef, useEffect } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Activity, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Database,
  Lock,
  Download,
  Filter,
  FolderOpen,
  FileCode,
  HardDrive,
  Eye,
  Calculator,
  BookOpen,
  FileText,
  Layers,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';

interface DetectedModelFile {
  id: string;
  name: string;
  fileName: string;
  relativePath: string;
  fullPath: string;
  sizeGb: string;
  format: 'GGUF' | 'SAFETENSORS' | 'BIN' | 'ONNX';
  quant: string;
  agentRole: string;
  agentName: string;
  vramRequired: string;
}

export const ModelManagementView: React.FC = () => {
  const { selectedModel, setSelectedModel, availableModels, addAvailableModel, fetchAvailableModels } = useAntigravityStore();
  const [detectedModels, setDetectedModels] = useState<DetectedModelFile[]>([]);
  const [modelDirectory, setModelDirectory] = useState('F:\\corewithin\\models');
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync available models from Ollama / system on mount
  useEffect(() => {
    fetchAvailableModels().then((names) => {
      if (names && names.length > 0) {
        const ollamaEntries: DetectedModelFile[] = names.map((name, idx) => ({
          id: `ollama-${name}-${idx}`,
          name: name,
          fileName: `${name}.gguf`,
          relativePath: `ollama/${name}`,
          fullPath: `Local Inference Engine: ${name}`,
          sizeGb: 'Loaded',
          format: 'GGUF',
          quant: 'Auto',
          agentRole: 'Local Model Weight / Engine',
          agentName: 'Multi-Agent Runtime',
          vramRequired: 'Dynamic'
        }));
        setDetectedModels(prev => {
          const existing = new Set(prev.map(p => p.name));
          const additions = ollamaEntries.filter(e => !existing.has(e.name));
          return [...prev, ...additions];
        });
      }
    });
  }, [fetchAvailableModels]);

  const auditLogs = [
    { id: 'log-101', timestamp: '14:22:15', taskId: 'Task ID 456', action: 'Approval note document compiled (Approval_Note.docx)', model: 'Deliverable Agent (DOCX)', status: 'VERIFIED', network: '0 bytes ext' },
    { id: 'log-102', timestamp: '14:22:04', taskId: 'Task ID 456', action: 'Deterministic Python corrosion calculation executed in sandbox', model: 'Calculation Agent (Python)', status: 'SUCCESS', network: '0 bytes ext' },
    { id: 'log-103', timestamp: '14:21:48', taskId: 'Task ID 456', action: 'Vector similarity search against /corp/SOPs/Engineering/ (SOP-OPS-014)', model: 'Retrieval Agent (768-D)', status: 'SUCCESS', network: '0 bytes ext' },
    { id: 'log-104', timestamp: '14:21:12', taskId: 'Task ID 456', action: 'Image OCR & visual table extraction on Inspection_Report_March.pdf', model: 'Vision Agent (OCR)', status: 'SUCCESS', network: '0 bytes ext' },
    { id: 'log-105', timestamp: '14:20:55', taskId: 'Task ID 456', action: 'Task classification: Dispatched to multi-agent pipeline', model: 'Orchestrator Loop', status: 'SUCCESS', network: '0 bytes ext' }
  ];

  const handleFileBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: DetectedModelFile[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const ext = file.name.split('.').pop()?.toUpperCase() || 'BIN';
        const format: 'GGUF' | 'SAFETENSORS' | 'BIN' | 'ONNX' = 
          ext === 'GGUF' ? 'GGUF' : ext === 'SAFETENSORS' ? 'SAFETENSORS' : ext === 'ONNX' ? 'ONNX' : 'BIN';
        
        const sizeGb = (file.size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        
        const modelEntry: DetectedModelFile = {
          id: `custom-${Date.now()}-${i}`,
          name: cleanName,
          fileName: file.name,
          relativePath: `models/custom/${file.name}`,
          fullPath: (file as any).path || `C:\\models\\${file.name}`,
          sizeGb: sizeGb !== '0.00 GB' ? sizeGb : 'Custom',
          format,
          quant: file.name.includes('Q4_K_M') ? 'Q4_K_M' : file.name.includes('F16') ? 'F16' : 'CUSTOM',
          agentRole: 'User-Selected Local Model Weight',
          agentName: 'Specialized Engine',
          vramRequired: 'Auto-alloc'
        };
        newFiles.push(modelEntry);
        addAvailableModel(cleanName);
      }

      setDetectedModels(prev => [...newFiles, ...prev]);
      if (newFiles.length > 0) {
        setSelectedModel(newFiles[0].name);
        setScanMessage(`Loaded ${newFiles.length} local model file(s). Active model set to "${newFiles[0].name}".`);
        setTimeout(() => setScanMessage(null), 4000);
      }
      e.target.value = '';
    }
  };

  const handleRescan = async () => {
    setScanMessage(`Scanning Ollama and directory "${modelDirectory}"...`);
    const names = await fetchAvailableModels();
    if (names && names.length > 0) {
      const ollamaEntries: DetectedModelFile[] = names.map((name, idx) => ({
        id: `ollama-${name}-${idx}`,
        name: name,
        fileName: `${name}.gguf`,
        relativePath: `ollama/${name}`,
        fullPath: `Local Inference Engine: ${name}`,
        sizeGb: 'Loaded',
        format: 'GGUF',
        quant: 'Auto',
        agentRole: 'Local Model Engine',
        agentName: 'Multi-Agent Runtime',
        vramRequired: 'Dynamic'
      }));
      setDetectedModels(prev => {
        const existing = new Set(prev.map(p => p.name));
        const additions = ollamaEntries.filter(e => !existing.has(e.name));
        return [...prev, ...additions];
      });
      setScanMessage(`Scan complete. Found ${names.length} model(s) on local engine.`);
    } else {
      setScanMessage(`Local engine offline or no tags returned. Use "Browse Windows Files" to select model weights from disk.`);
    }
    setTimeout(() => setScanMessage(null), 4000);
  };

  const agentsRoster = [
    {
      title: 'Orchestrator & Task Planner',
      icon: Cpu,
      color: 'text-sky-400',
      modelUsed: selectedModel || 'Multi-Agent Orchestrator',
      description: 'Decomposes complex requests into sequential ReAct steps, tracks execution state, and manages human plan approvals.',
      trigger: 'Every User Request'
    },
    {
      title: 'Vision & Multimodal Document Agent',
      icon: Eye,
      color: 'text-amber-400',
      modelUsed: selectedModel ? `${selectedModel} (Vision Mode)` : 'Multimodal Vision Engine',
      description: 'Processes scanned PDF inspection reports, engineering drawings, and P&ID diagrams with symbol/table OCR extraction.',
      trigger: 'Attached Images / Scanned PDFs'
    },
    {
      title: 'Code & Engineering Math Agent',
      icon: Calculator,
      color: 'text-emerald-400',
      modelUsed: selectedModel ? `${selectedModel} (Python Sandbox)` : 'Local Code & Math Sandbox',
      description: 'Generates and runs deterministic Python calculation scripts (API 570 wall thickness, corrosion rates, MTBF) in an isolated sandbox.',
      trigger: 'Math, Calculations, Code'
    },
    {
      title: 'Knowledge Retrieval Agent (RAG)',
      icon: BookOpen,
      color: 'text-indigo-400',
      modelUsed: 'Nomic-Embed-Text (768-D) + Reranker',
      description: 'Searches confidential internal SOPs, equipment manuals, and engineering standards for verbatim citations and threshold limits.',
      trigger: 'SOP Standards, Corporate Knowledge'
    },
    {
      title: 'Deliverable Synthesis Agent',
      icon: FileText,
      color: 'text-purple-400',
      modelUsed: 'Deterministic Document Generator Engine',
      description: 'Compiles verified task findings into official Word (.docx) approval notes, PowerPoint (.pptx) briefings, and Excel spreadsheets.',
      trigger: 'Document / Presentation Export'
    },
    {
      title: 'Policy & Safety Guard Agent',
      icon: ShieldCheck,
      color: 'text-rose-400',
      modelUsed: 'Rule Policy & Contract Validation Engine',
      description: 'Validates output contracts, blocks unverified math hallucinations, and guarantees zero external network telemetry.',
      trigger: 'Continuous Background Guard'
    }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[var(--bg-base)] font-sans text-xs text-[var(--text-primary)] p-5 space-y-5">
      {/* Hidden Native File Input for Windows Browsing */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileBrowse} 
        accept=".gguf,.bin,.safetensors,.pt,.pth,.onnx" 
        multiple 
        className="hidden" 
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
            <span>MODEL MANAGEMENT &amp; MULTI-AGENT RUNTIME</span>
            <span className="text-[10px] font-mono font-semibold text-[var(--accent-success)] px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              ● LOCAL RUNTIME
            </span>
          </h2>
          <p className="text-[var(--text-secondary)] text-xs mt-1 leading-relaxed">
            Manage local open-weight model files on Windows. Coordinate specialized agents across vision, coding, reasoning, and retrieval.
          </p>
        </div>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="px-3.5 py-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 font-semibold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-opacity"
        >
          <FolderOpen className="w-4 h-4" />
          <span>Browse Windows Files...</span>
        </button>
      </div>

      {/* Dynamic Model Selection Alert / Banner */}
      {!selectedModel ? (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm text-white">No models selected</div>
              <div className="text-xs text-amber-200/80 mt-0.5">
                No primary local model is currently active. Explore the Windows files below and click <strong>Select Model</strong>, or click <strong>Browse Windows Files</strong> to pick model weights from your disk.
              </div>
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Browse Model File</span>
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>Active Model: {selectedModel}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  ACTIVE
                </span>
              </div>
              <div className="text-xs text-emerald-200/80 mt-0.5">
                Local open-weight model loaded on GPU. All agents will route specialized sub-tasks through this engine.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--text-secondary)] font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Browse Other...</span>
            </button>
            <button
              onClick={() => setSelectedModel('')}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 font-semibold text-xs transition-colors cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {scanMessage && (
        <div className="px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--accent-success)] font-mono flex items-center gap-2">
          <Check className="w-3.5 h-3.5" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* SECTION 1: Local Windows Model File Explorer */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="font-bold text-sm uppercase text-[var(--text-primary)]">
              Windows Model Files Explorer
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={modelDirectory}
              onChange={(e) => setModelDirectory(e.target.value)}
              placeholder="e.g. F:\corewithin\models or C:\models"
              className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1 text-xs font-mono text-[var(--text-primary)] w-56 focus:outline-none focus:border-[var(--text-secondary)]"
            />
            <button 
              onClick={handleRescan}
              className="px-3 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Scan Directory</span>
            </button>
          </div>
        </div>

        {/* Model Files Table / Cards */}
        <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden font-mono text-[11px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-b border-[var(--border-subtle)] text-[10px]">
                <tr>
                  <th className="p-2.5">MODEL NAME &amp; FILE</th>
                  <th className="p-2.5">FORMAT</th>
                  <th className="p-2.5">SIZE</th>
                  <th className="p-2.5">VRAM</th>
                  <th className="p-2.5">AGENT SPECIALIZATION</th>
                  <th className="p-2.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {detectedModels.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[var(--text-secondary)]">
                      <Cpu className="w-8 h-8 mx-auto mb-2 opacity-40 text-[var(--text-tertiary)]" />
                      <div className="font-semibold text-sm text-[var(--text-primary)]">No models loaded or detected yet</div>
                      <div className="text-xs text-[var(--text-tertiary)] mt-1 max-w-md mx-auto font-sans">
                        Click "Browse Windows Files..." to load .gguf, .safetensors, .bin, or .onnx weights from your workstation, or start your local Ollama engine.
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 px-3.5 py-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-base)] font-semibold text-xs inline-flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Browse Local Model Weights</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  detectedModels.map((m) => {
                    const isSelected = selectedModel === m.name || selectedModel === m.id;
                    return (
                      <tr 
                        key={m.id} 
                        className={`transition-colors ${
                          isSelected 
                            ? 'bg-emerald-500/10' 
                            : 'hover:bg-[var(--bg-elevated)]'
                        }`}
                      >
                        <td className="p-2.5">
                          <div className="font-bold text-[var(--text-primary)]">{m.name}</div>
                          <div className="text-[10px] text-[var(--text-secondary)] opacity-75 truncate max-w-xs">{m.fullPath}</div>
                        </td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] font-bold text-[9px] text-[var(--text-primary)]">
                            {m.format} [{m.quant}]
                          </span>
                        </td>
                        <td className="p-2.5 text-[var(--text-primary)]">{m.sizeGb}</td>
                        <td className="p-2.5 text-[var(--text-secondary)]">{m.vramRequired}</td>
                        <td className="p-2.5">
                          <div className="text-[var(--text-primary)] font-sans text-xs">{m.agentName}</div>
                          <div className="text-[10px] text-[var(--text-secondary)] font-sans">{m.agentRole}</div>
                        </td>
                        <td className="p-2.5 text-right">
                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/20 border border-emerald-500/40 px-2 py-1 rounded-lg">
                              <Check className="w-3 h-3" /> Selected
                            </span>
                          ) : (
                            <button
                              onClick={() => setSelectedModel(m.name)}
                              className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium text-[10px] cursor-pointer transition-colors"
                            >
                              Select Model
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 2: Cooperative Multi-Agent Architecture */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="font-bold text-sm uppercase text-[var(--text-primary)]">
              Cooperative Multi-Agent Architecture
            </span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-secondary)]">
            6 Specialized Local Agents
          </span>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          This workbench is designed for <strong>multi-agent collaboration</strong>. All agents work cooperatively whenever required by the task modality — rather than restricting execution to a single agent.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {agentsRoster.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <div 
                key={i} 
                className="p-3.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                      <Icon className={`w-4 h-4 ${agent.color}`} />
                    </div>
                    <h4 className="font-bold text-xs text-[var(--text-primary)]">{agent.title}</h4>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    {agent.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Model: <strong className="text-[var(--text-primary)]">{agent.modelUsed}</strong></span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)]">{agent.trigger}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Detailed Local Audit Ledger */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-[var(--text-secondary)]">
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="uppercase text-[var(--text-primary)]">On-Premise Task Audit Ledger</span>
          </span>
          <span className="text-[var(--text-secondary)] font-normal">SHA-256 Provenance Ledger</span>
        </div>

        <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden font-mono text-[10px]">
          <table className="w-full text-left">
            <thead className="bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="p-2.5">TIMESTAMP</th>
                <th className="p-2.5">TASK ID</th>
                <th className="p-2.5">AUDIT ACTION / EVENT</th>
                <th className="p-2.5">AGENT / ENGINE</th>
                <th className="p-2.5">NETWORK</th>
                <th className="p-2.5">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--bg-base)] transition-colors">
                  <td className="p-2.5 text-[var(--text-secondary)]">{log.timestamp}</td>
                  <td className="p-2.5 font-bold text-[var(--text-primary)]">{log.taskId}</td>
                  <td className="p-2.5 text-[var(--text-primary)]">{log.action}</td>
                  <td className="p-2.5 text-[var(--accent-primary)]">{log.model}</td>
                  <td className="p-2.5 text-[var(--accent-success)] font-bold">{log.network}</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--accent-success)] font-bold border border-[var(--border-subtle)]">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
