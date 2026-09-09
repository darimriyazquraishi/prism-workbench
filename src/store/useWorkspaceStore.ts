import { create } from 'zustand';
import { resolveModelForCapability } from '../services/modelCapabilityRouter';
import { callLocalLlm, cleanAndParseJson } from '../services/localLlmService';

export interface WorkspaceNode {
  name: string;
  path: string; // relative path
  isDirectory: boolean;
  size?: number;
  extension?: string;
  modifiedAt?: string;
  children?: WorkspaceNode[];
}

export interface WorkspaceTabItem {
  id: string;
  name: string;
  path: string;
  extension: string;
  content: string;
  savedContent: string;
  isDirty: boolean;
  size?: number;
  isBinary?: boolean;
  extractedText?: string;
  version?: number;
}

export interface WorkspaceGitStatus {
  isGitRepo: boolean;
  branch?: string;
  modifiedFiles: string[];
  untrackedFiles: string[];
  dirtyCount: number;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: {
    tool: string;
    args: any;
    status: 'pending' | 'success' | 'failed' | 'requires_approval';
    output?: any;
    error?: string;
  }[];
  diffProposal?: {
    path: string;
    action: 'modify' | 'create' | 'delete';
    originalContent?: string;
    newContent?: string;
  };
  actionBadge?: {
    label: string;
    language?: string;
    code?: string;
    output?: string;
    status?: 'success' | 'failed' | 'completed';
  };
  imageCard?: {
    filename: string;
    path: string;
    rawUrl: string;
    prompt: string;
    modelId: string;
    modelName: string;
    modelFile?: string;
    width: number;
    height: number;
    durationMs: number;
    sizeBytes: number;
  };
}
 
export interface IdeChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AiChatMessage[];
}

function getInitialChatSessions(): { sessions: IdeChatSession[]; activeId: string; messages: AiChatMessage[] } {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem('lumi_ide_chat_sessions');
      if (raw) {
        const parsed: IdeChatSession[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Remove any legacy canned greetings from persisted sessions
          const cleaned = parsed.map(s => ({
            ...s,
            messages: (s.messages || []).filter(m => m.id !== 'msg-init' && !m.content.includes('I am LUMI, your Project Workspace AI Assistant'))
          }));
          const activeId = localStorage.getItem('lumi_ide_active_chat_id') || cleaned[0].id;
          const activeSession = cleaned.find(s => s.id === activeId) || cleaned[0];
          return {
            sessions: cleaned,
            activeId: activeSession.id,
            messages: activeSession.messages || []
          };
        }
      }
    }
  } catch {}

  const initialId = `ide-chat-${Date.now()}`;
  const initialSession: IdeChatSession = {
    id: initialId,
    title: 'New Chat',
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    updatedAt: new Date().toISOString(),
    messages: []
  };

  return {
    sessions: [initialSession],
    activeId: initialId,
    messages: []
  };
}

function syncSessionsList(sessions: IdeChatSession[], activeId: string, messages: AiChatMessage[]): IdeChatSession[] {
  const list = [...sessions];
  const idx = list.findIndex(s => s.id === activeId);

  const firstUser = messages.find(m => m.role === 'user');
  let title = 'New Chat';
  if (firstUser) {
    const clean = firstUser.content.replace(/^🎨\s*Create Image:\s*"?/, '').replace(/"$/, '').trim();
    title = clean.slice(0, 36) + (clean.length > 36 ? '...' : '');
  }

  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      title: list[idx].title === 'New Chat' || list[idx].title === 'Untitled Chat' ? title : list[idx].title,
      updatedAt: new Date().toISOString(),
      messages
    };
  } else {
    list.unshift({
      id: activeId,
      title,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toISOString(),
      messages
    });
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('lumi_ide_chat_sessions', JSON.stringify(list));
      localStorage.setItem('lumi_ide_active_chat_id', activeId);
    }
  } catch {}

  return list;
}

export interface WorkspaceState {
  // 1. Workspace Identity
  workspaceRoot: string;
  workspaceName: string;
  recentWorkspaces: { name: string; path: string; lastOpened: string; isGitRepo?: boolean }[];
  isLoadingTree: boolean;
  treeData: WorkspaceNode[];
  expandedPaths: Set<string>;
  searchQuery: string;

  // 2. Editor & Tabs
  openTabs: WorkspaceTabItem[];
  activeTabId: string | null;

  // 3. Git & Terminal
  gitStatus: WorkspaceGitStatus;
  isTerminalOpen: boolean;
  terminalHistory: string[];
  isExecutingCommand: boolean;

  // 4. AI & Permissions
  permissionMode: 'safe' | 'assisted' | 'autonomous';
  chatSessions: IdeChatSession[];
  activeChatSessionId: string;
  aiMessages: AiChatMessage[];
  isAiGenerating: boolean;
  activeDiffProposal: {
    path: string;
    action: 'modify' | 'create' | 'delete';
    originalContent?: string;
    newContent?: string;
  } | null;

  // 5. Actions
  loadWorkspaceInfo: () => Promise<void>;
  openWorkspace: (targetPath: string) => Promise<boolean>;
  refreshTree: () => Promise<void>;
  toggleFolder: (folderPath: string) => void;
  openFileInTab: (filePath: string) => Promise<void>;
  closeTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  saveActiveTab: () => Promise<boolean>;
  saveAllTabs: () => Promise<void>;
  createFile: (filePath: string, content?: string) => Promise<boolean>;
  createDirectory: (dirPath: string) => Promise<boolean>;
  deleteItem: (targetPath: string) => Promise<boolean>;
  renameItem: (oldPath: string, newPath: string) => Promise<boolean>;
  setPermissionMode: (mode: 'safe' | 'assisted' | 'autonomous') => void;
  toggleTerminal: () => void;
  executeTerminalCommand: (cmd: string) => Promise<void>;
  checkGitStatus: () => Promise<void>;
  selectedImageModel: string;
  setSelectedImageModel: (modelId: string) => void;
  activeAbortController: AbortController | null;
  stopAiGeneration: () => void;
  generateWorkspaceImage: (prompt: string, modelId?: string, skipUserMsg?: boolean) => Promise<void>;
  sendWorkspaceAiPrompt: (prompt: string, skipUserMsg?: boolean) => Promise<void>;
  editUserMessageAndRegenerate: (messageId: string, newContent: string) => Promise<void>;
  regenerateAiResponse: (aiMessageId: string) => Promise<void>;
  approveDiffProposal: () => Promise<void>;
  rejectDiffProposal: () => void;
  createNewChatSession: (force?: boolean) => string;
  selectChatSession: (sessionId: string) => void;
  deleteChatSession: (sessionId: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaceRoot: '',
  workspaceName: 'No Folder Opened',
  recentWorkspaces: [],
  isLoadingTree: false,
  treeData: [],
  expandedPaths: new Set<string>(),
  searchQuery: '',

  openTabs: [],
  activeTabId: null,

  gitStatus: { isGitRepo: false, modifiedFiles: [], untrackedFiles: [], dirtyCount: 0 },
  isTerminalOpen: false,
  terminalHistory: ['LUMI Workspace Terminal Ready. Type commands and press Enter.'],
  isExecutingCommand: false,

  selectedImageModel: 'sdxl-lightning',
  setSelectedImageModel: (modelId: string) => set({ selectedImageModel: modelId }),
  activeAbortController: null,

  permissionMode: 'assisted',
  ...(() => {
    const init = getInitialChatSessions();
    return {
      chatSessions: init.sessions,
      activeChatSessionId: init.activeId,
      aiMessages: init.messages
    };
  })(),
  isAiGenerating: false,
  activeDiffProposal: null,

  loadWorkspaceInfo: async () => {
    try {
      const res = await fetch('/api/workspace/open');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.activeWorkspace) {
          set({
            workspaceRoot: data.activeWorkspace.root,
            workspaceName: data.activeWorkspace.name,
            recentWorkspaces: data.recentWorkspaces || []
          });
          get().refreshTree();
          get().checkGitStatus();
        }
      }
    } catch (err) {
      console.error('Failed to load workspace info:', err);
    }
  },

  openWorkspace: async (targetPath: string) => {
    set({ isLoadingTree: true });
    try {
      const res = await fetch('/api/workspace/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: targetPath })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          set({
            workspaceRoot: data.activeWorkspace.root,
            workspaceName: data.activeWorkspace.name,
            recentWorkspaces: data.recentWorkspaces || [],
            openTabs: [],
            activeTabId: null,
            activeDiffProposal: null
          });
          await get().refreshTree();
          await get().checkGitStatus();
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Failed to open workspace:', err);
      return false;
    } finally {
      set({ isLoadingTree: false });
    }
  },

  refreshTree: async () => {
    set({ isLoadingTree: true });
    try {
      const res = await fetch('/api/workspace/tree');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          set({
            treeData: data.tree || [],
            workspaceName: data.rootName || get().workspaceName,
            workspaceRoot: data.rootPath || get().workspaceRoot
          });
        }
      }
    } catch (err) {
      console.error('Failed to refresh tree:', err);
    } finally {
      set({ isLoadingTree: false });
    }
  },

  toggleFolder: (folderPath: string) => {
    set(state => {
      const next = new Set(state.expandedPaths);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return { expandedPaths: next };
    });
  },

  openFileInTab: async (filePath: string) => {
    const { openTabs } = get();
    const existing = openTabs.find(t => t.path === filePath);

    try {
      const res = await fetch(`/api/workspace/file?path=${encodeURIComponent(filePath)}&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.file) {
          if (existing) {
            set(state => ({
              openTabs: state.openTabs.map(t =>
                t.path === filePath
                  ? {
                      ...t,
                      name: data.file.name,
                      extension: data.file.extension,
                      content: data.file.content ?? '',
                      savedContent: data.file.content ?? '',
                      size: data.file.size || Date.now(),
                      extractedText: data.file.extractedText ?? (data.file.content || ''),
                      version: Date.now()
                    }
                  : t
              ),
              activeTabId: existing.id
            }));
            return;
          }

          const newTab: WorkspaceTabItem = {
            id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: data.file.name,
            path: data.file.path,
            extension: data.file.extension,
            content: data.file.content ?? '',
            savedContent: data.file.content ?? '',
            isDirty: false,
            size: data.file.size || Date.now(),
            isBinary: data.file.isBinary,
            extractedText: data.file.extractedText ?? (data.file.content || ''),
            version: Date.now()
          };
          set(state => ({
            openTabs: [...state.openTabs, newTab],
            activeTabId: newTab.id
          }));
        }
      }
    } catch (err) {
      console.error('Failed to open file in tab:', err);
    }
  },

  closeTab: (tabId: string) => {
    set(state => {
      const idx = state.openTabs.findIndex(t => t.id === tabId);
      const filtered = state.openTabs.filter(t => t.id !== tabId);
      let nextActive = state.activeTabId;

      if (state.activeTabId === tabId) {
        if (filtered.length > 0) {
          const nextIdx = Math.max(0, idx - 1);
          nextActive = filtered[nextIdx].id;
        } else {
          nextActive = null;
        }
      }

      return { openTabs: filtered, activeTabId: nextActive };
    });
  },

  updateTabContent: (tabId: string, content: string) => {
    set(state => ({
      openTabs: state.openTabs.map(tab => {
        if (tab.id === tabId) {
          return {
            ...tab,
            content,
            isDirty: content !== tab.savedContent
          };
        }
        return tab;
      })
    }));
  },

  saveActiveTab: async () => {
    const { openTabs, activeTabId } = get();
    const activeTab = openTabs.find(t => t.id === activeTabId);
    if (!activeTab || activeTab.isBinary) return false;

    try {
      const res = await fetch('/api/workspace/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: activeTab.path,
          content: activeTab.content
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          set(state => ({
            openTabs: state.openTabs.map(t => {
              if (t.id === activeTab.id) {
                return { ...t, savedContent: t.content, isDirty: false };
              }
              return t;
            })
          }));
          get().checkGitStatus();
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Failed to save tab:', err);
      return false;
    }
  },

  saveAllTabs: async () => {
    const { openTabs, saveActiveTab } = get();
    for (const tab of openTabs) {
      if (tab.isDirty) {
        set({ activeTabId: tab.id });
        await saveActiveTab();
      }
    }
  },

  createFile: async (filePath: string, content = '') => {
    try {
      const res = await fetch('/api/workspace/file', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content, isDirectory: false })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await get().refreshTree();
          await get().openFileInTab(filePath);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  },

  createDirectory: async (dirPath: string) => {
    try {
      const res = await fetch('/api/workspace/file', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: dirPath, isDirectory: true })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await get().refreshTree();
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  },

  deleteItem: async (targetPath: string) => {
    try {
      const res = await fetch('/api/workspace/file', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: targetPath })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Close tab if open
          set(state => ({
            openTabs: state.openTabs.filter(t => t.path !== targetPath),
            activeTabId: state.activeTabId && state.openTabs.find(t => t.id === state.activeTabId)?.path === targetPath ? null : state.activeTabId
          }));
          await get().refreshTree();
          await get().checkGitStatus();
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  },

  renameItem: async (oldPath: string, newPath: string) => {
    try {
      const res = await fetch('/api/workspace/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPath, newPath })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await get().refreshTree();
          set(state => ({
            openTabs: state.openTabs.map(t => {
              if (t.path === oldPath) {
                return { ...t, path: newPath, name: newPath.split('/').pop() || t.name };
              }
              return t;
            })
          }));
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  },

  setPermissionMode: (mode) => set({ permissionMode: mode }),

  toggleTerminal: () => set(s => ({ isTerminalOpen: !s.isTerminalOpen })),

  executeTerminalCommand: async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    set(state => ({
      isExecutingCommand: true,
      terminalHistory: [...state.terminalHistory, `$ ${trimmed}`]
    }));

    try {
      const res = await fetch('/api/workspace/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: trimmed })
      });

      if (res.ok) {
        const data = await res.json();
        const out = data.stdout ? data.stdout.trim() : '';
        const err = data.stderr ? data.stderr.trim() : (data.error || '');

        set(state => ({
          terminalHistory: [
            ...state.terminalHistory,
            out ? out : '',
            err ? `Error: ${err}` : '',
            data.exitCode && data.exitCode !== 0 ? `Process exited with code ${data.exitCode}` : ''
          ].filter(Boolean),
          isExecutingCommand: false
        }));
      } else {
        set(state => ({
          terminalHistory: [...state.terminalHistory, `HTTP Error: ${res.statusText}`],
          isExecutingCommand: false
        }));
      }
    } catch (err: any) {
      set(state => ({
        terminalHistory: [...state.terminalHistory, `Network Error: ${err.message}`],
        isExecutingCommand: false
      }));
    } finally {
      get().checkGitStatus();
    }
  },

  checkGitStatus: async () => {
    try {
      const res = await fetch('/api/workspace/git');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          set({
            gitStatus: {
              isGitRepo: data.isGitRepo,
              branch: data.branch,
              modifiedFiles: data.modifiedFiles || [],
              untrackedFiles: data.untrackedFiles || [],
              dirtyCount: data.dirtyCount || 0
            }
          });
        }
      }
    } catch {}
  },

  stopAiGeneration: () => {
    const ctrl = get().activeAbortController;
    if (ctrl) {
      try {
        ctrl.abort();
      } catch {}
    }
    set(state => {
      const msgs = [...state.aiMessages];
      if (msgs.length > 0 && state.isAiGenerating) {
        msgs.push({
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: '🛑 *Generation stopped by user.*',
          timestamp: new Date().toLocaleTimeString()
        });
      }
      return {
        isAiGenerating: false,
        activeAbortController: null,
        aiMessages: msgs,
        chatSessions: syncSessionsList(state.chatSessions, state.activeChatSessionId, msgs)
      };
    });
  },

  generateWorkspaceImage: async (prompt: string, modelId?: string, skipUserMsg?: boolean) => {
    const activeModel = modelId || get().selectedImageModel || 'sdxl-lightning';
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    const controller = new AbortController();

    if (!skipUserMsg) {
      const userMsg: AiChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: `🎨 Create Image: "${trimmedPrompt}"`,
        timestamp: new Date().toLocaleTimeString()
      };
      set(state => {
        const msgs = [...state.aiMessages, userMsg];
        return {
          aiMessages: msgs,
          chatSessions: syncSessionsList(state.chatSessions, state.activeChatSessionId, msgs),
          isAiGenerating: true,
          activeAbortController: controller
        };
      });
    } else {
      set({ isAiGenerating: true, activeAbortController: controller });
    }

    try {
      const res = await fetch('/api/workspace/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          modelId: activeModel
        }),
        signal: controller.signal
      });

      const data = await res.json();
      if (data.success && data.image) {
        await get().refreshTree();
        await get().openFileInTab(data.image.path);

        const assistantMsg: AiChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: `Generated image with **${data.image.modelName}** in ${(data.image.durationMs / 1000).toFixed(1)}s.`,
          timestamp: new Date().toLocaleTimeString(),
          imageCard: data.image
        };

        set(state => {
          const msgs = [...state.aiMessages, assistantMsg];
          return {
            isAiGenerating: false,
            activeAbortController: null,
            aiMessages: msgs,
            chatSessions: syncSessionsList(state.chatSessions, state.activeChatSessionId, msgs)
          };
        });
      } else {
        const errorMsg: AiChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: `❌ Image generation error: ${data.error || 'Failed to generate image'}`,
          timestamp: new Date().toLocaleTimeString()
        };
        set(state => {
          const msgs = [...state.aiMessages, errorMsg];
          return {
            isAiGenerating: false,
            activeAbortController: null,
            aiMessages: msgs,
            chatSessions: syncSessionsList(state.chatSessions, state.activeChatSessionId, msgs)
          };
        });
      }
    } catch (err: any) {
      const isAborted = controller.signal.aborted || err.name === 'AbortError' || err.message?.includes('aborted');
      set(state => {
        const msgs = [
          ...state.aiMessages,
          {
            id: `asst-${Date.now()}`,
            role: 'assistant',
            content: isAborted ? '🛑 *Image generation stopped by user.*' : `❌ Image generation failed: ${err.message}`,
            timestamp: new Date().toLocaleTimeString()
          }
        ];
        return {
          isAiGenerating: false,
          activeAbortController: null,
          aiMessages: msgs,
          chatSessions: syncSessionsList(state.chatSessions, state.activeChatSessionId, msgs)
        };
      });
    }
  },

  sendWorkspaceAiPrompt: async (prompt: string, skipUserMsg?: boolean) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const controller = new AbortController();

    if (!skipUserMsg) {
      const userMsg: AiChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toLocaleTimeString()
      };

      set(state => {
        const msgs = [...state.aiMessages, userMsg];
        return {
          aiMessages: msgs,
          isAiGenerating: true,
          activeAbortController: controller,
          chatSessions: syncSessionsList(state.chatSessions, state.activeChatSessionId, msgs)
        };
      });
    } else {
      set({ isAiGenerating: true, activeAbortController: controller });
    }

    // Auto-detect if prompt is an image generation request
    const imageMatch = trimmed.match(/^(?:\/image\s+|(?:create|generate|make|draw|render)\s+(?:an?\s+)?image\s*(?:of\s+|about\s+|for\s+)?)(.+)$/i);
    if (imageMatch) {
      const imgPrompt = imageMatch[1].trim();
      if (imgPrompt) {
        await get().generateWorkspaceImage(imgPrompt, undefined, true);
        return;
      }
    }

    // 1. Path traversal security check
    if (trimmed.includes('..') || trimmed.includes('../') || trimmed.includes('..\\')) {
      const secRes = await fetch('/api/workspace/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'read_file',
          args: { path: trimmed.match(/[a-zA-Z0-9_\-./\\]+\.\./)?.[0] || '../../some-file.txt' }
        })
      });
      const secData = await secRes.json().catch(() => ({}));
      set(state => {
        const msgs = [
          ...state.aiMessages,
          {
            id: `asst-${Date.now()}`,
            role: 'assistant',
            content: `🛡️ **Security Boundary Violation Rejection:**\n\n\`${secData.error || 'Security Violation: Path traversal sequence (..) is forbidden'}\`\n\nAll AI filesystem operations are strictly jailed to the active workspace boundary (\`${get().workspaceRoot}\`).`,
            timestamp: new Date().toLocaleTimeString(),
            toolCalls: [{ tool: 'read_file', args: { path: '../../some-file.txt' }, status: 'failed', error: secData.error }]
          }
        ];
        return {
          isAiGenerating: false,
          aiMessages: msgs,
          chatSessions: syncSessionsList(state.chatSessions, state.activeChatSessionId, msgs)
        };
      });
      return;
    }

    try {
      const activeTab = get().openTabs.find(t => t.id === get().activeTabId);
      const executedToolCalls: { tool: string; args: any; status: 'pending' | 'success' | 'failed' | 'requires_approval'; output?: any; error?: string }[] = [];

      // 2. Intent Detection & Execution:
      // A) Create Folder Intent
      const folderMatch = trimmed.match(/(?:create|make|new|add)\s+(?:a\s+)?(?:folder|directory|dir)\s+(?:named\s+|called\s+)?['"]?([a-zA-Z0-9_\-./\\]+)['"]?/i) ||
                          trimmed.match(/^mkdir\s+['"]?([a-zA-Z0-9_\-./\\]+)['"]?/i);
      if (folderMatch) {
        const folderToCreate = folderMatch[1].replace(/\\/g, '/').replace(/\/$/, '');
        try {
          const dirRes = await fetch('/api/workspace/tools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tool: 'create_directory',
              args: { path: folderToCreate },
              permissionMode: 'autonomous',
              approved: true
            })
          });
          const dirData = await dirRes.json().catch(() => ({}));
          await get().refreshTree();
          executedToolCalls.push({
            tool: 'create_directory',
            args: { path: folderToCreate },
            status: dirData.success ? 'success' : 'failed',
            output: dirData.output
          });
        } catch {}
      }

      // B) File Context Resolution:
      const explicitFileMatch = trimmed.match(/(?:(?:file|in|to|for|at|from|component)\s+)?([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+)/i);
      const explicitFilePath = explicitFileMatch ? explicitFileMatch[1].replace(/\\/g, '/') : null;
      
      const isTargetingCurrentFile = /(?:this\s+file|current\s+file|active\s+file|@activeTab|same\s+pdf|this\s+pdf|the\s+pdf|same\s+file|this\s+file|the\s+file|same\s+doc|same\s+document|add\s+another\s+text|add\s+text|in\s+the\s+same|in\s+this|in\s+it|to\s+it|modify\s+it|edit\s+it|update\s+it)\b/i.test(trimmed) || 
                                    (/^(?:fix|edit|modify|update|refactor|add\s+to\s+this|append)\b/i.test(trimmed) && !explicitFilePath);

      let candidatePath: string | null = null;
      if (explicitFilePath) {
        candidatePath = explicitFilePath;
      } else if (isTargetingCurrentFile && activeTab) {
        candidatePath = activeTab.path;
      } else if (isTargetingCurrentFile) {
        // Look through recent assistant messages for the last created/modified file path
        for (let i = get().aiMessages.length - 1; i >= 0; i--) {
          const msg = get().aiMessages[i];
          if (msg.role === 'assistant') {
            const pathMatch = msg.content.match(/(?:at|for|file:?|to)\s+[`'"]?([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+)[`'"]?/i) ||
                              msg.content.match(/[`'"]([a-zA-Z0-9_\-./\\]+\.(?:pdf|py|js|ts|tsx|jsx|html|css|json|md))[`'"]/i);
            if (pathMatch) {
              candidatePath = pathMatch[1].replace(/\\/g, '/');
              break;
            }
          }
        }
      }

      let inspectedFile: { path: string; content: string; size: number; extension: string } | null = null;

      if (candidatePath) {
        try {
          const readRes = await fetch(`/api/workspace/file?path=${encodeURIComponent(candidatePath)}`);
          if (readRes.ok) {
            const readData = await readRes.json();
            if (readData.success && readData.file) {
              inspectedFile = {
                path: readData.file.path,
                content: readData.file.content || '',
                size: readData.file.size || 0,
                extension: readData.file.extension || 'txt'
              };
              executedToolCalls.push({
                tool: 'read_file',
                args: { path: inspectedFile.path },
                status: 'success',
                output: { size: inspectedFile.size, path: inspectedFile.path }
              });
            }
          }
        } catch {}
      }

      // 3. Task & Agent Routing:
      const isReasoningTask = /^(explain|analyze|why|what\s+is|how\s+does|plan|architecture|review|understand)\b/i.test(trimmed);
      const isDeleteTask = /^delete\s+/i.test(trimmed);
      const isCodingTask = !isReasoningTask && (
        /^(create|write|fix|modify|update|refactor|add|implement|generate|build|make|append)\b/i.test(trimmed) ||
        /(?:add\s+another|add\s+text|in\s+the\s+same|the\s+same\s+pdf|this\s+pdf|the\s+pdf)/i.test(trimmed) ||
        trimmed.includes('bug') || trimmed.includes('component') || trimmed.includes('code') || trimmed.includes('function') || trimmed.includes('pdf') || trimmed.includes('script')
      );

      // Handle Delete explicitly if requested
      if (isDeleteTask && candidatePath) {
        if (get().permissionMode !== 'autonomous') {
          set(state => {
            const msgs = [
              ...state.aiMessages,
              {
                id: `asst-${Date.now()}`,
                role: 'assistant',
                content: `⚠️ **Confirmation Required:** Do you want me to delete \`${candidatePath}\` from your workspace? Click **Approve Delete** to execute.`,
                timestamp: new Date().toLocaleTimeString(),
                diffProposal: { path: candidatePath!, action: 'delete' }
              }
            ];
            return {
              isAiGenerating: false,
              activeDiffProposal: { path: candidatePath!, action: 'delete' },
              aiMessages: msgs,
              chatSessions: syncSessionsList(state.chatSessions, state.activeChatSessionId, msgs)
            };
          });
          return;
        }

        const delRes = await fetch('/api/workspace/tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool: 'delete_file',
            args: { path: candidatePath },
            permissionMode: get().permissionMode,
            approved: true
          })
        });
        const delData = await delRes.json().catch(() => ({}));
        await get().refreshTree();

        set(state => {
          const msgs = [
            ...state.aiMessages,
            {
              id: `asst-${Date.now()}`,
              role: 'assistant',
              content: delData.success
                ? `✓ **Deleted file from disk:** \`${candidatePath}\``
                : `❌ Failed to delete file: ${delData.error}`,
              timestamp: new Date().toLocaleTimeString(),
              toolCalls: [{ tool: 'delete_file', args: { path: candidatePath }, status: delData.success ? 'success' : 'failed' }]
            }
          ];
          return {
            isAiGenerating: false,
            aiMessages: msgs,
            chatSessions: syncSessionsList(state.chatSessions, state.activeChatSessionId, msgs)
          };
        });
        return;
      }

      // Resolve Agent & Model
      const modelDesc = isCodingTask
        ? resolveModelForCapability('code')
        : resolveModelForCapability('text_reasoning');
      
      const agentRoleName = isCodingTask
        ? `Coding Agent (${modelDesc.name})`
        : `General Reasoning Agent (${modelDesc.name})`;

      const systemPrompt = isCodingTask
        ? `You are LUMI's Autonomous Workspace Assistant & Coding Agent. You inspect workspace files, create directories, and write robust code.
Workstation Runtime Environment:
- OS: Windows
- Python 3.14 with reportlab, os, sys pre-installed
- Node.js runtime available

CRITICAL: You MUST respond strictly with a valid JSON object conforming to this schema:
{
  "action": "Editing PDF",
  "summary": "Updated sanGAYan.pdf with the requested text.",
  "code": "complete runnable Python or JavaScript script",
  "language": "python"
}

STRICT RULES:
1. "action": Concise 2-4 word task title (e.g. "Editing PDF", "Creating Script", "Updating Document").
2. "summary": Clean, smart 1-2 sentence human explanation of what was done. NEVER put code, markdown fences, or installation commands in the summary.
3. "code": Complete, standalone runnable script that performs the file operation or edit. When editing a PDF, write both the original text and the new text using non-overlapping Y coordinates.
4. "language": "python" or "javascript".
5. Do NOT output any markdown prose outside the JSON.`
        : `You are LUMI's General Reasoning Agent. You analyze project architecture, explain code, debug logic, and plan structural changes across workspace files. Provide insightful, rigorously verified reasoning.`;

      let agentUserPrompt = `[Workspace: ${get().workspaceName}]\n[Root: ${get().workspaceRoot}]\n`;
      if (candidatePath) {
        agentUserPrompt += `[Target File: ${candidatePath}]\n`;
      }
      if (inspectedFile && inspectedFile.extension !== 'pdf') {
        agentUserPrompt += `\n[Inspected File Content: ${inspectedFile.path} (${inspectedFile.size} bytes)]\n\`\`\`${inspectedFile.extension}\n${inspectedFile.content.slice(0, 10000)}\n\`\`\`\n`;
      }

      // Append conversation history (up to last 6 turns) so edits have full context of previous code
      const recentHistory = get().aiMessages.slice(-6);
      if (recentHistory.length > 0) {
        agentUserPrompt += `\n[Conversation History]:\n`;
        for (const msg of recentHistory) {
          const roleLabel = msg.role === 'user' ? 'User' : 'Assistant';
          // Sanitize past messages of repetitive role tags or enormous blobs
          const cleanHistory = msg.content
            .replace(/"?Coding Agent \([^)]+\)"?/gi, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
          const snippet = cleanHistory.length > 1500 ? cleanHistory.slice(0, 1500) + '...' : cleanHistory;
          agentUserPrompt += `${roleLabel}:\n${snippet}\n\n`;
        }
      }

      agentUserPrompt += `[User Request]: ${trimmed}`;

      // 4. Query the Local LLM (Ollama / GPU) with formatJson constraint
      const llmResult = await callLocalLlm({
        model: modelDesc.tag,
        systemPrompt,
        userPrompt: agentUserPrompt,
        formatJson: isCodingTask,
        temperature: isCodingTask ? 0.1 : 0.2,
        signal: controller.signal
      });

      const responseText = llmResult.content || 'I completed the task analysis.';

      // 5. Code modification & Action Execution handling
      let parsedJson: { action?: string; summary?: string; code?: string; language?: string } | null = null;
      try {
        parsedJson = cleanAndParseJson<typeof parsedJson>(responseText);
      } catch {}

      // Extract all code blocks
      const codeBlocks: { lang: string; code: string }[] = [];
      const codeBlockRegex = /```([a-zA-Z0-9_\-]+)?\n([\s\S]*?)```/g;
      let blockMatch;
      while ((blockMatch = codeBlockRegex.exec(responseText)) !== null) {
        codeBlocks.push({
          lang: (blockMatch[1] || '').toLowerCase(),
          code: blockMatch[2].trim()
        });
      }

      // Filter out installation shell snippets (e.g. pip install, npm install, sh, bash)
      const executableBlocks = codeBlocks.filter(b => {
        if (['sh', 'bash', 'cmd', 'powershell', 'shell'].includes(b.lang)) return false;
        if (/^\s*(?:pip|npm|yarn|pnpm)\s+install\b/m.test(b.code)) return false;
        return true;
      });

      // Pick the best executable block (preferably python/js/ts or longest)
      const selectedBlock = executableBlocks.find(b => ['python', 'py', 'javascript', 'js', 'typescript', 'ts'].includes(b.lang)) ||
                            executableBlocks[0] ||
                            codeBlocks[0] ||
                            null;

      const generatedCode = parsedJson?.code?.trim() || selectedBlock?.code || null;
      const scriptLang = (parsedJson?.language || selectedBlock?.lang || 'python').toLowerCase();

      let proposedDiff: { path: string; action: 'modify' | 'create' | 'delete'; originalContent?: string; newContent?: string } | null = null;
      let executedScriptSuccess = false;
      let scriptOutput = '';

      if (isCodingTask && generatedCode) {
        const isPythonScript = scriptLang === 'python' || scriptLang === 'py' ||
                               /(?:import\s+[a-zA-Z0-9_.]+|from\s+[a-zA-Z0-9_.]+\s+import)/.test(generatedCode) ||
                               /(?:def\s+[a-zA-Z0-9_]+\s*\(|if\s+__name__\s*==)/.test(generatedCode);
        const isNodeScript = !isPythonScript && (
          ['javascript', 'js', 'typescript', 'ts'].includes(scriptLang) ||
          /(?:const\s+.*=\s*require\(|import\s+.*from\s+['"])/.test(generatedCode)
        );
        const isActionExecutionTask = /pdf|image|chart|plot|run|execute|script|generate|make|render|add\s+text|in\s+the\s+same|the\s+same\s+pdf|append|edit|modify/i.test(trimmed) ||
                                      (candidatePath && /\.pdf$/i.test(candidatePath));

        // A) If LLM generated an executable script to satisfy the user's action task, execute it directly
        if ((isPythonScript || isNodeScript) && isActionExecutionTask) {
          try {
            const ext = isNodeScript ? 'js' : 'py';
            const tempScriptName = `_task_exec_${Date.now()}.${ext}`;
            await fetch('/api/workspace/tools', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tool: 'create_file',
                args: { path: tempScriptName, content: generatedCode },
                permissionMode: 'autonomous',
                approved: true
              })
            });

            const execCmd = isNodeScript ? `node ${tempScriptName}` : `python ${tempScriptName}`;
            const execRes = await fetch('/api/workspace/terminal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ command: execCmd })
            });
            const execData = await execRes.json().catch(() => ({}));

            await fetch('/api/workspace/tools', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tool: 'delete_file',
                args: { path: tempScriptName },
                permissionMode: 'autonomous',
                approved: true
              })
            });

            await get().refreshTree();

            // If a candidate file was targeted, reopen it so viewer updates
            if (candidatePath) {
              await get().openFileInTab(candidatePath);
            }

            if (execData.success || (execData.stdout && !execData.stderr)) {
              executedScriptSuccess = true;
              scriptOutput = (execData.stdout || '').trim();
            }

            executedToolCalls.push({
              tool: 'execute_script',
              args: { runtime: isNodeScript ? 'node' : 'python', target: candidatePath || 'workspace' },
              status: executedScriptSuccess ? 'success' : 'failed',
              output: scriptOutput || execData.stderr || execData.error
            });
          } catch (err: any) {
            console.error('Failed to execute task script:', err);
          }
        } else if (candidatePath) {
          // B) If user specified a file path or asked to edit current file
          const targetPath = candidatePath;
          const action = inspectedFile ? ('modify' as const) : ('create' as const);

          if (get().permissionMode === 'assisted' && action === 'modify') {
            proposedDiff = {
              path: targetPath,
              action,
              originalContent: inspectedFile ? inspectedFile.content : '',
              newContent: generatedCode
            };
            set({ activeDiffProposal: proposedDiff });
          } else {
            const toolName = action === 'create' ? 'create_file' : 'write_file';
            const writeRes = await fetch('/api/workspace/tools', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tool: toolName,
                args: { path: targetPath, content: generatedCode },
                permissionMode: 'autonomous',
                approved: true
              })
            });
            const writeData = await writeRes.json().catch(() => ({}));
            await get().refreshTree();
            await get().openFileInTab(targetPath);
            executedToolCalls.push({
              tool: toolName,
              args: { path: targetPath },
              status: writeData.success ? 'success' : 'failed',
              output: writeData.output
            });
          }
        }
      }

      // 6. Action title & smart human summary
      let actionTitle = parsedJson?.action || '';
      if (!actionTitle) {
        if (candidatePath && /\.pdf$/i.test(candidatePath)) {
          actionTitle = /(?:create|make|new)\b/i.test(trimmed) ? 'Creating PDF' : 'Editing PDF';
        } else if (candidatePath) {
          const base = candidatePath.split('/').pop() || candidatePath;
          actionTitle = /(?:create|make|new)\b/i.test(trimmed) ? `Creating ${base}` : `Editing ${base}`;
        } else if (folderMatch) {
          actionTitle = `Creating Directory ${folderMatch[1]}`;
        } else {
          actionTitle = (isCodingTask && generatedCode) ? 'Executing Script' : 'Workspace Action';
        }
      }

      let humanSummary = parsedJson?.summary?.trim() || '';
      if (!humanSummary) {
        humanSummary = responseText
          .replace(/```(?:[a-zA-Z0-9_\-]+)?\n[\s\S]*?```/g, '')
          .replace(/\{[\s\S]*?"code"[\s\S]*?\}/g, '')
          .replace(/\*\*Coding Agent[^\n]*\*\*/gi, '')
          .replace(/"?Coding Agent[^"\n]*"?/gi, '')
          .replace(/### Explanation:?/gi, '')
          .replace(/---/g, '')
          .trim();
      }

      // Clean summary of any leftover markdown code blocks or role prefixes
      humanSummary = humanSummary
        .replace(/```[a-zA-Z0-9_\-]*\n[\s\S]*?```/g, '')
        .replace(/"?Coding Agent \([^)]+\)"?/gi, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      if (!humanSummary || humanSummary.length < 8) {
        if (candidatePath) {
          humanSummary = executedScriptSuccess
            ? `Successfully updated \`${candidatePath}\`.`
            : `Completed workspace modifications for \`${candidatePath}\`.`;
        } else {
          humanSummary = 'Completed the requested workspace task.';
        }
      }

      const actionBadge = (generatedCode || executedScriptSuccess) ? {
        label: actionTitle,
        language: scriptLang,
        code: generatedCode || undefined,
        output: scriptOutput || undefined,
        status: (executedScriptSuccess ? 'success' : 'completed') as 'success' | 'completed'
      } : undefined;

      let finalContent = humanSummary;
      if (proposedDiff) {
        finalContent += `\n\n⚡ **Diff proposal ready:** Generated ${proposedDiff.action} for \`${proposedDiff.path}\`. Review diff in editor and click **Accept Changes** to save to disk.`;
      } else if (get().permissionMode === 'autonomous' && candidatePath && !executedScriptSuccess && generatedCode) {
        finalContent += `\n\n✓ **Auto-applied change:** Written to \`${candidatePath}\` on physical disk.`;
      }

      set(state => {
        const msgs = [
          ...state.aiMessages,
          {
            id: `asst-${Date.now()}`,
            role: 'assistant',
            content: finalContent,
            timestamp: new Date().toLocaleTimeString(),
            toolCalls: executedToolCalls.length > 0 ? executedToolCalls : undefined,
            diffProposal: proposedDiff || undefined,
            actionBadge
          }
        ];
        return {
          isAiGenerating: false,
          activeAbortController: null,
          aiMessages: msgs,
          chatSessions: syncSessionsList(state.chatSessions, state.activeChatSessionId, msgs)
        };
      });
    } catch (err: any) {
      const isAborted = controller.signal.aborted || err.name === 'AbortError' || err.message?.includes('aborted');
      set(state => {
        const msgs = [
          ...state.aiMessages,
          {
            id: `asst-${Date.now()}`,
            role: 'assistant',
            content: isAborted ? '🛑 *Generation stopped by user.*' : `Error executing workspace request: ${err.message}`,
            timestamp: new Date().toLocaleTimeString()
          }
        ];
        return {
          isAiGenerating: false,
          activeAbortController: null,
          aiMessages: msgs,
          chatSessions: syncSessionsList(state.chatSessions, state.activeChatSessionId, msgs)
        };
      });
    }
  },

  editUserMessageAndRegenerate: async (messageId: string, newContent: string) => {
    const trimmed = newContent.trim();
    if (!trimmed) return;

    get().stopAiGeneration();

    const messages = get().aiMessages;
    const targetIdx = messages.findIndex(m => m.id === messageId);
    if (targetIdx === -1) return;

    const updatedUserMsg: AiChatMessage = {
      ...messages[targetIdx],
      content: trimmed,
      timestamp: new Date().toLocaleTimeString()
    };

    const prunedMessages = [...messages.slice(0, targetIdx), updatedUserMsg];
    set(state => ({
      aiMessages: prunedMessages,
      chatSessions: syncSessionsList(state.chatSessions, state.activeChatSessionId, prunedMessages)
    }));

    await get().sendWorkspaceAiPrompt(trimmed, true);
  },

  regenerateAiResponse: async (aiMessageId: string) => {
    get().stopAiGeneration();

    const messages = get().aiMessages;
    const asstIdx = messages.findIndex(m => m.id === aiMessageId);
    if (asstIdx === -1) return;

    let precedingUserMsg: AiChatMessage | null = null;
    let userIdx = -1;
    for (let i = asstIdx - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        precedingUserMsg = messages[i];
        userIdx = i;
        break;
      }
    }

    if (!precedingUserMsg) return;

    const prunedMessages = messages.slice(0, userIdx + 1);
    set(state => ({
      aiMessages: prunedMessages,
      chatSessions: syncSessionsList(state.chatSessions, state.activeChatSessionId, prunedMessages)
    }));

    if (precedingUserMsg.content.startsWith('🎨 Create Image:')) {
      const match = precedingUserMsg.content.match(/🎨 Create Image:\s*"?([^"]*)"?/);
      const prompt = match ? match[1] : precedingUserMsg.content.replace('🎨 Create Image:', '').trim();
      await get().generateWorkspaceImage(prompt, undefined, true);
    } else {
      await get().sendWorkspaceAiPrompt(precedingUserMsg.content, true);
    }
  },

  approveDiffProposal: async () => {
    const { activeDiffProposal } = get();
    if (!activeDiffProposal) return;

    const { path: targetPath, action, newContent = '' } = activeDiffProposal;

    if (action === 'delete') {
      await fetch('/api/workspace/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'delete_file',
          args: { path: targetPath },
          permissionMode: 'autonomous',
          approved: true
        })
      });
    } else {
      await fetch('/api/workspace/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'write_file',
          args: { path: targetPath, content: newContent },
          permissionMode: 'autonomous',
          approved: true
        })
      });
      await get().openFileInTab(targetPath);
    }

    await get().refreshTree();
    await get().checkGitStatus();

    set(state => {
      const msgs = [
        ...state.aiMessages,
        {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: `✓ **Approved & Applied Changes:** Successfully executed \`${action}\` on \`${targetPath}\` and written to physical disk.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ];
      return {
        activeDiffProposal: null,
        aiMessages: msgs,
        chatSessions: syncSessionsList(state.chatSessions, state.activeChatSessionId, msgs)
      };
    });
  },

  rejectDiffProposal: () => {
    set(state => {
      const msgs = [
        ...state.aiMessages,
        {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: `Declined proposed changes. No modifications were written to disk.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ];
      return {
        activeDiffProposal: null,
        aiMessages: msgs,
        chatSessions: syncSessionsList(state.chatSessions, state.activeChatSessionId, msgs)
      };
    });
  },

  createNewChatSession: (force?: boolean) => {
    const { chatSessions, activeChatSessionId, aiMessages } = get();
    // If not forced, check if the active session is already empty/new (no user messages)
    if (!force) {
      const activeSession = chatSessions.find(s => s.id === activeChatSessionId);
      const currentMsgs = activeSession?.messages || aiMessages;
      const hasUserMsg = currentMsgs.some(m => m.role === 'user');
      if (!hasUserMsg && activeSession) {
        // Return existing blank session
        return activeSession.id;
      }
    }

    const newId = `ide-chat-${Date.now()}`;
    const newSession: IdeChatSession = {
      id: newId,
      title: 'New Chat',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toISOString(),
      messages: []
    };

    const updatedSessions = [newSession, ...chatSessions];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('lumi_ide_chat_sessions', JSON.stringify(updatedSessions));
        localStorage.setItem('lumi_ide_active_chat_id', newId);
      }
    } catch {}

    set({
      chatSessions: updatedSessions,
      activeChatSessionId: newId,
      aiMessages: [],
      activeDiffProposal: null
    });

    return newId;
  },

  selectChatSession: (sessionId: string) => {
    const { chatSessions } = get();
    const target = chatSessions.find(s => s.id === sessionId);
    if (!target) return;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('lumi_ide_active_chat_id', target.id);
      }
    } catch {}

    set({
      activeChatSessionId: target.id,
      aiMessages: target.messages || [],
      activeDiffProposal: null
    });
  },

  deleteChatSession: (sessionId: string) => {
    const { chatSessions, activeChatSessionId } = get();
    const filtered = chatSessions.filter(s => s.id !== sessionId);

    let nextSessions = filtered;
    let nextActiveId = activeChatSessionId;
    let nextMessages = get().aiMessages;

    if (filtered.length === 0) {
      const freshId = `ide-chat-${Date.now()}`;
      const freshSession: IdeChatSession = {
        id: freshId,
        title: 'New Chat',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedAt: new Date().toISOString(),
        messages: []
      };
      nextSessions = [freshSession];
      nextActiveId = freshId;
      nextMessages = [];
    } else if (activeChatSessionId === sessionId) {
      nextActiveId = filtered[0].id;
      nextMessages = filtered[0].messages || [];
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('lumi_ide_chat_sessions', JSON.stringify(nextSessions));
        localStorage.setItem('lumi_ide_active_chat_id', nextActiveId);
      }
    } catch {}

    set({
      chatSessions: nextSessions,
      activeChatSessionId: nextActiveId,
      aiMessages: nextMessages,
      activeDiffProposal: null
    });
  }
}));
