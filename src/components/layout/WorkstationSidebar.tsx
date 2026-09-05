import React from 'react';
import { 
  Bot, 
  FileText, 
  BookOpen, 
  FolderArchive, 
  Cpu, 
  ShieldCheck, 
  Activity, 
  Compass
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

interface WorkspaceTab {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
}

const workspaces: WorkspaceTab[] = [
  { id: 'agent', name: 'Agent Studio', description: 'ReAct Planner & Workflows', icon: Bot, badge: 'Active' },
  { id: 'drawing', name: 'P&ID Schematic Canvas', description: 'CAD Drawing & VLM Tags', icon: Compass, badge: 'Vision' },
  { id: 'documents', name: 'Documents & OCR', description: 'Inspection Reports & Scans', icon: FileText, badge: 'OCR' },
  { id: 'knowledge', name: 'Knowledge Base (RAG)', description: 'Internal SOPs & Standards', icon: BookOpen, badge: 'Vectors' },
  { id: 'artifacts', name: 'Deliverables & Review', description: 'Word, Excel & PPT Exports', icon: FolderArchive, badge: 'DOCX' },
  { id: 'models', name: 'Model Registry', description: 'Qwen Local LLMs & VRAM', icon: Cpu, badge: 'Local' },
  { id: 'audit', name: 'Audit & Compliance', description: 'SQLite Immutable Timeline', icon: ShieldCheck, badge: 'Logs' },
  { id: 'system', name: 'System Telemetry', description: 'Air-Gap Proof & Hardware', icon: Activity, badge: '0-Leak' },
];

export const WorkstationSidebar: React.FC = () => {
  const { activeTab, setActiveTab, activeTask } = useWorkbenchStore();

  return (
    <aside className="w-64 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col font-sans select-none flex-shrink-0">
      {/* Sidebar Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Workstations
        </span>
        <span className="text-xs font-mono text-[var(--text-secondary)]">MRPL CDU-5</span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {workspaces.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between p-3 rounded-md transition-all text-left ${
                isActive
                  ? 'bg-[#37373d] text-[var(--text-primary)] font-medium border-l-4 border-[var(--accent-fuchsia)] shadow-sm'
                  : 'text-[var(--text-primary)] hover:bg-[#2a2d2e] hover:text-[var(--text-primary)] border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#569cd6]' : 'text-[var(--text-secondary)]'}`} />
                <div className="truncate">
                  <div className="text-sm font-semibold truncate leading-tight">{tab.name}</div>
                  <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{tab.description}</div>
                </div>
              </div>

              {tab.badge && (
                <span className={`text-xs font-mono px-2 py-0.5 rounded border flex-shrink-0 ml-2 ${
                  isActive 
                    ? 'bg-[var(--bg-primary)] text-[#9cdcfe] border-[var(--accent-fuchsia)]' 
                    : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Status Card at bottom */}
      <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="flex items-center gap-1.5 text-[var(--status-healthy)] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[var(--status-healthy)] animate-pulse"></span>
            ISOLATED WORKSTATION
          </span>
          <span className="text-[var(--text-secondary)]">127.0.0.1</span>
        </div>
        <div className="text-xs text-[var(--text-secondary)] mt-1 font-mono truncate">
          {activeTask ? `Active Task: ${activeTask.task_id}` : 'Environment: Confidential'}
        </div>
      </div>
    </aside>
  );
};
