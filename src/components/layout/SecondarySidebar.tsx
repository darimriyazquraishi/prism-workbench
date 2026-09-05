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
  FileCode
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

interface SecondarySidebarProps {
  onSelectScenario: (prompt: string, file: string) => void;
}

export const SecondarySidebar: React.FC<SecondarySidebarProps> = ({ onSelectScenario }) => {
  const { activeNavSection, openTab, activeTask } = useWorkbenchStore();

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
    <aside className="w-60 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col font-sans select-none flex-shrink-0 text-xs">
      {/* Sidebar Section Header */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-[var(--border-subtle)] text-[var(--text-secondary)] uppercase font-bold text-[11px] tracking-wider font-mono">
        <span>
          {activeNavSection === 'chat' && 'WORKSPACE'}
          {activeNavSection === 'explorer' && 'EXPLORER'}
          {activeNavSection === 'documents' && 'DOCUMENTS'}
          {activeNavSection === 'knowledge' && 'KNOWLEDGE'}
          {activeNavSection === 'drawing' && 'SCHEMATICS'}
          {activeNavSection === 'models' && 'MODELS'}
          {activeNavSection === 'audit' && 'AUDIT TRAIL'}
        </span>
        <button
          onClick={() => {
            onSelectScenario('Analyze these inspection reports, compare them against our maintenance SOPs, identify critical issues, and prepare an approval note in Word format.', 'demo/synthetic/Inspection_Report_001.pdf');
          }}
          title="New Task"
          className="p-1 hover:bg-[var(--border-subtle)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sidebar Content Tree */}
      <div className="flex-1 p-2 space-y-3 overflow-y-auto font-sans">
        {/* Quick Showcase Scenarios */}
        <div>
          <div className="px-2 py-1 text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
            <ChevronDown className="w-3 h-3" />
            <span>Showcase Demos</span>
          </div>

          <div className="space-y-1 mt-1">
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => onSelectScenario(sc.prompt, sc.file)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-fuchsia)] text-left transition-all text-xs group cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent-fuchsia)] flex-shrink-0" />
                  <span className="text-[var(--text-primary)] group-hover:text-[var(--text-primary)] truncate font-medium">
                    {sc.title}
                  </span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                  {sc.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Workspace Files */}
        <div>
          <div className="px-2 py-1 text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
            <ChevronDown className="w-3 h-3" />
            <span>Company Files</span>
          </div>

          <div className="space-y-0.5 mt-1 font-mono text-xs">
            <button
              onClick={() => openTab({ id: 'tab-doc-1', title: 'Inspection_Report_001.pdf', type: 'document', file: 'demo/synthetic/Inspection_Report_001.pdf', isClosable: true })}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#D29922]" />
              <span className="truncate">Inspection_Report_001.pdf</span>
            </button>

            <button
              onClick={() => openTab({ id: 'tab-knowledge', title: 'Operations_SOP_014.rag', type: 'knowledge', isClosable: true })}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[var(--accent-fuchsia)]" />
              <span className="truncate">Operations_SOP_014.pdf</span>
            </button>

            <button
              onClick={() => openTab({ id: 'tab-drawing', title: 'P&ID Schematic.pid', type: 'drawing', isClosable: true })}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[var(--status-healthy)]" />
              <span className="truncate">P_and_ID_Example.png</span>
            </button>

            <button
              onClick={() => openTab({ id: 'tab-artifacts', title: 'Pump_Failure_Data.xlsx', type: 'artifacts', isClosable: true })}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--status-healthy)]" />
              <span className="truncate">Pump_Failure_Data.xlsx</span>
            </button>
          </div>
        </div>

        {/* Generated Artifacts folder */}
        <div>
          <div className="px-2 py-1 text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
            <ChevronDown className="w-3 h-3" />
            <span>Generated</span>
          </div>

          <div className="space-y-0.5 mt-1 font-mono text-xs">
            <div className="flex items-center gap-2 px-2.5 py-1 text-[var(--text-secondary)]">
              <FileCode className="w-3.5 h-3.5 text-[var(--status-healthy)]" />
              <span className="truncate">Approval_Note.docx</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 text-[var(--text-secondary)]">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--accent-fuchsia)]" />
              <span className="truncate">failure_analysis.xlsx</span>
            </div>
          </div>
        </div>
      </div>

      {/* Node status bottom */}
      <div className="p-2.5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] font-mono text-[11px] text-[var(--text-secondary)]">
        <div className="flex items-center justify-between text-[var(--status-healthy)]">
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-healthy)]"></span>
            ISOLATED NODE
          </span>
          <span>127.0.0.1</span>
        </div>
      </div>
    </aside>
  );
};
