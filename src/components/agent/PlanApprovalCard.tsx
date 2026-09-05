import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Cpu, 
  Layers, 
  FileCheck, 
  Plus, 
  Trash2, 
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import type { ProposedExecutionPlan, ProposedStepItem } from '../../types/antigravity';

interface PlanApprovalCardProps {
  plan: ProposedExecutionPlan;
  onApprove: (updatedPlan: ProposedExecutionPlan) => void;
  onReject: (userFeedback?: string) => void;
}

export const PlanApprovalCard: React.FC<PlanApprovalCardProps> = ({
  plan,
  onApprove,
  onReject
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [editableSteps, setEditableSteps] = useState<ProposedStepItem[]>(plan.steps);
  const [selectedModel, setSelectedModel] = useState(plan.primaryModel);

  const handleStepDescriptionChange = (index: number, newDesc: string) => {
    const updated = [...editableSteps];
    updated[index].description = newDesc;
    setEditableSteps(updated);
  };

  const handleAddStep = () => {
    const nextNum = editableSteps.length + 1;
    setEditableSteps([
      ...editableSteps,
      {
        id: `step-custom-${Date.now()}`,
        stepNumber: nextNum,
        toolName: 'local_python_sandbox.run',
        description: 'Perform custom verification script check',
        targetModel: selectedModel,
        status: 'pending'
      }
    ]);
  };

  const handleRemoveStep = (index: number) => {
    const updated = editableSteps.filter((_, i) => i !== index).map((s, idx) => ({
      ...s,
      stepNumber: idx + 1
    }));
    setEditableSteps(updated);
  };

  const handleConfirmApproval = () => {
    const finalPlan: ProposedExecutionPlan = {
      ...plan,
      primaryModel: selectedModel,
      steps: editableSteps,
      userDecision: isEditing ? 'edited' : 'approved'
    };
    onApprove(finalPlan);
  };

  const handleConfirmReject = () => {
    onReject(rejectFeedback.trim() || undefined);
    setShowRejectBox(false);
    setRejectFeedback('');
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 my-3 font-sans shadow-md space-y-4">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              Proposed Execution Plan
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] uppercase">
                {plan.classifiedTaskType.replace('_', ' ')}
              </span>
              {plan.revisionCount && plan.revisionCount > 1 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-300 border border-amber-800/40">
                  Revision #{plan.revisionCount}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Air-Gapped Router proposed plan. Review assigned models and sequential trajectory before approval.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--accent-success)] bg-[var(--bg-base)] px-2.5 py-1 rounded-full border border-[var(--border-subtle)]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Local Engine (Zero Egress)</span>
        </div>
      </div>

      {/* Task Upload Content & KB Guidance Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] flex items-start gap-2">
          <FileCheck className="w-4 h-4 text-[var(--accent-primary)] mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase font-mono">Task Content Inputs (User Uploads)</div>
            {plan.userUploadFiles && plan.userUploadFiles.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-1">
                {plan.userUploadFiles.map((fname, i) => (
                  <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                    📄 {fname}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-[var(--text-secondary)] italic mt-0.5">Prompt text input (No files attached)</div>
            )}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] flex items-start gap-2">
          <Layers className="w-4 h-4 text-emerald-400 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase font-mono">Knowledge Base Guidance (RAG)</div>
            {plan.noKbGuidanceFound ? (
              <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                ✓ No relevant KB guidance found (Proceeding with uploads only)
              </div>
            ) : plan.relevantKbGuidance && plan.relevantKbGuidance.length > 0 ? (
              <div className="space-y-1 mt-1">
                {plan.relevantKbGuidance.map((g) => (
                  <div key={g.id} className="text-[11px] font-mono text-emerald-300 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-800/40">
                    📚 {g.title}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-[var(--text-secondary)] italic mt-0.5">Searching knowledge base...</div>
            )}
          </div>
        </div>
      </div>

      {/* KB Conflict Alert Banner */}
      {plan.kbConflictDetected && (
        <div className="p-3 bg-amber-950/30 border border-amber-700/50 rounded-lg flex items-start gap-2.5 text-xs">
          <span className="text-base">⚠️</span>
          <div>
            <div className="font-semibold text-amber-300 font-mono">Knowledge Base Conflict Surfaced</div>
            <p className="text-[11px] text-amber-200/90 mt-0.5 leading-snug">
              {plan.kbConflictSummary || "Conflicting rules were detected between active Knowledge Base documents. The system has surfaced this conflict for user awareness before proceeding."}
            </p>
          </div>
        </div>
      )}

      {/* Model Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[var(--accent-primary)]" />
            <div>
              <div className="text-[10px] text-[var(--text-secondary)] uppercase font-mono">Assigned Execution Model</div>
              {isEditing ? (
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded border border-[var(--border-subtle)] text-xs px-2 py-0.5 mt-0.5 focus:outline-none"
                >
                  <option value="Qwen3-8B-Instruct">Qwen3-8B-Instruct (Reasoning & Draft)</option>
                  <option value="Qwen2.5-VL-7B-Instruct">Qwen2.5-VL-7B (Vision & P&ID)</option>
                  <option value="Qwen2.5-Coder-7B">Qwen2.5-Coder-7B (Python & Engineering)</option>
                </select>
              ) : (
                <div className="font-semibold text-[var(--text-primary)] font-mono">{selectedModel}</div>
              )}
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[var(--text-secondary)]" />
          <div>
            <div className="text-[10px] text-[var(--text-secondary)] uppercase font-mono">Target Deliverables</div>
            <div className="font-mono text-[11px] text-[var(--text-primary)] truncate">
              {plan.expectedDeliverables.join(', ')}
            </div>
          </div>
        </div>
      </div>

      {/* Trajectory Steps */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[var(--text-secondary)] font-semibold px-1">
          <span>Execution Trajectory ({editableSteps.length} Steps)</span>
          {isEditing && (
            <button 
              onClick={handleAddStep}
              className="flex items-center gap-1 text-[10px] text-[var(--accent-primary)] hover:underline cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Step
            </button>
          )}
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {editableSteps.map((step, idx) => (
            <div 
              key={step.id} 
              className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] flex items-start justify-between text-xs group"
            >
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <span className="w-5 h-5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-mono text-[var(--text-secondary)] flex-shrink-0 mt-0.5">
                  {step.stepNumber}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[var(--text-secondary)] uppercase bg-[var(--bg-surface)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                      {step.toolName}
                    </span>
                  </div>
                  {isEditing ? (
                    <input 
                      type="text"
                      value={step.description}
                      onChange={(e) => handleStepDescriptionChange(idx, e.target.value)}
                      className="w-full bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs rounded px-2 py-1 mt-1 border border-[var(--border-subtle)] focus:outline-none"
                    />
                  ) : (
                    <p className="text-[12px] text-[var(--text-primary)] mt-0.5 leading-snug">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {isEditing && editableSteps.length > 1 && (
                <button 
                  onClick={() => handleRemoveStep(idx)}
                  className="p-1 hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-red-400 rounded transition-colors cursor-pointer ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rejection Feedback Box */}
      {showRejectBox && (
        <div className="p-3 bg-red-950/20 border border-red-800/40 rounded-lg space-y-2">
          <div className="text-xs font-semibold text-red-300">Provide Refined Instructions for Revised Workplan:</div>
          <textarea
            value={rejectFeedback}
            onChange={(e) => setRejectFeedback(e.target.value)}
            placeholder="e.g., Please focus specifically on section 4 API 570 remaining life calculation..."
            className="w-full bg-[var(--bg-base)] text-xs text-[var(--text-primary)] border border-red-800/40 rounded p-2 focus:outline-none"
            rows={2}
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setShowRejectBox(false)}
              className="px-3 py-1 rounded text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReject}
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-medium cursor-pointer"
            >
              Submit Feedback &amp; Regenerate Plan
            </button>
          </div>
        </div>
      )}

      {/* Actions Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] text-xs font-medium transition-colors cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Done Editing' : 'Edit Plan'}</span>
        </button>

        <div className="flex items-center gap-2">
          {!showRejectBox && (
            <button 
              onClick={() => setShowRejectBox(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          )}

          <button 
            onClick={handleConfirmApproval}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 text-xs font-semibold transition-opacity cursor-pointer shadow"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approve &amp; Execute Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
