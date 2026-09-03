import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Lock
} from 'lucide-react';
import type { AuditEvent } from '../../types';

const initialAuditEvents: AuditEvent[] = [
  {
    event_id: 'AUD-994A1B',
    timestamp: '2026-02-15T14:32:45Z',
    event_type: 'DOCX_GENERATED',
    task_id: 'TASK-CDU5-001',
    user: 'lead_inspection_eng',
    model_used: 'qwen3-8b',
    tool_used: 'generate_docx',
    files_accessed: ['Inspection_Report_001.pdf', 'Operations_SOP_014.pdf'],
    artifact_created: 'Approval_Note_Unit5_Inspection.docx',
    status: 'SUCCESS',
    details: { deliverable: 'Approval_Note_Unit5_Inspection.docx', sign_off_block: 'Included' }
  },
  {
    event_id: 'AUD-882B2C',
    timestamp: '2026-02-15T14:32:30Z',
    event_type: 'CALCULATION_EXECUTED',
    task_id: 'TASK-CDU5-001',
    user: 'lead_inspection_eng',
    tool_used: 'industrial_corrosion_calculator',
    files_accessed: [],
    status: 'SUCCESS',
    details: { corrosion_rate: '0.343 mm/yr', remaining_life: '2.33 yrs', formula: 'API 570' }
  },
  {
    event_id: 'AUD-771C3D',
    timestamp: '2026-02-15T14:32:15Z',
    event_type: 'RAG_RETRIEVAL',
    task_id: 'TASK-CDU5-001',
    user: 'lead_inspection_eng',
    model_used: 'nomic-embed-text',
    tool_used: 'search_internal_knowledge',
    files_accessed: ['Operations_SOP_014.pdf'],
    status: 'SUCCESS',
    details: { query: 'corrosion threshold', chunks_retrieved: 2, top_score: 0.962 }
  },
  {
    event_id: 'AUD-660D4E',
    timestamp: '2026-02-15T14:32:02Z',
    event_type: 'OCR_PAGE_PARSED',
    task_id: 'TASK-CDU5-001',
    user: 'lead_inspection_eng',
    tool_used: 'ocr_document',
    files_accessed: ['Inspection_Report_001.pdf'],
    status: 'SUCCESS',
    details: { pages_parsed: 4, ocr_engine: 'PaddleOCR Local', text_length: 2450 }
  },
  {
    event_id: 'AUD-559E5F',
    timestamp: '2026-02-15T14:15:10Z',
    event_type: 'SANDBOX_EXECUTED',
    task_id: 'TASK-PUMP-002',
    user: 'reliability_analyst',
    model_used: 'qwen2.5-coder-7b',
    tool_used: 'execute_python',
    files_accessed: ['Pump_Failure_Data.xlsx'],
    artifact_created: 'Pump_Reliability_Analysis_2026.xlsx',
    status: 'SUCCESS',
    details: { sandbox: 'Docker Isolated', network: 'NONE', exit_code: 0, duration_ms: 540 }
  }
];

export const AuditLogView: React.FC = () => {
  const [events] = useState<AuditEvent[]>(initialAuditEvents);
  const [filterText, setFilterText] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent>(initialAuditEvents[0]);

  const filteredEvents = events.filter(e => 
    e.event_id.toLowerCase().includes(filterText.toLowerCase()) ||
    e.event_type.toLowerCase().includes(filterText.toLowerCase()) ||
    (e.tool_used && e.tool_used.toLowerCase().includes(filterText.toLowerCase())) ||
    (e.task_id && e.task_id.toLowerCase().includes(filterText.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col space-y-4 font-sans text-sm overflow-hidden">
      {/* 1. TOP TOOLBAR */}
      <div className="bg-[#252526] border border-[#333333] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 select-none flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono font-bold text-white text-sm">
            <ShieldCheck className="w-5 h-5 text-[#4ec9b0]" />
            <span>Immutable Audit Trail:</span>
            <span className="text-[#9cdcfe]">SQLite Storage</span>
          </div>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#1e1e1e] text-[#4ec9b0] border border-[#3c3c3c]">
            Zero-Leak Guaranteed
          </span>
        </div>

        {/* Filter Input */}
        <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded px-3 py-1 font-mono text-xs">
          <Search className="w-4 h-4 text-[#858585]" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter audit events..."
            className="bg-transparent border-none text-xs text-[#cccccc] placeholder-[#666666] focus:outline-none w-48 font-sans"
          />
        </div>
      </div>

      {/* 2. MAIN 2-PANE AUDIT WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left: Audit Grid (8 Cols) */}
        <div className="lg:col-span-8 bg-[#252526] border border-[#333333] rounded-lg flex flex-col overflow-hidden shadow-sm">
          <div className="h-9 bg-[#1e1e1e] border-b border-[#333333] px-4 flex items-center justify-between font-mono text-xs text-[#999999] flex-shrink-0">
            <span>EVENT TIMELINE ({filteredEvents.length} RECORDS)</span>
            <span>STORAGE: /data/audit/audit_log.db</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#1e1e1e] text-xs uppercase text-[#858585] border-b border-[#333333]">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Tool / Model</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]">
                {filteredEvents.map((ev) => {
                  const isSelected = selectedEvent.event_id === ev.event_id;
                  return (
                    <tr
                      key={ev.event_id}
                      onClick={() => setSelectedEvent(ev)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#37373d]' : 'hover:bg-[#2a2d2e]'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-[#569cd6] text-xs">{ev.event_id}</td>
                      <td className="py-3 px-4 text-[#858585] text-xs">{ev.timestamp.replace('T', ' ').replace('Z', '')}</td>
                      <td className="py-3 px-4 text-white text-xs font-semibold">{ev.event_type}</td>
                      <td className="py-3 px-4 text-[#cccccc] text-xs">{ev.tool_used || ev.model_used || 'SYSTEM'}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2.5 py-0.5 rounded bg-[#1f3a2b] text-[#4ec9b0] border border-[#2e5d44] font-bold">
                          {ev.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Record Inspector (4 Cols) */}
        <div className="lg:col-span-4 bg-[#252526] border border-[#333333] rounded-lg p-5 flex flex-col space-y-4 overflow-y-auto font-mono text-xs shadow-sm">
          <div className="flex items-center justify-between border-b border-[#333333] pb-2 text-sm uppercase font-bold text-white">
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#4ec9b0]" />
              Event Inspector
            </span>
            <span className="text-[#569cd6] font-bold text-xs">{selectedEvent.event_id}</span>
          </div>

          <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg p-3.5 space-y-1.5 text-xs">
            <div>
              <span className="text-[10px] text-[#858585] uppercase block">EVENT TYPE:</span>
              <span className="text-white font-bold">{selectedEvent.event_type}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#858585] uppercase block">USER / OPERATOR:</span>
              <span className="text-[#cccccc]">{selectedEvent.user}</span>
            </div>
            {selectedEvent.task_id && (
              <div>
                <span className="text-[10px] text-[#858585] uppercase block">ASSOCIATED TASK ID:</span>
                <span className="text-[#569cd6]">{selectedEvent.task_id}</span>
              </div>
            )}
            {selectedEvent.tool_used && (
              <div>
                <span className="text-[10px] text-[#858585] uppercase block">TOOL INVOKED:</span>
                <span className="text-[#cca700] font-bold">{selectedEvent.tool_used}</span>
              </div>
            )}
          </div>

          {/* Details Payload */}
          <div className="space-y-1.5">
            <span className="text-xs text-[#858585] uppercase font-bold block">
              Execution Payload:
            </span>
            <div className="p-3 bg-[#181818] border border-[#3c3c3c] rounded-lg text-xs text-[#4ec9b0] overflow-x-auto">
              <pre>{JSON.stringify(selectedEvent.details, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
