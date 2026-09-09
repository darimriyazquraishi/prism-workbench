import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const prerender = false;

const STORAGE_DIR = path.resolve(process.cwd(), 'sovereign-ai-workbench', 'data', 'knowledge');
const INDEX_FILE = path.join(STORAGE_DIR, 'index.json');
const PARSED_FILE = path.join(STORAGE_DIR, 'parsed_knowledge.json');

export interface KbFileMetadata {
  id: string;
  name: string;
  filename: string;
  path: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  formattedDate: string;
  document_type?: string;
  category?: string;
  summary?: string;
  content?: string;
  totalChunks?: number;
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

export async function readKbFiles(): Promise<KbFileMetadata[]> {
  await ensureStorageDir();
  
  let indexList: Partial<KbFileMetadata>[] = [];
  try {
    const rawIndex = await fs.readFile(INDEX_FILE, 'utf-8');
    indexList = JSON.parse(rawIndex);
  } catch {
    indexList = [];
  }

  let parsedList: any[] = [];
  try {
    const rawParsed = await fs.readFile(PARSED_FILE, 'utf-8');
    parsedList = JSON.parse(rawParsed);
  } catch {
    parsedList = [];
  }

  // Create lookup maps
  const parsedMap = new Map<string, any>();
  for (const p of parsedList) {
    if (p.filename) parsedMap.set(p.filename.toLowerCase(), p);
    if (p.id) parsedMap.set(p.id.toLowerCase(), p);
    if (p.name) parsedMap.set(p.name.toLowerCase(), p);
  }

  const merged: KbFileMetadata[] = [];
  const processedKeys = new Set<string>();

  // Process index.json entries first
  for (const idxItem of indexList) {
    const key = (idxItem.filename || idxItem.id || idxItem.name || '').toLowerCase();
    const parsed = parsedMap.get(key) || {};
    processedKeys.add(key);

    const fullItem: KbFileMetadata = {
      id: idxItem.id || parsed.id || `kb-${Date.now()}`,
      name: idxItem.name || parsed.name || idxItem.filename || 'Document',
      filename: idxItem.filename || parsed.filename || idxItem.name || 'document',
      path: idxItem.path || path.join(STORAGE_DIR, idxItem.filename || ''),
      sizeBytes: idxItem.sizeBytes || 0,
      mimeType: idxItem.mimeType || 'application/octet-stream',
      uploadedAt: idxItem.uploadedAt || new Date().toISOString(),
      formattedDate: idxItem.formattedDate || 'Saved',
      document_type: parsed.document_type || 'guideline',
      category: parsed.category || 'General',
      summary: parsed.summary || (parsed.content ? parsed.content.slice(0, 200) + '...' : ''),
      content: parsed.content || '',
      totalChunks: parsed.content ? Math.max(1, Math.ceil(parsed.content.split(/\s+/).length / 150)) : 1
    };
    merged.push(fullItem);
  }

  // Add any items that were only in parsed_knowledge.json
  for (const parsed of parsedList) {
    const key = (parsed.filename || parsed.id || parsed.name || '').toLowerCase();
    if (!processedKeys.has(key)) {
      processedKeys.add(key);
      merged.push({
        id: parsed.id || `kb-${Date.now()}`,
        name: parsed.name || parsed.filename || 'Document',
        filename: parsed.filename || 'document',
        path: path.join(STORAGE_DIR, parsed.filename || ''),
        sizeBytes: 0,
        mimeType: 'application/pdf',
        uploadedAt: new Date().toISOString(),
        formattedDate: 'Pre-indexed',
        document_type: parsed.document_type || 'guideline',
        category: parsed.category || 'General',
        summary: parsed.summary || (parsed.content ? parsed.content.slice(0, 200) + '...' : ''),
        content: parsed.content || '',
        totalChunks: parsed.content ? Math.max(1, Math.ceil(parsed.content.split(/\s+/).length / 150)) : 1
      });
    }
  }

  return merged;
}

export async function writeKbFiles(files: KbFileMetadata[]): Promise<void> {
  await ensureStorageDir();

  // 1. Write clean index.json
  const indexEntries = files.map(f => ({
    id: f.id,
    name: f.name,
    filename: f.filename,
    path: f.path,
    sizeBytes: f.sizeBytes,
    mimeType: f.mimeType,
    uploadedAt: f.uploadedAt,
    formattedDate: f.formattedDate
  }));
  await fs.writeFile(INDEX_FILE, JSON.stringify(indexEntries, null, 2), 'utf-8');

  // 2. Write parsed_knowledge.json with full content
  const parsedEntries = files.map(f => ({
    id: f.id,
    name: f.name,
    filename: f.filename,
    document_type: f.document_type || 'guideline',
    category: f.category || 'General',
    summary: f.summary || '',
    content: f.content || ''
  }));
  await fs.writeFile(PARSED_FILE, JSON.stringify(parsedEntries, null, 2), 'utf-8');
}

// Backward compatibility exports
export const readKbIndex = readKbFiles;
export const writeKbIndex = writeKbFiles;

export const GET: APIRoute = async () => {
  const files = await readKbFiles();
  return new Response(JSON.stringify({ success: true, files }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
