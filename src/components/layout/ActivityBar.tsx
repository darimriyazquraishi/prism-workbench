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
  Settings,
  PanelLeftClose
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

export const ActivityBar: React.FC = () => {
  const { activeNavSection, setActiveNavSection, openTab, setSecurityModalOpen, isSidebarOpen, toggleSidebar, setSidebarOpen } = useWorkbenchStore();

  const handleNavClick = (section: any) => {
    // VS Code behavior: clicking the active icon toggles the workspace panel
    // (collapse if open, reopen if closed); switching sections re-opens it.
    // The Activity Bar itself never hides.
    if (section === activeNavSection) {
      toggleSidebar();
    } else if (!isSidebarOpen) {
      setSidebarOpen(true);
    }
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
    <aside className="w-12 bg-[#333333] border-r border-[#2D2D2D] flex flex-col items-center justify-between py-2 select-none flex-shrink-0 z-10">
      {/* Top Navigation Icons */}
      <div className="flex flex-col items-center space-y-2.5 w-full">
        <button
          onClick={() => handleNavClick('chat')}
          title="Workbench Chat (Default Agent)"
          className={`w-full h-10 flex items-center justify-center relative transition-colors cursor-pointer ${
            activeNavSection === 'chat' 
              ? 'text-white border-l-2 border-[#007ACC] bg-[#252526]' 
              : 'text-[#858585] hover:text-[#CCCCCC]'
          }`}
        >
          <Bot className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleNavClick('explorer')}
          title="Workspace Files & Explorer"
          className={`w-full h-10 flex items-center justify-center relative transition-colors cursor-pointer ${
            activeNavSection === 'explorer' 
              ? 'text-white border-l-2 border-[#007ACC] bg-[#252526]' 
              : 'text-[#858585] hover:text-[#CCCCCC]'
          }`}
        >
          <Folder className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleNavClick('documents')}
          title="Documents & Local OCR"
          className={`w-full h-10 flex items-center justify-center relative transition-colors cursor-pointer ${
            activeNavSection === 'documents' 
              ? 'text-white border-l-2 border-[#007ACC] bg-[#252526]' 
              : 'text-[#858585] hover:text-[#CCCCCC]'
          }`}
        >
          <FileText className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleNavClick('knowledge')}
          title="Internal SOP Knowledge Base (RAG)"
          className={`w-full h-10 flex items-center justify-center relative transition-colors cursor-pointer ${
            activeNavSection === 'knowledge' 
              ? 'text-white border-l-2 border-[#007ACC] bg-[#252526]' 
              : 'text-[#858585] hover:text-[#CCCCCC]'
          }`}
        >
          <BookOpen className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleNavClick('drawing')}
          title="P&ID Engineering Schematic Canvas"
          className={`w-full h-10 flex items-center justify-center relative transition-colors cursor-pointer ${
            activeNavSection === 'drawing' 
              ? 'text-white border-l-2 border-[#007ACC] bg-[#252526]' 
              : 'text-[#858585] hover:text-[#CCCCCC]'
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
              ? 'text-white border-l-2 border-[#007ACC] bg-[#252526]' 
              : 'text-[#858585] hover:text-[#CCCCCC]'
          }`}
        >
          <Cpu className="w-5 h-5" />
        </button>

        <button
          onClick={() => setSecurityModalOpen(true)}
          title="Security & Air-Gap Telemetry"
          className="w-full h-10 flex items-center justify-center text-[#4EC9B0] hover:text-white transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleNavClick('audit')}
          title="Audit Trail & Event Log"
          className={`w-full h-10 flex items-center justify-center relative transition-colors cursor-pointer ${
            activeNavSection === 'audit' 
              ? 'text-white border-l-2 border-[#007ACC] bg-[#252526]' 
              : 'text-[#858585] hover:text-[#CCCCCC]'
          }`}
        >
          <Clock className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom: Collapse Workspace Panel */}
      <div className="w-full flex flex-col items-center pt-2 border-t border-[#3C3C3C]">
        <button
          onClick={toggleSidebar}
          title="Collapse Workspace Panel (Ctrl+B)"
          className="w-full h-10 flex items-center justify-center text-[#858585] hover:text-[#CCCCCC] transition-colors cursor-pointer"
        >
          <PanelLeftClose className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
