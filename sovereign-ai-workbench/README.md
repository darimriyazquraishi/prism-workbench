# LUMI (SIH26117)

> **Sovereign On-Premise Agentic AI Workbench using Open-Weight Multimodal LLMs for Confidential Industrial Work**  
> **Client Organization:** Mangalore Refinery and Petrochemicals Limited (MRPL) | **Category:** Software / Smart Automation

---

## 1. Overview
Industrial organizations like MRPL handle confidential engineering schematics (P&IDs), statutory inspection reports, internal operating standards (SOPs), and equipment maintenance logs that cannot be transmitted to external cloud AI services.

**LUMI** is an enterprise-grade, air-gapped agentic operating environment designed to run on a single on-premise GPU workstation or private server. It combines **local open-weight models** (Qwen3, Qwen2.5-VL, Qwen2.5-Coder), **local OCR**, **local RAG with ChromaDB**, **deterministic calculations**, **Docker code sandboxing**, and **automated Microsoft Office deliverable generation (.docx, .xlsx, .pptx)** with **zero telemetry and zero cloud API dependencies**.

---

## 2. Key Architecture & Features

- **Strict Air-Gap & Sovereignty Guarantee**: Operates completely offline with 0 external network calls.
- **Dynamic Local Model Router**: Automatically selects the optimal quantized model based on task modality (Reasoning, Vision/P&ID, Coding/Python).
- **Multimodal Document Processing**: Automatic digital vs. scanned PDF classification, page rendering, OpenCV contrast enhancement, and local PaddleOCR/Tesseract.
- **Transparent Multi-Step ReAct Agent Loop**: Structured planning, tool dispatching, automatic retry/self-correction, and real-time Server-Sent Events (SSE) streaming.
- **Deterministic Engineering Calculations**: Exact API 570 corrosion rates, wall-thickness calculations, and remaining life estimates computed via deterministic Python math modules.
- **Local RAG with Verifiable Citations**: Internal SOPs and standards indexed in local ChromaDB; responses provide exact filename and page number citations.
- **Real Business Deliverables**: Produces formal formatted `.docx` approval notes with sign-off blocks, `.xlsx` workbooks, and `.pptx` presentations.
- **Secure Code Execution Sandbox**: Executes generated Python code inside isolated Docker containers (`--network=none`, `--memory=256m`, read-only root).
- **Immutable SQLite Audit Trail**: Complete transparency logging every tool call, model routing decision, file access, and execution duration.

---

## 3. Supported Local Models (12–24 GB VRAM Target)

| Role | Model Identifier | Provider | Size | Purpose |
|---|---|---|---|---|
| **General Reasoning** | `qwen3:8b` | Ollama (Local) | 8B | Multi-step task planning, SOP comparison, draft synthesis |
| **Vision & P&ID** | `qwen2.5-vl:7b` | Ollama (Local) | 7B | Engineering drawing interpretation, P&ID visual tags, scanned forms |
| **Coding & Data** | `qwen2.5-coder:7b` | Ollama (Local) | 7B | Automated Python scripts, failure data science, sandboxed runs |
| **Local Embeddings** | `nomic-embed-text` | Ollama (Local) | 137M | Local 768-dim vector embeddings for ChromaDB RAG |

---

## 4. Quick Start & Demonstration

### Prerequisites
- Python 3.11+ / Node.js 20+
- Ollama (installed locally with models pulled)
- Docker Desktop (for code sandboxing)

### 1-Command Startup (Windows)
```bash
scripts\start.bat
```

### 1-Command Startup (Linux / macOS)
```bash
bash scripts/start.sh
```

### Manual Service Launch
```bash
# 1. Install Backend Dependencies & Start Server
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 2. In a separate terminal, start Frontend UI
cd frontend
npm install
npm run dev
```

Open your browser at: **`http://localhost:3000`**

---

## 5. Three Official Judge Demonstration Scenarios

### Demo 1 — Flagship Document & Compliance Workflow
- **Input:** Upload `Inspection_Report_001.pdf` (scanned CDU-5 column report).
- **Goal:** Identify wall thinning on Line 04-CR-102 (Pipe P-102), retrieve `Operations_SOP_014.pdf`, calculate corrosion rate $(0.343\text{ mm/yr})$ and remaining life $(2.33\text{ yrs})$, and produce formal `Approval_Note_Unit5_Inspection.docx`.
- **Output:** One-click download of styled Word document with complete human approval sign-off block.

### Demo 2 — Coding Agent & MTBF Analysis
- **Input:** `Pump_Failure_Data.xlsx`.
- **Goal:** Route task to `qwen2.5-coder:7b`, write Pandas reliability script, execute in isolated Docker sandbox, and export calculated metrics.
- **Output:** Live sandbox stdout logs + structured Excel deliverable.

### Demo 3 — Multimodal P&ID & Air-Gap Proof
- **Input:** `P_and_ID_Example.png`.
- **Goal:** Route to `qwen2.5-vl:7b`, extract equipment tags (`P-102`, `V-14`, `CV-101`, `Line 04-CR-102-A1A`).
- **Proof:** Disconnect physical network / Wi-Fi $\rightarrow$ query continues locally with `External Calls: 0`.

---

## 6. Project Structure

```text
sovereign-ai-workbench/
├── backend/            # FastAPI app, agent loop, RAG, OCR, tools, sandboxing
├── frontend/           # React 19, TypeScript, Vite, Tailwind CSS UI
├── data/               # Local persistence (documents, knowledge, artifacts, indexes, audit)
├── demo/synthetic/     # Realistic synthetic industrial test datasets
├── docker/             # Docker sandbox and container compose configs
├── docs/               # Architecture blueprint and SIH requirement mapping
└── scripts/            # Startup scripts and demo data generators
```

---

## 7. Requirement Traceability
For full mapping to Problem Statement **SIH26117**, see [`docs/sih26117-mapping.md`](file:///f:/corewithin/sovereign-ai-workbench/docs/sih26117-mapping.md).
