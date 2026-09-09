import React, { useState } from 'react';
import {
  X,
  Download,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  Presentation,
  Code2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ShieldCheck,
  Maximize2,
  FileCheck,
  Hash,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAntigravityStore } from '../../store/useAntigravityStore';
import type { ArtifactItem } from '../../types/antigravity';

export const DeliverablePreviewModal: React.FC = () => {
  const { activePreviewArtifact, setActivePreviewArtifact } = useAntigravityStore();

  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [activeSheetIdx, setActiveSheetIdx] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isSignedOff, setIsSignedOff] = useState(false);

  if (!activePreviewArtifact) return null;

  const art = activePreviewArtifact;
  const isPptx = art.type === 'pptx';
  const isDocx = art.type === 'docx';
  const isXlsx = art.type === 'xlsx';
  const isCode = art.type === 'py' || art.type === 'json';

  const slides = art.slides || [];
  const structuredDocx = art.structuredDocx;
  const structuredXlsx = art.structuredXlsx;
  const codeContent = art.codeContent || '';

  const handleCopyCode = () => {
    if (!codeContent) return;
    navigator.clipboard.writeText(codeContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (art.downloadUrl) {
      const a = document.createElement('a');
      a.href = art.downloadUrl;
      a.download = art.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (art.blob) {
      const url = URL.createObjectURL(art.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = art.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl w-full max-w-5xl h-[90vh] shadow-2xl flex flex-col overflow-hidden text-zinc-200 font-sans">
        
        {/* TOP BAR */}
        <div className="px-5 py-3.5 bg-[#202023] border-b border-[#2e2e32] flex items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-[#2a2a2e] border border-white/5 shrink-0">
              {isPptx && <Presentation className="w-5 h-5 text-amber-400" />}
              {isDocx && <FileText className="w-5 h-5 text-sky-400" />}
              {isXlsx && <FileSpreadsheet className="w-5 h-5 text-emerald-400" />}
              {isCode && <Code2 className="w-5 h-5 text-indigo-400" />}
              {!isPptx && !isDocx && !isXlsx && !isCode && <FileCheck className="w-5 h-5 text-teal-400" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm sm:text-base text-zinc-100 truncate tracking-tight">
                  {art.name}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {art.type.toUpperCase()}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                Path: <code className="font-mono text-zinc-300">{art.path}</code> • Size: {(art.sizeBytes / 1024).toFixed(1)} KB • Generated: {art.createdAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsSignedOff(!isSignedOff)}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSignedOff
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
              }`}
              title="Digital Sign-off on verified deliverable"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isSignedOff ? 'text-emerald-400' : 'text-zinc-400'}`} />
              {isSignedOff ? 'Signed Off' : 'Digital Sign-Off'}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-950 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={() => setActivePreviewArtifact(null)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Close Preview (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PREVIEW CONTENT CONTAINER */}
        <div className="flex-1 overflow-hidden bg-[#121214] flex flex-col">
          
          {/* PPTX PRESENTATION PREVIEW */}
          {isPptx && (
            <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
              {slides.length > 0 ? (
                <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full overflow-hidden">
                  
                  {/* SLIDE CANVAS (16:9 aspect) */}
                  <div className="flex-1 min-h-[320px] bg-gradient-to-br from-[#1e1e24] via-[#16161a] to-[#0f0f12] rounded-xl border border-zinc-700/60 p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                    
                    {/* Header with Title & Purpose */}
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-3 border-b border-zinc-800 pb-3">
                        <span className="text-xs font-mono font-medium tracking-wider text-amber-400/90 uppercase flex items-center gap-1.5">
                          <Presentation className="w-3.5 h-3.5" />
                          Slide {activeSlideIdx + 1} of {slides.length}
                        </span>
                        {slides[activeSlideIdx].purpose && (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-950/40 text-amber-300 border border-amber-800/30 truncate max-w-xs">
                            {slides[activeSlideIdx].purpose}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight leading-snug">
                        {slides[activeSlideIdx].title}
                      </h3>
                    </div>

                    {/* Bullet Points */}
                    <div className="my-6 space-y-3.5 flex-1 overflow-y-auto pr-2">
                      {slides[activeSlideIdx].bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-3 group">
                          <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                          <p className="text-sm sm:text-base text-zinc-200 leading-relaxed">
                            {bullet}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Speaker Notes Drawer / Footer */}
                    {slides[activeSlideIdx].notes && (
                      <div className="mt-4 pt-3 border-t border-zinc-800/80 bg-black/20 -mx-6 -mb-6 p-4 rounded-b-xl">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                          Speaker Notes:
                        </span>
                        <p className="text-xs text-zinc-300 italic">
                          "{slides[activeSlideIdx].notes}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* SLIDE SWITCHER CONTROLS & THUMBNAILS */}
                  <div className="mt-4 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveSlideIdx(Math.max(0, activeSlideIdx - 1))}
                        disabled={activeSlideIdx === 0}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-xs text-zinc-200 border border-zinc-700 flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                      </button>
                      <button
                        onClick={() => setActiveSlideIdx(Math.min(slides.length - 1, activeSlideIdx + 1))}
                        disabled={activeSlideIdx === slides.length - 1}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-xs text-zinc-200 border border-zinc-700 flex items-center gap-1 transition-all cursor-pointer"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Slide thumbnails dots */}
                    <div className="flex items-center gap-1.5 overflow-x-auto max-w-md py-1">
                      {slides.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveSlideIdx(idx)}
                          className={`h-7 px-2.5 rounded text-xs font-mono transition-all cursor-pointer ${
                            idx === activeSlideIdx
                              ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-950'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                          }`}
                          title={`Go to Slide ${idx + 1}: ${s.title}`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="m-auto text-center p-8 space-y-3">
                  <Presentation className="w-12 h-12 text-zinc-600 mx-auto" />
                  <p className="text-zinc-400 text-sm">PowerPoint Presentation compiled and ready for download.</p>
                </div>
              )}
            </div>
          )}

          {/* DOCX DOCUMENT PREVIEW */}
          {isDocx && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#151518]">
              <div className="max-w-3xl mx-auto bg-[#1c1c20] border border-zinc-700/60 rounded-xl p-8 shadow-xl space-y-6 font-sans">
                
                {/* Formal Corporate Header */}
                <div className="border-b-2 border-sky-500/60 pb-5">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-2">
                    <span className="uppercase tracking-widest text-sky-400 font-bold">
                      {structuredDocx?.documentType || 'OFFICIAL TECHNICAL NOTE'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-sky-950/50 text-sky-300 border border-sky-800/40">
                      AIR-GAPPED AUDIT READY
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
                    {structuredDocx?.documentTitle || art.name}
                  </h1>
                </div>

                {/* Metadata Table */}
                {structuredDocx?.metadata && Object.keys(structuredDocx.metadata).length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/60 p-3.5 rounded-lg border border-zinc-800 text-xs">
                    {Object.entries(structuredDocx.metadata).map(([key, val]) => (
                      <div key={key}>
                        <span className="text-zinc-400 font-mono text-[10px] uppercase block">{key}</span>
                        <span className="font-semibold text-zinc-200 truncate block mt-0.5">{val}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Executive Summary */}
                {structuredDocx?.executiveSummary && (
                  <div className="bg-sky-950/20 border-l-4 border-sky-500 p-4 rounded-r-lg space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                      Executive Summary
                    </h3>
                    <p className="text-sm text-zinc-200 leading-relaxed">
                      {structuredDocx.executiveSummary}
                    </p>
                  </div>
                )}

                {/* Document Sections */}
                {structuredDocx?.sections && structuredDocx.sections.length > 0 ? (
                  <div className="space-y-6 pt-2">
                    {structuredDocx.sections.map((sec, sIdx) => (
                      <div key={sIdx} className="space-y-3">
                        <h2 className="text-lg font-bold text-zinc-100 border-b border-zinc-800 pb-1.5">
                          {sIdx + 1}.0 {sec.heading}
                        </h2>

                        {sec.paragraphs.map((p, pIdx) => (
                          <p key={pIdx} className="text-sm text-zinc-300 leading-relaxed">
                            {p}
                          </p>
                        ))}

                        {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                          <ul className="space-y-2 pl-4">
                            {sec.bulletPoints.map((bp, bIdx) => (
                              <li key={bIdx} className="text-sm text-zinc-300 list-disc marker:text-sky-400">
                                {bp}
                              </li>
                            ))}
                          </ul>
                        )}

                        {sec.keyMetrics && Object.keys(sec.keyMetrics).length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800 text-xs">
                            {Object.entries(sec.keyMetrics).map(([mKey, mVal]) => (
                              <div key={mKey}>
                                <span className="text-zinc-400 text-[11px] block">{mKey}:</span>
                                <span className="font-mono font-bold text-sky-300">{mVal}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-zinc-400 text-sm">
                    {art.description}
                  </div>
                )}

                {/* Sign-off Block */}
                <div className="border-t border-zinc-800 pt-6 mt-8">
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                        Deterministic Sign-Off
                      </span>
                      <div className="text-xs text-zinc-300">
                        Prepared by: <span className="font-medium text-zinc-100">{structuredDocx?.signOffBlock?.preparedBy || 'Antigravity Sovereign Agent'}</span>
                      </div>
                      <div className="text-xs text-zinc-300">
                        Verified by: <span className="font-medium text-zinc-100">{structuredDocx?.signOffBlock?.verifiedBy || 'Local Qwen 2.5 Validation Engine'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-mono">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isSignedOff ? 'DIGITALLY VERIFIED' : structuredDocx?.signOffBlock?.status || 'VALIDATED'}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* XLSX SPREADSHEET PREVIEW */}
          {isXlsx && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#141416]">
              {structuredXlsx?.sheets && structuredXlsx.sheets.length > 0 ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  
                  {/* Workbook Tabs */}
                  <div className="px-4 pt-3 bg-[#1c1c20] border-b border-zinc-800 flex items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {structuredXlsx.sheets.map((sheet, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => setActiveSheetIdx(sIdx)}
                          className={`px-4 py-2 rounded-t-lg text-xs font-medium border-t border-x transition-all cursor-pointer flex items-center gap-1.5 ${
                            sIdx === activeSheetIdx
                              ? 'bg-[#141416] text-emerald-400 border-zinc-700 font-semibold'
                              : 'bg-zinc-800/40 text-zinc-400 border-transparent hover:bg-zinc-800'
                          }`}
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          {sheet.name}
                        </button>
                      ))}
                    </div>

                    <span className="text-[11px] font-mono text-zinc-400 shrink-0 pb-2">
                      Sheet {activeSheetIdx + 1} of {structuredXlsx.sheets.length}
                    </span>
                  </div>

                  {/* Active Sheet Table */}
                  <div className="flex-1 overflow-auto p-4 font-mono text-xs">
                    {(() => {
                      const activeSheet = structuredXlsx.sheets[activeSheetIdx] || structuredXlsx.sheets[0];
                      return (
                        <div className="space-y-4">
                          {activeSheet.purpose && (
                            <div className="px-3 py-1.5 bg-emerald-950/30 border border-emerald-800/30 rounded text-[11px] text-emerald-300 font-sans">
                              Sheet Purpose: {activeSheet.purpose}
                            </div>
                          )}

                          <div className="border border-zinc-700/80 rounded-lg overflow-hidden bg-[#18181b] shadow">
                            <table className="w-full text-left border-collapse">
                              <thead className="bg-zinc-800 text-zinc-300 font-semibold text-[11px]">
                                <tr>
                                  <th className="p-2.5 border-b border-r border-zinc-700 w-12 text-center text-zinc-500 bg-zinc-900/60">
                                    #
                                  </th>
                                  {activeSheet.headers.map((h, hIdx) => (
                                    <th key={hIdx} className="p-2.5 border-b border-r border-zinc-700 truncate tracking-wide">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                                {activeSheet.rows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-zinc-800/50 transition-colors">
                                    <td className="p-2.5 border-r border-zinc-800 text-center text-zinc-500 bg-zinc-900/30 text-[10px]">
                                      {rIdx + 1}
                                    </td>
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx} className="p-2.5 border-r border-zinc-800/60 truncate">
                                        {typeof cell === 'number' ? cell.toLocaleString() : String(cell)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Sheet Formulas / Summary */}
                          {activeSheet.formulas && activeSheet.formulas.length > 0 && (
                            <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 space-y-1">
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                                Calculated Formulas:
                              </span>
                              {activeSheet.formulas.map((f, fIdx) => (
                                <code key={fIdx} className="block text-emerald-400 text-xs">
                                  {f}
                                </code>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                </div>
              ) : (
                <div className="m-auto text-center p-8 space-y-3">
                  <FileSpreadsheet className="w-12 h-12 text-zinc-600 mx-auto" />
                  <p className="text-zinc-400 text-sm">Excel Workbook compiled and ready for download.</p>
                </div>
              )}
            </div>
          )}

          {/* PYTHON CODE PREVIEW */}
          {isCode && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#101012]">
              <div className="px-4 py-2 bg-[#18181b] border-b border-zinc-800 flex items-center justify-between shrink-0">
                <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  {art.name} ({codeContent.split('\n').length} lines)
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 flex items-center gap-1 transition-all cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4 font-mono text-xs text-zinc-200">
                <pre className="line-numbers whitespace-pre-wrap leading-relaxed">
                  {codeContent || art.description}
                </pre>
              </div>
            </div>
          )}

          {/* GENERIC / FALLBACK PREVIEW */}
          {!isPptx && !isDocx && !isXlsx && !isCode && (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div className="max-w-md space-y-4">
                <FileCheck className="w-12 h-12 text-zinc-500 mx-auto" />
                <h3 className="text-lg font-bold text-zinc-100">{art.name}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{art.description}</p>
                <div className="pt-2">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-950"
                  >
                    <Download className="w-4 h-4" /> Download Deliverable
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 bg-[#1b1b1e] border-t border-[#2a2a2e] flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-zinc-300">
              Deterministic In-Browser Preview
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
              100% Local Air-Gapped Engine
            </span>
            <button
              onClick={() => setActivePreviewArtifact(null)}
              className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
