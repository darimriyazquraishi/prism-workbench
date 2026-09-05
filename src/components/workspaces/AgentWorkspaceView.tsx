import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Paperclip, 
  Cpu, 
  FileText, 
  Download, 
  CheckCircle2, 
  BookOpen, 
  AlertTriangle,
  Terminal,
  Clock,
  Circle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';
import { HumanApprovalDialog } from '../dialogs/HumanApprovalDialog';

interface AgentWorkspaceViewProps {
  objective: string;
  setObjective: (val: string) => void;
  selectedFile: string;
  setSelectedFile: (val: string) => void;
  onExecute: () => void;
}

export const AgentWorkspaceView: React.FC<AgentWorkspaceViewProps> = ({
  objective,
  setObjective,
  selectedFile,
  setSelectedFile,
  onExecute
}) => {
  const { activeTask, isProcessing } = useWorkbenchStore();
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalGranted, setApprovalGranted] = useState(false);
  const [showTerminalLogs, setShowTerminalLogs] = useState(false);

  const presetScenarios = [
    {
      id: 'demo1',
      title: 'Demo 1: Scanned Inspection PDF -> API 570 Math -> Word Approval Note',
      desc: 'Extracts wall thinning (3.8mm), queries SOP-OPS-014, calculates API 570 corrosion rate (0.343 mm/yr), and compiles formal Word document.',
      prompt: 'Read this scanned inspection report, identify the major findings, compare them against SOP-OPS-014, calculate the corrosion rate and remaining life, prepare an approval note, and export as a Word (.docx) document.',
      file: 'demo/synthetic/Inspection_Report_001.pdf',
      badge: 'Flagship Demo'
    },
    {
      id: 'demo2',
      title: 'Demo 2: Pump Failure Excel -> Isolated Python Sandbox -> Excel Report',
      desc: 'Writes and executes Python code inside isolated Docker container to compute MTBF statistics and exports Excel workbook.',
      prompt: 'Analyze Pump_Failure_Data.xlsx, write and execute Python code in the sandbox to calculate monthly MTBF statistics, and produce an Excel deliverable.',
      file: 'demo/synthetic/Pump_Failure_Data.xlsx',
      badge: 'Code Sandbox'
    },
    {
      id: 'demo3',
      title: 'Demo 3: P&ID Drawing -> Multimodal Vision Tag Extraction',
      desc: 'Processes engineering drawing with local Qwen2.5-VL to detect pumps, valves, and flow lines with zero external cloud calls.',
      prompt: 'Perform vision analysis on P_and_ID_Example.png, identify all pumps, valves, and flow lines, and generate an executive summary briefing deck.',
      file: 'demo/synthetic/P_and_ID_Example.png',
      badge: 'VLM Vision'
    }
  ];

  return (
    <div className="h-full flex flex-col space-y-4 font-sans text-sm overflow-y-auto pr-1">
      {/* 1. TOP TASK COMPOSER CARD */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-5 space-y-4 flex-shrink-0 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#569cd6]" />
              Industrial Agent Workflow Studio
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Execute multi-step engineering tasks using local open-weight models with zero cloud dependencies.
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-mono px-2.5 py-1 rounded bg-[var(--bg-primary)] text-[var(--status-healthy)] border border-[var(--border-subtle)] font-semibold">
            Air-Gapped Sovereign Node
          </span>
        </div>

        {/* 3 Prominent 1-Click Demo Buttons */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase text-[var(--text-secondary)] font-bold block">
            Select a Golden Demonstration or Enter Custom Goal:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {presetScenarios.map((demo) => (
              <button
                key={demo.id}
                onClick={() => {
                  setObjective(demo.prompt);
                  setSelectedFile(demo.file);
                }}
                disabled={isProcessing}
                className="p-3 rounded-lg bg-[var(--bg-primary)] hover:bg-[#2d2d2d] border border-[var(--border-subtle)] hover:border-[var(--accent-fuchsia)] transition-all text-left flex flex-col justify-between space-y-2 group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#9cdcfe] group-hover:text-[var(--text-primary)]">
                      {demo.badge}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-[#569cd6]" />
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] mt-1 group-hover:text-[#569cd6] transition-colors">
                    {demo.title.split('->')[0]}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                    {demo.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs text-[#569cd6] font-medium pt-1">
                  <span>Load Preset</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Objective Input Area */}
        <div className="space-y-3 pt-2">
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Type your engineering goal (e.g. Read scanned inspection report, compare against SOP-OPS-014, calculate corrosion rate, and export Word deliverable)..."
            rows={3}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-md p-3 text-sm text-[var(--text-primary)] placeholder-[#777777] focus:outline-none focus:border-[var(--accent-fuchsia)] font-sans leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
              <Paperclip className="w-4 h-4 text-[var(--text-secondary)]" />
              <span className="font-semibold text-[var(--text-primary)]">Target File:</span>
              <select
                value={selectedFile}
                onChange={(e) => setSelectedFile(e.target.value)}
                className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none font-mono"
              >
                <option value="demo/synthetic/Inspection_Report_001.pdf">Inspection_Report_001.pdf (Scanned PDF)</option>
                <option value="demo/synthetic/Pump_Failure_Data.xlsx">Pump_Failure_Data.xlsx (Vibration Data)</option>
                <option value="demo/synthetic/P_and_ID_Example.png">P_and_ID_Example.png (Engineering Drawing)</option>
                <option value="demo/synthetic/Operations_SOP_014.pdf">Operations_SOP_014.pdf (SOP Standard)</option>
              </select>
            </div>

            <button
              onClick={onExecute}
              disabled={isProcessing || !objective.trim()}
              className={`px-6 py-2.5 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                isProcessing || !objective.trim()
                  ? 'bg-[var(--border-subtle)] text-[#777777] cursor-not-allowed border border-[var(--border-subtle)]'
                  : 'bg-[var(--accent-fuchsia)] hover:bg-[#1f8ad2] text-[var(--text-primary)] shadow-md cursor-pointer'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Executing Autonomous Workflow...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Execute Workflow</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC WORKSPACE BODY: STEPPER + DELIVERABLE + CITATIONS */}
      {activeTask && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-4">
          {/* Left / Center (7 Cols): Model Decision + Step-by-Step Progress */}
          <div className="lg:col-span-7 space-y-4">
            {/* Model Decision Card */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                  <Cpu className="w-4 h-4 text-[#569cd6]" />
                  <span>Dynamic Model Router Decision</span>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-[var(--bg-primary)] text-[#9cdcfe] border border-[var(--border-subtle)] font-bold">
                  {activeTask.selected_model_id}
                </span>
              </div>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                {activeTask.routing_reason}
              </p>
            </div>

            {/* Human in the Loop Safety Approval Banner */}
            {!approvalGranted && (
              <div className="bg-[#332a00] border-2 border-[#cca700] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#cca700] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[var(--text-primary)] text-sm block">
                      Mandatory Human Safety Gate
                    </span>
                    <p className="text-xs text-[#ffeb80] mt-0.5">
                      Verify deterministic API 570 calculation and authorize formal Word (.docx) compile.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApprovalModal(true)}
                  className="px-4 py-2 rounded bg-[#cca700] hover:bg-[#b39200] text-[var(--bg-primary)] font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Review & Authorize</span>
                </button>
              </div>
            )}

            {/* ReAct Execution Plan Stepper */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  Step-by-Step Execution Progress
                </span>
                <span className="text-xs font-mono text-[#569cd6] font-semibold">
                  Step {Math.min(activeTask.current_step_index + 1, activeTask.plan.length)} of {activeTask.plan.length}
                </span>
              </div>

              <div className="space-y-3">
                {activeTask.plan.map((step) => {
                  const isCompleted = step.status === 'completed';
                  const isRunning = step.status === 'running';

                  return (
                    <div
                      key={step.step_id}
                      className={`p-3.5 rounded-lg border transition-all ${
                        isRunning
                          ? 'bg-[#1a3a5c] border-[var(--accent-fuchsia)] text-[var(--text-primary)] shadow-md'
                          : isCompleted
                          ? 'bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-primary)]'
                          : 'bg-[#181818] border-[#2d2d2d] text-[#777777]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-[var(--status-healthy)] flex-shrink-0 mt-0.5" />
                          ) : isRunning ? (
                            <Clock className="w-5 h-5 text-[#9cdcfe] animate-spin flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#555555] flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="text-sm font-semibold text-[var(--text-primary)]">
                              {step.step_id}. {step.title}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                              {step.description}
                            </div>
                          </div>
                        </div>

                        {step.tool_name && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[#9cdcfe] border border-[var(--border-subtle)] flex-shrink-0">
                            {step.tool_name}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Collapsible Terminal Output Logs */}
            <div className="bg-[#181818] border border-[var(--border-subtle)] rounded-lg overflow-hidden">
              <button
                onClick={() => setShowTerminalLogs(!showTerminalLogs)}
                className="w-full px-4 py-3 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-primary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2 font-bold">
                  <Terminal className="w-4 h-4 text-[#569cd6]" />
                  View Isolated Terminal Logs ({activeTask.tool_calls.length} Invocations)
                </span>
                {showTerminalLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTerminalLogs && (
                <div className="p-3 space-y-2 max-h-60 overflow-y-auto font-mono text-xs">
                  {activeTask.tool_calls.map((call) => (
                    <div key={call.call_id} className="p-2.5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#569cd6]">&gt; {call.tool_name} ({call.call_id})</span>
                        <span className="text-[var(--text-secondary)]">{call.execution_time_ms} ms</span>
                      </div>
                      <div className="text-[var(--text-secondary)] bg-[#141414] p-2 rounded overflow-x-auto text-[11px]">
                        <pre>{JSON.stringify(call.arguments, null, 2)}</pre>
                      </div>
                      {call.output && (
                        <div className="text-[var(--status-healthy)] bg-[#141414] p-2 rounded overflow-x-auto text-[11px]">
                          <pre>{typeof call.output === 'string' ? call.output : JSON.stringify(call.output, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5 Cols): Generated Deliverable Card + Grounded SOP Citations */}
          <div className="lg:col-span-5 space-y-4">
            {/* Generated Deliverables Card */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <span className="text-sm font-bold text-[var(--status-healthy)] flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Generated Deliverables ({activeTask.artifacts.length})
                </span>
                <span className="text-xs font-mono text-[var(--text-secondary)]">Formal Business Documents</span>
              </div>

              <div className="space-y-3">
                {activeTask.artifacts.map((art) => (
                  <div key={art.artifact_id} className="p-4 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-[#1f3a2b] border border-[#2e5d44] flex items-center justify-center font-bold text-[var(--status-healthy)] text-xs uppercase font-mono">
                          {art.file_type}
                        </div>
                        <div>
                          <div className="font-bold text-[var(--text-primary)] text-sm">
                            {art.file_name}
                          </div>
                          <div className="text-xs font-mono text-[var(--text-secondary)]">{(art.size_bytes / 1024).toFixed(1)} KB</div>
                        </div>
                      </div>

                      <a
                        href={art.file_path}
                        download
                        className="px-3.5 py-1.5 rounded-md bg-[var(--accent-fuchsia)] hover:bg-[#1f8ad2] text-[var(--text-primary)] text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </a>
                    </div>

                    <p className="text-xs text-[var(--text-primary)] bg-[#181818] p-3 rounded font-sans leading-relaxed">
                      {art.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-[#2d2d2d] text-xs font-mono">
                      <span className="text-[var(--text-secondary)]">Sign-Off: Awaiting Review</span>
                      <span className="text-[var(--status-healthy)] flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Math Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grounded SOP Citations Card */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <span className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#569cd6]" />
                  Grounded SOP Citations ({activeTask.citations.length})
                </span>
                <span className="text-xs font-mono text-[var(--text-secondary)]">ChromaDB</span>
              </div>

              <div className="space-y-2.5">
                {activeTask.citations.map((c, idx) => (
                  <div key={idx} className="p-3 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-[#569cd6] font-bold">{c.source_file}</span>
                      {c.page_number && <span className="text-[var(--text-secondary)]">Page {c.page_number}</span>}
                    </div>
                    <p className="text-[var(--text-primary)] text-xs font-sans leading-relaxed italic border-l-2 border-[var(--accent-fuchsia)] pl-2.5">
                      "{c.snippet}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Human Approval Modal */}
      <HumanApprovalDialog
        isOpen={showApprovalModal}
        actionTitle="Calculate API 570 Corrosion Rate & Generate Word Deliverable"
        actionType="calculation"
        targetResource="Inspection_Report_001.pdf (Line 04-CR-102)"
        details="Calculates deterministic corrosion rate: (5.0 - 3.8) / 3.5 = 0.343 mm/yr and estimated remaining life of 2.33 years based on ASME B31.3 / API 570 retirement thickness limit of 3.0 mm. Upon authorization, compiles formal Word approval note with engineering sign-off block."
        onApprove={() => {
          setShowApprovalModal(false);
          setApprovalGranted(true);
        }}
        onReject={() => {
          setShowApprovalModal(false);
        }}
        onClose={() => setShowApprovalModal(false)}
      />
    </div>
  );
};
