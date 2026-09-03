import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  PanelRight, 
  PanelRightClose, 
  Command
} from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';
import logo from '../../assets/logo.jpg';

export const AntigravityHeader: React.FC = () => {
  const { 
    sessions, 
    activeSessionId, 
    activeMode, 
    setActiveMode, 
    selectedModel, 
    setSelectedModel,
    isRightPaneOpen,
    toggleRightPane,
    setCommandPaletteOpen,
    setSecurityModalOpen
  } = useAntigravityStore();

  const currentSession = sessions.find(s => s.id === activeSessionId);

  return (
    <header className="h-9 bg-[#323233] border-b border-[#2b2b2b] px-3 flex items-center justify-between select-none flex-shrink-0 z-20 font-sans text-xs">
      {/* Left: Antigravity Branding & Workspace Breadcrumb */}
      <div className="flex items-center gap-2.5">
        <img src={logo.src} alt="LUMI" className="w-4 h-4 rounded object-cover shadow-sm" />
        <span className="font-semibold text-[#cccccc] tracking-tight flex items-center gap-1.5">
          <span>LUMI</span>
          <span className="text-[10px] font-mono text-[#858585] px-1.5 py-0.2 rounded bg-[#252526] border border-[#3c3c3c]">
            MRPL On-Prem
          </span>
        </span>

        <div className="h-3.5 w-[1px] bg-[#454545] mx-1 hidden sm:block"></div>

        <div className="hidden lg:flex items-center gap-1.5 text-[#858585] font-mono text-xs">
          <span>workspace</span>
          <span>/</span>
          <span className="text-[#cccccc] truncate max-w-[220px]">{currentSession?.title || 'Active Session'}</span>
        </div>
      </div>

      {/* Center: Mode Switcher & Local Model */}
      <div className="flex items-center gap-2">
        {/* Mode Toggle Pills */}
        <div className="flex items-center p-0.5 rounded bg-[#252526] border border-[#3c3c3c] font-mono text-xs">
          <button
            onClick={() => setActiveMode('agent')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              activeMode === 'agent' 
                ? 'bg-[#37373d] text-white font-bold' 
                : 'text-[#858585] hover:text-[#cccccc]'
            }`}
          >
            Agentic
          </button>
          <button
            onClick={() => setActiveMode('planning')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              activeMode === 'planning' 
                ? 'bg-[#37373d] text-white font-bold' 
                : 'text-[#858585] hover:text-[#cccccc]'
            }`}
          >
            Planning
          </button>
          <button
            onClick={() => setActiveMode('fast')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              activeMode === 'fast' 
                ? 'bg-[#37373d] text-white font-bold' 
                : 'text-[#858585] hover:text-[#cccccc]'
            }`}
          >
            Fast
          </button>
        </div>

        {/* Local Model Selector Dropdown */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#252526] px-2 py-0.5 rounded border border-[#3c3c3c] font-mono text-xs text-[#cccccc]">
          <Cpu className="w-3.5 h-3.5 text-[#569cd6]" />
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-transparent border-none text-xs text-[#cccccc] focus:outline-none cursor-pointer"
          >
            <option value="qwen3:8b (Local Resident)" className="bg-[#252526]">Qwen3-8B (Reasoning &amp; Planning)</option>
            <option value="qwen2.5-vl:7b (Multimodal)" className="bg-[#252526]">Qwen2.5-VL-7B (Vision &amp; P&amp;ID)</option>
            <option value="qwen2.5-coder:7b (Sandbox)" className="bg-[#252526]">Qwen2.5-Coder-7B (Python Scripts)</option>
          </select>
        </div>
      </div>

      {/* Right: LOCAL Badge + Command Palette + Right Pane Toggle */}
      <div className="flex items-center gap-2">
        {/* Clickable Air-Gap Sovereign Badge */}
        <button
          onClick={() => setSecurityModalOpen(true)}
          title="Click to view air-gap telemetry proof"
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1e1e1e] hover:bg-[#252526] border border-[#3c3c3c] hover:border-[#4ec9b0] font-mono text-xs text-[#4ec9b0] font-semibold transition-all cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ec9b0] animate-pulse"></span>
          <span>AIR-GAP (0 EXT)</span>
        </button>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          title="Open Command Palette (Ctrl+K)"
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#252526] hover:bg-[#37373d] text-[#858585] hover:text-[#cccccc] border border-[#3c3c3c] text-xs font-mono transition-colors cursor-pointer"
        >
          <Command className="w-3 h-3" />
          <span>K</span>
        </button>

        {/* Toggle Right Live Artifact / Viewer Pane */}
        <button
          onClick={toggleRightPane}
          title={isRightPaneOpen ? 'Close Artifacts Pane' : 'Open Artifacts Pane'}
          className={`p-1 rounded border transition-colors cursor-pointer ${
            isRightPaneOpen 
              ? 'bg-[#37373d] border-[#007acc] text-white' 
              : 'bg-[#252526] border-[#3c3c3c] text-[#858585] hover:text-[#cccccc]'
          }`}
        >
          {isRightPaneOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRight className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
