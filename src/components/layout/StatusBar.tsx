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
    <footer className="h-6 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] px-3 flex items-center justify-between text-xs font-mono select-none flex-shrink-0 z-20 text-[var(--text-secondary)]">
      {/* Left: Local & Agent state */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSecurityModalOpen(true)}
          className="flex items-center gap-1.5 text-[var(--status-healthy)] hover:text-[var(--text-primary)] font-semibold cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-healthy)]"></span>
          <span>LOCAL</span>
        </button>

        <div className="h-3 w-[1px] bg-[var(--border-subtle)]"></div>

        <div className="flex items-center gap-1.5 text-[var(--text-primary)]">
          <span>{getAgentStatus()}</span>
        </div>

        {activeTask && (
          <span className="text-[var(--text-secondary)] hidden sm:inline">[{activeTask.task_id}]</span>
        )}
      </div>

      {/* Center: Resident Model & Docker Isolation */}
      <div className="hidden md:flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          <Cpu className="w-3 h-3 text-[var(--accent-fuchsia)]" />
          <span>AUTO: {activeTask ? activeTask.selected_model_name : 'Qwen3 8B (Resident)'}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          <Terminal className="w-3 h-3 text-[var(--status-healthy)]" />
          <span>SANDBOX: DOCKER (--net=none)</span>
        </div>
      </div>

      {/* Right: Zero External Calls & UTF-8 */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1 text-[var(--status-healthy)] font-bold">
          <Lock className="w-3 h-3" />
          <span>EXT CALLS: 0</span>
        </div>

        <span className="hidden sm:inline text-[var(--text-secondary)]">UTF-8</span>
      </div>
    </footer>
  );
};
