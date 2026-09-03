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
    <aside className="w-64 bg-[#252526] border-r border-[#333333] flex flex-col font-sans select-none flex-shrink-0">
      {/* Sidebar Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#333333]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#999999]">
          Workstations
        </span>
        <span className="text-xs font-mono text-[#858585]">MRPL CDU-5</span>
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
                  ? 'bg-[#37373d] text-white font-medium border-l-4 border-[#007acc] shadow-sm'
                  : 'text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#569cd6]' : 'text-[#858585]'}`} />
                <div className="truncate">
                  <div className="text-sm font-semibold truncate leading-tight">{tab.name}</div>
                  <div className="text-xs text-[#858585] truncate mt-0.5">{tab.description}</div>
                </div>
              </div>

              {tab.badge && (
                <span className={`text-xs font-mono px-2 py-0.5 rounded border flex-shrink-0 ml-2 ${
                  isActive 
                    ? 'bg-[#1e1e1e] text-[#9cdcfe] border-[#007acc]' 
                    : 'bg-[#1e1e1e] text-[#858585] border-[#3c3c3c]'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Status Card at bottom */}
      <div className="p-3 border-t border-[#333333] bg-[#1e1e1e]">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="flex items-center gap-1.5 text-[#4ec9b0] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#4ec9b0] animate-pulse"></span>
            ISOLATED WORKSTATION
          </span>
          <span className="text-[#858585]">127.0.0.1</span>
        </div>
        <div className="text-xs text-[#858585] mt-1 font-mono truncate">
          {activeTask ? `Active Task: ${activeTask.task_id}` : 'Environment: Confidential'}
        </div>
      </div>
    </aside>
  );
};
