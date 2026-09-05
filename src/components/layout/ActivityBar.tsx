import React from 'react';
import { 
  Bot, 
  Folder, 
  FileText, 
  BookOpen, 
  Compass, 
  Cpu, 
  ShieldCheck, 
  Clock,
  Settings
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

export const ActivityBar: React.FC = () => {
  const { activeNavSection, setActiveNavSection, openTab, setSecurityModalOpen } = useWorkbenchStore();

  const handleNavClick = (section: any) => {
    setActiveNavSection(section);
    if (section === 'chat') {
      openTab({ id: 'tab-chat', title: 'Workbench Chat', type: 'chat', isClosable: false });
    } else if (section === 'drawing') {
      openTab({ id: 'tab-drawing', title: 'P&ID Schematic.pid', type: 'drawing', isClosable: true });
    } else if (section === 'documents') {
      openTab({ id: 'tab-doc-1', title: 'Inspection_Report_001.pdf', type: 'document', file: 'demo/synthetic/Inspection_Report_001.pdf', isClosable: true });
    } else if (section === 'knowledge') {
      openTab({ id: 'tab-knowledge', title: 'Operations_SOP_014.rag', type: 'knowledge', isClosable: true });
    } else if (section === 'models') {
      openTab({ id: 'tab-models', title: 'Local Models Router', type: 'models', isClosable: true });
    } else if (section === 'audit') {
      openTab({ id: 'tab-audit', title: 'Audit Timeline.sqlite', type: 'audit', isClosable: true });
    }
  };

  return (
    <aside className="w-12 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col items-center justify-between py-2 select-none flex-shrink-0 z-10">
      {/* Top Navigation Icons */}
      <div className="flex flex-col items-center space-y-2.5 w-full">
        <button
          onClick={() => handleNavClick('chat')}
          title="Workbench Chat (Default Agent)"
          className={`w-full h-10 flex items-center justify-center relative transition-colors cursor-pointer ${
            activeNavSection === 'chat' 
              ? 'text-[var(--text-primary)] border-l-2 border-[var(--accent-fuchsia)] bg-[var(--bg-surface)]' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Bot className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleNavClick('explorer')}
          title="Workspace Files & Explorer"
          className={`w-full h-10 flex items-center justify-center relative transition-colors cursor-pointer ${
            activeNavSection === 'explorer' 
              ? 'text-[var(--text-primary)] border-l-2 border-[var(--accent-fuchsia)] bg-[var(--bg-surface)]' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Folder className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleNavClick('documents')}
          title="Documents & Local OCR"
          className={`w-full h-10 flex items-center justify-center relative transition-colors cursor-pointer ${
            activeNavSection === 'documents' 
              ? 'text-[var(--text-primary)] border-l-2 border-[var(--accent-fuchsia)] bg-[var(--bg-surface)]' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <FileText className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleNavClick('knowledge')}
          title="Internal SOP Knowledge Base (RAG)"
          className={`w-full h-10 flex items-center justify-center relative transition-colors cursor-pointer ${
            activeNavSection === 'knowledge' 
              ? 'text-[var(--text-primary)] border-l-2 border-[var(--accent-fuchsia)] bg-[var(--bg-surface)]' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <BookOpen className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleNavClick('drawing')}
          title="P&ID Engineering Schematic Canvas"
          className={`w-full h-10 flex items-center justify-center relative transition-colors cursor-pointer ${
            activeNavSection === 'drawing' 
              ? 'text-[var(--text-primary)] border-l-2 border-[var(--accent-fuchsia)] bg-[var(--bg-surface)]' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Compass className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Activity Icons: Models, Security, Audit */}
      <div className="flex flex-col items-center space-y-2.5 w-full">
        <button
          onClick={() => handleNavClick('models')}
          title="Local Models Registry & VRAM"
          className={`w-full h-10 flex items-center justify-center relative transition-colors cursor-pointer ${
            activeNavSection === 'models' 
              ? 'text-[var(--text-primary)] border-l-2 border-[var(--accent-fuchsia)] bg-[var(--bg-surface)]' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Cpu className="w-5 h-5" />
        </button>

        <button
          onClick={() => setSecurityModalOpen(true)}
          title="Security & Air-Gap Telemetry"
          className="w-full h-10 flex items-center justify-center text-[var(--status-healthy)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleNavClick('audit')}
          title="Audit Trail & Event Log"
          className={`w-full h-10 flex items-center justify-center relative transition-colors cursor-pointer ${
            activeNavSection === 'audit' 
              ? 'text-[var(--text-primary)] border-l-2 border-[var(--accent-fuchsia)] bg-[var(--bg-surface)]' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Clock className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
