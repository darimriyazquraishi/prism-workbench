======================================================================
  LUMI LOCAL INFERENCE SERVER (LLAMA / OLLAMA ENGINE)
======================================================================

PURPOSE:
This directory hosts the local background inference runner for LUMI.
LUMI communicates with this engine via the local HTTP endpoint:
  http://127.0.0.1:11434

AUTO-START:
When you launch "LUMI.exe", it automatically verifies whether the
inference server is listening on port 11434. If the server is offline,
LUMI.exe automatically launches it in the background without needing
any manual command line or terminal window.

MANUAL CONTROLS:
- To start manually: Double-click "start_server.bat"
- To stop manually:  Double-click "stop_server.bat"

AVAILABLE MODELS:
Models are stored in "../models" and registered with this engine:
- qwen3:14b          (General Master Reasoning LLM)
- qwen3-vl:8b        (Vision & OCR Multimodal LLM)
- qwen2.5vl:7b       (Vision Specialist Model)
- qwen2.5-coder:7b   (Python & Code Generation LLM)
- qwen3:8b           (Fast Reasoning LLM)
======================================================================
