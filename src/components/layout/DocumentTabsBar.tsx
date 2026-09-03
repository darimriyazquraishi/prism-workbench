import React from 'react';
import { 
  Bot, 
  FileText, 
  BookOpen, 
  Compass, 
  Cpu, 
  Clock, 
  FolderArchive, 
  X,
  FileCode
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';
import type { WorkspaceTab } from '../../types';

export const DocumentTabsBar: React.FC = () => {
  const { tabs, activeTabId, setActiveTabId, closeTab } = useWorkbenchStore();

  const getTabIcon = (type: string) => {
    switch (type) {
      case 'chat': return <Bot className="w-3.5 h-3.5 text-[#007ACC]" />;
      case 'document': return <FileText className="w-3.5 h-3.5 text-[#CCA700]" />;
      case 'knowledge': return <BookOpen className="w-3.5 h-3.5 text-[#007ACC]" />;
      case 'drawing': return <Compass className="w-3.5 h-3.5 text-[#4EC9B0]" />;
      case 'models': return <Cpu className="w-3.5 h-3.5 text-[#9cdcfe]" />;
      case 'audit': return <Clock className="w-3.5 h-3.5 text-[#4EC9B0]" />;
      case 'artifacts': return <FolderArchive className="w-3.5 h-3.5 text-[#4EC9B0]" />;
      default: return <FileCode className="w-3.5 h-3.5 text-[#858585]" />;
    }
  };

  return (
    <div className="h-9 bg-[#252526] border-b border-[#3C3C3C] flex items-center justify-between px-2 select-none flex-shrink-0 font-sans text-xs">
      {/* Tabs list */}
      <div className="flex items-center space-x-0.5 overflow-x-auto h-full">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`h-full px-3 flex items-center gap-2 border-r border-[#3C3C3C] cursor-pointer transition-colors font-mono text-xs ${
                isActive
                  ? 'bg-[#1E1E1E] text-[#CCCCCC] border-t-2 border-t-[#007ACC] font-semibold'
                  : 'bg-[#252526] text-[#858585] hover:text-[#CCCCCC] hover:bg-[#2A2D2E]'
              }`}
            >
              {getTabIcon(tab.type)}
              <span className="truncate max-w-[160px]">{tab.title}</span>

              {tab.isClosable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="p-0.5 hover:bg-[#3C3C3C] rounded text-[#858585] hover:text-white ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
