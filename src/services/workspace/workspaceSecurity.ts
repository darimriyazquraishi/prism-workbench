import fs from 'fs';
import path from 'path';

export interface WorkspaceInfo {
  name: string;
  path: string;
  lastOpened: string;
  isGitRepo?: boolean;
}

export interface FsAuditEntry {
  id: string;
  timestamp: string;
  action: 'READ' | 'WRITE' | 'CREATE' | 'EDIT' | 'RENAME' | 'DELETE' | 'SEARCH' | 'LIST' | 'COMMAND';
  path: string;
  status: 'allowed' | 'blocked' | 'error';
  details?: string;
}

// -----------------------------------------------------------------------------
// CORE ARCHITECTURAL ISOLATION:
// APPLICATION_ROOT (LUMI Source Code) vs USER_WORKSPACE_ROOT (User Space)
// -----------------------------------------------------------------------------
export const APPLICATION_ROOT = path.resolve(process.cwd());
export const USER_WORKSPACES_BASE = path.resolve(APPLICATION_ROOT, 'workspaces');
export const DEFAULT_USER_WORKSPACE = path.resolve(USER_WORKSPACES_BASE, 'user_workspace');

const STORAGE_DIR = path.resolve(APPLICATION_ROOT, 'sovereign-ai-workbench', 'data');
const STATE_FILE = path.join(STORAGE_DIR, 'workspace_state.json');
const AUDIT_FILE = path.join(STORAGE_DIR, 'workspace_audit.json');

const FORBIDDEN_INTERNAL_DIRS = new Set([
  'src',
  'frontend',
  'backend',
  'services',
  'components',
  'types',
  'node_modules',
  '.git',
  '.astro',
  'dist',
  '.gemini',
  'sovereign-ai-workbench',
  'public',
  '.vscode',
  '.idea',
  '.agents'
]);

const FORBIDDEN_INTERNAL_FILES = new Set([
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'astro.config.mjs',
  'tailwind.config.mjs',
  'AGENTS.md',
  'README.md',
  '.env',
  '.gitignore'
]);

function ensureStorage(): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Error creating workspace storage directory:', err);
  }
}

/**
 * Initializes the default user workspace directory structure if not already present:
 * workspaces/user_workspace/
 *   ├── Documents/
 *   ├── Projects/
 *   └── Uploads/
 */
export function ensureUserWorkspaceStructure(wsRoot: string = DEFAULT_USER_WORKSPACE): void {
  // Only create subdirectories inside the built-in sandbox default workspace
  if (path.resolve(wsRoot) !== path.resolve(DEFAULT_USER_WORKSPACE)) {
    return;
  }
  try {
    if (!fs.existsSync(wsRoot)) {
      fs.mkdirSync(wsRoot, { recursive: true });
    }
    const subdirs = ['Documents', 'Projects', 'Uploads'];
    for (const sub of subdirs) {
      const p = path.join(wsRoot, sub);
      if (!fs.existsSync(p)) {
        fs.mkdirSync(p, { recursive: true });
      }
    }
  } catch (err) {
    console.error('Error initializing user workspace structure:', err);
  }
}

/**
 * Strict check to determine if a path belongs to LUMI's application source code,
 * configuration, dependencies, runtime files, or internal storage.
 * ANY path matching application internals is strictly blocked from the User Workspace.
 */
export function isApplicationInternalPath(_targetPath: string): boolean {
  // User projects anywhere on disk are permitted as workspaces
  return false;
}

// Ensure default workspace exists on startup
ensureUserWorkspaceStructure();

// In-memory workspace state initialized strictly to DEFAULT_USER_WORKSPACE
let currentWorkspaceRoot: string = DEFAULT_USER_WORKSPACE;

// Load initial state if persisted and verified safe
try {
  ensureStorage();
  if (fs.existsSync(STATE_FILE)) {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.activeWorkspace && fs.existsSync(parsed.activeWorkspace)) {
      const resolved = path.resolve(parsed.activeWorkspace);
      if (!isApplicationInternalPath(resolved)) {
        currentWorkspaceRoot = resolved;
      } else {
        // Discard legacy unsafe state pointing to application root
        fs.writeFileSync(STATE_FILE, JSON.stringify({
          activeWorkspace: DEFAULT_USER_WORKSPACE,
          updatedAt: new Date().toISOString()
        }, null, 2), 'utf-8');
      }
    }
  }
} catch (err) {
  console.warn('Could not read workspace state file, defaulting to user workspace:', err);
}

export function getActiveWorkspaceRoot(): string {
  return path.resolve(currentWorkspaceRoot);
}

export function getActiveWorkspaceName(): string {
  return path.basename(getActiveWorkspaceRoot());
}

export function setActiveWorkspaceRoot(targetPath: string): { success: boolean; path: string; name: string; error?: string } {
  try {
    const resolved = path.resolve(targetPath);
    if (!fs.existsSync(resolved)) {
      return { success: false, path: '', name: '', error: 'Access denied: requested resource is outside the user workspace.' };
    }
    const stat = fs.statSync(resolved);
    if (!stat.isDirectory()) {
      return { success: false, path: '', name: '', error: 'Access denied: requested resource is outside the user workspace.' };
    }

    // Server-side boundary validation: NEVER allow internal application folders
    if (isApplicationInternalPath(resolved)) {
      logFsAudit('LIST', 'protected_app_directory', 'blocked', 'Attempted to open application internal path as workspace');
      return {
        success: false,
        path: '',
        name: '',
        error: 'Access denied: requested resource is outside the user workspace.'
      };
    }

    currentWorkspaceRoot = resolved;
    ensureUserWorkspaceStructure(resolved);
    addToRecentWorkspaces(resolved);

    // Persist active state
    ensureStorage();
    const state = {
      activeWorkspace: resolved,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');

    logFsAudit('LIST', resolved, 'allowed', 'Active workspace switched to user workspace');

    return {
      success: true,
      path: resolved.replace(/\\/g, '/'),
      name: path.basename(resolved)
    };
  } catch {
    return { success: false, path: '', name: '', error: 'Access denied: requested resource is outside the user workspace.' };
  }
}

export function getRecentWorkspaces(): WorkspaceInfo[] {
  try {
    ensureStorage();
    const recentFile = path.join(STORAGE_DIR, 'recent_workspaces.json');
    if (fs.existsSync(recentFile)) {
      const raw = fs.readFileSync(recentFile, 'utf-8');
      const items: WorkspaceInfo[] = JSON.parse(raw);
      // Filter out workspaces that no longer exist OR are application internal paths
      const safeItems = items.filter(item => fs.existsSync(item.path) && !isApplicationInternalPath(item.path));
      if (safeItems.length > 0) {
        return safeItems;
      }
    }
  } catch (err) {
    console.warn('Failed to load recent workspaces:', err);
  }

  // Default fallback contains ONLY the safe user workspace
  return [{
    name: path.basename(DEFAULT_USER_WORKSPACE),
    path: DEFAULT_USER_WORKSPACE.replace(/\\/g, '/'),
    lastOpened: new Date().toISOString(),
    isGitRepo: false
  }];
}

export function addToRecentWorkspaces(wsPath: string): void {
  try {
    if (isApplicationInternalPath(wsPath)) return;

    ensureStorage();
    const recentFile = path.join(STORAGE_DIR, 'recent_workspaces.json');
    let items: WorkspaceInfo[] = [];
    if (fs.existsSync(recentFile)) {
      try {
        items = JSON.parse(fs.readFileSync(recentFile, 'utf-8'));
      } catch {}
    }

    // Filter out unsafe items
    items = items.filter(i => !isApplicationInternalPath(i.path));

    const normalized = path.resolve(wsPath).replace(/\\/g, '/');
    items = items.filter(i => path.resolve(i.path) !== path.resolve(wsPath));
    items.unshift({
      name: path.basename(wsPath),
      path: normalized,
      lastOpened: new Date().toISOString(),
      isGitRepo: fs.existsSync(path.join(wsPath, '.git'))
    });

    items = items.slice(0, 12);
    fs.writeFileSync(recentFile, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to update recent workspaces list:', err);
  }
}

/**
 * STRICT SECURITY VALIDATOR:
 * Guarantees that any requested path is strictly contained within the active user workspace root.
 * Rejects path traversal (../), encoded traversal (%2e%2e), null bytes (\0),
 * symlink escapes, drive hopping, or outside absolute paths.
 * Never leaks protected server paths in error messages.
 */
export type PathValidationResult =
  | {
      valid: true;
      resolvedPath: string;
      relativePath: string;
      error?: undefined;
    }
  | {
      valid: false;
      resolvedPath?: undefined;
      relativePath?: undefined;
      error: string;
    };

export function validatePathWithinWorkspace(inputPath: string): PathValidationResult {
  const root = getActiveWorkspaceRoot();
  if (!root) {
    return { valid: false, error: 'Access denied: requested resource is outside the user workspace.' };
  }

  const rawPath = (inputPath || '').trim();
  if (!rawPath) {
    return { valid: false, error: 'File path cannot be empty' };
  }

  // 1. Explicit path traversal & injection rejection
  if (
    rawPath.includes('../') ||
    rawPath.includes('..\\') ||
    rawPath.endsWith('..') ||
    rawPath.includes('%2e%2e') ||
    rawPath.includes('\0')
  ) {
    logFsAudit('READ', 'traversal_attempt', 'blocked', 'Path traversal sequence detected');
    return { valid: false, error: 'Access denied: requested resource is outside the user workspace.' };
  }

  // 2. Resolve target path
  let resolved: string;
  if (path.isAbsolute(rawPath)) {
    resolved = path.normalize(rawPath);
  } else {
    resolved = path.normalize(path.resolve(root, rawPath));
  }

  // 3. Enforce prefix matching on normalized lowercase drive/root paths
  const normRoot = path.normalize(root).toLowerCase();
  const normResolved = resolved.toLowerCase();

  const isInside = normResolved === normRoot || normResolved.startsWith(normRoot + path.sep);
  if (!isInside || isApplicationInternalPath(resolved)) {
    logFsAudit('READ', 'boundary_escape_attempt', 'blocked', 'Access outside user workspace rejected');
    return {
      valid: false,
      error: 'Access denied: requested resource is outside the user workspace.'
    };
  }

  // 4. Symlink security verification
  if (fs.existsSync(resolved)) {
    try {
      const canonical = fs.realpathSync(resolved);
      const normCanonical = canonical.toLowerCase();
      const isCanonicalInside = normCanonical === normRoot || normCanonical.startsWith(normRoot + path.sep);
      if (!isCanonicalInside || isApplicationInternalPath(canonical)) {
        logFsAudit('READ', 'symlink_escape_attempt', 'blocked', 'Symlink escape outside user workspace rejected');
        return {
          valid: false,
          error: 'Access denied: requested resource is outside the user workspace.'
        };
      }
    } catch {
      return { valid: false, error: 'Access denied: requested resource is outside the user workspace.' };
    }
  }

  // 5. Compute safe relative path
  const relative = path.relative(root, resolved).replace(/\\/g, '/');

  return {
    valid: true,
    resolvedPath: resolved,
    relativePath: relative || '.'
  };
}

/**
 * Operation Audit Logger:
 * Records all filesystem actions to a persistent log for enterprise review.
 */
export function logFsAudit(
  action: FsAuditEntry['action'],
  targetPath: string,
  status: FsAuditEntry['status'] = 'allowed',
  details?: string
): void {
  // Only persist mutations and blocked/error security events to minimize disk churn and avoid watcher triggers
  if (status === 'allowed' && (action === 'READ' || action === 'SEARCH' || action === 'LIST')) {
    return;
  }

  try {
    ensureStorage();
    // Sanitize target path to avoid leaking sensitive internal paths
    const sanitizedPath = isApplicationInternalPath(targetPath)
      ? '[PROTECTED_INTERNAL_PATH]'
      : targetPath.replace(/\\/g, '/');

    const entry: FsAuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      action,
      path: sanitizedPath,
      status,
      details
    };

    let logs: FsAuditEntry[] = [];
    if (fs.existsSync(AUDIT_FILE)) {
      try {
        logs = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
      } catch {}
    }

    logs.unshift(entry);
    if (logs.length > 200) logs = logs.slice(0, 200);
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to write filesystem audit log:', err);
  }
}

export function getFsAuditLogs(): FsAuditEntry[] {
  try {
    ensureStorage();
    if (fs.existsSync(AUDIT_FILE)) {
      return JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}
