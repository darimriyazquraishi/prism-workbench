import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { n as getActiveWorkspaceRoot, s as validatePathWithinWorkspace } from "./workspaceSecurity_aeVCuJR8.mjs";
import path from "path";
import fs from "fs";
//#region src/pages/api/system/workspace-tree.ts
var workspace_tree_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var IGNORED_NAMES = /* @__PURE__ */ new Set([
	"node_modules",
	".git",
	".astro",
	"dist",
	".gemini",
	".vscode",
	".idea",
	"build",
	"coverage",
	".DS_Store"
]);
function buildTree(dirPath, rootDir, depth = 0, maxDepth = 4) {
	if (depth > maxDepth) return [];
	try {
		const entries = fs.readdirSync(dirPath, { withFileTypes: true });
		const nodes = [];
		for (const entry of entries) {
			if (IGNORED_NAMES.has(entry.name)) continue;
			const fullPath = path.join(dirPath, entry.name);
			const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, "/");
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
				const ext = path.extname(entry.name).toLowerCase().replace(".", "");
				nodes.push({
					name: entry.name,
					path: relativePath,
					isDirectory: false,
					size,
					extension: ext
				});
			}
		}
		nodes.sort((a, b) => {
			if (a.isDirectory && !b.isDirectory) return -1;
			if (!a.isDirectory && b.isDirectory) return 1;
			return a.name.localeCompare(b.name, void 0, { sensitivity: "base" });
		});
		return nodes;
	} catch (err) {
		return [];
	}
}
var GET = async ({ url }) => {
	try {
		const workspaceRoot = getActiveWorkspaceRoot();
		const queryPath = url.searchParams.get("dir");
		let targetDir = workspaceRoot;
		if (queryPath) {
			const val = validatePathWithinWorkspace(queryPath);
			if (!val.valid) return new Response(JSON.stringify({
				success: false,
				error: "Access denied: requested resource is outside the user workspace."
			}), {
				status: 403,
				headers: { "Content-Type": "application/json" }
			});
			if (fs.existsSync(val.resolvedPath) && fs.statSync(val.resolvedPath).isDirectory()) targetDir = val.resolvedPath;
		}
		const tree = buildTree(targetDir, targetDir);
		const rootName = path.basename(targetDir);
		return new Response(JSON.stringify({
			success: true,
			rootName,
			rootPath: targetDir.replace(/\\/g, "/"),
			tree
		}), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-cache"
			}
		});
	} catch (err) {
		return new Response(JSON.stringify({
			success: false,
			error: err?.message || "Failed to read workspace tree"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/system/workspace-tree@_@ts
var page = () => workspace_tree_exports;
//#endregion
export { page };
