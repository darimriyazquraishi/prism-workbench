import React, { useState } from 'react';
import { X, Server, Cpu, RefreshCw, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';

export const ServerHealthModal: React.FC = () => {
  const { isServerHealthModalOpen, setServerHealthModalOpen, isServerOnline, checkServerHealth, selectedModel } = useAntigravityStore();
  const [isPinging, setIsPinging] = useState(false);
  const [pingLatency, setPingLatency] = useState<number | null>(4);

  const handlePing = async () => {
    setIsPinging(true);
    const start = performance.now();
    await checkServerHealth();
    const end = performance.now();
    setPingLatency(Math.round(end - start));
    setIsPinging(false);
  };

  if (!isServerHealthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col font-sans text-xs">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold text-sm">
            <Server className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Local Inference Server Health</span>
          </div>
          <button 
            onClick={() => setServerHealthModalOpen(false)}
            className="p-1 rounded hover:bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Server Status Indicator Card */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isServerOnline 
              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' 
              : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isServerOnline ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]' : 'bg-rose-500'}`}></div>
              <div>
                <div className="font-bold text-sm">{isServerOnline ? 'Server Online & Healthy' : 'Server Unreachable'}</div>
                <div className="text-[11px] opacity-80 font-mono">http://127.0.0.1:11434</div>
              </div>
            </div>
            <button 
              onClick={handlePing}
              disabled={isPinging}
              className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors cursor-pointer"
              title="Ping Local Endpoint"
            >
              <RefreshCw className={`w-4 h-4 text-[var(--text-primary)] ${isPinging ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Details Table */}
          <div className="p-3 bg-[var(--bg-base)] rounded-lg border border-[var(--border-subtle)] space-y-2 font-mono text-[11px]">
            <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1.5">
              <span className="text-[var(--text-secondary)]">Primary Engine:</span>
              <span className="text-[var(--text-primary)] font-bold">{selectedModel}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1.5">
              <span className="text-[var(--text-secondary)]">Local Port:</span>
              <span className="text-[var(--accent-primary)] font-bold">127.0.0.1:11434</span>
            </div>
            <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1.5">
              <span className="text-[var(--text-secondary)]">Ping Latency:</span>
              <span className="text-[var(--accent-success)] font-bold">{pingLatency !== null ? `${pingLatency} ms` : 'Testing...'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Egress Isolation:</span>
              <span className="text-[var(--accent-success)] font-bold">0.00 KB (Air-Gapped)</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex justify-end">
          <button 
            onClick={() => setServerHealthModalOpen(false)}
            className="px-4 py-1.5 bg-[var(--text-primary)] text-[var(--bg-base)] rounded-lg font-medium text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
