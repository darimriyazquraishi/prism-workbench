import React, { useState } from 'react';
import { useAntigravityStore } from '../../store/useAntigravityStore';
import type { ValidationAuditLog } from '../../types/antigravity';

export const ValidationAuditView: React.FC = () => {
  const { 
    validationAuditLogs, 
    pipelineConfig, 
    updatePipelineConfig, 
    clearValidationAuditLogs 
  } = useAntigravityStore();

  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#12141c] text-[#e1e4ed] overflow-hidden font-sans">
      {/* Top Header */}
      <div className="p-4 border-b border-[#2a2e3d] bg-[#1a1d29] flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2 text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Answer Validation & Model Routing Audit Logs
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time inspection of evidence grounding, task compliance, unsupported claims, and reasoning model routing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearValidationAuditLogs}
            className="px-3 py-1.5 rounded bg-[#2a2e3d] hover:bg-[#34384a] text-xs text-gray-300 font-medium transition"
          >
            Clear Audit Logs
          </button>
        </div>
      </div>

      {/* Configuration Control Panel */}
      <div className="p-3 bg-[#161924] border-b border-[#2a2e3d] grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="flex flex-col gap-1">
          <label className="text-gray-400 font-semibold">Confidence Threshold:</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.05"
              value={pipelineConfig.confidenceThreshold}
              onChange={(e) => updatePipelineConfig({ confidenceThreshold: parseFloat(e.target.value) })}
              className="accent-[#00a8ff] flex-1 cursor-pointer"
            />
            <span className="font-mono text-emerald-400 font-bold">{pipelineConfig.confidenceThreshold.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-gray-400 font-semibold">Validator Model:</label>
          <input
            type="text"
            value={pipelineConfig.validatorModel}
            onChange={(e) => updatePipelineConfig({ validatorModel: e.target.value })}
            className="bg-[#202433] border border-[#2a2e3d] rounded px-2 py-1 text-gray-200 font-mono"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-gray-400 font-semibold">General Reasoning Model:</label>
          <input
            type="text"
            value={pipelineConfig.generalReasoningModel}
            onChange={(e) => updatePipelineConfig({ generalReasoningModel: e.target.value })}
            className="bg-[#202433] border border-[#2a2e3d] rounded px-2 py-1 text-gray-200 font-mono"
          />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <label className="flex items-center gap-2 cursor-pointer text-gray-300">
            <input
              type="checkbox"
              checked={pipelineConfig.validationEnabled}
              onChange={(e) => updatePipelineConfig({ validationEnabled: e.target.checked })}
              className="accent-[#00a8ff] rounded"
            />
            Validation Layer Active
          </label>
        </div>
      </div>

      {/* Main Logs Table / Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {validationAuditLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-[#2a2e3d] rounded-lg p-6">
            <div className="w-12 h-12 rounded-full bg-[#1e2230] flex items-center justify-center text-gray-400 text-xl mb-3">
              🛡️
            </div>
            <p className="text-sm font-medium text-gray-300">No Validation Logs Captured Yet</p>
            <p className="text-xs text-gray-500 max-w-md mt-1">
              Ask a question or convert meeting notes in the chat workspace. The independent validation layer will evaluate the response and log all evidence grounding metrics here.
            </p>
          </div>
        ) : (
          validationAuditLogs.map((log: ValidationAuditLog) => {
            const isExpanded = expandedLogId === log.id;
            const res = log.validation_result;

            let badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50';
            let badgeText = 'ACCEPTED (INITIAL MODEL)';
            if (log.routing_decision === 'ROUTED_TO_REASONING') {
              badgeColor = 'bg-blue-950/80 text-blue-300 border-blue-700/50';
              badgeText = 'ROUTED TO REASONING MODEL';
            } else if (log.routing_decision === 'INSUFFICIENT_EVIDENCE_RETURN') {
              badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-700/50';
              badgeText = 'INSUFFICIENT EVIDENCE';
            }

            return (
              <div
                key={log.id}
                className="bg-[#181b27] border border-[#272b3c] rounded-lg overflow-hidden shadow-sm transition hover:border-[#373d54]"
              >
                {/* Log Header Row */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="p-3 bg-[#1e2230] flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-400">{log.timestamp}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeColor}`}>
                      {badgeText}
                    </span>
                    <span className="text-xs font-semibold text-gray-200 truncate max-w-md">
                      "{log.user_query}"
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">Confidence:</span>
                      <span className={`font-bold ${res.confidence >= pipelineConfig.confidenceThreshold ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {(res.confidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    <span className="text-gray-500">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Log Brief Metrics Bar */}
                <div className="px-4 py-2 bg-[#141722] border-b border-[#242838] flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-4">
                    <span>Grounded: <b className={res.grounded ? 'text-emerald-400' : 'text-red-400'}>{res.grounded ? 'YES' : 'NO'}</b></span>
                    <span>Answers Task: <b className={res.answers_question ? 'text-emerald-400' : 'text-red-400'}>{res.answers_question ? 'YES' : 'NO'}</b></span>
                    <span>Evidence: <b className={res.evidence_sufficient ? 'text-emerald-400' : 'text-amber-400'}>{res.evidence_sufficient ? 'SUFFICIENT' : 'INSUFFICIENT'}</b></span>
                  </div>
                  <span className="text-gray-500 font-mono">Model: {log.selected_initial_model}</span>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 space-y-4 text-xs bg-[#121520] border-t border-[#242838]">
                    {/* Reason */}
                    <div>
                      <h4 className="font-bold text-gray-300 mb-1">Validator Evaluation Reason:</h4>
                      <p className="p-2.5 rounded bg-[#1b1f2e] border border-[#2b3045] text-gray-300 font-sans leading-relaxed">
                        {res.reason}
                      </p>
                    </div>

                    {/* Claims & Issues Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-2.5 rounded bg-[#1b1f2e] border border-[#2b3045]">
                        <h5 className="font-bold text-amber-400 mb-1">Unsupported Claims ({res.unsupported_claims.length}):</h5>
                        {res.unsupported_claims.length === 0 ? (
                          <span className="text-gray-500 italic">None identified</span>
                        ) : (
                          <ul className="list-disc list-inside space-y-1 text-gray-300">
                            {res.unsupported_claims.map((claim, idx) => (
                              <li key={idx} className="truncate">{claim}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="p-2.5 rounded bg-[#1b1f2e] border border-[#2b3045]">
                        <h5 className="font-bold text-blue-400 mb-1">Missing Information ({res.missing_information.length}):</h5>
                        {res.missing_information.length === 0 ? (
                          <span className="text-gray-500 italic">None identified</span>
                        ) : (
                          <ul className="list-disc list-inside space-y-1 text-gray-300">
                            {res.missing_information.map((item, idx) => (
                              <li key={idx} className="truncate">{item}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="p-2.5 rounded bg-[#1b1f2e] border border-[#2b3045]">
                        <h5 className="font-bold text-red-400 mb-1">Contradictions ({res.contradictions.length}):</h5>
                        {res.contradictions.length === 0 ? (
                          <span className="text-gray-500 italic">None identified</span>
                        ) : (
                          <ul className="list-disc list-inside space-y-1 text-gray-300">
                            {res.contradictions.map((item, idx) => (
                              <li key={idx} className="truncate">{item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Answer Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <h5 className="font-bold text-gray-400 mb-1">Initial Model Response ({log.selected_initial_model}):</h5>
                        <pre className="p-3 rounded bg-[#0e1017] border border-[#222636] text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono max-h-48 text-[11px]">
                          {log.initial_answer}
                        </pre>
                      </div>

                      <div>
                        <h5 className="font-bold text-gray-400 mb-1">
                          Final Validated Output {log.reasoning_model_used ? `(via ${log.reasoning_model_used})` : ''}:
                        </h5>
                        <pre className="p-3 rounded bg-[#0e1017] border border-[#222636] text-emerald-300 overflow-x-auto whitespace-pre-wrap font-mono max-h-48 text-[11px]">
                          {log.final_answer}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
