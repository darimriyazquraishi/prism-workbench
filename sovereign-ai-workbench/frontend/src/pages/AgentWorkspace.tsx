import React, { useState } from 'react';
import { 
  Send, 
  Paperclip, 
  Bot, 
  FileText, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { TaskGraph } from '../components/agent/TaskGraph';
import { ExecutionTimeline } from '../components/agent/ExecutionTimeline';
import { useWorkbenchStore } from '../store/useWorkbenchStore';
import { api } from '../services/api';
import { TaskState } from '../types';

export const AgentWorkspace: React.FC = () => {
  const { activeTask, setActiveTask, isProcessing, setIsProcessing } = useWorkbenchStore();
  const [objective, setObjective] = useState('');
  const [selectedFile, setSelectedFile] = useState<string>('demo/synthetic/Inspection_Report_001.pdf');

  const samplePrompts = [
    {
      label: 'Demo 1 (Document & DOCX)',
      prompt: 'Read this scanned inspection report, identify the major findings, compare them against SOP-OPS-014, calculate the corrosion rate and remaining life, prepare an approval note, and export as a Word (.docx) document.',
      file: 'demo/synthetic/Inspection_Report_001.pdf'
    },
    {
      label: 'Demo 2 (Coding & Excel)',
      prompt: 'Analyze Pump_Failure_Data.xlsx, write and execute Python code in the sandbox to calculate monthly MTBF statistics, and produce an Excel deliverable.',
      file: 'demo/synthetic/Pump_Failure_Data.xlsx'
    },
    {
      label: 'Demo 3 (P&ID Multimodal)',
      prompt: 'Perform vision analysis on P_and_ID_Example.png, identify all pumps, valves, and flow lines, and generate an executive summary briefing deck.',
      file: 'demo/synthetic/P_and_ID_Example.png'
    }
  ];

  const handleLaunchTask = async (customPrompt?: string, customFile?: string) => {
    const taskPrompt = customPrompt || objective;
    const taskFile = customFile || selectedFile;
    if (!taskPrompt.trim()) return;

    setIsProcessing(true);
    try {
      // 1. Create task on backend
      const state = await api.createTask(taskPrompt, taskFile ? [taskFile] : []);
      setActiveTask(state);

      // 2. Open SSE stream for live real-time updates
      const eventSource = new EventSource(`/api/tasks/${state.task_id}/stream`);

      eventSource.onmessage = (e) => {
        const payload = JSON.parse(e.data);
        const { event, data } = payload;

        if (event === 'TASK_INITIALIZED') {
          setActiveTask({ ...state, ...data });
        } else if (event === 'PLAN_GENERATED') {
          setActiveTask({ ...state, plan: data.plan });
        } else if (event === 'STEP_START') {
          setActiveTask((prev: any) => {
            if (!prev) return prev;
            const updatedPlan = prev.plan.map((s: any) => 
              s.step_id === data.step_id ? { ...s, status: 'running' } : s
            );
            return { ...prev, plan: updatedPlan, current_step_index: data.step_id - 1 };
          });
        } else if (event === 'STEP_SUCCESS') {
          setActiveTask((prev: any) => {
            if (!prev) return prev;
            const updatedPlan = prev.plan.map((s: any) => 
              s.step_id === data.step_id ? { ...s, status: 'completed', result_summary: data.result_summary } : s
            );
            const toolCalls = data.tool_record ? [...prev.tool_calls, data.tool_record] : prev.tool_calls;
            return { ...prev, plan: updatedPlan, tool_calls: toolCalls };
          });
        } else if (event === 'ARTIFACT_GENERATED') {
          setActiveTask((prev: any) => {
            if (!prev) return prev;
            return { ...prev, artifacts: [...prev.artifacts, data] };
          });
        } else if (event === 'CITATIONS_UPDATED') {
          setActiveTask((prev: any) => {
            if (!prev) return prev;
            return { ...prev, citations: data.citations };
          });
        } else if (event === 'TASK_COMPLETED') {
          setActiveTask((prev: any) => {
            if (!prev) return prev;
            return { 
              ...prev, 
              status: 'completed', 
              final_output: data.final_output,
              artifacts: data.artifacts,
              citations: data.citations
            };
          });
          setIsProcessing(false);
          eventSource.close();
        }
      };

      eventSource.onerror = () => {
        setIsProcessing(false);
        eventSource.close();
      };

    } catch (err) {
      console.error('Task launch error:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Section: Task Input & Prompt Selection */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Industrial Agent Goal & Workflow Submission</h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">Zero Cloud API Connectivity</span>
        </div>

        {/* Quick Demo Buttons */}
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setObjective(s.prompt);
                setSelectedFile(s.file);
              }}
              className="text-xs px-3 py-1.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700/60 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Text Input Area */}
        <div className="relative">
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Type your industrial workflow request (e.g. Read scanned inspection report, calculate corrosion rate, compare with SOP-OPS-014, and export .docx approval note)..."
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors"
          />

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/80">
            {/* Attached File Selector */}
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Paperclip className="w-3.5 h-3.5 text-zinc-500" />
              <span>Target File:</span>
              <select
                value={selectedFile}
                onChange={(e) => setSelectedFile(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="demo/synthetic/Inspection_Report_001.pdf">Inspection_Report_001.pdf (Scanned)</option>
                <option value="demo/synthetic/Pump_Failure_Data.xlsx">Pump_Failure_Data.xlsx (Data)</option>
                <option value="demo/synthetic/P_and_ID_Example.png">P_and_ID_Example.png (Drawing)</option>
                <option value="demo/synthetic/Operations_SOP_014.pdf">Operations_SOP_014.pdf (SOP)</option>
              </select>
            </div>

            {/* Launch Button */}
            <button
              onClick={() => handleLaunchTask()}
              disabled={isProcessing || !objective.trim()}
              className={`px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
                isProcessing || !objective.trim()
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm shadow-sky-600/30'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Orchestrating...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Workflow</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Split Layout */}
      {activeTask && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Plan Graph & Execution Timeline (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Routing Decision Banner */}
            <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-semibold text-zinc-200">Dynamic Model Routing Decision</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-bold">
                  {activeTask.selected_model_id}
                </span>
              </div>
              <p className="text-xs text-zinc-400">{activeTask.routing_reason}</p>
            </div>

            {/* Plan Execution Graph */}
            <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-xl">
              <TaskGraph steps={activeTask.plan} currentStepIndex={activeTask.current_step_index} />
            </div>

            {/* Live Tool Execution & Sandbox Log */}
            <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-xl">
              <ExecutionTimeline toolCalls={activeTask.tool_calls} />
            </div>
          </div>

          {/* Right Column: Deliverables, Citations & Outcomes (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Generated Deliverables Section */}
            <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
                    Generated Deliverables ({activeTask.artifacts.length})
                  </h3>
                </div>
              </div>

              {activeTask.artifacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                  Deliverables (.docx, .xlsx, .pptx) will appear here once generated by agent tools.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeTask.artifacts.map((art) => (
                    <div
                      key={art.artifact_id}
                      className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-lg space-y-2 hover:border-emerald-500/40 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded bg-emerald-950 border border-emerald-800 flex items-center justify-center font-bold text-emerald-400 text-xs uppercase font-mono">
                            {art.file_type}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-zinc-200">{art.file_name}</div>
                            <div className="text-[10px] text-zinc-500">{(art.size_bytes / 1024).toFixed(1)} KB</div>
                          </div>
                        </div>

                        <a
                          href={`/api/artifacts/${art.file_name}/download`}
                          download
                          className="px-2.5 py-1.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/40 text-xs font-medium flex items-center gap-1.5 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>

                      <div className="text-[11px] text-zinc-400 bg-zinc-900/50 p-2 rounded">
                        {art.description}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500 font-mono">
                        <span>Human Review: Pending</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          On-Premise Verified
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Knowledge Base Grounding & Citations */}
            <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <h3 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
                    SOP & Standard Citations ({activeTask.citations.length})
                  </h3>
                </div>
              </div>

              {activeTask.citations.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                  Retrieved internal knowledge snippets with page citations will be listed here.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {activeTask.citations.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-lg space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-sky-400 font-semibold">{c.source_file}</span>
                        {c.page_number && <span className="text-zinc-500">Page {c.page_number}</span>}
                      </div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed italic">
                        "{c.snippet}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
