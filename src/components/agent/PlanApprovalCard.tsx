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
import { useAntigravityStore } from '../../store/useAntigravityStore';

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
  const { availableModels } = useAntigravityStore();
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
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
          <span className="font-semibold text-sm text-[var(--text-primary)]">Implementation Plan</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] uppercase">
            {plan.classifiedTaskType.replace('_', ' ')}
          </span>
          {plan.revisionCount && plan.revisionCount > 1 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-300 border border-amber-800/40">
              Rev #{plan.revisionCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {plan.userUploadFiles && plan.userUploadFiles.length > 0 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
              {plan.userUploadFiles.length} file{plan.userUploadFiles.length > 1 ? 's' : ''} attached
            </span>
          )}
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-800/40">
            Air-Gapped
          </span>
        </div>
      </div>

      {/* Goal / Intent Summary */}
      <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
        <span className="font-medium text-[var(--text-primary)]">Goal: </span>
        {plan.intentSummary || 'Execute task using local specialized models and produce verified deliverables.'}
      </div>

      {/* Steps List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-medium text-[var(--text-secondary)]">
          <span>Execution Steps ({editableSteps.length})</span>
          {isEditing && (
            <button 
              onClick={handleAddStep}
              className="flex items-center gap-1 text-[11px] text-[var(--accent-primary)] hover:underline cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Step
            </button>
          )}
        </div>

        <div className="space-y-2">
          {editableSteps.map((step, idx) => (
            <div 
              key={step.id} 
              className="flex items-start gap-3 p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] text-xs group"
            >
              <span className="w-5 h-5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-mono text-[var(--text-secondary)] flex-shrink-0 mt-0.5">
                {step.stepNumber}
              </span>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input 
                    type="text"
                    value={step.description}
                    onChange={(e) => handleStepDescriptionChange(idx, e.target.value)}
                    className="w-full bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs rounded px-2 py-1 border border-[var(--border-subtle)] focus:outline-none"
                  />
                ) : (
                  <p className="text-[12px] text-[var(--text-primary)] leading-snug">
                    {step.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="font-mono text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-surface)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                    {step.targetModel || selectedModel || 'qwen2.5-coder-7b'}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                    {step.toolName}
                  </span>
                </div>
              </div>
              {isEditing && editableSteps.length > 1 && (
                <button 
                  onClick={() => handleRemoveStep(idx)}
                  className="p-1 hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-red-400 rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Expected Deliverables */}
      {plan.expectedDeliverables && plan.expectedDeliverables.length > 0 && (
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] text-[var(--text-secondary)] font-medium">Deliverable:</span>
          <div className="flex flex-wrap gap-1.5">
            {plan.expectedDeliverables.map((del, i) => (
              <span key={i} className="font-mono text-[11px] px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                {del}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rejection Feedback Box */}
      {showRejectBox && (
        <div className="p-3 bg-red-950/20 border border-red-800/40 rounded-lg space-y-2">
          <div className="text-xs font-semibold text-red-300">Feedback for Revised Plan:</div>
          <textarea
            value={rejectFeedback}
            onChange={(e) => setRejectFeedback(e.target.value)}
            placeholder="Specify what should be changed in this plan..."
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
              Submit &amp; Regenerate
            </button>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] text-xs font-medium transition-colors cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Done Editing' : 'Edit Steps'}</span>
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
            <span>Proceed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
