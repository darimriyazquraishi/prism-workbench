import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { n as getActiveWorkspaceRoot, s as validatePathWithinWorkspace, t as getActiveWorkspaceName } from "./workspaceSecurity_CNHgb3cP.mjs";
import path from "path";
import fs from "fs";
//#region src/pages/api/workspace/tree.ts
var tree_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var DEFAULT_IGNORES = /* @__PURE__ */ new Set([
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
function parseGitignore(root) {
	const ignores = /* @__PURE__ */ new Set();
	try {
		const gitignorePath = path.join(root, ".gitignore");
		if (fs.existsSync(gitignorePath)) fs.readFileSync(gitignorePath, "utf-8").split("\n").forEach((line) => {
			const trimmed = line.trim();
			if (trimmed && !trimmed.startsWith("#")) ignores.add(trimmed.replace(/\/$/, ""));
		});
	} catch {}
	return ignores;
}
function buildTree(dirPath, rootPath, customIgnores, depth = 0, maxDepth = 4) {
	if (depth > maxDepth) return [];
	try {
		const entries = fs.readdirSync(dirPath, { withFileTypes: true });
		const nodes = [];
		for (const entry of entries) {
			if (DEFAULT_IGNORES.has(entry.name) || customIgnores.has(entry.name)) continue;
			const fullPath = path.join(dirPath, entry.name);
			const relativePath = path.relative(rootPath, fullPath).replace(/\\/g, "/");
			let stat = null;
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
				const ext = path.extname(entry.name).toLowerCase().replace(".", "");
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
			return a.name.localeCompare(b.name, void 0, { sensitivity: "base" });
		});
		return nodes;
	} catch (err) {
		return [];
	}
}
var GET = async ({ url }) => {
	try {
		const root = getActiveWorkspaceRoot();
		const rootName = getActiveWorkspaceName();
		const subDirParam = url.searchParams.get("dir");
		let targetDir = root;
		if (subDirParam) {
			const validation = validatePathWithinWorkspace(subDirParam);
			if (!validation.valid || !validation.resolvedPath) return new Response(JSON.stringify({
				success: false,
				error: validation.error || "Access denied"
			}), {
				status: 403,
				headers: { "Content-Type": "application/json" }
			});
			targetDir = validation.resolvedPath;
		}
		const gitIgnores = parseGitignore(root);
		const tree = buildTree(targetDir, root, gitIgnores);
		return new Response(JSON.stringify({
			success: true,
			rootName,
			rootPath: root.replace(/\\/g, "/"),
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
			error: err?.message || "Failed to scan workspace tree"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/workspace/tree@_@ts
var page = () => tree_exports;
//#endregion
export { page };
