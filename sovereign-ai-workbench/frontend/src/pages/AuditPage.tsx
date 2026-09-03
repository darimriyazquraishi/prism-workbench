import React, { useEffect, useState } from 'react';
import { ShieldCheck, Clock, Check, AlertCircle, FileText, Cpu, Wrench } from 'lucide-react';
import { api } from '../services/api';
import { AuditEvent } from '../types';

export const AuditPage: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    api.listAuditEvents().then(setEvents).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Air-Gapped Sovereign Audit Log & Activity Trail
          </h2>
          <p className="text-xs text-zinc-400">
            Immutable SQLite-backed activity logging for models, tool calls, documents, and sandbox execution
          </p>
        </div>

        <span className="text-xs font-mono text-zinc-400">
          Recorded Events: {events.length}
        </span>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400 font-mono">
              <tr>
                <th className="py-3 px-4">Event ID / Timestamp</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Task ID</th>
                <th className="py-3 px-4">Model / Tool Used</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {events.map((ev) => (
                <tr key={ev.event_id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <div className="text-zinc-200 font-bold">{ev.event_id}</div>
                    <div className="text-zinc-500">{new Date(ev.timestamp).toLocaleTimeString()}</div>
                  </td>

                  <td className="py-3 px-4 font-medium">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px] text-sky-400">
                      {ev.event_type}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                    {ev.task_id || 'SYSTEM'}
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px]">
                    {ev.model_used && <span className="text-indigo-400 mr-2">[{ev.model_used}]</span>}
                    {ev.tool_used && <span className="text-sky-300">{ev.tool_used}</span>}
                    {!ev.model_used && !ev.tool_used && <span className="text-zinc-500">—</span>}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        ev.status === 'SUCCESS' || ev.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {ev.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
