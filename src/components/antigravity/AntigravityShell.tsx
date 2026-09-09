import React, { useState, useRef, useEffect } from 'react';
import { AntigravityHeader } from './AntigravityHeader';
import { AntigravityStatusBar } from './AntigravityStatusBar';
import { MainWorkspaceView } from '../views/MainWorkspaceView';
import { ModelManagementView } from '../views/ModelManagementView';
import { WorkflowKnowledgeView } from '../views/WorkflowKnowledgeView';
import { IdeWorkspaceView } from '../views/IdeWorkspaceView';
import { CommandPalette } from '../modals/CommandPalette';
import { SecurityStatusModal } from '../modals/SecurityStatusModal';
import { FilePreviewModal } from '../modals/FilePreviewModal';
import { DeliverablePreviewModal } from '../modals/DeliverablePreviewModal';
import { UserSettingsModal } from '../modals/UserSettingsModal';
import { ServerHealthModal } from '../modals/ServerHealthModal';
import { LumiLauncher } from '../launcher/LumiLauncher';
import { WorkbenchVerificationSidebar } from './WorkbenchVerificationSidebar';
import { 
  Home, 
  Book, 
  Network, 
  Plus, 
  ChevronDown, 
  Play, 
  MessageSquare, 
  Trash2,
  Layers,
  FolderTree
} from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';

export type ActiveScreenView = 'workspace' | 'models' | 'workflow' | 'ide';

export const AntigravityShell: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<ActiveScreenView>('workspace');
  const previousScreenRef = useRef<ActiveScreenView>(activeScreen);
  const sidebarFileInputRef = useRef<HTMLInputElement>(null);
  const { 
    runIndustrialDemo, 
    isSidebarOpen, 
    toggleSidebar,
    setSettingsModalOpen,
    sessions,
    activeSessionId,
    createNewSession,
    selectSession,
    deleteSession,
    setLauncherOpen,
    loadKnowledgeBaseFromDisk
  } = useAntigravityStore();

  const {
    chatSessions,
    activeChatSessionId,
    selectChatSession,
    deleteChatSession,
    createNewChatSession
  } = useWorkspaceStore();

  useEffect(() => {
    loadKnowledgeBaseFromDisk();
  }, [loadKnowledgeBaseFromDisk]);

  // When switching into IDE Explorer from another view, automatically start a new chat (unless the active chat is already blank)
  useEffect(() => {
    if (activeScreen === 'ide' && previousScreenRef.current !== 'ide') {
      createNewChatSession();
    }
    previousScreenRef.current = activeScreen;
  }, [activeScreen, createNewChatSession]);

  const handleNewChat = () => {
    if (activeScreen === 'ide') {
      createNewChatSession(true);
    } else {
      setActiveScreen('workspace');
      createNewSession();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeScreen, createNewSession, createNewChatSession]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden select-none font-sans">
      {/* 1. Antigravity Top Mission Header */}
      <AntigravityHeader />

      {/* 2. Screen Viewport with Left Icon Rail */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar (Unified) */}
        <div className="relative flex-shrink-0 h-full z-10 group/leftpane flex">
          <div className={`h-full flex flex-col transition-[width] duration-200 ease-in-out ${isSidebarOpen ? 'w-[260px] border-r' : 'w-0 border-r-0'} bg-[var(--bg-surface)] border-[var(--border-subtle)] overflow-hidden`}>
            <div className="w-[260px] h-full flex flex-col overflow-hidden">
          {/* Top: + New Thread / Task */}
          <div className="p-3">
            <button
              onClick={handleNewChat}
              title="Create New Chat (Ctrl + N)"
              className="w-full flex items-center justify-between px-3 py-2 bg-[var(--bg-base)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-full text-sm font-medium transition-colors cursor-pointer text-[var(--text-primary)] shadow-sm group"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[var(--accent-primary)] group-hover:scale-110 transition-transform" />
                <span>New Chat</span>
              </div>
              <span className="text-[10px] text-[var(--text-secondary)] font-mono font-medium bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">Ctrl + N</span>
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
                onClick={() => {
                  setActiveScreen('ide');
                  createNewChatSession();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm font-medium ${
                  activeScreen === 'ide'
                    ? 'text-[var(--text-primary)] bg-[var(--bg-elevated)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                <FolderTree className="w-4 h-4 text-purple-400" />
                <span>IDE Explorer</span>
              </button>
              <button
                onClick={() => setLauncherOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              >
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Launcher &amp; VRAM</span>
              </button>
            </div>

            {/* Recent Sessions List - Displays IDE chats when on IDE, or Studio chats when on Workspace */}
            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5">
              <div className="px-3 pb-1 text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-between">
                <span>{activeScreen === 'ide' ? 'IDE Recent Chats' : 'Recent Chats'}</span>
                <span className="text-[9px] font-mono text-[var(--text-tertiary)]">
                  {activeScreen === 'ide' ? chatSessions.length : sessions.length}
                </span>
              </div>
              <div className="space-y-0.5 max-h-[360px] overflow-y-auto pr-1">
                {activeScreen === 'ide' ? (
                  chatSessions.length === 0 ? (
                    <div className="px-3 py-3 text-[11px] text-[var(--text-tertiary)] italic border border-dashed border-[var(--border-subtle)] rounded-lg text-center">
                      No IDE chats yet. Click + New Chat to begin.
                    </div>
                  ) : (
                    chatSessions.map((sess) => (
                      <div
                        key={sess.id}
                        onClick={() => selectChatSession(sess.id)}
                        className={`group px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-between ${
                          sess.id === activeChatSessionId
                            ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                          <span className="truncate text-xs">{sess.title || 'New Chat'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[9px] font-mono text-[var(--text-tertiary)] group-hover:hidden">
                            {sess.messages.length} msgs
                          </span>
                          {chatSessions.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChatSession(sess.id);
                              }}
                              title="Delete chat from history"
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-950/50 text-[var(--text-secondary)] hover:text-rose-400 transition-all cursor-pointer flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  sessions.length === 0 ? (
                    <div className="px-3 py-3 text-[11px] text-[var(--text-tertiary)] italic border border-dashed border-[var(--border-subtle)] rounded-lg text-center">
                      No active chats. Click + New Chat to begin.
                    </div>
                  ) : (
                    sessions.map((sess) => (
                      <div
                        key={sess.id}
                        onClick={() => {
                          setActiveScreen('workspace');
                          selectSession(sess.id);
                        }}
                        className={`group px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-between ${
                          sess.id === activeSessionId && activeScreen === 'workspace'
                            ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                          <span className="truncate text-xs">{sess.title || 'Untitled Chat'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[9px] font-mono text-[var(--text-tertiary)] group-hover:hidden">
                            {sess.steps.length} msgs
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(sess.id);
                            }}
                            title="Delete chat from history"
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-950/50 text-[var(--text-secondary)] hover:text-rose-400 transition-all cursor-pointer flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>


          </div>
        </div>
      </div>

          <button 
            onClick={toggleSidebar}
            className={`absolute top-1/2 -translate-y-1/2 w-3 h-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded flex items-center justify-center transition-all z-20 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[10px] ${
              isSidebarOpen ? '-right-3 opacity-0 group-hover/leftpane:opacity-100' : 'left-0 opacity-80 hover:opacity-100 shadow-md'
            }`}
            title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? '‹' : '›'}
          </button>
        </div>

        {/* Main Content - Persistent views prevent remounts & preserve state */}
        <div className="flex-1 flex overflow-hidden bg-[var(--bg-base)]">
          <div className={`flex-1 flex overflow-hidden min-w-0 ${activeScreen === 'workspace' ? '' : 'hidden'}`}>
            <div className="flex-1 flex overflow-hidden min-w-0">
              <MainWorkspaceView />
            </div>
          </div>
          <div className={`flex-1 flex overflow-hidden min-w-0 ${activeScreen === 'models' ? '' : 'hidden'}`}>
            <ModelManagementView />
          </div>
          <div className={`flex-1 flex overflow-hidden min-w-0 ${activeScreen === 'workflow' ? '' : 'hidden'}`}>
            <WorkflowKnowledgeView />
          </div>
          <div className={`flex-1 flex overflow-hidden min-w-0 ${activeScreen === 'ide' ? '' : 'hidden'}`}>
            <IdeWorkspaceView />
          </div>
        </div>
      </div>

      {/* 4. Bottom IDE Status Bar */}
      <AntigravityStatusBar />

      {/* 5. Modals & Launcher */}
      <LumiLauncher />
      <CommandPalette onRunScenario={(_prompt, _file) => runIndustrialDemo('inspection')} />
      <SecurityStatusModal />
      <FilePreviewModal />
      <DeliverablePreviewModal />
      <UserSettingsModal />
      <ServerHealthModal />
    </div>
  );
};
