import React, { useEffect, useState } from 'react';
import { FileText, Upload, Eye, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await api.listDocuments();
      setDocuments(docs);
      if (docs.length > 0 && !selectedDoc) {
        handleSelectDoc(docs[0].file_name);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectDoc = async (fileName: string) => {
    try {
      const res = await fetch(`/api/documents/${fileName}/process`, { method: 'POST' });
      const data = await res.json();
      setSelectedDoc(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      await api.uploadDocument(e.target.files[0]);
      await loadDocuments();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            Industrial Document Repository & Local OCR Engine
          </h2>
          <p className="text-xs text-zinc-400">
            Local parsing, scanned PDF page classification, and offline OCR processing
          </p>
        </div>

        <label className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer flex items-center gap-2 transition-all">
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Document</span>
          <input type="file" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document List (4 Cols) */}
        <div className="lg:col-span-4 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Stored Documents ({documents.length})
          </div>

          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.file_name}
                onClick={() => handleSelectDoc(doc.file_name)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedDoc?.file_name === doc.file_name
                    ? 'bg-sky-950/30 border-sky-600/50 text-sky-300'
                    : 'bg-zinc-950/70 border-zinc-850 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="font-medium truncate">{doc.file_name}</div>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                  <span>{(doc.size_bytes / 1024).toFixed(1)} KB</span>
                  <span className="uppercase">{doc.extension}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document OCR & Text Inspection (8 Cols) */}
        <div className="lg:col-span-8 bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-semibold text-zinc-200">
                {selectedDoc ? selectedDoc.file_name : 'Select a document'}
              </h3>
            </div>
            {selectedDoc && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {selectedDoc.total_pages} Pages
                </span>
                {selectedDoc.is_primarily_scanned && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                    Scanned PDF (OCR Active)
                  </span>
                )}
              </div>
            )}
          </div>

          {selectedDoc ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {selectedDoc.pages?.map((p: any) => (
                  <div key={p.page_number} className="p-2.5 bg-zinc-950/80 border border-zinc-800 rounded-md text-[11px]">
                    <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400">
                      <span>Page {p.page_number}</span>
                      <span className={p.is_scanned ? 'text-amber-400' : 'text-emerald-400'}>
                        {p.is_scanned ? 'OCR (Scanned)' : 'Digital'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-400">Extracted Text Content</div>
                <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 font-mono text-xs text-zinc-300 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {selectedDoc.full_text || 'No text content available.'}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-zinc-500">Select a document to inspect text and OCR layers.</div>
          )}
        </div>
      </div>
    </div>
  );
};
