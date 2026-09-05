# Prism Workbench

> **Sovereign On-Premise Agentic AI Workbench using Open-Weight Multimodal LLMs for Confidential Industrial Work**  
> Built for **Smart India Hackathon 2026 Problem Statement SIH26117**  
> Organization: **Mangalore Refinery and Petrochemicals Limited (MRPL)** | Category: **Software / Smart Automation**

---

## 🌟 Overview

**Prism Workbench** is an air-gapped, sovereign, on-premise agentic AI development environment modeled after Google DeepMind's Antigravity and Microsoft VS Code's Dark+ visual language.

Refineries and industrial plants handle sensitive process schematics, inspection reports, and confidential operating manuals that cannot leave plant premises. **Prism Workbench** runs 100% locally with open-weight models (Qwen3, Qwen2.5-VL, Qwen2.5-Coder), local OCR, local ChromaDB RAG, deterministic industrial calculation tools, and Docker sandboxing with `--network=none`.

```
User: "Analyze these inspection reports, check against SOP-OPS-014, and compile an official Word approval note."
  │
  ▼ [Prism Autonomous Agent Orchestrator]
  ├── 1. Local OCR (PyMuPDF / PaddleOCR)
  ├── 2. SOP Retrieval (ChromaDB Local 768-D)
  ├── 3. Deterministic Engineering Math (API 570 / ASME B31.3)
  ├── 4. Sandboxed Code Execution (Docker --net=none)
  └── 5. Deliverable Compilation (.docx / .xlsx / .pptx)
  │
  ▼ [Verified 100% Air-Gapped Result]
  Findings (2 Critical, 4 Scheduled) + SOP Citations + Signed Word Deliverable
```

---

## 🚀 Key Features

- **3-Pane Antigravity Master Architecture**:
  - **Left Sidebar**: Session history, 5 resident local skills (`pdf-ocr-intelligence`, `industrial-corrosion-engine`, `pid-schematic-vision`, `chromadb-sop-retriever`, `docker-python-sandbox`), and Knowledge Items (KIs).
  - **Center Trajectory Canvas**: Real-time agent thought streaming (`Thinking...`), collapsible tool execution cards with inputs/outputs/durations, and final deliverable downloads.
  - **Right Live Preview Pane**: Live inspection tabs for generated artifacts (`.docx`), scanned PDFs with OCR bounding boxes, vector CAD P&ID schematics, ChromaDB RAG explorer, and air-gap telemetry.
- **VS Code Dark+ Visual Language**: Neutral `#1e1e1e` editor canvas, `#252526` panels, `#323233` titlebar, and iconic `#007acc` status bar.
- **100% Sovereign & Air-Gapped**: Permanent `● AIR-GAP (0 EXT)` verification guarantee with zero outbound network calls and local audit logging.
- **Interactive Command Palette**: Global `Ctrl+K` shortcut to switch sessions, execute industrial demos, and inspect telemetry.

---

## 🛠️ Technology Stack

- **Frontend Shell**: [Astro 5](https://astro.build/) + [React 19](https://react.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) + [Zustand](https://zustand-demo.pmnd.rs/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Local Models Supported**:
  - `Qwen3-8B` (Local reasoning, planning, and synthesis)
  - `Qwen2.5-VL-7B` (Multimodal vision for P&ID schematics and forms)
  - `Qwen2.5-Coder-7B` (Python scripts and sandboxed data analysis)
  - `nomic-embed-text` (768-D local embeddings for ChromaDB)
- **Local Execution Engine**:
  - Fast-API backend (`sovereign-ai-workbench/backend/`)
  - Isolated Docker sandbox container with `--network=none`

---

## 🚦 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open `http://localhost:4321` in your browser.

### 3. Build Production Static Assets
```bash
npm run build
```

---

## 📜 License

Confidential industrial prototype developed for Smart India Hackathon 2026 (SIH26117).
# Lumi
