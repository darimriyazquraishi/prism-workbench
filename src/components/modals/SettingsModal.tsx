import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  ShieldCheck, 
  Sliders, 
  User, 
  Check, 
  HardDrive, 
  AlertCircle, 
  Terminal, 
  FileCheck, 
  Lock, 
  Sparkles,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

export const SettingsModal: React.FC = () => {
  const { 
    isSettingsOpen, 
    setSettingsOpen, 
    settingsTab, 
    setSettingsTab,
    selectedModel,
    setSelectedModel,
    userProfile,
    setUserProfile,
    clearMessages,
    clearTerminalLogs
  } = useWorkbenchStore();

  const [tempDisplayName, setTempDisplayName] = useState(userProfile.displayName);
  const [tempRole, setTempRole] = useState(userProfile.role);
  const [contextLength, setContextLength] = useState('16384');
  const [temperature, setTemperature] = useState('0.2');
  const [gpuLayers, setGpuLayers] = useState('33');
  const [autoScrub, setAutoScrub] = useState(true);
  const [saveToast, setSaveToast] = useState(false);

  if (!isSettingsOpen) return null;

  const modelsList = [
    {
      id: null,
      name: 'No model selected',
      tag: 'Standby',
      desc: 'Inference paused. Ideal for drafting prompts, browsing local documents, or reviewing previous deliverables without spinning up GPU/RAM.',
      precision: 'None',
      vram: '0 MB',
      recommendedFor: 'Standby / Review'
    },
    {
      id: 'Qwen3-14B',
      name: 'Qwen3-14B — Q4_K_M GGUF',
      tag: 'Main Agent',
      desc: 'High-precision reasoning, structured industrial report generation, multi-step RAG synthesis, and executive summaries.',
      precision: 'Q4_K_M',
      vram: '~8.4 GB',
      recommendedFor: 'Planning & Reports'
    },
    {
      id: 'Qwen2.5-Coder-7B',
      name: 'Qwen2.5-Coder-7B-Instruct — Q4_K_M GGUF',
      tag: 'Coding & Sandbox',
      desc: 'Specialized for writing and executing sandboxed Python scripts, data transformations, numerical statistics, and automated tests.',
      precision: 'Q4_K_M',
      vram: '~4.6 GB',
      recommendedFor: 'Python & Analysis'
    },
    {
      id: 'Qwen3-VL-8B',
      name: 'Qwen3-VL-8B-Instruct — Q4_K_M GGUF',
      tag: 'Multimodal Vision',
      desc: 'Scanned document extraction, engineering drawings, P&ID schematics, and mechanical tag inspection. Paired with mmproj-Qwen3VL-8B.',
      precision: 'Q4_K_M + F16',
      vram: '~5.8 GB',
      recommendedFor: 'Drawings & OCR'
    },
    {
      id: 'Qwen3-Embedding-0.6B',
      name: 'Qwen3-Embedding-0.6B + Reranker',
      tag: 'Vector RAG',
      desc: 'Dedicated local embedding model and neural cross-encoder reranker for lightning-fast sub-millisecond document retrieval.',
      precision: 'F16 / INT8',
      vram: '~1.2 GB',
      recommendedFor: 'Local Vector DB'
    }
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile({
      displayName: tempDisplayName.trim() || 'Local User',
      role: tempRole.trim() || 'Security & Engineering Operator'
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-200">
      <div className="bg-[#1C1D1E] border border-[#2E3133] rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#282A2C] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-[#20B8CD]" />
            <span className="text-sm font-semibold text-white">Workbench Settings</span>
            <span className="px-2 py-0.5 rounded-full bg-[#242628] text-[10px] text-[#858A8E] font-mono border border-[#323638]">
              Air-Gapped
            </span>
          </div>

          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-[#282A2C] text-[#858A8E] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Left Tab Nav & Right Content Panel */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Tabs Nav Rail */}
          <div className="w-full md:w-52 bg-[#171819] border-r border-[#242627] p-2.5 space-y-1 flex-shrink-0">
            <button
              onClick={() => setSettingsTab('models')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                settingsTab === 'models'
                  ? 'bg-[#222425] text-white border border-[#2E3133]'
                  : 'text-[#858A8E] hover:text-white hover:bg-[#1D1E1F]'
              }`}
            >
              <Cpu className={`w-3.5 h-3.5 ${settingsTab === 'models' ? 'text-[#20B8CD]' : ''}`} />
              <span>Models &amp; Weights</span>
            </button>

            <button
              onClick={() => setSettingsTab('engine')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                settingsTab === 'engine'
                  ? 'bg-[#222425] text-white border border-[#2E3133]'
                  : 'text-[#858A8E] hover:text-white hover:bg-[#1D1E1F]'
              }`}
            >
              <Terminal className={`w-3.5 h-3.5 ${settingsTab === 'engine' ? 'text-[#20B8CD]' : ''}`} />
              <span>Local Engine</span>
            </button>

            <button
              onClick={() => setSettingsTab('privacy')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                settingsTab === 'privacy'
                  ? 'bg-[#222425] text-white border border-[#2E3133]'
                  : 'text-[#858A8E] hover:text-white hover:bg-[#1D1E1F]'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${settingsTab === 'privacy' ? 'text-[#20B8CD]' : ''}`} />
              <span>Privacy &amp; Scrubbing</span>
            </button>

            <button
              onClick={() => setSettingsTab('profile')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                settingsTab === 'profile'
                  ? 'bg-[#222425] text-white border border-[#2E3133]'
                  : 'text-[#858A8E] hover:text-white hover:bg-[#1D1E1F]'
              }`}
            >
              <User className={`w-3.5 h-3.5 ${settingsTab === 'profile' ? 'text-[#20B8CD]' : ''}`} />
              <span>User Profile</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: MODELS & WEIGHTS */}
            {settingsTab === 'models' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-white">Active LLM &amp; Weight Selection</h2>
                  <p className="text-xs text-[#858A8E] mt-1">
                    Select which local open-weight model to engage for inference. When "No model selected" is active, inference remains in standby.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {modelsList.map((m) => {
                    const isSelected = selectedModel === m.id;
                    return (
                      <div
                        key={m.name}
                        onClick={() => setSelectedModel(m.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? 'bg-[#20B8CD]/10 border-[#20B8CD] text-white shadow-sm'
                            : 'bg-[#202222] border-[#2A2C2E] hover:border-[#383C3E] text-[#CCCCCC]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-[13px]">{m.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                              isSelected
                                ? 'bg-[#20B8CD]/20 border-[#20B8CD]/40 text-[#20B8CD]'
                                : 'bg-[#2A2D2E] border-[#363A3C] text-[#858A8E]'
                            }`}>
                              {m.tag}
                            </span>
                          </div>

                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#20B8CD] border-[#20B8CD] text-black'
                              : 'border-[#4A4E50]'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <p className="text-[11.5px] text-[#A2A8AB] leading-relaxed">
                          {m.desc}
                        </p>

                        <div className="flex items-center gap-4 text-[10.5px] text-[#767C80] font-mono pt-1 border-t border-white/5">
                          <span>Quant: <strong className="text-[#C5C9CB]">{m.precision}</strong></span>
                          <span>VRAM: <strong className="text-[#C5C9CB]">{m.vram}</strong></span>
                          <span>Best for: <strong className="text-[#20B8CD]">{m.recommendedFor}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: LOCAL ENGINE */}
            {settingsTab === 'engine' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-white">Local Inference Engine</h2>
                  <p className="text-xs text-[#858A8E] mt-1">
                    Fine-tune hardware offload layers, context limits, and deterministic response temperature.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#202222] border border-[#2A2C2E] space-y-4">
                  {/* Context Length */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-white">Context Window Limit</span>
                      <span className="font-mono text-[#20B8CD]">{parseInt(contextLength).toLocaleString()} tokens</span>
                    </div>
                    <input 
                      type="range" 
                      min="4096" 
                      max="32768" 
                      step="4096"
                      value={contextLength}
                      onChange={(e) => setContextLength(e.target.value)}
                      className="w-full accent-[#20B8CD] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#6A7074] font-mono">
                      <span>4K (Ultra-Fast)</span>
                      <span>16K (Balanced)</span>
                      <span>32K (Large Docs)</span>
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="space-y-1.5 pt-2 border-t border-[#2A2C2E]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-white">Generation Temperature</span>
                      <span className="font-mono text-[#20B8CD]">{temperature}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.0" 
                      max="1.0" 
                      step="0.05"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full accent-[#20B8CD] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#6A7074] font-mono">
                      <span>0.0 (Strict / Code / Audit)</span>
                      <span>0.7 (Creative)</span>
                    </div>
                  </div>

                  {/* GPU Offload */}
                  <div className="space-y-1.5 pt-2 border-t border-[#2A2C2E]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-white">GPU Layers Offload (cuBLAS / Metal)</span>
                      <span className="font-mono text-[#20B8CD]">{gpuLayers} layers</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="33" 
                      step="1"
                      value={gpuLayers}
                      onChange={(e) => setGpuLayers(e.target.value)}
                      className="w-full accent-[#20B8CD] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#6A7074] font-mono">
                      <span>0 (CPU Only)</span>
                      <span>33 (Full VRAM Acceleration)</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1C1E1F] border border-[#27292A] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <Lock className="w-4 h-4 text-[#20B8CD]" />
                    <span className="font-medium">Physical Air-Gap Lock</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#1F3336] text-[#20B8CD] border border-[#20B8CD]/30 text-[10px] font-mono">
                    ENFORCED
                  </span>
                </div>
              </div>
            )}

            {/* TAB 3: PRIVACY & SCRUBBING */}
            {settingsTab === 'privacy' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-white">Privacy &amp; Data Sanitization</h2>
                  <p className="text-xs text-[#858A8E] mt-1">
                    Control automated metadata stripping and local ephemeral data storage policies.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#202222] border border-[#2A2C2E] space-y-4">
                  {/* Metadata Stripper Toggle */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium text-white text-xs">Automatic Document Metadata Stripper</div>
                      <div className="text-[11px] text-[#858A8E] mt-0.5 leading-relaxed">
                        Whenever PDF, DOCX, CSV or image files are uploaded, automatically scrub EXIF tags, author names, software fingerprints, and GPS coordinates.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoScrub(!autoScrub)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                        autoScrub ? 'bg-[#20B8CD]' : 'bg-[#3A3D3F]'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        autoScrub ? 'left-6' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  <div className="pt-3 border-t border-[#2A2C2E] flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium text-white text-xs">Zero Outbound Telemetry Policy</div>
                      <div className="text-[11px] text-[#858A8E] mt-0.5 leading-relaxed">
                        All prompt completions and token statistics remain strictly in host RAM. No telemetry pings or crash reports are ever broadcast.
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#1F3336] text-[#20B8CD] border border-[#20B8CD]/30 text-[10px] font-mono">
                      ACTIVE
                    </span>
                  </div>
                </div>

                {/* Clear Data Buttons */}
                <div className="p-4 rounded-2xl bg-[#202222] border border-[#2A2C2E] space-y-3">
                  <div className="font-semibold text-white text-xs">Session Sanitization Actions</div>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => {
                        clearMessages();
                        setSettingsOpen(false);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#282020] hover:bg-[#352626] border border-[#502C2C] text-[#E08080] hover:text-[#FFA0A0] transition-colors flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Chat &amp; Attachments</span>
                    </button>

                    <button
                      onClick={() => {
                        clearTerminalLogs();
                      }}
                      className="px-3 py-2 rounded-xl bg-[#242627] hover:bg-[#2C2E30] border border-[#36393B] text-[#CCCCCC] hover:text-white transition-colors flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset Terminal Logs</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: USER PROFILE */}
            {settingsTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-white">Local User Identity</h2>
                  <p className="text-xs text-[#858A8E] mt-1">
                    Set your display identity used for session headers and audit signature logs.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#202222] border border-[#2A2C2E] space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white">Display Name</label>
                    <input 
                      type="text"
                      value={tempDisplayName}
                      onChange={(e) => setTempDisplayName(e.target.value)}
                      placeholder="e.g. Lead Engineer, Operator"
                      className="w-full bg-[#161717] border border-[#2E3133] rounded-xl px-3 py-2 text-xs text-white placeholder-[#5F6467] outline-none focus:border-[#20B8CD]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white">Role / Organization Unit</label>
                    <input 
                      type="text"
                      value={tempRole}
                      onChange={(e) => setTempRole(e.target.value)}
                      placeholder="e.g. Security & Engineering"
                      className="w-full bg-[#161717] border border-[#2E3133] rounded-xl px-3 py-2 text-xs text-white placeholder-[#5F6467] outline-none focus:border-[#20B8CD]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white">Deployment Plan</label>
                    <div className="w-full bg-[#191A1A] border border-[#282A2C] rounded-xl px-3 py-2 text-xs text-[#A2A8AB] font-mono">
                      {userProfile.plan}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-white hover:bg-[#EDEDED] text-black font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Save Profile
                  </button>

                  {saveToast && (
                    <span className="text-[#20B8CD] font-medium text-xs animate-in fade-in flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      Profile saved successfully!
                    </span>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
