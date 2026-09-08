import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

function scanDirForGguf(dirPath: string): any[] {
  const results: any[] = [];
  try {
    if (!fs.existsSync(dirPath)) return results;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        results.push(...scanDirForGguf(fullPath));
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.gguf')) {
        try {
          const stats = fs.statSync(fullPath);
          const sizeGb = Math.round((stats.size / (1024 * 1024 * 1024)) * 100) / 100;
          const isMmproj = entry.name.toLowerCase().includes('mmproj');
          results.push({
            name: entry.name,
            path: fullPath,
            sizeGb,
            isMmproj,
            dir: path.dirname(fullPath)
          });
        } catch {}
      }
    }
  } catch {}
  return results;
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const userPath = url.searchParams.get('path');

  const cwd = process.cwd();
  const candidates: string[] = [];

  if (userPath) {
    if (path.isAbsolute(userPath) && fs.existsSync(userPath)) {
      candidates.push(userPath);
    } else {
      const p1 = path.join(cwd, userPath);
      if (fs.existsSync(p1)) candidates.push(p1);
      const parent = path.dirname(cwd);
      const p2 = path.join(parent, userPath);
      if (fs.existsSync(p2)) candidates.push(p2);
    }
  }

  candidates.push(path.join(cwd, 'models'));
  candidates.push(path.join(path.dirname(cwd), 'models'));
  candidates.push(path.join(cwd, 'LUMI_Desktop', 'models'));

  let chosenFolder = candidates[0];
  let models: any[] = [];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const found = scanDirForGguf(candidate);
      if (found.length > 0) {
        chosenFolder = candidate;
        models = found;
        break;
      }
    }
  }

  return new Response(JSON.stringify({
    folder: chosenFolder || 'models',
    models
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
