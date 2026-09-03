import React, { useEffect, useState } from 'react';
import { BookOpen, Search, Upload, Database, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export const KnowledgePage: React.FC = () => {
  const [collection, setCollection] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadCollection();
  }, []);

  const loadCollection = async () => {
    try {
      const data = await api.listKnowledge();
      setCollection(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await api.searchKnowledge(searchQuery);
      setSearchResults(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-400" />
            Internal SOP & Engineering Knowledge Base (Local RAG)
          </h2>
          <p className="text-xs text-zinc-400">
            Grounding agent outputs with on-premise ChromaDB vector store and nomic-embed-text
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono font-medium">
            Collection: {collection?.collection_name || 'mrpl_industrial_knowledge'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Knowledge Ingestion & File Index (5 Cols) */}
        <div className="lg:col-span-5 bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>Indexed Standards & SOPs</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              {collection?.files?.length || 0} Files
            </span>
          </div>

          <div className="space-y-2">
            {collection?.files?.map((f: any) => (
              <div
                key={f.file_name}
                className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-medium text-zinc-200">{f.file_name}</div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    {(f.size_bytes / 1024).toFixed(1)} KB • Local Vector Indexed
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Semantic Search Tester & Citation Explorer (7 Cols) */}
        <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Semantic RAG Search Tester
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search allowable corrosion limits, pipe retirement criteria, or SOP steps..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </form>

          {/* Search Results */}
          <div className="space-y-3 pt-2">
            {searchResults.length > 0 ? (
              searchResults.map((res, idx) => (
                <div key={idx} className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-sky-400 font-semibold">{res.source_file}</span>
                    {res.page_number && <span className="text-zinc-500">Page {res.page_number}</span>}
                  </div>
                  <p className="text-zinc-300 text-[11px] leading-relaxed italic">
                    "{res.snippet}"
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                Submit a query to test local vector embeddings and chunk retrieval.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
