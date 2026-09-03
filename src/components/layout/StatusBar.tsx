import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  Lock,
  GitBranch
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

export const StatusBar: React.FC = () => {
  const { activeTask, isProcessing, setSecurityModalOpen } = useWorkbenchStore();

  const getAgentStatus = () => {
    if (isProcessing) return 'Agent Working...';
    if (!activeTask) return 'Agent Ready (Idle)';
    if (activeTask.status === 'completed') return 'Task Completed & Verified';
    if (activeTask.status === 'failed') return 'Task Failed';
    return activeTask.status;
  };

  return (
    <footer className="h-6 bg-[#007ACC] px-0 flex items-center justify-between text-xs font-mono select-none flex-shrink-0 z-20 text-white">
      {/* Left: Local & Agent state */}
      <div className="flex items-center gap-3 px-3 h-full">
        <button
          onClick={() => setSecurityModalOpen(true)}
          className="flex items-center gap-1.5 text-white hover:bg-[#0E639C] font-semibold cursor-pointer px-1 -mx-1 transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#4EC9B0]"></span>
          <span>LOCAL</span>
        </button>

        <div className="h-3 w-[1px] bg-white/40"></div>

        <div className="flex items-center gap-1.5 text-white">
          <span>{getAgentStatus()}</span>
        </div>

        {activeTask && (
          <span className="text-white/70 hidden sm:inline">[{activeTask.task_id}]</span>
        )}
      </div>

      {/* Center: Resident Model & Docker Isolation */}
      <div className="hidden md:flex items-center gap-4 text-xs px-2">
        <div className="flex items-center gap-1.5 text-white/90">
          <Cpu className="w-3 h-3 text-[#569CD6]" />
          <span>AUTO: {activeTask ? activeTask.selected_model_name : 'Qwen3 8B (Resident)'}</span>
        </div>

        <div className="flex items-center gap-1.5 text-white/90">
          <Terminal className="w-3 h-3 text-[#4EC9B0]" />
          <span>SANDBOX: DOCKER (--net=none)</span>
        </div>
      </div>

      {/* Right: Zero External Calls & UTF-8 */}
      <div className="flex items-center gap-3 px-3 h-full text-xs">
        <div className="flex items-center gap-1 text-white font-bold">
          <Lock className="w-3 h-3" />
          <span>EXT CALLS: 0</span>
        </div>

        <div className="h-3 w-[1px] bg-white/40"></div>

        <span className="hidden sm:inline text-white/70">UTF-8</span>
      </div>
    </footer>
  );
};