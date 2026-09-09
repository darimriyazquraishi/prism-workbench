import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { a as logFsAudit, s as validatePathWithinWorkspace } from "./workspaceSecurity_CNHgb3cP.mjs";
import path from "path";
import fs from "fs";
//#region src/pages/api/workspace/rename.ts
var rename_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = async ({ request }) => {
	try {
		const body = await request.json().catch(() => ({}));
		const oldPath = body.oldPath || body.source;
		const newPath = body.newPath || body.destination;
		if (!oldPath || !newPath) return new Response(JSON.stringify({
			success: false,
			error: "Both oldPath/source and newPath/destination parameters are required"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const valSource = validatePathWithinWorkspace(oldPath);
		if (!valSource.valid || !valSource.resolvedPath) return new Response(JSON.stringify({
			success: false,
			error: `Source invalid: ${valSource.error}`
		}), {
			status: 403,
			headers: { "Content-Type": "application/json" }
		});
		const valDest = validatePathWithinWorkspace(newPath);
		if (!valDest.valid || !valDest.resolvedPath) return new Response(JSON.stringify({
			success: false,
			error: `Destination invalid: ${valDest.error}`
		}), {
			status: 403,
			headers: { "Content-Type": "application/json" }
		});
		const src = valSource.resolvedPath;
		const dest = valDest.resolvedPath;
		if (!fs.existsSync(src)) return new Response(JSON.stringify({
			success: false,
			error: `Source does not exist: ${valSource.relativePath}`
		}), {
			status: 404,
			headers: { "Content-Type": "application/json" }
		});
		const destParent = path.dirname(dest);
		if (!fs.existsSync(destParent)) fs.mkdirSync(destParent, { recursive: true });
		fs.renameSync(src, dest);
		logFsAudit("RENAME", `${valSource.relativePath} -> ${valDest.relativePath}`, "allowed");
		return new Response(JSON.stringify({
			success: true,
			message: `Renamed ${valSource.relativePath} to ${valDest.relativePath}`,
			oldPath: valSource.relativePath,
			newPath: valDest.relativePath
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			success: false,
			error: err?.message || "Rename error"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/workspace/rename@_@ts
var page = () => rename_exports;
//#endregion
export { page };
