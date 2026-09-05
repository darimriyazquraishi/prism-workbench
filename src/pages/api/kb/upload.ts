import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';
import { readKbIndex, writeKbIndex, ensureStorageDir, type KbFileMetadata } from './files';

export const prerender = false;

const STORAGE_DIR = path.resolve(process.cwd(), 'sovereign-ai-workbench', 'data', 'knowledge');

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    await ensureStorageDir();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ success: false, error: 'No valid file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const originalName = file.name;
    const safeFilename = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const targetPath = path.join(STORAGE_DIR, safeFilename);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(targetPath, buffer);

    const now = new Date();
    const metadata: KbFileMetadata = {
      id: `kb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: originalName,
      filename: safeFilename,
      path: targetPath,
      sizeBytes: buffer.length,
      mimeType: file.type || 'application/octet-stream',
      uploadedAt: now.toISOString(),
      formattedDate: formatDate(now)
    };

    const existingFiles = await readKbIndex();
    // Filter out if file with same filename already exists to update metadata
    const updatedFiles = [metadata, ...existingFiles.filter(f => f.filename !== safeFilename)];
    await writeKbIndex(updatedFiles);

    return new Response(JSON.stringify({ success: true, file: metadata, files: updatedFiles }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Failed to upload file to Knowledge Base:', err);
    return new Response(JSON.stringify({ success: false, error: err.message || 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
