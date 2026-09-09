import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

export const prerender = false;

const BINARY_EXTENSIONS = new Set([
  'docx', 'pptx', 'xlsx', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico',
  'zip', 'tar', 'gz', 'mp4', 'webm', 'mp3', 'wav', 'exe', 'bin', 'dll', 'so'
]);

import { validatePathWithinWorkspace } from '../../../services/workspace/workspaceSecurity';

export const GET: APIRoute = async ({ url }) => {
  try {
    const filePathParam = url.searchParams.get('path');

    if (!filePathParam) {
      return new Response(JSON.stringify({ success: false, error: 'Missing path parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const val = validatePathWithinWorkspace(filePathParam);
    if (!val.valid) {
      return new Response(JSON.stringify({ success: false, error: 'Access denied: requested resource is outside the user workspace.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const resolvedPath = val.resolvedPath;
    if (!fs.existsSync(resolvedPath)) {
      return new Response(JSON.stringify({ success: false, error: 'File not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const stat = fs.statSync(resolvedPath);
    if (stat.isDirectory()) {
      return new Response(JSON.stringify({ success: false, error: 'Path is a directory' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const fileName = path.basename(resolvedPath);
    const ext = path.extname(fileName).toLowerCase().replace('.', '');
    const isBinary = BINARY_EXTENSIONS.has(ext);

    if (isBinary) {
      return new Response(JSON.stringify({
        success: true,
        file: {
          name: fileName,
          path: filePathParam.replace(/\\/g, '/'),
          size: stat.size,
          extension: ext,
          isBinary: true,
          content: null
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Limit maximum text preview to 2MB for responsiveness
    if (stat.size > 2 * 1024 * 1024) {
      const fd = fs.openSync(resolvedPath, 'r');
      const buffer = Buffer.alloc(500 * 1024);
      fs.readSync(fd, buffer, 0, buffer.length, 0);
      fs.closeSync(fd);
      const content = buffer.toString('utf-8') + '\n\n... [File truncated: showing first 500KB of ' + (stat.size / 1024).toFixed(1) + ' KB]';

      return new Response(JSON.stringify({
        success: true,
        file: {
          name: fileName,
          path: filePathParam.replace(/\\/g, '/'),
          size: stat.size,
          extension: ext,
          isBinary: false,
          content
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const content = fs.readFileSync(resolvedPath, 'utf-8');

    return new Response(JSON.stringify({
      success: true,
      file: {
        name: fileName,
        path: filePathParam.replace(/\\/g, '/'),
        size: stat.size,
        extension: ext,
        isBinary: false,
        content
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      error: err?.message || 'Failed to read file content'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
