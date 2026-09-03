# SovereignAI Workbench — System Architecture Blueprint

## 1. High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│              SOVEREIGN AI WORKBENCH FRONTEND (React 19 + Vite)          │
│                                                                         │
│  Dashboard | Agent Workspace | Documents & OCR | Knowledge | Artifacts  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (REST API + SSE Stream)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND & ORCHESTRATION                      │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                     AGENT ORCHESTRATOR LOOP                     │   │
│   │                                                                 │   │
│   │  1. Task Classifier & Dynamic Model Router                      │   │
│   │  2. Structured Multi-Step JSON Planner                          │   │
│   │  3. Policy & Permission Interceptor                             │   │
│   │  4. Tool Dispatcher (OCR, RAG, Calc, Sandbox, Office Gen)       │   │
│   │  5. Self-Correction & Error Recovery (Max 3 retries)           │   │
│   │  6. Deliverable Assembly & Safety Verification                  │   │
│   └────────────────────────────────┬────────────────────────────────┘   │
│                                    │                                    │
│        ┌───────────────────────────┼───────────────────────────┐        │
│        ▼                           ▼                           ▼        │
│  LOCAL MODEL CLIENT          TOOL REGISTRY             LOCAL RAG ENGINE │
│  (Ollama Async Daemon)   (Permissions & Schemas)      (ChromaDB + Nomic)│
│        │                           │                           │        │
│        ▼                           ▼                           ▼        │
│  • qwen3:8b (General)       • File Tools (Path Guard)   • Recursive     │
│  • qwen2.5-vl:7b (Vision)   • Document Tools (OCR)        Chunker (512) │
│  • qwen2.5-coder:7b (Code)  • Calc Tools (API 570)      • Citation      │
│  • nomic-embed-text         • Sandbox Runner (Docker)     Builder       │
│                             • Office Gen (DOCX/XLSX/PPT)                │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   AIR-GAPPED SECURITY & AUDIT LAYER                     │
│                                                                         │
│  Zero External Network | Ephemeral Sandbox | SQLite Immutable Audit     │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2. Dynamic Model Routing Policy
Tasks are classified by text intent and attached file types:
1. **Vision / Schematics**: Images (`.png`, `.jpg`) or scanned PDFs $\rightarrow$ `qwen2.5-vl:7b`.
2. **Code & Numerical**: Tabular data (`.csv`, `.xlsx`) or scripting keywords $\rightarrow$ `qwen2.5-coder:7b`.
3. **General Synthesis**: Multi-step document comparison and approval note drafting $\rightarrow$ `qwen3:8b`.

## 3. Sandboxing & Isolation
- Code execution is dispatched to a non-root Docker container with `--network=none` and memory ceiling.
- Deterministic calculations (corrosion rate, remaining service life) are computed by standard Python math modules, completely preventing numerical hallucinations.
