import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { i as getRecentWorkspaces, n as getActiveWorkspaceRoot, o as setActiveWorkspaceRoot, t as getActiveWorkspaceName } from "./workspaceSecurity_CNHgb3cP.mjs";
import path from "path";
import fs from "fs";
//#region src/pages/api/workspace/open.ts
var open_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST,
	prerender: () => false
});
var GET = async () => {
	try {
		const root = getActiveWorkspaceRoot();
		const name = getActiveWorkspaceName();
		const isGit = fs.existsSync(path.join(root, ".git"));
		const recents = getRecentWorkspaces();
		return new Response(JSON.stringify({
			success: true,
			activeWorkspace: {
				root: root.replace(/\\/g, "/"),
				name,
				isGitRepo: isGit
			},
			recentWorkspaces: recents
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
			error: err?.message || "Failed to retrieve workspace status"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
var POST = async ({ request }) => {
	try {
		const body = await request.json().catch(() => ({}));
		const targetPath = body.path || body.workspacePath;
		if (!targetPath) return new Response(JSON.stringify({
			success: false,
			error: "Path is required to open a workspace"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const result = setActiveWorkspaceRoot(targetPath);
		if (!result.success) return new Response(JSON.stringify({
			success: false,
			error: result.error || "Failed to open directory"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const recents = getRecentWorkspaces();
		return new Response(JSON.stringify({
			success: true,
			activeWorkspace: {
				root: result.path,
				name: result.name,
				isGitRepo: fs.existsSync(path.join(path.resolve(targetPath), ".git"))
			},
			recentWorkspaces: recents
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			success: false,
			error: err?.message || "Failed to set workspace"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/workspace/open@_@ts
var page = () => open_exports;
//#endregion
export { page };
