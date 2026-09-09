import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

export const prerender = false;

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  extension?: string;
  children?: TreeNode[];
}

const IGNORED_NAMES = new Set([
  'node_modules',
  '.git',
  '.astro',
  'dist',
  '.gemini',
  '.vscode',
  '.idea',
  'build',
  'coverage',
  '.DS_Store'
]);

function buildTree(dirPath: string, rootDir: string, depth = 0, maxDepth = 4): TreeNode[] {
  if (depth > maxDepth) return [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const nodes: TreeNode[] = [];

    for (const entry of entries) {
      if (IGNORED_NAMES.has(entry.name)) continue;

      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        const children = buildTree(fullPath, rootDir, depth + 1, maxDepth);
        nodes.push({
          name: entry.name,
          path: relativePath,
          isDirectory: true,
          children
        });
      } else if (entry.isFile()) {
        let size = 0;
        try {
          size = fs.statSync(fullPath).size;
        } catch {}

        const ext = path.extname(entry.name).toLowerCase().replace('.', '');
        nodes.push({
          name: entry.name,
          path: relativePath,
          isDirectory: false,
          size,
          extension: ext
        });
      }
    }

    // Sort: directories first, then alphabetical
    nodes.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });

    return nodes;
  } catch (err) {
    return [];
  }
}

import { getActiveWorkspaceRoot, validatePathWithinWorkspace } from '../../../services/workspace/workspaceSecurity';

export const GET: APIRoute = async ({ url }) => {
  try {
    const workspaceRoot = getActiveWorkspaceRoot();
    const queryPath = url.searchParams.get('dir');
    let targetDir = workspaceRoot;

    if (queryPath) {
      const val = validatePathWithinWorkspace(queryPath);
      if (!val.valid) {
        return new Response(JSON.stringify({ success: false, error: 'Access denied: requested resource is outside the user workspace.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (fs.existsSync(val.resolvedPath) && fs.statSync(val.resolvedPath).isDirectory()) {
        targetDir = val.resolvedPath;
      }
    }

    const tree = buildTree(targetDir, targetDir);
    const rootName = path.basename(targetDir);

    return new Response(JSON.stringify({
      success: true,
      rootName,
      rootPath: targetDir.replace(/\\/g, '/'),
      tree
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      error: err?.message || 'Failed to read workspace tree'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
