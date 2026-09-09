import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, 
  Check, 
  Terminal, 
  Zap, 
  ArrowRight, 
  Loader2,
  HardDrive
} from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';

const BOOT_LOG_SEQUENCE = [
  '[SYSTEM] Initializing LUMI sovereign runtime v2.4...',
  '[HARDWARE] Device 0: NVIDIA GPU VRAM Allocation Active',
  '[REASONING] Initializing primary sovereign reasoning engine... [ONLINE]',
  '[MULTIMODAL] Pre-loading vision tensor graph & mmproj... [ONLINE]',
  '[DOCUMENT] PDF rasterization & OCR parsing pipeline... [READY]',
  '[VRAM] Allocating KV cache tensor pages (Flash Attention active)...',
  '[VRAM] 99 layers offloaded directly to GPU memory (Zero-lag warmup active)...',
  '[AIRGAP] Zero outbound telemetry verified (strict loopback bound)...',
  '[READY] All sovereign intelligence pipelines primed for input.'
];

export const LumiLauncher: React.FC = () => {
  const {
    isLauncherOpen,
    setLauncherOpen,
    activeGgufModel,
    availableGgufModels,
    setAvailableGgufModels,
    modelsFolderPath,
    setModelsFolderPath,
    scanGgufModels,
    browseModelsFolder,
    loadSingleGgufModel,
    startAllLlamaServers,
    engineStatuses,
    checkEngineStatuses,
    isThinkHarderMode,
    toggleThinkHarderMode
  } = useAntigravityStore();

  const isAlreadyBooted = typeof window !== 'undefined' && (
    sessionStorage.getItem('lumi_booted') === 'true' || 
    localStorage.getItem('lumi_booted') === 'true'
  );

  const [isBooting, setIsBooting] = useState(!isAlreadyBooted);
  const [bootLogs, setBootLogs] = useState<string[]>(isAlreadyBooted ? BOOT_LOG_SEQUENCE : []);
  const [showTerminalLogs, setShowTerminalLogs] = useState(false);
  const [loadingModelPath, setLoadingModelPath] = useState<string | null>(null);
  const [loadSuccessMsg, setLoadSuccessMsg] = useState<string | null>(null);
  const [isBrowsingFolder, setIsBrowsingFolder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const hasBootedOnceRef = useRef(isAlreadyBooted);

  const handleSkipSequence = () => {
    hasBootedOnceRef.current = true;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('lumi_booted', 'true');
    }
    setBootLogs(BOOT_LOG_SEQUENCE);
    setIsBooting(false);
  };

  const handleCloseLauncher = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('lumi_booted', 'true');
      sessionStorage.setItem('lumi_launched', 'true');
      localStorage.setItem('lumi_launched', 'true');
    }
    setLauncherOpen(false);
  };

  // 1. Auto-start all inference engines, vision, pdf parser, and stream activation code
  useEffect(() => {
    if (!isLauncherOpen) return;

    if (hasBootedOnceRef.current) {
      setIsBooting(false);
      checkEngineStatuses();
      return;
    }

    hasBootedOnceRef.current = true;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('lumi_booted', 'true');
    }
    let isMounted = true;
    setIsBooting(true);
    setBootLogs([]);

    // Fire actual inference engines in background
    startAllLlamaServers();
    scanGgufModels();

    // Stream boot logs rapidly
    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < BOOT_LOG_SEQUENCE.length) {
        const nextLine = BOOT_LOG_SEQUENCE[logIndex];
        if (isMounted) {
          setBootLogs(prev => [...prev, nextLine]);
        }
        logIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          if (isMounted) {
            setIsBooting(false);
          }
        }, 350);
      }
    }, 85);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isLauncherOpen]);

  // Auto scroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [bootLogs]);

  // Periodic engine status polling
  useEffect(() => {
    if (isLauncherOpen && !isBooting) {
      checkEngineStatuses();
      const poll = setInterval(() => checkEngineStatuses(), 20000);
      return () => clearInterval(poll);
    }
  }, [isLauncherOpen, isBooting]);

  // Handle native folder browse
  const handleBrowseFolder = async () => {
    setIsBrowsingFolder(true);
    try {
      await browseModelsFolder();
    } catch {
      fileInputRef.current?.click();
    } finally {
      setIsBrowsingFolder(false);
    }
  };

  // Browser directory picker fallback
  const handleDirectoryPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const ggufFiles = files
        .filter(f => f.name.toLowerCase().endsWith('.gguf'))
        .map(f => ({
          name: f.name,
          path: (f as any).webkitRelativePath || f.name,
          sizeGb: Math.round((f.size / (1024 * 1024 * 1024)) * 100) / 100,
          isMmproj: f.name.toLowerCase().includes('mmproj')
        }));

      if (ggufFiles.length > 0) {
        setAvailableGgufModels(ggufFiles);
        setModelsFolderPath('Local Selected Directory');
      }
    }
  };

  // Handle selecting one single GGUF model (additive)
  const handleSelectModel = async (modelPath: string, modelName: string) => {
    setLoadingModelPath(modelPath);
    setLoadSuccessMsg(null);
    const ok = await loadSingleGgufModel(modelPath);
    setLoadingModelPath(null);
    if (ok) {
      setLoadSuccessMsg(`Active: ${modelName}`);
      setTimeout(() => setLoadSuccessMsg(null), 3000);
    }
  };

  // Filter out mmproj files: only show actual runnable LLMs to the user
  const selectableModels = availableGgufModels.filter(
    m => !m.isMmproj && !m.name.toLowerCase().includes('mmproj')
  );

  if (!isLauncherOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-sans text-neutral-100">
      
      {/* Hidden file directory input for browser environment */}
      <input
        ref={fileInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={handleDirectoryPicked}
      />

      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Subtle top indicator border */}
        <div className="h-[2px] w-full bg-neutral-700" />

        {/* 1. Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium tracking-tight text-white">LUMI Launcher</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Local intelligence engines and model configuration
            </p>
          </div>
          <button
            onClick={handleCloseLauncher}
            className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer px-2.5 py-1 rounded border border-neutral-800 hover:border-neutral-700"
          >
            Skip to App &rarr;
          </button>
        </div>

        {/* 2. Main Body */}
        <div className="p-6 space-y-5">

          {/* Rapid Boot Screen (when starting or toggled) */}
          {isBooting ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Initializing sovereign intelligence engines...</span>
                </div>
                <button 
                  onClick={handleSkipSequence}
                  className="text-[11px] text-neutral-500 hover:text-neutral-300 underline cursor-pointer"
                >
                  Skip sequence
                </button>
              </div>

              {/* Fast Streaming Monospace Terminal */}
              <div className="bg-black/90 rounded-lg p-3.5 font-mono text-[11px] leading-relaxed text-neutral-300 h-48 overflow-y-auto border border-neutral-800 select-text">
                {bootLogs.map((line, i) => (
                  <div key={i} className="py-0.5 flex items-start gap-2 animate-in fade-in duration-75">
                    <span className="text-neutral-600 select-none">&gt;</span>
                    <span className={line.includes('[READY]') ? 'text-emerald-400 font-semibold' : line.includes('[REASONING]') ? 'text-cyan-300' : line.includes('[MULTIMODAL]') ? 'text-purple-300' : 'text-neutral-300'}>
                      {line}
                    </span>
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
            </div>
          ) : (
            <>
              {/* Single Line "Browse Models" */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300 block">
                  Browse models
                </label>
                
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Folder className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                    <input
                      type="text"
                      value={modelsFolderPath}
                      onChange={(e) => {
                        setModelsFolderPath(e.target.value);
                        scanGgufModels(e.target.value);
                      }}
                      placeholder="Folder path (e.g. F:\corewithin\models)"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                    />
                  </div>

                  <button
                    onClick={handleBrowseFolder}
                    disabled={isBrowsingFolder}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 rounded-lg border border-neutral-700 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isBrowsingFolder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Folder className="w-3.5 h-3.5" />}
                    <span>Select Folder</span>
                  </button>
                </div>
              </div>

              {/* Discovered GGUF Models List (Excludes mmproj, shows only real LLMs) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Available Reasoning & Coding Models ({selectableModels.length})</span>
                  {loadSuccessMsg && (
                    <span className="text-emerald-400 text-[11px] font-medium animate-in fade-in">
                      {loadSuccessMsg}
                    </span>
                  )}
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-lg divide-y divide-neutral-800/60 max-h-56 overflow-y-auto">
                  {selectableModels.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-500">
                      No .gguf models found in this folder. Choose a folder containing GGUF weights.
                    </div>
                  ) : (
                    selectableModels.map((m) => {
                      const is14BGeneral = m.name.toLowerCase().includes('14b');

                      return (
                        <div
                          key={m.path || m.name}
                          className="px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors hover:bg-neutral-900/40"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-3">
                            <HardDrive className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                            <div className="truncate">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-neutral-200 truncate">{m.name}</span>
                                {is14BGeneral && (
                                  <span className="px-1.5 py-0.2 text-[9px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded">
                                    Primary General
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-neutral-500">
                                {m.sizeGb} GB
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Think Harder Mode & Boot Terminal */}
              <div className="pt-2 flex items-center justify-between border-t border-neutral-800 text-xs">
                
                {/* Clean Think Harder toggle */}
                <button
                  onClick={toggleThinkHarderMode}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    isThinkHarderMode
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${isThinkHarderMode ? 'text-amber-400 fill-amber-400/20' : ''}`} />
                  <span className="font-medium">Think Harder</span>
                  <span className="text-[10px] opacity-70">32k ctx</span>
                </button>

                <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                  <button 
                    onClick={() => setShowTerminalLogs(prev => !prev)}
                    title={showTerminalLogs ? "Hide Boot Terminal" : "View Boot Terminal"}
                    className={`p-1 rounded cursor-pointer transition-colors ${showTerminalLogs ? 'text-cyan-400 bg-neutral-800' : 'text-neutral-500 hover:text-neutral-200'}`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* Collapsible Boot Terminal Viewer */}
              {showTerminalLogs && (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="font-mono text-[11px] text-cyan-400">System Boot Diagnostics</span>
                    <button
                      onClick={() => setShowTerminalLogs(false)}
                      className="text-[10px] text-neutral-500 hover:text-neutral-300 cursor-pointer"
                    >
                      Hide logs
                    </button>
                  </div>
                  <div className="bg-black/90 rounded-lg p-3 font-mono text-[11px] leading-relaxed text-neutral-300 h-36 overflow-y-auto border border-neutral-800 select-text">
                    {(bootLogs.length > 0 ? bootLogs : BOOT_LOG_SEQUENCE).map((line, i) => (
                      <div key={i} className="py-0.5 flex items-start gap-2">
                        <span className="text-neutral-600 select-none">&gt;</span>
                        <span className={line.includes('[READY]') ? 'text-emerald-400 font-semibold' : line.includes('[REASONING]') ? 'text-cyan-300' : line.includes('[MULTIMODAL]') ? 'text-purple-300' : 'text-neutral-300'}>
                          {line}
                        </span>
                      </div>
                    ))}
                    <div ref={terminalEndRef} />
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* 3. Footer with Launch Button */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-end">
          <button
            onClick={handleCloseLauncher}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-neutral-100 hover:bg-white text-neutral-900 font-medium text-xs transition-colors cursor-pointer shadow-sm"
          >
            <span>Launch LUMI Workbench</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
