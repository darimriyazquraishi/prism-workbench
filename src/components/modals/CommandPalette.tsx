import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bot, 
  FileText, 
  BookOpen, 
  Compass, 
  Cpu, 
  ShieldCheck, 
  X,
  Sparkles
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

interface CommandPaletteProps {
  onRunScenario: (prompt: string, file: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onRunScenario }) => {
  const { 
    isCommandPaletteOpen, 
    setCommandPaletteOpen, 
    openTab, 
    setSecurityModalOpen 
  } = useWorkbenchStore();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const commands = [
    {
      id: 'cmd-demo1',
      title: 'Run Flagship Demo: Scanned Inspection PDF -> Word Note',
      category: 'Workflows',
      icon: Sparkles,
      action: () => {
        onRunScenario('Analyze attached inspection reports, compare them against our maintenance SOPs, identify critical issues, calculate the corrosion rate, and prepare an approval note in Word format.', 'Inspection_Report.pdf');
        setCommandPaletteOpen(false);
      }
    },
    {
      id: 'cmd-demo2',
      title: 'Run Industrial Analytics: Python Sandbox MTBF Calculation',
      category: 'Workflows',
      icon: Sparkles,
      action: () => {
        onRunScenario('Analyze equipment failure data, write and execute Python code in the sandbox to calculate monthly MTBF statistics, and produce an Excel deliverable.', 'Pump_Failure_Data.xlsx');
        setCommandPaletteOpen(false);
      }
    },
    {
      id: 'cmd-chat',
      title: 'Open Workbench Chat',
      category: 'Navigation',
      icon: Bot,
      action: () => {
        openTab({ id: 'tab-chat', title: 'Workbench Chat', type: 'chat', isClosable: false });
        setCommandPaletteOpen(false);
      }
    },
    {
      id: 'cmd-doc',
      title: 'Inspect Document (Local OCR & Layout Analysis)',
      category: 'Documents',
      icon: FileText,
      action: () => {
        openTab({ id: 'tab-doc-1', title: 'Inspection_Report.pdf', type: 'document', file: 'Inspection_Report.pdf', isClosable: true });
        setCommandPaletteOpen(false);
      }
    },
    {
      id: 'cmd-pid',
      title: 'Open P&ID Engineering Blueprint Canvas',
      category: 'Drawings',
      icon: Compass,
      action: () => {
        openTab({ id: 'tab-drawing', title: 'P&ID Schematic.pid', type: 'drawing', isClosable: true });
        setCommandPaletteOpen(false);
      }
    },
    {
      id: 'cmd-knowledge',
      title: 'Search Internal Knowledge Base (ChromaDB RAG)',
      category: 'Knowledge',
      icon: BookOpen,
      action: () => {
        openTab({ id: 'tab-knowledge', title: 'Operations_SOP_014.rag', type: 'knowledge', isClosable: true });
        setCommandPaletteOpen(false);
      }
    },
    {
      id: 'cmd-models',
      title: 'View Local Open-Weight Model Registry',
      category: 'Models',
      icon: Cpu,
      action: () => {
        openTab({ id: 'tab-models', title: 'Local Models Router', type: 'models', isClosable: true });
        setCommandPaletteOpen(false);
      }
    },
    {
      id: 'cmd-sec',
      title: 'View Security & Air-Gap Telemetry Proof (0 External Calls)',
      category: 'Security',
      icon: ShieldCheck,
      action: () => {
        setCommandPaletteOpen(false);
        setSecurityModalOpen(true);
      }
    }
  ];

  const filtered = commands.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center pt-24 p-4 z-50 select-none">
      <div className="w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md shadow-2xl overflow-hidden font-sans text-xs">
        {/* Search input header */}
        <div className="p-2.5 border-b border-[#2d2d2d] flex items-center gap-2 bg-[var(--bg-primary)]">
          <Search className="w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search actions (e.g. run demo, open file, view security)..."
            className="flex-1 bg-transparent border-none text-xs text-[var(--text-primary)] placeholder-[#666666] focus:outline-none font-sans"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 hover:bg-[var(--border-subtle)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command items list */}
        <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full p-2 rounded hover:bg-[#37373d] text-left flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-[#569cd6] group-hover:text-[var(--text-primary)]" />
                    <span className="text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--text-primary)]">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                    {item.category}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="text-center py-6 text-[var(--text-secondary)]">No matching commands found.</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-[#2d2d2d] bg-[var(--bg-primary)] flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)] px-3">
          <span>Navigate with mouse or arrow keys</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
