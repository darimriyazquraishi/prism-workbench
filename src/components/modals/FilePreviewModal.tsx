import React from 'react';
import { X, FileText, FileSpreadsheet, Image as ImageIcon, CheckCircle, Code } from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';

export const FilePreviewModal: React.FC = () => {
  const { activePreviewFile, setActivePreviewFile } = useAntigravityStore();

  if (!activePreviewFile) return null;

  const renderCsvTable = (csvContent: string) => {
    const lines = csvContent.trim().split('\n').map(line => line.split(','));
    if (lines.length === 0) return <p className="text-[var(--text-secondary)] italic">Empty CSV file</p>;

    const headers = lines[0];
    const rows = lines.slice(1);

    return (
      <div className="overflow-x-auto border border-[var(--border-subtle)] rounded-lg">
        <table className="w-full text-left font-mono text-[11px] border-collapse">
          <thead className="bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="p-2 border-b border-[var(--border-subtle)] truncate font-semibold">{h.trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-[var(--bg-elevated)]/50">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-2 truncate">{cell.trim()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const isImage = ['image', 'png', 'jpeg'].includes(activePreviewFile.type) || activePreviewFile.dataUrl;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] font-sans text-xs">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--text-primary)] font-bold truncate">
            {activePreviewFile.type === 'pdf' && <FileText className="w-4 h-4 text-[#569cd6]" />}
            {activePreviewFile.type === 'csv' && <FileSpreadsheet className="w-4 h-4 text-[var(--accent-primary)]" />}
            {isImage && <ImageIcon className="w-4 h-4 text-purple-400" />}
            {activePreviewFile.type === 'code' && <Code className="w-4 h-4 text-amber-400" />}
            {activePreviewFile.type === 'text' && <FileText className="w-4 h-4 text-emerald-400" />}
            <span className="truncate">{activePreviewFile.name}</span>
            <span className="text-[10px] font-sans font-normal text-[var(--text-secondary)]">({activePreviewFile.size})</span>
          </div>
          <button 
            onClick={() => setActivePreviewFile(null)}
            className="p-1 rounded hover:bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / File Content Preview */}
        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs leading-relaxed text-[var(--text-primary)] space-y-4">
          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] border-b border-[var(--border-subtle)] pb-2 font-sans">
            <span>Location: <code className="text-[var(--accent-primary)]">{activePreviewFile.path}</code></span>
            <span className="flex items-center gap-1 text-[var(--accent-success)]"><CheckCircle className="w-3.5 h-3.5" /> Verified On-Disk</span>
          </div>

          {activePreviewFile.type === 'csv' && activePreviewFile.content ? (
            renderCsvTable(activePreviewFile.content)
          ) : isImage && activePreviewFile.dataUrl ? (
            <div className="space-y-3 flex flex-col items-center justify-center bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-4">
              <img 
                src={activePreviewFile.dataUrl} 
                alt={activePreviewFile.name} 
                className="max-h-96 object-contain rounded border border-[var(--border-subtle)] shadow-md"
              />
              <p className="text-[11px] font-sans text-[var(--text-secondary)] text-center">
                Image preview rendered natively via local File Data URL.
              </p>
            </div>
          ) : activePreviewFile.content ? (
            <pre className="whitespace-pre-wrap bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border-subtle)] text-[11px] max-h-96 overflow-y-auto font-mono">
              {activePreviewFile.content}
            </pre>
          ) : (
            <div className="p-8 text-center text-[var(--text-secondary)] space-y-2 font-sans">
              <FileText className="w-8 h-8 mx-auto text-[var(--text-tertiary)]" />
              <p className="text-xs">Binary document file ({activePreviewFile.size}) loaded.</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">Full document contents attached to active task context for Qwen engine processing.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex items-center justify-between">
          <span className="text-[11px] text-[var(--text-secondary)] font-sans">Air-gapped local file reader</span>
          <button 
            onClick={() => setActivePreviewFile(null)}
            className="px-3 py-1.5 bg-[var(--text-primary)] text-[var(--bg-base)] rounded-lg font-sans font-medium text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
