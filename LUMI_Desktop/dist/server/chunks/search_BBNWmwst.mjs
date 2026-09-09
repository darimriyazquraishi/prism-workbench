import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { a as logFsAudit, n as getActiveWorkspaceRoot, s as validatePathWithinWorkspace } from "./workspaceSecurity_aeVCuJR8.mjs";
import path from "path";
import fs from "fs";
//#region src/pages/api/workspace/search.ts
var search_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var IGNORE_DIRS = /* @__PURE__ */ new Set([
	"node_modules",
	".git",
	".astro",
	"dist",
	".gemini",
	"build"
]);
function searchInDir(dir, root, query, matches, maxMatches = 100) {
	if (matches.length >= maxMatches) return;
	try {
		const entries = fs.readdirSync(dir, { withFileTypes: true });
		for (const entry of entries) {
			if (IGNORE_DIRS.has(entry.name)) continue;
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) searchInDir(fullPath, root, query, matches, maxMatches);
			else if (entry.isFile()) try {
				if (fs.statSync(fullPath).size > 1048576) continue;
				const ext = path.extname(entry.name).toLowerCase();
				if ([
					".png",
					".jpg",
					".jpeg",
					".zip",
					".pdf",
					".docx",
					".pptx",
					".xlsx",
					".ico"
				].includes(ext)) continue;
				const lines = fs.readFileSync(fullPath, "utf-8").split("\n");
				const relPath = path.relative(root, fullPath).replace(/\\/g, "/");
				const queryLower = query.toLowerCase();
				for (let i = 0; i < lines.length; i++) {
					if (matches.length >= maxMatches) break;
					const line = lines[i];
					if (line.toLowerCase().includes(queryLower)) matches.push({
						path: relPath,
						lineNumber: i + 1,
						lineContent: line.trim()
					});
				}
			} catch {}
		}
	} catch {}
}
var POST = async ({ request }) => {
	try {
		const body = await request.json().catch(() => ({}));
		const query = body.query || body.q;
		const subPath = body.path || ".";
		if (!query || typeof query !== "string") return new Response(JSON.stringify({
			success: false,
			error: "Query parameter is required"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const val = validatePathWithinWorkspace(subPath);
		if (!val.valid || !val.resolvedPath) return new Response(JSON.stringify({
			success: false,
			error: val.error
		}), {
			status: 403,
			headers: { "Content-Type": "application/json" }
		});
		const root = getActiveWorkspaceRoot();
		const searchRoot = val.resolvedPath;
		const matches = [];
		searchInDir(searchRoot, root, query, matches);
		logFsAudit("SEARCH", query, "allowed", `Found ${matches.length} matches`);
		return new Response(JSON.stringify({
			success: true,
			query,
			count: matches.length,
			matches
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			success: false,
			error: err?.message || "Search error"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/workspace/search@_@ts
var page = () => search_exports;
//#endregion
export { page };
