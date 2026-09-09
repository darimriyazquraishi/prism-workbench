import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FileText,
  FileCode,
  FileSpreadsheet,
  File,
  Eye,
  Copy,
  Check,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Plus,
  Paperclip,
  ExternalLink,
  ChevronRight,
  Shield,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';

export interface DocumentViewerFile {
  name: string;
  path: string;
  extension: string;
  size?: number;
  content?: string | null;
  extractedText?: string | null;
  isBinary?: boolean;
  mimeType?: string;
  sha256?: string;
  version?: number;
}

export interface DocumentViewerProps {
  file: DocumentViewerFile;
  onClose?: () => void;
  onContentChange?: (newContent: string) => void;
  isEditable?: boolean;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  file,
  onClose,
  onContentChange,
  isEditable = false
}) => {
  const { attachedFiles, attachFile, removeAttachedFile } = useAntigravityStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewMode, setViewMode] = useState<'preview' | 'text' | 'table'>('preview');
  const [pdfVersion, setPdfVersion] = useState<number>(() => Date.now());

  // Automatically update PDF version when file path, size, content, or version prop changes
  useEffect(() => {
    setPdfVersion(Date.now());
  }, [file.path, file.size, file.content, file.version, file.extractedText]);

  const ext = (file.extension || file.name.split('.').pop() || '').toLowerCase();
  const rawUrl = `/api/workspace/raw?path=${encodeURIComponent(file.path)}`;
  const isAttached = attachedFiles.includes(file.name) || attachedFiles.includes(file.path);

  const isPdf = ext === 'pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp'].includes(ext);
  const isCsv = ['csv', 'tsv'].includes(ext);
  const isJson = ext === 'json';
  const isDocx = ['docx', 'doc'].includes(ext);
  const isCodeOrText = ['txt', 'md', 'py', 'js', 'ts', 'tsx', 'jsx', 'html', 'css', 'sql', 'sh', 'log', 'yaml', 'yml', 'xml', 'env'].includes(ext);

  const textContent = file.content ?? file.extractedText ?? '';

  // Copy handler
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Toggle attachment in chat context
  const handleToggleAttach = () => {
    if (isAttached) {
      removeAttachedFile(file.name);
      removeAttachedFile(file.path);
    } else {
      attachFile(file.name);
    }
  };

  // Parse CSV into rows and columns
  const csvParsed = useMemo(() => {
    if (!isCsv || !textContent) return { headers: [], rows: [] };
    const lines = textContent.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };

    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
    const rows = lines.slice(1, 200).map(line =>
      line.split(delimiter).map(cell => cell.trim().replace(/^["']|["']$/g, ''))
    );
    return { headers, rows, totalLines: lines.length };
  }, [isCsv, textContent]);

  // Formatted JSON
  const jsonParsed = useMemo(() => {
    if (!isJson || !textContent) return null;
    try {
      const parsed = JSON.parse(textContent);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return textContent;
    }
  }, [isJson, textContent]);

  // Match count for search in text
  const matchCount = useMemo(() => {
    if (!searchQuery.trim() || !textContent) return 0;
    try {
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      return (textContent.match(regex) || []).length;
    } catch {
      return 0;
    }
  }, [searchQuery, textContent]);

  // Get file icon
  const renderIcon = () => {
    if (isPdf) return <FileText className="w-4 h-4 text-[var(--text-secondary)]" />;
    if (isImage) return <Eye className="w-4 h-4 text-[var(--text-secondary)]" />;
    if (isCsv) return <FileSpreadsheet className="w-4 h-4 text-[var(--text-secondary)]" />;
    if (isJson) return <FileCode className="w-4 h-4 text-[var(--text-secondary)]" />;
    if (isDocx) return <FileText className="w-4 h-4 text-[var(--text-secondary)]" />;
    if (isCodeOrText) return <FileCode className="w-4 h-4 text-[var(--text-secondary)]" />;
    return <File className="w-4 h-4 text-[var(--text-tertiary)]" />;
  };

  const breadcrumbs = file.path.replace(/\\/g, '/').split('/').filter(Boolean);

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden font-sans select-text">
      {/* 1. Header Toolbar */}
      <div className="h-10 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-3 flex items-center justify-between gap-3 shrink-0 text-xs select-none">
        {/* Left: Breadcrumbs & File Identity */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="shrink-0">{renderIcon()}</div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--text-secondary)] truncate">
            <span className="text-[var(--text-tertiary)]">workspace</span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3 h-3 text-[var(--text-tertiary)] shrink-0" />
                <span className={idx === breadcrumbs.length - 1 ? 'text-[var(--text-primary)] font-semibold truncate' : 'text-[var(--text-secondary)] truncate'}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>

          {file.size !== undefined && file.size > 0 && (
            <span className="text-[10px] font-mono text-[var(--text-tertiary)] shrink-0">
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
          )}

          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] shrink-0">
            {ext || 'FILE'}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Attach Context Button */}
          <button
            onClick={handleToggleAttach}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer border ${
              isAttached
                ? 'bg-[var(--text-primary)] text-[var(--bg-base)] font-medium border-transparent'
                : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
            }`}
            title={isAttached ? 'Remove from attached AI context' : 'Attach this document to chat context'}
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>{isAttached ? 'Context Attached' : 'Attach Context'}</span>
          </button>

          {/* Sub-view Toggles for PDF and CSV */}
          {isPdf && (
            <div className="flex items-center bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded p-0.5 text-[11px] font-mono">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  viewMode === 'preview' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                PDF View
              </button>
              <button
                onClick={() => setViewMode('text')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  viewMode === 'text' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Extracted Text
              </button>
            </div>
          )}

          {isCsv && (
            <div className="flex items-center bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded p-0.5 text-[11px] font-mono">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  viewMode === 'table' || viewMode === 'preview' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Table Grid
              </button>
              <button
                onClick={() => setViewMode('text')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  viewMode === 'text' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Raw CSV
              </button>
            </div>
          )}

          {/* Search toggle for text/code */}
          {(isCodeOrText || isJson || viewMode === 'text') && (
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                isSearchOpen ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
              }`}
              title="Search within document (Ctrl+F)"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Copy Button */}
          {textContent && (
            <button
              onClick={handleCopy}
              className="px-2 py-1 rounded bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 text-xs cursor-pointer transition-colors"
              title="Copy content to clipboard"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-[var(--text-primary)]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          )}

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              title="Close viewer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Optional Inline Search Bar */}
      {isSearchOpen && (
        <div className="h-9 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-4 flex items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find in document..."
              className="w-full bg-transparent border-none text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none font-mono"
            />
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--text-tertiary)]">
            {searchQuery.trim() && (
              <span>
                {matchCount} {matchCount === 1 ? 'match' : 'matches'}
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="p-1 hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Document Content Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* A. PDF VIEWER */}
        {isPdf && viewMode === 'preview' && (
          <div className="flex-1 flex flex-col h-full bg-[var(--bg-base)]">
            {/* PDF Controls */}
            <div className="h-8 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-3 flex items-center justify-between text-xs text-[var(--text-secondary)] select-none">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[var(--text-secondary)]">PDF Reader Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]" />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPdfVersion(Date.now())}
                  className="flex items-center gap-1 text-[11px] font-mono hover:text-[var(--text-primary)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                  title="Reload PDF document from disk"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reload</span>
                </button>
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] font-mono hover:text-[var(--text-primary)] text-[var(--text-secondary)]"
                  title="Open PDF in new tab"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Standalone</span>
                </a>
              </div>
            </div>

            {/* Embed Native Browser PDF Plugin */}
            <div className="flex-1 w-full h-full relative">
              <iframe
                key={`${file.path}-${pdfVersion}`}
                src={`${rawUrl}&_v=${pdfVersion}#toolbar=1&navpanes=0`}
                className="w-full h-full border-none bg-[var(--bg-base)]"
                title={file.name}
              />
            </div>
          </div>
        )}

        {/* B. IMAGE VIEWER */}
        {isImage && (
          <div className="flex-1 flex flex-col h-full bg-[var(--bg-base)] overflow-hidden">
            <div className="h-8 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-3 flex items-center justify-between text-xs text-[var(--text-secondary)] select-none">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span>Image View:</span>
                <span className="text-[var(--text-primary)]">{file.name}</span>
                <span className="text-[var(--text-tertiary)]">Zoom: {zoomLevel}%</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(25, prev - 25))}
                  className="p-1 hover:bg-[var(--bg-elevated)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="px-2 py-0.5 text-[10px] font-mono hover:bg-[var(--bg-elevated)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  title="Reset Zoom"
                >
                  100%
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(400, prev + 25))}
                  className="p-1 hover:bg-[var(--bg-elevated)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px]">
              <img
                src={rawUrl}
                alt={file.name}
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
                className="max-w-full max-h-full object-contain rounded shadow-2xl transition-transform duration-100 border border-[var(--border-subtle)]"
              />
            </div>
          </div>
        )}

        {/* C. CSV / SPREADSHEET TABLE GRID */}
        {isCsv && (viewMode === 'table' || viewMode === 'preview') && (
          <div className="flex-1 flex flex-col h-full bg-[var(--bg-base)] overflow-hidden">
            <div className="h-8 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-3 flex items-center justify-between text-xs text-[var(--text-secondary)] font-mono select-none">
              <span>{csvParsed.totalLines} rows · {csvParsed.headers.length} columns</span>
              <span className="text-[10px] text-[var(--text-tertiary)]">Tabular Grid View</span>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse font-mono text-xs">
                <thead className="sticky top-0 bg-[var(--bg-elevated)] text-[var(--text-primary)] border-b border-[var(--border-subtle)] shadow-sm z-10">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-[var(--text-tertiary)] w-12 border-r border-[var(--border-subtle)] text-[10px]">#</th>
                    {csvParsed.headers.map((h, i) => (
                      <th key={i} className="px-3 py-2 text-left font-semibold border-r border-[var(--border-subtle)] truncate max-w-[200px]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvParsed.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] transition-colors">
                      <td className="px-3 py-1.5 text-[10px] text-[var(--text-tertiary)] border-r border-[var(--border-subtle)] select-none">{rIdx + 1}</td>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-1.5 text-[var(--text-secondary)] border-r border-[var(--border-subtle)] truncate max-w-[250px]">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* D. JSON STRUCTURED VIEWER */}
        {isJson && viewMode !== 'text' && (
          <div className="flex-1 flex overflow-hidden font-mono text-xs">
            <div className="w-12 bg-[var(--bg-surface)] text-[var(--text-tertiary)] select-none text-right pr-3 py-3 border-r border-[var(--border-subtle)] leading-relaxed shrink-0">
              {(jsonParsed || '').split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <div className="flex-1 overflow-auto p-3 leading-relaxed text-[var(--text-primary)] whitespace-pre">
              {jsonParsed}
            </div>
          </div>
        )}

        {/* E. DOCX EXTRACTED PREVIEW */}
        {isDocx && viewMode !== 'text' && (
          <div className="flex-1 flex flex-col h-full bg-[var(--bg-base)] overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto w-full space-y-6">
              <div className="border-b border-[var(--border-subtle)] pb-4">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs font-mono mb-1">
                  <FileText className="w-4 h-4" />
                  <span>Microsoft Word Document (DOCX)</span>
                </div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">{file.name}</h1>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 font-mono">
                  Extracted text preview · {(textContent.length / 1024).toFixed(1)} KB content
                </p>
              </div>

              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-lg leading-relaxed text-[var(--text-primary)] text-sm whitespace-pre-wrap font-sans">
                {textContent || (
                  <span className="italic text-[var(--text-tertiary)]">No text could be extracted from this Word document.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* F. STANDARD TEXT & CODE EDITOR / VIEWER */}
        {((isCodeOrText && !isJson) || viewMode === 'text' || (!isPdf && !isImage && !isCsv && !isDocx && !file.isBinary)) && (
          <div className="flex-1 flex overflow-hidden font-mono text-xs text-[var(--text-primary)]">
            {/* Line numbers gutter */}
            <div className="w-12 bg-[var(--bg-surface)] text-[var(--text-tertiary)] select-none text-right pr-3 py-3 border-r border-[var(--border-subtle)] leading-relaxed shrink-0 overflow-hidden">
              {textContent.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Editable Textarea or Read-Only Viewer */}
            {isEditable && onContentChange ? (
              <textarea
                value={textContent}
                onChange={(e) => onContentChange(e.target.value)}
                className="flex-1 bg-transparent p-3 text-[var(--text-primary)] border-none outline-none resize-none leading-relaxed font-mono whitespace-pre overflow-auto focus:ring-0"
              />
            ) : (
              <div className="flex-1 overflow-auto p-3 leading-relaxed whitespace-pre font-mono">
                {textContent.split('\n').map((line, idx) => {
                  const isHighlighted = searchQuery.trim() && line.toLowerCase().includes(searchQuery.toLowerCase());
                  return (
                    <div
                      key={idx}
                      className={`${isHighlighted ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] underline decoration-[var(--text-secondary)] rounded px-1' : ''}`}
                    >
                      {line || '\n'}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* G. UNSUPPORTED BINARY FORMAT */}
        {file.isBinary && !isPdf && !isImage && !isDocx && !textContent && (
          <div className="m-auto max-w-md text-center py-16 space-y-4 font-sans select-none">
            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] inline-block shadow-xl">
              <File className="w-10 h-10 text-[var(--text-tertiary)]" />
            </div>
            <h3 className="font-semibold text-base text-[var(--text-primary)]">{file.name}</h3>
            <p className="text-[var(--text-secondary)] text-xs leading-relaxed max-w-xs mx-auto">
              Preview unavailable for this binary format (.{(ext || 'bin').toUpperCase()}).
              The file is securely preserved inside your user workspace.
            </p>
            {file.size !== undefined && (
              <div className="text-[11px] font-mono text-[var(--text-tertiary)]">
                Size: {(file.size / 1024).toFixed(1)} KB
              </div>
            )}
            <div className="pt-2">
              <a
                href={rawUrl}
                download={file.name}
                className="px-4 py-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-medium inline-flex items-center gap-2 border border-[var(--border-subtle)] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export / Download File</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
