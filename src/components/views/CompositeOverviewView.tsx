import React from 'react';
import { MainWorkspaceView } from './MainWorkspaceView';
import { ModelManagementView } from './ModelManagementView';
import { WorkflowKnowledgeView } from './WorkflowKnowledgeView';
import { Maximize2 } from 'lucide-react';

interface CompositeOverviewViewProps {
  onSelectView: (view: 'workspace' | 'models' | 'workflow') => void;
}

export const CompositeOverviewView: React.FC<CompositeOverviewViewProps> = ({ onSelectView }) => {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#181818] p-3 gap-3 font-sans text-xs select-none">
      {/* Top Row: Window 1 (Main Workspace) + Window 2 (Model Management & Audit) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 min-h-[440px]">
        {/* Window 1 Card */}
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg overflow-hidden flex flex-col shadow-lg">
          <div className="h-7 bg-[#252526] border-b border-[#2d2d2d] px-3 flex items-center justify-between font-mono text-[11px]">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#569cd6]"></span>
              <span>SCREEN 1: MAIN WORKSPACE (IDE &amp; EXECUTION)</span>
            </span>
            <button
              onClick={() => onSelectView('workspace')}
              className="px-2 py-0.5 rounded bg-[#37373d] hover:bg-[#007acc] text-white flex items-center gap-1 cursor-pointer text-[10px]"
            >
              <Maximize2 className="w-2.5 h-2.5" />
              <span>Full Screen</span>
            </button>
          </div>
          <div className="flex-1 flex overflow-hidden">
            <MainWorkspaceView />
          </div>
        </div>

        {/* Window 2 Card */}
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg overflow-hidden flex flex-col shadow-lg">
          <div className="h-7 bg-[#252526] border-b border-[#2d2d2d] px-3 flex items-center justify-between font-mono text-[11px]">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4ec9b0]"></span>
              <span>SCREEN 2: MODEL MANAGEMENT &amp; AIR-GAP AUDIT</span>
            </span>
            <button
              onClick={() => onSelectView('models')}
              className="px-2 py-0.5 rounded bg-[#37373d] hover:bg-[#007acc] text-white flex items-center gap-1 cursor-pointer text-[10px]"
            >
              <Maximize2 className="w-2.5 h-2.5" />
              <span>Full Screen</span>
            </button>
          </div>
          <div className="flex-1 flex overflow-hidden">
            <ModelManagementView />
          </div>
        </div>
      </div>

      {/* Bottom Row: Window 3 (Workflow Builder & Knowledge Base RAG) */}
      <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg overflow-hidden flex flex-col min-h-[380px] shadow-lg">
        <div className="h-7 bg-[#252526] border-b border-[#2d2d2d] px-3 flex items-center justify-between font-mono text-[11px]">
          <span className="font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ce9178]"></span>
            <span>SCREEN 3: WORKFLOW AUTOMATION CANVAS &amp; LOCAL KNOWLEDGE BASE</span>
          </span>
          <button
            onClick={() => onSelectView('workflow')}
            className="px-2 py-0.5 rounded bg-[#37373d] hover:bg-[#007acc] text-white flex items-center gap-1 cursor-pointer text-[10px]"
          >
            <Maximize2 className="w-2.5 h-2.5" />
            <span>Full Screen</span>
          </button>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <WorkflowKnowledgeView />
        </div>
      </div>
    </div>
  );
};
