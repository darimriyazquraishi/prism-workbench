import React, { useState } from 'react';
import { 
  FolderArchive, 
  Download, 
  CheckCircle2, 
  FileText, 
  Check, 
  Clock, 
  FileSpreadsheet, 
  Presentation,
  FileCode
} from 'lucide-react';
import type { ArtifactRecord } from '../../types';

interface DeliverableItem extends ArtifactRecord {
  signOffBy?: string;
  signOffDate?: string;
  standardsCited: string[];
}

const initialDeliverables: DeliverableItem[] = [
  {
    artifact_id: 'ART-DOCX-001',
    file_name: 'Approval_Note_Unit5_Inspection.docx',
    file_type: 'docx',
    file_path: '/static/artifacts/Approval_Note_Unit5_Inspection.docx',
    size_bytes: 42350,
    created_at: '2026-02-15T14:32:00Z',
    approval_status: 'draft',
    description: 'Technical approval note for Crude Column Feed Line P-102 with API 570 wall thinning calculation (0.343 mm/yr) and formal engineering sign-off block.',
    standardsCited: ['SOP-OPS-014 Rev 4', 'API 570', 'ASME B31.3']
  },
  {
    artifact_id: 'ART-XLSX-002',
    file_name: 'Pump_Reliability_Analysis_2026.xlsx',
    file_type: 'xlsx',
    file_path: '/static/artifacts/Pump_Reliability_Analysis_2026.xlsx',
    size_bytes: 28400,
    created_at: '2026-02-15T14:15:00Z',
    approval_status: 'approved',
    signOffBy: 'P. Nair (Lead Reliability Eng)',
    signOffDate: '15-Feb-2026',
    description: 'Reliability metrics workbook with monthly MTBF, Weibull failure rate calculations, and turnaround spares recommendations computed in Docker sandbox.',
    standardsCited: ['ISO 14224', 'API 610']
  },
  {
    artifact_id: 'ART-PPTX-003',
    file_name: 'Executive_Briefing_CDU5.pptx',
    file_type: 'pptx',
    file_path: '/static/artifacts/Executive_Briefing_CDU5.pptx',
    size_bytes: 65100,
    created_at: '2026-02-15T13:50:00Z',
    approval_status: 'draft',
    description: 'PowerPoint briefing deck summarizing multimodal P&ID findings, degraded piping spools, and turnaround replacement schedule for engineering management.',
    standardsCited: ['MRPL Turnaround SOP-2026']
  }
];

export const DeliverablesView: React.FC = () => {
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>(initialDeliverables);
  const [selectedItem, setSelectedItem] = useState<DeliverableItem>(initialDeliverables[0]);

  const toggleApproval = (id: string) => {
    setDeliverables(deliverables.map(d => {
      if (d.artifact_id === id) {
        const nextStatus = d.approval_status === 'draft' ? 'approved' : 'draft';
        const updated = {
          ...d,
          approval_status: nextStatus as any,
          signOffBy: nextStatus === 'approved' ? 'Chief Inspection Engineer' : undefined,
          signOffDate: nextStatus === 'approved' ? '15-Feb-2026' : undefined
        };
        if (selectedItem.artifact_id === id) setSelectedItem(updated);
        return updated;
      }
      return d;
    }));
  };

  const getFormatIcon = (type: string) => {
    switch (type) {
      case 'docx': return <FileText className="w-5 h-5 text-[#569cd6]" />;
      case 'xlsx': return <FileSpreadsheet className="w-5 h-5 text-[var(--status-healthy)]" />;
      case 'pptx': return <Presentation className="w-5 h-5 text-[var(--status-attention)]" />;
      default: return <FileCode className="w-5 h-5 text-[var(--text-primary)]" />;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 font-sans text-sm overflow-hidden">
      {/* 1. TOP TOOLBAR */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 select-none flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono font-bold text-[var(--text-primary)] text-sm">
            <FolderArchive className="w-5 h-5 text-[var(--status-healthy)]" />
            <span>Business Deliverables Gallery:</span>
            <span className="text-[#9cdcfe]">{deliverables.length} Deliverables Ready</span>
          </div>
        </div>

        <div className="text-xs font-mono text-[var(--text-secondary)]">
          Formats: Word (.docx), Excel (.xlsx), PowerPoint (.pptx)
        </div>
      </div>

      {/* 2. MAIN 2-PANE WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left: Table (7 Cols) */}
        <div className="lg:col-span-7 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg flex flex-col overflow-hidden shadow-sm">
          <div className="h-9 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] px-4 flex items-center justify-between font-mono text-xs text-[var(--text-secondary)] flex-shrink-0">
            <span>REPOSITORY DELIVERABLES</span>
            <span>CLICK ROW TO REVIEW &amp; STAMP</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-[var(--bg-primary)] text-xs uppercase text-[var(--text-secondary)] border-b border-[var(--border-subtle)] font-mono">
                <tr>
                  <th className="py-3 px-4">Deliverable File</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Sign-Off Status</th>
                  <th className="py-3 px-4 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]">
                {deliverables.map((item) => {
                  const isSelected = selectedItem.artifact_id === item.artifact_id;
                  const isApproved = item.approval_status === 'approved';

                  return (
                    <tr
                      key={item.artifact_id}
                      onClick={() => setSelectedItem(item)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#37373d]' : 'hover:bg-[#2a2d2e]'
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                        <div className="flex items-center gap-2.5">
                          {getFormatIcon(item.file_type)}
                          <span className="truncate max-w-[200px] text-sm">{item.file_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 uppercase text-[var(--text-secondary)] font-mono text-xs">{item.file_type}</td>
                      <td className="py-3 px-4 text-[var(--text-secondary)] font-mono text-xs">{(item.size_bytes / 1024).toFixed(1)} KB</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2.5 py-1 rounded border font-semibold inline-flex items-center gap-1.5 font-mono ${
                          isApproved
                            ? 'bg-[#1f3a2b] text-[var(--status-healthy)] border-[#2e5d44]'
                            : 'bg-[#332a00] text-[#cca700] border-[#cca700]'
                        }`}>
                          {isApproved ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {isApproved ? 'APPROVED' : 'DRAFT'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={item.file_path}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 rounded-md bg-[var(--accent-fuchsia)] hover:bg-[#1f8ad2] text-[var(--text-primary)] text-xs font-bold inline-flex items-center gap-1 shadow"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>GET</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Inspector (5 Cols) */}
        <div className="lg:col-span-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-5 flex flex-col space-y-4 overflow-y-auto font-sans text-xs shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 text-sm uppercase font-bold text-[var(--text-primary)]">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#569cd6]" />
              Deliverable Metadata &amp; Sign-Off
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">{selectedItem.artifact_id}</span>
          </div>

          <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2.5">
              {getFormatIcon(selectedItem.file_type)}
              <div className="font-bold text-[var(--text-primary)] text-sm truncate">
                {selectedItem.file_name}
              </div>
            </div>
            <p className="text-xs text-[var(--text-primary)] leading-relaxed">
              {selectedItem.description}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-mono text-[var(--text-secondary)] uppercase font-bold">Cited Governing Standards:</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedItem.standardsCited.map((std, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded bg-[var(--bg-primary)] text-[#9cdcfe] border border-[var(--border-subtle)] text-xs font-mono">
                  {std}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--text-secondary)] uppercase font-bold">Review Status:</span>
              <span className={`text-xs font-mono px-2.5 py-0.5 rounded font-bold ${
                selectedItem.approval_status === 'approved'
                  ? 'bg-[#1f3a2b] text-[var(--status-healthy)] border border-[#2e5d44]'
                  : 'bg-[#332a00] text-[#cca700] border border-[#cca700]'
              }`}>
                {selectedItem.approval_status.toUpperCase()}
              </span>
            </div>

            {selectedItem.signOffBy ? (
              <div className="bg-[#181818] p-3 rounded-md text-xs text-[var(--text-primary)] space-y-1 font-mono">
                <div>Authority: <span className="text-[var(--status-healthy)] font-bold">{selectedItem.signOffBy}</span></div>
                <div>Date: <span className="text-[var(--text-secondary)]">{selectedItem.signOffDate}</span></div>
              </div>
            ) : (
              <div className="text-xs text-[var(--text-secondary)] italic">
                Awaiting digital approval stamp from Lead Inspection Engineer.
              </div>
            )}

            <button
              onClick={() => toggleApproval(selectedItem.artifact_id)}
              className={`w-full py-2.5 rounded-md text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow ${
                selectedItem.approval_status === 'approved'
                  ? 'bg-[#4a1818] hover:bg-[#602020] text-[#f14c4c] border border-[#f14c4c]'
                  : 'bg-[#1f3a2b] hover:bg-[#2e5d44] text-[var(--status-healthy)] border border-[var(--status-healthy)]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {selectedItem.approval_status === 'approved' ? 'Revoke Approval (Set to Draft)' : 'Approve & Digitally Stamp Deliverable'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
