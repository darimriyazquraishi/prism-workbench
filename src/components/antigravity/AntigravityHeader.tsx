import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  PanelRight, 
  PanelRightClose, 
  Command,
  Menu,
  Edit2,
  Check,
  User,
  Settings
} from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';

export const AntigravityHeader: React.FC = () => {
  const { 
    sessions, 
    activeSessionId, 
    selectedModel, 
    setSelectedModel,
    projectTitle,
    setProjectTitle,
    isRightPaneOpen,
    toggleRightPane,
    setCommandPaletteOpen,
    setSecurityModalOpen,
    setServerHealthModalOpen,
    setSettingsModalOpen,
    isServerOnline,
    toggleSidebar
  } = useAntigravityStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(projectTitle);

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      setProjectTitle(tempTitle.trim());
    } else {
      setTempTitle(projectTitle);
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-9 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-3 flex items-center justify-between select-none flex-shrink-0 z-20 font-sans text-xs">
      {/* Left: Antigravity Branding & Workspace Breadcrumb */}
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          title="Toggle Left Sidebar"
          className="p-1 rounded-md hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>
        <img src="/lumi-logo-horizontal.jpeg" alt="Lumi" className="h-5 w-auto mix-blend-screen opacity-90 hover:opacity-100 transition-opacity cursor-pointer" />
        
        <div className="h-4 w-[1px] bg-[var(--border-subtle)] hidden sm:block"></div>

        {/* Editable Project Title */}
        <div className="hidden lg:flex items-center text-[var(--text-secondary)] font-sans text-xs max-w-sm truncate">
          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setTempTitle(projectTitle);
                    setIsEditingTitle(false);
                  }
                }}
                className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2 py-0.5 rounded text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] font-sans"
                autoFocus
              />
              <button 
                onClick={handleSaveTitle}
                title="Save Title"
                className="p-1 hover:text-[var(--accent-success)] cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => {
                setTempTitle(projectTitle);
                setIsEditingTitle(true);
              }}
              title="Click to rename project title"
              className="flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors cursor-pointer group truncate"
            >
              <span className="truncate">{projectTitle}</span>
              <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-tertiary)] flex-shrink-0" />
            </div>
          )}
        </div>
      </div>

      {/* Right: Status Cluster + Actions */}
      <div className="flex items-center gap-2">
        {/* Status Cluster Pill */}
        <div className="hidden md:flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-full px-2.5 py-1 text-[11px] font-sans">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-transparent border-none text-[var(--text-secondary)] focus:outline-none cursor-pointer hover:text-[var(--text-primary)] transition-colors max-w-[130px] truncate"
          >
            <option value="" className="bg-[var(--bg-elevated)]">No model selected</option>
            <option value="Qwen3-8B-Instruct" className="bg-[var(--bg-elevated)]">Qwen3-8B</option>
            <option value="Qwen3-14B-Instruct" className="bg-[var(--bg-elevated)]">Qwen3-14B</option>
            <option value="Qwen2.5-VL-7B-Instruct" className="bg-[var(--bg-elevated)]">Qwen2.5-VL</option>
            <option value="Qwen2.5-Coder-7B" className="bg-[var(--bg-elevated)]">Qwen-Coder</option>
          </select>
          <div className="w-1 h-1 rounded-full bg-[var(--border-subtle)]"></div>
          <button
            onClick={() => setServerHealthModalOpen(true)}
            title={isServerOnline ? "Local Ollama engine connected (Click for health metrics)" : "Local engine offline (Click for configuration)"}
            className="flex items-center gap-1.5 font-medium cursor-pointer hover:opacity-80 transition-opacity text-[var(--text-primary)]"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isServerOnline ? 'bg-[var(--accent-success)] shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></span>
            <span>{isServerOnline ? 'Local' : 'Offline'}</span>
          </button>
        </div>

        <div className="h-4 w-[1px] bg-[var(--border-subtle)] mx-1 hidden sm:block"></div>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          title="Open Command Palette (Ctrl+K)"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-mono transition-colors cursor-pointer"
        >
          <Command className="w-3.5 h-3.5" />
          <span>K</span>
        </button>

        {/* Settings Modal Trigger */}
        <button
          onClick={() => setSettingsModalOpen(true)}
          title="Enterprise Settings & Profile"
          className="p-1.5 rounded-full border bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Toggle Right Live Artifact / Viewer Pane */}
        <button
          onClick={toggleRightPane}
          title={isRightPaneOpen ? 'Close Artifacts Pane' : 'Open Artifacts Pane'}
          className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
            isRightPaneOpen 
              ? 'bg-[var(--bg-elevated)] border-[var(--accent-primary)] text-[var(--text-primary)]' 
              : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {isRightPaneOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
