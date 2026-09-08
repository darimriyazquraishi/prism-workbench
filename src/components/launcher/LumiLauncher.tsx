import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Eye, 
  Code2, 
  Zap, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Play, 
  Square, 
  ArrowRight, 
  HardDrive,
  Activity,
  Layers,
  Sparkles,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';

export const LumiLauncher: React.FC = () => {
  const {
    isLauncherOpen,
    setLauncherOpen,
    selectedGeneralModel,
    setSelectedGeneralModel,
    selectedCodingModel,
    setSelectedCodingModel,
    selectedVisionEngine,
    setSelectedVisionEngine,
    isThinkHarderMode,
    toggleThinkHarderMode,
    engineStatuses,
    cacheStatus,
    checkEngineStatuses,
    warmupModelCacheAction,
    startVisionServerDaemon,
    stopVisionServerDaemon,
    startOllamaDaemon
  } = useAntigravityStore();

  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [warmupProgress, setWarmupProgress] = useState(0);
  const [warmupMessage, setWarmupMessage] = useState('');
  const [isStartingVision, setIsStartingVision] = useState(false);
  const [isStartingOllama, setIsStartingOllama] = useState(false);

  useEffect(() => {
    if (isLauncherOpen) {
      checkEngineStatuses();
      const interval = setInterval(() => {
        checkEngineStatuses();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isLauncherOpen, checkEngineStatuses]);

  const handleWarmup = async () => {
    setIsWarmingUp(true);
    setWarmupProgress(20);
    setWarmupMessage(`Initiating VRAM cache pre-load for ${selectedGeneralModel}...`);

    setTimeout(() => setWarmupProgress(50), 600);
    setTimeout(() => setWarmupProgress(80), 1200);

    const res = await warmupModelCacheAction(selectedGeneralModel);
    setWarmupProgress(100);

    if (res.success) {
      setWarmupMessage(`✓ ${selectedGeneralModel} cached in VRAM in ${res.durationMs}ms (Zero-latency active)`);
    } else {
      setWarmupMessage(`Notice: ${selectedGeneralModel} cache warming returned: ${res.durationMs}ms`);
    }
    setTimeout(() => setIsWarmingUp(false), 2000);
  };

  const handleToggleVision = async () => {
    if (engineStatuses.visionServer) {
      await stopVisionServerDaemon();
    } else {
      setIsStartingVision(true);
      await startVisionServerDaemon();
      setTimeout(async () => {
        await checkEngineStatuses();
        setIsStartingVision(false);
      }, 3000);
    }
  };

  const handleStartOllama = async () => {
    setIsStartingOllama(true);
    await startOllamaDaemon();
    setTimeout(async () => {
      await checkEngineStatuses();
      setIsStartingOllama(false);
    }, 2500);
  };

  if (!isLauncherOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans text-[var(--text-primary)]">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-80" />

        {/* 1. Header */}
        <div className="p-6 pb-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">LUMI System Launcher</h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                  Autonomous Intelligence
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 100% Air-Gapped
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Configure orchestrator models, warm up GPU VRAM cache, and verify local inference engines.
              </p>
            </div>
          </div>

          <button
            onClick={() => setLauncherOpen(false)}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Skip to App
          </button>
        </div>

        {/* 2. Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section: Model Configuration */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Specialist AI Model Arsenal
              </h3>
              <span className="text-[11px] text-[var(--text-secondary)]">All prompts route through your selected General LLM</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Card 1: General Reasoning LLM */}
              <div className={`p-4 rounded-xl border transition-all ${selectedGeneralModel === 'qwen3:14b' ? 'bg-blue-500/5 border-blue-500/30 shadow-sm shadow-blue-500/10' : 'bg-[var(--bg-elevated)]/30 border-[var(--border-subtle)]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">General Reasoning</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium">Master</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] mb-3 leading-relaxed">
                  Extracts user intent, designs multi-agent execution plans, and synthesizes answers.
                </p>
                <select
                  value={selectedGeneralModel}
                  onChange={(e) => setSelectedGeneralModel(e.target.value)}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="qwen3:14b">Qwen 3 14B (Recommended)</option>
                  <option value="qwen3:8b">Qwen 3 8B (Fast)</option>
                </select>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{cacheStatus.generalLlmWarm ? 'Loaded in VRAM (Warm)' : 'Ready to Cache'}</span>
                </div>
              </div>

              {/* Card 2: Coding Specialist */}
              <div className="p-4 rounded-xl border bg-[var(--bg-elevated)]/30 border-[var(--border-subtle)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">Code & Python</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">Specialist</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] mb-3 leading-relaxed">
                  Generates deterministic code, calculates engineering models, and runs sandbox scripts.
                </p>
                <select
                  value={selectedCodingModel}
                  onChange={(e) => setSelectedCodingModel(e.target.value)}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="qwen2.5-coder:7b">Qwen 2.5 Coder 7B (Default)</option>
                </select>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Installed & Offline</span>
                </div>
              </div>

              {/* Card 3: Multimodal Vision */}
              <div className="p-4 rounded-xl border bg-[var(--bg-elevated)]/30 border-[var(--border-subtle)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">Vision & OCR</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium">CUDA GPU</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] mb-3 leading-relaxed">
                  Extracts text, schematics, and diagrams from images with dedicated hardware mmproj.
                </p>
                <select
                  value={selectedVisionEngine}
                  onChange={(e) => setSelectedVisionEngine(e.target.value)}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 font-medium"
                >
                  <option value="cuda-llama-server">Qwen3-VL 8B (CUDA Port 8080)</option>
                  <option value="ollama-vision">Ollama Vision Engine (Port 11434)</option>
                </select>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono">
                  {engineStatuses.visionServer ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Port 8080 Active (GPU)</span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Standby (Auto-start enabled)</span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Section: Daemons & Port Controls */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              Engine Daemon Services
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Daemon 1: Ollama Core */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)]/40 border border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${engineStatuses.ollama ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse' : 'bg-red-500'}`} />
                  <div>
                    <div className="text-xs font-semibold">Ollama Core Inference Engine</div>
                    <div className="text-[11px] text-[var(--text-secondary)] font-mono">127.0.0.1:11434 (Planning, Coding, RAG)</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded ${engineStatuses.ollama ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {engineStatuses.ollama ? 'RUNNING' : 'OFFLINE'}
                  </span>
                  {!engineStatuses.ollama && (
                    <button
                      onClick={handleStartOllama}
                      disabled={isStartingOllama}
                      className="px-2.5 py-1 text-[11px] rounded bg-blue-600 hover:bg-blue-500 text-white font-medium cursor-pointer flex items-center gap-1"
                    >
                      {isStartingOllama ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      Start
                    </button>
                  )}
                </div>
              </div>

              {/* Daemon 2: CUDA Vision Server */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)]/40 border border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${engineStatuses.visionServer ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse' : 'bg-amber-500'}`} />
                  <div>
                    <div className="text-xs font-semibold">CUDA Multimodal Vision Server</div>
                    <div className="text-[11px] text-[var(--text-secondary)] font-mono">127.0.0.1:8080 (Qwen3-VL 8B + mmproj)</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded ${engineStatuses.visionServer ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    {engineStatuses.visionServer ? 'ACTIVE' : 'STANDBY'}
                  </span>
                  <button
                    onClick={handleToggleVision}
                    disabled={isStartingVision}
                    className={`px-2.5 py-1 text-[11px] rounded font-medium cursor-pointer flex items-center gap-1 transition-colors ${
                      engineStatuses.visionServer
                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
                  >
                    {isStartingVision ? <RefreshCw className="w-3 h-3 animate-spin" /> : engineStatuses.visionServer ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {engineStatuses.visionServer ? 'Stop' : 'Start'}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Section: GPU VRAM Cache Warming & Power Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* VRAM Cache Warming */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--bg-elevated)]/60 to-[var(--bg-base)] border border-[var(--border-subtle)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>GPU VRAM Cache Preloader</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">Zero-Lag Warmup</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] mb-3 leading-relaxed">
                  Pre-loads {selectedGeneralModel} model weights into GPU memory so your first message runs instantly without cold-start delay.
                </p>
                {warmupMessage && (
                  <div className="mb-3 text-[11px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 p-2 rounded-lg">
                    {warmupMessage}
                  </div>
                )}
                {isWarmingUp && (
                  <div className="w-full bg-[var(--bg-surface)] h-1.5 rounded-full overflow-hidden mb-3 border border-[var(--border-subtle)]">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                      style={{ width: `${warmupProgress}%` }}
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleWarmup}
                disabled={isWarmingUp}
                className="w-full py-2 px-3 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isWarmingUp ? 'animate-spin' : ''}`} />
                {isWarmingUp ? 'Pre-loading Weights...' : 'Warm Up Model Cache'}
              </button>
            </div>

            {/* Think Harder Mode (Max Power) */}
            <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
              isThinkHarderMode 
                ? 'bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-transparent border-amber-500/40 shadow-md shadow-amber-500/10' 
                : 'bg-[var(--bg-elevated)]/40 border-[var(--border-subtle)]'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                    <Flame className={`w-4 h-4 ${isThinkHarderMode ? 'text-amber-400 animate-pulse' : 'text-zinc-400'}`} />
                    <span>"Think Harder" Mode</span>
                  </div>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                    isThinkHarderMode 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    {isThinkHarderMode ? 'MAX POWER ON' : 'STANDARD'}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] mb-3 leading-relaxed">
                  Engages maximum reasoning compute: 32,768-token context, extended deliberation tokens, and multi-perspective verification.
                </p>
              </div>

              <button
                onClick={toggleThinkHarderMode}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  isThinkHarderMode
                    ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20 hover:bg-amber-400'
                    : 'bg-[var(--bg-base)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]'
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${isThinkHarderMode ? 'fill-black' : ''}`} />
                {isThinkHarderMode ? '⚡ Max Power Engaged' : 'Enable Think Harder Mode'}
              </button>
            </div>

          </div>

        </div>

        {/* 3. Footer Launch Bar */}
        <div className="p-4 px-6 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-blue-400" />
              <span>NVIDIA RTX 4070 SUPER (12 GB VRAM)</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>General Orchestrator: {selectedGeneralModel}</span>
            </div>
          </div>

          <button
            onClick={() => setLauncherOpen(false)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 cursor-pointer flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Launch LUMI Workbench</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
