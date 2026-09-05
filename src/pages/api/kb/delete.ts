import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';
import { readKbIndex, writeKbIndex, ensureStorageDir } from './files';

export const prerender = false;

const STORAGE_DIR = path.resolve(process.cwd(), 'sovereign-ai-workbench', 'data', 'knowledge');

export const DELETE: APIRoute = async ({ request }) => {
  try {
    await ensureStorageDir();
    const body = await request.json().catch(() => ({}));
    const filename = body.filename || body.id;

    if (!filename) {
      return new Response(JSON.stringify({ success: false, error: 'Filename or ID required for deletion' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const existingFiles = await readKbIndex();
    const targetFile = existingFiles.find(f => f.filename === filename || f.id === filename || f.name === filename);

    const safeFilename = targetFile ? targetFile.filename : filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const targetPath = path.join(STORAGE_DIR, safeFilename);

    try {
      await fs.unlink(targetPath);
    } catch (e) {
      // Ignore error if file physically missing
    }

    const updatedFiles = existingFiles.filter(f => f.filename !== safeFilename && f.id !== filename && f.name !== filename);
    await writeKbIndex(updatedFiles);

    return new Response(JSON.stringify({ success: true, message: `Successfully deleted ${safeFilename}`, files: updatedFiles }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Failed to delete Knowledge Base file:', err);
    return new Response(JSON.stringify({ success: false, error: err.message || 'Deletion failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Also support POST for clients that don't send DELETE body easily
export const POST: APIRoute = async (context) => {
  return DELETE(context);
};
