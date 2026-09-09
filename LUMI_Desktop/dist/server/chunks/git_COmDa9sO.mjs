import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { n as getActiveWorkspaceRoot } from "./workspaceSecurity_CNHgb3cP.mjs";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
//#region src/pages/api/workspace/git.ts
var git_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var execAsync = promisify(exec);
var GET = async () => {
	try {
		const root = getActiveWorkspaceRoot();
		const gitDir = path.join(root, ".git");
		if (!fs.existsSync(gitDir)) return new Response(JSON.stringify({
			success: true,
			isGitRepo: false,
			message: "Active workspace is not a Git repository"
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
		let branch = "unknown";
		try {
			const { stdout } = await execAsync("git branch --show-current", {
				cwd: root,
				timeout: 3e3
			});
			branch = stdout.trim() || "main";
		} catch {}
		let modifiedFiles = [];
		let untrackedFiles = [];
		try {
			const { stdout } = await execAsync("git status --porcelain", {
				cwd: root,
				timeout: 3e3
			});
			const lines = stdout.split("\n").filter(Boolean);
			for (const line of lines) {
				const status = line.slice(0, 2);
				const fileName = line.slice(3).trim();
				if (status.includes("?")) untrackedFiles.push(fileName);
				else modifiedFiles.push(fileName);
			}
		} catch {}
		return new Response(JSON.stringify({
			success: true,
			isGitRepo: true,
			branch,
			modifiedFiles,
			untrackedFiles,
			dirtyCount: modifiedFiles.length + untrackedFiles.length,
			isClean: modifiedFiles.length === 0 && untrackedFiles.length === 0
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			success: false,
			error: err?.message || "Git inspection error"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/workspace/git@_@ts
var page = () => git_exports;
//#endregion
export { page };
