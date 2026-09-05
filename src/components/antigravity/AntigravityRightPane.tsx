import React from 'react';
import { 
  FolderArchive, 
  FileText, 
  Compass, 
  BookOpen, 
  Activity, 
  X
} from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';
import { PIDDrawingView } from '../workspaces/PIDDrawingView';
import { DocumentIntelligenceView } from '../workspaces/DocumentIntelligenceView';
import { KnowledgeRAGView } from '../workspaces/KnowledgeRAGView';
import { DeliverablesView } from '../workspaces/DeliverablesView';
import { SystemDiagnosticsView } from '../workspaces/SystemDiagnosticsView';

export const AntigravityRightPane: React.FC = () => {
  const { 
    activeRightTab, 
    setActiveRightTab, 
    isRightPaneOpen, 
    setRightPaneOpen 
  } = useAntigravityStore();

  if (!isRightPaneOpen) return null;

  return (
    <aside className="w-[500px] bg-[var(--bg-surface)] border-l border-[#2d2d2d] flex flex-col font-sans select-none flex-shrink-0 z-20 text-xs shadow-xl">
      {/* Pane Tab Navigation Strip */}
      <div className="h-9 bg-[#2d2d2d] border-b border-[#2d2d2d] px-2 flex items-center justify-between">
        <div className="flex items-center space-x-0.5 overflow-x-auto h-full font-mono text-xs">
          <button
            onClick={() => setActiveRightTab('artifacts')}
            className={`h-full px-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeRightTab === 'artifacts'
                ? 'border-[var(--accent-fuchsia)] text-[var(--text-primary)] font-bold bg-[var(--bg-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5 text-[var(--status-healthy)]" />
            <span>Artifacts</span>
          </button>

          <button
            onClick={() => setActiveRightTab('pdf_viewer')}
            className={`h-full px-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeRightTab === 'pdf_viewer'
                ? 'border-[var(--accent-fuchsia)] text-[var(--text-primary)] font-bold bg-[var(--bg-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[var(--status-attention)]" />
            <span>PDF &amp; OCR</span>
          </button>

          <button
            onClick={() => setActiveRightTab('pid_cad')}
            className={`h-full px-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeRightTab === 'pid_cad'
                ? 'border-[var(--accent-fuchsia)] text-[var(--text-primary)] font-bold bg-[var(--bg-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#569cd6]" />
            <span>P&amp;ID CAD</span>
          </button>

          <button
            onClick={() => setActiveRightTab('rag_knowledge')}
            className={`h-full px-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeRightTab === 'rag_knowledge'
                ? 'border-[var(--accent-fuchsia)] text-[var(--text-primary)] font-bold bg-[var(--bg-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#569cd6]" />
            <span>RAG</span>
          </button>

          <button
            onClick={() => setActiveRightTab('telemetry')}
            className={`h-full px-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeRightTab === 'telemetry'
                ? 'border-[var(--accent-fuchsia)] text-[var(--text-primary)] font-bold bg-[var(--bg-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[var(--status-healthy)]" />
            <span>Telemetry</span>
          </button>
        </div>

        <button
          onClick={() => setRightPaneOpen(false)}
          className="p-1 hover:bg-[#37373d] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Pane Content Viewport */}
      <div className="flex-1 overflow-hidden p-2 bg-[var(--bg-primary)]">
        {activeRightTab === 'artifacts' && <DeliverablesView />}
        {activeRightTab === 'pdf_viewer' && <DocumentIntelligenceView />}
        {activeRightTab === 'pid_cad' && <PIDDrawingView />}
        {activeRightTab === 'rag_knowledge' && <KnowledgeRAGView />}
        {activeRightTab === 'telemetry' && <SystemDiagnosticsView />}
      </div>
    </aside>
  );
};
