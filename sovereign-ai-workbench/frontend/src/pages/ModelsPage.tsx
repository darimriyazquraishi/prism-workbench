import React, { useEffect, useState } from 'react';
import { Cpu, Eye, Code, Database, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { ModelMetadata } from '../types';

export const ModelsPage: React.FC = () => {
  const [modelsData, setModelsData] = useState<{ models: ModelMetadata[]; total_vram_budget_mb: number } | null>(null);

  useEffect(() => {
    api.listModels().then(setModelsData).catch(() => {});
  }, []);

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'vlm': return Eye;
      case 'code': return Code;
      case 'embedding': return Database;
      default: return Cpu;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            Open-Weight Model Registry & Dynamic Routing Policy
          </h2>
          <p className="text-xs text-zinc-400">
            Air-gapped local model serving via Ollama with VRAM-aware sequential lazy-loading
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
            VRAM Budget: {modelsData?.total_vram_budget_mb ? `${modelsData.total_vram_budget_mb / 1024} GB` : '16 GB'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modelsData?.models.map((m) => {
          const Icon = getModelIcon(m.type);
          return (
            <div
              key={m.id}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4 hover:border-sky-500/40 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-100">{m.id}</div>
                    <div className="text-[11px] font-mono text-zinc-500">{m.ollama_name}</div>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  LOCAL CACHED
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                {m.description}
              </p>

              <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Context Window:</span>
                  <span className="font-mono text-zinc-300">{m.context_window.toLocaleString()} Tokens</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">VRAM Allocation:</span>
                  <span className="font-mono text-sky-400">~{(m.vram_mb / 1024).toFixed(1)} GB</span>
                </div>

                <div className="pt-2 flex flex-wrap gap-1.5">
                  {m.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
