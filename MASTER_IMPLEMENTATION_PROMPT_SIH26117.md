# MASTER IMPLEMENTATION PROMPT & SPECIFICATION — SIH26117

## Sovereign On-Premise Agentic AI Workbench using Open-Weight Multimodal LLMs for Confidential Industrial Work
**Submitted by:** Mangalore Refinery and Petrochemicals Limited (MRPL) | **Category:** Software / Smart Automation

---

## 1. SYSTEM IDENTITY & ROLE
You are the **Lead Sovereign AI Systems Architect, Security Engineer, and Senior Full-Stack Developer** building **LUMI** — an enterprise-grade, air-gapped, sovereign agentic AI workbench running entirely on local open-weight models (Qwen3, Qwen2.5-VL, Qwen2.5-Coder, nomic-embed-text) on a single GPU workstation/server.

---

## 2. CORE ARCHITECTURAL INVARIANTS (NON-NEGOTIABLE)

1. **Zero External Network Dependencies**:
   - No cloud API calls (no OpenAI, Anthropic, Gemini, Hugging Face Hub runtime calls).
   - Local inference via Ollama (`http://localhost:11434`), local ChromaDB vector store, local PaddleOCR/Tesseract, local Python execution sandbox.
   - Outbound internet access must be physically disconnectable without degrading core functionality.
2. **Transparent ReAct Multi-Step Agent Loop**:
   - Planner decomposes goals into structured JSON steps.
   - Dynamic Model Router selects the optimal quantized local model based on task modality (Document/Vision/Coding/Reasoning).
   - Tool execution is intercepted by a Policy Engine and sandbox.
   - High-level progress is streamed to the UI via Server-Sent Events (SSE). Private chain-of-thought is never leaked.
3. **Deterministic Tooling for Numerical Work**:
   - Calculations, wall-thickness checks, corrosion rates, and failure frequencies MUST use deterministic Python/Calculator tools, never raw LLM arithmetic hallucinations.
4. **Traceable Grounding & Citations**:
   - Every claim derived from internal SOPs/manuals must cite the filename and page number.
5. **Real Business Deliverables**:
   - Produces formatted `.docx` (Approval Notes), `.xlsx` (Data Summaries), and `.pptx` (Executive Briefings) with standard safety disclaimers.
6. **Hardware Adaptability (12–24 GB VRAM)**:
   - Sequential lazy-loading/unloading via Ollama to run within modest single-GPU budgets without OOM crashes.

---

## 3. PROJECT DIRECTORY BLUEPRINT

```text
sovereign-ai-workbench/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI entry point, CORS, SSE streaming, lifespan
│   │   ├── config.py                # Pydantic Settings (.env + config.yaml)
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py              # Dependency injectors
│   │   │   └── routes/
│   │   │       ├── __init__.py
│   │   │       ├── chat.py          # /api/tasks (POST, GET, SSE stream)
│   │   │       ├── documents.py     # /api/documents (Upload, OCR, list, parse)
│   │   │       ├── knowledge.py     # /api/knowledge (Ingest, search, status)
│   │   │       ├── artifacts.py     # /api/artifacts (List, download, approve)
│   │   │       ├── models.py        # /api/models (Registry list, status, pull)
│   │   │       ├── tools.py         # /api/tools (Registry list, permissions)
│   │   │       ├── audit.py         # /api/audit (Event timeline query)
│   │   │       └── system.py        # /api/system (Health, sovereignty, resources)
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   ├── state.py             # TaskState, AgentStep, ToolCall, Citation
│   │   │   ├── planner.py           # Structured decomposition prompt & JSON parser
│   │   │   ├── executor.py          # Step dispatcher, tool runner, retry logic
│   │   │   └── orchestrator.py      # Main ReAct loop + event emitter
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── registry.py          # Model metadata & capability registry
│   │   │   ├── router.py            # Task classifier & capability matcher
│   │   │   └── client.py            # Async Ollama client with memory management
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   ├── registry.py          # Tool schema registry & permission matrix
│   │   │   ├── file_tools.py        # read_file, write_file, list_files
│   │   │   ├── document_tools.py    # extract_pdf, ocr_document, analyze_image
│   │   │   ├── knowledge_tools.py   # search_knowledge, retrieve_document
│   │   │   ├── code_tools.py        # execute_python (sandboxed)
│   │   │   ├── spreadsheet_tools.py # read_excel, write_excel
│   │   │   ├── office_tools.py      # generate_docx, generate_xlsx, generate_pptx
│   │   │   └── calc_tools.py        # calculator, unit_converter
│   │   ├── rag/
│   │   │   ├── __init__.py
│   │   │   ├── embedder.py          # Local nomic-embed-text wrapper
│   │   │   ├── chunker.py           # Recursive text & markdown chunker
│   │   │   ├── vectorstore.py       # ChromaDB client & collection manager
│   │   │   └── retriever.py         # Hybrid similarity search + citation builder
│   │   ├── documents/
│   │   │   ├── __init__.py
│   │   │   ├── processor.py         # Pipeline: digital vs scanned PDF classifier
│   │   │   ├── pdf_parser.py        # PyMuPDF / pdfplumber extractor
│   │   │   ├── ocr.py               # PaddleOCR / Tesseract fallback
│   │   │   └── image_proc.py        # OpenCV deskewing & preprocessing
│   │   ├── sandbox/
│   │   │   ├── __init__.py
│   │   │   ├── docker_sandbox.py    # Ephemeral Docker container runner (--network=none)
│   │   │   └── fallback.py          # Restricted subprocess runner
│   │   ├── artifacts/
│   │   │   ├── __init__.py
│   │   │   ├── manager.py           # Artifact registry & approval state
│   │   │   ├── docx_gen.py          # python-docx template builder
│   │   │   ├── xlsx_gen.py          # openpyxl workbook builder
│   │   │   └── pptx_gen.py          # python-pptx presentation builder
│   │   ├── security/
│   │   │   ├── __init__.py
│   │   │   ├── workspace.py         # Path traversal validator
│   │   │   ├── permissions.py       # Role-based tool access control
│   │   │   └── network_monitor.py   # Socket interceptor & sovereignty proof tracker
│   │   └── audit/
│   │       ├── __init__.py
│   │       ├── logger.py            # Structured event logger
│   │       └── store.py             # SQLite audit storage
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/Header.tsx, Sidebar.tsx, Shell.tsx
│   │   │   ├── chat/ChatWindow.tsx, MessageBubble.tsx, FileUpload.tsx
│   │   │   ├── agent/TaskGraph.tsx, ExecutionTimeline.tsx, StepCard.tsx
│   │   │   ├── documents/DocumentList.tsx, UploadZone.tsx, DocumentViewer.tsx
│   │   │   ├── knowledge/KnowledgeBase.tsx, IngestionModal.tsx, SearchTester.tsx
│   │   │   ├── artifacts/ArtifactGrid.tsx, ArtifactPreview.tsx, ApprovalBadge.tsx
│   │   │   ├── models/ModelRegistryView.tsx, RoutingCard.tsx
│   │   │   ├── audit/AuditTimeline.tsx, EventDetailModal.tsx
│   │   │   └── system/SovereigntyStatus.tsx, ResourceMonitor.tsx
│   │   ├── pages/Dashboard.tsx, AgentWorkspace.tsx, DocumentsPage.tsx, KnowledgePage.tsx, ArtifactsPage.tsx, ModelsPage.tsx, AuditPage.tsx, SystemPage.tsx
│   │   ├── services/api.ts, sse.ts
│   │   ├── store/useWorkbenchStore.ts
│   │   ├── types/index.ts
│   │   ├── styles/globals.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── index.html
├── data/
│   ├── documents/
│   ├── knowledge/
│   ├── artifacts/
│   ├── indexes/
│   └── workspaces/
├── demo/
│   └── synthetic/
│       ├── Inspection_Report_001.pdf
│       ├── Operations_SOP_014.pdf
│       ├── Maintenance_Standard_007.pdf
│       ├── Pump_Failure_Data.xlsx
│       └── P_and_ID_Example.png
├── docker/
│   └── sandbox/Dockerfile
├── scripts/
│   ├── start.bat
│   ├── start.sh
│   ├── setup_models.sh
│   └── create_demo_data.py
├── docs/
│   ├── sih26117-mapping.md
│   └── architecture.md
├── .env.example
├── config.yaml
├── docker-compose.yml
└── README.md
```

---

## 4. CORE ENGINE IMPLEMENTATION SPECIFICATIONS

### 4.1. Model Registry & Dynamic Router (`app/models/router.py`)
- Define 4 default model roles:
  1. `qwen3:8b` (General reasoning, multi-step planning, synthesis)
  2. `qwen2.5-vl:7b` (Vision, P&ID visual inspection, scanned PDF image reasoning)
  3. `qwen2.5-coder:7b` (Python script generation, error debugging, data analysis)
  4. `nomic-embed-text` (Local 768-dim embeddings)
- Routing rules classify incoming task text and attached MIME types:
  - If `.png`, `.jpg`, or PDF with scanned page flags $\rightarrow$ `qwen2.5-vl:7b` (Task Type: `Vision/Multimodal`)
  - If keywords contain `python`, `code`, `script`, `csv`, `dataframe`, `calculate statistics` $\rightarrow$ `qwen2.5-coder:7b` (Task Type: `Code Generation`)
  - Else $\rightarrow$ `qwen3:8b` (Task Type: `General Reasoning & Synthesis`)
- Router outputs machine-readable justification:
  ```json
  {
    "selected_model": "qwen2.5-vl:7b",
    "task_type": "Vision Document Analysis",
    "reason": "Scanned engineering diagram detected with visual symbols requiring VLM parsing.",
    "vram_allocated_mb": 8192
  }
  ```

### 4.2. Agent Orchestrator & State Engine (`app/agents/orchestrator.py`)
- State structure `TaskState`:
  ```python
  class TaskState(BaseModel):
      task_id: str
      objective: str
      status: str  # pending | planning | running | verifying | completed | failed
      selected_model: str
      routing_reason: str
      plan: list[dict]  # list of AgentStep
      current_step_index: int
      tool_calls: list[dict]
      citations: list[dict]
      artifacts: list[dict]
      audit_events: list[dict]
  ```
- **Planner Prompt**:
  Instructs LLM to generate strict JSON containing 3-7 discrete actionable steps:
  `{"plan": [{"step_id": 1, "action": "ocr_document", "description": "Extract text from inspection report", "tool": "ocr_document", "args": {"file_path": "..."}}]}`
- **Execution Loop**:
  1. Emit `STEP_START` via SSE.
  2. Match tool in registry, check permission level (`READ_ONLY`, `LOCAL_WRITE`, `CODE_EXECUTION`, `DOCUMENT_GENERATION`).
  3. If tool fails, pass error message to Agent for self-correction (max 3 retry iterations).
  4. Emit `STEP_COMPLETE` with high-level outcome summary (never raw chain-of-thought tokens).
  5. If deliverable requested (e.g. DOCX), invoke `generate_docx` tool to create formatted file in `data/artifacts/`.
  6. Final state marked `COMPLETED` with download links and full citation bundle.

### 4.3. Document Pipeline & Local OCR (`app/documents/processor.py`)
- Inspect PDF with PyMuPDF (`fitz`):
  - Check character count per page ($< 50$ chars indicates scanned image).
  - If digital: extract native text + page numbers directly.
  - If scanned: render page to 300 DPI pixmap $\rightarrow$ OpenCV contrast adjustment $\rightarrow$ PaddleOCR / Tesseract.
- Extract structured observations and attach `Page X` metadata to every text block for downstream citation precision.

### 4.4. Local RAG with ChromaDB (`app/rag/retriever.py`)
- **Ingestion**:
  - Accept PDF/DOCX/TXT SOPs and Engineering Standards.
  - Recursive chunking (512 tokens with 64-token overlap).
  - Embed via local Ollama `nomic-embed-text`.
  - Store vectors with `{source: filename, page: page_num, section: title}` metadata in local persistent ChromaDB (`data/indexes`).
- **Retrieval**:
  - Similarity search ($k=5$).
  - Return context bundle with formatted markdown citations `[SOP-OPS-014.pdf, Page 12]`.

### 4.5. Code Execution Sandbox (`app/sandbox/docker_sandbox.py`)
- Ephemeral Docker container configuration:
  - Base: `python:3.12-slim` with `pandas`, `numpy`, `openpyxl`, `scipy`, `matplotlib`.
  - Flags: `--network none --memory 256m --cpus 1.0 --read-only --user 1000:1000`.
  - Writable volume: `/sandbox/workspace` mounted to task-specific temp folder.
  - Timeout: 30 seconds hard limit.
- Fallback mode: Restricted subprocess running in isolated task workspace with network socket blocking.

### 4.6. Deliverable Office Generator (`app/artifacts/docx_gen.py`)
- Generates publication-grade Microsoft Word (`.docx`) documents with:
  - Header: MRPL Sovereign AI Operations / Confidential Inspection Review.
  - Metadata block: Document ID, Inspector/Author AI, Review Date, Status (`AI Draft - Pending Human Approval`).
  - Executive Summary callout box with light-gray background and left blue border.
  - Tabulated Findings with Severity Badges (Critical / Warning / Normal).
  - Deterministic Calculation Table (Inputs, Formula, Output).
  - Cited Standards & SOP References.
  - Human Sign-off block with Signature lines and Date stamp.

### 4.7. Sovereignty Monitor & Proof Panel (`app/security/network_monitor.py`)
- Track system-wide socket connections:
  - Internal connections allowed: `127.0.0.1`, `localhost`, local Docker bridge.
  - Outbound external connections attempted: intercepted and logged.
- `/api/system/sovereignty` endpoint returns:
  ```json
  {
    "is_air_gapped": true,
    "external_calls_count": 0,
    "local_models_active": ["qwen3:8b", "qwen2.5-vl:7b", "nomic-embed-text"],
    "inference_engine": "Ollama Local Daemon",
    "vector_store": "ChromaDB Embedded",
    "ocr_engine": "PaddleOCR Local CPU/GPU",
    "sandbox_isolation": "Docker Container (Network: Disabled)"
  }
  ```

---

## 5. THREE JUDGE-FACING GOLDEN DEMO FLOWS

### DEMO 1: Scanned Inspection Report $\rightarrow$ SOP Comparison $\rightarrow$ Math Calculation $\rightarrow$ Formal DOCX Deliverable
1. User uploads `Inspection_Report_001.pdf` (scanned column inspection).
2. Agent detects scanned pages $\rightarrow$ runs local OCR $\rightarrow$ extracts 3 critical findings (Pipe P-102 wall thinning to 3.8mm, Valve V-14 packing gland leak, Flange F-08 corrosion).
3. Agent queries Knowledge Base for `Operations_SOP_014.pdf` & `Maintenance_Standard_007.pdf`.
4. RAG retrieves standard: Minimum allowable wall thickness for P-102 is $4.5\text{ mm}$; corrosion rate calculation required.
5. Agent generates & executes sandboxed Python calculation:
   $$\text{Corrosion Rate} = \frac{5.0 - 3.8}{3.5\text{ years}} = 0.343\text{ mm/year}$$
   $$\text{Remaining Life} = \frac{3.8 - 3.0\text{ (retire limit)}}{0.343} = 2.33\text{ years}$$
6. Agent writes and formats `Approval_Note_Unit5_Inspection.docx` with sign-off block.
7. User downloads generated DOCX directly from UI.

### DEMO 2: Coding & Data Analysis Sandbox
1. User uploads `Pump_Failure_Data.xlsx`.
2. Asks: *"Calculate monthly mean time between failures (MTBF) and plot the failure distribution."*
3. Model router selects `qwen2.5-coder:7b`.
4. Agent writes Pandas script, runs in Docker sandbox.
5. Sandbox outputs calculated metrics + saves `failure_trends.png`.
6. UI displays execution stdout, generated charts, and verified statistics.

### DEMO 3: Multimodal P&ID Interpretation & Air-Gap Proof
1. User uploads `P_and_ID_Example.png`.
2. Router selects `qwen2.5-vl:7b`.
3. Model extracts component tags (`Pump P-03`, `Control Valve CV-101`, `Bypass Line B-12`).
4. Presenter physically disconnects Wi-Fi/Ethernet.
5. User runs subsequent query on the P&ID. System completes inference locally in $\sim 3$ seconds.
6. Sovereignty Panel confirms `External Network Calls: 0` and `Status: AIR-GAPPED VERIFIED`.

---

## 6. FRONTEND DESIGN & USER EXPERIENCE
- **Aesthetic**: Slate-900 / Zinc-950 enterprise dark theme with crisp micro-borders (`border-zinc-800`), clean Inter typography, and functional status badges (Emerald = verified local, Amber = running sandbox, Indigo = model routing).
- **Workspace Views**:
  1. **Agent Workspace**: Split-view with left Chat & File upload, right dynamic Task Graph, Execution Timeline with expandable tool-call logs, and Citation drawer.
  2. **Document Hub**: File repository with digital vs scanned badges, instant OCR preview, and page breakdown.
  3. **Knowledge Base**: Collections viewer with ingestion progress bars and search debugger.
  4. **Artifacts Gallery**: Generated `.docx`, `.xlsx`, `.pptx` cards with one-click download, human review approval toggles, and metadata inspectors.
  5. **Model & Sovereignty Panel**: Live VRAM gauges, model routing logs, active Ollama instances, and zero-telemetry network audit counter.
