import path from "path";
import fs from "fs";
//#region src/services/workspace/workspaceSecurity.ts
var APPLICATION_ROOT = path.resolve(process.cwd());
var USER_WORKSPACES_BASE = path.resolve(APPLICATION_ROOT, "workspaces");
var DEFAULT_USER_WORKSPACE = path.resolve(USER_WORKSPACES_BASE, "user_workspace");
var STORAGE_DIR = path.resolve(APPLICATION_ROOT, "sovereign-ai-workbench", "data");
var STATE_FILE = path.join(STORAGE_DIR, "workspace_state.json");
var AUDIT_FILE = path.join(STORAGE_DIR, "workspace_audit.json");
var FORBIDDEN_INTERNAL_DIRS = /* @__PURE__ */ new Set([
	"src",
	"frontend",
	"backend",
	"services",
	"components",
	"types",
	"node_modules",
	".git",
	".astro",
	"dist",
	".gemini",
	"sovereign-ai-workbench",
	"public",
	".vscode",
	".idea",
	".agents"
]);
var FORBIDDEN_INTERNAL_FILES = /* @__PURE__ */ new Set([
	"package.json",
	"package-lock.json",
	"tsconfig.json",
	"astro.config.mjs",
	"tailwind.config.mjs",
	"AGENTS.md",
	"README.md",
	".env",
	".gitignore"
]);
function ensureStorage() {
	try {
		if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });
	} catch (err) {
		console.error("Error creating workspace storage directory:", err);
	}
}
/**
* Initializes the default user workspace directory structure if not already present:
* workspaces/user_workspace/
*   ├── Documents/
*   ├── Projects/
*   └── Uploads/
*/
function ensureUserWorkspaceStructure(wsRoot = DEFAULT_USER_WORKSPACE) {
	try {
		if (!fs.existsSync(wsRoot)) fs.mkdirSync(wsRoot, { recursive: true });
		for (const sub of [
			"Documents",
			"Projects",
			"Uploads"
		]) {
			const p = path.join(wsRoot, sub);
			if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
		}
	} catch (err) {
		console.error("Error initializing user workspace structure:", err);
	}
}
/**
* Strict check to determine if a path belongs to LUMI's application source code,
* configuration, dependencies, runtime files, or internal storage.
* ANY path matching application internals is strictly blocked from the User Workspace.
*/
function isApplicationInternalPath(targetPath) {
	try {
		if (!targetPath) return true;
		const resolved = path.resolve(targetPath);
		const normResolved = resolved.toLowerCase();
		const normAppRoot = APPLICATION_ROOT.toLowerCase();
		const normWorkspacesBase = USER_WORKSPACES_BASE.toLowerCase();
		if (normResolved === normAppRoot) return true;
		if (normResolved.startsWith(normAppRoot + path.sep)) {
			if (!normResolved.startsWith(normWorkspacesBase + path.sep) && normResolved !== normWorkspacesBase) return true;
		}
		const relToApp = path.relative(APPLICATION_ROOT, resolved);
		if (!relToApp.startsWith("..") && !path.isAbsolute(relToApp)) {
			const firstSeg = relToApp.split(path.sep)[0]?.toLowerCase();
			if (FORBIDDEN_INTERNAL_DIRS.has(firstSeg)) return true;
			const fileName = path.basename(resolved).toLowerCase();
			if (FORBIDDEN_INTERNAL_FILES.has(fileName) || fileName.startsWith(".env")) return true;
		}
		if (fs.existsSync(resolved)) {
			const normReal = fs.realpathSync(resolved).toLowerCase();
			if (normReal === normAppRoot) return true;
			if (normReal.startsWith(normAppRoot + path.sep) && !normReal.startsWith(normWorkspacesBase + path.sep) && normReal !== normWorkspacesBase) return true;
		}
		return false;
	} catch {
		return true;
	}
}
ensureUserWorkspaceStructure();
var currentWorkspaceRoot = DEFAULT_USER_WORKSPACE;
try {
	ensureStorage();
	if (fs.existsSync(STATE_FILE)) {
		const raw = fs.readFileSync(STATE_FILE, "utf-8");
		const parsed = JSON.parse(raw);
		if (parsed.activeWorkspace && fs.existsSync(parsed.activeWorkspace)) {
			const resolved = path.resolve(parsed.activeWorkspace);
			if (!isApplicationInternalPath(resolved)) currentWorkspaceRoot = resolved;
			else fs.writeFileSync(STATE_FILE, JSON.stringify({
				activeWorkspace: DEFAULT_USER_WORKSPACE,
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			}, null, 2), "utf-8");
		}
	}
} catch (err) {
	console.warn("Could not read workspace state file, defaulting to user workspace:", err);
}
function getActiveWorkspaceRoot() {
	return path.resolve(currentWorkspaceRoot);
}
function getActiveWorkspaceName() {
	return path.basename(getActiveWorkspaceRoot());
}
function setActiveWorkspaceRoot(targetPath) {
	try {
		const resolved = path.resolve(targetPath);
		if (!fs.existsSync(resolved)) return {
			success: false,
			path: "",
			name: "",
			error: "Access denied: requested resource is outside the user workspace."
		};
		if (!fs.statSync(resolved).isDirectory()) return {
			success: false,
			path: "",
			name: "",
			error: "Access denied: requested resource is outside the user workspace."
		};
		if (isApplicationInternalPath(resolved)) {
			logFsAudit("LIST", "protected_app_directory", "blocked", "Attempted to open application internal path as workspace");
			return {
				success: false,
				path: "",
				name: "",
				error: "Access denied: requested resource is outside the user workspace."
			};
		}
		currentWorkspaceRoot = resolved;
		ensureUserWorkspaceStructure(resolved);
		addToRecentWorkspaces(resolved);
		ensureStorage();
		const state = {
			activeWorkspace: resolved,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
		logFsAudit("LIST", resolved, "allowed", "Active workspace switched to user workspace");
		return {
			success: true,
			path: resolved.replace(/\\/g, "/"),
			name: path.basename(resolved)
		};
	} catch {
		return {
			success: false,
			path: "",
			name: "",
			error: "Access denied: requested resource is outside the user workspace."
		};
	}
}
function getRecentWorkspaces() {
	try {
		ensureStorage();
		const recentFile = path.join(STORAGE_DIR, "recent_workspaces.json");
		if (fs.existsSync(recentFile)) {
			const raw = fs.readFileSync(recentFile, "utf-8");
			const safeItems = JSON.parse(raw).filter((item) => fs.existsSync(item.path) && !isApplicationInternalPath(item.path));
			if (safeItems.length > 0) return safeItems;
		}
	} catch (err) {
		console.warn("Failed to load recent workspaces:", err);
	}
	return [{
		name: path.basename(DEFAULT_USER_WORKSPACE),
		path: DEFAULT_USER_WORKSPACE.replace(/\\/g, "/"),
		lastOpened: (/* @__PURE__ */ new Date()).toISOString(),
		isGitRepo: false
	}];
}
function addToRecentWorkspaces(wsPath) {
	try {
		if (isApplicationInternalPath(wsPath)) return;
		ensureStorage();
		const recentFile = path.join(STORAGE_DIR, "recent_workspaces.json");
		let items = [];
		if (fs.existsSync(recentFile)) try {
			items = JSON.parse(fs.readFileSync(recentFile, "utf-8"));
		} catch {}
		items = items.filter((i) => !isApplicationInternalPath(i.path));
		const normalized = path.resolve(wsPath).replace(/\\/g, "/");
		items = items.filter((i) => path.resolve(i.path) !== path.resolve(wsPath));
		items.unshift({
			name: path.basename(wsPath),
			path: normalized,
			lastOpened: (/* @__PURE__ */ new Date()).toISOString(),
			isGitRepo: fs.existsSync(path.join(wsPath, ".git"))
		});
		items = items.slice(0, 12);
		fs.writeFileSync(recentFile, JSON.stringify(items, null, 2), "utf-8");
	} catch (err) {
		console.warn("Failed to update recent workspaces list:", err);
	}
}
function validatePathWithinWorkspace(inputPath) {
	const root = getActiveWorkspaceRoot();
	if (!root) return {
		valid: false,
		error: "Access denied: requested resource is outside the user workspace."
	};
	const rawPath = (inputPath || "").trim();
	if (!rawPath) return {
		valid: false,
		error: "File path cannot be empty"
	};
	if (rawPath.includes("../") || rawPath.includes("..\\") || rawPath.endsWith("..") || rawPath.includes("%2e%2e") || rawPath.includes("\0")) {
		logFsAudit("READ", "traversal_attempt", "blocked", "Path traversal sequence detected");
		return {
			valid: false,
			error: "Access denied: requested resource is outside the user workspace."
		};
	}
	let resolved;
	if (path.isAbsolute(rawPath)) resolved = path.normalize(rawPath);
	else resolved = path.normalize(path.resolve(root, rawPath));
	const normRoot = path.normalize(root).toLowerCase();
	const normResolved = resolved.toLowerCase();
	if (!(normResolved === normRoot || normResolved.startsWith(normRoot + path.sep)) || isApplicationInternalPath(resolved)) {
		logFsAudit("READ", "boundary_escape_attempt", "blocked", "Access outside user workspace rejected");
		return {
			valid: false,
			error: "Access denied: requested resource is outside the user workspace."
		};
	}
	if (fs.existsSync(resolved)) try {
		const canonical = fs.realpathSync(resolved);
		const normCanonical = canonical.toLowerCase();
		if (!(normCanonical === normRoot || normCanonical.startsWith(normRoot + path.sep)) || isApplicationInternalPath(canonical)) {
			logFsAudit("READ", "symlink_escape_attempt", "blocked", "Symlink escape outside user workspace rejected");
			return {
				valid: false,
				error: "Access denied: requested resource is outside the user workspace."
			};
		}
	} catch {
		return {
			valid: false,
			error: "Access denied: requested resource is outside the user workspace."
		};
	}
	const relative = path.relative(root, resolved).replace(/\\/g, "/");
	return {
		valid: true,
		resolvedPath: resolved,
		relativePath: relative || "."
	};
}
/**
* Operation Audit Logger:
* Records all filesystem actions to a persistent log for enterprise review.
*/
function logFsAudit(action, targetPath, status = "allowed", details) {
	if (status === "allowed" && (action === "READ" || action === "SEARCH" || action === "LIST")) return;
	try {
		ensureStorage();
		const sanitizedPath = isApplicationInternalPath(targetPath) ? "[PROTECTED_INTERNAL_PATH]" : targetPath.replace(/\\/g, "/");
		const entry = {
			id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
			timestamp: (/* @__PURE__ */ new Date()).toISOString(),
			action,
			path: sanitizedPath,
			status,
			details
		};
		let logs = [];
		if (fs.existsSync(AUDIT_FILE)) try {
			logs = JSON.parse(fs.readFileSync(AUDIT_FILE, "utf-8"));
		} catch {}
		logs.unshift(entry);
		if (logs.length > 200) logs = logs.slice(0, 200);
		fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), "utf-8");
	} catch (err) {
		console.warn("Failed to write filesystem audit log:", err);
	}
}
function getFsAuditLogs() {
	try {
		ensureStorage();
		if (fs.existsSync(AUDIT_FILE)) return JSON.parse(fs.readFileSync(AUDIT_FILE, "utf-8"));
	} catch {}
	return [];
}
//#endregion
export { logFsAudit as a, getRecentWorkspaces as i, getActiveWorkspaceRoot as n, setActiveWorkspaceRoot as o, getFsAuditLogs as r, validatePathWithinWorkspace as s, getActiveWorkspaceName as t };
