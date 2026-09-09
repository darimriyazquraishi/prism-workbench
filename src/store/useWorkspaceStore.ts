import { create } from 'zustand';
import { resolveModelForCapability } from '../services/modelCapabilityRouter';
import { callLocalLlm } from '../services/localLlmService';

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
  sendWorkspaceAiPrompt: (prompt: string) => Promise<void>;
  approveDiffProposal: () => Promise<void>;
  rejectDiffProposal: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaceRoot: '',
  workspaceName: 'No Folder Opened',
  recentWorkspaces: [],
  isLoadingTree: false,
  treeData: [],
  expandedPaths: new Set(['src']),
  searchQuery: '',

  openTabs: [],
  activeTabId: null,

  gitStatus: { isGitRepo: false, modifiedFiles: [], untrackedFiles: [], dirtyCount: 0 },
  isTerminalOpen: false,
  terminalHistory: ['LUMI Workspace Terminal Ready. Type commands and press Enter.'],
  isExecutingCommand: false,

  permissionMode: 'assisted',
  aiMessages: [
    {
      id: 'msg-init',
      role: 'assistant',
      content: 'I am LUMI, your Project Workspace AI Assistant. Open any project folder to allow me to inspect, search, create, and modify your code directly with full air-gapped security.',
      timestamp: new Date().toLocaleTimeString()
    }
  ],
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
    if (existing) {
      set({ activeTabId: existing.id });
      return;
    }

    try {
      const res = await fetch(`/api/workspace/file?path=${encodeURIComponent(filePath)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.file) {
          const newTab: WorkspaceTabItem = {
            id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: data.file.name,
            path: data.file.path,
            extension: data.file.extension,
            content: data.file.content ?? '',
            savedContent: data.file.content ?? '',
            isDirty: false,
            size: data.file.size,
            isBinary: data.file.isBinary,
            extractedText: data.file.extractedText ?? (data.file.content || '')
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

  sendWorkspaceAiPrompt: async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const userMsg: AiChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString()
    };

    set(state => ({
      aiMessages: [...state.aiMessages, userMsg],
      isAiGenerating: true
    }));

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
      set(state => ({
        isAiGenerating: false,
        aiMessages: [
          ...state.aiMessages,
          {
            id: `asst-${Date.now()}`,
            role: 'assistant',
            content: `🛡️ **Security Boundary Violation Rejection:**\n\n\`${secData.error || 'Security Violation: Path traversal sequence (..) is forbidden'}\`\n\nAll AI filesystem operations are strictly jailed to the active workspace boundary (\`${get().workspaceRoot}\`).`,
            timestamp: new Date().toLocaleTimeString(),
            toolCalls: [{ tool: 'read_file', args: { path: '../../some-file.txt' }, status: 'failed', error: secData.error }]
          }
        ]
      }));
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
          set(state => ({
            isAiGenerating: false,
            activeDiffProposal: { path: candidatePath!, action: 'delete' },
            aiMessages: [
              ...state.aiMessages,
              {
                id: `asst-${Date.now()}`,
                role: 'assistant',
                content: `⚠️ **Confirmation Required:** Do you want me to delete \`${candidatePath}\` from your workspace? Click **Approve Delete** to execute.`,
                timestamp: new Date().toLocaleTimeString(),
                diffProposal: { path: candidatePath!, action: 'delete' }
              }
            ]
          }));
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

        set(state => ({
          isAiGenerating: false,
          aiMessages: [
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
          ]
        }));
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
        ? `You are LUMI's Autonomous Workspace Coding Agent. You inspect existing workspace files, create directories, and write robust code.
Workstation Runtime Environment:
- OS: Windows
- Python 3.14 with reportlab, os, sys pre-installed.
- Node.js runtime available.

STRICT RULES FOR CODE GENERATION:
1. When asked to edit, modify, or add text/content to an existing PDF or file, provide the complete, updated runnable Python script (using reportlab) that regenerates or updates the file with ALL required contents (both the original text and newly requested text).
2. NEVER output installation commands like 'pip install' or 'npm install'. All necessary libraries are pre-installed.
3. Provide ONLY ONE executable code block containing the complete, self-contained, working script.
4. When writing multiple text strings on a canvas, use appropriate Y coordinates so lines do not collide (e.g. y=750 for line 1, y=720 for line 2).
5. Never output infinite loops or duplicate lines. Keep explanations brief after the code block.`
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
          const snippet = msg.content.length > 1500 ? msg.content.slice(0, 1500) + '...' : msg.content;
          agentUserPrompt += `${roleLabel}:\n${snippet}\n\n`;
        }
      }

      agentUserPrompt += `[User Request]: ${trimmed}`;

      // 4. Query the Local LLM (Ollama / GPU)
      const llmResult = await callLocalLlm({
        model: modelDesc.tag,
        systemPrompt,
        userPrompt: agentUserPrompt,
        temperature: isCodingTask ? 0.1 : 0.2
      });

      const responseText = llmResult.content || 'I completed the task analysis.';

      // 5. Code modification & Action Execution handling
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

      const generatedCode = selectedBlock ? selectedBlock.code : null;

      let proposedDiff: { path: string; action: 'modify' | 'create' | 'delete'; originalContent?: string; newContent?: string } | null = null;
      let executedScriptSuccess = false;
      let scriptOutput = '';

      if (isCodingTask && generatedCode) {
        const isPythonScript = (selectedBlock?.lang === 'python' || selectedBlock?.lang === 'py') ||
                               /(?:import\s+[a-zA-Z0-9_.]+|from\s+[a-zA-Z0-9_.]+\s+import)/.test(generatedCode) ||
                               /(?:def\s+[a-zA-Z0-9_]+\s*\(|if\s+__name__\s*==)/.test(generatedCode);
        const isNodeScript = !isPythonScript && (
          ['javascript', 'js', 'typescript', 'ts'].includes(selectedBlock?.lang || '') ||
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
              args: { runtime: isNodeScript ? 'node' : 'python' },
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

      // 6. Append assistant message to chat
      let finalContent = `**${agentRoleName}**\n\n${responseText}`;
      if (executedScriptSuccess) {
        finalContent += `\n\n---\n✓ **Action Completed:** Executed Python script in workspace. Created required files and directories.${scriptOutput ? ` Output: \`${scriptOutput}\`` : ''}`;
      } else if (proposedDiff) {
        finalContent += `\n\n---\n⚡ **Diff proposal ready:** Generated ${proposedDiff.action} for \`${proposedDiff.path}\`. Review diff in editor and click **Accept Changes** to save to disk.`;
      } else if (get().permissionMode === 'autonomous' && candidatePath && generatedCode) {
        finalContent += `\n\n---\n✓ **Auto-applied change:** Written to \`${candidatePath}\` on physical disk in autonomous mode.`;
      }

      set(state => ({
        isAiGenerating: false,
        aiMessages: [
          ...state.aiMessages,
          {
            id: `asst-${Date.now()}`,
            role: 'assistant',
            content: finalContent,
            timestamp: new Date().toLocaleTimeString(),
            toolCalls: executedToolCalls.length > 0 ? executedToolCalls : undefined,
            diffProposal: proposedDiff || undefined
          }
        ]
      }));
    } catch (err: any) {
      set(state => ({
        isAiGenerating: false,
        aiMessages: [
          ...state.aiMessages,
          {
            id: `asst-${Date.now()}`,
            role: 'assistant',
            content: `Error executing workspace request: ${err.message}`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]
      }));
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

    set(state => ({
      activeDiffProposal: null,
      aiMessages: [
        ...state.aiMessages,
        {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: `✓ **Approved & Applied Changes:** Successfully executed \`${action}\` on \`${targetPath}\` and written to physical disk.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    }));
  },

  rejectDiffProposal: () => {
    set(state => ({
      activeDiffProposal: null,
      aiMessages: [
        ...state.aiMessages,
        {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: `Declined proposed changes. No modifications were written to disk.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    }));
  }
}));
