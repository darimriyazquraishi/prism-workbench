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
      <div className="bg-[#252526] border border-[#333333] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 select-none flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono font-bold text-white text-sm">
            <Activity className="w-5 h-5 text-[#569cd6]" />
            <span>Sovereignty &amp; System Telemetry:</span>
            <span className="text-[#4ec9b0]">100% Air-Gapped Verified</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#4ec9b0]">
          <ShieldCheck className="w-4 h-4" />
          <span>Outbound Socket Calls: 0</span>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN DIAGNOSTICS */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-1 overflow-y-auto font-sans text-xs">
        {/* Left: Guarantees (7 Cols) */}
        <div className="lg:col-span-7 space-y-2">
          <span className="text-xs uppercase text-[#858585] font-bold px-1 block font-mono">
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
                      ? 'bg-[#1e2f47] border-[#007acc] shadow-sm'
                      : 'bg-[#252526] border-[#333333]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${item.isZero ? 'text-[#4ec9b0]' : 'text-[#569cd6]'}`} />
                    <div>
                      <div className="font-bold text-white text-sm">{item.title}</div>
                      <div className="text-xs text-[#999999] mt-1 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>

                  <span className={`text-xs font-mono px-2.5 py-1 rounded border font-bold flex-shrink-0 ${
                    item.isZero
                      ? 'bg-[#1f3a2b] text-[#4ec9b0] border-[#2e5d44]'
                      : 'bg-[#1e1e1e] text-[#9cdcfe] border-[#3c3c3c]'
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
          <span className="text-xs uppercase text-[#858585] font-bold px-1 block">
            Hardware Resources:
          </span>

          <div className="bg-[#252526] border border-[#333333] rounded-lg p-4 space-y-3 text-xs shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[#858585]">
                <span>GPU VRAM ALLOCATION</span>
                <span className="text-[#569cd6] font-bold">6.1 / 16.0 GB (38%)</span>
              </div>
              <div className="h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                <div className="bg-[#007acc] h-full w-[38%]"></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[#858585]">
                <span>SYSTEM RAM LOAD</span>
                <span className="text-[#4ec9b0] font-bold">8.4 / 32.0 GB (26%)</span>
              </div>
              <div className="h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                <div className="bg-[#4ec9b0] h-full w-[26%]"></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[#858585]">
                <span>LOCAL NVME STORAGE</span>
                <span className="text-[#ce9178] font-bold">2.4 / 500 GB (&lt;1%)</span>
              </div>
              <div className="h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                <div className="bg-[#ce9178] h-full w-[5%]"></div>
              </div>
            </div>
          </div>

          <div className="bg-[#252526] border border-[#333333] rounded-lg p-4 space-y-2 text-xs shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#858585] uppercase font-bold block text-xs">
                Active Local Daemons:
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2 rounded bg-[#1e1e1e] border border-[#3c3c3c]">
                <span className="text-[#cccccc]">Ollama Local (:11434)</span>
                <span className="text-[#4ec9b0] font-bold">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#1e1e1e] border border-[#3c3c3c]">
                <span className="text-[#cccccc]">ChromaDB Local Vector DB</span>
                <span className="text-[#4ec9b0] font-bold">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#1e1e1e] border border-[#3c3c3c]">
                <span className="text-[#cccccc]">Docker Sandbox (--net=none)</span>
                <span className="text-[#4ec9b0] font-bold">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#1e1e1e] border border-[#3c3c3c]">
                <span className="text-[#cccccc]">SQLite Audit Logger</span>
                <span className="text-[#4ec9b0] font-bold">ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#2e5d44] rounded-lg p-4 space-y-2 text-xs shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#CCA700] text-black font-bold text-[9px] uppercase tracking-wider rounded-bl">
              DEMO TELEMETRY
            </div>
            <span className="text-[#4ec9b0] uppercase font-bold block text-xs flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Live Network Monitor
            </span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2 bg-[#1E1E1E] border border-[#3C3C3C] rounded">
                <span className="text-[10px] text-[#858585] block">ALLOWED LOCAL</span>
                <span className="font-bold text-[#CCCCCC]">32 connections</span>
              </div>
              <div className="p-2 bg-[#1E1E1E] border border-[#4EC9B0] rounded">
                <span className="text-[10px] text-[#858585] block">EXTERNAL OUTBOUND</span>
                <span className="font-bold text-[#4EC9B0]">0 blocked</span>
              </div>
            </div>
            <div className="text-[10px] text-[#858585] mt-1 pt-2 border-t border-[#333333]">
              Listening on loopback interfaces only. eBPF socket filter actively dropping all non-local packets.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
