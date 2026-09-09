import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import {
  getActiveWorkspaceRoot,
  validatePathWithinWorkspace,
  logFsAudit
} from '../../../services/workspace/workspaceSecurity';

export const prerender = false;

interface SearchMatch {
  path: string;
  lineNumber: number;
  lineContent: string;
}

const IGNORE_DIRS = new Set(['node_modules', '.git', '.astro', 'dist', '.gemini', 'build']);

function searchInDir(
  dir: string,
  root: string,
  query: string,
  matches: SearchMatch[],
  maxMatches = 100
): void {
  if (matches.length >= maxMatches) return;

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORE_DIRS.has(entry.name)) continue;

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        searchInDir(fullPath, root, query, matches, maxMatches);
      } else if (entry.isFile()) {
        // Skip large files (> 1MB) or obvious binaries
        try {
          const stat = fs.statSync(fullPath);
          if (stat.size > 1024 * 1024) continue;

          const ext = path.extname(entry.name).toLowerCase();
          const binaryExts = ['.png', '.jpg', '.jpeg', '.zip', '.pdf', '.docx', '.pptx', '.xlsx', '.ico'];
          if (binaryExts.includes(ext)) continue;

          const content = fs.readFileSync(fullPath, 'utf-8');
          const lines = content.split('\n');
          const relPath = path.relative(root, fullPath).replace(/\\/g, '/');

          const queryLower = query.toLowerCase();

          for (let i = 0; i < lines.length; i++) {
            if (matches.length >= maxMatches) break;
            const line = lines[i];
            if (line.toLowerCase().includes(queryLower)) {
              matches.push({
                path: relPath,
                lineNumber: i + 1,
                lineContent: line.trim()
              });
            }
          }
        } catch {}
      }
    }
  } catch {}
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const query = body.query || body.q;
    const subPath = body.path || '.';

    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Query parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const val = validatePathWithinWorkspace(subPath);
    if (!val.valid || !val.resolvedPath) {
      return new Response(JSON.stringify({ success: false, error: val.error }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const root = getActiveWorkspaceRoot();
    const searchRoot = val.resolvedPath;
    const matches: SearchMatch[] = [];

    searchInDir(searchRoot, root, query, matches);

    logFsAudit('SEARCH', query, 'allowed', `Found ${matches.length} matches`);

    return new Response(JSON.stringify({
      success: true,
      query,
      count: matches.length,
      matches
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err?.message || 'Search error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
