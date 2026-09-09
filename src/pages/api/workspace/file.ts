import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import {
  getActiveWorkspaceRoot,
  validatePathWithinWorkspace,
  logFsAudit
} from '../../../services/workspace/workspaceSecurity';

export const prerender = false;

const BINARY_EXTENSIONS = new Set([
  'docx', 'pptx', 'xlsx', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico',
  'zip', 'tar', 'gz', 'mp4', 'webm', 'mp3', 'wav', 'exe', 'bin', 'dll', 'so'
]);

// 1. READ FILE
export const GET: APIRoute = async ({ url }) => {
  try {
    const target = url.searchParams.get('path');
    if (!target) {
      return new Response(JSON.stringify({ success: false, error: 'Path parameter required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const validation = validatePathWithinWorkspace(target);
    if (!validation.valid || !validation.resolvedPath) {
      return new Response(JSON.stringify({ success: false, error: validation.error }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const filePath = validation.resolvedPath;
    if (!fs.existsSync(filePath)) {
      logFsAudit('READ', filePath, 'error', 'File not found');
      return new Response(JSON.stringify({ success: false, error: `File not found: ${validation.relativePath}` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      return new Response(JSON.stringify({ success: false, error: 'Target path is a directory, not a file' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ext = path.extname(filePath).toLowerCase().replace('.', '');
    const isBinary = BINARY_EXTENSIONS.has(ext);

    logFsAudit('READ', filePath, 'allowed');

    if (isBinary) {
      let extractedText: string | null = null;
      try {
        const { getDocumentByPath, getDocumentByName } = await import('../../../services/db/documentDb');
        const doc = getDocumentByPath(validation.relativePath) || getDocumentByName(path.basename(filePath));
        if (doc?.extracted_text) {
          extractedText = doc.extracted_text;
        }
      } catch {}

      return new Response(JSON.stringify({
        success: true,
        content: extractedText,
        extractedText,
        file: {
          name: path.basename(filePath),
          path: validation.relativePath,
          fullPath: filePath.replace(/\\/g, '/'),
          size: stat.size,
          extension: ext,
          isBinary: true,
          content: extractedText,
          extractedText,
          modifiedAt: stat.mtime.toISOString()
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Limit preview to 3MB
    if (stat.size > 3 * 1024 * 1024) {
      const fd = fs.openSync(filePath, 'r');
      const buffer = Buffer.alloc(500 * 1024);
      fs.readSync(fd, buffer, 0, buffer.length, 0);
      fs.closeSync(fd);
      const content = buffer.toString('utf-8') + '\n\n... [File truncated: showing first 500KB of ' + (stat.size / 1024).toFixed(1) + ' KB]';

      return new Response(JSON.stringify({
        success: true,
        content,
        file: {
          name: path.basename(filePath),
          path: validation.relativePath,
          fullPath: filePath.replace(/\\/g, '/'),
          size: stat.size,
          extension: ext,
          isBinary: false,
          content,
          modifiedAt: stat.mtime.toISOString()
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    return new Response(JSON.stringify({
      success: true,
      content,
      file: {
        name: path.basename(filePath),
        path: validation.relativePath,
        fullPath: filePath.replace(/\\/g, '/'),
        size: stat.size,
        extension: ext,
        isBinary: false,
        content,
        modifiedAt: stat.mtime.toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err?.message || 'Read error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// 2. WRITE / SAVE FILE
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const target = body.path;
    const content = body.content;

    if (!target) {
      return new Response(JSON.stringify({ success: false, error: 'Path parameter required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (content === undefined || content === null) {
      return new Response(JSON.stringify({ success: false, error: 'Content parameter required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const validation = validatePathWithinWorkspace(target);
    if (!validation.valid || !validation.resolvedPath) {
      return new Response(JSON.stringify({ success: false, error: validation.error }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const filePath = validation.resolvedPath;
    const parentDir = path.dirname(filePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    const stat = fs.statSync(filePath);

    logFsAudit('WRITE', filePath, 'allowed', `Wrote ${stat.size} bytes`);

    return new Response(JSON.stringify({
      success: true,
      message: `File ${validation.relativePath} saved to disk`,
      path: validation.relativePath,
      size: stat.size,
      modifiedAt: stat.mtime.toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err?.message || 'Write error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// 3. CREATE NEW FILE OR DIRECTORY
export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const target = body.path;
    const isDirectory = !!body.isDirectory;
    const content = body.content || '';

    if (!target) {
      return new Response(JSON.stringify({ success: false, error: 'Path parameter required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const validation = validatePathWithinWorkspace(target);
    if (!validation.valid || !validation.resolvedPath) {
      return new Response(JSON.stringify({ success: false, error: validation.error }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const filePath = validation.resolvedPath;
    if (fs.existsSync(filePath)) {
      return new Response(JSON.stringify({
        success: false,
        error: `Item already exists at path: ${validation.relativePath}`
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (isDirectory) {
      fs.mkdirSync(filePath, { recursive: true });
      logFsAudit('CREATE', filePath, 'allowed', 'Created directory');
      return new Response(JSON.stringify({
        success: true,
        message: `Directory ${validation.relativePath} created`,
        path: validation.relativePath,
        isDirectory: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const parentDir = path.dirname(filePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    const stat = fs.statSync(filePath);
    logFsAudit('CREATE', filePath, 'allowed', `Created file (${stat.size} bytes)`);

    return new Response(JSON.stringify({
      success: true,
      message: `File ${validation.relativePath} created`,
      path: validation.relativePath,
      isDirectory: false,
      size: stat.size,
      modifiedAt: stat.mtime.toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err?.message || 'Create error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// 4. DELETE FILE OR DIRECTORY
export const DELETE: APIRoute = async ({ request, url }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const target = body.path || url?.searchParams.get('path');

    if (!target) {
      return new Response(JSON.stringify({ success: false, error: 'Path parameter required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const validation = validatePathWithinWorkspace(target);
    if (!validation.valid || !validation.resolvedPath) {
      return new Response(JSON.stringify({ success: false, error: validation.error }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const filePath = validation.resolvedPath;
    const wsRoot = getActiveWorkspaceRoot();

    // Prevent deleting the workspace root itself
    if (path.resolve(filePath).toLowerCase() === path.resolve(wsRoot).toLowerCase()) {
      logFsAudit('DELETE', filePath, 'blocked', 'Attempt to delete workspace root blocked');
      return new Response(JSON.stringify({
        success: false,
        error: 'Security Error: Cannot delete the active workspace root directory'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!fs.existsSync(filePath)) {
      return new Response(JSON.stringify({
        success: false,
        error: `Path does not exist: ${validation.relativePath}`
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
      logFsAudit('DELETE', filePath, 'allowed', 'Deleted directory recursively');
    } else {
      fs.unlinkSync(filePath);
      logFsAudit('DELETE', filePath, 'allowed', 'Deleted file');
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully deleted ${validation.relativePath}`,
      path: validation.relativePath
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err?.message || 'Delete error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
