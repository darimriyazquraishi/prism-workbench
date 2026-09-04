import React from 'react';
import { 
  Bot, 
  Folder, 
  Cpu, 
  Settings,
  Terminal
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

export const ActivityBar: React.FC = () => {
  const { 
    activeNavSection, 
    setActiveNavSection, 
    openTab, 
    setSecurityModalOpen, 
    isSidebarOpen, 
    toggleSidebar, 
    setSidebarOpen,
    isBottomPanelOpen,
    setBottomPanelOpen
  } = useWorkbenchStore();

  const handleNavClick = (section: any) => {
    if (section === 'terminal') {
      setBottomPanelOpen(!isBottomPanelOpen);
      return;
    }

    if (section === activeNavSection) {
      toggleSidebar();
    } else if (!isSidebarOpen) {
      setSidebarOpen(true);
    }
    setActiveNavSection(section);
    if (section === 'chat') {
      openTab({ id: 'tab-chat', title: 'Workbench Chat', type: 'chat', isClosable: false });
    } else if (section === 'models') {
      openTab({ id: 'tab-models', title: 'Local Models Router', type: 'models', isClosable: true });
    }
  };

  return (
    <aside className="w-12 bg-[#333333] border-r border-[#2D2D2D] flex flex-col items-center justify-between py-2 select-none flex-shrink-0 z-10">
      {/* Top Navigation Icons */}
      <div className="flex flex-col items-center space-y-2.5 w-full">
        <button
          onClick={() => handleNavClick('chat')}
          title="Workbench Chat"
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
          onClick={() => handleNavClick('terminal')}
          title="Toggle Terminal Panel"
          className={`w-full h-10 flex items-center justify-center relative transition-colors cursor-pointer ${
            isBottomPanelOpen
              ? 'text-[#4EC9B0] border-l-2 border-[#007ACC] bg-[#252526]' 
              : 'text-[#858585] hover:text-[#CCCCCC]'
          }`}
        >
          <Terminal className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Navigation Icons */}
      <div className="flex flex-col items-center space-y-2.5 w-full">
        <button
          onClick={() => handleNavClick('models')}
          title="Local Models Registry"
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
          title="System Settings & Privacy"
          className="w-full h-10 flex items-center justify-center text-[#858585] hover:text-white transition-colors cursor-pointer"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
