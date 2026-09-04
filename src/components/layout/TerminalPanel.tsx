import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  X, 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal, 
  Columns,
  Terminal as TerminalIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

type TabType = 'problems' | 'output' | 'debug' | 'terminal' | 'ports';

export const TerminalPanel: React.FC = () => {
  const { isBottomPanelOpen, setBottomPanelOpen } = useWorkbenchStore();
  const [activeTab, setActiveTab] = useState<TabType>('terminal');
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentShell, setCurrentShell] = useState<'node' | 'pwsh' | 'bash'>('node');

  // Terminal Lines State (styled exactly like real VS Code terminal in Image 2)
  const [terminalHistory, setTerminalHistory] = useState<Array<{ text: string; color?: string; type?: 'cmd' | 'output' | 'info' | 'highlight' | 'warning' }>>([
    { text: 'PS F:\\corewithin>', color: '#cccccc', type: 'cmd' },
    { text: '* History restored', color: '#858585', type: 'info' },
    { text: 'PS F:\\corewithin> npm run dev', color: '#cccccc', type: 'cmd' },
    { text: '> prisa-workbench@0.0.1 dev', color: '#858585', type: 'output' },
    { text: '> astro dev', color: '#858585', type: 'output' },
    { text: '', type: 'output' },
    { text: '19:35:24 [vite] connected.', color: '#4ec9b0', type: 'highlight' },
    { text: '19:35:25 [types] generated 1ms', color: '#858585', type: 'output' },
    { text: '19:35:25 [vite] connected.', color: '#4ec9b0', type: 'highlight' },
    { text: '19:35:25 [vite] Re-optimizing dependencies because vite config has changed', color: '#dcdcaa', type: 'warning' },
    { text: '  astro  v5.2.10 Ready in 1375 ms', color: '#4ec9b0', type: 'highlight' },
    { text: '  Local    http://localhost:4321/', color: '#9cdcfe', type: 'highlight' },
    { text: '  Network  use --host to expose', color: '#858585', type: 'output' },
    { text: '19:35:25 watching for file changes...', color: '#858585', type: 'output' },
  ]);

  const [inputVal, setInputVal] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'terminal') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory, activeTab]);

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    const newLines = [
      ...terminalHistory,
      { text: `PS F:\\corewithin> ${cmd}`, color: '#ffffff', type: 'cmd' as const }
    ];

    const lower = cmd.toLowerCase();
    if (lower === 'clear' || lower === 'cls') {
      setTerminalHistory([
        { text: 'PS F:\\corewithin>', color: '#cccccc', type: 'cmd' }
      ]);
      setInputVal('');
      return;
    } else if (lower === 'help') {
      newLines.push(
        { text: 'Available commands:', color: '#4ec9b0', type: 'info' },
        { text: '  help            - List all available terminal commands', color: '#cccccc' },
        { text: '  clear / cls     - Clear the terminal screen', color: '#cccccc' },
        { text: '  models          - Inspect resident 5 local open-weight neural models', color: '#cccccc' },
        { text: '  clean-meta      - Run local metadata scrubber on demo files', color: '#cccccc' },
        { text: '  status          - Print local server status & air-gap verification', color: '#cccccc' },
        { text: '  ls / dir        - List files in workspace', color: '#cccccc' }
      );
    } else if (lower === 'models') {
      newLines.push(
        { text: 'Resident Local Neural Models:', color: '#4ec9b0', type: 'highlight' },
        { text: '  1. Qwen3-14B (Q4_K_M GGUF)            [9.00 GB]  - Main Reasoning Agent', color: '#9cdcfe' },
        { text: '  2. Qwen2.5-Coder-7B (Q4_K_M GGUF)     [5.44 GB]  - Coding & Python Sandbox', color: '#9cdcfe' },
        { text: '  3. Qwen3-VL-8B (Q4_K_M + F16 MMPROJ)  [6.19 GB]  - Multimodal Vision & OCR', color: '#9cdcfe' },
        { text: '  4. Qwen3-Embedding-0.6B (Safetensors) [1.19 GB]  - Local Dense Embeddings', color: '#9cdcfe' },
        { text: '  5. Qwen3-Reranker-0.6B (Safetensors)  [1.19 GB]  - Context Scoring & Rerank', color: '#9cdcfe' },
        { text: 'VRAM Allocation: 22.8 GB / 24.0 GB (Hardware Acceleration: CUDA 12)', color: '#4ec9b0' }
      );
    } else if (lower === 'clean-meta') {
      newLines.push(
        { text: '[Metadata Scrubber] Scanning demo documents for EXIF & author headers...', color: '#cca700', type: 'warning' },
        { text: '  ✓ meeting_notes_quarterly_review.md : Purged 2 author tags', color: '#4ec9b0' },
        { text: '  ✓ sales_leads_q3.csv                : Stripped file timestamp & user markers', color: '#4ec9b0' },
        { text: '  ✓ research_summary.txt              : Sanitized local file paths', color: '#4ec9b0' },
        { text: 'All files validated clean by local engine.', color: '#4ec9b0' }
      );
    } else if (lower === 'status') {
      newLines.push(
        { text: 'System Status: 100% OPERATIONAL (All services local)', color: '#4ec9b0' },
        { text: '  Frontend : Astro v5.2.10 (http://localhost:4321)', color: '#cccccc' },
        { text: '  Backend  : FastAPI v0.115 (http://localhost:8000)', color: '#cccccc' },
        { text: '  Engine   : llama.cpp with CUDA 12 GPU acceleration', color: '#cccccc' },
        { text: '  Network  : External traffic 0 bytes (Isolated)', color: '#4ec9b0' }
      );
    } else if (lower === 'ls' || lower === 'dir') {
      newLines.push(
        { text: 'Mode                LastWriteTime         Length Name', color: '#858585' },
        { text: 'd-----        04-09-2026  19:40                demo', color: '#9cdcfe' },
        { text: 'd-----        04-09-2026  19:20                models', color: '#9cdcfe' },
        { text: 'd-----        04-09-2026  19:15                llama', color: '#9cdcfe' },
        { text: 'd-----        04-09-2026  19:30                src', color: '#9cdcfe' },
        { text: '-a----        04-09-2026  19:35           785 package.json', color: '#cccccc' },
        { text: '-a----        04-09-2026  19:35          3701 README.md', color: '#cccccc' }
      );
    } else {
      newLines.push({
        text: `'${cmd}' executed. Type 'help' for available commands.`,
        color: '#858585',
        type: 'output'
      });
    }

    setTerminalHistory(newLines);
    setInputVal('');
  };

  if (!isBottomPanelOpen) {
    return (
      <div 
        className="h-6 bg-[#1e1e1e] border-t border-[#2d2d2d] flex items-center justify-between px-3 text-xs select-none cursor-pointer hover:bg-[#252526] transition-colors"
        onClick={() => setBottomPanelOpen(true)}
      >
        <div className="flex items-center gap-3 text-[#858585] text-[11px] font-mono">
          <span className="flex items-center gap-1.5 hover:text-white transition-colors">
            <TerminalIcon className="w-3 h-3 text-[#007acc]" />
            <span>Terminal</span>
          </span>
          <span className="text-[#666666]">|</span>
          <span className="hover:text-white transition-colors">Problems (0)</span>
          <span className="hover:text-white transition-colors">Output</span>
          <span className="hover:text-white transition-colors">Ports</span>
        </div>
        <span className="text-[10px] text-[#858585] font-mono">Click or press Ctrl+` to toggle</span>
      </div>
    );
  }

  return (
    <div 
      className={`bg-[#1e1e1e] border-t border-[#2d2d2d] flex flex-col font-mono text-xs select-none flex-shrink-0 transition-all ${
        isMaximized ? 'h-96' : 'h-60'
      }`}
    >
      {/* 1. VS Code Native Panel Header Bar (Matches Image 2) */}
      <div className="h-8 bg-[#1e1e1e] border-b border-[#2d2d2d] flex items-center justify-between px-3 flex-shrink-0 text-xs">
        {/* Left Side: Standard VS Code Tabs */}
        <div className="flex items-center gap-4 h-full">
          <button
            onClick={() => setActiveTab('problems')}
            className={`h-full flex items-center gap-1.5 text-[11px] transition-colors cursor-pointer border-b-2 ${
              activeTab === 'problems'
                ? 'text-white border-white font-medium'
                : 'text-[#858585] border-transparent hover:text-[#cccccc]'
            }`}
          >
            <span>Problems</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#2d2d2d] text-[10px] text-[#858585]">0</span>
          </button>

          <button
            onClick={() => setActiveTab('output')}
            className={`h-full flex items-center gap-1.5 text-[11px] transition-colors cursor-pointer border-b-2 ${
              activeTab === 'output'
                ? 'text-white border-white font-medium'
                : 'text-[#858585] border-transparent hover:text-[#cccccc]'
            }`}
          >
            <span>Output</span>
          </button>

          <button
            onClick={() => setActiveTab('debug')}
            className={`h-full flex items-center gap-1.5 text-[11px] transition-colors cursor-pointer border-b-2 ${
              activeTab === 'debug'
                ? 'text-white border-white font-medium'
                : 'text-[#858585] border-transparent hover:text-[#cccccc]'
            }`}
          >
            <span>Debug Console</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`h-full flex items-center gap-1.5 text-[11px] transition-colors cursor-pointer border-b-2 ${
              activeTab === 'terminal'
                ? 'text-white border-white font-medium'
                : 'text-[#858585] border-transparent hover:text-[#cccccc]'
            }`}
          >
            <span>Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('ports')}
            className={`h-full flex items-center gap-1.5 text-[11px] transition-colors cursor-pointer border-b-2 ${
              activeTab === 'ports'
                ? 'text-white border-white font-medium'
                : 'text-[#858585] border-transparent hover:text-[#cccccc]'
            }`}
          >
            <span>Ports</span>
          </button>
        </div>

        {/* Right Side: Shell Selector + VS Code Terminal Icons (Matches Image 2) */}
        <div className="flex items-center gap-1.5 text-[#858585]">
          {/* Shell Dropdown Indicator */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#252526] border border-[#333333] text-[11px] text-[#cccccc] cursor-pointer hover:bg-[#2a2a2b]">
            <TerminalIcon className="w-3 h-3 text-[#4ec9b0]" />
            <span>{currentShell}</span>
            <ChevronDown className="w-3 h-3 text-[#858585]" />
          </div>

          {/* New Terminal (+) */}
          <button 
            onClick={() => {
              setTerminalHistory(prev => [
                ...prev,
                { text: 'New terminal session created (node 2).', color: '#858585', type: 'info' },
                { text: 'PS F:\\corewithin>', color: '#cccccc', type: 'cmd' }
              ]);
            }}
            title="New Terminal" 
            className="p-1 hover:text-white hover:bg-[#2d2d2d] rounded transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Split Terminal */}
          <button 
            onClick={() => {
              setTerminalHistory(prev => [
                ...prev,
                { text: 'Terminal split active [1:node, 2:pwsh].', color: '#858585', type: 'info' }
              ]);
            }}
            title="Split Terminal" 
            className="p-1 hover:text-white hover:bg-[#2d2d2d] rounded transition-colors cursor-pointer"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>

          {/* Kill Terminal (Trash) */}
          <button 
            onClick={() => {
              setTerminalHistory([
                { text: 'Terminal process terminated.', color: '#ce9178', type: 'warning' },
                { text: 'PS F:\\corewithin>', color: '#cccccc', type: 'cmd' }
              ]);
            }}
            title="Kill Terminal" 
            className="p-1 hover:text-white hover:bg-[#2d2d2d] rounded transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* More Actions (...) */}
          <button 
            title="More Actions" 
            className="p-1 hover:text-white hover:bg-[#2d2d2d] rounded transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Size (^) */}
          <button 
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? "Restore Panel Size" : "Maximize Panel Size"} 
            className="p-1 hover:text-white hover:bg-[#2d2d2d] rounded transition-colors cursor-pointer"
          >
            {isMaximized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {/* Close Panel (X) */}
          <button 
            onClick={() => setBottomPanelOpen(false)}
            title="Close Panel" 
            className="p-1 hover:text-white hover:bg-[#2d2d2d] rounded transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Panel Content Body */}
      <div className="flex-1 bg-[#181818] overflow-y-auto p-3 text-xs leading-5">
        {/* Terminal Tab Content */}
        {activeTab === 'terminal' && (
          <div className="h-full flex flex-col justify-between" onClick={() => inputRef.current?.focus()}>
            <div className="space-y-0.5">
              {terminalHistory.map((line, idx) => (
                <div key={idx} className="font-mono text-[11.5px] whitespace-pre-wrap select-text leading-tight">
                  <span style={{ color: line.color || '#cccccc' }}>{line.text}</span>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Interactive Terminal Input Line */}
            <form onSubmit={handleRunCommand} className="flex items-center gap-1.5 mt-2 font-mono text-[11.5px] select-text">
              <span className="text-[#cccccc] select-none">PS F:\corewithin&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Type 'help', 'models', 'clean-meta', or commands..."
                className="flex-1 bg-transparent border-none outline-none text-white font-mono text-[11.5px] p-0 focus:ring-0 placeholder-[#555555]"
                autoFocus
              />
            </form>
          </div>
        )}

        {/* Problems Tab Content */}
        {activeTab === 'problems' && (
          <div className="h-full flex items-center justify-center text-[#858585] text-xs font-sans">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4ec9b0]" />
              <span>No problems have been detected in the workspace.</span>
            </div>
          </div>
        )}

        {/* Output Tab Content */}
        {activeTab === 'output' && (
          <div className="space-y-1 text-[#858585] font-mono text-[11px] select-text">
            <div className="text-[#4ec9b0]">[Local Inference Engine — llama.cpp CUDA 12]</div>
            <div>[server] listening on http://127.0.0.1:8080</div>
            <div>[server] resident model: Qwen3-14B-Q4_K_M.gguf (9.00 GB)</div>
            <div>[server] vision model: Qwen3VL-8B-Instruct-Q4_K_M.gguf (5.03 GB)</div>
            <div>[server] embedding engine: Qwen3-Embedding-0.6B (Safetensors)</div>
            <div>[server] reranker engine: Qwen3-Reranker-0.6B (Safetensors)</div>
            <div>[cuda] 1 physical GPU device initialized: NVIDIA RTX (VRAM Allocated: 22.8 GB / 24.0 GB)</div>
            <div className="text-[#4ec9b0]">All inference is strictly on-premise. Zero external network egress.</div>
          </div>
        )}

        {/* Debug Console Tab Content */}
        {activeTab === 'debug' && (
          <div className="h-full flex flex-col justify-between text-[#858585] font-mono text-[11px]">
            <div>
              <div>Debug Console</div>
              <div>Connected to local Python sandbox and Astro dev server runtime.</div>
            </div>
            <div className="flex items-center gap-2 text-[#cccccc]">
              <span>&gt;</span>
              <span className="text-[#666666]">Ready for debug evaluation...</span>
            </div>
          </div>
        )}

        {/* Ports Tab Content */}
        {activeTab === 'ports' && (
          <div className="space-y-2 text-xs font-sans">
            <table className="w-full text-left font-mono text-[11px]">
              <thead className="border-b border-[#2d2d2d] text-[#858585]">
                <tr>
                  <th className="pb-1">PORT</th>
                  <th className="pb-1">PROCESS</th>
                  <th className="pb-1">LOCAL ADDRESS</th>
                  <th className="pb-1">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252526] text-[#cccccc]">
                <tr>
                  <td className="py-1.5 text-[#4ec9b0] font-bold">4321</td>
                  <td>astro dev</td>
                  <td>http://localhost:4321</td>
                  <td><span className="px-1.5 py-0.5 rounded bg-[#1f3a2b] text-[#4ec9b0] text-[10px]">Active</span></td>
                </tr>
                <tr>
                  <td className="py-1.5 text-[#4ec9b0] font-bold">8000</td>
                  <td>fastapi backend</td>
                  <td>http://localhost:8000</td>
                  <td><span className="px-1.5 py-0.5 rounded bg-[#1f3a2b] text-[#4ec9b0] text-[10px]">Active</span></td>
                </tr>
                <tr>
                  <td className="py-1.5 text-[#4ec9b0] font-bold">8080</td>
                  <td>llama-server (CUDA)</td>
                  <td>http://localhost:8080</td>
                  <td><span className="px-1.5 py-0.5 rounded bg-[#1f3a2b] text-[#4ec9b0] text-[10px]">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
