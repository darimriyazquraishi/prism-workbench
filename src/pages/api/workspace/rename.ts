import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import {
  validatePathWithinWorkspace,
  logFsAudit
} from '../../../services/workspace/workspaceSecurity';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const oldPath = body.oldPath || body.source;
    const newPath = body.newPath || body.destination;

    if (!oldPath || !newPath) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Both oldPath/source and newPath/destination parameters are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const valSource = validatePathWithinWorkspace(oldPath);
    if (!valSource.valid || !valSource.resolvedPath) {
      return new Response(JSON.stringify({ success: false, error: `Source invalid: ${valSource.error}` }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const valDest = validatePathWithinWorkspace(newPath);
    if (!valDest.valid || !valDest.resolvedPath) {
      return new Response(JSON.stringify({ success: false, error: `Destination invalid: ${valDest.error}` }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const src = valSource.resolvedPath;
    const dest = valDest.resolvedPath;

    if (!fs.existsSync(src)) {
      return new Response(JSON.stringify({
        success: false,
        error: `Source does not exist: ${valSource.relativePath}`
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Ensure destination parent dir exists
    const destParent = path.dirname(dest);
    if (!fs.existsSync(destParent)) {
      fs.mkdirSync(destParent, { recursive: true });
    }

    fs.renameSync(src, dest);
    logFsAudit('RENAME', `${valSource.relativePath} -> ${valDest.relativePath}`, 'allowed');

    return new Response(JSON.stringify({
      success: true,
      message: `Renamed ${valSource.relativePath} to ${valDest.relativePath}`,
      oldPath: valSource.relativePath,
      newPath: valDest.relativePath
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err?.message || 'Rename error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
