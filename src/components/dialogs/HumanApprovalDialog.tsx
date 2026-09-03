import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, FileText, Calculator, Terminal, X } from 'lucide-react';

interface HumanApprovalDialogProps {
  isOpen: boolean;
  actionTitle: string;
  actionType: 'calculation' | 'code_execution' | 'document_generation' | 'local_write';
  targetResource: string;
  details: string;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}

export const HumanApprovalDialog: React.FC<HumanApprovalDialogProps> = ({
  isOpen,
  actionTitle,
  actionType,
  targetResource,
  details,
  onApprove,
  onReject,
  onClose
}) => {
  if (!isOpen) return null;

  const getActionIcon = () => {
    switch (actionType) {
      case 'calculation': return <Calculator className="w-4 h-4 text-[#cca700]" />;
      case 'code_execution': return <Terminal className="w-4 h-4 text-[#f14c4c]" />;
      case 'document_generation': return <FileText className="w-4 h-4 text-[#569cd6]" />;
      default: return <AlertTriangle className="w-4 h-4 text-[#cca700]" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-none flex items-center justify-center p-4 z-50 select-none">
      <div className="w-full max-w-lg bg-[#252526] border border-[#007acc] rounded shadow-2xl overflow-hidden font-mono text-xs">
        {/* VS Code Dialog Titlebar */}
        <div className="bg-[#323233] border-b border-[#2d2d2d] px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#cca700]" />
            <span className="font-bold text-[#cccccc] text-[11px] uppercase">
              Human Approval Safety Gate
            </span>
          </div>
          <button onClick={onClose} className="text-[#858585] hover:text-[#cccccc]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3 text-xs text-[#cccccc]">
          <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded p-2.5 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#569cd6]">
              {getActionIcon()}
              <span>{actionTitle}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px] text-[#858585] pt-1 border-t border-[#2d2d2d]">
              <div>TARGET: <span className="text-[#cccccc]">{targetResource}</span></div>
              <div>STANDARD: <span className="text-[#4ec9b0]">SOP-OPS-014 / API 570</span></div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase text-[#858585] font-bold block">
              Operation Scope:
            </span>
            <div className="p-2.5 bg-[#181818] border border-[#2d2d2d] rounded text-[11px] text-[#cccccc] font-sans leading-relaxed">
              {details}
            </div>
          </div>

          <div className="text-[10px] text-[#858585] italic font-sans">
            * Authorizing will execute the deterministic calculation and compile the formal Word approval deliverable on-premise.
          </div>
        </div>

        {/* Action Buttons in VS Code style */}
        <div className="bg-[#1e1e1e] border-t border-[#2d2d2d] px-4 py-2.5 flex items-center justify-end gap-2">
          <button
            onClick={onReject}
            className="px-3 py-1 rounded bg-[#333333] hover:bg-[#444444] text-[#cccccc] border border-[#3c3c3c] text-xs transition-all flex items-center gap-1"
          >
            <XCircle className="w-3.5 h-3.5 text-[#f14c4c]" />
            <span>Reject</span>
          </button>
          <button
            onClick={onApprove}
            className="px-4 py-1 rounded bg-[#007acc] hover:bg-[#1f8ad2] text-white font-bold text-xs transition-all flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Authorize &amp; Execute</span>
          </button>
        </div>
      </div>
    </div>
  );
};
