import React from 'react';
import { X, ShieldCheck, User, HardDrive, Key, Cpu, CheckCircle } from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';

export const UserSettingsModal: React.FC = () => {
  const { isSettingsModalOpen, setSettingsModalOpen, isComputerAccessEnabled, toggleComputerAccess, selectedModel } = useAntigravityStore();

  if (!isSettingsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col font-sans text-xs">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold text-sm">
            <User className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Enterprise Account &amp; System Settings</span>
          </div>
          <button 
            onClick={() => setSettingsModalOpen(false)}
            className="p-1 rounded hover:bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* User Info */}
          <div className="p-3 bg-[var(--bg-base)] rounded-lg border border-[var(--border-subtle)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] flex items-center justify-center">
              <User className="w-5 h-5 text-[var(--accent-primary)]" />
            </div>
            <div>
              <div className="font-semibold text-[var(--text-primary)] text-sm">Local Workstation User</div>
              <div className="text-[11px] text-[var(--text-secondary)]">On-Premise Operator Session</div>
              <div className="text-[10px] text-[var(--accent-success)] flex items-center gap-1 mt-0.5 font-mono">
                <CheckCircle className="w-3 h-3" /> Zero-Cloud Local Session Active
              </div>
            </div>
          </div>

          {/* Computer Execution Controls */}
          <div className="p-3 bg-[var(--bg-base)] rounded-lg border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-[var(--text-primary)] text-xs">Local Computer &amp; Tool Sandbox Access</div>
                <div className="text-[11px] text-[var(--text-secondary)]">Permit agent to execute python scripts and read/write files</div>
              </div>
              <button 
                onClick={toggleComputerAccess}
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  isComputerAccessEnabled ? 'bg-[var(--accent-primary)] justify-end' : 'bg-[var(--border-subtle)] justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
              </button>
            </div>
            <div className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-elevated)] p-2 rounded">
              Sandbox Policy: <span className="text-[var(--accent-success)]">--network=none (Strict Isolation)</span>
            </div>
          </div>

          {/* Infrastructure Specs */}
          <div className="space-y-2">
            <div className="font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Infrastructure &amp; Storage</div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-[var(--bg-base)] rounded-lg border border-[var(--border-subtle)] space-y-1">
                <div className="text-[var(--text-secondary)] flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  <span>Local Vector DB</span>
                </div>
                <div className="font-mono font-bold text-[var(--text-primary)]">ChromaDB Local</div>
                <div className="text-[10px] text-[var(--text-secondary)]">/var/lumi/vector_store</div>
              </div>

              <div className="p-2.5 bg-[var(--bg-base)] rounded-lg border border-[var(--border-subtle)] space-y-1">
                <div className="text-[var(--text-secondary)] flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>Active Default Engine</span>
                </div>
                <div className="font-mono font-bold text-[var(--text-primary)] truncate">{selectedModel || 'No model selected'}</div>
                <div className="text-[10px] text-[var(--accent-success)]">GPU 1 Resident</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex justify-end">
          <button 
            onClick={() => setSettingsModalOpen(false)}
            className="px-4 py-1.5 bg-[var(--text-primary)] text-[var(--bg-base)] rounded-lg font-medium text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
