import React, { useState } from 'react';
import { Globe, ExternalLink, Search, FileText, CheckCircle2, Copy, Check } from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

export const PerplexityLinksView: React.FC = () => {
  const { messages } = useWorkbenchStore();
  const [filterQuery, setFilterQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract all citations from messages safely
  const allCitations = messages.flatMap((m, msgIdx) => 
    (m.citations || []).map((c, cIdx) => {
      const fileName = c?.source_file || 'Document';
      return {
        id: `cite-${msgIdx}-${cIdx}`,
        source_file: fileName,
        domain: fileName.split('/').pop()?.split('.').slice(0, -1).join('.') || 'local',
        snippet: c?.snippet || 'Source reference snippet',
        relevance_score: c?.relevance_score || 1.0,
        page_number: c?.page_number || 1
      };
    })
  );

  const displaySources = allCitations;

  const filtered = displaySources.filter(s => 
    s.source_file.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.snippet.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleCopyLink = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#191A1A] text-[#F3F3EE] p-6 overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* Header & Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242627] pb-5">
          <div>
            <h1 className="text-2xl font-serif text-white font-normal">References &amp; Links</h1>
            <p className="text-xs text-[#858A8E] mt-1">
              Verified local documents and citations referenced in this conversation.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#858A8E] absolute left-3 top-2.5" />
            <input 
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search references..."
              className="w-full bg-[#202222] border border-[#2E3133] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#5F6467] outline-none focus:border-[#3D4143]"
            />
          </div>
        </div>

        {/* Links Grid or Clean Empty State */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-[#202222]/40 border border-[#2E3133] rounded-2xl p-8">
            <Globe className="w-8 h-8 text-[#5F6467] mx-auto" />
            <div className="text-sm font-semibold text-white">No Link Citations Yet</div>
            <p className="text-xs text-[#858A8E] max-w-sm mx-auto">
              When the local model cites internal documents or knowledge chunks during an answer, verifiable sources will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((src) => (
              <div 
                key={src.id}
                className="bg-[#202222] border border-[#2E3133] hover:border-[#3D4143] rounded-2xl p-4 transition-all space-y-3 flex flex-col justify-between shadow-sm group"
              >
              <div className="space-y-2">
                {/* Domain / File Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#20B8CD]/10 border border-[#20B8CD]/30 flex items-center justify-center text-[#20B8CD]">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-white font-mono truncate max-w-[200px]">
                      {src.source_file.split('/').pop()}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#27292A] text-[#20B8CD] border border-[#2E3133]">
                    {(src.relevance_score * 100).toFixed(0)}% match
                  </span>
                </div>

                {/* Excerpt Snippet */}
                <p className="text-xs text-[#A2A8AB] leading-relaxed line-clamp-3">
                  "{src.snippet}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#27292A] flex items-center justify-between text-[11px] text-[#858A8E]">
                <span>Page {src.page_number || 1}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyLink(src.source_file, src.id)}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedId === src.id ? (
                      <>
                        <Check className="w-3 h-3 text-[#20B8CD]" />
                        <span className="text-[#20B8CD]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Path</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};
