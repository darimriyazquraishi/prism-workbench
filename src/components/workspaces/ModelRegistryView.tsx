import React from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  HardDrive
} from 'lucide-react';
import type { ModelMetadata } from '../../types';

const models: ModelMetadata[] = [
  {
    id: 'qwen3-8b',
    ollama_name: 'qwen3:8b',
    type: 'General Reasoning LLM',
    capabilities: ['Multi-Step Planning', 'SOP Compliance Reasoning', 'Technical Document Synthesis', 'Approval Drafting'],
    context_window: 32768,
    vision: false,
    coding: true,
    vram_mb: 6144,
    description: 'High-performance open-weight LLM for industrial reasoning, compliance checking, and technical document synthesis.',
    is_installed: true
  },
  {
    id: 'qwen2.5-vl-7b',
    ollama_name: 'qwen2.5-vl:7b',
    type: 'Vision-Language Model (VLM)',
    capabilities: ['P&ID Tag Extraction', 'Scanned Document OCR', 'Drawing Spatial Reasoning', 'CAD Symbol Recognition'],
    context_window: 32768,
    vision: true,
    coding: false,
    vram_mb: 7680,
    description: 'Multimodal Vision-Language model for engineering drawings, piping schematics, and scanned technical forms.',
    is_installed: true
  },
  {
    id: 'qwen2.5-coder-7b',
    ollama_name: 'qwen2.5-coder:7b',
    type: 'Specialized Code LLM',
    capabilities: ['Pandas Reliability Scripts', 'Data Cleaning', 'Deterministic Math Verification', 'Isolated Sandbox Execution'],
    context_window: 32768,
    vision: false,
    coding: true,
    vram_mb: 6144,
    description: 'Specialized code generation model for sandboxed industrial data analysis and calculation scripts.',
    is_installed: true
  },
  {
    id: 'nomic-embed-text',
    ollama_name: 'nomic-embed-text',
    type: 'Vector Embedding Model',
    capabilities: ['768-D Vector Embeddings', 'ChromaDB Local Indexing', 'Semantic Vector Search'],
    context_window: 8192,
    vision: false,
    coding: false,
    vram_mb: 512,
    description: 'Local high-density vector embedding model for internal SOP and ASME engineering knowledge base.',
    is_installed: true
  }
];

export const ModelRegistryView: React.FC = () => {
  const totalVramMb = 16384;
  const activeResidentVramMb = 6144;

  return (
    <div className="h-full flex flex-col space-y-4 font-sans text-sm overflow-hidden">
      {/* 1. TOP TOOLBAR & VRAM ALLOCATION GAUGE */}
      <div className="bg-[#252526] border border-[#333333] rounded-lg p-4 space-y-3 flex-shrink-0 select-none shadow-sm">
        <div className="flex items-center justify-between border-b border-[#333333] pb-2">
          <div className="flex items-center gap-2 font-mono font-bold text-white text-sm">
            <Cpu className="w-5 h-5 text-[#569cd6]" />
            <span>Open-Weight Local Model Registry:</span>
            <span className="text-[#9cdcfe]">100% On-Premise</span>
          </div>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#1e1e1e] text-[#4ec9b0] border border-[#3c3c3c]">
            Ollama Daemon: http://localhost:11434 (Online)
          </span>
        </div>

        {/* VRAM Memory Allocation Bar */}
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between text-[#858585]">
            <span>VRAM ALLOCATION: {(activeResidentVramMb / 1024).toFixed(1)} GB / {(totalVramMb / 1024).toFixed(0)} GB LOAD</span>
            <span className="text-[#4ec9b0] font-bold">10.2 GB AVAILABLE FOR BURST</span>
          </div>

          <div className="h-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded-full overflow-hidden flex">
            <div style={{ width: '37.5%' }} className="bg-[#007acc] h-full" title="Resident LLM (Qwen3 8B)"></div>
            <div style={{ width: '10%' }} className="bg-[#4ec9b0] h-full" title="Embedding Model (Nomic)"></div>
          </div>
        </div>
      </div>

      {/* 2. MODEL CARDS GRID */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-1">
        {models.map((m) => (
          <div key={m.id} className="bg-[#252526] border border-[#333333] rounded-lg p-5 flex flex-col justify-between space-y-3 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-bold text-white font-mono">{m.id}</div>
                  <div className="text-xs font-mono text-[#569cd6]">{m.ollama_name}</div>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1f3a2b] text-[#4ec9b0] border border-[#2e5d44] font-bold">
                  LOCAL RESIDENT
                </span>
              </div>

              <div className="text-xs font-mono text-[#858585] px-2.5 py-1 rounded bg-[#1e1e1e] border border-[#3c3c3c]">
                TYPE: <span className="text-white font-semibold">{m.type}</span> • CTX: {m.context_window} TOKENS
              </div>

              <p className="text-xs text-[#cccccc] leading-relaxed">
                {m.description}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#333333]">
              <div className="flex flex-wrap gap-1.5">
                {m.capabilities.map((cap, idx) => (
                  <span key={idx} className="text-xs font-mono px-2 py-0.5 rounded bg-[#1e1e1e] text-[#9cdcfe] border border-[#3c3c3c]">
                    {cap}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-[#858585] pt-1">
                <span>VRAM Footprint: ~{(m.vram_mb / 1024).toFixed(1)} GB</span>
                <span className="text-[#4ec9b0] flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Local
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
