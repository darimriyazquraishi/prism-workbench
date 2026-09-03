import React from 'react';
import { 
  Cpu, 
  Terminal, 
  Lock,
  GitBranch
} from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';

export const AntigravityStatusBar: React.FC = () => {
  const { isExecuting, activeSessionId, selectedModel, setSecurityModalOpen } = useAntigravityStore();

  return (
    <footer className="h-6 bg-[#007acc] text-white px-3 flex items-center justify-between text-xs font-mono select-none flex-shrink-0 z-20">
      {/* Left: Local & Agent state */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSecurityModalOpen(true)}
          className="flex items-center gap-1.5 hover:bg-[#1f8ad2] px-1.5 py-0.5 rounded cursor-pointer font-bold"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          <span>AIR-GAPPED SOVEREIGN</span>
        </button>

        <div className="h-3 w-[1px] bg-white/30"></div>

        <div className="flex items-center gap-1.5 font-bold">
          {isExecuting ? (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              Agent Executing...
            </span>
          ) : (
            <span>Agent Ready</span>
          )}
        </div>

        <span className="text-white/80 hidden sm:inline">[{activeSessionId}]</span>
      </div>

      {/* Center: Model & Sandbox */}
      <div className="hidden md:flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5" />
          <span>MODEL: {selectedModel.split(' ')[0]}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5" />
          <span>SANDBOX: DOCKER (--net=none)</span>
        </div>
      </div>

      {/* Right: Zero External Calls & Encoding */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1 font-bold bg-[#1f8ad2] px-1.5 py-0.2 rounded">
          <Lock className="w-3 h-3" />
          <span>EXT CALLS: 0</span>
        </div>

        <span className="hidden sm:inline">UTF-8</span>
      </div>
    </footer>
  );
};
