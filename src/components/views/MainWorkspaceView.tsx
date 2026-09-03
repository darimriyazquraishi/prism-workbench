import React, { useState } from 'react';
import { 
  FileText, 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  Play, 
  Check, 
  Clock, 
  Download, 
  Eye, 
  Layers, 
  FileSpreadsheet, 
  Sparkles,
  Paperclip,
  Send,
  Code2
} from 'lucide-react';

export const MainWorkspaceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'doc_editor'>('chat');
  const [isExecutingPython, setIsExecutingPython] = useState(false);
  const [pythonExecuted, setPythonExecuted] = useState(true);

  const handleRunPython = () => {
    setIsExecutingPython(true);
    setTimeout(() => {
      setIsExecutingPython(false);
      setPythonExecuted(true);
    }, 600);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#1e1e1e] font-sans text-xs text-[#cccccc]">
      {/* 1. Left Sidebar: Project Explorer Tree */}
      <aside className="w-56 bg-[#252526] border-r border-[#2d2d2d] flex flex-col select-none flex-shrink-0">
        <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#858585] flex items-center justify-between border-b border-[#2d2d2d]">
          <span>Explorer: Project</span>
          <span className="text-[#569cd6]">3.2 MB</span>
        </div>

        <div className="flex-1 p-2 space-y-0.5 overflow-y-auto font-mono text-[11px]">
          {/* Section: Documents */}
          <div className="flex items-center gap-1 text-[#858585] px-1 py-1 font-bold">
            <ChevronDown className="w-3 h-3" />
            <Folder className="w-3.5 h-3.5 text-[#dcb67a]" />
            <span>documents</span>
          </div>
          <div className="pl-5 space-y-0.5">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#37373d] text-white font-semibold cursor-pointer">
              <FileText className="w-3.5 h-3.5 text-[#ce9178]" />
              <span className="truncate">Inspection_Report_March.pdf</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e] cursor-pointer">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#4ec9b0]" />
              <span className="truncate">Pump_Failure_Data.csv</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e] cursor-pointer">
              <Layers className="w-3.5 h-3.5 text-[#569cd6]" />
              <span className="truncate">P_and_ID_Example.png</span>
            </div>
          </div>

          {/* Section: /corp/SOPs/ */}
          <div className="flex items-center gap-1 text-[#858585] px-1 py-1 font-bold mt-2">
            <ChevronDown className="w-3 h-3" />
            <Folder className="w-3.5 h-3.5 text-[#dcb67a]" />
            <span>corp/SOPs</span>
          </div>
          <div className="pl-5 space-y-0.5 text-[10px]">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e] cursor-pointer">
              <FileText className="w-3.5 h-3.5 text-[#569cd6]" />
              <span className="truncate">Operations_SOP_014.pdf</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e] cursor-pointer">
              <FileText className="w-3.5 h-3.5 text-[#569cd6]" />
              <span className="truncate">Maintenance_Standard_007.pdf</span>
            </div>
          </div>

          {/* Section: deliverables */}
          <div className="flex items-center gap-1 text-[#858585] px-1 py-1 font-bold mt-2">
            <ChevronDown className="w-3 h-3" />
            <Folder className="w-3.5 h-3.5 text-[#4ec9b0]" />
            <span>deliverables</span>
          </div>
          <div className="pl-5 space-y-0.5 text-[10px]">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[#4ec9b0] hover:bg-[#2a2d2e] cursor-pointer">
              <FileText className="w-3.5 h-3.5" />
              <span className="truncate">Approval_Note_Draft.docx</span>
            </div>
          </div>
        </div>

        {/* Local Env Status pill */}
        <div className="p-2 border-t border-[#2d2d2d] bg-[#1e1e1e] text-[10px] font-mono text-[#858585] flex items-center justify-between">
          <span className="text-[#4ec9b0] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ec9b0]"></span>
            SANDBOX ISOLATED
          </span>
          <span>--net=none</span>
        </div>
      </aside>

      {/* 2. Central Pane: Multi-Tabbed Agent Chat & Task Execution + Stylized Document Editor */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e] border-r border-[#2d2d2d]">
        {/* Top Tab Strip */}
        <div className="h-9 bg-[#252526] border-b border-[#2d2d2d] flex items-center px-2 space-x-1 select-none font-mono text-xs">
          <button
            onClick={() => setActiveTab('chat')}
            className={`h-full px-3 flex items-center gap-1.5 border-b-2 cursor-pointer transition-all ${
              activeTab === 'chat'
                ? 'border-[#007acc] text-white font-bold bg-[#1e1e1e]'
                : 'border-transparent text-[#858585] hover:text-[#cccccc]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#569cd6]" />
            <span>AGENT CHAT &amp; TASK EXECUTION</span>
          </button>

          <button
            onClick={() => setActiveTab('doc_editor')}
            className={`h-full px-3 flex items-center gap-1.5 border-b-2 cursor-pointer transition-all ${
              activeTab === 'doc_editor'
                ? 'border-[#007acc] text-white font-bold bg-[#1e1e1e]'
                : 'border-transparent text-[#858585] hover:text-[#cccccc]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#ce9178]" />
            <span>STYLED DOCUMENT EDITOR [Approval_Note.docx]</span>
          </button>
        </div>

        {/* Tab Body */}
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Conversation Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-xl bg-[#252526] border border-[#3c3c3c] rounded p-3 text-[#cccccc] space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#858585]">
                    <span className="text-white font-bold">Chief Inspection Engineer</span>
                    <span>14:21:05</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    Process the attached scanned report <span className="text-[#ce9178] font-mono font-bold">Inspection_Report_March.pdf</span>. Extract critical wall thickness measurements for Line 04-CR-102, check compliance against our maintenance SOPs, run the corrosion calculation in the sandbox, and draft an official approval note.
                  </p>
                  {/* File Attachment Card */}
                  <div className="flex items-center gap-2 p-2 rounded bg-[#1e1e1e] border border-[#2d2d2d] font-mono text-[11px]">
                    <FileText className="w-4 h-4 text-[#ce9178]" />
                    <div className="truncate flex-1">
                      <span className="text-white font-semibold">Inspection_Report_March.pdf</span>
                      <span className="text-[#858585] text-[10px] block">4 Pages · Scanned Ultrasonic Survey · 5.7 MB</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#3c3c3c] text-[#cccccc]">ATTACHED</span>
                  </div>
                </div>
              </div>

              {/* Agent Execution Response: Onyx-7B */}
              <div className="max-w-2xl bg-[#252526] border border-[#2d2d2d] rounded p-4 text-[#cccccc] space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#3c3c3c] pb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-[#569cd6] flex items-center justify-center font-bold text-white text-[11px]">
                      O
                    </div>
                    <span className="font-bold text-white">Agent Onyx-7B (Vision/General)</span>
                    <span className="text-[#858585] font-mono text-[10px]">· 14:21:08 (Local Inference)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1f3a2b] text-[#4ec9b0] border border-[#2e5d44] font-bold">
                    ● Air-Gapped Local Execution
                  </span>
                </div>

                <div className="space-y-2 text-xs leading-relaxed">
                  <p>
                    I have processed <span className="font-mono text-[#ce9178]">Inspection_Report_March.pdf</span> using local on-device OCR and vision capabilities.
                  </p>

                  <div className="p-2.5 rounded bg-[#1e1e1e] border border-[#2d2d2d] space-y-1 font-mono text-[11px]">
                    <div className="text-[#4ec9b0] font-bold">✓ Extracted Findings:</div>
                    <div>• Equipment: <span className="text-white">Crude Distillation Column Feed (Line 04-CR-102)</span></div>
                    <div>• Nominal Wall Thickness: <span className="text-white">5.00 mm</span></div>
                    <div>• Current Measured Thickness: <span className="text-[#f14c4c] font-bold">3.80 mm</span> (Severe localized thinning on elbow extrados)</div>
                    <div>• Previous Thickness (2022 Survey): <span className="text-white">5.00 mm</span> (Operating duration: 3.5 years)</div>
                  </div>

                  <p>
                    Comparing against <span className="font-mono text-[#569cd6]">SOP-OPS-014 (Section 4.2)</span>: The minimum allowable retirement thickness is <span className="font-mono text-white font-bold">3.00 mm</span>. The measured thickness of <span className="font-mono text-[#f14c4c] font-bold">3.80 mm</span> falls below the mandatory review alert limit of <span className="font-mono text-white">4.00 mm</span>, triggering immediate corrosion life calculation and engineering sign-off.
                  </p>
                </div>

                {/* Inline Document Draft Preview */}
                <div className="p-3 bg-[#1e1e1e] border border-[#3c3c3c] rounded space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-white flex items-center gap-1.5 font-mono">
                      <FileText className="w-3.5 h-3.5 text-[#ce9178]" />
                      Draft Deliverable: Approval_Note_Unit5_Inspection.docx
                    </span>
                    <button
                      onClick={() => setActiveTab('doc_editor')}
                      className="px-2 py-0.5 rounded bg-[#37373d] hover:bg-[#007acc] text-white transition-colors cursor-pointer text-[10px] font-mono"
                    >
                      Open Full Editor &rarr;
                    </button>
                  </div>
                  <div className="text-[11px] text-[#858585] italic">
                    "TECHNICAL APPROVAL NOTE: Ref Line 04-CR-102 Wall Thinning to 3.80mm requires secondary ultrasonic testing within 90 days and placement on high-frequency monitoring list prior to Q3 turnaround."
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Composer */}
            <div className="p-3 bg-[#252526] border-t border-[#2d2d2d] flex items-center gap-2">
              <button
                title="Attach Document or Schematic"
                className="p-2 rounded hover:bg-[#37373d] text-[#858585] hover:text-white cursor-pointer"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="text"
                placeholder="Instruct Onyx-7B or Quartz-13B (e.g., 'Recalculate corrosion rate with 4 years operating period')..."
                className="flex-1 bg-[#1e1e1e] border border-[#3c3c3c] focus:border-[#007acc] rounded px-3 py-1.5 text-xs text-[#cccccc] focus:outline-none font-sans"
              />
              <button className="px-3 py-1.5 rounded bg-[#007acc] hover:bg-[#1f8ad2] text-white font-bold flex items-center gap-1 cursor-pointer">
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        ) : (
          /* Stylized Document Editor */
          <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-[#181818] font-sans">
            <div className="max-w-2xl mx-auto w-full bg-[#252526] border border-[#3c3c3c] rounded p-6 shadow-xl space-y-4 text-xs">
              <div className="border-b border-[#3c3c3c] pb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white uppercase tracking-wider">
                    MANGALORE REFINERY AND PETROCHEMICALS LIMITED
                  </div>
                  <div className="text-[10px] font-mono text-[#858585]">
                    DEPARTMENT OF PROCESS INTEGRITY &amp; CORROSION AUDIT · FORM REF: MRPL-OPS-2026
                  </div>
                </div>
                <div className="text-right font-mono text-[10px] text-[#4ec9b0] font-bold">
                  STATUS: DRAFT FOR REVIEW
                </div>
              </div>

              <div className="text-sm font-bold text-white">
                SUBJECT: APPROVAL NOTE — WALL THICKNESS DEGRADATION (LINE 04-CR-102)
              </div>

              <div className="space-y-2 text-[#cccccc] leading-relaxed">
                <p>
                  <strong>1. Purpose:</strong> This technical note records the ultrasonic thickness inspection findings on the CDU-5 Crude Charge Feed Piping (Tag: Line 04-CR-102) and formally recommends scheduled turnaround replacement.
                </p>
                <p>
                  <strong>2. Deterministic Calculation (API 570 Standard):</strong><br />
                  • Initial Survey Wall Thickness (2022): <span className="font-mono text-white">5.00 mm</span><br />
                  • Current Measured Wall Thickness (March 2026): <span className="font-mono text-[#f14c4c] font-bold">3.80 mm</span><br />
                  • Operating Period: <span className="font-mono text-white">3.5 Years</span><br />
                  • Calculated Corrosion Rate: <span className="font-mono text-[#4ec9b0] font-bold">0.343 mm/year</span> [(5.00 - 3.80) / 3.5]<br />
                  • Minimum Allowable Retirement Thickness: <span className="font-mono text-white">3.00 mm</span><br />
                  • Calculated Remaining Safe Operating Life: <span className="font-mono text-[#569cd6] font-bold">2.33 Years</span> [(3.80 - 3.00) / 0.343]
                </p>
                <p>
                  <strong>3. Recommendation &amp; Mandatory Action:</strong> Measured wall thickness has breached the SOP-OPS-014 review threshold (4.00 mm). Mandatory secondary NDT scan is required within 90 days. Line spool replacement must be requisitioned for the upcoming turnaround.
                </p>
              </div>

              {/* Digital Sign-Off Stamp */}
              <div className="pt-4 border-t border-[#3c3c3c] grid grid-cols-2 gap-4 font-mono text-[10px]">
                <div className="p-3 bg-[#1e1e1e] border border-[#2d2d2d] rounded space-y-1">
                  <div className="text-[#858585]">PREPARED BY LOCAL AI AGENT:</div>
                  <div className="text-white font-bold">Onyx-7B (Vision) + Quartz-13B (Sandbox)</div>
                  <div className="text-[#4ec9b0]">Hash: SHA256: 8f9b...a102 (Tamper Proof)</div>
                </div>
                <div className="p-3 bg-[#1e1e1e] border border-[#2d2d2d] rounded space-y-1">
                  <div className="text-[#858585]">AUTHORIZED HUMAN SIGN-OFF:</div>
                  <div className="text-white font-bold">Chief Inspection Engineer [PENDING]</div>
                  <div className="text-[#ce9178]">Required prior to SAP PM Work Order generation</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <a
                  href="/static/artifacts/Approval_Note_Unit5_Inspection.docx"
                  download
                  className="px-3 py-1.5 rounded bg-[#007acc] hover:bg-[#1f8ad2] text-white font-bold font-mono text-[11px] flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Word Document (.docx)</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Right Pane: Network Status + Model Router + Tool Output (Python Sandbox) */}
      <aside className="w-80 bg-[#252526] flex flex-col select-none flex-shrink-0 font-sans">
        {/* Panel A: NETWORK STATUS */}
        <div className="p-3 border-b border-[#2d2d2d] bg-[#1e1e1e] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#858585] uppercase tracking-wider">
              NETWORK STATUS
            </span>
            <span className="w-2 h-2 rounded-full bg-[#4ec9b0] animate-pulse"></span>
          </div>

          <div className="p-2.5 rounded bg-[#1f3a2b] border border-[#2e5d44] flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#4ec9b0] flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-white leading-tight">
                STATUS: AIR-GAPPED
              </div>
              <div className="text-[10px] font-mono text-[#4ec9b0]">
                0 BYTES EXTERNAL TRAFFIC
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] text-[#858585]">
            <div className="p-1.5 rounded bg-[#252526] border border-[#2d2d2d]">
              <span>Inbound:</span> <strong className="text-white">0 kbps</strong>
            </div>
            <div className="p-1.5 rounded bg-[#252526] border border-[#2d2d2d]">
              <span>Outbound:</span> <strong className="text-[#4ec9b0]">0.0 b (BLOCKED)</strong>
            </div>
          </div>
        </div>

        {/* Panel B: MODEL ROUTER */}
        <div className="p-3 border-b border-[#2d2d2d] space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#858585] uppercase tracking-wider">
            <span>MODEL ROUTER</span>
            <span className="text-[#569cd6]">Auto-Route</span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            {/* Onyx-7B (Active) */}
            <div className="p-2 rounded bg-[#1e1e1e] border border-[#007acc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4ec9b0]"></span>
                <span className="font-bold text-white">Onyx-7B</span>
                <span className="text-[10px] text-[#858585]">(Vision/General)</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#007acc] text-white font-bold">ACTIVE</span>
            </div>

            {/* Quartz-13B (Standby) */}
            <div className="p-2 rounded bg-[#1e1e1e] border border-[#2d2d2d] flex items-center justify-between text-[#858585]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#666666]"></span>
                <span className="font-bold text-[#cccccc]">Quartz-13B</span>
                <span className="text-[10px] text-[#858585]">(Coding/Calc)</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#2d2d2d] text-[#858585]">STANDBY</span>
            </div>
          </div>

          <div className="p-2 rounded bg-[#1e1e1e] border border-[#2d2d2d] text-[10px] text-[#858585] leading-relaxed">
            <span className="text-[#569cd6] font-mono font-bold">Router Decision:</span> Task detected as <span className="text-white font-semibold">"Visual Document Summary"</span>; routed to <span className="text-[#4ec9b0] font-bold">Onyx-7B</span>.
          </div>
        </div>

        {/* Panel C: TOOL OUTPUT (Sandboxed Python Script) */}
        <div className="flex-1 flex flex-col p-3 overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#858585] uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#569cd6]" />
              <span>TOOL OUTPUT: Python Sandbox</span>
            </span>
            <button
              onClick={handleRunPython}
              disabled={isExecutingPython}
              className="px-2 py-0.5 rounded bg-[#37373d] hover:bg-[#007acc] text-white text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Play className="w-2.5 h-2.5 fill-white" />
              <span>{isExecutingPython ? 'Running...' : 'Re-Run'}</span>
            </button>
          </div>

          {/* Terminal Box */}
          <div className="flex-1 bg-[#181818] border border-[#2d2d2d] rounded p-2.5 font-mono text-[10px] text-[#cccccc] overflow-y-auto space-y-2">
            <div className="text-[#858585]">
              # sandboxed execution in docker container (--network=none)<br />
              &gt; python calc_corrosion_api570.py
            </div>

            <div className="text-[#9cdcfe]">
              t_prev = 5.00 # mm (2022 survey)<br />
              t_actual = 3.80 # mm (March 2026)<br />
              service_years = 3.5<br />
              t_retire = 3.00 # mm (SOP-OPS-014 limit)
            </div>

            <div className="p-1.5 rounded bg-[#252526] border border-[#3c3c3c] space-y-0.5 text-[#4ec9b0]">
              <div>[RESULT] Corrosion Rate: 0.343 mm/yr</div>
              <div>[RESULT] Remaining Life: 2.33 Years</div>
              <div className="text-[#f14c4c] font-bold">[ALERT] T_ACTUAL &lt; 4.00mm ALERT THRESHOLD</div>
              <div className="text-white">[ACTION] FORMAL APPROVAL NOTE REQUIRED</div>
            </div>

            <div className="text-[#858585] text-[9px] pt-1">
              Process return code: 0 (Execution time: 25ms, VRAM: 0 MB, Network: 0 KB)
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
