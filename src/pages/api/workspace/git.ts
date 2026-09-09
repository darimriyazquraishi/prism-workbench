import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getActiveWorkspaceRoot } from '../../../services/workspace/workspaceSecurity';

export const prerender = false;
const execAsync = promisify(exec);

export const GET: APIRoute = async () => {
  try {
    const root = getActiveWorkspaceRoot();
    const gitDir = path.join(root, '.git');

    if (!fs.existsSync(gitDir)) {
      return new Response(JSON.stringify({
        success: true,
        isGitRepo: false,
        message: 'Active workspace is not a Git repository'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let branch = 'unknown';
    try {
      const { stdout } = await execAsync('git branch --show-current', { cwd: root, timeout: 3000 });
      branch = stdout.trim() || 'main';
    } catch {}

    let modifiedFiles: string[] = [];
    let untrackedFiles: string[] = [];

    try {
      const { stdout } = await execAsync('git status --porcelain', { cwd: root, timeout: 3000 });
      const lines = stdout.split('\n').filter(Boolean);

      for (const line of lines) {
        const status = line.slice(0, 2);
        const fileName = line.slice(3).trim();
        if (status.includes('?')) {
          untrackedFiles.push(fileName);
        } else {
          modifiedFiles.push(fileName);
        }
      }
    } catch {}

    return new Response(JSON.stringify({
      success: true,
      isGitRepo: true,
      branch,
      modifiedFiles,
      untrackedFiles,
      dirtyCount: modifiedFiles.length + untrackedFiles.length,
      isClean: modifiedFiles.length === 0 && untrackedFiles.length === 0
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      error: err?.message || 'Git inspection error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
