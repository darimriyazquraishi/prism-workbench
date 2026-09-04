import React, { useState } from 'react';
import { 
  Plus, 
  Terminal as TerminalIcon, 
  Folder, 
  FolderPlus, 
  Settings, 
  Clock, 
  ChevronDown, 
  ChevronRight,
  Search, 
  Bell, 
  PanelLeftClose, 
  PanelLeftOpen,
  LayoutGrid,
  FileText,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

interface PerplexitySidebarProps {
  onSelectPrompt: (prompt: string, file?: string) => void;
  onNewChat: () => void;
}

// Perplexity Iconic Asterisk SVG
export const PerplexityLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-white" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="12" y1="12" x2="20.66" y2="7" />
    <line x1="12" y1="12" x2="3.34" y2="17" />
    <line x1="12" y1="12" x2="20.66" y2="17" />
    <line x1="12" y1="12" x2="3.34" y2="7" />
    <circle cx="12" cy="12" r="2.5" fill="currentColor" />
  </svg>
);

export const PerplexitySidebar: React.FC<PerplexitySidebarProps> = ({ onSelectPrompt, onNewChat }) => {
  const { 
    isSidebarOpen, 
    toggleSidebar, 
    isBottomPanelOpen, 
    setBottomPanelOpen,
    setSecurityModalOpen,
    setCommandPaletteOpen,
    openTab,
    setActiveTabId,
    setSettingsOpen,
    setSettingsTab,
    userProfile,
    savedSessions
  } = useWorkbenchStore();

  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [sessionsExpanded, setSessionsExpanded] = useState(true);

  // ==========================================
  // 1. COLLAPSED VIEW (Slim Icon Rail ~56px)
  // Matching WhatsApp Image 2026-09-04 at 8.53.45 PM.jpeg
  // ==========================================
  if (!isSidebarOpen) {
    return (
      <aside className="w-14 bg-[#141515] border-r border-[#242627] flex flex-col items-center justify-between py-3 select-none flex-shrink-0 z-30 transition-all">
        {/* Top Icons */}
        <div className="flex flex-col items-center space-y-3 w-full">
          {/* Logo & Expand Toggle */}
          <button 
            onClick={toggleSidebar} 
            title="Expand Sidebar"
            className="p-2 rounded-xl hover:bg-[#202222] text-[#A2A8AB] hover:text-white transition-colors cursor-pointer"
          >
            <PerplexityLogo className="w-5 h-5 text-white" />
          </button>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            title="New Thread"
            className="w-9 h-9 rounded-xl bg-[#202222] hover:bg-[#282A2C] border border-[#2E3133] flex items-center justify-center text-white transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Computer / Terminal Mode */}
          <button
            onClick={() => setBottomPanelOpen(!isBottomPanelOpen)}
            title="Computer Mode (Terminal)"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              isBottomPanelOpen 
                ? 'bg-[#202222] text-[#20B8CD] border border-[#20B8CD]/40' 
                : 'text-[#858A8E] hover:text-white hover:bg-[#202222]'
            }`}
          >
            <TerminalIcon className="w-4 h-4" />
          </button>

          {/* Artefacts */}
          <button
            onClick={() => {
              openTab({ id: 'tab-deliverables', title: 'Deliverables & Artefacts', type: 'artifacts' });
              setActiveTabId('tab-deliverables');
            }}
            title="Deliverables & Artefacts"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#858A8E] hover:text-white hover:bg-[#202222] transition-colors cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          {/* Customise / Settings */}
          <button
            onClick={() => {
              setSettingsOpen(true);
              setSettingsTab('models');
            }}
            title="Workbench Settings & Model Selection"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#858A8E] hover:text-white hover:bg-[#202222] transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Projects / Folder */}
          <button
            onClick={() => {
              openTab({ id: 'tab-docs', title: 'Document Intelligence', type: 'document' });
              setActiveTabId('tab-docs');
            }}
            title="Documents & Vault"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#858A8E] hover:text-white hover:bg-[#202222] transition-colors cursor-pointer"
          >
            <Folder className="w-4 h-4" />
          </button>

          {/* Sessions / History */}
          <button
            onClick={toggleSidebar}
            title="Sessions History"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#858A8E] hover:text-white hover:bg-[#202222] transition-colors cursor-pointer"
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Icons */}
        <div className="flex flex-col items-center space-y-3 w-full">
          <button
            onClick={() => setSecurityModalOpen(true)}
            title="Local Engine · 100% Offline"
            className="w-8 h-8 rounded-full bg-[#202222] border border-[#2E3133] flex items-center justify-center text-[#858A8E] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-[#20B8CD]" />
          </button>

          <button
            onClick={() => {
              setSettingsOpen(true);
              setSettingsTab('profile');
            }}
            title={`User Profile: ${userProfile.displayName}`}
            className="w-8 h-8 rounded-full bg-[#282A2C] border border-[#3C4043] flex items-center justify-center text-xs font-semibold text-[#20B8CD] hover:border-[#20B8CD] transition-colors cursor-pointer"
          >
            {(userProfile.displayName || 'U')[0].toUpperCase()}
          </button>
        </div>
      </aside>
    );
  }

  // ==========================================
  // 2. EXPANDED VIEW (240px Perplexity Sidebar)
  // Matching WhatsApp Image 2026-09-04 at 8.50.46 PM.jpeg
  // ==========================================
  return (
    <aside className="w-64 bg-[#141515] border-r border-[#242627] flex flex-col font-sans select-none flex-shrink-0 z-30 transition-all text-xs text-[#858A8E]">
      {/* Top Header: Logo, Search, Collapse button */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-transparent">
        <div className="flex items-center gap-2.5">
          <PerplexityLogo className="w-5 h-5 text-white" />
          <span className="font-semibold text-white tracking-tight text-sm font-sans">
            LUMI
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            title="Search (Ctrl+K)"
            className="p-1.5 rounded-lg hover:bg-[#202222] text-[#858A8E] hover:text-white transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={toggleSidebar}
            title="Collapse Sidebar"
            className="p-1.5 rounded-lg hover:bg-[#202222] text-[#858A8E] hover:text-white transition-colors cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Nav Items */}
      <div className="px-3 pt-2 pb-3 space-y-1">
        {/* + New Thread Pill */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#202222] hover:bg-[#282A2C] border border-[#2E3133] text-white font-medium text-xs transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#20B8CD]" />
            <span>New</span>
          </div>
          <span className="text-[10px] text-[#5F6467] font-mono group-hover:text-[#858A8E]">^I</span>
        </button>

        {/* Computer (Terminal Sandbox) */}
        <button
          onClick={() => setBottomPanelOpen(!isBottomPanelOpen)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
            isBottomPanelOpen 
              ? 'bg-[#202222] text-white border border-[#20B8CD]/30' 
              : 'text-[#858A8E] hover:text-white hover:bg-[#1C1D1E]'
          }`}
        >
          <TerminalIcon className="w-4 h-4 text-[#20B8CD]" />
          <span>Computer</span>
        </button>

        {/* Artefacts */}
        <button
          onClick={() => {
            openTab({ id: 'tab-deliverables', title: 'Deliverables & Artefacts', type: 'artifacts' });
            setActiveTabId('tab-deliverables');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#858A8E] hover:text-white hover:bg-[#1C1D1E] font-medium transition-colors cursor-pointer"
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Artefacts</span>
        </button>

        {/* Customise / Settings */}
        <button
          onClick={() => {
            setSettingsOpen(true);
            setSettingsTab('models');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#858A8E] hover:text-white hover:bg-[#1C1D1E] font-medium transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span>Customise</span>
        </button>
      </div>

      {/* Middle Scrollable Section: Projects & Sessions */}
      <div className="flex-1 overflow-y-auto px-3 space-y-4 pt-1">
        {/* Projects Section */}
        <div>
          <button
            onClick={() => setProjectsExpanded(!projectsExpanded)}
            className="w-full flex items-center justify-between px-1 py-1 text-[11px] font-semibold text-[#858A8E] hover:text-white cursor-pointer"
          >
            <span>Projects</span>
            {projectsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {projectsExpanded && (
            <div className="mt-1.5 p-3 rounded-xl bg-[#1C1D1E] border border-[#27292A] space-y-2.5">
              <div>
                <div className="font-semibold text-white text-[11.5px] leading-tight">
                  Organise and share your work
                </div>
                <div className="text-[11px] text-[#858A8E] mt-1 leading-snug">
                  Keep files, memory, and context together across sessions.
                </div>
              </div>
              <button
                onClick={() => {
                  openTab({ id: 'tab-docs', title: 'Document Intelligence', type: 'document' });
                  setActiveTabId('tab-docs');
                }}
                className="w-full py-1.5 px-2 rounded-lg bg-[#252829] hover:bg-[#2E3234] border border-[#323638] text-white text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FolderPlus className="w-3.5 h-3.5 text-[#20B8CD]" />
                <span>Document Vault</span>
              </button>
            </div>
          )}
        </div>

        {/* Sessions Section */}
        <div>
          <button
            onClick={() => setSessionsExpanded(!sessionsExpanded)}
            className="w-full flex items-center justify-between px-1 py-1 text-[11px] font-semibold text-[#858A8E] hover:text-white cursor-pointer"
          >
            <span>Sessions</span>
            {sessionsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {sessionsExpanded && (
            <div className="space-y-1 mt-1">
              {Array.isArray(savedSessions) && savedSessions.length > 0 ? (
                savedSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => onSelectPrompt(session.title)}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-[#1C1D1E] text-[#A2A8AB] hover:text-white transition-colors cursor-pointer truncate group"
                  >
                    <div className="truncate font-medium text-[11.5px] group-hover:text-white">
                      {session.title}
                    </div>
                    <div className="text-[10px] text-[#5F6467] mt-0.5 font-mono">
                      {session.createdAt}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-2.5 py-3 rounded-xl bg-[#1C1D1E]/40 text-center text-[#5F6467] text-[11px]">
                  No previous sessions yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Section: Plan & User Profile */}
      <div className="p-3 border-t border-[#242627] space-y-2">
        {/* Upgrade / Plan pill */}
        <div className="p-2 rounded-xl bg-[#1C1D1E] border border-[#27292A] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-white font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#20B8CD]"></span>
            <span>Local Engine</span>
          </div>
          <span className="text-[#858A8E] text-[10px] font-mono">Offline</span>
        </div>

        {/* User Account Row */}
        <div className="flex items-center justify-between pt-1 px-1">
          <div 
            onClick={() => {
              setSettingsOpen(true);
              setSettingsTab('profile');
            }}
            className="flex items-center gap-2 truncate cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-[#282A2C] border border-[#363A3D] group-hover:border-[#20B8CD] flex items-center justify-center font-bold text-xs text-[#20B8CD] flex-shrink-0 transition-colors">
              {(userProfile.displayName || 'U')[0].toUpperCase()}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate group-hover:text-[#20B8CD] transition-colors">
                {userProfile.displayName}
              </div>
              <div className="text-[10px] text-[#5F6467] leading-tight truncate">
                {userProfile.role}
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              setSettingsOpen(true);
              setSettingsTab('privacy');
            }}
            className="p-1 rounded-lg hover:bg-[#202222] text-[#858A8E] hover:text-white transition-colors cursor-pointer"
            title="Settings & Privacy"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
