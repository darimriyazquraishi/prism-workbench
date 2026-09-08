import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({
    success: true,
    message: 'Local sovereign engines active'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
