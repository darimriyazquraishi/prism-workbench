import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const prerender = false;

const STORAGE_DIR = path.resolve(process.cwd(), 'sovereign-ai-workbench', 'data', 'knowledge');
const INDEX_FILE = path.join(STORAGE_DIR, 'index.json');

export interface KbFileMetadata {
  id: string;
  name: string;
  filename: string;
  path: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  formattedDate: string;
}

export async function ensureStorageDir(): Promise<void> {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
    try {
      await fs.access(INDEX_FILE);
    } catch {
      await fs.writeFile(INDEX_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Failed to create storage directory:', err);
  }
}

export async function readKbIndex(): Promise<KbFileMetadata[]> {
  await ensureStorageDir();
  try {
    const raw = await fs.readFile(INDEX_FILE, 'utf-8');
    return JSON.parse(raw) as KbFileMetadata[];
  } catch {
    return [];
  }
}

export async function writeKbIndex(files: KbFileMetadata[]): Promise<void> {
  await ensureStorageDir();
  await fs.writeFile(INDEX_FILE, JSON.stringify(files, null, 2), 'utf-8');
}

export const GET: APIRoute = async () => {
  const files = await readKbIndex();
  return new Response(JSON.stringify({ success: true, files }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
