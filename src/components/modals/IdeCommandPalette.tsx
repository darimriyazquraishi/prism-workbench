import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  FolderOpen,
  FileCode,
  FileText,
  FileSpreadsheet,
  Presentation,
  File,
  Terminal,
  Save,
  RefreshCw,
  Plus,
  FolderPlus,
  Shield,
  Zap,
  GitBranch,
  Clock,
  X
} from 'lucide-react';
import { useWorkspaceStore, type WorkspaceNode } from '../../store/useWorkspaceStore';

interface IdeCommandPaletteProps {
  isOpen: boolean;
  mode: 'files' | 'commands' | 'open-folder';
  onClose: () => void;
}

export const IdeCommandPalette: React.FC<IdeCommandPaletteProps> = ({ isOpen, mode: initialMode, onClose }) => {
  const {
    treeData,
    openFileInTab,
    saveActiveTab,
    saveAllTabs,
    refreshTree,
    toggleTerminal,
    recentWorkspaces,
    openWorkspace,
    setPermissionMode,
    checkGitStatus,
    workspaceRoot
  } = useWorkspaceStore();

  const [mode, setMode] = useState<'files' | 'commands' | 'open-folder'>(initialMode);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [customPath, setCustomPath] = useState('');
  const [isOpeningFolder, setIsOpeningFolder] = useState(false);
  const [folderError, setFolderError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMode(initialMode);
    setQuery('');
    setSelectedIndex(0);
    setFolderError('');
    if (initialMode === 'open-folder') {
      setCustomPath(workspaceRoot || '');
    }
  }, [initialMode, isOpen, workspaceRoot]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, mode]);

  // Flatten tree into file list
  const allFiles = useMemo(() => {
    const list: { name: string; path: string; extension: string }[] = [];
    const traverse = (nodes: WorkspaceNode[]) => {
      for (const node of nodes) {
        if (!node.isDirectory) {
          list.push({
            name: node.name,
            path: node.path,
            extension: node.extension || ''
          });
        }
        if (node.children) {
          traverse(node.children);
        }
      }
    };
    traverse(treeData);
    return list;
  }, [treeData]);

  // Filtered files
  const filteredFiles = useMemo(() => {
    if (mode !== 'files') return [];
    if (!query.trim()) return allFiles.slice(0, 30);
    const q = query.toLowerCase();
    return allFiles
      .filter(f => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q))
      .slice(0, 30);
  }, [allFiles, query, mode]);

  // Available commands
  const commands = useMemo(() => [
    {
      id: 'open-folder',
      title: 'Workspace: Open Folder...',
      shortcut: 'Ctrl+O',
      icon: <FolderOpen className="w-4 h-4 text-[var(--text-secondary)]" />,
      action: () => setMode('open-folder')
    },
    {
      id: 'refresh-tree',
      title: 'Workspace: Refresh File Tree',
      shortcut: '',
      icon: <RefreshCw className="w-4 h-4 text-[var(--text-secondary)]" />,
      action: () => { refreshTree(); onClose(); }
    },
    {
      id: 'save-file',
      title: 'File: Save Active File',
      shortcut: 'Ctrl+S',
      icon: <Save className="w-4 h-4 text-[var(--text-secondary)]" />,
      action: () => { saveActiveTab(); onClose(); }
    },
    {
      id: 'save-all',
      title: 'File: Save All Files',
      shortcut: 'Ctrl+K S',
      icon: <Save className="w-4 h-4 text-[var(--text-secondary)]" />,
      action: () => { saveAllTabs(); onClose(); }
    },
    {
      id: 'toggle-terminal',
      title: 'Terminal: Toggle Integrated Terminal',
      shortcut: 'Ctrl+`',
      icon: <Terminal className="w-4 h-4 text-[var(--text-secondary)]" />,
      action: () => { toggleTerminal(); onClose(); }
    },
    {
      id: 'git-status',
      title: 'Git: Check Status',
      shortcut: '',
      icon: <GitBranch className="w-4 h-4 text-[var(--text-secondary)]" />,
      action: () => { checkGitStatus(); onClose(); }
    },
    {
      id: 'perm-safe',
      title: 'AI Permission: Switch to Safe Mode (Read-Only)',
      shortcut: '',
      icon: <Shield className="w-4 h-4 text-[var(--text-secondary)]" />,
      action: () => { setPermissionMode('safe'); onClose(); }
    },
    {
      id: 'perm-assisted',
      title: 'AI Permission: Switch to Assisted Mode (Diff Approval)',
      shortcut: '',
      icon: <Zap className="w-4 h-4 text-[var(--text-secondary)]" />,
      action: () => { setPermissionMode('assisted'); onClose(); }
    },
    {
      id: 'perm-autonomous',
      title: 'AI Permission: Switch to Autonomous Mode (Direct Write)',
      shortcut: '',
      icon: <Zap className="w-4 h-4 text-[var(--text-secondary)]" />,
      action: () => { setPermissionMode('autonomous'); onClose(); }
    }
  ], [refreshTree, saveActiveTab, saveAllTabs, toggleTerminal, checkGitStatus, setPermissionMode, onClose]);

  const filteredCommands = useMemo(() => {
    if (mode !== 'commands') return [];
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c => c.title.toLowerCase().includes(q));
  }, [commands, query, mode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (mode === 'files') {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredFiles.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredFiles.length) % Math.max(1, filteredFiles.length));
      } else if (e.key === 'Enter' && filteredFiles[selectedIndex]) {
        e.preventDefault();
        openFileInTab(filteredFiles[selectedIndex].path);
        onClose();
      }
    } else if (mode === 'commands') {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
      }
    }
  };

  const handleOpenFolderSubmit = async (targetPath: string) => {
    const p = targetPath.trim();
    if (!p) return;
    setIsOpeningFolder(true);
    setFolderError('');
    try {
      const ok = await openWorkspace(p);
      if (ok) {
        onClose();
      } else {
        setFolderError(`Could not open directory: "${p}". Please ensure the path exists.`);
      }
    } catch (err: any) {
      setFolderError(err.message || 'Failed to open directory');
    } finally {
      setIsOpeningFolder(false);
    }
  };

  const handlePickNativeFolder = async () => {
    setIsOpeningFolder(true);
    setFolderError('');
    try {
      // 1. Try server-side native system dialog which returns full absolute path on Windows
      const res = await fetch('/api/workspace/browse', { method: 'POST' }).then(r => r.json()).catch(() => null);
      if (res && res.success && res.path) {
        setCustomPath(res.path);
        await handleOpenFolderSubmit(res.path);
        return;
      }
      if (res && res.cancelled) {
        setIsOpeningFolder(false);
        return;
      }

      // 2. Fallback to browser directory picker if supported
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker();
        const suggestedPath = dirHandle.name;
        setCustomPath(suggestedPath);
        await handleOpenFolderSubmit(suggestedPath);
      } else {
        alert('Please enter or paste the folder path into the field.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error(err);
        setFolderError(err.message || 'Could not choose folder');
      }
    } finally {
      setIsOpeningFolder(false);
    }
  };

  const getFileIcon = (ext?: string) => {
    switch (ext?.toLowerCase()) {
      case 'ts':
      case 'tsx':
      case 'js':
      case 'jsx':
      case 'json':
        return <FileCode className="w-4 h-4 text-[var(--text-secondary)]" />;
      case 'docx':
      case 'md':
      case 'txt':
        return <FileText className="w-4 h-4 text-[var(--text-secondary)]" />;
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4 text-[var(--text-secondary)]" />;
      case 'pptx':
        return <Presentation className="w-4 h-4 text-[var(--text-secondary)]" />;
      default:
        return <File className="w-4 h-4 text-[var(--text-tertiary)]" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl overflow-hidden flex flex-col font-mono text-[var(--text-secondary)]">
        
        {/* MODAL HEADER / SEARCH BAR */}
        {mode !== 'open-folder' ? (
          <div className="flex items-center px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <Search className="w-4 h-4 text-[var(--text-tertiary)] mr-2 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={mode === 'files' ? 'Type file name to quick open (Ctrl+P)...' : 'Type command name (Ctrl+Shift+P)...'}
              className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] font-sans"
            />
            <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-[var(--text-tertiary)]">
              <span className="bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)]">ESC</span>
              <span>to close</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[var(--text-primary)]" />
              <span className="text-sm font-semibold text-[var(--text-primary)] font-sans">Open Project Folder</span>
            </div>
            <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* CONTENT AREA */}
        <div className="max-h-96 overflow-y-auto p-2">
          {mode === 'files' && (
            <div className="space-y-1">
              {filteredFiles.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--text-tertiary)]">No matching files in workspace</div>
              ) : (
                filteredFiles.map((file, idx) => (
                  <div
                    key={file.path}
                    onClick={() => {
                      openFileInTab(file.path);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      idx === selectedIndex ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getFileIcon(file.extension)}
                      <span className="font-medium truncate text-[var(--text-primary)]">{file.name}</span>
                      <span className="text-[var(--text-tertiary)] text-[11px] truncate">{file.path}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {mode === 'commands' && (
            <div className="space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--text-tertiary)]">No matching commands</div>
              ) : (
                filteredCommands.map((cmd, idx) => (
                  <div
                    key={cmd.id}
                    onClick={() => cmd.action()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      idx === selectedIndex ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {cmd.icon}
                      <span className="font-medium font-sans text-[var(--text-primary)]">{cmd.title}</span>
                    </div>
                    {cmd.shortcut && (
                      <span className="text-[10px] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        {cmd.shortcut}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {mode === 'open-folder' && (
            <div className="p-2 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--text-secondary)] font-sans font-medium">Enter Local Folder Path (Press Enter to open):</label>
                <input
                  type="text"
                  value={customPath}
                  onChange={e => setCustomPath(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleOpenFolderSubmit(customPath);
                  }}
                  disabled={isOpeningFolder}
                  placeholder="e.g. F:\corewithin or C:\Projects\my-project (Press Enter)"
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--text-primary)] focus:outline-none font-mono"
                />
                {folderError && (
                  <p className="text-xs text-rose-400 font-sans mt-1">{folderError}</p>
                )}
              </div>

              {/* Native Picker Button */}
              <div className="pt-1">
                <button
                  onClick={handlePickNativeFolder}
                  disabled={isOpeningFolder}
                  className="w-full py-2 bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-sans font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <FolderOpen className="w-4 h-4 text-[var(--text-primary)]" />
                  <span>Choose Folder via System Dialog</span>
                </button>
              </div>

              {/* Recent Projects */}
              {recentWorkspaces.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
                  <div className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Recent Workspaces</span>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {recentWorkspaces.map(rec => (
                      <div
                        key={rec.path}
                        onClick={() => handleOpenFolderSubmit(rec.path)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-elevated)] cursor-pointer text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FolderOpen className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
                          <span className="font-semibold text-[var(--text-primary)]">{rec.name}</span>
                          <span className="text-[11px] text-[var(--text-tertiary)] truncate">{rec.path}</span>
                        </div>
                        {rec.isGitRepo && (
                          <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1 shrink-0">
                            <GitBranch className="w-3 h-3 text-[var(--text-secondary)]" /> git
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between text-[11px] text-[var(--text-tertiary)] font-sans">
          <div className="flex items-center gap-3">
            <span>Navigate <kbd className="px-1 py-0.5 bg-[var(--bg-elevated)] rounded border border-[var(--border-subtle)] font-mono text-[10px] text-[var(--text-secondary)]">↑↓</kbd></span>
            <span>Select <kbd className="px-1 py-0.5 bg-[var(--bg-elevated)] rounded border border-[var(--border-subtle)] font-mono text-[10px] text-[var(--text-secondary)]">↵</kbd></span>
          </div>
        </div>

      </div>
    </div>
  );
};
