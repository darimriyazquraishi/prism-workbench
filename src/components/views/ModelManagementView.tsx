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
    { id: 'qwen2.5-3b', name: 'Qwen2.5-3B-Instruct', role: 'Front-Facing Chatbot / Intent Orchestrator', status: 'ACTIVE', vramMb: 2450, contextLength: '16,384', latencyMs: 14, quant: 'Q4_K_M' },
    { id: 'qwen2.5-vl', name: 'Qwen2.5-VL', role: 'Vision / Multimodal / Document Summary', status: 'ACTIVE', vramMb: 6348, contextLength: '32,768', latencyMs: 28, quant: 'Q4_K_M' },
    { id: 'qwen-coder', name: 'Qwen-Coder', role: 'Coding / Math / Python Execution', status: 'ACTIVE', vramMb: 5632, contextLength: '65,536', latencyMs: 32, quant: 'Q5_K_M' },
    { id: 'qwen3-8b', name: 'Qwen3-8B', role: 'General Reasoning & Approval Notes', status: 'ACTIVE', vramMb: 5939, contextLength: '32,768', latencyMs: 22, quant: 'Q4_K_S' }
  ]);

  const [auditFilter, setAuditFilter] = useState('ALL');

  const auditLogs = [
    { id: 'log-101', timestamp: '14:22:15', taskId: 'Task ID 456', action: 'Approval note document compiled (Approval_Note.docx)', model: 'Qwen3-8B (Drafting)', status: 'VERIFIED', network: '0 bytes ext' },
    { id: 'log-102', timestamp: '14:22:04', taskId: 'Task ID 456', action: 'Sandboxed Python corrosion calculation executed in Docker container', model: 'Qwen-Coder (Sandbox)', status: 'SUCCESS', network: '0 bytes ext' },
    { id: 'log-103', timestamp: '14:21:48', taskId: 'Task ID 456', action: 'ChromaDB local vector search against /corp/SOPs/Engineering/ (SOP-OPS-014)', model: 'nomic-embed-text', status: 'SUCCESS', network: '0 bytes ext' },
    { id: 'log-104', timestamp: '14:21:12', taskId: 'Task ID 456', action: 'Image OCR & visual table extraction on Inspection_Report_March.pdf', model: 'Qwen2.5-VL (Vision)', status: 'SUCCESS', network: '0 bytes ext' },
    { id: 'log-105', timestamp: '14:20:55', taskId: 'Task ID 456', action: 'Task classification: Routed to Qwen2.5-VL for multimodal document summary', model: 'Local Router (Qwen3-8B)', status: 'SUCCESS', network: '0 bytes ext' }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[var(--bg-primary)] font-sans text-xs text-[var(--text-primary)] p-4 space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2d2d2d]">
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <span>MODEL MANAGEMENT &amp; AUDIT DASHBOARD</span>
            <span className="text-[10px] font-mono font-normal text-[var(--status-healthy)] px-2 py-0.5 rounded bg-[#1f3a2b] border border-[#2e5d44]">
              ● AIR-GAP ENFORCED
            </span>
          </h2>
          <p className="text-[var(--text-secondary)] text-xs mt-0.5">
            Manage local open-weight models loaded on GPU workstation. Inspect real-time air-gap telemetry and tamper-evident audit logs.
          </p>
        </div>

        <button className="px-3 py-1.5 rounded bg-[var(--accent-fuchsia)] hover:bg-[#1f8ad2] text-[var(--text-primary)] font-bold font-mono text-xs flex items-center gap-1.5 shadow-sm cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          <span>UPDATE / ADD NEW MODEL</span>
        </button>
      </div>

      {/* Top Half: Models Inventory (Left) + Network Traffic Monitor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Panel 1: Installed Open-Weight Models */}
        <div className="bg-[var(--bg-surface)] border border-[#2d2d2d] rounded p-3.5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#569cd6]" />
              <span className="uppercase text-[var(--text-primary)]">Installed Open-Weight Models</span>
            </span>
            <span className="text-[var(--status-healthy)]">VRAM: 17.5 / 24.0 GB (72.9%)</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {models.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded bg-[var(--bg-primary)] border border-[#2d2d2d] space-y-1.5 hover:border-[var(--border-subtle)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        m.status === 'ACTIVE'
                          ? 'bg-[var(--status-healthy)] shadow-sm shadow-[#4ec9b0]'
                          : m.status === 'STANDBY'
                          ? 'bg-[#cca700]'
                          : 'bg-[#666666]'
                      }`}
                    ></span>
                    <span className="font-bold text-[var(--text-primary)] text-xs">{m.name}</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">[{m.quant}]</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      m.status === 'ACTIVE'
                        ? 'bg-[#1f3a2b] text-[var(--status-healthy)] border border-[#2e5d44]'
                        : 'bg-[#2d2d2d] text-[var(--text-secondary)]'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <div className="text-[11px] font-sans text-[var(--text-secondary)]">
                  {m.role}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#2d2d2d] text-[10px] text-[var(--text-secondary)]">
                  <div>VRAM: <strong className="text-[var(--text-primary)]">{(m.vramMb / 1024).toFixed(1)} GB</strong></div>
                  <div>Context: <strong className="text-[var(--text-primary)]">{m.contextLength}</strong></div>
                  <div>Latency: <strong className="text-[var(--text-primary)]">{m.latencyMs} ms/tok</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Real-Time Network Traffic Monitor */}
        <div className="bg-[var(--bg-surface)] border border-[#2d2d2d] rounded p-3.5 space-y-3 shadow-sm flex flex-col">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[var(--status-healthy)]" />
              <span className="uppercase text-[var(--text-primary)]">Network Traffic Monitor (Last 24 Hours)</span>
            </span>
            <span className="text-[var(--status-healthy)] font-bold">100% PROOF OF AIR-GAP</span>
          </div>

          {/* SVG Traffic Graph */}
          <div className="flex-1 min-h-[160px] bg-[#181818] border border-[#2d2d2d] rounded p-3 flex flex-col justify-between relative overflow-hidden">
            {/* Legend */}
            <div className="flex items-center justify-between text-[10px] font-mono z-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[var(--status-healthy)] rounded"></span>
                  <span className="text-[var(--status-healthy)] font-bold">INTERNAL TRAFFIC (ACTIVE)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[var(--status-attention)] rounded"></span>
                  <span className="text-[var(--status-attention)] font-bold">EXTERNAL TRAFFIC (BLOCKED, 0 bytes)</span>
                </div>
              </div>
              <span className="text-[var(--text-secondary)]">Host NIC: eth0 (Isolated)</span>
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
              <div className="absolute bottom-1 right-3 px-2 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--status-attention)] text-[9px] font-mono text-[var(--status-attention)] font-bold">
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

          <div className="p-2 rounded bg-[var(--bg-primary)] border border-[#2d2d2d] text-[10px] font-mono text-[var(--text-secondary)] flex items-center justify-between">
            <span>Hardware Enclosure: Physical Server Rack (Local Node)</span>
            <span className="text-[var(--status-healthy)] font-bold">AIR-GAP SIGNATURE VERIFIED</span>
          </div>
        </div>
      </div>

      {/* Bottom Half: Detailed Timestamped Audit Logs */}
      <div className="bg-[var(--bg-surface)] border border-[#2d2d2d] rounded p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[#569cd6]" />
            <span className="uppercase text-[var(--text-primary)]">Immutable On-Premise Audit Logs</span>
          </span>
          <span className="text-[var(--text-secondary)]">SQLite Local Ledger (SHA-256 Chained)</span>
        </div>

        {/* Logs Table */}
        <div className="bg-[#181818] border border-[#2d2d2d] rounded overflow-hidden font-mono text-[10px]">
          <table className="w-full text-left">
            <thead className="bg-[var(--bg-surface)] text-[var(--text-secondary)] border-b border-[#2d2d2d]">
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
                <tr key={log.id} className="hover:bg-[var(--bg-primary)] transition-colors">
                  <td className="p-2 text-[var(--text-secondary)]">{log.timestamp}</td>
                  <td className="p-2 font-bold text-[var(--text-primary)]">{log.taskId}</td>
                  <td className="p-2 text-[var(--text-primary)]">{log.action}</td>
                  <td className="p-2 text-[#569cd6]">{log.model}</td>
                  <td className="p-2 text-[var(--status-healthy)] font-bold">{log.network}</td>
                  <td className="p-2">
                    <span className="px-1.5 py-0.2 rounded bg-[#1f3a2b] text-[var(--status-healthy)] font-bold">
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
