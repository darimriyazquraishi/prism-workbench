======================================================================
  LUMI -- STANDALONE SOVEREIGN AI DESKTOP APPLICATION
======================================================================

QUICK START:
1. Double-click "LUMI.exe".
2. The standalone desktop application opens immediately.
   (No browser, no internet, no Node.js, and no Python required!)

----------------------------------------------------------------------
ADDING / DOWNLOADING AI MODELS:
----------------------------------------------------------------------
To keep this ZIP package lightweight, neural model weights (several GBs)
are not included in the initial download.

To add models:
- Option A: Open the "models\" folder and double-click 
  "Download_Recommended_Models.bat" to auto-download the fast 
  SDXL-Lightning image model with built-in resume.
- Option B: Place your own .gguf or .safetensors models into the 
  corresponding "models\" subdirectories.
- Option C: If using Ollama (bundled in llama_server\ollama.exe), 
  pull models using:
    ollama run qwen2.5-coder:7b
    ollama run qwen2.5vl:7b
    ollama run qwen3:8b

----------------------------------------------------------------------
GPU ACCELERATION:
----------------------------------------------------------------------
- NVIDIA GeForce RTX 3060, 4060, 4070, 4080, 4090 and all modern 
  RTX/GTX GPUs with standard NVIDIA drivers are automatically detected.
- All CUDA 12 runtime engines (cublas, cudart, ggml-cuda) are pre-bundled.
- If no GPU is present, LUMI will automatically fall back to CPU.

----------------------------------------------------------------------
KEYBOARD SHORTCUTS:
----------------------------------------------------------------------
* F11           : Toggle Fullscreen
* F5 / Ctrl+R   : Reload interface
* F12           : Developer Inspection Tools

----------------------------------------------------------------------
FOLDER ARCHITECTURE:
----------------------------------------------------------------------
- LUMI.exe                          : Standalone native desktop launcher
- node.exe                          : Embedded portable server runtime
- *.dll                             : Offline WebView2 browser engine
- dist\                             : Built application UI
- llama_server\                     : Local inference server + CUDA runtime
- tools\sd\                         : Native C++ neural diffusion engine
- models\                           : Local open-weight models directory
- demo\                             : Local datasets and demo workspaces
- public\                           : Icons and static assets

======================================================================
