import React, { useState } from 'react';
import { 
  Paperclip, 
  X, 
  Play
} from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';

interface AntigravityComposerProps {
  onRunDemo: (type: 'inspection' | 'pump_mtbf' | 'pid_vision' | 'sop_search') => void;
}

export const AntigravityComposer: React.FC<AntigravityComposerProps> = ({ onRunDemo }) => {
  const { 
    isExecuting, 
    attachedFiles, 
    attachFile, 
    removeAttachedFile, 
    clearAttachments,
    selectedModel,
    activeMode
  } = useAntigravityStore();

  const [inputPrompt, setInputPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isExecuting) return;
    setInputPrompt('');
    clearAttachments();
    onRunDemo('inspection');
  };

  return (
    <div className="border-t border-[#2d2d2d] bg-[#252526] p-3 md:p-3.5 flex-shrink-0 font-sans text-xs">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-2">
        {/* Attachment Chips Bar */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pb-0.5 font-mono text-xs">
            <span className="text-[#858585]">Target Files:</span>
            {attachedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#3c3c3c] text-[#cccccc]">
                <Paperclip className="w-3 h-3 text-[#569cd6]" />
                <span>{file.split('/').pop()}</span>
                <button
                  type="button"
                  onClick={() => removeAttachedFile(file)}
                  className="text-[#858585] hover:text-white ml-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Rich Input Box */}
        <div className="bg-[#1e1e1e] border border-[#3c3c3c] focus-within:border-[#007acc] rounded transition-all shadow-sm overflow-hidden">
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask your local sovereign agent to analyze documents, execute Python math, inspect P&IDs, or generate deliverables..."
            rows={2}
            className="w-full bg-transparent border-none py-2.5 px-3.5 text-xs text-[#cccccc] placeholder-[#666666] focus:outline-none resize-none font-sans"
          />

          {/* Bottom Toolbar inside composer */}
          <div className="px-3 py-1.5 bg-[#252526] border-t border-[#2d2d2d] flex items-center justify-between font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => attachFile('demo/synthetic/Inspection_Report_001.pdf')}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#333333] text-[#858585] hover:text-white transition-colors cursor-pointer"
              >
                <Paperclip className="w-3 h-3" />
                <span>Attach File</span>
              </button>

              <span className="text-[#454545]">|</span>

              <span className="text-[#569cd6] uppercase font-bold">{activeMode} MODE</span>
              <span className="text-[#454545]">·</span>
              <span className="text-[#858585] truncate max-w-[140px]">{selectedModel.split(' ')[0]}</span>
            </div>

            <button
              type="submit"
              disabled={isExecuting || !inputPrompt.trim()}
              className={`px-3.5 py-1 rounded text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isExecuting || !inputPrompt.trim()
                  ? 'bg-[#333333] text-[#666666] cursor-not-allowed'
                  : 'bg-[#007acc] hover:bg-[#1f8ad2] text-white shadow-sm'
              }`}
            >
              {isExecuting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Orchestrating...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-white" />
                  <span>Execute</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-[#858585] px-1">
          <span>Commands: /plan, /ocr, /calc, /rag, /sandbox</span>
          <span className="text-[#4ec9b0] font-semibold">● Host Isolated · Zero Cloud Leak</span>
        </div>
      </form>
    </div>
  );
};
