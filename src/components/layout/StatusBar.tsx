import React from 'react';
import { 
  Terminal, 
  GitBranch,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

export const StatusBar: React.FC = () => {
  const { isProcessing, setBottomPanelOpen, isBottomPanelOpen, setSecurityModalOpen } = useWorkbenchStore();

  return (
    <footer className="h-6 bg-[#007ACC] px-2 flex items-center justify-between text-xs font-mono select-none flex-shrink-0 z-20 text-white">
      {/* Left: Git Branch, Problems & Terminal Trigger */}
      <div className="flex items-center gap-3 h-full">
        {/* Branch / Git */}
        <div className="flex items-center gap-1.5 hover:bg-[#0E639C] px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>

        {/* Problems count */}
        <div className="flex items-center gap-1 hover:bg-[#0E639C] px-1.5 py-0.5 rounded cursor-pointer transition-colors text-[11px]">
          <span className="flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>0</span>
          </span>
          <span className="flex items-center gap-0.5 ml-1">
            <AlertCircle className="w-3 h-3" />
            <span>0</span>
          </span>
        </div>

        {/* Quick Terminal Dock Toggle */}
        <button
          onClick={() => setBottomPanelOpen(!isBottomPanelOpen)}
          className="flex items-center gap-1 hover:bg-[#0E639C] px-1.5 py-0.5 rounded cursor-pointer transition-colors"
          title="Toggle Terminal Panel"
        >
          <Terminal className="w-3 h-3" />
          <span>Terminal</span>
        </button>

        {/* Active execution indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-white/90 text-[11px]">
          <span className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-amber-300 animate-ping' : 'bg-emerald-300'}`}></span>
          <span>{isProcessing ? 'Processing request...' : 'Ready'}</span>
        </div>
      </div>

      {/* Right: Clean VS Code Indicators */}
      <div className="flex items-center gap-3 h-full text-[11px]">
        <span className="hidden sm:inline text-white/80">Ln 1, Col 1</span>
        <span className="hidden sm:inline text-white/80">Spaces: 2</span>
        <span className="text-white">UTF-8</span>
      </div>
    </footer>
  );
};