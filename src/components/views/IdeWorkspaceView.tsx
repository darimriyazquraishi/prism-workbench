import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  FolderTree,
  FolderPlus,
  FilePlus,
  FileCode,
  FileText,
  FileSpreadsheet,
  Presentation,
  File,
  ChevronRight,
  ChevronDown,
  Search,
  Copy,
  Check,
  Maximize2,
  RefreshCw,
  Eye,
  Image as ImageIcon,
  ShieldCheck,
  Shield,
  Sparkles,
  X,
  Terminal as TerminalIcon,
  Save,
  Plus,
  Trash2,
  Edit2,
  GitBranch,
  Play,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Send,
  CornerDownLeft,
  Clock,
  Code2,
  Sliders,
  ChevronUp,
  Upload,
  ArrowLeft,
  History,
  MessageSquare,
  Square,
  Pencil,
  RotateCcw
} from 'lucide-react';
import { useWorkspaceStore, type WorkspaceNode } from '../../store/useWorkspaceStore';
import { useAntigravityStore } from '../../store/useAntigravityStore';
import { IdeCommandPalette } from '../modals/IdeCommandPalette';
import { DocumentViewer } from '../workspaces/DocumentViewer';

export const IdeWorkspaceView: React.FC = () => {
  const { allArtifacts, setActivePreviewArtifact } = useAntigravityStore();

  const {
    workspaceRoot,
    workspaceName,
    recentWorkspaces,
    isLoadingTree,
    treeData,
    expandedPaths,
    openTabs,
    activeTabId,
    gitStatus,
    isTerminalOpen,
    terminalHistory,
    isExecutingCommand,
    permissionMode,
    chatSessions,
    activeChatSessionId,
    aiMessages,
    isAiGenerating,
    activeDiffProposal,

    loadWorkspaceInfo,
    openWorkspace,
    refreshTree,
    toggleFolder,
    openFileInTab,
    closeTab,
    updateTabContent,
    saveActiveTab,
    saveAllTabs,
    createFile,
    createDirectory,
    deleteItem,
    renameItem,
    setPermissionMode,
    toggleTerminal,
    executeTerminalCommand,
    checkGitStatus,
    selectedImageModel,
    setSelectedImageModel,
    generateWorkspaceImage,
    sendWorkspaceAiPrompt,
    stopAiGeneration,
    editUserMessageAndRegenerate,
    regenerateAiResponse,
    approveDiffProposal,
    rejectDiffProposal,
    createNewChatSession,
    selectChatSession,
    deleteChatSession
  } = useWorkspaceStore();

  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const activeChatSession = chatSessions.find(s => s.id === activeChatSessionId);

  // Local state for UI
  const [activeSidebarTab, setActiveSidebarTab] = useState<'files' | 'changes'>('files');
  const [searchFilter, setSearchFilter] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [paletteMode, setPaletteMode] = useState<'files' | 'commands' | 'open-folder'>('files');

  // Edit message & action states
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageText, setEditingMessageText] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleStartEditing = (msgId: string, currentContent: string) => {
    setEditingMessageId(msgId);
    setEditingMessageText(currentContent);
  };

  const handleCancelEditing = () => {
    setEditingMessageId(null);
    setEditingMessageText('');
  };

  const handleSaveAndRegenerate = async (msgId: string) => {
    if (!editingMessageText.trim()) return;
    const textToSubmit = editingMessageText.trim();
    setEditingMessageId(null);
    setEditingMessageText('');
    await editUserMessageAndRegenerate(msgId, textToSubmit);
  };
  
  // Modals & prompts
  const [newPromptModal, setNewPromptModal] = useState<{ isOpen: boolean; type: 'file' | 'folder' | 'rename' | 'delete'; targetPath: string; defaultVal: string }>({
    isOpen: false,
    type: 'file',
    targetPath: '',
    defaultVal: ''
  });
  const [promptInputValue, setPromptInputValue] = useState('');

  // Context menu
  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; x: number; y: number; node: WorkspaceNode | null }>({
    isOpen: false,
    x: 0,
    y: 0,
    node: null
  });

  // Editor states
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Terminal input
  const [terminalInput, setTerminalInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // AI Chat Pane resizing state
  const [aiChatWidth, setAiChatWidth] = useState<number>(360);
  const [isResizingAiChat, setIsResizingAiChat] = useState<boolean>(false);

  // Create Image Mode state
  const [isCreateImageMode, setIsCreateImageMode] = useState<boolean>(false);

  // Action code dropdown expansion state
  const [expandedActionIds, setExpandedActionIds] = useState<Set<string>>(new Set());

  const toggleActionDropdown = (id: string) => {
    setExpandedActionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderAssistantMessageBody = (content: string) => {
    if (!content.includes('```')) {
      return <span>{content}</span>;
    }

    const parts = content.split(/(```[a-zA-Z0-9_\-]*\n[\s\S]*?```)/g);
    return (
      <div className="space-y-2">
        {parts.map((part, idx) => {
          const match = part.match(/^```([a-zA-Z0-9_\-]*)\n([\s\S]*?)```$/);
          if (match) {
            const lang = match[1] || 'code';
            const code = match[2].trim();
            return (
              <details
                key={idx}
                className="my-1.5 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] overflow-hidden"
              >
                <summary className="px-2.5 py-1.5 text-xs font-semibold cursor-pointer hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] flex items-center justify-between select-none">
                  <div className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                    <span>{lang ? `${lang.toUpperCase()} Script` : 'Script'}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)]">Click to view code</span>
                </summary>
                <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-base)] p-2">
                  <pre className="text-[11px] font-mono overflow-x-auto text-[var(--text-secondary)] whitespace-pre select-text max-h-60 leading-normal">
                    <code>{code}</code>
                  </pre>
                </div>
              </details>
            );
          }
          const text = part.trim();
          if (!text) return null;
          return <span key={idx}>{text}</span>;
        })}
      </div>
    );
  };

  useEffect(() => {
    if (!isResizingAiChat) return;

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 280 && newWidth <= 800) {
        setAiChatWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizingAiChat(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingAiChat]);

  // File & Folder Upload states
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);
  const [isDragOverExplorer, setIsDragOverExplorer] = useState(false);
  const explorerFileInputRef = useRef<HTMLInputElement>(null);
  const explorerFolderInputRef = useRef<HTMLInputElement>(null);

  const uploadFilesWithPaths = async (items: { file: File; relativePath: string }[]) => {
    if (items.length === 0) return;
    setIsUploadingFile(true);
    setUploadStatusMsg(`Uploading ${items.length} item(s)...`);

    try {
      const formData = new FormData();
      for (const item of items) {
        formData.append('files', item.file);
        formData.append('paths', item.relativePath);
      }
      const res = await fetch('/api/kb/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.files) {
        await refreshTree();
        if (data.file) {
          const targetRelPath = data.file.relative_path || `Uploads/${data.file.filename}`;
          await openFileInTab(targetRelPath);
        }
        setUploadStatusMsg(`✓ Uploaded ${data.total_uploaded || items.length} item(s)`);
      } else {
        setUploadStatusMsg(`Upload failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setUploadStatusMsg(`Upload error: ${err.message}`);
    } finally {
      setIsUploadingFile(false);
      setTimeout(() => setUploadStatusMsg(null), 4000);
    }
  };

  const handleExplorerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const items = files.map(file => ({
      file,
      relativePath: (file as any).webkitRelativePath || file.name
    }));
    await uploadFilesWithPaths(items);
    if (e.target) e.target.value = '';
  };

  const handleExplorerFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const items = files.map(file => ({
      file,
      relativePath: (file as any).webkitRelativePath || file.name
    }));
    await uploadFilesWithPaths(items);
    if (e.target) e.target.value = '';
  };

  // Recursive directory reader for Drag and Drop
  const traverseDirectoryEntry = async (entry: any, basePath = ''): Promise<{ file: File; relativePath: string }[]> => {
    const results: { file: File; relativePath: string }[] = [];
    if (entry.isFile) {
      const file: File = await new Promise((resolve, reject) => entry.file(resolve, reject));
      results.push({ file, relativePath: basePath ? `${basePath}/${file.name}` : file.name });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const readAllEntries = async (): Promise<any[]> => {
        let entries: any[] = [];
        let readBatch: any[] = [];
        do {
          readBatch = await new Promise((resolve, reject) => dirReader.readEntries(resolve, reject));
          entries = entries.concat(readBatch);
        } while (readBatch.length > 0);
        return entries;
      };
      const subEntries = await readAllEntries();
      const currentDirName = basePath ? `${basePath}/${entry.name}` : entry.name;
      for (const sub of subEntries) {
        const subResults = await traverseDirectoryEntry(sub, currentDirName);
        results.push(...subResults);
      }
    }
    return results;
  };

  const handleExplorerDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverExplorer(false);

    const items = e.dataTransfer.items;
    const filesToUpload: { file: File; relativePath: string }[] = [];

    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const entry = (item as any).webkitGetAsEntry ? (item as any).webkitGetAsEntry() : null;
          if (entry) {
            const traversed = await traverseDirectoryEntry(entry);
            filesToUpload.push(...traversed);
          } else {
            const file = item.getAsFile();
            if (file) filesToUpload.push({ file, relativePath: file.name });
          }
        }
      }
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        filesToUpload.push({ file, relativePath: (file as any).webkitRelativePath || file.name });
      }
    }

    if (filesToUpload.length > 0) {
      await uploadFilesWithPaths(filesToUpload);
    }
  };

  // AI Prompt input
  const [aiPromptInput, setAiPromptInput] = useState('');
  const aiChatEndRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    loadWorkspaceInfo();
  }, [loadWorkspaceInfo]);

  // Scroll terminal to bottom
  useEffect(() => {
    if (isTerminalOpen) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory, isTerminalOpen]);

  // Scroll AI chat to bottom
  useEffect(() => {
    aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, isAiGenerating]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S: Save file
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveActiveTab();
      }
      // Ctrl+P / Cmd+P: Quick Open file
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setPaletteMode('files');
        setIsCommandPaletteOpen(true);
      }
      // Ctrl+Shift+P / Cmd+Shift+P: Command Palette
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setPaletteMode('commands');
        setIsCommandPaletteOpen(true);
      }
      // Ctrl+` (backtick): Toggle terminal
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        toggleTerminal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveActiveTab, toggleTerminal]);

  // Close context menu on external click
  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.isOpen) {
        setContextMenu({ isOpen: false, x: 0, y: 0, node: null });
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [contextMenu.isOpen]);

  const activeTab = useMemo(() => {
    return openTabs.find(t => t.id === activeTabId);
  }, [openTabs, activeTabId]);

  // Filter tree recursively
  const filteredTree = useMemo(() => {
    if (!searchFilter.trim()) return treeData;
    const q = searchFilter.toLowerCase();

    const filterNodes = (nodes: WorkspaceNode[]): WorkspaceNode[] => {
      const result: WorkspaceNode[] = [];
      for (const node of nodes) {
        if (node.isDirectory && node.children) {
          const matchingChildren = filterNodes(node.children);
          if (matchingChildren.length > 0 || node.name.toLowerCase().includes(q)) {
            result.push({
              ...node,
              children: matchingChildren
            });
          }
        } else if (node.name.toLowerCase().includes(q)) {
          result.push(node);
        }
      }
      return result;
    };

    return filterNodes(treeData);
  }, [treeData, searchFilter]);

  const getFileIcon = (ext?: string) => {
    switch (ext?.toLowerCase()) {
      case 'ts':
      case 'tsx':
      case 'js':
      case 'jsx':
      case 'py':
      case 'json':
        return <FileCode className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />;
      case 'docx':
      case 'md':
      case 'txt':
        return <FileText className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />;
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />;
      case 'pptx':
        return <Presentation className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />;
      default:
        return <File className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />;
    }
  };

  const handleCopy = () => {
    if (!activeTab?.content) return;
    navigator.clipboard.writeText(activeTab.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleContextMenu = (e: React.MouseEvent, node: WorkspaceNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      isOpen: true,
      x: Math.min(e.clientX, window.innerWidth - 200),
      y: Math.min(e.clientY, window.innerHeight - 200),
      node
    });
  };

  const handleModalSubmit = async () => {
    const val = promptInputValue.trim();
    if (!val) return;

    if (newPromptModal.type === 'file') {
      const fullPath = newPromptModal.targetPath ? `${newPromptModal.targetPath}/${val}` : val;
      await createFile(fullPath);
    } else if (newPromptModal.type === 'folder') {
      const fullPath = newPromptModal.targetPath ? `${newPromptModal.targetPath}/${val}` : val;
      await createDirectory(fullPath);
    } else if (newPromptModal.type === 'rename') {
      const dir = newPromptModal.targetPath.includes('/') ? newPromptModal.targetPath.substring(0, newPromptModal.targetPath.lastIndexOf('/')) : '';
      const newFullPath = dir ? `${dir}/${val}` : val;
      await renameItem(newPromptModal.targetPath, newFullPath);
    } else if (newPromptModal.type === 'delete') {
      await deleteItem(newPromptModal.targetPath);
    }

    setNewPromptModal({ isOpen: false, type: 'file', targetPath: '', defaultVal: '' });
    setPromptInputValue('');
  };

  const renderTreeNodes = (nodes: WorkspaceNode[], depth = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedPaths.has(node.path);
      const isSelected = activeTab?.path === node.path;
      const isModified = gitStatus.modifiedFiles.includes(node.path);

      if (node.isDirectory) {
        return (
          <div key={node.path} className="select-none">
            <div
              onClick={() => toggleFolder(node.path)}
              onContextMenu={(e) => handleContextMenu(e, node)}
              style={{ paddingLeft: `${depth * 14 + 8}px` }}
              className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer text-xs font-mono transition-colors group"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
                )}
                {isExpanded ? (
                  <FolderOpen className="w-3.5 h-3.5 text-[var(--text-primary)] shrink-0" />
                ) : (
                  <Folder className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
                )}
                <span className="truncate">{node.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNewPromptModal({ isOpen: true, type: 'file', targetPath: node.path, defaultVal: '' });
                  setPromptInputValue('');
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[var(--border-subtle)] rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-opacity"
                title="New file in this folder"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {isExpanded && node.children && node.children.length > 0 && (
              <div>{renderTreeNodes(node.children, depth + 1)}</div>
            )}
          </div>
        );
      }

      return (
        <div
          key={node.path}
          onClick={() => openFileInTab(node.path)}
          onContextMenu={(e) => handleContextMenu(e, node)}
          style={{ paddingLeft: `${depth * 14 + 20}px` }}
          className={`flex items-center justify-between py-1 px-2 rounded-md text-xs font-mono cursor-pointer transition-colors group select-none ${
            isSelected
              ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-l-2 border-[var(--text-primary)] font-medium'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
          }`}
          title={node.path}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {getFileIcon(node.extension)}
            <span className={`truncate ${isModified ? 'text-[var(--text-primary)] font-semibold' : ''}`}>
              {node.name}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isModified && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]" title="Modified in Git" />
            )}
            {node.size !== undefined && (
              <span className="text-[10px] text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity">
                {(node.size / 1024).toFixed(0)}k
              </span>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-base)] text-[var(--text-primary)] font-sans overflow-hidden select-none">
      
      {/* 1. TOP IDE TOOLBAR */}
      <div className="h-12 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-4 flex items-center justify-between gap-3 shrink-0">
        {/* Left: Workspace breadcrumb & Open button */}
        <div className="flex items-center gap-2.5 min-w-0">
          <FolderTree className="w-4 h-4 text-[var(--text-primary)] shrink-0" />
          <div className="flex items-center gap-1.5 text-xs font-mono truncate">
            <span className="text-[var(--text-tertiary)] hidden sm:inline">Workspace:</span>
            <span
              onClick={() => {
                setPaletteMode('open-folder');
                setIsCommandPaletteOpen(true);
              }}
              className="font-semibold text-[var(--text-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] px-2 py-0.5 rounded border border-[var(--border-subtle)] cursor-pointer truncate max-w-xs transition-colors"
              title={workspaceRoot || 'Click to switch workspace'}
            >
              {workspaceName || 'Select Workspace'}
            </span>
            {gitStatus.isGitRepo && (
              <span className="text-[11px] font-mono text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2 py-0.5 rounded flex items-center gap-1">
                <GitBranch className="w-3 h-3 text-[var(--text-secondary)]" />
                <span>{gitStatus.branch || 'main'}</span>
                {gitStatus.dirtyCount > 0 && <span>● {gitStatus.dirtyCount}</span>}
              </span>
            )}
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        <button
          onClick={() => {
            setPaletteMode('files');
            setIsCommandPaletteOpen(true);
          }}
          className="hidden md:flex items-center gap-2 px-3 py-1 bg-[var(--bg-base)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
          <span>Quick Open (Ctrl+P) or Commands (Ctrl+Shift+P)</span>
        </button>

        {/* Right: Controls (Permissions, Terminal, Save, Open Folder) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Permission Mode Selector */}
          <div className="flex items-center bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => setPermissionMode('safe')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                permissionMode === 'safe'
                  ? 'bg-[var(--text-primary)] text-black font-semibold shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Safe Mode: AI has read-only access. Zero file writes."
            >
              Safe
            </button>
            <button
              onClick={() => setPermissionMode('assisted')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                permissionMode === 'assisted'
                  ? 'bg-[var(--text-primary)] text-black font-semibold shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Assisted Mode: AI generates diff proposals that require your approval before saving to disk."
            >
              Assisted
            </button>
            <button
              onClick={() => setPermissionMode('autonomous')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                permissionMode === 'autonomous'
                  ? 'bg-[var(--text-primary)] text-black font-semibold shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Autonomous Mode: AI writes directly to workspace within security boundary."
            >
              Autonomous
            </button>
          </div>

          {/* Terminal Toggle Button */}
          <button
            onClick={toggleTerminal}
            className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border transition-colors cursor-pointer ${
              isTerminalOpen
                ? 'bg-[var(--text-primary)] text-black border-[var(--text-primary)] font-semibold shadow-sm'
                : 'bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Toggle Integrated Terminal (Ctrl+`)"
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Terminal</span>
          </button>

          {/* Save Active File Button */}
          {activeTab && !activeTab.isBinary && (
            <button
              onClick={saveActiveTab}
              disabled={!activeTab.isDirty}
              className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                activeTab.isDirty
                  ? 'bg-[var(--text-primary)] hover:bg-zinc-200 text-black border-[var(--text-primary)] font-semibold shadow-sm animate-pulse'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)] border-[var(--border-subtle)] opacity-60 cursor-default'
              }`}
              title="Save active file (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
              {activeTab.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-black ml-0.5" />}
            </button>
          )}

          {/* Open Folder Button */}
          <button
            onClick={() => {
              setPaletteMode('open-folder');
              setIsCommandPaletteOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-[var(--text-primary)] hover:bg-zinc-200 text-black font-semibold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
            title="Open local project folder"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Open Folder</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 3-PANE IDE SPLIT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* PANE 1: LEFT EXPLORER / CHANGES SIDEBAR (260px) */}
        <div className="w-64 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col shrink-0 overflow-hidden">
          
          {/* Sidebar Tabs (Files / Changes) */}
          <div className="flex border-b border-[var(--border-subtle)] bg-[var(--bg-base)]">
            <button
              onClick={() => setActiveSidebarTab('files')}
              className={`flex-1 py-2 text-xs font-mono font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeSidebarTab === 'files'
                  ? 'border-[var(--text-primary)] text-[var(--text-primary)] bg-[var(--bg-surface)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5 text-[var(--text-primary)]" />
              <span>Files</span>
            </button>
            <button
              onClick={() => setActiveSidebarTab('changes')}
              className={`flex-1 py-2 text-xs font-mono font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeSidebarTab === 'changes'
                  ? 'border-[var(--text-primary)] text-[var(--text-primary)] bg-[var(--bg-surface)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span>Changes {gitStatus.dirtyCount > 0 && `(${gitStatus.dirtyCount})`}</span>
            </button>
          </div>

          {/* Files Toolbar */}
          {activeSidebarTab === 'files' ? (
            <div className="p-2 border-b border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] font-semibold px-1">
                <span className="truncate">{workspaceName}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {/* Native file upload input */}
                  <input
                    type="file"
                    ref={explorerFileInputRef}
                    multiple
                    onChange={handleExplorerFileUpload}
                    className="hidden"
                  />
                  {/* Native folder upload input */}
                  <input
                    type="file"
                    ref={explorerFolderInputRef}
                    // @ts-ignore
                    webkitdirectory=""
                    directory=""
                    multiple
                    onChange={handleExplorerFolderUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => explorerFileInputRef.current?.click()}
                    disabled={isUploadingFile}
                    className="p-1 hover:bg-[var(--bg-elevated)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                    title="Upload File(s) into workspace"
                  >
                    <Upload className={`w-3.5 h-3.5 ${isUploadingFile ? 'animate-bounce text-[var(--text-primary)]' : ''}`} />
                  </button>
                  <button
                    onClick={() => explorerFolderInputRef.current?.click()}
                    disabled={isUploadingFile}
                    className="p-1 hover:bg-[var(--bg-elevated)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                    title="Upload Folder / Directory into workspace"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setNewPromptModal({ isOpen: true, type: 'file', targetPath: '', defaultVal: '' });
                      setPromptInputValue('');
                    }}
                    className="p-1 hover:bg-[var(--bg-elevated)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    title="New File in workspace root"
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={refreshTree}
                    className="p-1 hover:bg-[var(--bg-elevated)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    title="Refresh Explorer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTree ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Upload Status Banner */}
              {uploadStatusMsg && (
                <div className="px-2 py-1 rounded text-[10px] font-mono flex items-center justify-between border bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-primary)]">
                  <span className="truncate">{uploadStatusMsg}</span>
                  <button onClick={() => setUploadStatusMsg(null)} className="p-0.5 hover:opacity-75">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Filter input */}
              <div className="relative">
                <Search className="w-3 h-3 text-[var(--text-tertiary)] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder="Filter files..."
                  className="w-full pl-7 pr-2 py-1 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--text-secondary)] font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="p-2 border-b border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">GIT CHANGES</span>
              <button
                onClick={checkGitStatus}
                className="p-1 hover:bg-[var(--bg-elevated)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Refresh Git Status"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Explorer Tree or Changes List with Drag and Drop */}
          <div
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOverExplorer(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOverExplorer(false); }}
            onDrop={handleExplorerDrop}
            className={`flex-1 overflow-y-auto p-1.5 space-y-0.5 transition-colors ${
              isDragOverExplorer ? 'bg-[var(--bg-elevated)] border-2 border-dashed border-[var(--border-subtle)]' : ''
            }`}
          >
            {activeSidebarTab === 'files' ? (
              isLoadingTree ? (
                <div className="p-6 text-center text-xs text-[var(--text-tertiary)] space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[var(--text-primary)]" />
                  <p>Reading workspace structure...</p>
                </div>
              ) : filteredTree.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--text-tertiary)]">
                  No files found in workspace. Drag and drop files/folders here to upload.
                </div>
              ) : (
                renderTreeNodes(filteredTree)
              )
            ) : (
              <div className="space-y-3 p-1">
                {gitStatus.modifiedFiles.length === 0 && gitStatus.untrackedFiles.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[var(--text-tertiary)]">
                    No modified or untracked files in git.
                  </div>
                ) : (
                  <>
                    {gitStatus.modifiedFiles.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-primary)] font-semibold px-2 py-1">
                          Modified Files ({gitStatus.modifiedFiles.length})
                        </div>
                        {gitStatus.modifiedFiles.map(file => (
                          <div
                            key={file}
                            onClick={() => openFileInTab(file)}
                            className="flex items-center justify-between p-1.5 rounded hover:bg-[var(--bg-elevated)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                          >
                            <span className="truncate">{file}</span>
                            <span className="text-[10px] text-[var(--text-primary)] font-semibold">M</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {gitStatus.untrackedFiles.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-primary)] font-semibold px-2 py-1">
                          Untracked Files ({gitStatus.untrackedFiles.length})
                        </div>
                        {gitStatus.untrackedFiles.map(file => (
                          <div
                            key={file}
                            onClick={() => openFileInTab(file)}
                            className="flex items-center justify-between p-1.5 rounded hover:bg-[var(--bg-elevated)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                          >
                            <span className="truncate">{file}</span>
                            <span className="text-[10px] text-[var(--text-secondary)] font-semibold">U</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

        </div>

        {/* PANE 2: CENTER CODE EDITOR & DIFF VIEWER */}
        <div className="flex-1 flex flex-col bg-[var(--bg-base)] overflow-hidden">
          
          {/* Editor Tabs Bar */}
          <div className="h-9 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center overflow-x-auto px-1 gap-1 shrink-0">
            {openTabs.length === 0 ? (
              <div className="px-3 text-xs text-[var(--text-tertiary)] italic">No files open. Click a file or press Ctrl+P to open.</div>
            ) : (
              openTabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                return (
                  <div
                    key={tab.id}
                    onClick={() => useWorkspaceStore.setState({ activeTabId: tab.id })}
                    className={`h-7 px-3 rounded-t-md text-xs font-mono flex items-center gap-2 cursor-pointer transition-colors border-t border-x shrink-0 ${
                      isActive
                        ? 'bg-[var(--bg-base)] text-[var(--text-primary)] border-[var(--border-subtle)] font-medium'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-transparent hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    {getFileIcon(tab.extension)}
                    <span className="truncate max-w-[150px]">{tab.name}</span>
                    {tab.isDirty && (
                      <span className="w-2 h-2 rounded-full bg-[var(--text-primary)] shrink-0" title="Unsaved changes" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="p-0.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* ACTIVE DIFF PROPOSAL BANNER (WHEN WAITING FOR USER APPROVAL) */}
          {activeDiffProposal && (
            <div className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] p-3 flex items-center justify-between gap-4 text-xs font-mono shrink-0 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <AlertTriangle className="w-4 h-4 text-[var(--text-primary)] shrink-0" />
                <div>
                  <span className="font-semibold text-[var(--text-primary)]">AI Diff Approval Required:</span>{' '}
                  <span className="text-[var(--text-secondary)] font-bold">{activeDiffProposal.action.toUpperCase()}</span>{' '}
                  <code className="text-[var(--text-primary)] bg-[var(--bg-base)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded">{activeDiffProposal.path}</code>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={rejectDiffProposal}
                  className="px-3 py-1 rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-sans font-medium transition-colors cursor-pointer"
                >
                  Reject
                </button>
                <button
                  onClick={approveDiffProposal}
                  className="px-3 py-1 rounded bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-base)] text-xs font-sans font-semibold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept Changes</span>
                </button>
              </div>
            </div>
          )}

          {/* Editor Body or Diff Viewer */}
          {activeDiffProposal && activeDiffProposal.newContent !== undefined ? (
            /* DIFF VIEWER */
            <div className="flex-1 flex flex-col overflow-hidden p-4 bg-[var(--bg-base)]">
              <div className="text-xs font-mono text-[var(--text-secondary)] pb-2 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <span>Proposed Changes for <strong className="text-[var(--text-primary)]">{activeDiffProposal.path}</strong></span>
                <span className="text-[var(--text-tertiary)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded text-[11px]">Diff Preview</span>
              </div>
              <div className="flex-1 overflow-auto mt-2 font-mono text-xs space-y-2">
                {activeDiffProposal.originalContent && (
                  <div className="p-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded">
                    <div className="text-[10px] text-[var(--text-tertiary)] font-semibold mb-1">ORIGINAL CONTENT:</div>
                    <pre className="text-[var(--text-secondary)] whitespace-pre overflow-x-auto text-[11px] leading-relaxed">
                      {activeDiffProposal.originalContent}
                    </pre>
                  </div>
                )}
                <div className="p-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded">
                  <div className="text-[10px] text-[var(--text-primary)] font-semibold mb-1">PROPOSED NEW CONTENT:</div>
                  <pre className="text-[var(--text-primary)] whitespace-pre overflow-x-auto text-[11px] leading-relaxed">
                    {activeDiffProposal.newContent}
                  </pre>
                </div>
              </div>
            </div>
          ) : activeTab ? (
            <DocumentViewer
              file={{
                name: activeTab.name,
                path: activeTab.path,
                extension: activeTab.extension,
                size: activeTab.size,
                content: activeTab.content,
                extractedText: activeTab.extractedText,
                isBinary: activeTab.isBinary
              }}
              onClose={() => closeTab(activeTab.id)}
              onContentChange={(val) => updateTabContent(activeTab.id, val)}
              isEditable={!activeTab.isBinary}
            />
          ) : (
            <div className="m-auto max-w-sm text-center py-16 space-y-3">
              <FolderTree className="w-12 h-12 text-[var(--text-tertiary)] mx-auto" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">LUMI AI Workspace</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Select a file from the explorer on the left or press <kbd className="px-1.5 py-0.5 bg-[var(--bg-elevated)] rounded border border-[var(--border-subtle)] text-[var(--text-secondary)]">Ctrl+P</kbd> to quick open any file.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setPaletteMode('open-folder');
                    setIsCommandPaletteOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-base)] text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Open Folder</span>
                </button>
              </div>
            </div>
          )}

          {/* INTEGRATED TERMINAL (COLLAPSIBLE BOTTOM DRAWER) */}
          {isTerminalOpen && (
            <div className="h-56 bg-[var(--bg-base)] border-t border-[var(--border-subtle)] flex flex-col font-mono text-xs shrink-0 animate-in slide-in-from-bottom-2">
              <div className="h-8 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-3 flex items-center justify-between text-[var(--text-secondary)] select-none">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="w-3.5 h-3.5 text-[var(--text-primary)]" />
                  <span className="font-semibold text-[var(--text-primary)]">TERMINAL</span>
                  <span className="text-[11px] text-[var(--text-tertiary)] truncate max-w-xs">({workspaceRoot})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => useWorkspaceStore.setState({ terminalHistory: [] })}
                    className="p-1 hover:bg-[var(--bg-elevated)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[11px]"
                    title="Clear Terminal"
                  >
                    Clear
                  </button>
                  <button
                    onClick={toggleTerminal}
                    className="p-1 hover:bg-[var(--bg-elevated)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Terminal Logs */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1 text-[var(--text-secondary)] selection:bg-[var(--bg-elevated)]">
                {terminalHistory.map((line, idx) => (
                  <div
                    key={idx}
                    className={`leading-relaxed whitespace-pre-wrap ${
                      line.startsWith('$')
                        ? 'text-[var(--text-primary)] font-semibold'
                        : line.startsWith('Error:') || line.includes('error')
                        ? 'text-[var(--text-primary)] font-medium underline decoration-[var(--text-tertiary)]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {line}
                  </div>
                ))}
                {isExecutingCommand && (
                  <div className="text-[var(--text-tertiary)] italic animate-pulse">Running command...</div>
                )}
                <div ref={terminalEndRef} />
              </div>

              {/* Terminal Input Line */}
              <div className="p-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center gap-2">
                <span className="text-[var(--text-primary)] font-bold">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={e => setTerminalInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      executeTerminalCommand(terminalInput);
                      setTerminalInput('');
                    }
                  }}
                  disabled={isExecutingCommand}
                  placeholder="Type shell command (e.g. npm test, ls, git status)..."
                  className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] placeholder-[var(--text-tertiary)] font-mono text-xs"
                />
              </div>
            </div>
          )}

        </div>

        {/* RESIZE HANDLE FOR RIGHT AI PANE */}
        <div
          onMouseDown={() => setIsResizingAiChat(true)}
          className={`w-1 cursor-col-resize hover:bg-[var(--text-secondary)]/40 transition-colors select-none z-10 shrink-0 ${
            isResizingAiChat ? 'bg-[var(--text-primary)] w-1.5' : 'bg-transparent'
          }`}
          title="Drag to resize AI Assistant"
        />

        {/* PANE 3: RIGHT LUMI AI WORKSPACE CO-PILOT (Resizable) */}
        <div
          style={{ width: `${aiChatWidth}px` }}
          className="bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] flex flex-col shrink-0 overflow-hidden"
        >
          
          {/* AI Panel Header */}
          <div className="p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Sparkles className="w-4 h-4 text-[var(--text-primary)] shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[var(--text-primary)] truncate" title={activeChatSession?.title || 'LUMI Workspace AI'}>
                    {activeChatSession?.title || 'LUMI Workspace AI'}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--text-tertiary)] font-mono block truncate">
                  {activeChatSession?.createdAt ? `Started ${activeChatSession.createdAt}` : 'Active Chat'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* + New Chat Button */}
              <button
                type="button"
                onClick={() => createNewChatSession(true)}
                className="px-2 py-1 rounded text-[11px] font-medium bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] cursor-pointer transition-colors flex items-center gap-1 shadow-sm"
                title="Start a new chat session"
              >
                <Plus className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span className="hidden sm:inline">New Chat</span>
              </button>

              {/* Chat History Dropdown Toggle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsChatHistoryOpen(prev => !prev)}
                  className={`px-2 py-1 rounded text-[11px] font-medium border cursor-pointer transition-colors flex items-center gap-1 ${
                    isChatHistoryOpen
                      ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-[var(--text-primary)] font-semibold'
                      : 'bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-subtle)]'
                  }`}
                  title="View past chat sessions"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Chats ({chatSessions.length})</span>
                </button>

                {/* History Dropdown Menu */}
                {isChatHistoryOpen && (
                  <div className="absolute right-0 mt-1.5 w-72 max-h-80 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
                    <div className="px-3 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[var(--text-primary)]">Chat History</span>
                      <button
                        type="button"
                        onClick={() => {
                          createNewChatSession(true);
                          setIsChatHistoryOpen(false);
                        }}
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>New Chat</span>
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
                      {chatSessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => {
                            selectChatSession(session.id);
                            setIsChatHistoryOpen(false);
                          }}
                          className={`group px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-between ${
                            session.id === activeChatSessionId
                              ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                            <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                            <div className="truncate text-left">
                              <div className="truncate text-[11px] font-medium">{session.title || 'Untitled Chat'}</div>
                              <div className="text-[9px] text-[var(--text-tertiary)] font-mono">{session.createdAt} · {session.messages.length} msgs</div>
                            </div>
                          </div>
                          {chatSessions.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChatSession(session.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-950/50 text-[var(--text-secondary)] hover:text-rose-400 transition-all cursor-pointer"
                              title="Delete chat"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Create Image Toggle */}
              <button
                type="button"
                onClick={() => setIsCreateImageMode(prev => !prev)}
                className={`px-2 py-1 rounded text-[11px] font-medium border cursor-pointer transition-colors flex items-center gap-1 ${
                  isCreateImageMode
                    ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-[var(--text-primary)] font-semibold'
                    : 'bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-subtle)]'
                }`}
                title="Toggle Create Image mode"
              >
                <Sparkles className="w-3 h-3" />
                <span>Image</span>
              </button>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] uppercase">
                {permissionMode}
              </span>
            </div>
          </div>

          {/* Active Context Chips */}
          <div className="px-3 py-2 bg-[var(--bg-base)] border-b border-[var(--border-subtle)] flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono shrink-0">
            <span className="text-[var(--text-tertiary)]">Context:</span>
            {activeTab ? (
              <span
                onClick={() => setAiPromptInput(prev => `${prev} @${activeTab.path} `)}
                className="bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] cursor-pointer truncate max-w-[160px]"
                title="Click to insert file reference into prompt"
              >
                @{activeTab.name}
              </span>
            ) : (
              <span className="text-[var(--text-tertiary)] italic">No file selected</span>
            )}
            <span
              onClick={() => setAiPromptInput(prev => `${prev} @git `)}
              className="bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] cursor-pointer"
              title="Reference git status"
            >
              @git
            </span>
          </div>

          {/* AI Chat History */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 font-sans text-xs">
            {aiMessages.map((msg) => (
              <div
                key={msg.id}
                className={`space-y-1.5 ${
                  msg.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-2.5 rounded-xl max-w-[90%] text-left whitespace-pre-wrap leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[var(--text-primary)] text-[var(--bg-base)] font-medium rounded-br-none'
                      : 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-bl-none'
                  }`}
                >
                  {/* Tool Execution Badges inside Assistant Message */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mb-2 space-y-1 font-mono text-[11px]">
                      {msg.toolCalls.map((tc, i) => (
                        <div
                          key={i}
                          className="p-1.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between text-[var(--text-secondary)]"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {tc.status === 'success' ? (
                              <CheckCircle2 className="w-3 h-3 text-[var(--text-primary)] shrink-0" />
                            ) : (
                              <XCircle className="w-3 h-3 text-[var(--text-tertiary)] shrink-0" />
                            )}
                            <span className="font-semibold text-[var(--text-primary)]">{tc.tool}</span>
                            <span className="text-[var(--text-tertiary)] truncate max-w-[150px]">
                              ({tc.args.path || (tc.args.runtime ? `${tc.args.runtime}: ${tc.args.target || 'workspace'}` : '')})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Collapsible Action Code Dropbox */}
                  {msg.actionBadge && (
                    <div className="mb-2 border border-[var(--border-subtle)] rounded-lg overflow-hidden bg-[var(--bg-surface)] select-none">
                      <button
                        type="button"
                        onClick={() => toggleActionDropdown(msg.id)}
                        className="w-full px-2.5 py-1.5 flex items-center justify-between text-left text-xs hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5">
                          {expandedActionIds.has(msg.id) ? (
                            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
                          )}
                          <span className="font-semibold text-[var(--text-primary)]">
                            {msg.actionBadge.label || 'Editing File'}
                          </span>
                          {msg.actionBadge.language && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                              {msg.actionBadge.language}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] font-mono">
                          <span>{expandedActionIds.has(msg.id) ? 'Hide code' : 'View code'}</span>
                          <Code2 className="w-3.5 h-3.5" />
                        </div>
                      </button>
                      {expandedActionIds.has(msg.id) && msg.actionBadge.code && (
                        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-base)] p-2">
                          <div className="flex items-center justify-between mb-1 pb-1 border-b border-[var(--border-subtle)]/40 text-[10px] font-mono text-[var(--text-tertiary)]">
                            <span>{msg.actionBadge.language || 'script'}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(msg.actionBadge!.code!);
                              }}
                              className="hover:text-[var(--text-primary)] cursor-pointer"
                            >
                              Copy
                            </button>
                          </div>
                          <pre className="text-[11px] font-mono overflow-x-auto text-[var(--text-secondary)] whitespace-pre p-1 select-text max-h-64 leading-normal">
                            <code>{msg.actionBadge.code}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interactive Image Card */}
                  {msg.imageCard && (
                    <div className="mb-2 border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-surface)] select-none">
                      <div className="px-2.5 py-1.5 border-b border-[var(--border-subtle)] flex items-center justify-between text-xs bg-[var(--bg-elevated)]">
                        <div className="flex items-center gap-1.5 font-mono">
                          <ImageIcon className="w-3.5 h-3.5 text-[var(--text-primary)] shrink-0" />
                          <span className="font-semibold text-[var(--text-primary)]">{msg.imageCard.modelName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                            {msg.imageCard.width}x{msg.imageCard.height}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                          {(msg.imageCard.durationMs / 1000).toFixed(1)}s
                        </span>
                      </div>
                      <div className="p-2 bg-[var(--bg-base)] flex flex-col items-center justify-center">
                        <img
                          src={msg.imageCard.rawUrl}
                          alt={msg.imageCard.prompt}
                          onClick={() => openFileInTab(msg.imageCard!.path)}
                          className="rounded-lg max-h-72 w-auto object-contain cursor-pointer hover:opacity-95 transition-opacity border border-[var(--border-subtle)] shadow-sm"
                          title="Click to inspect in document viewer"
                        />
                      </div>
                      <div className="px-2.5 py-2 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex items-center justify-between text-xs gap-2">
                        <span className="text-[11px] text-[var(--text-secondary)] italic truncate flex-1" title={msg.imageCard.prompt}>
                          "{msg.imageCard.prompt}"
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] shrink-0">
                          <button
                            type="button"
                            onClick={() => openFileInTab(msg.imageCard!.path)}
                            className="px-2 py-0.5 rounded bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] cursor-pointer transition-colors"
                          >
                            Open Tab
                          </button>
                          <a
                            href={msg.imageCard.rawUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 rounded bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                          >
                            Full Res
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {msg.role === 'assistant' ? renderAssistantMessageBody(msg.content) : (
                    editingMessageId === msg.id ? (
                      <div className="w-full space-y-2 text-left">
                        <textarea
                          value={editingMessageText}
                          onChange={(e) => setEditingMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                              e.preventDefault();
                              handleSaveAndRegenerate(msg.id);
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              handleCancelEditing();
                            }
                          }}
                          rows={3}
                          autoFocus
                          className="w-full bg-[var(--bg-base)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--text-primary)] rounded-lg p-2 text-xs focus:outline-none resize-y font-sans leading-relaxed"
                        />
                        <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
                          <span>Ctrl+Enter to send • Esc to cancel</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={handleCancelEditing}
                              disabled={isAiGenerating}
                              className="px-2 py-0.5 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveAndRegenerate(msg.id)}
                              disabled={!editingMessageText.trim() || isAiGenerating}
                              className="px-2.5 py-0.5 bg-[var(--text-primary)] hover:opacity-90 disabled:opacity-40 text-[var(--bg-base)] font-semibold rounded transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>Save & Regenerate</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>{msg.content}</div>
                    )
                  )}
                </div>

                {/* Message Action Bar & Timestamp */}
                <div className={`flex items-center gap-2 px-1 text-[10px] font-mono text-[var(--text-tertiary)] ${
                  msg.role === 'user' ? 'justify-end' : 'justify-between'
                }`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        title="Copy response"
                        className="p-0.5 hover:text-[var(--text-primary)] cursor-pointer rounded flex items-center gap-1 text-[10px]"
                      >
                        {copiedMessageId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedMessageId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => regenerateAiResponse(msg.id)}
                        disabled={isAiGenerating}
                        title="Regenerate this response"
                        className="p-0.5 hover:text-[var(--text-primary)] disabled:opacity-40 cursor-pointer rounded flex items-center gap-1 text-[10px]"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Regenerate</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {msg.role === 'user' && editingMessageId !== msg.id && (
                      <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          title="Copy message"
                          className="p-0.5 hover:text-[var(--text-primary)] cursor-pointer rounded"
                        >
                          {copiedMessageId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEditing(msg.id, msg.content)}
                          disabled={isAiGenerating}
                          title="Edit message & regenerate"
                          className="p-0.5 hover:text-[var(--text-primary)] disabled:opacity-40 cursor-pointer rounded flex items-center gap-0.5"
                        >
                          <Pencil className="w-3 h-3" />
                          <span className="text-[10px]">Edit</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isAiGenerating && (
              <div className="flex items-center justify-between gap-3 p-2 px-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl max-w-[90%] select-none shadow-sm">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--text-primary)]" />
                  <span>{isCreateImageMode ? 'Generating image with local model...' : 'LUMI is thinking & generating...'}</span>
                </div>
                <button
                  type="button"
                  onClick={stopAiGeneration}
                  className="px-2.5 py-0.5 text-xs bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                  title="Stop generation immediately"
                >
                  <Square className="w-2.5 h-2.5 fill-current" />
                  <span className="font-semibold">Stop</span>
                </button>
              </div>
            )}
            <div ref={aiChatEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 py-1.5 border-t border-[var(--border-subtle)] bg-[var(--bg-base)] flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
            <button
              type="button"
              onClick={() => setIsCreateImageMode(prev => !prev)}
              className={`px-2 py-0.5 rounded border whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1 ${
                isCreateImageMode
                  ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-[var(--text-primary)] font-semibold'
                  : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-subtle)]'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Create Image</span>
            </button>
            {activeTab && (
              <button
                onClick={() => sendWorkspaceAiPrompt(`Read and explain ${activeTab.path}`)}
                className="px-2 py-0.5 rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] whitespace-nowrap cursor-pointer transition-colors"
              >
                Explain {activeTab.name}
              </button>
            )}
          </div>

          {/* AI Prompt Input Bar */}
          <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            {/* Create Image Model Selector Banner */}
            {isCreateImageMode && (
              <div className="mb-2 p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--text-primary)] animate-pulse" />
                  <span className="font-semibold text-[var(--text-primary)]">Create Image</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[var(--text-secondary)] font-mono">Model:</span>
                  <select
                    value={selectedImageModel}
                    onChange={(e) => setSelectedImageModel(e.target.value)}
                    className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs text-[var(--text-primary)] font-mono outline-none cursor-pointer hover:border-[var(--text-secondary)]"
                  >
                    <option value="z-image-turbo">Z-Image Turbo (DiT BF16 + Qwen 3 4B)</option>
                    <option value="sdxl-lightning">SDXL-Lightning (Safetensors - Fast GPU)</option>
                    <option value="flux1-schnell">FLUX.1 [schnell] (GGUF)</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsCreateImageMode(false)}
                    className="p-1 hover:bg-[var(--bg-surface)] rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                    title="Exit Create Image mode"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="relative flex items-end bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl p-2 focus-within:border-[var(--text-primary)] transition-colors">
              <textarea
                value={aiPromptInput}
                onChange={e => setAiPromptInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (aiPromptInput.trim() && !isAiGenerating) {
                      if (isCreateImageMode) {
                        generateWorkspaceImage(aiPromptInput, selectedImageModel);
                        setAiPromptInput('');
                      } else {
                        sendWorkspaceAiPrompt(aiPromptInput);
                        setAiPromptInput('');
                      }
                    }
                  }
                }}
                rows={2}
                placeholder={
                  isCreateImageMode
                    ? `Describe the image to generate with ${selectedImageModel === 'z-image-turbo' ? 'Z-Image Turbo' : (selectedImageModel === 'flux1-schnell' ? 'FLUX.1 [schnell]' : 'SDXL-Lightning')}...`
                    : "Ask LUMI to read, create, edit, or test files..."
                }
                className="w-full bg-transparent border-none outline-none text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none font-sans"
              />
              {isAiGenerating ? (
                <button
                  type="button"
                  onClick={stopAiGeneration}
                  className="p-1.5 px-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded-lg transition-all ml-1 shrink-0 flex items-center gap-1 text-xs font-semibold cursor-pointer animate-pulse shadow-sm"
                  title="Stop generation immediately"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (aiPromptInput.trim() && !isAiGenerating) {
                      if (isCreateImageMode) {
                        generateWorkspaceImage(aiPromptInput, selectedImageModel);
                        setAiPromptInput('');
                      } else {
                        sendWorkspaceAiPrompt(aiPromptInput);
                        setAiPromptInput('');
                      }
                    }
                  }}
                  disabled={!aiPromptInput.trim() || isAiGenerating}
                  className="p-1.5 bg-[var(--text-primary)] hover:opacity-90 disabled:opacity-30 text-[var(--bg-base)] rounded-lg transition-all ml-1 shrink-0 cursor-pointer"
                  title={isCreateImageMode ? "Generate Image" : "Send Prompt"}
                >
                  {isCreateImageMode ? <Sparkles className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
            <div className="text-[10px] text-[var(--text-tertiary)] font-mono mt-1 flex justify-between">
              <span>{isCreateImageMode ? `Using ${selectedImageModel === 'z-image-turbo' ? 'Z-Image Turbo' : (selectedImageModel === 'flux1-schnell' ? 'FLUX.1 [schnell]' : 'SDXL-Lightning')}` : 'Press Enter to send'}</span>
            </div>
          </div>

        </div>

      </div>

      {/* 3. BOTTOM IDE STATUS BAR */}
      <div className="h-6 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] px-3 flex items-center justify-between text-[11px] font-mono text-[var(--text-tertiary)] shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="text-[var(--text-secondary)] font-semibold">LUMI IDE</span>
          <span>•</span>
          <span className="text-[var(--text-primary)]">{workspaceName}</span>
          {gitStatus.isGitRepo && (
            <>
              <span>•</span>
              <span className="text-[var(--text-secondary)] flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                {gitStatus.branch || 'main'}
              </span>
            </>
          )}
          {activeTab && (
            <>
              <span>•</span>
              <span className="text-[var(--text-secondary)]">{activeTab.name}</span>
              <span>•</span>
              <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>•</span>
          <span className="text-[var(--text-secondary)]">Mode: {permissionMode.toUpperCase()}</span>
        </div>
      </div>

      {/* 4. MODALS & POPUPS */}
      
      {/* Command Palette Modal */}
      <IdeCommandPalette
        isOpen={isCommandPaletteOpen}
        mode={paletteMode}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Prompt Input Modal (New File, New Folder, Rename, Delete) */}
      {newPromptModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-2xl font-mono text-[var(--text-primary)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <span className="font-semibold text-sm capitalize">
                {newPromptModal.type === 'file' ? 'New File' : newPromptModal.type === 'folder' ? 'New Folder' : newPromptModal.type === 'rename' ? 'Rename Item' : 'Confirm Delete'}
              </span>
              <button
                onClick={() => setNewPromptModal({ isOpen: false, type: 'file', targetPath: '', defaultVal: '' })}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {newPromptModal.type === 'delete' ? (
              <p className="text-xs text-[var(--text-secondary)] font-sans">
                Are you sure you want to physically delete <strong className="text-[var(--text-primary)] underline">{newPromptModal.targetPath}</strong> from your hard drive? This cannot be undone.
              </p>
            ) : (
              <div className="space-y-1">
                <label className="text-xs text-[var(--text-secondary)] font-sans">
                  {newPromptModal.type === 'file' ? 'File Name:' : newPromptModal.type === 'folder' ? 'Folder Name:' : 'New Name:'}
                </label>
                <input
                  autoFocus
                  type="text"
                  value={promptInputValue}
                  onChange={e => setPromptInputValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleModalSubmit();
                    if (e.key === 'Escape') setNewPromptModal({ isOpen: false, type: 'file', targetPath: '', defaultVal: '' });
                  }}
                  placeholder={newPromptModal.type === 'file' ? 'e.g. App.tsx' : 'e.g. components'}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--text-primary)] focus:outline-none"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)] font-sans">
              <button
                onClick={() => setNewPromptModal({ isOpen: false, type: 'file', targetPath: '', defaultVal: '' })}
                className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-3 py-1.5 rounded-lg bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-base)] text-xs font-semibold cursor-pointer shadow transition-all"
              >
                {newPromptModal.type === 'delete' ? 'Delete' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explorer Right-Click Context Menu */}
      {contextMenu.isOpen && contextMenu.node && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-48 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-2xl py-1 text-xs font-mono text-[var(--text-secondary)] animate-in fade-in duration-75 select-none"
        >
          {!contextMenu.node.isDirectory && (
            <button
              onClick={() => {
                if (contextMenu.node) openFileInTab(contextMenu.node.path);
                setContextMenu({ isOpen: false, x: 0, y: 0, node: null });
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-[var(--text-primary)]" />
              <span>Open File</span>
            </button>
          )}

          {contextMenu.node.isDirectory && (
            <button
              onClick={() => {
                if (contextMenu.node) {
                  setNewPromptModal({ isOpen: true, type: 'file', targetPath: contextMenu.node.path, defaultVal: '' });
                  setPromptInputValue('');
                }
                setContextMenu({ isOpen: false, x: 0, y: 0, node: null });
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[var(--text-primary)]" />
              <span>New File Inside</span>
            </button>
          )}

          <button
            onClick={() => {
              if (contextMenu.node) {
                setNewPromptModal({ isOpen: true, type: 'rename', targetPath: contextMenu.node.path, defaultVal: contextMenu.node.name });
                setPromptInputValue(contextMenu.node.name);
              }
              setContextMenu({ isOpen: false, x: 0, y: 0, node: null });
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-[var(--text-primary)]" />
            <span>Rename</span>
          </button>

          <button
            onClick={() => {
              if (contextMenu.node) {
                navigator.clipboard.writeText(contextMenu.node.path);
              }
              setContextMenu({ isOpen: false, x: 0, y: 0, node: null });
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-[var(--text-primary)]" />
            <span>Copy Path</span>
          </button>

          <div className="my-1 border-t border-[var(--border-subtle)]" />

          <button
            onClick={() => {
              if (contextMenu.node) {
                setNewPromptModal({ isOpen: true, type: 'delete', targetPath: contextMenu.node.path, defaultVal: '' });
              }
              setContextMenu({ isOpen: false, x: 0, y: 0, node: null });
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-[var(--text-primary)]" />
            <span>Delete</span>
          </button>
        </div>
      )}

    </div>
  );
};
