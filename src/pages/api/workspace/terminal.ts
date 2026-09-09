import type { APIRoute } from 'astro';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getActiveWorkspaceRoot, logFsAudit } from '../../../services/workspace/workspaceSecurity';

export const prerender = false;
const execAsync = promisify(exec);

const BLOCKED_PATTERNS = [
  /rm\s+-rf\s+\/($|\s)/,
  /format\s+[c-z]:/i,
  /del\s+\/s\s+\/q\s+[c-z]:\\/i,
  /:(){ :|:& };:/,
  /\.\.[/\\]/,
  /\bcd\s+\.\./i
];

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const command = (body.command || '').trim();

    if (!command) {
      return new Response(JSON.stringify({ success: false, error: 'Command parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Safety & Traversal filter
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(command)) {
        logFsAudit('COMMAND', 'traversal_or_unsafe_command', 'blocked', 'Blocked command attempting traversal or system destruction');
        return new Response(JSON.stringify({
          success: false,
          error: 'Access denied: requested command attempts to navigate outside the user workspace.'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const root = getActiveWorkspaceRoot();
    logFsAudit('COMMAND', command, 'allowed', 'Executed in user workspace');

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: root,
        timeout: 15000,
        maxBuffer: 1024 * 1024 * 2
      });

      return new Response(JSON.stringify({
        success: true,
        command,
        stdout: stdout.toString(),
        stderr: stderr.toString(),
        cwd: path.basename(root)
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (cmdErr: any) {
      return new Response(JSON.stringify({
        success: false,
        command,
        error: cmdErr.message || 'Execution error',
        stdout: cmdErr.stdout?.toString() || '',
        stderr: cmdErr.stderr?.toString() || cmdErr.message,
        exitCode: cmdErr.code || 1,
        cwd: root.replace(/\\/g, '/')
      }), {
        status: 200, // Return 200 so UI terminal displays output
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err?.message || 'Terminal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
