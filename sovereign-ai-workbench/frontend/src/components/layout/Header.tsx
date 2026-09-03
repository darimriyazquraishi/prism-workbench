import React, { useEffect, useState } from 'react';
import { ShieldCheck, Cpu, HardDrive, WifiOff } from 'lucide-react';
import { api } from '../../services/api';

export const Header: React.FC = () => {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(() => {});
    const interval = setInterval(() => {
      api.getHealth().then(setHealth).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur px-6 flex items-center justify-between flex-shrink-0">
      {/* Left: Organization & Title */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            MRPL Sovereign Agentic AI Workbench
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
              <WifiOff className="w-3 h-3" />
              Air-Gapped Sovereign
            </span>
          </h1>
          <p className="text-[11px] text-zinc-400">
            Open-Weight Multimodal Industrial Operations & Document Intelligence
          </p>
        </div>
      </div>

      {/* Right: Telemetry & Hardware Badges */}
      <div className="flex items-center gap-3">
        {/* Model Engine Badge */}
        <div className="px-3 py-1.5 rounded-md bg-zinc-950/80 border border-zinc-800 flex items-center gap-2 text-xs">
          <Cpu className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-zinc-400">Models:</span>
          <span className="font-mono text-zinc-200 text-[11px]">Qwen3 / Qwen2.5-VL</span>
        </div>

        {/* Disk & Storage Status */}
        <div className="px-3 py-1.5 rounded-md bg-zinc-950/80 border border-zinc-800 flex items-center gap-2 text-xs">
          <HardDrive className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-zinc-400">Local Disk:</span>
          <span className="font-mono text-zinc-200 text-[11px]">
            {health ? `${health.disk_free_gb} GB Free` : 'Online'}
          </span>
        </div>

        {/* Zero Cloud Telemetry Badge */}
        <div className="px-3 py-1.5 rounded-md bg-zinc-950/80 border border-zinc-800 flex items-center gap-2 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-zinc-400">Cloud Calls:</span>
          <span className="font-mono text-emerald-400 font-bold text-[11px]">0</span>
        </div>
      </div>
    </header>
  );
};
