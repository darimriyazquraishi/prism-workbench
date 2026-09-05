import React from 'react';
import { ShieldCheck, User } from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

export const TopBar: React.FC = () => {
  const { setSecurityModalOpen } = useWorkbenchStore();

  return (
    <header className="h-14 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] px-6 flex items-center justify-between select-none flex-shrink-0 z-20 font-sans transition-all duration-200">
      {/* Left: Product branding */}
      <div className="flex items-center gap-3 w-1/3">
        <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)]">
          <span className="font-bold text-sm">S</span>
        </div>
        <span className="font-medium text-[var(--text-primary)] tracking-wide text-sm opacity-90">
          Sovereign AI
        </span>
      </div>

      {/* Center: Single Status Pill */}
      <div className="flex justify-center w-1/3">
        <button
          onClick={() => setSecurityModalOpen(true)}
          title="View Air-Gap Telemetry"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-fuchsia-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium transition-colors duration-200 cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--status-healthy)] animate-pulse shadow-[0_0_8px_var(--status-healthy)]"></span>
          <span>Air-Gapped · Local Only</span>
        </button>
      </div>

      {/* Right: User Avatar */}
      <div className="flex justify-end w-1/3">
        <button className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-fuchsia-muted)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 cursor-pointer">
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
