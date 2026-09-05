import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const prerender = false;

const STORAGE_DIR = path.resolve(process.cwd(), 'sovereign-ai-workbench', 'data', 'knowledge');

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.pdf': return 'application/pdf';
    case '.docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case '.xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case '.txt': return 'text/plain; charset=utf-8';
    case '.md': return 'text/markdown; charset=utf-8';
    case '.json': return 'application/json';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    default: return 'application/octet-stream';
  }
}

export const GET: APIRoute = async ({ params }) => {
  const filename = params.filename;

  if (!filename) {
    return new Response('Filename required', { status: 400 });
  }

  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = path.join(STORAGE_DIR, safeFilename);

  try {
    const fileBuffer = await fs.readFile(filePath);
    const mimeType = getMimeType(safeFilename);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${safeFilename}"`
      }
    });
  } catch {
    return new Response(`File not found: ${safeFilename}`, { status: 404 });
  }
};
