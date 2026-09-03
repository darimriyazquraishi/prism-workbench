import React from 'react';
import { 
  Bot, 
  FileText, 
  BookOpen, 
  FolderArchive, 
  Cpu, 
  ShieldCheck, 
  Activity,
  LayoutDashboard
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';
import logo from '../../assets/logo.jpg';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'agent', label: 'Agent Workspace', icon: Bot },
  { id: 'documents', label: 'Documents & OCR', icon: FileText },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
  { id: 'artifacts', label: 'Deliverables', icon: FolderArchive },
  { id: 'models', label: 'Model Registry', icon: Cpu },
  { id: 'audit', label: 'Audit Timeline', icon: ShieldCheck },
  { id: 'system', label: 'Sovereignty & System', icon: Activity },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useWorkbenchStore();

  return (
    <aside className="w-64 bg-zinc-900/90 border-r border-zinc-800/80 flex flex-col flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-zinc-800">
        <img src={logo.src} alt="LUMI" className="w-8 h-8 rounded-md object-cover shadow-md" />
        <div>
          <div className="text-sm font-semibold tracking-wide text-zinc-100 flex items-center gap-1.5">
            LUMI
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono">
              MRPL
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 tracking-tight">On-Premise Industrial AI</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-sky-600/15 text-sky-400 border border-sky-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-zinc-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Air-Gap Status Indicator at bottom */}
      <div className="p-3 border-t border-zinc-800/80">
        <div className="bg-zinc-950/70 border border-zinc-800 p-2.5 rounded-md">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              AIR-GAPPED
            </span>
            <span className="text-zinc-500 text-[10px]">v1.0.0</span>
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Ext Calls: 0 (Local Only)</div>
        </div>
      </div>
    </aside>
  );
};
