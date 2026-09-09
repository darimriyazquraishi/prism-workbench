import os
import sys
import time
import json
import urllib.request
import urllib.error

MODELS_TO_DOWNLOAD = [
    {
        "id": "flux1-schnell-q4",
        "name": "FLUX.1 [schnell] GGUF Q4_K_S",
        "url": "https://huggingface.co/city96/FLUX.1-schnell-gguf/resolve/main/flux1-schnell-Q4_K_S.gguf",
        "dest_dir": os.path.join("models", "flux1-schnell"),
        "filename": "flux1-schnell-Q4_K_S.gguf",
        "expected_bytes": 6783943712
    },
    {
        "id": "sdxl-lightning-4step",
        "name": "SDXL-Lightning 4-Step Safetensors",
        "url": "https://huggingface.co/ByteDance/SDXL-Lightning/resolve/main/sdxl_lightning_4step.safetensors",
        "dest_dir": os.path.join("models", "sdxl-lightning"),
        "filename": "sdxl_lightning_4step.safetensors",
        "expected_bytes": 6938040682
    }
]

STATUS_FILE = os.path.join("models", "download_status.json")

def update_status(data):
    try:
        with open(STATUS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Warning: could not write status file: {e}", flush=True)

def download_file_with_resume(item, model_index, total_models):
    dest_dir = item["dest_dir"]
    os.makedirs(dest_dir, exist_ok=True)
    target_path = os.path.join(dest_dir, item["filename"])
    url = item["url"]
    expected_bytes = item["expected_bytes"]
    name = item["name"]

    print(f"\n========================================================", flush=True)
    print(f"[{model_index}/{total_models}] Starting download: {name}", flush=True)
    print(f"Target: {target_path}", flush=True)
    print(f"URL: {url}", flush=True)
    print(f"========================================================", flush=True)

    max_retries = 15
    retry_delay = 5

    for attempt in range(1, max_retries + 1):
        try:
            existing_bytes = 0
            if os.path.exists(target_path):
                existing_bytes = os.path.getsize(target_path)
                if existing_bytes >= expected_bytes:
                    print(f"File already completely downloaded ({existing_bytes:,} bytes). Skipping.", flush=True)
                    update_status({
                        "active_model": name,
                        "status": "completed",
                        "progress_percent": 100.0,
                        "downloaded_bytes": existing_bytes,
                        "total_bytes": expected_bytes,
                        "speed_mbps": 0.0,
                        "eta_seconds": 0
                    })
                    return True
                else:
                    print(f"Found existing partial file: {existing_bytes:,} / {expected_bytes:,} bytes. Resuming...", flush=True)

            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "LUMI-Downloader/1.0",
                    "Range": f"bytes={existing_bytes}-"
                }
            )

            opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler)
            with opener.open(req, timeout=30) as response:
                total_content_length = response.headers.get("Content-Length")
                if total_content_length:
                    total_bytes = existing_bytes + int(total_content_length)
                else:
                    total_bytes = expected_bytes

                mode = "ab" if existing_bytes > 0 else "wb"
                with open(target_path, mode) as out_file:
                    downloaded = existing_bytes
                    start_time = time.time()
                    last_log_time = start_time
                    bytes_since_log = 0

                    chunk_size = 2 * 1024 * 1024  # 2 MB buffer

                    while True:
                        chunk = response.read(chunk_size)
                        if not chunk:
                            break

                        out_file.write(chunk)
                        downloaded += len(chunk)
                        bytes_since_log += len(chunk)

                        current_time = time.time()
                        time_diff = current_time - last_log_time

                        if time_diff >= 3.0:
                            speed = (bytes_since_log / time_diff) / (1024 * 1024)  # MB/s
                            pct = (downloaded / total_bytes) * 100 if total_bytes > 0 else 0
                            remaining_bytes = max(0, total_bytes - downloaded)
                            eta_sec = (remaining_bytes / (bytes_since_log / time_diff)) if bytes_since_log > 0 else 0
                            eta_min = eta_sec / 60

                            print(f"[{name}] {pct:5.1f}% | {downloaded / (1024**3):.2f}/{total_bytes / (1024**3):.2f} GB | "
                                  f"{speed:.2f} MB/s | ETA: {eta_min:.1f}m", flush=True)

                            update_status({
                                "active_model": name,
                                "status": "downloading",
                                "progress_percent": round(pct, 1),
                                "downloaded_bytes": downloaded,
                                "total_bytes": total_bytes,
                                "speed_mbps": round(speed, 2),
                                "eta_seconds": round(eta_sec, 0),
                                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
                            })

                            last_log_time = current_time
                            bytes_since_log = 0

            # Verify final size
            final_size = os.path.getsize(target_path)
            if final_size >= expected_bytes * 0.99:
                print(f"\n[SUCCESS] Completed {name}: {final_size:,} bytes downloaded successfully.", flush=True)
                return True
            else:
                print(f"\n[WARNING] Incomplete file size: {final_size:,} expected {expected_bytes:,}. Retrying...", flush=True)

        except (urllib.error.URLError, TimeoutError, ConnectionResetError, Exception) as err:
            print(f"\n[ATTEMPT {attempt}/{max_retries} FAILED] {err}. Retrying in {retry_delay}s...", flush=True)
            time.sleep(retry_delay)

    return False

def main():
    print("================================================================", flush=True)
    print("LUMI Image Generation Model Downloader", flush=True)
    print(f"Targeting: {[m['name'] for m in MODELS_TO_DOWNLOAD]}", flush=True)
    print("================================================================", flush=True)

    total_models = len(MODELS_TO_DOWNLOAD)
    for idx, item in enumerate(MODELS_TO_DOWNLOAD, 1):
        success = download_file_with_resume(item, idx, total_models)
        if not success:
            print(f"[ERROR] Failed to download {item['name']} after max retries.", flush=True)
            sys.exit(1)

    print("\n================================================================", flush=True)
    print("[ALL DOWNLOADS COMPLETE] Both image generation models are ready in models/", flush=True)
    print("================================================================", flush=True)

    update_status({
        "status": "all_completed",
        "models": [m["name"] for m in MODELS_TO_DOWNLOAD],
        "completed_at": time.strftime("%Y-%m-%d %H:%M:%S")
    })

if __name__ == "__main__":
    main()
