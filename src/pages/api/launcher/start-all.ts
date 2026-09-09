import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async () => {
  // Pre-warm primary model into GPU VRAM in the background
  fetch('http://127.0.0.1:11434/api/tags', { signal: AbortSignal.timeout(1000) })
    .then(r => r.json())
    .then(data => {
      if (data?.models?.length > 0) {
        const preferred = data.models.find((m: any) => m.name.includes('qwen') || m.name.includes('coder')) || data.models[0];
        if (preferred?.name) {
          fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: preferred.name,
              prompt: 'GPU Warmup',
              stream: false,
              options: {
                num_predict: 1,
                num_gpu: 99,
                main_gpu: 0,
                num_ctx: 2048,
                f16_kv: true
              }
            })
          }).catch(() => null);
        }
      }
    })
    .catch(() => null);

  return new Response(JSON.stringify({
    success: true,
    message: 'Local sovereign GPU engines active'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
