import React from 'react';
import { 
  Folder, 
  FileText, 
  FileSpreadsheet, 
  Sparkles, 
  ChevronDown, 
  Plus, 
  MessageSquare, 
  BookOpen,
  Compass,
  FileCode,
  ChevronsLeft
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

interface SecondarySidebarProps {
  onSelectScenario: (prompt: string, file: string) => void;
}

export const SecondarySidebar: React.FC<SecondarySidebarProps> = ({ onSelectScenario }) => {
  const { activeNavSection, openTab, activeTask, toggleSidebar } = useWorkbenchStore();

  const scenarios = [
    {
      id: 'demo1',
      title: 'Inspection -> Word Note',
      prompt: 'Analyze these inspection reports, compare them against our maintenance SOPs, identify critical issues, calculate the corrosion rate, and prepare an approval note in Word format.',
      file: 'demo/synthetic/Inspection_Report_001.pdf',
      badge: 'Flagship'
    },
    {
      id: 'demo2',
      title: 'Pump Failure -> Python Excel',
      prompt: 'Analyze Pump_Failure_Data.xlsx, write and execute Python code in the isolated sandbox to calculate monthly MTBF statistics, and produce an Excel deliverable.',
      file: 'demo/synthetic/Pump_Failure_Data.xlsx',
      badge: 'Python'
    },
    {
      id: 'demo3',
      title: 'P&ID Vision -> Drawing Tags',
      prompt: 'Perform vision analysis on P_and_ID_Example.png, identify all pumps, valves, and flow lines, and generate an executive summary briefing deck.',
      file: 'demo/synthetic/P_and_ID_Example.png',
      badge: 'Vision'
    }
  ];

  return (
    <aside className="w-60 bg-[#252526] border-r border-[#3C3C3C] flex flex-col font-sans select-none flex-shrink-0 text-xs">
      {/* Sidebar Section Header */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-[#3C3C3C] text-[#858585] uppercase font-bold text-[11px] tracking-wider font-mono">
        <span>
          {activeNavSection === 'chat' && 'WORKSPACE'}
          {activeNavSection === 'explorer' && 'EXPLORER'}
          {activeNavSection === 'documents' && 'DOCUMENTS'}
          {activeNavSection === 'knowledge' && 'KNOWLEDGE'}
          {activeNavSection === 'drawing' && 'SCHEMATICS'}
          {activeNavSection === 'models' && 'MODELS'}
          {activeNavSection === 'audit' && 'AUDIT TRAIL'}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={toggleSidebar}
            title="Collapse Workspace Panel (Ctrl+B)"
            className="p-1 hover:bg-[#3C3C3C] rounded text-[#858585] hover:text-white"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              useWorkbenchStore.getState().runDemo('inspection');
            }}
            title="New Task"
            className="p-1 hover:bg-[#3C3C3C] rounded text-[#858585] hover:text-white"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sidebar Content Tree */}
      <div className="flex-1 p-2 space-y-3 overflow-y-auto font-sans">
        {/* Quick Showcase Scenarios */}
        <div>
          <div className="px-2 py-1 text-[10px] font-mono font-bold text-[#666666] uppercase tracking-wider flex items-center gap-1">
            <ChevronDown className="w-3 h-3" />
            <span>Showcase Demos</span>
          </div>

          <div className="space-y-1 mt-1">
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => {
                  const demoId = sc.id === 'demo1' ? 'inspection' : sc.id === 'demo2' ? 'pump' : 'pid';
                  useWorkbenchStore.getState().runDemo(demoId);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-[#252526] hover:bg-[#2A2D2E] border border-[#3C3C3C] hover:border-[#007ACC] text-left transition-all text-xs group cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-[#007ACC] flex-shrink-0" />
                  <span className="text-[#CCCCCC] group-hover:text-white truncate font-medium">
                    {sc.title}
                  </span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#252526] text-[#858585] border border-[#3C3C3C]">
                  {sc.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Workspace Files */}
        <div>
          <div className="px-2 py-1 text-[10px] font-mono font-bold text-[#666666] uppercase tracking-wider flex items-center gap-1">
            <ChevronDown className="w-3 h-3" />
            <span>Company Files</span>
          </div>

          <div className="space-y-0.5 mt-1 font-mono text-xs">
            <button
              onClick={() => openTab({ id: 'tab-doc-1', title: 'Inspection_Report_001.pdf', type: 'document', file: 'demo/synthetic/Inspection_Report_001.pdf', isClosable: true })}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#2A2D2E] text-[#858585] hover:text-[#CCCCCC] text-left transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#CCA700]" />
              <span className="truncate">Inspection_Report_001.pdf</span>
            </button>

            <button
              onClick={() => openTab({ id: 'tab-knowledge', title: 'Operations_SOP_014.rag', type: 'knowledge', isClosable: true })}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#2A2D2E] text-[#858585] hover:text-[#CCCCCC] text-left transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#007ACC]" />
              <span className="truncate">Operations_SOP_014.pdf</span>
            </button>

            <button
              onClick={() => openTab({ id: 'tab-drawing', title: 'P&ID Schematic.pid', type: 'drawing', isClosable: true })}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#2A2D2E] text-[#858585] hover:text-[#CCCCCC] text-left transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#4EC9B0]" />
              <span className="truncate">P_and_ID_Example.png</span>
            </button>

            <button
              onClick={() => openTab({ id: 'tab-artifacts', title: 'Pump_Failure_Data.xlsx', type: 'artifacts', isClosable: true })}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#2A2D2E] text-[#858585] hover:text-[#CCCCCC] text-left transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#4EC9B0]" />
              <span className="truncate">Pump_Failure_Data.xlsx</span>
            </button>
          </div>
        </div>

        {/* Generated Artifacts folder */}
        <div>
          <div className="px-2 py-1 text-[10px] font-mono font-bold text-[#666666] uppercase tracking-wider flex items-center gap-1">
            <ChevronDown className="w-3 h-3" />
            <span>Generated</span>
          </div>

          <div className="space-y-0.5 mt-1 font-mono text-xs">
            <div className="flex items-center gap-2 px-2.5 py-1 text-[#858585]">
              <FileCode className="w-3.5 h-3.5 text-[#4EC9B0]" />
              <span className="truncate">Approval_Note.docx</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 text-[#858585]">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#007ACC]" />
              <span className="truncate">failure_analysis.xlsx</span>
            </div>
          </div>
        </div>
      </div>

      {/* Node status bottom */}
      <div className="p-2.5 border-t border-[#3C3C3C] bg-[#252526] font-mono text-[11px] text-[#666666]">
        <div className="flex items-center justify-between text-[#4EC9B0]">
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4EC9B0]"></span>
            ISOLATED NODE
          </span>
          <span>127.0.0.1</span>
        </div>
      </div>
    </aside>
  );
};
