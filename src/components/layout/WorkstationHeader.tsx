import React from 'react';
import { 
  ShieldCheck, 
  WifiOff, 
  Play, 
  Cpu, 
  Sparkles,
  FileCheck
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';
import logo from '../../assets/logo.jpg';

interface WorkstationHeaderProps {
  onLaunchDemo: (prompt: string, file: string) => void;
}

export const WorkstationHeader: React.FC<WorkstationHeaderProps> = ({ onLaunchDemo }) => {
  const { activeTask, isProcessing } = useWorkbenchStore();

  const demoScenarios = [
    {
      id: 'demo1',
      title: 'Demo 1: Scanned Inspection PDF -> API 570 Math -> Word Approval Note (.docx)',
      shortTitle: 'Demo 1: Inspection -> Word (.docx)',
      prompt: 'Read this scanned inspection report, identify the major findings, compare them against SOP-OPS-014, calculate the corrosion rate and remaining life, prepare an approval note, and export as a Word (.docx) document.',
      file: 'demo/synthetic/Inspection_Report_001.pdf',
      badge: 'DOCX + OCR'
    },
    {
      id: 'demo2',
      title: 'Demo 2: Pump Failure Excel -> Isolated Python Sandbox -> Excel Reliability Report',
      shortTitle: 'Demo 2: Pump Data -> Python Sandbox',
      prompt: 'Analyze Pump_Failure_Data.xlsx, write and execute Python code in the sandbox to calculate monthly MTBF statistics, and produce an Excel deliverable.',
      file: 'demo/synthetic/Pump_Failure_Data.xlsx',
      badge: 'PYTHON + SANDBOX'
    },
    {
      id: 'demo3',
      title: 'Demo 3: P&ID Engineering Schematic -> Vision-Language Component Extraction',
      shortTitle: 'Demo 3: P&ID Drawing Vision',
      prompt: 'Perform vision analysis on P_and_ID_Example.png, identify all pumps, valves, and flow lines, and generate an executive summary briefing deck.',
      file: 'demo/synthetic/P_and_ID_Example.png',
      badge: 'VLM + CAD'
    }
  ];

  return (
    <header className="h-12 bg-[#323233] border-b border-[#2d2d2d] px-4 flex items-center justify-between select-none flex-shrink-0 z-20">
      {/* Left: Organization & Project Title */}
      <div className="flex items-center gap-3">
        <img src={logo.src} alt="LUMI" className="w-6 h-6 rounded object-cover shadow-sm" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm tracking-tight">LUMI</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1e1e1e] text-[#4ec9b0] border border-[#3c3c3c] font-medium">
              MRPL CDU-5
            </span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[#454545] mx-1 hidden sm:block"></div>

        {/* Air-Gap Guarantee */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1e1e1e] border border-[#3c3c3c] text-xs font-mono text-[#4ec9b0]">
          <WifiOff className="w-3.5 h-3.5 text-[#4ec9b0]" />
          <span className="font-semibold">Air-Gapped Sovereign</span>
          <span className="text-[#858585] border-l border-[#3c3c3c] pl-2 font-bold text-[#4ec9b0]">
            0 Cloud Calls
          </span>
        </div>
      </div>

      {/* Center: Quick 1-Click Golden Demos */}
      <div className="hidden lg:flex items-center gap-1.5 bg-[#252526] p-1 rounded border border-[#3c3c3c]">
        <span className="text-xs font-mono uppercase text-[#858585] px-2 font-semibold flex items-center gap-1">
          <Play className="w-3 h-3 text-[#569cd6] fill-[#569cd6]" />
          Quick Demos:
        </span>
        {demoScenarios.map((demo) => (
          <button
            key={demo.id}
            onClick={() => onLaunchDemo(demo.prompt, demo.file)}
            disabled={isProcessing}
            title={demo.title}
            className="px-3 py-1 rounded text-xs font-medium bg-[#333333] hover:bg-[#007acc] text-[#e0e0e0] hover:text-white border border-[#3c3c3c] hover:border-[#007acc] transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{demo.shortTitle}</span>
          </button>
        ))}
      </div>

      {/* Right: Resident Local Model Badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#252526] border border-[#3c3c3c] text-xs font-mono text-[#cccccc]">
          <Cpu className="w-3.5 h-3.5 text-[#569cd6]" />
          <span className="font-medium">{activeTask ? activeTask.selected_model_id : 'Qwen3-8B Local'}</span>
        </div>

        <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#1e1e1e] border border-[#3c3c3c] text-[#4ec9b0] text-xs font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ON-PREMISE</span>
        </div>
      </div>
    </header>
  );
};
