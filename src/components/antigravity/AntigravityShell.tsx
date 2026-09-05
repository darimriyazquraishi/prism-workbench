import React, { useState, useRef } from 'react';
import { AntigravityHeader } from './AntigravityHeader';
import { AntigravityStatusBar } from './AntigravityStatusBar';
import { MainWorkspaceView } from '../views/MainWorkspaceView';
import { ModelManagementView } from '../views/ModelManagementView';
import { WorkflowKnowledgeView } from '../views/WorkflowKnowledgeView';
import { CompositeOverviewView } from '../views/CompositeOverviewView';
import { CommandPalette } from '../modals/CommandPalette';
import { SecurityStatusModal } from '../modals/SecurityStatusModal';
import { FilePreviewModal } from '../modals/FilePreviewModal';
import { UserSettingsModal } from '../modals/UserSettingsModal';
import { ServerHealthModal } from '../modals/ServerHealthModal';
import { 
  Home, 
  Folder, 
  Book, 
  Network,
  LayoutGrid,
  Plus,
  ChevronDown,
  Play,
  FileText,
  FileSpreadsheet,
  Layers,
  Bell,
  Upload,
  X,
  Image as ImageIcon,
  Code
} from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';

export type ActiveScreenView = 'workspace' | 'models' | 'workflow' | 'composite';

export const AntigravityShell: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<ActiveScreenView>('workspace');
  const sidebarFileInputRef = useRef<HTMLInputElement>(null);
  const { 
    runIndustrialDemo, 
    setActiveTaskStarted, 
    clearAttachments, 
    isSidebarOpen, 
    toggleSidebar,
    setActivePreviewFile,
    setSettingsModalOpen,
    notifications,
    clearNotifications,
    markNotificationRead,
    isNotificationsOpen,
    setNotificationsOpen,
    uploadedFiles,
    addUploadedFiles,
    removeUploadedFile,
    sessions,
    activeSessionId,
    createNewSession,
    selectSession
  } = useAntigravityStore();

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden select-none font-sans">
      {/* 1. Antigravity Top Mission Header */}
      <AntigravityHeader />

      {/* 2. Screen Viewport with Left Icon Rail */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar (Unified) */}
        <div className={`relative flex-shrink-0 flex flex-col transition-[width] duration-200 ease-in-out ${isSidebarOpen ? 'w-[260px]' : 'w-0'} bg-[var(--bg-surface)] border-[var(--border-subtle)] ${isSidebarOpen ? 'border-r' : ''} z-10 h-full group/leftpane`}>
          <div className="w-[260px] h-full flex flex-col overflow-hidden">
          {/* Top: + New Thread / Task */}
          <div className="p-3">
            <button
              onClick={() => {
                setActiveScreen('workspace');
                createNewSession();
              }}
              className="w-full flex items-center justify-between px-3 py-2 bg-[var(--bg-base)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-full text-sm font-medium transition-colors cursor-pointer text-[var(--text-primary)] shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>+ New Chat</span>
              </div>
              <span className="text-[10px] text-[var(--text-secondary)] font-mono font-bold">⌘N</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 space-y-4 pb-4">
            {/* Primary Nav */}
            <div className="space-y-0.5">
              <button
                onClick={() => setActiveScreen('workspace')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm font-medium ${
                  activeScreen === 'workspace'
                    ? 'text-[var(--text-primary)] bg-[var(--bg-elevated)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
              <button
                onClick={() => setActiveScreen('models')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm font-medium ${
                  activeScreen === 'models'
                    ? 'text-[var(--text-primary)] bg-[var(--bg-elevated)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                <Network className="w-4 h-4" />
                <span>Models &amp; Agents</span>
              </button>
              <button
                onClick={() => setActiveScreen('workflow')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm font-medium ${
                  activeScreen === 'workflow'
                    ? 'text-[var(--text-primary)] bg-[var(--bg-elevated)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                <Book className="w-4 h-4" />
                <span>Knowledge Base</span>
              </button>
              <button
                onClick={() => setActiveScreen('composite')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm font-medium ${
                  activeScreen === 'composite'
                    ? 'text-[var(--text-primary)] bg-[var(--bg-elevated)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Composite View</span>
              </button>
            </div>

            {/* Recent Sessions List */}
            {activeScreen === 'workspace' && (
              <div className="pt-2">
                <div className="px-3 pb-2 text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                  <ChevronDown className="w-3 h-3" />
                  Recent Chat Threads
                </div>
                <div className="space-y-0.5 max-h-40 overflow-y-auto pr-1">
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      onClick={() => {
                        setActiveScreen('workspace');
                        selectSession(sess.id);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-between ${
                        sess.id === activeSessionId
                          ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                      }`}
                    >
                      <span className="truncate pr-2">{sess.title || 'Untitled Thread'}</span>
                      <span className="text-[9px] font-mono text-[var(--text-tertiary)] flex-shrink-0">
                        {sess.steps.length} msgs
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Secondary Content - Show only if in workspace/relevant */}
            {activeScreen === 'workspace' && (
              <>
                <div className="pt-2">
                  <div className="px-3 pb-2 text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                    <ChevronDown className="w-3 h-3" />
                    Projects & Demos
                  </div>
                  <div className="space-y-0.5">
                    <div 
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-[var(--bg-elevated)] cursor-pointer group text-sm" 
                      onClick={() => { 
                        setActiveScreen('workspace'); 
                        runIndustrialDemo('inspection'); 
                      }}
                    >
                      <div className="flex items-center gap-2 truncate text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                        <Play className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors" />
                        <span className="truncate">Inspection Analysis</span>
                      </div>
                      <span className="text-[8px] bg-[var(--bg-elevated)] px-1 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)]">Flagship</span>
                    </div>
                    <div 
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-[var(--bg-elevated)] cursor-pointer group text-sm" 
                      onClick={() => { 
                        setActiveScreen('workspace'); 
                        runIndustrialDemo('pump_mtbf'); 
                      }}
                    >
                      <div className="flex items-center gap-2 truncate text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                        <Play className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors" />
                        <span className="truncate">Pump Failure</span>
                      </div>
                      <span className="text-[8px] bg-[var(--bg-elevated)] px-1 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)]">Python</span>
                    </div>
                  </div>
                </div>

              </>
            )}

            {/* Air-Gap Enterprise Card */}
            <div className="mt-4 mx-2 p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-subtle)] relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Local Enterprise Vault</h4>
                <p className="text-[11px] text-[var(--text-secondary)] mb-3 leading-relaxed">Air-gapped session state automatically persisted to local memory.</p>
                <div className="text-[10px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--accent-success)] px-3 py-1.5 rounded-full text-center font-mono font-bold flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-success)]"></span>
                  <span>Auto-Saved to Local Storage</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom User Profile Row */}
          <div className="p-2 relative">
            <div className="flex items-center justify-between px-3 py-2 hover:bg-[var(--bg-elevated)] rounded-xl cursor-pointer transition-colors">
              <div 
                onClick={() => setSettingsModalOpen(true)}
                className="flex items-center gap-2.5 flex-1 min-w-0"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--text-primary)] text-[var(--bg-base)] flex items-center justify-center text-[10px] font-bold">JS</div>
                <span className="text-sm font-medium text-[var(--text-primary)] truncate">J. Smith</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setNotificationsOpen(!isNotificationsOpen);
                }}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer relative"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
                )}
              </button>
            </div>

            {/* Notification Popover Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute bottom-14 left-2 right-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-xl p-3 z-50 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                  <span className="font-bold text-[var(--text-primary)] font-mono text-[11px]">SYSTEM ALERTS ({notifications.filter(n => !n.read).length})</span>
                  <button 
                    onClick={clearNotifications}
                    className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="text-[11px] text-[var(--text-secondary)] text-center py-2">No active notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-2 rounded border cursor-pointer transition-colors ${
                          n.read ? 'bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-secondary)]' : 'bg-[var(--bg-elevated)] border-[var(--accent-primary)]/40 text-[var(--text-primary)]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[11px] mb-0.5">
                          <span className={n.type === 'alert' ? 'text-rose-400' : 'text-[var(--accent-primary)]'}>{n.title}</span>
                          <span className="text-[9px] font-mono opacity-60">{n.timestamp}</span>
                        </div>
                        <p className="text-[10px] leading-snug">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          </div>

          <button 
            onClick={toggleSidebar}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded flex items-center justify-center opacity-0 group-hover/leftpane:opacity-100 transition-opacity z-20 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[10px]"
            title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? '‹' : '›'}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden bg-[var(--bg-base)]">
          {activeScreen === 'workspace' && <MainWorkspaceView />}
          {activeScreen === 'models' && <ModelManagementView />}
          {activeScreen === 'workflow' && <WorkflowKnowledgeView />}
          {activeScreen === 'composite' && (
            <CompositeOverviewView onSelectView={(v) => setActiveScreen(v)} />
          )}
        </div>
      </div>

      {/* 4. Bottom IDE Status Bar */}
      <AntigravityStatusBar />

      {/* 5. Modals */}
      <CommandPalette onRunScenario={(_prompt, _file) => runIndustrialDemo('inspection')} />
      <SecurityStatusModal />
      <FilePreviewModal />
      <UserSettingsModal />
      <ServerHealthModal />
    </div>
  );
};
