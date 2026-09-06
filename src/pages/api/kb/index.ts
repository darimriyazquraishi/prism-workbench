import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const prerender = false;

const STORAGE_DIR = path.resolve(process.cwd(), 'sovereign-ai-workbench', 'data', 'knowledge');
const PARSED_FILE = path.join(STORAGE_DIR, 'parsed_knowledge.json');

export const GET: APIRoute = async () => {
  try {
    const raw = await fs.readFile(PARSED_FILE, 'utf-8');
    const documents = JSON.parse(raw);
    return new Response(JSON.stringify({ success: true, documents }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, documents: [], error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
