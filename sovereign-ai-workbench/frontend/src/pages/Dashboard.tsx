import React, { useEffect, useState } from 'react';
import { Bot, FileText, FolderArchive, ShieldCheck, ArrowRight, Play, Cpu } from 'lucide-react';
import { useWorkbenchStore } from '../store/useWorkbenchStore';
import { SovereigntyStatus } from '../components/system/SovereigntyStatus';
import { api } from '../services/api';

export const Dashboard: React.FC = () => {
  const { setActiveTab } = useWorkbenchStore();
  const [stats, setStats] = useState({
    tasksCount: 0,
    documentsCount: 0,
    artifactsCount: 0,
    modelsCount: 4
  });

  useEffect(() => {
    Promise.all([
      api.listTasks().catch(() => []),
      api.listDocuments().catch(() => []),
      api.listArtifacts().catch(() => [])
    ]).then(([tasks, docs, arts]) => {
      setStats({
        tasksCount: tasks.length,
        documentsCount: docs.length,
        artifactsCount: arts.length,
        modelsCount: 4
      });
    });
  }, []);

  const quickDemos = [
    {
      title: 'Demo 1: Scanned Inspection & Approval Note',
      description: 'OCR scanned column report, retrieve SOP-OPS-014, compute corrosion rate, and export Word (.docx) deliverable.',
      tab: 'agent'
    },
    {
      title: 'Demo 2: Coding Sandbox & MTBF Reliability',
      description: 'Route to Qwen2.5-Coder, execute sandboxed Python data script on Pump_Failure_Data.xlsx, and produce Excel metrics.',
      tab: 'agent'
    },
    {
      title: 'Demo 3: Multimodal P&ID & Air-Gap Proof',
      description: 'Visual tag detection on P&ID diagram (P-102, V-14, CV-101) with zero network connectivity.',
      tab: 'agent'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Sovereignty Compliance Status Banner */}
      <SovereigntyStatus />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Executed Tasks</span>
            <Bot className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-2 font-mono">{stats.tasksCount}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Multi-step Agent Runs</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Internal Documents</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-2 font-mono">{stats.documentsCount}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Indexed in Local Vector DB</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Generated Artifacts</span>
            <FolderArchive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-2 font-mono">{stats.artifactsCount}</div>
          <div className="text-[11px] text-zinc-500 mt-1">DOCX, XLSX, PPTX Files</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Active Local Models</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-2 font-mono">{stats.modelsCount}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Qwen & Nomic (Air-Gapped)</div>
        </div>
      </div>

      {/* Quick Judge Demo Launches */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Official SIH26117 Demonstration Flows</h3>
            <p className="text-xs text-zinc-400">Pre-configured test scenarios for judge presentation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickDemos.map((demo, idx) => (
            <div
              key={idx}
              className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-lg flex flex-col justify-between space-y-3 hover:border-sky-500/50 transition-all cursor-pointer group"
              onClick={() => setActiveTab(demo.tab)}
            >
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-zinc-200 group-hover:text-sky-400 transition-colors flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
                  {demo.title}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{demo.description}</p>
              </div>

              <div className="flex items-center justify-end text-xs font-medium text-sky-400 gap-1 pt-2">
                <span>Launch in Agent</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
