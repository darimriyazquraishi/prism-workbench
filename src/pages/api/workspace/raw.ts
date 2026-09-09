import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { validatePathWithinWorkspace } from '../../../services/workspace/workspaceSecurity';

export const prerender = false;

const MIME_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  txt: 'text/plain; charset=utf-8',
  md: 'text/markdown; charset=utf-8',
  csv: 'text/csv; charset=utf-8',
  json: 'application/json; charset=utf-8',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
};

export const GET: APIRoute = async ({ url }) => {
  const targetPath = url.searchParams.get('path');
  if (!targetPath) {
    return new Response('Path required', { status: 400 });
  }

  // 1. Strict Server-Side Workspace Security Boundary Enforcement
  const validation = validatePathWithinWorkspace(targetPath);
  if (!validation.valid || !validation.resolvedPath) {
    return new Response(validation.error || 'Access denied: requested resource is outside the user workspace.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  const resolved = validation.resolvedPath;
  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    return new Response('File not found', { status: 404 });
  }

  const ext = path.extname(resolved).toLowerCase().replace('.', '');
  const contentType = MIME_MAP[ext] || 'application/octet-stream';
  const fileBuffer = fs.readFileSync(resolved);

  return new Response(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${path.basename(resolved)}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff'
    }
  });
};
