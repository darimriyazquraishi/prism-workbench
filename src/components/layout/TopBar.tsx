import React from 'react';
import { 
  Cpu, 
  Command, 
  Terminal as TerminalIcon,
  PanelRightOpen,
  PanelRightClose,
  PanelLeftOpen,
  PanelLeftClose,
  ShieldCheck
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';
import logo from '../../assets/logo.jpg';

export const TopBar: React.FC = () => {
  const { 
    activeTask, 
    isTaskPanelOpen, 
    toggleTaskPanel, 
    setCommandPaletteOpen,
    isSidebarOpen,
    toggleSidebar,
    isBottomPanelOpen,
    setBottomPanelOpen,
    setSecurityModalOpen
  } = useWorkbenchStore();

  return (
    <header className="h-10 bg-[#252526] border-b border-[#2D2D2D] px-3 flex items-center justify-between select-none flex-shrink-0 z-20 font-sans text-xs">
      {/* Left: Product branding (ONLY place LUMI is displayed) */}
      <div className="flex items-center gap-2.5">
        <img src={logo.src} alt="LUMI" className="w-5 h-5 rounded-md object-cover shadow-sm" />
        <span className="font-semibold text-white tracking-tight text-sm">
          LUMI
        </span>

        {/* Toggle Workspace Explorer Sidebar (Ctrl+B) */}
        <button
          onClick={toggleSidebar}
          title={isSidebarOpen ? 'Hide Explorer (Ctrl+B)' : 'Show Explorer (Ctrl+B)'}
          className="ml-1 p-1 rounded hover:bg-[#333333] text-[#858585] hover:text-[#CCCCCC] border border-transparent transition-colors cursor-pointer"
        >
          {isSidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Center: Clean Title / Conversation Name */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#858585] bg-[#1E1E1E] px-3.5 py-1 rounded-lg border border-[#2D2D2D]">
        <span className="w-2 h-2 rounded-full bg-[#007ACC]"></span>
        <span className="text-[#CCCCCC] font-sans font-medium text-xs">
          {activeTask ? activeTask.objective.slice(0, 50) + (activeTask.objective.length > 50 ? '...' : '') : 'Workbench Chat'}
        </span>
      </div>

      {/* Right: Clean & Simple Controls */}
      <div className="flex items-center gap-2">
        {/* Model Indicator Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1E1E1E] border border-[#2D2D2D] font-mono text-xs text-[#858585]">
          <Cpu className="w-3.5 h-3.5 text-[#007ACC]" />
          <span className="text-[#CCCCCC] font-medium">Qwen3-14B</span>
        </div>

        {/* Terminal Toggle Button */}
        <button
          onClick={() => setBottomPanelOpen(!isBottomPanelOpen)}
          title="Toggle Terminal (Ctrl+`)"
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
            isBottomPanelOpen
              ? 'bg-[#1E1E1E] text-white border-[#007ACC]'
              : 'bg-[#1E1E1E] text-[#858585] hover:text-[#CCCCCC] border-[#2D2D2D]'
          }`}
        >
          <TerminalIcon className="w-3.5 h-3.5 text-[#4EC9B0]" />
          <span className="hidden md:inline">Terminal</span>
        </button>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          title="Open Command Palette (Ctrl+K)"
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1E1E1E] hover:bg-[#2A2D2E] text-[#858585] hover:text-[#CCCCCC] border border-[#2D2D2D] text-xs font-mono transition-colors cursor-pointer"
        >
          <Command className="w-3 h-3" />
          <span>K</span>
        </button>

        {/* Security / Privacy Details */}
        <button
          onClick={() => setSecurityModalOpen(true)}
          title="Privacy & Metadata Cleaner Status"
          className="p-1.5 rounded-lg bg-[#1E1E1E] hover:bg-[#2A2D2E] text-[#858585] hover:text-[#4EC9B0] border border-[#2D2D2D] transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#4EC9B0]" />
        </button>

        {/* Toggle Right Execution Steps Panel */}
        <button
          onClick={toggleTaskPanel}
          title={isTaskPanelOpen ? 'Hide Execution Steps' : 'View Execution Steps'}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
            isTaskPanelOpen 
              ? 'bg-[#2A2D2E] border-[#007ACC] text-[#007ACC]' 
              : 'bg-[#1E1E1E] border-[#2D2D2D] text-[#858585] hover:text-[#CCCCCC]'
          }`}
        >
          {isTaskPanelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
