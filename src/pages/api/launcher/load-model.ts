import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const model = body?.modelPath || body?.model || '';

    if (model) {
      const cleanTag = model.split(/[/\\]/).pop()?.replace(/\.gguf$/i, '') || model;
      fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: cleanTag,
          prompt: 'GPU Ping',
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

    return new Response(JSON.stringify({
      success: true,
      model
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
