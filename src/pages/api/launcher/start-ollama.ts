import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async () => {
  try {
    const isAlive = await fetch('http://127.0.0.1:11434/api/tags', {
      signal: AbortSignal.timeout(1000)
    }).then(r => r.ok).catch(() => false);

    return new Response(JSON.stringify({
      success: isAlive,
      message: isAlive ? 'Ollama GPU inference service active' : 'Ollama not responding on port 11434'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      error: err?.message || 'Failed to check Ollama status'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
