import type { APIRoute } from 'astro';
import net from 'node:net';

export const prerender = false;

function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(350);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

export const GET: APIRoute = async () => {
  const ollama = await checkPort(11434);
  const visionServer = await checkPort(8080);
  return new Response(JSON.stringify({
    ollama,
    visionServer,
    port: 4321,
    loadedModel: 'Local Sovereign Engine'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
