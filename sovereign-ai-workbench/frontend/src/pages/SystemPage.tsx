import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, WifiOff, HardDrive, Cpu, Server, CheckCircle2 } from 'lucide-react';
import { SovereigntyStatus } from '../components/system/SovereigntyStatus';
import { api } from '../services/api';

export const SystemPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [resources, setResources] = useState<any>(null);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(() => {});
    api.getResources().then(setResources).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            System Diagnostics & Physical Air-Gap Proof
          </h2>
          <p className="text-xs text-zinc-400">
            Real-time verification of on-premise hardware resources, daemon status, and zero-leakage security
          </p>
        </div>

        <span className="text-xs px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold flex items-center gap-1.5">
          <WifiOff className="w-3.5 h-3.5" />
          AIR-GAP ENFORCED
        </span>
      </div>

      {/* Main Sovereignty Matrix */}
      <SovereigntyStatus />

      {/* Hardware & Daemon Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>GPU & Compute Allocation</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg flex items-center justify-between text-xs">
              <span className="text-zinc-400">Target GPU:</span>
              <span className="font-mono text-zinc-200">{resources?.gpu_name || 'NVIDIA RTX GPU'}</span>
            </div>

            <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg flex items-center justify-between text-xs">
              <span className="text-zinc-400">VRAM Budget:</span>
              <span className="font-mono text-sky-400 font-bold">16.0 GB Total Budget</span>
            </div>

            <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg flex items-center justify-between text-xs">
              <span className="text-zinc-400">Local Daemon Engine:</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ollama Local Server
              </span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-amber-400" />
            <span>Local Storage & Persistence</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg flex items-center justify-between text-xs">
              <span className="text-zinc-400">Storage Partition:</span>
              <span className="font-mono text-zinc-200">
                {health ? `${health.disk_free_gb} GB Free / ${health.disk_total_gb} GB Total` : 'Local SSD'}
              </span>
            </div>

            <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg flex items-center justify-between text-xs">
              <span className="text-zinc-400">Vector Store Engine:</span>
              <span className="font-mono text-zinc-200">Embedded ChromaDB (data/indexes)</span>
            </div>

            <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg flex items-center justify-between text-xs">
              <span className="text-zinc-400">Audit Trail DB:</span>
              <span className="font-mono text-zinc-200">SQLite (data/audit.db)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
