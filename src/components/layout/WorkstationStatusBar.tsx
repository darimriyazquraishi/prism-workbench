import React from 'react';
import { 
  Cpu, 
  Lock,
  GitBranch,
  Terminal,
  Activity
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

export const WorkstationStatusBar: React.FC = () => {
  const { activeTask, isProcessing } = useWorkbenchStore();

  const getAgentStatus = () => {
    if (isProcessing) return 'EXECUTING WORKFLOW...';
    if (!activeTask) return 'READY (IDLE)';
    if (activeTask.status === 'completed') return 'WORKFLOW COMPLETED & VERIFIED';
    if (activeTask.status === 'failed') return 'TASK FAILED';
    return activeTask.status.toUpperCase();
  };

  return (
    <footer className="h-7 bg-[#007acc] text-white px-3 flex items-center justify-between text-xs font-mono select-none flex-shrink-0 z-20">
      {/* Left: Source Control / Git & Agent State */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 hover:bg-[#1f8ad2] px-2 py-0.5 rounded cursor-pointer">
          <GitBranch className="w-3.5 h-3.5" />
          <span>main (air-gapped)</span>
        </div>

        <div className="h-3.5 w-[1px] bg-white/30"></div>

        <div className="flex items-center gap-2 font-bold">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          <span>AGENT: {getAgentStatus()}</span>
        </div>

        {activeTask && (
          <span className="text-white/80 hidden sm:inline">[{activeTask.task_id}]</span>
        )}
      </div>

      {/* Center: Resident Model & Docker Isolation */}
      <div className="hidden lg:flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5" />
          <span>MODEL: {activeTask ? activeTask.selected_model_name : 'qwen3:8b (Resident Local)'}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5" />
          <span>SANDBOX: DOCKER (--net=none)</span>
        </div>
      </div>

      {/* Right: Zero Ext Calls & Encoding */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-bold bg-[#1f8ad2] px-2 py-0.5 rounded">
          <Lock className="w-3.5 h-3.5" />
          <span>EXTERNAL CALLS: 0</span>
        </div>

        <span className="hidden sm:inline">UTF-8</span>
      </div>
    </footer>
  );
};
