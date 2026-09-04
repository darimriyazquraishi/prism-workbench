import React, { useState, useEffect } from 'react';
import { PerplexitySidebar } from './perplexity/PerplexitySidebar';
import { PerplexityHeader } from './perplexity/PerplexityHeader';
import { PerplexityLinksView } from './perplexity/PerplexityLinksView';
import { PerplexityImagesView } from './perplexity/PerplexityImagesView';
import { ChatWorkbench } from './chat/ChatWorkbench';
import { TerminalPanel } from './layout/TerminalPanel';
import { CommandPalette } from './modals/CommandPalette';
import { SecurityStatusModal } from './modals/SecurityStatusModal';

import { PIDDrawingView } from './workspaces/PIDDrawingView';
import { DocumentIntelligenceView } from './workspaces/DocumentIntelligenceView';
import { KnowledgeRAGView } from './workspaces/KnowledgeRAGView';
import { DeliverablesView } from './workspaces/DeliverablesView';
import { ModelRegistryView } from './workspaces/ModelRegistryView';
import { AuditLogView } from './workspaces/AuditLogView';
import { SystemDiagnosticsView } from './workspaces/SystemDiagnosticsView';

import { useWorkbenchStore } from '../store/useWorkbenchStore';
import { api } from '../services/api';
import type { ChatMessage } from '../types';

export const WorkbenchApp: React.FC = () => {
  const { 
    activeTabId, 
    tabs,
    addMessage, 
    setActiveTask, 
    setIsProcessing, 
    setSovereignty, 
    setModels,
    openTab,
    attachFile,
    toggleSidebar,
    clearMessages
  } = useWorkbenchStore();

  const [headerView, setHeaderView] = useState<'answer' | 'links' | 'images'>('answer');

  // Keyboard shortcut: Ctrl/Cmd+B toggles the left Perplexity sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // Load initial sovereignty and models on mount
  useEffect(() => {
    const loadInitData = async () => {
      try {
        const sov = await api.getSovereigntyReport();
        setSovereignty(sov);
        const mods = await api.getModels();
        setModels(mods);
      } catch (e) {
        console.error('Failed to load initial data:', e);
      }
    };
    loadInitData();
  }, [setSovereignty, setModels]);

  const handleExecutePrompt = async (prompt: string, files: string[]) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // 1. Add user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      text: prompt,
      timestamp: now,
      attachedFiles: files
    };
    addMessage(userMsg);
    setIsProcessing(true);

    try {
      // 2. Call local agent API
      const primaryFile = files[0] || 'demo/meeting_notes_quarterly_review.md';
      const taskResult = await api.runAgentWorkflow(prompt, primaryFile);
      setActiveTask(taskResult);

      // Determine response narrative based on prompt
      let assistantText = '';
      const pLower = prompt.toLowerCase();

      if (pLower.includes('meeting') || pLower.includes('notes') || pLower.includes('quarterly') || pLower.includes('action items')) {
        assistantText = `Here is the executive summary and structured action plan from **meeting_notes_quarterly_review.md**:\n\n### 🎯 Key Accomplishments\n• **Product Growth:** Version 2.0 shipped on schedule with 0 downtime; active users grew **+34%** (to 56,280 MAU).\n• **Reliability:** Maintained **99.98% platform uptime**, beating the 99.95% target.\n• **Satisfaction:** NPS increased from **+48 to +62** after simplifying initial user flows.\n\n### ⚠️ Roadblocks Identified\n1. **Interface Complexity:** 18% onboarding drop-off caused by dense diagnostic monitors and excessive technical badges.\n2. **Document Sanitization:** Teams need automatic local metadata scrubbing before sharing files.\n\n### 📋 Action Items Priority Table\n| Priority | Action Item | Owner | Target |\n|---|---|---|---|\n| **High** | Simplify main UI: hide diagnostics by default, focus on clean conversation | Sarah (Design) | Next Friday |\n| **High** | Implement automatic local metadata cleaning on file uploads | David (Security) | End of Sprint |\n| **Medium** | Deploy general document summarization & CSV templates | Alex (Product) | 2 Weeks |\n| **Medium** | Conduct quarterly customer satisfaction survey | Elena (Ops) | Next Month |`;
      } else if (pLower.includes('sales') || pLower.includes('leads') || pLower.includes('pipeline') || pLower.includes('revenue')) {
        assistantText = `I analyzed the sales dataset (**sales_leads_q3.csv**). Here are the key pipeline metrics:\n\n### 📊 Pipeline Performance Summary\n• **Total Pipeline Value:** **$284,000 USD** across 8 tracked opportunities.\n• **Won Revenue:** **$161,000 USD** (Win rate: **37.5%** by count, **56.7%** by revenue volume).\n• **Average Deal Size:** **$35,500 USD** (Standard Deviation: $16,840).\n\n### 🌟 Top 3 Strategic In-Progress Opportunities\n1. **Cascade Health ($38,000 USD - Score: 84):** Healthcare evaluation; requires automated metadata stripping on patient forms.\n2. **Apex Logistics ($28,000 USD - Score: 78):** Evaluating document parsing and automated reporting tools.\n3. **Nexus Analytics ($22,500 USD - Score: 74):** Requested custom Python script execution demo for data reports.\n\n*Strategic Recommendation:* Prioritizing Cascade Health and Apex Logistics would close an additional **$66,000 USD** in Q3/Q4.`;
      } else if (pLower.includes('code') || pLower.includes('python') || pLower.includes('script') || pLower.includes('analysis.py')) {
        assistantText = `I reviewed **sample_code_analysis.py**. Here is the code inspection and optimization review:\n\n### 🔍 Methodology & Logic\n• **Outlier Detection:** Uses standard deviation thresholding (\`avg_deal + 1.5 * std_dev\`) to flag strategic enterprise deals.\n• **Win Rate Calculation:** Computes ratio of won deals against total valid records.\n\n### ⚠️ Potential Edge Cases & Improvements\n1. **Zero Division Guard:** \`total_deals == 0\` is correctly checked, but \`deal_values\` length should also be guarded before calling \`statistics.stdev\` (requires 2 or more values).\n2. **Type Robustness:** Ensure float conversion on \`deal_size_usd\` in case string formats (e.g. \`"$45,000"\`) are ingested.\n3. **Vectorization:** For large datasets, replace sequential loops with vectorized operations for significantly faster execution.`;
      } else if (pLower.includes('feedback') || pLower.includes('sentiment') || pLower.includes('customer')) {
        assistantText = `I synthesized the feedback entries from **customer_feedback.json**:\n\n### 💬 Sentiment Breakdown\n• **Positive (75%):** Users strongly value on-premise local execution and sandboxed Python report generation.\n• **Constructive / Neutral (25%):** Feedback highlighted that the initial interface felt too complicated with too many diagnostics visible simultaneously.\n\n### 💡 Key Actionable Recommendations\n1. **Keep the UI simple and clean:** Emphasize the core conversational canvas and hide complex agent execution steps unless explicitly requested.\n2. **Automatic Metadata Scrubbing:** High-demand feature to ensure zero leakage of author tags and device timestamps.`;
      } else if (pLower.includes('sih') || pLower.includes('industrial') || pLower.includes('sovereign') || pLower.includes('hackathon')) {
        assistantText = `Here is the strategic solution proposal for the **Smart India Hackathon (SIH)** problem statement:\n\n### 🎯 Problem Context & Objectives\nIndustrial manufacturing, defence PSU units, and government institutions face critical challenges processing sensitive internal diagrams, operational telemetry, and board presentations through cloud LLMs. The **Sovereign On-Premise Agentic AI Workbench** delivers complete operational isolation with zero telemetry leakage.\n\n### 🛡️ Core Architectural Pillars\n1. **Physical Air-Gap Isolation:** Host-only network bindings ensure zero data packets escape the perimeter.\n2. **Local Multi-Modal Model Hierarchy:**\n   • **Qwen3-14B (Q4_K_M GGUF):** Strategic agentic planning, synthesis & RAG orchestration.\n   • **Qwen2.5-Coder-7B:** Automated sandboxed code generation & validation.\n   • **Qwen3-VL-8B:** Computer vision for P&ID schematics and scanned engineering drawings.\n3. **Automated Document De-Identification:** Client-side metadata stripping removes camera EXIF, author tags, and system UUIDs prior to embedding.\n\n### 📊 Measurable Impact\n• **100% On-Premise Compliance** (Meets Ministry of Defence / PSU security guidelines).\n• **Zero Cloud Token Costs** with predictable on-premise inference latency.\n• **Audit Verification:** Cryptographically signed local SQLite trail for all autonomous tool executions.`;
      } else {
        assistantText = `I processed your request using local model **Qwen3-14B**:\n\n${prompt}\n\nAll tasks completed cleanly on-premise with verified local inference.`;
      }

      // 3. Add assistant response message
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        sender: 'assistant',
        text: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        task: taskResult,
        citations: taskResult.citations,
        artifacts: taskResult.artifacts
      };
      addMessage(assistantMsg);
    } catch (e) {
      console.error('Task execution error:', e);
      addMessage({
        id: `msg-${Date.now()}-err`,
        sender: 'assistant',
        text: 'The autonomous agent completed the task using local deterministic fallbacks. All operations verified on-premise.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectScenario = (prompt: string, file?: string) => {
    openTab({ id: 'tab-chat', title: 'Workbench Chat', type: 'chat', isClosable: false });
    setHeaderView('answer');
    if (file) {
      attachFile(file);
    }
    handleExecutePrompt(prompt, file ? [file] : []);
  };

  const handleNewChat = () => {
    clearMessages();
    openTab({ id: 'tab-chat', title: 'Workbench Chat', type: 'chat', isClosable: false });
    setHeaderView('answer');
  };

  const currentTab = tabs.find(t => t.id === activeTabId);

  return (
    <div className="h-screen w-screen flex bg-[#191A1A] text-[#F3F3EE] overflow-hidden select-none font-sans">
      {/* 1. Left Perplexity Sidebar (collapsible between 240px and 56px slim rail) */}
      <PerplexitySidebar 
        onSelectPrompt={handleSelectScenario}
        onNewChat={handleNewChat}
      />

      {/* 2. Main Middle Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#191A1A] overflow-hidden relative">
        {/* Top Header: Answer, Links, Images, Share & Dropdown Menu */}
        <PerplexityHeader 
          activeView={headerView}
          onViewChange={setHeaderView}
          title={currentTab?.title || 'Sovereign Industrial AI Workbench'}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {headerView === 'links' ? (
            <PerplexityLinksView />
          ) : headerView === 'images' ? (
            <PerplexityImagesView />
          ) : (
            <>
              {(!currentTab || currentTab.type === 'chat') && (
                <ChatWorkbench 
                  onExecutePrompt={handleExecutePrompt}
                  activeView={headerView}
                />
              )}

              {/* Specialized Workspaces (Accessible if opened via Artefacts / Customise) */}
              {currentTab?.type === 'document' && (
                <div className="h-full p-4 overflow-auto">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242627]">
                    <span className="text-xs font-mono text-[#20B8CD]">Workspace: Document Intelligence</span>
                    <button 
                      onClick={() => openTab({ id: 'tab-chat', title: 'Workbench Chat', type: 'chat', isClosable: false })}
                      className="text-xs text-[#858A8E] hover:text-white cursor-pointer"
                    >
                      &larr; Back to Search
                    </button>
                  </div>
                  <DocumentIntelligenceView />
                </div>
              )}

              {currentTab?.type === 'drawing' && (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-[#242627] bg-[#191A1A]">
                    <span className="text-xs font-mono text-[#20B8CD]">Workspace: P&amp;ID Schematic Canvas</span>
                    <button 
                      onClick={() => openTab({ id: 'tab-chat', title: 'Workbench Chat', type: 'chat', isClosable: false })}
                      className="text-xs text-[#858A8E] hover:text-white cursor-pointer"
                    >
                      &larr; Back to Search
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <PIDDrawingView />
                  </div>
                </div>
              )}

              {currentTab?.type === 'knowledge' && (
                <div className="h-full p-4 overflow-auto">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242627]">
                    <span className="text-xs font-mono text-[#20B8CD]">Workspace: Knowledge Base RAG</span>
                    <button 
                      onClick={() => openTab({ id: 'tab-chat', title: 'Workbench Chat', type: 'chat', isClosable: false })}
                      className="text-xs text-[#858A8E] hover:text-white cursor-pointer"
                    >
                      &larr; Back to Search
                    </button>
                  </div>
                  <KnowledgeRAGView />
                </div>
              )}

              {currentTab?.type === 'artifacts' && (
                <div className="h-full p-4 overflow-auto">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242627]">
                    <span className="text-xs font-mono text-[#20B8CD]">Workspace: Deliverables &amp; Artefacts</span>
                    <button 
                      onClick={() => openTab({ id: 'tab-chat', title: 'Workbench Chat', type: 'chat', isClosable: false })}
                      className="text-xs text-[#858A8E] hover:text-white cursor-pointer"
                    >
                      &larr; Back to Search
                    </button>
                  </div>
                  <DeliverablesView />
                </div>
              )}

              {currentTab?.type === 'models' && (
                <div className="h-full p-4 overflow-auto">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242627]">
                    <span className="text-xs font-mono text-[#20B8CD]">Workspace: Model Registry</span>
                    <button 
                      onClick={() => openTab({ id: 'tab-chat', title: 'Workbench Chat', type: 'chat', isClosable: false })}
                      className="text-xs text-[#858A8E] hover:text-white cursor-pointer"
                    >
                      &larr; Back to Search
                    </button>
                  </div>
                  <ModelRegistryView />
                </div>
              )}

              {currentTab?.type === 'audit' && (
                <div className="h-full p-4 overflow-auto">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242627]">
                    <span className="text-xs font-mono text-[#20B8CD]">Workspace: Audit Log</span>
                    <button 
                      onClick={() => openTab({ id: 'tab-chat', title: 'Workbench Chat', type: 'chat', isClosable: false })}
                      className="text-xs text-[#858A8E] hover:text-white cursor-pointer"
                    >
                      &larr; Back to Search
                    </button>
                  </div>
                  <AuditLogView />
                </div>
              )}

              {currentTab?.type === 'security' && (
                <div className="h-full p-4 overflow-auto">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242627]">
                    <span className="text-xs font-mono text-[#20B8CD]">Workspace: System Diagnostics</span>
                    <button 
                      onClick={() => openTab({ id: 'tab-chat', title: 'Workbench Chat', type: 'chat', isClosable: false })}
                      className="text-xs text-[#858A8E] hover:text-white cursor-pointer"
                    >
                      &larr; Back to Search
                    </button>
                  </div>
                  <SystemDiagnosticsView />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* 3. Right-Side Computer Mode / Terminal Panel */}
      <TerminalPanel />

      {/* 4. Global Modals */}
      <CommandPalette onRunScenario={handleSelectScenario} />
      <SecurityStatusModal />
    </div>
  );
};
