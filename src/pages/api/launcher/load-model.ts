import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    return new Response(JSON.stringify({
      success: true,
      model: body?.modelPath || ''
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
