import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import {
  getActiveWorkspaceRoot,
  getActiveWorkspaceName,
  validatePathWithinWorkspace
} from '../../../services/workspace/workspaceSecurity';

export const prerender = false;

interface TreeNode {
  name: string;
  path: string; // relative to workspace root
  isDirectory: boolean;
  size?: number;
  extension?: string;
  modifiedAt?: string;
  children?: TreeNode[];
}

const DEFAULT_IGNORES = new Set([
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

function parseGitignore(root: string): Set<string> {
  const ignores = new Set<string>();
  try {
    const gitignorePath = path.join(root, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf-8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          ignores.add(trimmed.replace(/\/$/, ''));
        }
      });
    }
  } catch {}
  return ignores;
}

function buildTree(
  dirPath: string,
  rootPath: string,
  customIgnores: Set<string>,
  depth = 0,
  maxDepth = 4
): TreeNode[] {
  if (depth > maxDepth) return [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const nodes: TreeNode[] = [];

    for (const entry of entries) {
      if (DEFAULT_IGNORES.has(entry.name) || customIgnores.has(entry.name)) {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(rootPath, fullPath).replace(/\\/g, '/');

      let stat: fs.Stats | null = null;
      try {
        stat = fs.statSync(fullPath);
      } catch {}

      if (entry.isDirectory()) {
        const children = buildTree(fullPath, rootPath, customIgnores, depth + 1, maxDepth);
        nodes.push({
          name: entry.name,
          path: relativePath,
          isDirectory: true,
          modifiedAt: stat?.mtime.toISOString(),
          children
        });
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase().replace('.', '');
        nodes.push({
          name: entry.name,
          path: relativePath,
          isDirectory: false,
          size: stat?.size || 0,
          extension: ext,
          modifiedAt: stat?.mtime.toISOString()
        });
      }
    }

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

export const GET: APIRoute = async ({ url }) => {
  try {
    const root = getActiveWorkspaceRoot();
    const rootName = getActiveWorkspaceName();
    const subDirParam = url.searchParams.get('dir');

    let targetDir = root;
    if (subDirParam) {
      const validation = validatePathWithinWorkspace(subDirParam);
      if (!validation.valid || !validation.resolvedPath) {
        return new Response(JSON.stringify({
          success: false,
          error: validation.error || 'Access denied'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      targetDir = validation.resolvedPath;
    }

    const gitIgnores = parseGitignore(root);
    const tree = buildTree(targetDir, root, gitIgnores);

    return new Response(JSON.stringify({
      success: true,
      rootName,
      rootPath: root.replace(/\\/g, '/'),
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
      error: err?.message || 'Failed to scan workspace tree'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
