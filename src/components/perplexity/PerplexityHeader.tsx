import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Globe, 
  Image as ImageIcon, 
  MoreHorizontal, 
  Share2, 
  Terminal as TerminalIcon, 
  Download, 
  Pin, 
  Plus, 
  Edit3, 
  FileDown, 
  Trash2, 
  Check,
  PanelLeftOpen,
  Cpu,
  Settings,
  AlertCircle
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

interface PerplexityHeaderProps {
  activeView: 'answer' | 'links' | 'images';
  onViewChange: (view: 'answer' | 'links' | 'images') => void;
  title?: string;
}

export const PerplexityHeader: React.FC<PerplexityHeaderProps> = ({ 
  activeView, 
  onViewChange,
  title = 'Sovereign Industrial AI Workbench'
}) => {
  const { 
    isSidebarOpen, 
    toggleSidebar, 
    isBottomPanelOpen, 
    setBottomPanelOpen,
    activeTask,
    selectedModel,
    setSettingsOpen,
    setSettingsTab,
    userProfile
  } = useWorkbenchStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <header className="h-12 bg-[#191A1A] border-b border-[#242627] px-4 flex items-center justify-between select-none flex-shrink-0 z-20 font-sans text-xs">
      {/* Left Tabs Area */}
      <div className="flex items-center gap-1 h-full">
        {/* Sidebar Toggle when collapsed */}
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            title="Expand Sidebar"
            className="mr-2 p-1.5 rounded-lg hover:bg-[#202222] text-[#858A8E] hover:text-white transition-colors cursor-pointer"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        {/* View Mode Tabs: Answer, Links, Images */}
        <div className="flex items-center gap-1 h-full">
          {/* Answer Tab */}
          <button
            onClick={() => onViewChange('answer')}
            className={`h-full flex items-center gap-1.5 px-3 font-medium transition-all cursor-pointer relative ${
              activeView === 'answer'
                ? 'text-white font-semibold'
                : 'text-[#858A8E] hover:text-[#D1D5DB]'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeView === 'answer' ? 'text-[#20B8CD]' : 'text-[#858A8E]'}`} />
            <span>Answer</span>
            {activeView === 'answer' && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#20B8CD] rounded-full" />
            )}
          </button>

          {/* Links Tab */}
          <button
            onClick={() => onViewChange('links')}
            className={`h-full flex items-center gap-1.5 px-3 font-medium transition-all cursor-pointer relative ${
              activeView === 'links'
                ? 'text-white font-semibold'
                : 'text-[#858A8E] hover:text-[#D1D5DB]'
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${activeView === 'links' ? 'text-[#20B8CD]' : 'text-[#858A8E]'}`} />
            <span>Links</span>
            {activeView === 'links' && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#20B8CD] rounded-full" />
            )}
          </button>

          {/* Images Tab */}
          <button
            onClick={() => onViewChange('images')}
            className={`h-full flex items-center gap-1.5 px-3 font-medium transition-all cursor-pointer relative ${
              activeView === 'images'
                ? 'text-white font-semibold'
                : 'text-[#858A8E] hover:text-[#D1D5DB]'
            }`}
          >
            <ImageIcon className={`w-3.5 h-3.5 ${activeView === 'images' ? 'text-[#20B8CD]' : 'text-[#858A8E]'}`} />
            <span>Images</span>
            {activeView === 'images' && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#20B8CD] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Right Actions Area: More Menu (...), Share, Computer Mode */}
      <div className="flex items-center gap-2">
        {/* Active Local Model Pill */}
        {selectedModel ? (
          <button
            onClick={() => { setSettingsOpen(true); setSettingsTab('models'); }}
            title="Active Local Model - Click to configure"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#202222] hover:bg-[#282A2C] border border-[#2E3133] hover:border-[#3D4143] text-[11px] text-[#A2A8AB] font-mono transition-colors cursor-pointer"
          >
            <Cpu className="w-3 h-3 text-[#20B8CD]" />
            <span className="text-white font-sans">{selectedModel}</span>
          </button>
        ) : (
          <button
            onClick={() => { setSettingsOpen(true); setSettingsTab('models'); }}
            title="No model selected - Click to select a model in Settings"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#262020] hover:bg-[#322424] border border-[#522929] hover:border-[#7A3F3F] text-[11px] text-[#E58888] font-mono transition-colors cursor-pointer"
          >
            <AlertCircle className="w-3 h-3 text-[#E58888]" />
            <span>No model selected</span>
          </button>
        )}

        {/* ... More Actions Dropdown Menu (Matches WhatsApp Image 2026-09-04 at 8.52.50 PM.jpeg) */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            title="Session actions"
            className="p-1.5 rounded-lg hover:bg-[#202222] text-[#858A8E] hover:text-white transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#1C1D1E] border border-[#2E3133] rounded-2xl p-2.5 shadow-2xl z-50 text-xs text-[#A2A8AB] space-y-2">
              {/* Header inside popup */}
              <div className="p-2 border-b border-[#2A2C2E] space-y-1">
                <div className="font-semibold text-white truncate text-[12px]">
                  {title}
                </div>
                <div className="flex justify-between text-[10px] text-[#5F6467]">
                  <span>Created by {userProfile?.displayName || 'Local User'} (You)</span>
                  <span>Today</span>
                </div>
              </div>

              {/* Action List */}
              <div className="space-y-0.5">
                <button 
                  onClick={() => {
                    setSettingsOpen(true);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[#262829] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-[#20B8CD]" />
                  <span>Workbench Settings...</span>
                </button>

                <button 
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[#262829] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>Pin</span>
                </button>

                <button 
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[#262829] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to project</span>
                </button>

                <button 
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[#262829] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Rename Session</span>
                </button>

                <div className="h-px bg-[#262829] my-1" />

                <button 
                  onClick={() => {
                    window.print();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[#262829] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#20B8CD]" />
                  <span>Export as PDF</span>
                </button>

                <button 
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[#262829] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#20B8CD]" />
                  <span>Export as Markdown</span>
                </button>

                <button 
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[#262829] hover:text-white transition-colors text-left cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#20B8CD]" />
                  <span>Export as DOCX</span>
                </button>

                <div className="h-px bg-[#262829] my-1" />

                <button 
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-colors text-left cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202222] hover:bg-[#282A2C] border border-[#2E3133] text-white font-medium text-xs transition-colors cursor-pointer"
        >
          {copiedShare ? <Check className="w-3 h-3 text-[#20B8CD]" /> : <Share2 className="w-3 h-3" />}
          <span>{copiedShare ? 'Copied' : 'Share'}</span>
        </button>

        {/* Computer / Terminal Mode Toggle Button */}
        <button
          onClick={() => setBottomPanelOpen(!isBottomPanelOpen)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
            isBottomPanelOpen
              ? 'bg-[#20B8CD] text-black border-[#20B8CD] font-semibold'
              : 'bg-[#202222] hover:bg-[#282A2C] text-white border-[#2E3133]'
          }`}
          title="Toggle Computer / Terminal Execution Pane"
        >
          <TerminalIcon className="w-3 h-3" />
          <span>Computer</span>
        </button>
      </div>
    </header>
  );
};
