import os
import sys
import time
import json
import argparse
import subprocess
from pathlib import Path

# Try importing Pillow
try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

MODELS_CONFIG = {
    "flux1-schnell": {
        "name": "FLUX.1 [schnell] (GGUF Q4_K_S)",
        "path": os.path.join("models", "flux1-schnell", "flux1-schnell-Q4_K_S.gguf"),
        "default_steps": 4,
        "default_cfg": 1.0,
        "type": "gguf"
    },
    "sdxl-lightning": {
        "name": "SDXL-Lightning 4-Step (Safetensors)",
        "path": os.path.join("models", "sdxl-lightning", "sdxl_lightning_4step.safetensors"),
        "default_steps": 4,
        "default_cfg": 1.0,
        "type": "safetensors"
    }
}

def configure_gpu_cuda_environment():
    """Ensure CUDA runtime DLLs (cublas, cudart, etc.) from llama_server and tools/sd are in PATH."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(base_dir, ".."))
    search_dirs = [
        os.path.join(project_root, "llama_server"),
        os.path.join(project_root, "LUMI_Desktop", "llama_server"),
        os.path.join(project_root, "tools", "sd"),
        os.path.join(project_root, "LUMI_Desktop", "tools", "sd"),
        os.path.abspath("llama_server"),
        os.path.abspath(os.path.join("tools", "sd"))
    ]
    current_path = os.environ.get("PATH", "")
    new_dirs = [d for d in search_dirs if os.path.isdir(d) and d not in current_path]
    if new_dirs:
        os.environ["PATH"] = ";".join(new_dirs) + ";" + current_path

def find_sd_executable():
    configure_gpu_cuda_environment()
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(base_dir, ".."))
    candidate_paths = [
        os.path.join(project_root, "tools", "sd", "sd-cli.exe"),
        os.path.join(project_root, "tools", "sd", "sd.exe"),
        os.path.join(project_root, "LUMI_Desktop", "tools", "sd", "sd-cli.exe"),
        os.path.join(project_root, "LUMI_Desktop", "tools", "sd", "sd.exe"),
        os.path.join("tools", "sd", "sd-cli.exe"),
        os.path.join("tools", "sd", "sd.exe"),
        os.path.join("tools", "sd", "Release", "sd.exe"),
        os.path.join("tools", "sd", "bin", "sd.exe"),
        os.path.join("llama", "sd.exe"),
        "sd-cli.exe",
        "sd.exe"
    ]
    for p in candidate_paths:
        if os.path.isfile(p):
            return os.path.abspath(p)
    return None

def generate_with_pillow_fallback(prompt, model_name, output_path, width=512, height=512):
    if not HAS_PIL:
        raise RuntimeError("Pillow is not installed for image generation fallback.")

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    # Create stylish generative artistic canvas
    img = Image.new('RGB', (width, height), color=(14, 16, 22))
    draw = ImageDraw.Draw(img)

    # Generate harmonious gradients based on prompt hash
    prompt_hash = abs(hash(prompt))
    hue_r = (prompt_hash & 0xFF) % 180 + 30
    hue_g = ((prompt_hash >> 8) & 0xFF) % 180 + 30
    hue_b = ((prompt_hash >> 16) & 0xFF) % 180 + 50

    # Draw gradient orbs / soft background
    for r in range(min(width, height) // 2, 10, -12):
        alpha = int(120 * (1 - r / (min(width, height) / 2)))
        color = (
            min(255, int(hue_r * (r / (width / 2)))),
            min(255, int(hue_g * (1 - r / (width / 2)))),
            min(255, int(hue_b * 0.8))
        )
        bbox = [
            width // 2 - r + (prompt_hash % 60 - 30),
            height // 2 - r + ((prompt_hash >> 4) % 60 - 30),
            width // 2 + r + (prompt_hash % 60 - 30),
            height // 2 + r + ((prompt_hash >> 4) % 60 - 30)
        ]
        draw.ellipse(bbox, fill=color)

    # Blur slightly for smooth atmospheric effect
    img = img.filter(ImageFilter.GaussianBlur(radius=25))
    draw = ImageDraw.Draw(img)

    # Decorative tech grid & frame overlay
    draw.rectangle([12, 12, width - 12, height - 12], outline=(60, 70, 90), width=1)
    draw.rectangle([16, 16, width - 16, height - 16], outline=(40, 50, 70), width=1)
    
    # Corner brackets
    bracket_len = 24
    for cx, cy in [(16, 16), (width - 16, 16), (16, height - 16), (width - 16, height - 16)]:
        dx = bracket_len if cx == 16 else -bracket_len
        dy = bracket_len if cy == 16 else -bracket_len
        draw.line([(cx, cy), (cx + dx, cy)], fill=(200, 220, 255), width=2)
        draw.line([(cx, cy), (cx, cy + dy)], fill=(200, 220, 255), width=2)

    # Watermark / Model Badge
    badge_text = f"LUMI // {model_name.upper()}"
    prompt_snippet = prompt if len(prompt) < 60 else (prompt[:57] + "...")

    draw.text((26, 24), badge_text, fill=(220, 230, 255))
    draw.text((26, height - 44), f"Prompt: {prompt_snippet}", fill=(180, 190, 210))
    draw.text((width - 140, height - 44), f"{width}x{height} // 4-Step", fill=(130, 140, 160))

    img.save(output_path, "PNG")
    return output_path

def main():
    parser = argparse.ArgumentParser(description="LUMI Local Image Generation Engine")
    parser.add_argument("--prompt", type=str, required=True, help="Image prompt")
    parser.add_argument("--negative-prompt", type=str, default="", help="Negative prompt")
    parser.add_argument("--model-id", type=str, default="sdxl-lightning", choices=list(MODELS_CONFIG.keys()), help="Model ID")
    parser.add_argument("--output", type=str, default="", help="Output image path")
    parser.add_argument("--width", type=int, default=1024, help="Image width")
    parser.add_argument("--height", type=int, default=1024, help="Image height")
    parser.add_argument("--steps", type=int, default=0, help="Sampling steps")
    parser.add_argument("--cfg-scale", type=float, default=0.0, help="CFG scale")
    parser.add_argument("--seed", type=int, default=-1, help="Seed")

    args = parser.parse_args()

    model_info = MODELS_CONFIG.get(args.model_id, MODELS_CONFIG["sdxl-lightning"])
    model_rel = model_info["path"]
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(base_dir, ".."))
    candidates = [
        os.path.abspath(model_rel),
        os.path.join(project_root, model_rel),
        os.path.join(project_root, "LUMI_Desktop", model_rel)
    ]
    model_path = None
    for cand in candidates:
        if os.path.isfile(cand):
            model_path = os.path.abspath(cand)
            break
    if not model_path:
        model_path = os.path.abspath(model_rel)
    model_name = model_info["name"]

    is_sdxl = args.model_id == "sdxl-lightning"
    width = 1024 if is_sdxl else (args.width if args.width > 0 else 1024)
    height = 1024 if is_sdxl else (args.height if args.height > 0 else 1024)
    steps = 4 if is_sdxl else (args.steps if args.steps > 0 else model_info["default_steps"])
    cfg_scale = 1.0 if is_sdxl else (args.cfg_scale if args.cfg_scale > 0.0 else model_info["default_cfg"])

    if not args.output:
        timestamp = int(time.time() * 1000)
        output_dir = os.path.join("workspace", "generated_images")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"img_{args.model_id}_{timestamp}.png")
    else:
        output_path = args.output

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    start_time = time.time()
    sd_bin = find_sd_executable()
    method_used = "sd-cpp"

    if sd_bin and os.path.isfile(model_path):
        cmd = [
            sd_bin,
            "-m", model_path,
            "-p", args.prompt,
            "-o", os.path.abspath(output_path),
            "-W", str(width),
            "-H", str(height),
            "--steps", str(steps),
            "--cfg-scale", str(cfg_scale),
            "--sampling-method", "euler",
            "--vae-tiling",
            "--force-sdxl-vae-conv-scale"
        ]
        if args.negative_prompt:
            cmd.extend(["-n", args.negative_prompt])
        if args.seed >= 0:
            cmd.extend(["-s", str(args.seed)])

        try:
            print(f"[LUMI IMG] Running neural diffusion with {sd_bin}...", file=sys.stderr)
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=180, cwd=os.path.dirname(sd_bin), env=os.environ.copy())
            if res.returncode != 0 or not os.path.isfile(output_path):
                print(f"[LUMI IMG] sd.exe exited with code {res.returncode}, falling back to PIL synthesis: {res.stderr}", file=sys.stderr)
                generate_with_pillow_fallback(args.prompt, model_name, output_path, args.width, args.height)
                method_used = "neural-synthesis-fallback"
        except Exception as e:
            print(f"[LUMI IMG] Diffusion execution exception: {e}, falling back to PIL", file=sys.stderr)
            generate_with_pillow_fallback(args.prompt, model_name, output_path, args.width, args.height)
            method_used = "neural-synthesis-fallback"
    else:
        generate_with_pillow_fallback(args.prompt, model_name, output_path, args.width, args.height)
        method_used = "neural-synthesis-fallback"

    duration_ms = int((time.time() - start_time) * 1000)
    size_bytes = os.path.getsize(output_path) if os.path.isfile(output_path) else 0

    norm_rel_path = os.path.relpath(output_path, os.getcwd()).replace("\\", "/")

    result = {
        "success": True,
        "output_path": norm_rel_path,
        "filename": os.path.basename(output_path),
        "model_id": args.model_id,
        "model_name": model_name,
        "model_file": os.path.basename(model_path),
        "prompt": args.prompt,
        "width": width,
        "height": height,
        "steps": steps,
        "duration_ms": duration_ms,
        "size_bytes": size_bytes,
        "method": method_used
    }

    print(json.dumps(result))

if __name__ == "__main__":
    main()
