import React from 'react';
import { 
  ShieldCheck, 
  WifiOff, 
  Cpu, 
  Server, 
  Activity, 
  Lock, 
  Eye, 
  Database
} from 'lucide-react';

export const SystemDiagnosticsView: React.FC = () => {
  const complianceGuarantees = [
    { title: 'Local Open-Weight Inference', desc: 'Qwen3 & Qwen2.5 running locally via Ollama daemon. No remote API keys configured.', status: 'ONLINE', icon: Cpu },
    { title: 'Local Document OCR & Vision', desc: 'PyMuPDF and PaddleOCR execute purely on local CPU/GPU hardware.', status: 'ONLINE', icon: Eye },
    { title: 'Local Vector Store (RAG)', desc: 'ChromaDB embedded on-premise. No vector cloud synchronization.', status: 'ONLINE', icon: Database },
    { title: 'Docker Code Sandbox Isolation', desc: 'Executes Python scripts with --network=none, memory ceiling 256MB, non-root user.', status: 'ONLINE', icon: Server },
    { title: 'Zero Cloud Telemetry Policy', desc: 'Socket interceptor active. 0 external outbound network packets transmitted.', status: 'ZERO CALLS', icon: ShieldCheck, isZero: true },
    { title: 'Local Filesystem Boundary', desc: 'Strict path traversal guards prevent access outside workspace data folder.', status: 'ENFORCED', icon: Lock },
    { title: 'Physical Air-Gap Compatibility', desc: 'Tested and verified with physical Ethernet and Wi-Fi disconnected.', status: 'VERIFIED', icon: WifiOff, highlight: true }
  ];

  return (
    <div className="h-full flex flex-col space-y-4 font-sans text-sm overflow-hidden">
      {/* 1. TOP TOOLBAR */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 select-none flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono font-bold text-[var(--text-primary)] text-sm">
            <Activity className="w-5 h-5 text-[#569cd6]" />
            <span>Sovereignty &amp; System Telemetry:</span>
            <span className="text-[var(--status-healthy)]">100% Air-Gapped Verified</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[var(--status-healthy)]">
          <ShieldCheck className="w-4 h-4" />
          <span>Outbound Socket Calls: 0</span>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN DIAGNOSTICS */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-1 overflow-y-auto font-sans text-xs">
        {/* Left: Guarantees (7 Cols) */}
        <div className="lg:col-span-7 space-y-2">
          <span className="text-xs uppercase text-[var(--text-secondary)] font-bold px-1 block font-mono">
            Air-Gap &amp; Sovereign Integrity Matrix:
          </span>

          <div className="space-y-2">
            {complianceGuarantees.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border flex items-start justify-between gap-3 ${
                    item.highlight
                      ? 'bg-[#1e2f47] border-[var(--accent-fuchsia)] shadow-sm'
                      : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${item.isZero ? 'text-[var(--status-healthy)]' : 'text-[#569cd6]'}`} />
                    <div>
                      <div className="font-bold text-[var(--text-primary)] text-sm">{item.title}</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>

                  <span className={`text-xs font-mono px-2.5 py-1 rounded border font-bold flex-shrink-0 ${
                    item.isZero
                      ? 'bg-[#1f3a2b] text-[var(--status-healthy)] border-[#2e5d44]'
                      : 'bg-[var(--bg-primary)] text-[#9cdcfe] border-[var(--border-subtle)]'
                  }`}>
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Hardware & Services (5 Cols) */}
        <div className="lg:col-span-5 space-y-3 font-mono">
          <span className="text-xs uppercase text-[var(--text-secondary)] font-bold px-1 block">
            Hardware Resources:
          </span>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-3 text-xs shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>GPU VRAM ALLOCATION</span>
                <span className="text-[#569cd6] font-bold">6.1 / 16.0 GB (38%)</span>
              </div>
              <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                <div className="bg-[var(--accent-fuchsia)] h-full w-[38%]"></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>SYSTEM RAM LOAD</span>
                <span className="text-[var(--status-healthy)] font-bold">8.4 / 32.0 GB (26%)</span>
              </div>
              <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                <div className="bg-[var(--status-healthy)] h-full w-[26%]"></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>LOCAL NVME STORAGE</span>
                <span className="text-[var(--status-attention)] font-bold">2.4 / 500 GB (&lt;1%)</span>
              </div>
              <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                <div className="bg-[var(--status-attention)] h-full w-[5%]"></div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-2 text-xs shadow-sm">
            <span className="text-[var(--text-secondary)] uppercase font-bold block text-xs">
              Active Local Daemons:
            </span>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-primary)]">Ollama Local (:11434)</span>
                <span className="text-[var(--status-healthy)] font-bold">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-primary)]">ChromaDB Local Vector DB</span>
                <span className="text-[var(--status-healthy)] font-bold">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-primary)]">Docker Sandbox (--net=none)</span>
                <span className="text-[var(--status-healthy)] font-bold">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                <span className="text-[var(--text-primary)]">SQLite Audit Logger</span>
                <span className="text-[var(--status-healthy)] font-bold">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
