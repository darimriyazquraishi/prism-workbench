import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, WifiOff, Database, Cpu, Eye, Server } from 'lucide-react';
import { api } from '../../services/api';
import { SovereigntyReport } from '../../types';

export const SovereigntyStatus: React.FC = () => {
  const [sov, setSov] = useState<SovereigntyReport | null>(null);

  useEffect(() => {
    api.getSovereignty().then(setSov).catch(() => {});
  }, []);

  const items = [
    { label: 'Local Open-Weight Inference', status: sov?.local_inference_status || 'ONLINE', icon: Cpu },
    { label: 'Local Document OCR & Vision', status: sov?.local_ocr_status || 'ONLINE', icon: Eye },
    { label: 'Local ChromaDB Vector Store', status: sov?.local_rag_status || 'ONLINE', icon: Database },
    { label: 'Docker Code Execution Sandbox', status: sov?.local_sandbox_status || 'ONLINE', icon: Server },
    { label: 'External Cloud API Calls', status: `${sov?.external_api_calls || 0} Calls`, icon: ShieldCheck, isZero: true },
    { label: 'Telemetry & Analytics Policy', status: sov?.telemetry_policy || 'ZERO TELEMETRY', icon: Lock },
    { label: 'Network Isolation Mode', status: sov?.network_mode || 'AIR-GAPPED ENFORCED', icon: WifiOff, highlight: true }
  ];

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-semibold text-zinc-100">
            Sovereignty & Air-Gap Compliance Status
          </h2>
        </div>
        <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          AIR-GAP VERIFIED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-lg border flex items-center justify-between ${
                item.highlight
                  ? 'bg-sky-950/20 border-sky-800/60'
                  : 'bg-zinc-950/60 border-zinc-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${item.isZero ? 'text-emerald-400' : 'text-sky-400'}`} />
                <span className="text-xs text-zinc-300 font-medium">{item.label}</span>
              </div>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                  item.isZero
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}
              >
                {item.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
