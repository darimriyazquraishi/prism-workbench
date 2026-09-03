import React, { useState } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Activity, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Database,
  Lock,
  Download,
  Filter
} from 'lucide-react';

interface ModelInfo {
  id: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'STANDBY' | 'OFFLINE';
  vramMb: number;
  contextLength: string;
  latencyMs: number;
  quant: string;
}

export const ModelManagementView: React.FC = () => {
  const [models, setModels] = useState<ModelInfo[]>([
    { id: 'onyx-7b', name: 'Onyx-7B', role: 'Vision / Multimodal / Document Summary', status: 'ACTIVE', vramMb: 5800, contextLength: '32,768', latencyMs: 34, quant: 'Q4_K_M' },
    { id: 'quartz-13b', name: 'Quartz-13B', role: 'Coding / Math / Python Execution', status: 'ACTIVE', vramMb: 9200, contextLength: '65,536', latencyMs: 41, quant: 'Q5_K_M' },
    { id: 'slate-70b', name: 'Slate-70B', role: 'Complex Engineering Reasoning', status: 'OFFLINE', vramMb: 38400, contextLength: '131,072', latencyMs: 120, quant: 'Q4_K_S' }
  ]);

  const [auditFilter, setAuditFilter] = useState('ALL');

  const auditLogs = [
    { id: 'log-101', timestamp: '14:22:15', taskId: 'Task ID 456', action: 'Approval note document compiled (Approval_Note.docx)', model: 'Quartz-13B (Local)', status: 'VERIFIED', network: '0 bytes ext' },
    { id: 'log-102', timestamp: '14:22:04', taskId: 'Task ID 456', action: 'Sandboxed Python corrosion calculation executed in Docker container', model: 'Quartz-13B (Sandbox)', status: 'SUCCESS', network: '0 bytes ext' },
    { id: 'log-103', timestamp: '14:21:48', taskId: 'Task ID 456', action: 'ChromaDB local vector search against /corp/SOPs/Engineering/ (SOP-OPS-014)', model: 'nomic-embed-text', status: 'SUCCESS', network: '0 bytes ext' },
    { id: 'log-104', timestamp: '14:21:12', taskId: 'Task ID 456', action: 'Image OCR & visual table extraction on Inspection_Report_March.pdf', model: 'Onyx-7B (Vision)', status: 'SUCCESS', network: '0 bytes ext' },
    { id: 'log-105', timestamp: '14:20:55', taskId: 'Task ID 456', action: 'Task classification: Routed to Onyx-7B for multimodal document summary', model: 'Local Router', status: 'SUCCESS', network: '0 bytes ext' }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#1e1e1e] font-sans text-xs text-[#cccccc] p-4 space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2d2d2d]">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>MODEL MANAGEMENT &amp; AUDIT DASHBOARD</span>
            <span className="text-[10px] font-mono font-normal text-[#4ec9b0] px-2 py-0.5 rounded bg-[#1f3a2b] border border-[#2e5d44]">
              ● AIR-GAP ENFORCED
            </span>
          </h2>
          <p className="text-[#858585] text-xs mt-0.5">
            Manage local open-weight models loaded on GPU workstation. Inspect real-time air-gap telemetry and tamper-evident audit logs.
          </p>
        </div>

        <button className="px-3 py-1.5 rounded bg-[#007acc] hover:bg-[#1f8ad2] text-white font-bold font-mono text-xs flex items-center gap-1.5 shadow-sm cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          <span>UPDATE / ADD NEW MODEL</span>
        </button>
      </div>

      {/* Top Half: Models Inventory (Left) + Network Traffic Monitor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Panel 1: Installed Open-Weight Models */}
        <div className="bg-[#252526] border border-[#2d2d2d] rounded p-3.5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#858585]">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#569cd6]" />
              <span className="uppercase text-white">Installed Open-Weight Models</span>
            </span>
            <span className="text-[#4ec9b0]">VRAM: 15.0 / 24.0 GB (62.5%)</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {models.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded bg-[#1e1e1e] border border-[#2d2d2d] space-y-1.5 hover:border-[#3c3c3c] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        m.status === 'ACTIVE'
                          ? 'bg-[#4ec9b0] shadow-sm shadow-[#4ec9b0]'
                          : m.status === 'STANDBY'
                          ? 'bg-[#cca700]'
                          : 'bg-[#666666]'
                      }`}
                    ></span>
                    <span className="font-bold text-white text-xs">{m.name}</span>
                    <span className="text-[10px] text-[#858585]">[{m.quant}]</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      m.status === 'ACTIVE'
                        ? 'bg-[#1f3a2b] text-[#4ec9b0] border border-[#2e5d44]'
                        : 'bg-[#2d2d2d] text-[#858585]'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <div className="text-[11px] font-sans text-[#858585]">
                  {m.role}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#2d2d2d] text-[10px] text-[#858585]">
                  <div>VRAM: <strong className="text-white">{(m.vramMb / 1024).toFixed(1)} GB</strong></div>
                  <div>Context: <strong className="text-white">{m.contextLength}</strong></div>
                  <div>Latency: <strong className="text-white">{m.latencyMs} ms/tok</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Real-Time Network Traffic Monitor */}
        <div className="bg-[#252526] border border-[#2d2d2d] rounded p-3.5 space-y-3 shadow-sm flex flex-col">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#858585]">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#4ec9b0]" />
              <span className="uppercase text-white">Network Traffic Monitor (Last 24 Hours)</span>
            </span>
            <span className="text-[#4ec9b0] font-bold">100% PROOF OF AIR-GAP</span>
          </div>

          {/* SVG Traffic Graph */}
          <div className="flex-1 min-h-[160px] bg-[#181818] border border-[#2d2d2d] rounded p-3 flex flex-col justify-between relative overflow-hidden">
            {/* Legend */}
            <div className="flex items-center justify-between text-[10px] font-mono z-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#4ec9b0] rounded"></span>
                  <span className="text-[#4ec9b0] font-bold">INTERNAL TRAFFIC (ACTIVE)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#ce9178] rounded"></span>
                  <span className="text-[#ce9178] font-bold">EXTERNAL TRAFFIC (BLOCKED, 0 bytes)</span>
                </div>
              </div>
              <span className="text-[#858585]">Host NIC: eth0 (Isolated)</span>
            </div>

            {/* Simulated Dual-Line Waveform SVG */}
            <div className="w-full h-24 my-auto relative">
              <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                {/* Horizontal Grid lines */}
                <line x1="0" y1="20" x2="400" y2="20" stroke="#2d2d2d" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="400" y2="50" stroke="#2d2d2d" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="400" y2="80" stroke="#2d2d2d" strokeDasharray="3 3" />

                {/* Line 1: Internal Active Traffic (Dynamic Curve) */}
                <path
                  d="M0,85 Q40,40 80,65 T160,30 T240,70 T320,25 T400,60"
                  fill="none"
                  stroke="#4ec9b0"
                  strokeWidth="2.5"
                />
                {/* Line 1 Subtle Fill */}
                <path
                  d="M0,85 Q40,40 80,65 T160,30 T240,70 T320,25 T400,60 L400,100 L0,100 Z"
                  fill="#4ec9b0"
                  fillOpacity="0.08"
                />

                {/* Line 2: External Traffic (Flatline zero on bottom axis) */}
                <line x1="0" y1="96" x2="400" y2="96" stroke="#ce9178" strokeWidth="3" />
              </svg>

              {/* Zero flatline callout badge */}
              <div className="absolute bottom-1 right-3 px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#ce9178] text-[9px] font-mono text-[#ce9178] font-bold">
                EXTERNAL: EXACT ZERO (0.000 KB/s)
              </div>
            </div>

            {/* Time markers */}
            <div className="flex justify-between text-[9px] font-mono text-[#666666] pt-1 border-t border-[#2d2d2d]">
              <span>24h ago</span>
              <span>18h ago</span>
              <span>12h ago</span>
              <span>6h ago</span>
              <span>Now (14:22)</span>
            </div>
          </div>

          <div className="p-2 rounded bg-[#1e1e1e] border border-[#2d2d2d] text-[10px] font-mono text-[#858585] flex items-center justify-between">
            <span>Hardware Enclosure: Physical Server Rack (Local Node)</span>
            <span className="text-[#4ec9b0] font-bold">AIR-GAP SIGNATURE VERIFIED</span>
          </div>
        </div>
      </div>

      {/* Bottom Half: Detailed Timestamped Audit Logs */}
      <div className="bg-[#252526] border border-[#2d2d2d] rounded p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-[#858585]">
          <span className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[#569cd6]" />
            <span className="uppercase text-white">Immutable On-Premise Audit Logs</span>
          </span>
          <span className="text-[#858585]">SQLite Local Ledger (SHA-256 Chained)</span>
        </div>

        {/* Logs Table */}
        <div className="bg-[#181818] border border-[#2d2d2d] rounded overflow-hidden font-mono text-[10px]">
          <table className="w-full text-left">
            <thead className="bg-[#252526] text-[#858585] border-b border-[#2d2d2d]">
              <tr>
                <th className="p-2">TIMESTAMP</th>
                <th className="p-2">TASK ID</th>
                <th className="p-2">AUDIT ACTION / EVENT</th>
                <th className="p-2">MODEL / COMPONENT</th>
                <th className="p-2">OUTBOUND NETWORK</th>
                <th className="p-2">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d2d2d]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#1e1e1e] transition-colors">
                  <td className="p-2 text-[#858585]">{log.timestamp}</td>
                  <td className="p-2 font-bold text-white">{log.taskId}</td>
                  <td className="p-2 text-[#cccccc]">{log.action}</td>
                  <td className="p-2 text-[#569cd6]">{log.model}</td>
                  <td className="p-2 text-[#4ec9b0] font-bold">{log.network}</td>
                  <td className="p-2">
                    <span className="px-1.5 py-0.2 rounded bg-[#1f3a2b] text-[#4ec9b0] font-bold">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
