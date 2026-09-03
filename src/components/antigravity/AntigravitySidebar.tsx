import React from 'react';
import { 
  Plus, 
  Bot, 
  BookOpen, 
  ChevronDown, 
  Wrench, 
  CheckCircle2
} from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';

export const AntigravitySidebar: React.FC = () => {
  const { 
    sessions, 
    activeSessionId, 
    createNewSession, 
    selectSession,
    skills,
    knowledgeItems,
    setActiveRightTab,
    setRightPaneOpen
  } = useAntigravityStore();

  return (
    <aside className="w-60 bg-[#252526] border-r border-[#2d2d2d] flex flex-col font-sans select-none flex-shrink-0 text-xs">
      {/* Top: New Session Button */}
      <div className="p-2.5 border-b border-[#2d2d2d]">
        <button
          onClick={() => createNewSession()}
          className="w-full py-1.5 px-3 rounded bg-[#007acc] hover:bg-[#1f8ad2] text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Agent Task</span>
        </button>
      </div>

      {/* Main Sidebar Sections */}
      <div className="flex-1 p-2 space-y-3 overflow-y-auto">
        {/* Section 1: Recent Sessions */}
        <div>
          <div className="px-2 py-1 text-[10px] font-mono font-bold text-[#858585] uppercase tracking-wider flex items-center gap-1">
            <ChevronDown className="w-3 h-3" />
            <span>Agent Sessions ({sessions.length})</span>
          </div>

          <div className="space-y-0.5 mt-0.5 font-sans">
            {sessions.map((sess) => {
              const isActive = sess.id === activeSessionId;
              return (
                <button
                  key={sess.id}
                  onClick={() => selectSession(sess.id)}
                  className={`w-full p-2 rounded text-left transition-all flex items-start gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#37373d] text-white font-medium border-l-2 border-[#007acc]'
                      : 'text-[#cccccc] hover:text-white hover:bg-[#2a2d2e] border-l-2 border-transparent'
                  }`}
                >
                  <Bot className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${isActive ? 'text-[#569cd6]' : 'text-[#858585]'}`} />
                  <div className="truncate flex-1">
                    <div className="text-xs truncate leading-tight">{sess.title}</div>
                    <div className="text-[10px] font-mono text-[#858585] mt-0.5">{sess.createdAt}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Local Agent Skills */}
        <div>
          <div className="px-2 py-1 text-[10px] font-mono font-bold text-[#858585] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ChevronDown className="w-3 h-3" />
              <span>Local Skills</span>
            </span>
            <span className="text-[#4ec9b0] font-mono font-bold">{skills.length} Loaded</span>
          </div>

          <div className="space-y-1 mt-0.5 font-mono text-[11px]">
            {skills.map((sk) => (
              <div
                key={sk.id}
                className="p-2 rounded bg-[#1e1e1e] border border-[#2d2d2d] space-y-0.5"
              >
                <div className="flex items-center justify-between text-[#cccccc]">
                  <span className="font-bold text-[#9cdcfe] flex items-center gap-1.5 truncate">
                    <Wrench className="w-3 h-3 text-[#569cd6] flex-shrink-0" />
                    <span className="truncate">{sk.name}</span>
                  </span>
                  <span className="text-[9px] text-[#4ec9b0]">LOCAL</span>
                </div>
                <div className="text-[10px] text-[#858585] font-sans truncate">
                  {sk.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Knowledge Items (KIs) */}
        <div>
          <div className="px-2 py-1 text-[10px] font-mono font-bold text-[#858585] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ChevronDown className="w-3 h-3" />
              <span>Knowledge Items</span>
            </span>
            <span className="text-[#569cd6] font-mono">{knowledgeItems.length} Index</span>
          </div>

          <div className="space-y-0.5 mt-0.5 font-sans text-xs">
            {knowledgeItems.map((ki) => (
              <button
                key={ki.id}
                onClick={() => {
                  setActiveRightTab('rag_knowledge');
                  setRightPaneOpen(true);
                }}
                className="w-full p-2 rounded hover:bg-[#2a2d2e] text-left transition-colors cursor-pointer text-[#858585] hover:text-white"
              >
                <div className="flex items-center gap-2 font-mono text-xs text-[#cccccc] font-semibold truncate">
                  <BookOpen className="w-3.5 h-3.5 text-[#569cd6] flex-shrink-0" />
                  <span className="truncate">{ki.title}</span>
                </div>
                <div className="text-[10px] text-[#858585] truncate mt-0.5">
                  {ki.totalChunks} Chunks (768-D)
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Node info */}
      <div className="p-2.5 border-t border-[#2d2d2d] bg-[#1e1e1e] font-mono text-[10px] text-[#858585]">
        <div className="flex items-center justify-between text-[#4ec9b0]">
          <span className="flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            SOVEREIGN WORKSPACE
          </span>
          <span>AIR-GAPPED</span>
        </div>
      </div>
    </aside>
  );
};
