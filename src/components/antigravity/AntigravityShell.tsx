import React, { useState } from 'react';
import { AntigravityHeader } from './AntigravityHeader';
import { AntigravityStatusBar } from './AntigravityStatusBar';
import { MainWorkspaceView } from '../views/MainWorkspaceView';
import { ModelManagementView } from '../views/ModelManagementView';
import { WorkflowKnowledgeView } from '../views/WorkflowKnowledgeView';
import { CompositeOverviewView } from '../views/CompositeOverviewView';
import { CommandPalette } from '../modals/CommandPalette';
import { SecurityStatusModal } from '../modals/SecurityStatusModal';
import { 
  LayoutGrid, 
  Terminal, 
  Cpu, 
  GitMerge, 
  Sparkles
} from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';

export type ActiveScreenView = 'workspace' | 'models' | 'workflow' | 'composite';

export const AntigravityShell: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<ActiveScreenView>('workspace');
  const { runIndustrialDemo } = useAntigravityStore();

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-[#cccccc] overflow-hidden select-none font-sans">
      {/* 1. Antigravity Top Mission Header */}
      <AntigravityHeader />

      {/* 2. Top Screen Selector Strip (The 3 Designs from Gemini) */}
      <div className="h-8 bg-[#252526] border-b border-[#2d2d2d] px-3 flex items-center justify-between font-mono text-xs select-none">
        <div className="flex items-center space-x-1">
          <span className="text-[#858585] text-[10px] uppercase font-bold mr-2 hidden md:inline">
            VIEWS:
          </span>

          <button
            onClick={() => setActiveScreen('workspace')}
            className={`h-7 px-2.5 rounded flex items-center gap-1.5 transition-all cursor-pointer ${
              activeScreen === 'workspace'
                ? 'bg-[#37373d] text-white font-bold border border-[#007acc]'
                : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-[#569cd6]" />
            <span>1. MAIN WORKSPACE (IDE)</span>
          </button>

          <button
            onClick={() => setActiveScreen('models')}
            className={`h-7 px-2.5 rounded flex items-center gap-1.5 transition-all cursor-pointer ${
              activeScreen === 'models'
                ? 'bg-[#37373d] text-white font-bold border border-[#007acc]'
                : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#4ec9b0]" />
            <span>2. MODEL MANAGEMENT &amp; AUDIT</span>
          </button>

          <button
            onClick={() => setActiveScreen('workflow')}
            className={`h-7 px-2.5 rounded flex items-center gap-1.5 transition-all cursor-pointer ${
              activeScreen === 'workflow'
                ? 'bg-[#37373d] text-white font-bold border border-[#007acc]'
                : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e]'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5 text-[#ce9178]" />
            <span>3. WORKFLOW &amp; KNOWLEDGE BASE</span>
          </button>

          <button
            onClick={() => setActiveScreen('composite')}
            className={`h-7 px-2.5 rounded flex items-center gap-1.5 transition-all cursor-pointer ${
              activeScreen === 'composite'
                ? 'bg-[#37373d] text-white font-bold border border-[#007acc]'
                : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#dcb67a]" />
            <span>3-WINDOW COMPOSITE VIEW</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[10px] text-[#4ec9b0] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ec9b0]"></span>
          <span>AIR-GAPPED · LOCAL GPU WORKSTATION</span>
        </div>
      </div>

      {/* 3. Screen Viewport */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {activeScreen === 'workspace' && <MainWorkspaceView />}
        {activeScreen === 'models' && <ModelManagementView />}
        {activeScreen === 'workflow' && <WorkflowKnowledgeView />}
        {activeScreen === 'composite' && (
          <CompositeOverviewView onSelectView={(v) => setActiveScreen(v)} />
        )}
      </div>

      {/* 4. Bottom IDE Status Bar */}
      <AntigravityStatusBar />

      {/* 5. Modals */}
      <CommandPalette onRunScenario={(_prompt, _file) => runIndustrialDemo('inspection')} />
      <SecurityStatusModal />
    </div>
  );
};
