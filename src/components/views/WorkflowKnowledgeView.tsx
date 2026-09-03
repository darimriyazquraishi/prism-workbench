import React, { useState } from 'react';
import { 
  GitMerge, 
  BookOpen, 
  Folder, 
  Search, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Layers, 
  Cpu, 
  Terminal, 
  Database,
  ExternalLink,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const WorkflowKnowledgeView: React.FC = () => {
  const [isExecutingWorkflow, setIsExecutingWorkflow] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(5); // all completed
  const [ragEnabled, setRagEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('corrosion limit for crude piping');

  const workflowNodes = [
    { id: 1, title: 'INPUT: Scanned P&ID Diagram', role: 'Multimodal Input', type: 'input', icon: Layers, status: 'DONE', details: 'P_and_ID_Example.png (Crude Column Unit)' },
    { id: 2, title: 'AGENT: Onyx-7B (Analyze Drawing)', role: 'Local Vision VLM', type: 'agent', icon: Cpu, status: 'DONE', details: 'Extracted line tags: 04-CR-102, CV-101, P-102A/B' },
    { id: 3, title: 'TOOL: Local Vector DB Search', role: 'ChromaDB Local RAG', type: 'tool', icon: Database, status: 'DONE', details: 'Queried SOP-OPS-014 (Section 4.2 Piping Integrity)' },
    { id: 4, title: 'AGENT: Slate-70B (Synthesize Findings)', role: 'Reasoning Synthesis', type: 'agent', icon: Cpu, status: 'DONE', details: 'Cross-referenced wall thinning with API 570 limits' },
    { id: 5, title: 'TOOL: Quartz-13B (Sandbox Simulation)', role: 'Docker --net=none', type: 'tool', icon: Terminal, status: 'DONE', details: 'Deterministic math: Corrosion rate 0.343 mm/yr' },
    { id: 6, title: 'OUTPUT: Generate Word Report (.docx)', role: 'Office Deliverable', type: 'output', icon: FileText, status: 'DONE', details: 'Compiled Approval_Note_Unit5_Inspection.docx' }
  ];

  const indexedDirs = [
    { path: '/corp/SOPs/Engineering/', filesCount: 38, chunks: 1420, lastIndexed: '2 hours ago', status: 'SYNCHRONIZED' },
    { path: '/corp/Archive/Correspondence/', filesCount: 112, chunks: 4890, lastIndexed: 'Today, 08:30', status: 'SYNCHRONIZED' },
    { path: '/corp/P&ID_Drawings/', filesCount: 24, chunks: 760, lastIndexed: 'Yesterday', status: 'SYNCHRONIZED' }
  ];

  const searchResults = [
    {
      source: 'Operations_SOP_014.pdf',
      section: 'Section 4.2: Critical Process Piping Integrity Thresholds',
      page: 12,
      score: 0.962,
      snippet: 'Nominal thickness for crude charge line P-102 is 5.0 mm. Minimum allowable retirement wall thickness is 3.0 mm. Any measured thickness below 4.0 mm triggers mandatory formal approval note within 30 days.'
    },
    {
      source: 'Maintenance_Standard_007.pdf',
      section: 'Section 6.1: Flange & Valve Degradation Limits',
      page: 8,
      score: 0.884,
      snippet: 'Valve packing gland leakage on high-temperature hydrocarbon streams requires formal approval note, replacement scheduling during next turnaround, and immediate secondary containment.'
    }
  ];

  const handleExecute = () => {
    setIsExecutingWorkflow(true);
    setActiveStepIndex(0);

    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev >= workflowNodes.length - 1) {
          clearInterval(interval);
          setIsExecutingWorkflow(false);
          return workflowNodes.length - 1;
        }
        return prev + 1;
      });
    }, 500);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#1e1e1e] font-sans text-xs text-[#cccccc]">
      {/* 1. Left Canvas: Visual Workflow Builder */}
      <div className="flex-1 flex flex-col border-r border-[#2d2d2d] overflow-hidden">
        {/* Canvas Toolbar */}
        <div className="h-9 bg-[#252526] border-b border-[#2d2d2d] px-3 flex items-center justify-between select-none">
          <div className="flex items-center gap-2 font-mono font-bold text-xs text-white">
            <GitMerge className="w-4 h-4 text-[#569cd6]" />
            <span>VISUAL WORKFLOW BUILDER (AGENTIC PIPELINE)</span>
          </div>

          <button
            onClick={handleExecute}
            disabled={isExecutingWorkflow}
            className={`px-3 py-1 rounded text-white font-bold font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isExecutingWorkflow 
                ? 'bg-[#37373d] text-[#858585] cursor-not-allowed' 
                : 'bg-[#007acc] hover:bg-[#1f8ad2] shadow-sm'
            }`}
          >
            <Play className="w-3 h-3 fill-white" />
            <span>{isExecutingWorkflow ? 'Executing Pipeline...' : 'EXECUTE WORKFLOW'}</span>
          </button>
        </div>

        {/* Node-Based Flowchart Canvas */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#181818] flex flex-col items-center justify-center space-y-3">
          {workflowNodes.map((node, index) => {
            const Icon = node.icon;
            const isCurrent = isExecutingWorkflow && activeStepIndex === index;
            const isPassed = activeStepIndex >= index;

            return (
              <React.Fragment key={node.id}>
                {/* Workflow Node Card */}
                <div
                  className={`w-full max-w-lg p-3 rounded-lg border transition-all shadow-md ${
                    isCurrent
                      ? 'bg-[#252526] border-[#007acc] ring-2 ring-[#007acc]/40 shadow-lg scale-102'
                      : isPassed
                      ? 'bg-[#252526] border-[#3c3c3c]'
                      : 'bg-[#1e1e1e] border-[#2d2d2d] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center ${
                          node.type === 'input'
                            ? 'bg-[#dcb67a]/20 text-[#dcb67a]'
                            : node.type === 'agent'
                            ? 'bg-[#569cd6]/20 text-[#569cd6]'
                            : node.type === 'tool'
                            ? 'bg-[#4ec9b0]/20 text-[#4ec9b0]'
                            : 'bg-[#ce9178]/20 text-[#ce9178]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-white text-xs">{node.title}</span>
                    </div>

                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        isCurrent
                          ? 'bg-[#007acc] text-white animate-pulse'
                          : isPassed
                          ? 'bg-[#1f3a2b] text-[#4ec9b0]'
                          : 'bg-[#2d2d2d] text-[#858585]'
                      }`}
                    >
                      {isCurrent ? 'RUNNING' : isPassed ? 'COMPLETED' : 'QUEUED'}
                    </span>
                  </div>

                  <div className="mt-1.5 pl-8 text-[11px] text-[#858585] font-sans">
                    {node.details}
                  </div>
                </div>

                {/* Animated Connector Arrow between nodes */}
                {index < workflowNodes.length - 1 && (
                  <div className="flex items-center justify-center text-[#569cd6]">
                    <div className="w-[1.5px] h-3 bg-[#3c3c3c]"></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 2. Right Panel: Local Knowledge Connector */}
      <aside className="w-96 bg-[#252526] flex flex-col select-none flex-shrink-0 font-sans">
        {/* Panel Header */}
        <div className="p-3 border-b border-[#2d2d2d] bg-[#1e1e1e] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-white">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#569cd6]" />
              <span>LOCAL KNOWLEDGE CONNECTOR</span>
            </span>
            <button
              onClick={() => setRagEnabled(!ragEnabled)}
              className="text-[#4ec9b0] hover:text-white cursor-pointer"
            >
              {ragEnabled ? <ToggleRight className="w-6 h-6 text-[#4ec9b0]" /> : <ToggleLeft className="w-6 h-6 text-[#858585]" />}
            </button>
          </div>

          <div className="p-2 rounded bg-[#1f3a2b] border border-[#2e5d44] text-[11px] text-[#4ec9b0] font-mono leading-tight">
            Semantic Search via Local Vector Database (All data stays on-prem).
          </div>
        </div>

        {/* Indexed Directories List */}
        <div className="p-3 border-b border-[#2d2d2d] space-y-2">
          <span className="text-[10px] font-mono font-bold text-[#858585] uppercase tracking-wider block">
            Configured Indexed Directories (3)
          </span>

          <div className="space-y-1.5 font-mono text-[11px]">
            {indexedDirs.map((dir, idx) => (
              <div key={idx} className="p-2 rounded bg-[#1e1e1e] border border-[#2d2d2d] space-y-0.5">
                <div className="flex items-center justify-between text-[#cccccc]">
                  <span className="font-bold text-white truncate flex items-center gap-1">
                    <Folder className="w-3 h-3 text-[#dcb67a]" />
                    <span>{dir.path}</span>
                  </span>
                  <span className="text-[9px] text-[#4ec9b0]">{dir.status}</span>
                </div>
                <div className="text-[10px] text-[#858585] flex items-center justify-between">
                  <span>{dir.filesCount} files · {dir.chunks} chunks</span>
                  <span>{dir.lastIndexed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Local Vector Index Search */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
          <span className="text-[10px] font-mono font-bold text-[#858585] uppercase tracking-wider block">
            Query Local SOP Vector Store
          </span>

          <div className="flex items-center gap-1.5 p-1.5 rounded bg-[#1e1e1e] border border-[#3c3c3c]">
            <Search className="w-3.5 h-3.5 text-[#858585]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search local standards..."
              className="flex-1 bg-transparent border-none text-xs text-[#cccccc] focus:outline-none font-sans"
            />
          </div>

          <div className="space-y-2 pt-1 font-sans">
            {searchResults.map((res, idx) => (
              <div key={idx} className="p-2.5 rounded bg-[#1e1e1e] border border-[#2d2d2d] space-y-1">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="font-bold text-[#569cd6] flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>{res.source} · p{res.page}</span>
                  </span>
                  <span className="text-[#4ec9b0] font-bold">{(res.score * 100).toFixed(1)}% match</span>
                </div>

                <div className="text-[10px] text-white font-semibold">
                  {res.section}
                </div>

                <div className="text-[10px] text-[#858585] leading-relaxed italic">
                  "{res.snippet}"
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};
