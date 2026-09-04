# CoreWithin / SIH26117 — Local Neural Model Inventory

This directory contains the 5 core local open-weight neural models required for the **Prism Workbench / Sovereign AI Workbench** (`SIH26117`), designed for 100% air-gapped on-premise industrial execution.

---

## 🧠 5 Core Neural Models

| # | Model Identifier | Architecture / Quant | Role & Responsibilities | Files & Local Path | Size |
|---|---|---|---|---|---|
| **1** | **Qwen3-14B** | Q4_K_M GGUF | Main agent, multi-step planning, reasoning, industrial compliance, RAG synthesis | `models/qwen3-14b/Qwen3-14B-Q4_K_M.gguf` | ~9.00 GB |
| **2** | **Qwen2.5-Coder-7B-Instruct** | Q4_K_M GGUF | Specialized coding agent, Python automation, corrosion analysis, data debugging | `models/qwen2.5-coder-7b/qwen2.5-coder-7b-instruct-q4_k_m.gguf` | ~5.44 GB |
| **3** | **Qwen3-VL-8B-Instruct** | Q4_K_M GGUF + F16 MMPROJ | Multimodal vision agent, scanned document OCR, P&ID engineering drawings, spatial CAD | `models/qwen3-vl-8b/Qwen3VL-8B-Instruct-Q4_K_M.gguf`<br>`models/qwen3-vl-8b/mmproj-Qwen3VL-8B-Instruct-F16.gguf` | ~5.03 GB<br>~1.16 GB |
| **4** | **Qwen3-Embedding-0.6B** | Safetensors / HuggingFace | High-speed dense semantic embeddings for internal RAG knowledge index | `models/qwen3-embedding-0.6b/model.safetensors` | ~1.19 GB |
| **5** | **Qwen3-Reranker-0.6B** | Safetensors / HuggingFace | Cross-encoder relevance scoring & reranking retrieved chunks prior to LLM context | `models/qwen3-reranker-0.6b/model.safetensors` | ~1.19 GB |

---

## 🛠️ Non-LLM AI & Supporting Infrastructure

| Component | Category | Role | Execution Runtime |
|---|---|---|---|
| **PaddleOCR** | Non-LLM AI | Primary high-precision industrial OCR engine with angle classification | Python `paddleocr` + OpenCV |
| **Tesseract OCR** | Non-LLM AI | Fast local fallback OCR engine | `pytesseract` binary wrapper |
| **Docling** | Document Infrastructure | Structured PDF/table parsing, layout analysis, markdown conversion | Python `docling` engine |
| **PyMuPDF (fitz)** | Document Infrastructure | High-resolution 300 DPI page rendering, PDF parsing, text extraction | Native C/C++ Python bindings |
| **Qdrant** | Vector Database | Enterprise-grade local vector database for dense knowledge retrieval | Local embedded / Docker container |
| **llama.cpp** | Inference Engine | High-throughput GGUF & vision inference with CUDA 12 GPU acceleration | `F:\corewithin\llama\llama-server.exe` |
| **Docker Sandbox** | Security Infrastructure | Sandboxed Python code execution with `--network=none` strict air-gap | Docker daemon (`sovereign-sandbox:latest`) |

---

## 📂 Directory Layout

```text
F:\corewithin\models\
│
├── qwen3-14b\
│   └── Qwen3-14B-Q4_K_M.gguf                     [~9.00 GB]
│
├── qwen2.5-coder-7b\
│   └── qwen2.5-coder-7b-instruct-q4_k_m.gguf     [~5.44 GB]
│
├── qwen3-vl-8b\
│   ├── Qwen3VL-8B-Instruct-Q4_K_M.gguf           [~5.03 GB]
│   └── mmproj-Qwen3VL-8B-Instruct-F16.gguf       [~1.16 GB]
│
├── qwen3-embedding-0.6b\
│   ├── model.safetensors                         [~1.19 GB]
│   ├── config.json
│   ├── tokenizer.json
│   └── [Hugging Face model files]
│
└── qwen3-reranker-0.6b\
    ├── model.safetensors                         [~1.19 GB]
    ├── config.json
    ├── tokenizer.json
    └── [Hugging Face model files]
```

---

## 🔒 Air-Gap Security Note
All weights are stored locally on the workstation. No external network connectivity or cloud APIs (OpenAI, Anthropic, Google) are permitted or utilized during agent execution.
