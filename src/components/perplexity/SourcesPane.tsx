import React, { useState } from 'react';
import { 
  FileText, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  FileSpreadsheet,
  Globe
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

interface SourceItem {
  id: string;
  source_file: string;
  domain?: string;
  page_number?: number;
  snippet: string;
  relevance_score?: number;
}

interface SourcesPaneProps {
  sources?: SourceItem[];
  onOpenSource?: (source: SourceItem) => void;
}

export const SourcesPane: React.FC<SourcesPaneProps> = ({ sources = [], onOpenSource }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { openTab } = useWorkbenchStore();

  const defaultSources: SourceItem[] = [
    {
      id: 'src-1',
      source_file: 'Operations_SOP_014.pdf',
      domain: 'cert-in.org',
      page_number: 12,
      snippet: 'Page 1 of 8 No. 20(3)/2022-CERT-In Government of India: Critical process piping integrity thresholds and mandatory reporting protocol.'
    },
    {
      id: 'src-2',
      source_file: 'DPDP_Act_2023.pdf',
      domain: 'meity.gov.in',
      page_number: 1,
      snippet: '[PDF] THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023: On-premise air-gapped sovereign data processing provisions.'
    },
    {
      id: 'src-3',
      source_file: 'openwebui_architecture.md',
      domain: 'docs.openwebui.com',
      page_number: 1,
      snippet: 'Local model serving via Ollama and llama.cpp runtime with zero external network dependencies.'
    }
  ];

  const activeSources = sources.length > 0 ? sources : defaultSources;

  return (
    <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
      <div className="bg-[#1C1D1E] border border-[#27292A] rounded-2xl p-3.5 space-y-3 shadow-lg">
        {/* Header */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between cursor-pointer text-xs font-semibold text-white select-none"
        >
          <div className="flex items-center gap-2">
            <span>Sources</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#282A2C] text-[10px] text-[#A2A8AB] font-mono">
              {activeSources.length}
            </span>
          </div>
          <button className="text-[#858A8E] hover:text-white p-0.5">
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Sources List */}
        {isExpanded && (
          <div className="space-y-2">
            {activeSources.map((src, idx) => {
              const isPdf = src.source_file.endsWith('.pdf');
              const isCsv = src.source_file.endsWith('.csv');

              return (
                <div
                  key={src.id || idx}
                  onClick={() => {
                    if (onOpenSource) {
                      onOpenSource(src);
                    } else {
                      openTab({
                        id: `tab-source-${idx}`,
                        title: src.source_file,
                        type: 'document',
                        file: src.source_file,
                        isClosable: true
                      });
                    }
                  }}
                  className="p-2.5 rounded-xl bg-[#222425] hover:bg-[#282A2C] border border-[#2B2D2F] hover:border-[#3A3E40] text-left transition-all cursor-pointer group space-y-1.5"
                >
                  {/* Domain & Source header */}
                  <div className="flex items-center gap-2 text-[11px] text-[#858A8E]">
                    {isPdf ? (
                      <FileText className="w-3.5 h-3.5 text-[#20B8CD] flex-shrink-0" />
                    ) : isCsv ? (
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#4EC9B0] flex-shrink-0" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-[#20B8CD] flex-shrink-0" />
                    )}
                    <span className="font-mono truncate">{src.domain || src.source_file}</span>
                    {src.page_number && (
                      <span className="text-[10px] text-[#5F6467]">p.{src.page_number}</span>
                    )}
                  </div>

                  {/* Title / Snippet */}
                  <div className="text-xs font-semibold text-[#E6E6E6] group-hover:text-white line-clamp-2 leading-snug">
                    {src.snippet.slice(0, 90)}...
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
