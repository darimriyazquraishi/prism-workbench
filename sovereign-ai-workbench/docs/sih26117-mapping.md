# SIH26117 Requirement Traceability Matrix

**Smart India Hackathon 2026 Problem Statement SIH26117**
*“Sovereign On-Premise Agentic AI Workbench using Open-Weight Multimodal LLMs for Confidential Industrial Work”*
**Organization:** Mangalore Refinery and Petrochemicals Limited (MRPL) | **Theme:** Software / Smart Automation

---

## Complete Requirement Traceability Table

| Official Requirement | Technical Implementation | Code File / Component | Verification / Demo Scenario |
|---|---|---|---|
| **1. Self-Hosted / On-Premise / Air-Gapped** | Local Ollama daemon (`http://localhost:11434`), local embedded ChromaDB, local SQLite audit engine, zero external cloud endpoints. | `backend/app/config.py`, `backend/app/security/network_monitor.py` | Physical network disconnect during Demo 3 with active inference; `External API calls: 0`. |
| **2. Multiple Open-Weight Models** | Dynamic Model Registry with capability mapping (Qwen3 8B, Qwen2.5-VL 7B, Qwen2.5-Coder 7B, nomic-embed-text). | `backend/app/models/registry.py`, `backend/app/models/router.py` | UI displays dynamic model selection & justification based on input modality. |
| **3. Multimodal Document Intelligence** | Digital vs scanned PDF classifier, PyMuPDF parsing, PaddleOCR/Tesseract engine, OpenCV CLAHE image enhancement. | `backend/app/documents/processor.py`, `backend/app/documents/ocr.py` | Demo 1 parses scanned inspection pages (`Inspection_Report_001.pdf`). |
| **4. P&ID and Engineering Drawing Analysis** | Multimodal Vision-Language processing extracting component tags (`P-102`, `V-14`, `CV-101`) and flow lines. | `backend/app/tools/document_tools.py`, `backend/app/models/client.py` | Demo 3 analyzes `P_and_ID_Example.png` and returns structured tag schema. |
| **5. Local RAG with Grounding & Citations** | Recursive 512-token chunker, local 768-dim embeddings, local ChromaDB, hybrid search with source file & page citations. | `backend/app/rag/vectorstore.py`, `backend/app/tools/knowledge_tools.py` | Demo 1 cites `Operations_SOP_014.pdf` (Page 12) and `Maintenance_Standard_007.pdf`. |
| **6. Multi-Step Agentic Planning & ReAct Loop** | LLM planner decomposing goals into JSON steps, tool dispatcher, self-correction retry loop, real-time SSE stream. | `backend/app/agents/orchestrator.py`, `backend/app/agents/planner.py`, `backend/app/agents/executor.py` | Live Task Graph and Execution Timeline streaming across 4-6 discrete steps. |
| **7. Code Execution Sandbox** | Isolated Docker container runner (`--network=none`, `--memory=256m`, read-only root) with fallback restricted process. | `backend/app/sandbox/docker_sandbox.py`, `backend/app/tools/code_tools.py` | Demo 2 generates and runs Pandas script in isolated sandbox on `Pump_Failure_Data.xlsx`. |
| **8. Deterministic Calculations** | Arithmetic tool and API 570 corrosion rate / remaining life calculator to prevent LLM hallucination. | `backend/app/tools/calc_tools.py` | Corrosion rate: $(5.0 - 3.8)/3.5 = 0.343\text{ mm/yr}$, Remaining life: $2.33\text{ yrs}$. |
| **9. Real Business Deliverables (.docx, .xlsx, .pptx)** | Automated generation of styled Word approval notes, Excel workbooks, and PowerPoint decks with sign-off blocks. | `backend/app/artifacts/docx_gen.py`, `backend/app/artifacts/xlsx_gen.py`, `backend/app/artifacts/pptx_gen.py` | Demo 1 produces downloadable `Approval_Note_MRPL-APPR-*.docx`. |
| **10. Security, Auditability & Sovereignty Proof** | Socket interceptor tracking network calls, SQLite audit log, workspace path traversal guards, human approval toggles. | `backend/app/audit/store.py`, `backend/app/security/workspace.py`, `backend/app/security/network_monitor.py` | Audit timeline logs every tool invocation, model choice, timestamp, and duration. |
| **11. Hardware Adaptability (12–24 GB VRAM)** | Quantized 4-bit / 8-bit model selection with lazy loading and memory budget management. | `backend/app/config.py`, `backend/app/models/registry.py` | Runs smoothly on a single mid-range GPU workstation without OOM. |
