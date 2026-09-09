import type { APIRoute } from 'astro';
import {
  executeAiFilesystemTool,
  getSessionChanges,
  clearSessionChanges
} from '../../../services/workspace/aiToolController';
import { getFsAuditLogs } from '../../../services/workspace/workspaceSecurity';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const tool = body.tool;
    const args = body.args || {};
    const permissionMode = body.permissionMode || 'assisted';
    const approved = !!body.approved;

    if (!tool) {
      return new Response(JSON.stringify({ success: false, error: 'Tool name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await executeAiFilesystemTool({
      tool,
      args,
      permissionMode,
      approved
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err?.message || 'Tool execution error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const view = url.searchParams.get('view');
    if (view === 'audit') {
      const logs = getFsAuditLogs();
      return new Response(JSON.stringify({ success: true, logs }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (view === 'clear') {
      clearSessionChanges();
      return new Response(JSON.stringify({ success: true, message: 'Changes cleared' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const changes = getSessionChanges();
    return new Response(JSON.stringify({ success: true, changes }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err?.message || 'Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
