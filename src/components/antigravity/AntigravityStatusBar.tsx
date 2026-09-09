import React, { useState } from 'react';
import { 
  Cpu, 
  Terminal, 
  Lock,
  GitBranch,
  ChevronUp,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';
import { NetworkMonitorModal } from './NetworkMonitorModal';

export const AntigravityStatusBar: React.FC = () => {
  const { 
    isExecuting, 
    selectedModel, 
    isNetworkModalOpen, 
    setNetworkModalOpen, 
    setSecurityModalOpen,
    setServerHealthModalOpen,
    isServerOnline,
    networkLogs 
  } = useAntigravityStore();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isExpanded) {
    return (
      <div 
        className="fixed bottom-0 right-4 h-6 px-3 bg-[var(--bg-surface)] text-[var(--text-secondary)] flex items-center justify-center text-xs font-mono cursor-pointer rounded-t-md border border-b-0 border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] z-50 shadow-sm transition-colors"
        onClick={() => setIsExpanded(true)}
        title="Show Status Bar"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isServerOnline ? 'bg-[var(--accent-success)]' : 'bg-rose-500'} mr-2`}></span>
        <ChevronUp className="w-3 h-3" />
      </div>
    );
  }

  return (
    <>
      <footer 
        className="h-6 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] text-[var(--text-secondary)] px-3 flex items-center justify-between text-xs font-mono select-none flex-shrink-0 z-20"
      >
        {/* Left: Connection state & Agent status */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setServerHealthModalOpen(true)}
            title="Click for Server Health Metrics"
            className="flex items-center gap-1.5 font-medium text-[var(--text-primary)] hover:opacity-80 transition-opacity cursor-pointer text-xs"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isServerOnline ? 'bg-[var(--accent-success)]' : 'bg-rose-500'}`}></span>
            <span>{isServerOnline ? 'Ready' : 'Offline'}</span>
          </button>

          {isExecuting && (
            <>
              <div className="h-3 w-[1px] bg-[var(--border-subtle)]"></div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="flex items-center gap-1 text-[var(--accent-primary)] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-ping"></span>
                  Agents Active...
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right: Encoding & Collapse */}
        <div className="flex items-center gap-3 text-[10px]">
          <span className="hidden sm:inline">UTF-8</span>
          <button 
            onClick={() => setIsExpanded(false)}
            className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            title="Collapse Status Bar"
          >
            <ChevronUp className="w-3 h-3 rotate-180" />
          </button>
        </div>
      </footer>

      {/* Network Audit Modal */}
      <NetworkMonitorModal 
        isOpen={isNetworkModalOpen}
        onClose={() => setNetworkModalOpen(false)}
        logs={networkLogs}
      />
    </>
  );
};

