import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { a as logFsAudit, n as getActiveWorkspaceRoot, r as getFsAuditLogs, s as validatePathWithinWorkspace, t as getActiveWorkspaceName } from "./workspaceSecurity_CNHgb3cP.mjs";
import path from "path";
import fs from "fs";
//#region src/services/workspace/aiToolController.ts
var sessionChanges = [];
function getSessionChanges() {
	return [...sessionChanges];
}
function clearSessionChanges() {
	sessionChanges = [];
}
function recordSessionChange(pathStr, action, diff) {
	sessionChanges.unshift({
		id: `chg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
		timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
		path: pathStr.replace(/\\/g, "/"),
		action,
		diff
	});
	if (sessionChanges.length > 50) sessionChanges = sessionChanges.slice(0, 50);
}
/**
* AI Tool Controller:
* Dispatches the 11 filesystem tools with permission verification and path jail enforcement.
*/
async function executeAiFilesystemTool(request) {
	const { tool, args = {}, permissionMode = "assisted", approved = false } = request;
	const root = getActiveWorkspaceRoot();
	if (tool === "get_workspace_tree") try {
		const items = fs.readdirSync(root, { withFileTypes: true }).filter((e) => ![
			"node_modules",
			".git",
			".astro",
			"dist"
		].includes(e.name)).map((e) => ({
			name: e.name,
			isDirectory: e.isDirectory()
		}));
		return {
			success: true,
			tool,
			output: {
				workspaceName: getActiveWorkspaceName(),
				rootPath: root,
				items
			}
		};
	} catch (err) {
		return {
			success: false,
			tool,
			error: err.message
		};
	}
	if (tool === "list_directory") {
		const targetDir = args.path || ".";
		const val = validatePathWithinWorkspace(targetDir);
		if (!val.valid || !val.resolvedPath) return {
			success: false,
			tool,
			error: val.error
		};
		try {
			if (!fs.existsSync(val.resolvedPath)) return {
				success: false,
				tool,
				error: `Directory not found: ${val.relativePath}`
			};
			const items = fs.readdirSync(val.resolvedPath, { withFileTypes: true }).map((e) => ({
				name: e.name,
				path: path.join(val.relativePath || ".", e.name).replace(/\\/g, "/"),
				isDirectory: e.isDirectory()
			}));
			logFsAudit("LIST", val.resolvedPath, "allowed");
			return {
				success: true,
				tool,
				output: {
					path: val.relativePath,
					items,
					count: items.length
				}
			};
		} catch (err) {
			return {
				success: false,
				tool,
				error: err.message
			};
		}
	}
	if (tool === "read_file") {
		const targetPath = args.path;
		const val = validatePathWithinWorkspace(targetPath);
		if (!val.valid) return {
			success: false,
			tool,
			error: val.error
		};
		try {
			if (!fs.existsSync(val.resolvedPath)) return {
				success: false,
				tool,
				error: `File not found: ${val.relativePath}`
			};
			const stat = fs.statSync(val.resolvedPath);
			if (stat.isDirectory()) return {
				success: false,
				tool,
				error: `Path is a directory: ${val.relativePath}`
			};
			const content = fs.readFileSync(val.resolvedPath, "utf-8");
			logFsAudit("READ", val.resolvedPath, "allowed");
			return {
				success: true,
				tool,
				output: {
					path: val.relativePath,
					size: stat.size,
					content
				}
			};
		} catch (err) {
			return {
				success: false,
				tool,
				error: err.message
			};
		}
	}
	if (tool === "search_files") {
		const query = args.query;
		const subPath = args.path || ".";
		const val = validatePathWithinWorkspace(subPath);
		if (!val.valid) return {
			success: false,
			tool,
			error: val.error
		};
		try {
			const matches = [];
			const searchRecursive = (dir) => {
				if (matches.length >= 50) return;
				const entries = fs.readdirSync(dir, { withFileTypes: true });
				for (const e of entries) {
					if ([
						"node_modules",
						".git",
						".astro",
						"dist"
					].includes(e.name)) continue;
					const full = path.join(dir, e.name);
					if (e.isDirectory()) searchRecursive(full);
					else if (e.isFile()) try {
						const lines = fs.readFileSync(full, "utf-8").split("\n");
						const rel = path.relative(root, full).replace(/\\/g, "/");
						lines.forEach((l, idx) => {
							if (matches.length < 50 && l.toLowerCase().includes(query.toLowerCase())) matches.push({
								path: rel,
								line: idx + 1,
								text: l.trim()
							});
						});
					} catch {}
				}
			};
			searchRecursive(val.resolvedPath);
			logFsAudit("SEARCH", query, "allowed", `Found ${matches.length} matches`);
			return {
				success: true,
				tool,
				output: {
					query,
					count: matches.length,
					matches
				}
			};
		} catch (err) {
			return {
				success: false,
				tool,
				error: err.message
			};
		}
	}
	if (tool === "get_file_info") {
		const val = validatePathWithinWorkspace(args.path);
		if (!val.valid) return {
			success: false,
			tool,
			error: val.error
		};
		try {
			if (!fs.existsSync(val.resolvedPath)) return {
				success: false,
				tool,
				error: `File not found: ${val.relativePath}`
			};
			const stat = fs.statSync(val.resolvedPath);
			return {
				success: true,
				tool,
				output: {
					path: val.relativePath,
					size: stat.size,
					isDirectory: stat.isDirectory(),
					modifiedAt: stat.mtime.toISOString(),
					extension: path.extname(val.resolvedPath).replace(".", "")
				}
			};
		} catch (err) {
			return {
				success: false,
				tool,
				error: err.message
			};
		}
	}
	if (permissionMode === "safe" && !approved) return {
		success: false,
		tool,
		requiresApproval: true,
		error: `Action "${tool}" requires user confirmation in Safe Mode`,
		proposedChanges: {
			path: args.path || args.oldPath || "unknown",
			action: tool === "delete_file" ? "delete" : tool === "create_file" ? "create" : "modify",
			newContent: args.content
		}
	};
	if (tool === "create_file") {
		const val = validatePathWithinWorkspace(args.path);
		if (!val.valid) return {
			success: false,
			tool,
			error: val.error
		};
		const filePath = val.resolvedPath;
		const content = args.content || "";
		if (permissionMode === "assisted" && fs.existsSync(filePath) && !approved) return {
			success: false,
			tool,
			requiresApproval: true,
			error: `File ${val.relativePath} already exists. Overwrite requires confirmation.`,
			proposedChanges: {
				path: val.relativePath,
				action: "modify",
				newContent: content
			}
		};
		try {
			const parent = path.dirname(filePath);
			if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
			fs.writeFileSync(filePath, content, "utf-8");
			logFsAudit("CREATE", filePath, "allowed", `Created file ${val.relativePath}`);
			recordSessionChange(val.relativePath, "create");
			return {
				success: true,
				tool,
				output: {
					path: val.relativePath,
					size: Buffer.byteLength(content),
					status: "created"
				}
			};
		} catch (err) {
			return {
				success: false,
				tool,
				error: err.message
			};
		}
	}
	if (tool === "create_directory") {
		const val = validatePathWithinWorkspace(args.path);
		if (!val.valid) return {
			success: false,
			tool,
			error: val.error
		};
		try {
			fs.mkdirSync(val.resolvedPath, { recursive: true });
			logFsAudit("CREATE", val.resolvedPath, "allowed", `Created directory ${val.relativePath}`);
			recordSessionChange(val.relativePath, "create");
			return {
				success: true,
				tool,
				output: {
					path: val.relativePath,
					status: "created"
				}
			};
		} catch (err) {
			return {
				success: false,
				tool,
				error: err.message
			};
		}
	}
	if (tool === "write_file") {
		const val = validatePathWithinWorkspace(args.path);
		if (!val.valid) return {
			success: false,
			tool,
			error: val.error
		};
		const filePath = val.resolvedPath;
		const content = args.content ?? "";
		if (permissionMode === "assisted" && fs.existsSync(filePath) && !approved) {
			const oldContent = fs.readFileSync(filePath, "utf-8");
			return {
				success: false,
				tool,
				requiresApproval: true,
				error: `Overwriting ${val.relativePath} requires confirmation in Assisted Mode`,
				proposedChanges: {
					path: val.relativePath,
					action: "modify",
					originalContent: oldContent,
					newContent: content
				}
			};
		}
		try {
			const parent = path.dirname(filePath);
			if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
			fs.writeFileSync(filePath, content, "utf-8");
			logFsAudit("WRITE", filePath, "allowed", `Saved ${Buffer.byteLength(content)} bytes`);
			recordSessionChange(val.relativePath, "modify");
			return {
				success: true,
				tool,
				output: {
					path: val.relativePath,
					size: Buffer.byteLength(content),
					status: "written"
				}
			};
		} catch (err) {
			return {
				success: false,
				tool,
				error: err.message
			};
		}
	}
	if (tool === "edit_file") {
		const val = validatePathWithinWorkspace(args.path);
		if (!val.valid) return {
			success: false,
			tool,
			error: val.error
		};
		const filePath = val.resolvedPath;
		if (!fs.existsSync(filePath)) return {
			success: false,
			tool,
			error: `File not found: ${val.relativePath}`
		};
		try {
			const current = fs.readFileSync(filePath, "utf-8");
			let updated = current;
			if (args.changes?.find !== void 0 && args.changes?.replace !== void 0) updated = current.replace(args.changes.find, args.changes.replace);
			else if (typeof args.newContent === "string") updated = args.newContent;
			else if (typeof args.content === "string") updated = args.content;
			if (permissionMode === "assisted" && !approved) return {
				success: false,
				tool,
				requiresApproval: true,
				error: `Modifying ${val.relativePath} requires user confirmation`,
				proposedChanges: {
					path: val.relativePath,
					action: "modify",
					originalContent: current,
					newContent: updated
				}
			};
			fs.writeFileSync(filePath, updated, "utf-8");
			logFsAudit("EDIT", filePath, "allowed", `Edited ${val.relativePath}`);
			recordSessionChange(val.relativePath, "modify");
			return {
				success: true,
				tool,
				output: {
					path: val.relativePath,
					status: "edited",
					size: Buffer.byteLength(updated)
				}
			};
		} catch (err) {
			return {
				success: false,
				tool,
				error: err.message
			};
		}
	}
	if (tool === "rename_file" || tool === "move_file") {
		const srcVal = validatePathWithinWorkspace(args.oldPath || args.source);
		const destVal = validatePathWithinWorkspace(args.newPath || args.destination);
		if (!srcVal.valid) return {
			success: false,
			tool,
			error: srcVal.error
		};
		if (!destVal.valid) return {
			success: false,
			tool,
			error: destVal.error
		};
		if (!fs.existsSync(srcVal.resolvedPath)) return {
			success: false,
			tool,
			error: `Source does not exist: ${srcVal.relativePath}`
		};
		try {
			const destParent = path.dirname(destVal.resolvedPath);
			if (!fs.existsSync(destParent)) fs.mkdirSync(destParent, { recursive: true });
			fs.renameSync(srcVal.resolvedPath, destVal.resolvedPath);
			logFsAudit("RENAME", `${srcVal.relativePath} -> ${destVal.relativePath}`, "allowed");
			recordSessionChange(destVal.relativePath, "rename");
			return {
				success: true,
				tool,
				output: {
					oldPath: srcVal.relativePath,
					newPath: destVal.relativePath,
					status: "renamed"
				}
			};
		} catch (err) {
			return {
				success: false,
				tool,
				error: err.message
			};
		}
	}
	if (tool === "delete_file") {
		const val = validatePathWithinWorkspace(args.path);
		if (!val.valid) return {
			success: false,
			tool,
			error: val.error
		};
		const filePath = val.resolvedPath;
		if (path.resolve(filePath).toLowerCase() === path.resolve(root).toLowerCase()) return {
			success: false,
			tool,
			error: "Security Violation: Cannot delete active workspace root"
		};
		if (!fs.existsSync(filePath)) return {
			success: false,
			tool,
			error: `File not found: ${val.relativePath}`
		};
		if ((permissionMode === "safe" || permissionMode === "assisted") && !approved) return {
			success: false,
			tool,
			requiresApproval: true,
			error: `Deleting "${val.relativePath}" requires explicit confirmation`,
			proposedChanges: {
				path: val.relativePath,
				action: "delete"
			}
		};
		try {
			if (fs.statSync(filePath).isDirectory()) {
				fs.rmSync(filePath, {
					recursive: true,
					force: true
				});
				logFsAudit("DELETE", filePath, "allowed", "Deleted directory");
			} else {
				fs.unlinkSync(filePath);
				logFsAudit("DELETE", filePath, "allowed", "Deleted file");
			}
			recordSessionChange(val.relativePath, "delete");
			return {
				success: true,
				tool,
				output: {
					path: val.relativePath,
					status: "deleted"
				}
			};
		} catch (err) {
			return {
				success: false,
				tool,
				error: err.message
			};
		}
	}
	return {
		success: false,
		tool,
		error: `Unknown tool "${tool}"`
	};
}
//#endregion
//#region src/pages/api/workspace/tools.ts
var tools_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST,
	prerender: () => false
});
var POST = async ({ request }) => {
	try {
		const body = await request.json().catch(() => ({}));
		const tool = body.tool;
		const args = body.args || {};
		const permissionMode = body.permissionMode || "assisted";
		const approved = !!body.approved;
		if (!tool) return new Response(JSON.stringify({
			success: false,
			error: "Tool name is required"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const result = await executeAiFilesystemTool({
			tool,
			args,
			permissionMode,
			approved
		});
		return new Response(JSON.stringify(result), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			success: false,
			error: err?.message || "Tool execution error"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
var GET = async ({ url }) => {
	try {
		const view = url.searchParams.get("view");
		if (view === "audit") {
			const logs = getFsAuditLogs();
			return new Response(JSON.stringify({
				success: true,
				logs
			}), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
		}
		if (view === "clear") {
			clearSessionChanges();
			return new Response(JSON.stringify({
				success: true,
				message: "Changes cleared"
			}), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
		}
		const changes = getSessionChanges();
		return new Response(JSON.stringify({
			success: true,
			changes
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			success: false,
			error: err?.message || "Error"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/workspace/tools@_@ts
var page = () => tools_exports;
//#endregion
export { page };
