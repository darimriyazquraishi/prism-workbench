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
      case 'chat': return <Bot className="w-3.5 h-3.5 text-[var(--accent-fuchsia)]" />;
      case 'document': return <FileText className="w-3.5 h-3.5 text-[#D29922]" />;
      case 'knowledge': return <BookOpen className="w-3.5 h-3.5 text-[var(--accent-fuchsia)]" />;
      case 'drawing': return <Compass className="w-3.5 h-3.5 text-[var(--status-healthy)]" />;
      case 'models': return <Cpu className="w-3.5 h-3.5 text-[#9cdcfe]" />;
      case 'audit': return <Clock className="w-3.5 h-3.5 text-[var(--status-healthy)]" />;
      case 'artifacts': return <FolderArchive className="w-3.5 h-3.5 text-[var(--status-healthy)]" />;
      default: return <FileCode className="w-3.5 h-3.5 text-[var(--text-secondary)]" />;
    }
  };

  return (
    <div className="h-9 bg-[var(--vscode-sidebar-bg)] border-b border-[var(--vscode-border)] flex items-center justify-between px-2 select-none flex-shrink-0 font-sans text-xs">
      {/* Tabs list */}
      <div className="flex items-center space-x-0.5 overflow-x-auto h-full">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`h-full px-3 flex items-center gap-2 border-r border-[var(--vscode-border)] cursor-pointer transition-colors font-sans text-[11px] uppercase tracking-wider ${
                isActive
                  ? 'bg-[var(--vscode-editor-bg)] text-[var(--vscode-text-bright)] border-t border-t-[var(--vscode-accent)] font-semibold'
                  : 'bg-[var(--vscode-sidebar-bg)] text-[var(--vscode-text-muted)] hover:text-[var(--vscode-text-bright)] hover:bg-[var(--vscode-border)]'
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
                  className="p-0.5 hover:bg-[var(--vscode-border-light)] rounded text-[var(--vscode-text-muted)] hover:text-[var(--vscode-text-bright)] ml-1"
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
