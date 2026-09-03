import React from 'react';
import { 
  ShieldCheck, 
  WifiOff, 
  Cpu, 
  Command, 
  Search,
  CheckCircle2,
  PanelRightOpen,
  PanelRightClose,
  PanelLeftOpen,
  PanelLeftClose,
  Play
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';
import logo from '../../assets/logo.jpg';

export const TopBar: React.FC = () => {
  const { 
    activeTask, 
    isTaskPanelOpen, 
    toggleTaskPanel, 
    setCommandPaletteOpen,
    setSecurityModalOpen,
    isSidebarOpen,
    toggleSidebar 
  } = useWorkbenchStore();

  return (
    <header className="h-10 bg-[#323233] border-b border-[#2D2D2D] px-3 flex items-center justify-between select-none flex-shrink-0 z-20 font-sans text-xs">
      {/* Left: Product branding */}
      <div className="flex items-center gap-2.5">
        <img src={logo.src} alt="LUMI" className="w-5 h-5 rounded object-cover shadow-sm" />
        <span className="font-semibold text-[#CCCCCC] tracking-tight text-sm">
          LUMI
        </span>

        {/* Toggle Workspace Panel (Activity Bar stays visible) */}
        <button
          onClick={toggleSidebar}
          title={isSidebarOpen ? 'Hide Workspace Panel (Ctrl+B)' : 'Show Workspace Panel (Ctrl+B)'}
          className="ml-1 p-1 rounded hover:bg-[#2A2D2E] text-[#858585] hover:text-[#CCCCCC] border border-transparent hover:border-[#3C3C3C] transition-colors cursor-pointer"
        >
          {isSidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Center: Current active conversation / task */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#858585] bg-[#1E1E1E] px-3 py-1 rounded border border-[#3C3C3C]">
        <span className="text-[#007ACC]">●</span>
        <span className="text-[#CCCCCC] font-sans font-medium">
          {activeTask ? activeTask.objective.slice(0, 55) + (activeTask.objective.length > 55 ? '...' : '') : 'Equipment Inspection & Maintenance Workbench'}
        </span>
      </div>

      {/* Right: AUTO Model + LOCAL badge + Command Palette + Task Panel Toggle */}
      <div className="flex items-center gap-2">
        {/* Run Demo Button */}
        <button
          onClick={() => useWorkbenchStore.getState().runDemo('inspection')}
          title="Run Flagship Inspection Demo"
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#4EC9B0] hover:bg-[#4EC9B0] text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>RUN DEMO</span>
        </button>

        {/* Auto Model Selection Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1E1E1E] border border-[#3C3C3C] font-mono text-xs text-[#858585]">
          <Cpu className="w-3.5 h-3.5 text-[#007ACC]" />
          <span className="font-bold text-[#CCCCCC]">AUTO</span>
          <span className="text-[#666666]">({activeTask ? activeTask.selected_model_id : 'Qwen3-8B'})</span>
        </div>

        {/* Clickable Local Security Badge */}
        <button
          onClick={() => setSecurityModalOpen(true)}
          title="Click to view air-gap telemetry & security proof"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1E1E1E] hover:bg-[#2A2D2E] border border-[#3C3C3C] hover:border-[#4EC9B0] font-mono text-xs text-[#4EC9B0] font-semibold transition-all cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-[#4EC9B0] animate-pulse"></span>
          <span>LOCAL</span>
        </button>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          title="Open Command Palette (Ctrl+K)"
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#1E1E1E] hover:bg-[#2A2D2E] text-[#858585] hover:text-[#CCCCCC] border border-[#3C3C3C] text-xs font-mono transition-colors cursor-pointer"
        >
          <Command className="w-3 h-3" />
          <span>K</span>
        </button>

        {/* Toggle Right Task Panel */}
        <button
          onClick={toggleTaskPanel}
          title={isTaskPanelOpen ? 'Hide Task Activity' : 'Show Task Activity'}
          className={`p-1.5 rounded border transition-colors cursor-pointer ${
            isTaskPanelOpen 
              ? 'bg-[#2A2D2E] border-[#007ACC] text-[#007ACC]' 
              : 'bg-[#1E1E1E] border-[#3C3C3C] text-[#858585] hover:text-[#CCCCCC]'
          }`}
        >
          {isTaskPanelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
