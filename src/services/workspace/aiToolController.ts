import fs from 'fs';
import path from 'path';
import {
  getActiveWorkspaceRoot,
  getActiveWorkspaceName,
  validatePathWithinWorkspace,
  logFsAudit
} from './workspaceSecurity';

export type PermissionMode = 'safe' | 'assisted' | 'autonomous';

export interface ToolCallRequest {
  tool: string;
  args: Record<string, any>;
  permissionMode?: PermissionMode;
  approved?: boolean;
}

export interface ToolCallResult {
  success: boolean;
  tool: string;
  output?: any;
  error?: string;
  requiresApproval?: boolean;
  proposedChanges?: {
    path: string;
    action: 'create' | 'modify' | 'delete' | 'rename';
    diff?: string;
    originalContent?: string;
    newContent?: string;
  };
}

export interface ChangeRecord {
  id: string;
  timestamp: string;
  path: string;
  action: 'create' | 'modify' | 'delete' | 'rename';
  diff?: string;
}

// In-memory changes tracking for active AI session
let sessionChanges: ChangeRecord[] = [];

export function getSessionChanges(): ChangeRecord[] {
  return [...sessionChanges];
}

export function clearSessionChanges(): void {
  sessionChanges = [];
}

export function recordSessionChange(
  pathStr: string,
  action: ChangeRecord['action'],
  diff?: string
): void {
  sessionChanges.unshift({
    id: `chg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toLocaleTimeString(),
    path: pathStr.replace(/\\/g, '/'),
    action,
    diff
  });
  if (sessionChanges.length > 50) sessionChanges = sessionChanges.slice(0, 50);
}

/**
 * AI Tool Controller:
 * Dispatches the 11 filesystem tools with permission verification and path jail enforcement.
 */
export async function executeAiFilesystemTool(
  request: ToolCallRequest
): Promise<ToolCallResult> {
  const { tool, args = {}, permissionMode = 'assisted', approved = false } = request;
  const root = getActiveWorkspaceRoot();

  // 1. Tool: get_workspace_tree
  if (tool === 'get_workspace_tree') {
    try {
      const entries = fs.readdirSync(root, { withFileTypes: true });
      const items = entries
        .filter(e => !['node_modules', '.git', '.astro', 'dist'].includes(e.name))
        .map(e => ({ name: e.name, isDirectory: e.isDirectory() }));
      return {
        success: true,
        tool,
        output: { workspaceName: getActiveWorkspaceName(), rootPath: root, items }
      };
    } catch (err: any) {
      return { success: false, tool, error: err.message };
    }
  }

  // 2. Tool: list_directory
  if (tool === 'list_directory') {
    const targetDir = args.path || '.';
    const val = validatePathWithinWorkspace(targetDir);
    if (!val.valid || !val.resolvedPath) {
      return { success: false, tool, error: val.error };
    }

    try {
      if (!fs.existsSync(val.resolvedPath)) {
        return { success: false, tool, error: `Directory not found: ${val.relativePath}` };
      }
      const entries = fs.readdirSync(val.resolvedPath, { withFileTypes: true });
      const items = entries.map(e => ({
        name: e.name,
        path: path.join(val.relativePath || '.', e.name).replace(/\\/g, '/'),
        isDirectory: e.isDirectory()
      }));
      logFsAudit('LIST', val.resolvedPath, 'allowed');
      return { success: true, tool, output: { path: val.relativePath, items, count: items.length } };
    } catch (err: any) {
      return { success: false, tool, error: err.message };
    }
  }

  // 3. Tool: read_file
  if (tool === 'read_file') {
    const targetPath = args.path;
    const val = validatePathWithinWorkspace(targetPath);
    if (!val.valid) {
      return { success: false, tool, error: val.error };
    }

    try {
      if (!fs.existsSync(val.resolvedPath)) {
        return { success: false, tool, error: `File not found: ${val.relativePath}` };
      }
      const stat = fs.statSync(val.resolvedPath);
      if (stat.isDirectory()) {
        return { success: false, tool, error: `Path is a directory: ${val.relativePath}` };
      }
      const content = fs.readFileSync(val.resolvedPath, 'utf-8');
      logFsAudit('READ', val.resolvedPath, 'allowed');
      return {
        success: true,
        tool,
        output: { path: val.relativePath, size: stat.size, content }
      };
    } catch (err: any) {
      return { success: false, tool, error: err.message };
    }
  }

  // 4. Tool: search_files
  if (tool === 'search_files') {
    const query = args.query;
    const subPath = args.path || '.';
    const val = validatePathWithinWorkspace(subPath);
    if (!val.valid) {
      return { success: false, tool, error: val.error };
    }

    try {
      const matches: { path: string; line: number; text: string }[] = [];
      const searchRecursive = (dir: string) => {
        if (matches.length >= 50) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
          if (['node_modules', '.git', '.astro', 'dist'].includes(e.name)) continue;
          const full = path.join(dir, e.name);
          if (e.isDirectory()) {
            searchRecursive(full);
          } else if (e.isFile()) {
            try {
              const text = fs.readFileSync(full, 'utf-8');
              const lines = text.split('\n');
              const rel = path.relative(root, full).replace(/\\/g, '/');
              lines.forEach((l, idx) => {
                if (matches.length < 50 && l.toLowerCase().includes(query.toLowerCase())) {
                  matches.push({ path: rel, line: idx + 1, text: l.trim() });
                }
              });
            } catch {}
          }
        }
      };
      searchRecursive(val.resolvedPath);
      logFsAudit('SEARCH', query, 'allowed', `Found ${matches.length} matches`);
      return { success: true, tool, output: { query, count: matches.length, matches } };
    } catch (err: any) {
      return { success: false, tool, error: err.message };
    }
  }

  // 5. Tool: get_file_info
  if (tool === 'get_file_info') {
    const val = validatePathWithinWorkspace(args.path);
    if (!val.valid) {
      return { success: false, tool, error: val.error };
    }
    try {
      if (!fs.existsSync(val.resolvedPath)) {
        return { success: false, tool, error: `File not found: ${val.relativePath}` };
      }
      const stat = fs.statSync(val.resolvedPath);
      return {
        success: true,
        tool,
        output: {
          path: val.relativePath,
          size: stat.size,
          isDirectory: stat.isDirectory(),
          modifiedAt: stat.mtime.toISOString(),
          extension: path.extname(val.resolvedPath).replace('.', '')
        }
      };
    } catch (err: any) {
      return { success: false, tool, error: err.message };
    }
  }

  // -------------------------------------------------------------
  // MUTATION TOOLS: WRITE, CREATE, EDIT, RENAME, MOVE, DELETE
  // -------------------------------------------------------------

  // Safe Mode requires explicit confirmation for any mutation
  if (permissionMode === 'safe' && !approved) {
    return {
      success: false,
      tool,
      requiresApproval: true,
      error: `Action "${tool}" requires user confirmation in Safe Mode`,
      proposedChanges: {
        path: args.path || args.oldPath || 'unknown',
        action: tool === 'delete_file' ? 'delete' : tool === 'create_file' ? 'create' : 'modify',
        newContent: args.content
      }
    };
  }

  // 6. Tool: create_file
  if (tool === 'create_file') {
    const val = validatePathWithinWorkspace(args.path);
    if (!val.valid) return { success: false, tool, error: val.error };

    const filePath = val.resolvedPath;
    const content = args.content || '';

    // In Assisted Mode, if file already exists, require approval to overwrite
    if (permissionMode === 'assisted' && fs.existsSync(filePath) && !approved) {
      return {
        success: false,
        tool,
        requiresApproval: true,
        error: `File ${val.relativePath} already exists. Overwrite requires confirmation.`,
        proposedChanges: {
          path: val.relativePath,
          action: 'modify',
          newContent: content
        }
      };
    }

    try {
      const parent = path.dirname(filePath);
      if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
      fs.writeFileSync(filePath, content, 'utf-8');
      logFsAudit('CREATE', filePath, 'allowed', `Created file ${val.relativePath}`);
      recordSessionChange(val.relativePath, 'create');
      return {
        success: true,
        tool,
        output: { path: val.relativePath, size: Buffer.byteLength(content), status: 'created' }
      };
    } catch (err: any) {
      return { success: false, tool, error: err.message };
    }
  }

  // 7. Tool: create_directory
  if (tool === 'create_directory') {
    const val = validatePathWithinWorkspace(args.path);
    if (!val.valid) return { success: false, tool, error: val.error };

    try {
      fs.mkdirSync(val.resolvedPath, { recursive: true });
      logFsAudit('CREATE', val.resolvedPath, 'allowed', `Created directory ${val.relativePath}`);
      recordSessionChange(val.relativePath, 'create');
      return { success: true, tool, output: { path: val.relativePath, status: 'created' } };
    } catch (err: any) {
      return { success: false, tool, error: err.message };
    }
  }

  // 8. Tool: write_file
  if (tool === 'write_file') {
    const val = validatePathWithinWorkspace(args.path);
    if (!val.valid) return { success: false, tool, error: val.error };

    const filePath = val.resolvedPath;
    const content = args.content ?? '';

    // In Assisted mode, check if overwriting existing file
    if (permissionMode === 'assisted' && fs.existsSync(filePath) && !approved) {
      const oldContent = fs.readFileSync(filePath, 'utf-8');
      return {
        success: false,
        tool,
        requiresApproval: true,
        error: `Overwriting ${val.relativePath} requires confirmation in Assisted Mode`,
        proposedChanges: {
          path: val.relativePath,
          action: 'modify',
          originalContent: oldContent,
          newContent: content
        }
      };
    }

    try {
      const parent = path.dirname(filePath);
      if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
      fs.writeFileSync(filePath, content, 'utf-8');
      logFsAudit('WRITE', filePath, 'allowed', `Saved ${Buffer.byteLength(content)} bytes`);
      recordSessionChange(val.relativePath, 'modify');
      return {
        success: true,
        tool,
        output: { path: val.relativePath, size: Buffer.byteLength(content), status: 'written' }
      };
    } catch (err: any) {
      return { success: false, tool, error: err.message };
    }
  }

  // 9. Tool: edit_file (Find/Replace or Diff patch)
  if (tool === 'edit_file') {
    const val = validatePathWithinWorkspace(args.path);
    if (!val.valid) return { success: false, tool, error: val.error };

    const filePath = val.resolvedPath;
    if (!fs.existsSync(filePath)) {
      return { success: false, tool, error: `File not found: ${val.relativePath}` };
    }

    try {
      const current = fs.readFileSync(filePath, 'utf-8');
      let updated = current;

      if (args.changes?.find !== undefined && args.changes?.replace !== undefined) {
        updated = current.replace(args.changes.find, args.changes.replace);
      } else if (typeof args.newContent === 'string') {
        updated = args.newContent;
      } else if (typeof args.content === 'string') {
        updated = args.content;
      }

      if (permissionMode === 'assisted' && !approved) {
        return {
          success: false,
          tool,
          requiresApproval: true,
          error: `Modifying ${val.relativePath} requires user confirmation`,
          proposedChanges: {
            path: val.relativePath,
            action: 'modify',
            originalContent: current,
            newContent: updated
          }
        };
      }

      fs.writeFileSync(filePath, updated, 'utf-8');
      logFsAudit('EDIT', filePath, 'allowed', `Edited ${val.relativePath}`);
      recordSessionChange(val.relativePath, 'modify');
      return {
        success: true,
        tool,
        output: { path: val.relativePath, status: 'edited', size: Buffer.byteLength(updated) }
      };
    } catch (err: any) {
      return { success: false, tool, error: err.message };
    }
  }

  // 10. Tool: rename_file / move_file
  if (tool === 'rename_file' || tool === 'move_file') {
    const srcVal = validatePathWithinWorkspace(args.oldPath || args.source);
    const destVal = validatePathWithinWorkspace(args.newPath || args.destination);

    if (!srcVal.valid) return { success: false, tool, error: srcVal.error };
    if (!destVal.valid) return { success: false, tool, error: destVal.error };

    if (!fs.existsSync(srcVal.resolvedPath)) {
      return { success: false, tool, error: `Source does not exist: ${srcVal.relativePath}` };
    }

    try {
      const destParent = path.dirname(destVal.resolvedPath);
      if (!fs.existsSync(destParent)) fs.mkdirSync(destParent, { recursive: true });

      fs.renameSync(srcVal.resolvedPath, destVal.resolvedPath);
      logFsAudit('RENAME', `${srcVal.relativePath} -> ${destVal.relativePath}`, 'allowed');
      recordSessionChange(destVal.relativePath, 'rename');
      return {
        success: true,
        tool,
        output: { oldPath: srcVal.relativePath, newPath: destVal.relativePath, status: 'renamed' }
      };
    } catch (err: any) {
      return { success: false, tool, error: err.message };
    }
  }

  // 11. Tool: delete_file
  if (tool === 'delete_file') {
    const val = validatePathWithinWorkspace(args.path);
    if (!val.valid) return { success: false, tool, error: val.error };

    const filePath = val.resolvedPath;
    if (path.resolve(filePath).toLowerCase() === path.resolve(root).toLowerCase()) {
      return { success: false, tool, error: 'Security Violation: Cannot delete active workspace root' };
    }

    if (!fs.existsSync(filePath)) {
      return { success: false, tool, error: `File not found: ${val.relativePath}` };
    }

    // Deleting is ALWAYS confirmed in Safe & Assisted modes
    if ((permissionMode === 'safe' || permissionMode === 'assisted') && !approved) {
      return {
        success: false,
        tool,
        requiresApproval: true,
        error: `Deleting "${val.relativePath}" requires explicit confirmation`,
        proposedChanges: {
          path: val.relativePath,
          action: 'delete'
        }
      };
    }

    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
        logFsAudit('DELETE', filePath, 'allowed', 'Deleted directory');
      } else {
        fs.unlinkSync(filePath);
        logFsAudit('DELETE', filePath, 'allowed', 'Deleted file');
      }
      recordSessionChange(val.relativePath, 'delete');
      return { success: true, tool, output: { path: val.relativePath, status: 'deleted' } };
    } catch (err: any) {
      return { success: false, tool, error: err.message };
    }
  }

  return { success: false, tool, error: `Unknown tool "${tool}"` };
}
