import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  File, 
  Trash2, 
  ExternalLink, 
  AlertTriangle,
  FolderOpen,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

export interface PersistentKbFile {
  id: string;
  name: string;
  filename: string;
  path: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  formattedDate: string;
}

export const WorkflowKnowledgeView: React.FC = () => {
  const [files, setFiles] = useState<PersistentKbFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Delete confirmation modal state
  const [fileToDelete, setFileToDelete] = useState<PersistentKbFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persistent Knowledge Base files on mount
  const loadFiles = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/kb/files');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.files)) {
          setFiles(data.files);
          // Sync to localStorage as client cache
          try {
            localStorage.setItem('antigravity_kb_files', JSON.stringify(data.files));
          } catch (e) {}
        }
      } else {
        // Fallback to localStorage if API fails
        const cached = localStorage.getItem('antigravity_kb_files');
        if (cached) {
          setFiles(JSON.parse(cached));
        }
      }
    } catch (err) {
      console.error('Failed to load Knowledge Base files:', err);
      const cached = localStorage.getItem('antigravity_kb_files');
      if (cached) {
        try {
          setFiles(JSON.parse(cached));
        } catch (e) {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // Handle physical file upload to backend disk storage
  const handleFileUpload = async (fileList: FileList | File[] | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const fileArray = Array.from(fileList);
    let successCount = 0;

    for (const file of fileArray) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/kb/upload', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.files)) {
            setFiles(data.files);
            try {
              localStorage.setItem('antigravity_kb_files', JSON.stringify(data.files));
            } catch (e) {}
            successCount++;
          }
        } else {
          const errData = await res.json().catch(() => ({ error: 'Upload server error' }));
          setErrorMessage(`Failed to upload ${file.name}: ${errData.error || res.statusText}`);
        }
      } catch (err: any) {
        console.error('Upload exception:', err);
        setErrorMessage(`Upload error for ${file.name}: ${err.message}`);
      }
    }

    setIsUploading(false);
    if (successCount > 0) {
      setSuccessMessage(`✓ Successfully stored ${successCount} document${successCount > 1 ? 's' : ''} to persistent disk storage.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // Confirm and execute physical deletion
  const handleDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/kb/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: fileToDelete.filename, id: fileToDelete.id })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.files)) {
          setFiles(data.files);
          try {
            localStorage.setItem('antigravity_kb_files', JSON.stringify(data.files));
          } catch (e) {}
        } else {
          // Manual filter fallback
          setFiles(prev => prev.filter(f => f.filename !== fileToDelete.filename && f.id !== fileToDelete.id));
        }
        setSuccessMessage(`✓ Deleted ${fileToDelete.name} from persistent storage.`);
        setTimeout(() => setSuccessMessage(null), 3500);
      } else {
        setErrorMessage(`Failed to delete ${fileToDelete.name}`);
      }
    } catch (err: any) {
      console.error('Delete exception:', err);
      setErrorMessage(`Error deleting file: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setFileToDelete(null);
    }
  };

  // Helper for file icon based on file extension
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext)) {
      return <FileText className="w-5 h-5 text-[#569cd6] flex-shrink-0" />;
    }
    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      return <FileSpreadsheet className="w-5 h-5 text-[var(--status-healthy)] flex-shrink-0" />;
    }
    if (['py', 'js', 'json', 'ts', 'html'].includes(ext)) {
      return <FileCode className="w-5 h-5 text-[var(--accent-primary)] flex-shrink-0" />;
    }
    if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext)) {
      return <ImageIcon className="w-5 h-5 text-[var(--status-attention)] flex-shrink-0" />;
    }
    return <File className="w-5 h-5 text-[var(--text-secondary)] flex-shrink-0" />;
  };

  // Format bytes to human readable string
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[var(--bg-base)] font-sans text-xs text-[var(--text-primary)] p-6 space-y-6">
      
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileUpload(e.target.files)}
        multiple
        className="hidden"
      />

      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight font-sans">
          KNOWLEDGE BASE
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Upload and manage documents used by the local system.
        </p>
      </div>

      {/* Upload Button & Dropzone */}
      <div className="space-y-3">
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileUpload(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--accent-primary)] rounded-xl p-6 bg-[var(--bg-surface)] text-center cursor-pointer transition-colors space-y-3 group"
        >
          <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto text-[var(--accent-primary)] group-hover:scale-105 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              disabled={isUploading}
              className="px-4 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Uploading & Saving to Disk...' : '+ Upload Files'}</span>
            </button>
            <p className="text-[11px] text-[var(--text-tertiary)] pt-1">
              Drag &amp; drop files here, or click to browse. Files are saved persistently to local disk storage.
            </p>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      <hr className="border-[var(--border-subtle)] my-2" />

      {/* PREVIOUSLY UPLOADED FILES SECTION */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          PREVIOUSLY UPLOADED FILES {files.length > 0 && `(${files.length})`}
        </h2>

        {isLoading ? (
          <div className="p-8 text-center text-[var(--text-secondary)] font-mono text-xs">
            Loading persisted documents from disk...
          </div>
        ) : files.length === 0 ? (
          <div className="p-8 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface)] text-center text-[var(--text-secondary)] font-mono text-xs">
            No files uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {files.map((file) => (
              <div 
                key={file.id || file.filename}
                className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 flex items-center justify-between gap-3 shadow-sm hover:border-[var(--border-subtle)] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {getFileIcon(file.filename)}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="font-bold text-xs text-[var(--text-primary)] truncate font-mono" title={file.name}>
                      {file.name}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] font-mono flex items-center gap-2">
                      <span>Uploaded: {file.formattedDate || 'Saved'}</span>
                      {file.sizeBytes > 0 && (
                        <>
                          <span>•</span>
                          <span>{formatBytes(file.sizeBytes)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={`/api/kb/view/${encodeURIComponent(file.filename)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[var(--bg-elevated)] hover:bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg text-[11px] font-medium text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Open / View File"
                  >
                    <ExternalLink className="w-3 h-3 text-[var(--accent-primary)]" />
                    <span>Open</span>
                  </a>
                  <button
                    onClick={() => setFileToDelete(file)}
                    className="px-2.5 py-1.5 bg-[var(--bg-elevated)] hover:bg-rose-950/40 border border-[var(--border-subtle)] hover:border-rose-800/60 rounded-lg text-[11px] font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Delete File"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4 font-sans text-xs">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold font-mono text-sm border-b border-[var(--border-subtle)] pb-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>Confirm Permanent Deletion</span>
            </div>

            <p className="text-[var(--text-primary)] leading-relaxed">
              Are you sure you want to permanently delete <strong className="font-mono text-white">"{fileToDelete.name}"</strong>?
            </p>
            <p className="text-[11px] text-[var(--text-secondary)]">
              This will remove the physical file from persistent disk storage and delete its metadata record.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFile}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
