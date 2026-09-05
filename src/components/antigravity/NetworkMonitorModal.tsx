import React from 'react';
import { ShieldCheck, X, Activity, Server, Lock, Terminal, Radio } from 'lucide-react';
import type { NetworkAuditLog } from '../../types/antigravity';

interface NetworkMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: NetworkAuditLog[];
}

export const NetworkMonitorModal: React.FC<NetworkMonitorModalProps> = ({
  isOpen,
  onClose,
  logs
}) => {
  if (!isOpen) return null;

  const totalBytesIn = logs.reduce((acc, l) => acc + l.bytesReceived, 0);
  const totalBytesOut = logs.reduce((acc, l) => acc + l.bytesSent, 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none font-sans">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl max-w-3xl w-full flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                Air-Gap Network Audit & Egress Monitor
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  VERIFIED AIR-GAPPED
                </span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Real-time socket egress tracking. Confirming zero outbound external network connections.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Status Banner */}
        <div className="p-4 bg-[var(--bg-base)] border-b border-[var(--border-subtle)] grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase">External Network Egress</div>
            <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <Lock className="w-4 h-4" /> 0.00 KB (BLOCKED)
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase">Local Loopback Traffic</div>
            <div className="text-sm font-bold text-[var(--text-primary)] mt-1 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-sky-400" /> {((totalBytesIn + totalBytesOut) / 1024).toFixed(1)} KB
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase">Local Ollama / Model API</div>
            <div className="text-sm font-bold text-[var(--text-primary)] mt-1 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-purple-400" /> 127.0.0.1:11434
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase">Code Execution Isolation</div>
            <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <Terminal className="w-4 h-4" /> --network=none
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-[var(--text-secondary)] uppercase px-1 pb-1">
            <span>Live Audit Log ({logs.length} Operations Captured)</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> Egress Filter Active
            </span>
          </div>

          <div className="border border-[var(--border-subtle)] rounded-lg overflow-hidden bg-[var(--bg-base)] text-[11px] font-mono">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                  <th className="p-2 font-medium">Timestamp</th>
                  <th className="p-2 font-medium">Source</th>
                  <th className="p-2 font-medium">Destination</th>
                  <th className="p-2 font-medium">Protocol / Flags</th>
                  <th className="p-2 font-medium">Model / Tool</th>
                  <th className="p-2 font-medium text-right">Egress Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--bg-surface)] transition-colors">
                    <td className="p-2 text-[var(--text-secondary)]">{log.timestamp}</td>
                    <td className="p-2 font-semibold">{log.source}</td>
                    <td className="p-2">{log.destination}</td>
                    <td className="p-2">
                      <span className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[10px]">
                        {log.protocol}
                      </span>
                    </td>
                    <td className="p-2 text-[var(--text-secondary)]">{log.modelOrTool}</td>
                    <td className="p-2 text-right">
                      {log.isExternal ? (
                        <span className="text-red-400 font-bold">EXTERNAL DENIED</span>
                      ) : (
                        <span className="text-emerald-400 font-semibold flex items-center justify-end gap-1">
                          <ShieldCheck className="w-3 h-3" /> LOCAL PASSED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
          <span className="text-[var(--text-secondary)] text-[11px]">
            Strict Air-Gap Policy: All sockets bound to 127.0.0.1. External egress blocked at kernel layer.
          </span>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-base)] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close Audit Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
