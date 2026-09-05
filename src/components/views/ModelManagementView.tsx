import React from 'react';
import { 
  Cpu, 
  Eye, 
  Calculator, 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  Bot,
  Layers
} from 'lucide-react';
import { useTelemetryStore } from '../../store/telemetryStore';

interface ModelDefinition {
  name: string;
  id: string;
  tag: string;
  usedFor: string;
}

interface AgentDefinition {
  name: string;
  model: string;
  purpose: string;
  icon: React.ElementType;
}

// 1. ONLY Models actually used by the runtime
const ACTUAL_MODELS: ModelDefinition[] = [
  {
    name: 'Qwen 3 8B',
    id: 'qwen3-8b',
    tag: 'qwen3:8b',
    usedFor: 'Direct Q&A, task planning & deliverable content'
  },
  {
    name: 'Qwen 3 14B',
    id: 'qwen3-14b',
    tag: 'qwen3:14b',
    usedFor: 'Complex reasoning & synthesis re-evaluation'
  },
  {
    name: 'Qwen 2.5 Coder 7B',
    id: 'qwen2.5-coder-7b',
    tag: 'qwen2.5-coder:7b',
    usedFor: 'Code synthesis & sandboxed math calculations'
  },
  {
    name: 'Qwen 2.5 VL 7B',
    id: 'qwen2.5-vl-7b',
    tag: 'qwen2.5vl:7b',
    usedFor: 'Vision & document OCR understanding'
  },
  {
    name: 'Nomic Embed Text',
    id: 'nomic-embed-text',
    tag: 'nomic-embed-text',
    usedFor: 'Knowledge Base vector embedding retrieval'
  }
];

// 2. ONLY Agents actually present in runtime workflows
const ACTUAL_AGENTS: AgentDefinition[] = [
  {
    name: 'Reasoning & Planning Agent',
    model: 'Qwen 3 8B',
    purpose: 'Task planning, ReAct step decomposition, and direct Q&A',
    icon: Cpu
  },
  {
    name: 'Vision & Multimodal Agent',
    model: 'Qwen 2.5 VL 7B',
    purpose: 'Image analysis, scanned document OCR, and diagram processing',
    icon: Eye
  },
  {
    name: 'Code & Math Agent',
    model: 'Qwen 2.5 Coder 7B',
    purpose: 'Python script generation and sandboxed engineering calculations',
    icon: Calculator
  },
  {
    name: 'Knowledge Retrieval Agent (RAG)',
    model: 'Nomic Embed Text',
    purpose: 'Vector embedding search against internal SOPs and knowledge base',
    icon: BookOpen
  },
  {
    name: 'Deliverable Synthesis Agent',
    model: 'Qwen 3 8B',
    purpose: 'Structured content generation for PPTX, DOCX, XLSX, and reports',
    icon: FileText
  },
  {
    name: 'Answer Validation Agent',
    model: 'Qwen 3 8B',
    purpose: 'Independent two-stage evidence grounding validation',
    icon: ShieldCheck
  }
];

export const ModelManagementView: React.FC = () => {
  const modelLatencies = useTelemetryStore((state) => state.aiTelemetry.modelLatenciesMs) || {};

  const getLatencyDisplay = (tag: string, id: string): string => {
    if (modelLatencies[tag] !== undefined && modelLatencies[tag] !== null) {
      return `${(modelLatencies[tag] / 1000).toFixed(1)}s`;
    }
    if (modelLatencies[id] !== undefined && modelLatencies[id] !== null) {
      return `${(modelLatencies[id] / 1000).toFixed(1)}s`;
    }
    // Matching key substring
    for (const [key, val] of Object.entries(modelLatencies)) {
      if (val !== null && val !== undefined) {
        const k = key.toLowerCase();
        if (k.includes(tag.toLowerCase()) || k.includes(id.toLowerCase())) {
          return `${(val / 1000).toFixed(1)}s`;
        }
      }
    }
    return '—';
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[var(--bg-base)] font-sans text-xs text-[var(--text-primary)] p-5 space-y-6">
      {/* Title Header */}
      <div className="pb-3 border-b border-[var(--border-subtle)]">
        <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-[var(--accent-primary)]" />
          <span>MODELS &amp; AGENTS</span>
        </h2>
      </div>

      {/* MODELS SECTION */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
          <Bot className="w-4 h-4 text-[var(--accent-primary)]" />
          <span>MODELS</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACTUAL_MODELS.map((m) => {
            const latency = getLatencyDisplay(m.tag, m.id);
            return (
              <div 
                key={m.id}
                className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-2 font-mono text-xs shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="font-bold text-sm text-[var(--text-primary)] font-sans">
                    {m.name}
                  </div>
                  <div className="text-[11px] font-sans text-[var(--text-secondary)]">
                    Used for: <span className="text-[var(--text-primary)] font-medium">{m.usedFor}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[var(--text-secondary)]">Latency:</span>
                  <span className={`font-bold ${latency !== '—' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                    {latency}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AGENTS SECTION */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[var(--accent-primary)]" />
          <span>AGENTS</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACTUAL_AGENTS.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <div 
                key={i}
                className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-2.5 shadow-sm flex flex-col justify-between font-sans text-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                      <Icon className="w-4 h-4 text-[var(--accent-primary)]" />
                    </div>
                    <div className="font-bold text-xs text-[var(--text-primary)]">
                      {agent.name}
                    </div>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed pt-1">
                    {agent.purpose}
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] font-mono text-[10px] flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Model:</span>
                  <span className="font-bold text-[var(--text-primary)]">{agent.model}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
