import React, { useEffect, useState } from 'react';
import { FolderArchive, Download, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export const ArtifactsPage: React.FC = () => {
  const [artifacts, setArtifacts] = useState<any[]>([]);

  useEffect(() => {
    loadArtifacts();
  }, []);

  const loadArtifacts = async () => {
    try {
      const data = await api.listArtifacts();
      setArtifacts(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <FolderArchive className="w-4 h-4 text-emerald-400" />
            Generated Business Deliverables & Human Review Gallery
          </h2>
          <p className="text-xs text-zinc-400">
            Exported Microsoft Word (.docx), Excel (.xlsx), and PowerPoint (.pptx) engineering deliverables
          </p>
        </div>

        <span className="text-xs font-mono text-zinc-400">
          Total Generated: {artifacts.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artifacts.map((art) => (
          <div
            key={art.file_name}
            className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all shadow-sm"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded bg-emerald-950 border border-emerald-800 flex items-center justify-center font-bold text-emerald-400 text-xs uppercase font-mono">
                    {art.file_type}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200 truncate max-w-[180px]">
                      {art.file_name}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {(art.size_bytes / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                  AI Draft
                </span>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-950/60 p-2.5 rounded border border-zinc-850">
                Formal technical deliverable generated on-premise with local deterministic calculations and standard sign-off block.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                Sovereign File
              </span>

              <a
                href={`/api/artifacts/${art.file_name}/download`}
                download
                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
