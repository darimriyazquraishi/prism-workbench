import React from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  FileCode,
  MessageSquare, 
  ChevronDown, 
  Plus, 
  ChevronsLeft,
  Paperclip,
  Sparkles
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

interface SecondarySidebarProps {
  onSelectScenario: (prompt: string, file: string) => void;
}

export const SecondarySidebar: React.FC<SecondarySidebarProps> = ({ onSelectScenario }) => {
  const { openTab, toggleSidebar, attachFile } = useWorkbenchStore();

  const generalFiles = [
    {
      name: 'meeting_notes_quarterly_review.md',
      path: 'demo/meeting_notes_quarterly_review.md',
      type: 'markdown',
      icon: FileText,
      description: 'Quarterly team strategy & action items'
    },
    {
      name: 'sales_leads_q3.csv',
      path: 'demo/sales_leads_q3.csv',
      type: 'csv',
      icon: FileSpreadsheet,
      description: 'Sales pipeline with deal sizes & win status'
    },
    {
      name: 'research_summary_autonomous_agents.txt',
      path: 'demo/research_summary_autonomous_agents.txt',
      type: 'text',
      icon: FileText,
      description: 'AI agent loops & privacy architecture'
    },
    {
      name: 'sample_code_analysis.py',
      path: 'demo/sample_code_analysis.py',
      type: 'python',
      icon: FileCode,
      description: 'Data transformation & outlier metrics'
    },
    {
      name: 'customer_feedback.json',
      path: 'demo/customer_feedback.json',
      type: 'json',
      icon: MessageSquare,
      description: 'User sentiment & feature requests'
    }
  ];

  const generalPrompts = [
    {
      title: 'Summarize Meeting Notes',
      prompt: 'Analyze the attached quarterly review notes (demo/meeting_notes_quarterly_review.md). Provide a clear executive summary of achievements, primary roadblocks, and format the assigned action items into a clean priority table.',
      file: 'demo/meeting_notes_quarterly_review.md'
    },
    {
      title: 'Analyze Sales Pipeline',
      prompt: 'Inspect the attached sales dataset (demo/sales_leads_q3.csv). Calculate the overall win rate, total pipeline volume, won revenue, and list the top 3 highest-value strategic opportunities in progress.',
      file: 'demo/sales_leads_q3.csv'
    },
    {
      title: 'Review Python Code',
      prompt: 'Review the attached Python script (demo/sample_code_analysis.py). Explain the statistical outlier methodology, identify any edge cases, and suggest performance optimizations.',
      file: 'demo/sample_code_analysis.py'
    },
    {
      title: 'Synthesize Feedback',
      prompt: 'Examine customer_feedback.json. Group the user comments by sentiment and category, and formulate the top 3 actionable product recommendations.',
      file: 'demo/customer_feedback.json'
    }
  ];

  return (
    <aside className="w-64 bg-[#252526] border-r border-[#2D2D2D] flex flex-col font-sans select-none flex-shrink-0 text-xs">
      {/* Sidebar Header */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-[#2D2D2D] text-[#858585] uppercase font-bold text-[11px] tracking-wider font-mono">
        <span>EXPLORER</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              openTab({ id: 'tab-chat', title: 'New Chat', type: 'chat', isClosable: false });
            }}
            title="New Chat"
            className="p-1 hover:bg-[#333333] rounded text-[#858585] hover:text-white cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleSidebar}
            title="Collapse Sidebar (Ctrl+B)"
            className="p-1 hover:bg-[#333333] rounded text-[#858585] hover:text-white cursor-pointer transition-colors"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sidebar Content Tree */}
      <div className="flex-1 p-2 space-y-4 overflow-y-auto font-sans">
        {/* General Demo Files */}
        <div>
          <div className="px-2 py-1 text-[10px] font-mono font-bold text-[#666666] uppercase tracking-wider flex items-center gap-1">
            <ChevronDown className="w-3 h-3" />
            <span>General Demo Files</span>
          </div>

          <div className="space-y-1 mt-1">
            {generalFiles.map((gf) => {
              const Icon = gf.icon;
              return (
                <div
                  key={gf.name}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#1E1E1E] hover:bg-[#2A2D2E] border border-transparent hover:border-[#3C3C3C] text-left transition-all text-xs group cursor-pointer"
                  onClick={() => {
                    attachFile(gf.path);
                  }}
                  title={`Click to attach ${gf.name} to chat`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className="w-3.5 h-3.5 text-[#007ACC] flex-shrink-0" />
                    <span className="text-[#CCCCCC] group-hover:text-white truncate font-mono text-[11.5px]">
                      {gf.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#666666] group-hover:text-[#4EC9B0] opacity-0 group-hover:opacity-100 transition-opacity">
                    +attach
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Prompts */}
        <div>
          <div className="px-2 py-1 text-[10px] font-mono font-bold text-[#666666] uppercase tracking-wider flex items-center gap-1">
            <ChevronDown className="w-3 h-3" />
            <span>Sample Prompts</span>
          </div>

          <div className="space-y-1.5 mt-1">
            {generalPrompts.map((gp, idx) => (
              <button
                key={idx}
                onClick={() => onSelectScenario(gp.prompt, gp.file)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[#1E1E1E] hover:bg-[#2A2D2E] border border-[#2D2D2D] hover:border-[#007ACC] text-left transition-all text-xs text-[#CCCCCC] hover:text-white group cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#007ACC] flex-shrink-0" />
                <span className="text-[11.5px] truncate leading-tight font-medium">{gp.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
