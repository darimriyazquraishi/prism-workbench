import React, { useState, useMemo } from 'react';
import { 
  FolderArchive, 
  Download, 
  CheckCircle2, 
  FileText, 
  Check, 
  Clock, 
  FileSpreadsheet, 
  Presentation,
  FileCode,
  Eye,
  Maximize2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { ArtifactRecord } from '../../types';
import type { ArtifactItem } from '../../types/antigravity';
import { useAntigravityStore } from '../../store/useAntigravityStore';

interface DeliverableItem extends ArtifactRecord {
  signOffBy?: string;
  signOffDate?: string;
  standardsCited: string[];
  rawArtifact?: ArtifactItem;
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
    standardsCited: ['SOP-OPS-014 Rev 4', 'API 570', 'ASME B31.3'],
    rawArtifact: {
      id: 'ART-DOCX-001',
      name: 'Approval_Note_Unit5_Inspection.docx',
      type: 'docx',
      path: '/static/artifacts/Approval_Note_Unit5_Inspection.docx',
      sizeBytes: 42350,
      description: 'Technical approval note for Crude Column Feed Line P-102 with API 570 wall thinning calculation.',
      createdAt: '15-Feb-2026',
      approvalStatus: 'draft',
      structuredDocx: {
        documentTitle: 'Crude Distillation Unit (CDU-5) Inspection & Replacement Approval Note',
        documentType: 'Engineering Technical Note',
        metadata: {
          'Unit Area': 'Crude Distillation Unit 5',
          'Component': 'Line P-102 Feed Spool',
          'Inspection Standard': 'API 570 / ASME B31.3',
          'Classification': 'Confidential - Air-Gapped'
        },
        executiveSummary: 'Non-destructive ultrasonic thickness measurement conducted on crude transfer line P-102 revealed localized internal corrosion rate of 0.343 mm/year, exceeding maximum allowable threshold under SOP-OPS-014. Immediate turnaround spool replacement authorized.',
        sections: [
          {
            heading: 'Ultrasonic Testing Findings',
            paragraphs: ['Nominal wall thickness reduced from 9.52 mm to 4.18 mm at elbow junction downstream of control valve CV-104.'],
            bulletPoints: ['Point A (Upstream): 8.9 mm remaining', 'Point B (Intrados Elbow): 4.18 mm remaining (Critical)', 'Point C (Extrados Elbow): 6.12 mm remaining'],
            keyMetrics: { 'Nominal Thickness': '9.52 mm', 'Current Thickness': '4.18 mm', 'Retirement Thickness': '4.00 mm', 'Corrosion Rate': '0.343 mm/yr' }
          },
          {
            heading: 'Corrective Action & Procurement',
            paragraphs: ['Issue urgent procurement requisition for 8" Schedule 80 ASTM A106 Grade B carbon steel replacement spool with post-weld heat treatment.'],
            bulletPoints: ['Schedule spool fabrication for Turnaround Window Q2', 'Hydrostatic test at 1.5x design pressure (37.5 bar)', 'Full radiographic examination on all field butt welds']
          }
        ],
        signOffBlock: {
          preparedBy: 'Chief Inspection Engineer',
          verifiedBy: 'Sovereign Antigravity AI Engine',
          status: 'RECOMMENDED FOR APPROVAL'
        }
      }
    }
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
    standardsCited: ['ISO 14224', 'API 610'],
    rawArtifact: {
      id: 'ART-XLSX-002',
      name: 'Pump_Reliability_Analysis_2026.xlsx',
      type: 'xlsx',
      path: '/static/artifacts/Pump_Reliability_Analysis_2026.xlsx',
      sizeBytes: 28400,
      description: 'Reliability metrics workbook with monthly MTBF.',
      createdAt: '15-Feb-2026',
      approvalStatus: 'approved',
      structuredXlsx: {
        workbookTitle: 'CDU-5 Process Pumps Reliability Model',
        summary: 'Calculated MTBF and Weibull reliability parameters for 12 primary crude transfer pumps.',
        sheets: [
          {
            name: 'P-102 Pump Spares',
            purpose: 'Itemized material & turnaround replacement cost schedule',
            headers: ['Item #', 'Description', 'Spec / Grade', 'Qty', 'Unit Cost (USD)', 'Total (USD)'],
            rows: [
              ['1', '8" Sch 80 Pipe Spool', 'ASTM A106 Gr B', 2, 4800, 9600],
              ['2', '8" 300# WNRF Flanges', 'ASTM A105', 4, 900, 3600],
              ['3', 'Spiral Wound Gaskets', '316SS / Graphite', 4, 150, 600],
              ['4', 'Studs & Nuts B7/2H', 'ASTM A193', 32, 25, 800],
              ['5', 'Radiography & NDT', 'ASME Sec V', 1, 2200, 2200]
            ],
            formulas: ['SUBTOTAL = SUM(F2:F6) = $16,800', 'CONTINGENCY (15%) = $2,520', 'TOTAL ESTIMATE = $19,320']
          }
        ]
      }
    }
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
    standardsCited: ['MRPL Turnaround SOP-2026'],
    rawArtifact: {
      id: 'ART-PPTX-003',
      name: 'Executive_Briefing_CDU5.pptx',
      type: 'pptx',
      path: '/static/artifacts/Executive_Briefing_CDU5.pptx',
      sizeBytes: 65100,
      description: 'PowerPoint briefing deck summarizing multimodal P&ID findings.',
      createdAt: '15-Feb-2026',
      approvalStatus: 'draft',
      slideCount: 3,
      slides: [
        {
          title: 'CDU-5 Turnaround Briefing: Feed Line Degradation',
          purpose: 'Executive Orientation',
          bullets: [
            'Ultrasonic inspection confirms accelerated wall thinning on Crude Feed Line P-102',
            'Corrosion rate measured at 0.343 mm/year vs 0.120 mm/year design allowance',
            'Immediate spool replacement required prior to high-sulfur crude campaign'
          ],
          notes: 'Present to refinery general manager and operations director during morning briefing.'
        },
        {
          title: 'Inspection Findings & Remaining Life Calculation',
          purpose: 'Technical Data',
          bullets: [
            'Nominal wall thickness: 9.52 mm (8" Schedule 80 A106-B)',
            'Measured critical minimum: 4.18 mm at intrados of first 90° elbow',
            'Calculated remaining operating life without repair: 0.52 years'
          ],
          notes: 'Reference API 570 Section 7.1 calculation methodologies.'
        },
        {
          title: 'Turnaround Action Plan & Budget Impact',
          purpose: 'Decision Request',
          bullets: [
            'Procurement initiated for replacement spool assembly ($19,320 total)',
            'Pre-fabrication and hydrotesting scheduled 3 weeks ahead of turnaround',
            'Zero unplanned downtime expected if replacement executed in planned window'
          ],
          notes: 'Request approval for emergency procurement authorization code TA-2026-08.'
        }
      ]
    }
  }
];

export const DeliverablesView: React.FC = () => {
  const { allArtifacts, setActivePreviewArtifact } = useAntigravityStore();

  const [localDeliverables, setLocalDeliverables] = useState<DeliverableItem[]>(initialDeliverables);
  const [selectedId, setSelectedId] = useState<string>(initialDeliverables[0].artifact_id);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);

  // Merge live artifacts from current Antigravity store session with local deliverables
  const mergedDeliverables = useMemo(() => {
    const liveItems: DeliverableItem[] = allArtifacts.map((art) => ({
      artifact_id: art.id,
      file_name: art.name,
      file_type: art.type as any,
      file_path: art.path,
      size_bytes: art.sizeBytes,
      created_at: art.createdAt,
      approval_status: art.approvalStatus || 'draft',
      description: art.description,
      standardsCited: ['Air-Gapped Sovereign AI Verification', 'Local Model Contract'],
      rawArtifact: art
    }));

    // Put new live items first, avoid duplicate IDs
    const liveIds = new Set(liveItems.map(i => i.artifact_id));
    const keptLocal = localDeliverables.filter(i => !liveIds.has(i.artifact_id));
    return [...liveItems, ...keptLocal];
  }, [allArtifacts, localDeliverables]);

  const selectedItem = mergedDeliverables.find(d => d.artifact_id === selectedId) || mergedDeliverables[0];

  const toggleApproval = (id: string) => {
    setLocalDeliverables(prev => prev.map(d => {
      if (d.artifact_id === id) {
        const nextStatus = d.approval_status === 'draft' ? 'approved' : 'draft';
        return {
          ...d,
          approval_status: nextStatus as any,
          signOffBy: nextStatus === 'approved' ? 'Chief Inspection Engineer' : undefined,
          signOffDate: nextStatus === 'approved' ? new Date().toLocaleDateString() : undefined
        };
      }
      return d;
    }));
  };

  const openFullPreview = (item: DeliverableItem) => {
    if (item.rawArtifact) {
      setActivePreviewArtifact(item.rawArtifact);
    } else {
      setActivePreviewArtifact({
        id: item.artifact_id,
        name: item.file_name,
        type: (item.file_type as any) || 'docx',
        path: item.file_path,
        sizeBytes: item.size_bytes,
        description: item.description,
        createdAt: item.created_at,
        approvalStatus: item.approval_status as any
      });
    }
  };

  const getFormatIcon = (type: string) => {
    switch (type) {
      case 'docx': return <FileText className="w-5 h-5 text-[#569cd6]" />;
      case 'xlsx': return <FileSpreadsheet className="w-5 h-5 text-[var(--status-healthy)]" />;
      case 'pptx': return <Presentation className="w-5 h-5 text-[var(--status-attention)]" />;
      default: return <FileCode className="w-5 h-5 text-purple-400" />;
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
            <span className="text-[#9cdcfe]">{mergedDeliverables.length} Deliverables Available</span>
          </div>
        </div>

        <div className="text-xs font-mono text-[var(--text-secondary)] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Click any deliverable to preview and review before download</span>
        </div>
      </div>

      {/* 2. MAIN 2-PANE WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left: Table (6 Cols) */}
        <div className="lg:col-span-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg flex flex-col overflow-hidden shadow-sm">
          <div className="h-9 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] px-4 flex items-center justify-between font-mono text-xs text-[var(--text-secondary)] flex-shrink-0">
            <span>REPOSITORY DELIVERABLES</span>
            <span>SELECT TO PREVIEW &amp; STAMP</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-[var(--bg-primary)] text-xs uppercase text-[var(--text-secondary)] border-b border-[var(--border-subtle)] font-mono">
                <tr>
                  <th className="py-3 px-4">Deliverable</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Size</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]">
                {mergedDeliverables.map((item) => {
                  const isSelected = selectedItem?.artifact_id === item.artifact_id;
                  const isApproved = item.approval_status === 'approved';
                  const downloadHref = item.rawArtifact?.downloadUrl || `/api/download/${item.file_name}`;

                  return (
                    <tr
                      key={item.artifact_id}
                      onClick={() => {
                        setSelectedId(item.artifact_id);
                        setActiveSlideIdx(0);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#37373d]' : 'hover:bg-[#2a2d2e]'
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {getFormatIcon(item.file_type)}
                          <span className="truncate max-w-[170px] text-sm">{item.file_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 uppercase text-[var(--text-secondary)] font-mono text-xs">{item.file_type}</td>
                      <td className="py-3 px-3 text-[var(--text-secondary)] font-mono text-xs">{(item.size_bytes / 1024).toFixed(1)} KB</td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold inline-flex items-center gap-1 font-mono ${
                          isApproved
                            ? 'bg-[#1f3a2b] text-[var(--status-healthy)] border-[#2e5d44]'
                            : 'bg-[#332a00] text-[#cca700] border-[#cca700]'
                        }`}>
                          {isApproved ? <Check className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                          {isApproved ? 'APPROVED' : 'DRAFT'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openFullPreview(item);
                            }}
                            className="p-1.5 rounded bg-[var(--bg-elevated)] hover:bg-[var(--bg-base)] text-[var(--accent-primary)] hover:text-white transition-colors cursor-pointer"
                            title="Interactive Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={downloadHref}
                            download={item.file_name}
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1 rounded bg-[var(--accent-fuchsia)] hover:bg-[#1f8ad2] text-[var(--text-primary)] text-xs font-bold inline-flex items-center gap-1 shadow cursor-pointer"
                            title="Download Deliverable"
                          >
                            <Download className="w-3 h-3" />
                            <span>GET</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Live Interactive Deliverable Inspector & Preview (6 Cols) */}
        {selectedItem && (
          <div className="lg:col-span-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 flex flex-col space-y-3 overflow-y-auto font-sans text-xs shadow-sm">
            
            {/* Header with Fullscreen Preview Button */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
              <div className="flex items-center gap-2 font-bold text-[var(--text-primary)] text-sm">
                {getFormatIcon(selectedItem.file_type)}
                <span className="truncate max-w-[220px]">{selectedItem.file_name}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openFullPreview(selectedItem)}
                  className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Screen Preview</span>
                </button>
              </div>
            </div>

            {/* Interactive Preview Canvas */}
            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg p-3 space-y-2">
              
              {/* PPTX Live Slide Preview */}
              {selectedItem.file_type === 'pptx' && selectedItem.rawArtifact?.slides && selectedItem.rawArtifact.slides.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <Presentation className="w-3.5 h-3.5" />
                      Slide {activeSlideIdx + 1} of {selectedItem.rawArtifact.slides.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveSlideIdx(Math.max(0, activeSlideIdx - 1))}
                        disabled={activeSlideIdx === 0}
                        className="p-1 rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setActiveSlideIdx(Math.min(selectedItem.rawArtifact!.slides!.length - 1, activeSlideIdx + 1))}
                        disabled={activeSlideIdx === selectedItem.rawArtifact.slides.length - 1}
                        className="p-1 rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#18181b] border border-zinc-700/60 rounded-lg p-4 space-y-2 shadow-inner">
                    <h4 className="font-bold text-sm text-zinc-100">
                      {selectedItem.rawArtifact.slides[activeSlideIdx].title}
                    </h4>
                    <ul className="space-y-1 pl-4">
                      {selectedItem.rawArtifact.slides[activeSlideIdx].bullets.map((b, bIdx) => (
                        <li key={bIdx} className="text-xs text-zinc-300 list-disc marker:text-amber-400">
                          {b}
                        </li>
                      ))}
                    </ul>
                    {selectedItem.rawArtifact.slides[activeSlideIdx].notes && (
                      <p className="text-[11px] text-zinc-400 italic pt-1 border-t border-zinc-800">
                        Notes: {selectedItem.rawArtifact.slides[activeSlideIdx].notes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* DOCX Live Section Preview */}
              {selectedItem.file_type === 'docx' && selectedItem.rawArtifact?.structuredDocx && (
                <div className="space-y-2.5">
                  <div className="border-b border-zinc-700/60 pb-1.5">
                    <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block">
                      {selectedItem.rawArtifact.structuredDocx.documentType}
                    </span>
                    <h4 className="font-bold text-sm text-zinc-100">
                      {selectedItem.rawArtifact.structuredDocx.documentTitle}
                    </h4>
                  </div>

                  <div className="bg-sky-950/20 border-l-2 border-sky-500 p-2 text-xs text-zinc-300">
                    <strong className="text-sky-400 block text-[10px] uppercase">Executive Summary:</strong>
                    {selectedItem.rawArtifact.structuredDocx.executiveSummary}
                  </div>

                  {selectedItem.rawArtifact.structuredDocx.sections.slice(0, 2).map((sec, sIdx) => (
                    <div key={sIdx} className="bg-[#18181b] border border-zinc-800 rounded p-2.5 space-y-1">
                      <span className="font-semibold text-xs text-zinc-200 block">{sIdx + 1}.0 {sec.heading}</span>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">{sec.paragraphs[0]}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* XLSX Live Spreadsheet Preview */}
              {selectedItem.file_type === 'xlsx' && selectedItem.rawArtifact?.structuredXlsx && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                    {selectedItem.rawArtifact.structuredXlsx.workbookTitle}
                  </span>
                  {selectedItem.rawArtifact.structuredXlsx.sheets.slice(0, 1).map((sheet, shIdx) => (
                    <div key={shIdx} className="border border-zinc-700 rounded overflow-hidden">
                      <div className="bg-zinc-800 px-2 py-1 text-[11px] font-mono text-zinc-300 font-semibold">
                        Sheet: {sheet.name}
                      </div>
                      <table className="w-full text-left font-mono text-[10px]">
                        <thead className="bg-zinc-900 text-zinc-400">
                          <tr>
                            {sheet.headers.slice(0, 4).map((h, hIdx) => (
                              <th key={hIdx} className="p-1.5 border-b border-zinc-800">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 text-zinc-300">
                          {sheet.rows.slice(0, 3).map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.slice(0, 4).map((cell, cIdx) => (
                                <td key={cIdx} className="p-1.5 truncate">{String(cell)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}

              {/* Default Description */}
              {(!selectedItem.rawArtifact?.slides && !selectedItem.rawArtifact?.structuredDocx && !selectedItem.rawArtifact?.structuredXlsx) && (
                <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                  {selectedItem.description}
                </p>
              )}
            </div>

            {/* Standards Citation */}
            <div className="space-y-1">
              <span className="text-xs font-mono text-[var(--text-secondary)] uppercase font-bold">Governing Standards / Verification:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedItem.standardsCited.map((std, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-[var(--bg-primary)] text-[#9cdcfe] border border-[var(--border-subtle)] text-[11px] font-mono">
                    {std}
                  </span>
                ))}
              </div>
            </div>

            {/* Approval & Sign-off Action */}
            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg p-3 space-y-2 text-xs mt-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[var(--text-secondary)] uppercase font-bold">Review Status:</span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                  selectedItem.approval_status === 'approved'
                    ? 'bg-[#1f3a2b] text-[var(--status-healthy)] border border-[#2e5d44]'
                    : 'bg-[#332a00] text-[#cca700] border border-[#cca700]'
                }`}>
                  {selectedItem.approval_status.toUpperCase()}
                </span>
              </div>

              {selectedItem.signOffBy ? (
                <div className="bg-[#181818] p-2.5 rounded-md text-xs text-[var(--text-primary)] space-y-0.5 font-mono">
                  <div>Authority: <span className="text-[var(--status-healthy)] font-bold">{selectedItem.signOffBy}</span></div>
                  <div>Date: <span className="text-[var(--text-secondary)]">{selectedItem.signOffDate}</span></div>
                </div>
              ) : (
                <div className="text-xs text-[var(--text-secondary)] italic">
                  Awaiting digital approval stamp from Lead Engineer.
                </div>
              )}

              <button
                onClick={() => toggleApproval(selectedItem.artifact_id)}
                className={`w-full py-2 rounded-md text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow ${
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
        )}
      </div>
    </div>
  );
};
