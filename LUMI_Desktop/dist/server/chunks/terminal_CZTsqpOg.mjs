import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { a as logFsAudit, n as getActiveWorkspaceRoot } from "./workspaceSecurity_aeVCuJR8.mjs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
//#region src/pages/api/workspace/terminal.ts
var terminal_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var execAsync = promisify(exec);
var BLOCKED_PATTERNS = [
	/rm\s+-rf\s+\/($|\s)/,
	/format\s+[c-z]:/i,
	/del\s+\/s\s+\/q\s+[c-z]:\\/i,
	/:(){ :|:& };:/,
	/\.\.[/\\]/,
	/\bcd\s+\.\./i
];
var POST = async ({ request }) => {
	try {
		const command = ((await request.json().catch(() => ({}))).command || "").trim();
		if (!command) return new Response(JSON.stringify({
			success: false,
			error: "Command parameter is required"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		for (const pattern of BLOCKED_PATTERNS) if (pattern.test(command)) {
			logFsAudit("COMMAND", "traversal_or_unsafe_command", "blocked", "Blocked command attempting traversal or system destruction");
			return new Response(JSON.stringify({
				success: false,
				error: "Access denied: requested command attempts to navigate outside the user workspace."
			}), {
				status: 403,
				headers: { "Content-Type": "application/json" }
			});
		}
		const root = getActiveWorkspaceRoot();
		logFsAudit("COMMAND", command, "allowed", "Executed in user workspace");
		try {
			const { stdout, stderr } = await execAsync(command, {
				cwd: root,
				timeout: 15e3,
				maxBuffer: 2097152
			});
			return new Response(JSON.stringify({
				success: true,
				command,
				stdout: stdout.toString(),
				stderr: stderr.toString(),
				cwd: path.basename(root)
			}), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
		} catch (cmdErr) {
			return new Response(JSON.stringify({
				success: false,
				command,
				error: cmdErr.message || "Execution error",
				stdout: cmdErr.stdout?.toString() || "",
				stderr: cmdErr.stderr?.toString() || cmdErr.message,
				exitCode: cmdErr.code || 1,
				cwd: root.replace(/\\/g, "/")
			}), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
		}
	} catch (err) {
		return new Response(JSON.stringify({
			success: false,
			error: err?.message || "Terminal error"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/workspace/terminal@_@ts
var page = () => terminal_exports;
//#endregion
export { page };
