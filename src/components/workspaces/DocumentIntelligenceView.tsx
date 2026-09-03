import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Tag, 
  ScanText
} from 'lucide-react';

interface DocumentItem {
  id: string;
  name: string;
  type: 'Scanned PDF' | 'Digital PDF' | 'Spreadsheet' | 'Drawing';
  pages: number;
  size: string;
  ocrStatus: 'OCR Completed (Local)' | 'Digital Direct' | 'Vision OCR';
  findingsCount: number;
  summary: string;
  extractedEntities: { label: string; value: string; confidence: string }[];
  extractedFindings: { location: string; metric: string; threshold: string; status: 'Warning' | 'Compliant' }[];
}

const documentsList: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'Inspection_Report_001.pdf',
    type: 'Scanned PDF',
    pages: 4,
    size: '142 KB',
    ocrStatus: 'OCR Completed (Local)',
    findingsCount: 3,
    summary: 'Statutory ultrasonic thickness survey for CDU-5 Column Feed Line 04-CR-102 (Pipe P-102). Recorded wall thinning below 4.0 mm trigger threshold.',
    extractedEntities: [
      { label: 'EQUIPMENT TAG', value: 'Line 04-CR-102 (P-102)', confidence: '99.4%' },
      { label: 'MEASURED THICKNESS', value: '3.80 mm', confidence: '98.9%' },
      { label: 'NOMINAL THICKNESS', value: '5.00 mm', confidence: '99.8%' },
      { label: 'INSPECTION TECHNIQUE', value: 'Ultrasonic Pulse-Echo', confidence: '97.5%' },
      { label: 'OPERATING FLUID', value: 'Crude Hydrocarbon Blend', confidence: '99.1%' }
    ],
    extractedFindings: [
      { location: 'Elbow E-102 Extrados', metric: '3.80 mm', threshold: '4.00 mm (SOP Alert)', status: 'Warning' },
      { location: 'Straight Spool S-1', metric: '4.75 mm', threshold: '3.00 mm (Retirement)', status: 'Compliant' },
      { location: 'Flange Weld Neck W-2', metric: '4.60 mm', threshold: '3.00 mm (Retirement)', status: 'Compliant' }
    ]
  },
  {
    id: 'doc-2',
    name: 'Operations_SOP_014.pdf',
    type: 'Digital PDF',
    pages: 18,
    size: '277 KB',
    ocrStatus: 'Digital Direct',
    findingsCount: 1,
    summary: 'Standard Operating Procedure for Crude Distillation Units & Process Piping Integrity Thresholds (API 570 / ASME B31.3).',
    extractedEntities: [
      { label: 'STANDARD CODE', value: 'SOP-OPS-014 Rev 4', confidence: '100%' },
      { label: 'APPLICABLE UNIT', value: 'CDU-1, CDU-2, CDU-5', confidence: '100%' },
      { label: 'RETIREMENT LIMIT', value: '3.00 mm minimum', confidence: '100%' }
    ],
    extractedFindings: [
      { location: 'Section 4.2: Critical Process Piping', metric: '< 4.00 mm triggers Approval Note', threshold: 'Mandatory Sign-Off', status: 'Warning' }
    ]
  },
  {
    id: 'doc-3',
    name: 'Maintenance_Standard_007.pdf',
    type: 'Digital PDF',
    pages: 12,
    size: '193 KB',
    ocrStatus: 'Digital Direct',
    findingsCount: 2,
    summary: 'Refinery Maintenance Guideline for High-Temperature Hydrocarbon Valve & Flange Containment.',
    extractedEntities: [
      { label: 'STANDARD CODE', value: 'MS-ENG-007 Rev 2', confidence: '100%' },
      { label: 'INSPECTION FREQUENCY', value: 'Quarterly Survey', confidence: '100%' }
    ],
    extractedFindings: [
      { location: 'Section 6.1: Flange Gland Leakage', metric: 'Class A Hydrocarbon', threshold: 'Turnaround Replacement', status: 'Warning' }
    ]
  }
];

export const DocumentIntelligenceView: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem>(documentsList[0]);
  const [activePage, setActivePage] = useState(1);
  const [showOcrText, setShowOcrText] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-full flex flex-col space-y-4 font-sans text-sm overflow-hidden">
      {/* 1. TOP TOOLBAR */}
      <div className="bg-[#252526] border border-[#333333] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 select-none flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono font-bold text-white text-sm">
            <FileText className="w-5 h-5 text-[#569cd6]" />
            <span>Document Viewer:</span>
            <span className="text-[#9cdcfe]">{selectedDoc.name}</span>
          </div>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#1e1e1e] text-[#4ec9b0] border border-[#3c3c3c]">
            {selectedDoc.ocrStatus}
          </span>
        </div>

        {/* Page & Search Controls */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-1">
            <Search className="w-3.5 h-3.5 text-[#858585]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search document text..."
              className="bg-transparent border-none text-xs text-[#cccccc] placeholder-[#666666] focus:outline-none w-40 font-sans"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded p-1">
            <button
              onClick={() => setActivePage(Math.max(1, activePage - 1))}
              disabled={activePage === 1}
              className="p-1 hover:bg-[#333333] rounded text-[#cccccc] disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-white font-bold min-w-[60px] text-center">
              PAGE {activePage} / {selectedDoc.pages}
            </span>
            <button
              onClick={() => setActivePage(Math.min(selectedDoc.pages, activePage + 1))}
              disabled={activePage === selectedDoc.pages}
              className="p-1 hover:bg-[#333333] rounded text-[#cccccc] disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowOcrText(!showOcrText)}
            className={`px-3 py-1.5 rounded-md border font-semibold flex items-center gap-1.5 transition-all ${
              showOcrText
                ? 'bg-[#007acc] text-white border-[#007acc]'
                : 'bg-[#1e1e1e] text-[#858585] border-[#3c3c3c]'
            }`}
          >
            <ScanText className="w-4 h-4" />
            <span>Show OCR Text</span>
          </button>
        </div>
      </div>

      {/* 2. 3-COLUMN WORKBENCH LAYOUT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left: Document List (3 Cols) */}
        <div className="lg:col-span-3 bg-[#252526] border border-[#333333] rounded-lg p-4 flex flex-col space-y-3 overflow-y-auto font-sans shadow-sm">
          <div className="text-xs uppercase text-[#999999] font-bold tracking-wider px-1">
            Available Documents ({documentsList.length})
          </div>

          <div className="space-y-2">
            {documentsList.map((doc) => {
              const isSelected = selectedDoc.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setActivePage(1);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#37373d] border-[#007acc] text-white shadow-sm'
                      : 'bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc] hover:border-[#555555]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="font-semibold text-sm truncate max-w-[150px]">
                      {doc.name}
                    </div>
                    <span className="text-xs font-mono px-1.5 py-0.2 rounded bg-[#252526] text-[#9cdcfe]">
                      {doc.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#858585] mt-2 font-mono">
                    <span>{doc.pages} Pages • {doc.size}</span>
                    <span className="text-[#cca700] font-semibold">{doc.findingsCount} Findings</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Rendered Document Sheet (5 Cols) */}
        <div className="lg:col-span-5 bg-[#181818] border border-[#333333] rounded-lg flex flex-col overflow-hidden shadow-sm">
          <div className="h-8 bg-[#252526] border-b border-[#333333] px-4 flex items-center justify-between font-mono text-xs text-[#999999] flex-shrink-0">
            <span>PREVIEW: PAGE {activePage} OF {selectedDoc.pages}</span>
            <span className="text-[#4ec9b0] font-semibold">Local PyMuPDF Parser</span>
          </div>

          <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#141414]">
            <div className="w-[460px] min-h-[500px] bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg p-6 shadow-2xl font-mono text-xs text-[#cccccc] space-y-4 relative">
              {/* Document Header */}
              <div className="border-b border-[#333333] pb-3 text-center space-y-1">
                <div className="text-xs font-bold text-[#569cd6] uppercase">
                  MANGALORE REFINERY AND PETROCHEMICALS LIMITED
                </div>
                <div className="text-sm font-bold text-white">
                  CDU-5 ULTRASONIC INSPECTION REPORT
                </div>
                <div className="text-xs text-[#858585]">
                  REPORT REF: MRPL-CDU5-INS-2026-001 • DATE: 15-FEB-2026
                </div>
              </div>

              {/* Scanned Report Content */}
              <div className="space-y-3 text-xs leading-relaxed text-[#cccccc]">
                <div className="bg-[#252526] p-3 rounded-md border border-[#3c3c3c] space-y-1">
                  <span className="text-[#858585] uppercase font-bold block text-xs">1. SURVEY OBJECTIVE</span>
                  <p className="font-sans text-xs text-[#e0e0e0]">
                    Ultrasonic wall thickness examination conducted on 4" Crude Charge Piping (Line 04-CR-102) connected to Feed Pump P-102.
                  </p>
                </div>

                <div className="bg-[#252526] p-3 rounded-md border border-[#3c3c3c] space-y-1.5">
                  <span className="text-[#858585] uppercase font-bold block text-xs">2. RECORDED MEASUREMENTS</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>NOMINAL THICKNESS: <span className="text-white font-bold block">5.00 mm</span></div>
                    <div>MEASURED THICKNESS: <span className="text-[#cca700] font-bold block">3.80 mm (Critical)</span></div>
                    <div>PREVIOUS (2022): <span className="text-white block">5.00 mm</span></div>
                    <div>SERVICE TIME: <span className="text-white block">3.50 Years</span></div>
                  </div>
                </div>

                <div className="bg-[#332a00] p-3 rounded-md border border-[#cca700] text-[#ffeb80] text-xs font-sans leading-relaxed">
                  <span className="font-bold block mb-1">3. FIELD INSPECTION CONCLUSION:</span>
                  Elbow section exhibits localized wall thinning. Value 3.80 mm falls below SOP-OPS-014 trigger limit (4.00 mm). Mandatory engineering review recommended.
                </div>
              </div>

              {showOcrText && (
                <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-[#1f3a2b] text-[#4ec9b0] border border-[#2e5d44] text-xs font-bold">
                  OCR Confidence: 98.9%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Extracted Entities & Findings (4 Cols) */}
        <div className="lg:col-span-4 bg-[#252526] border border-[#333333] rounded-lg p-4 flex flex-col space-y-3 overflow-y-auto font-mono text-xs shadow-sm">
          <div className="flex items-center justify-between border-b border-[#333333] pb-2 text-sm uppercase font-bold text-white">
            <span className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#569cd6]" />
              Extracted Entities ({selectedDoc.extractedEntities.length})
            </span>
            <span className="text-xs text-[#4ec9b0]">PaddleOCR</span>
          </div>

          <div className="space-y-1.5">
            {selectedDoc.extractedEntities.map((ent, idx) => (
              <div key={idx} className="p-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#858585] text-[10px] block">{ent.label}</span>
                  <span className="text-white font-semibold">{ent.value}</span>
                </div>
                <span className="text-[#4ec9b0] font-bold">{ent.confidence}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#333333] space-y-2">
            <span className="text-xs text-[#858585] uppercase font-bold block">
              Integrity Compliance Findings:
            </span>

            <div className="space-y-2">
              {selectedDoc.extractedFindings.map((f, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs ${
                    f.status === 'Warning'
                      ? 'bg-[#332a00] border-[#cca700] text-[#ffeb80]'
                      : 'bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc]'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-sm">{f.location}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      f.status === 'Warning' ? 'bg-[#332a00] text-[#cca700]' : 'bg-[#1f3a2b] text-[#4ec9b0]'
                    }`}>
                      {f.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#cccccc] mt-1 font-sans">
                    Measured: <span className="text-white font-bold">{f.metric}</span> • Threshold: {f.threshold}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
