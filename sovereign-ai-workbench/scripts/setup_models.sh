#!/usr/bin/env bash
# SovereignAI Workbench — One-Command Model Preparation Script
# Pre-pulls recommended open-weight models into local Ollama storage for air-gapped deployment.

echo "======================================================================"
echo "  Pulling Sovereign Open-Weight Models into Local Ollama Daemon"
echo "======================================================================"

echo "1. General Industrial Reasoning Model (Qwen3 8B)..."
ollama pull qwen3:8b

echo "2. Multimodal Vision-Language Model (Qwen2.5-VL 7B)..."
ollama pull qwen2.5-vl:7b

echo "3. Code Generation & Analysis Model (Qwen2.5-Coder 7B)..."
ollama pull qwen2.5-coder:7b

echo "4. High-Speed Local Embedding Model (nomic-embed-text)..."
ollama pull nomic-embed-text

echo "======================================================================"
echo "  All 4 local open-weight models downloaded and cached for air-gap!"
echo "======================================================================"
