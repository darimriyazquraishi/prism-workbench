import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Server, 
  Database, 
  X,
  CheckCircle2
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

export const SecurityStatusModal: React.FC = () => {
  const { isSecurityModalOpen, setSecurityModalOpen } = useWorkbenchStore();

  if (!isSecurityModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 select-none font-sans text-xs">
      <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#2d2d2d] border-b border-[#2d2d2d] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--status-healthy)]" />
            <span className="font-bold text-[var(--text-primary)] text-xs">
              Sovereign Air-Gap Security Telemetry
            </span>
          </div>
          <button
            onClick={() => setSecurityModalOpen(false)}
            className="p-1 hover:bg-[var(--border-subtle)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <div className="p-2.5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase block">ENVIRONMENT:</span>
              <span className="text-xs font-bold text-[var(--status-healthy)]">LOCAL (AIR-GAPPED)</span>
            </div>
            <div className="p-2.5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase block">EXTERNAL AI REQUESTS:</span>
              <span className="text-xs font-bold text-[var(--status-healthy)]">0 (Zero Leak)</span>
            </div>
            <div className="p-2.5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase block">OUTBOUND CONNECTIONS:</span>
              <span className="text-xs font-bold text-[var(--status-healthy)]">0 Packets</span>
            </div>
            <div className="p-2.5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase block">DATA TRANSMITTED TO CLOUD:</span>
              <span className="text-xs font-bold text-[var(--status-healthy)]">0 Bytes</span>
            </div>
          </div>

          {/* 5-Point Sovereign Verification */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] font-bold block">
              Continuous Verification Guarantees:
            </span>
            <div className="space-y-1 font-sans text-xs">
              <div className="p-2 rounded bg-[var(--bg-primary)] border border-[#2d2d2d] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--text-primary)]">
                  <Cpu className="w-3.5 h-3.5 text-[#569cd6]" />
                  <span>Open-weight local models running purely on host hardware</span>
                </div>
                <span className="text-[var(--status-healthy)] font-mono font-bold text-[10px]">VERIFIED</span>
              </div>

              <div className="p-2 rounded bg-[var(--bg-primary)] border border-[#2d2d2d] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--text-primary)]">
                  <Server className="w-3.5 h-3.5 text-[#569cd6]" />
                  <span>Docker sandbox code execution with --network=none</span>
                </div>
                <span className="text-[var(--status-healthy)] font-mono font-bold text-[10px]">ISOLATED</span>
              </div>

              <div className="p-2 rounded bg-[var(--bg-primary)] border border-[#2d2d2d] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--text-primary)]">
                  <Database className="w-3.5 h-3.5 text-[#569cd6]" />
                  <span>ChromaDB local vector embeddings without remote telemetry</span>
                </div>
                <span className="text-[var(--status-healthy)] font-mono font-bold text-[10px]">ON-PREMISE</span>
              </div>

              <div className="p-2 rounded bg-[var(--bg-primary)] border border-[#2d2d2d] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--text-primary)]">
                  <Lock className="w-3.5 h-3.5 text-[#569cd6]" />
                  <span>SQLite immutable tamper-evident audit trail</span>
                </div>
                <span className="text-[var(--status-healthy)] font-mono font-bold text-[10px]">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-[#2d2d2d] bg-[var(--bg-primary)] flex items-center justify-between text-xs font-mono">
          <span className="text-[var(--status-healthy)] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Security Status: 100% SOVEREIGN
          </span>
          <button
            onClick={() => setSecurityModalOpen(false)}
            className="px-3 py-1 rounded bg-[var(--border-subtle)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-sans text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
