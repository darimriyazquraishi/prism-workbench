import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { s as validatePathWithinWorkspace } from "./workspaceSecurity_CNHgb3cP.mjs";
import path from "path";
import fs from "fs";
//#region src/pages/api/workspace/raw.ts
var raw_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var MIME_MAP = {
	pdf: "application/pdf",
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	webp: "image/webp",
	gif: "image/gif",
	svg: "image/svg+xml",
	txt: "text/plain; charset=utf-8",
	md: "text/markdown; charset=utf-8",
	csv: "text/csv; charset=utf-8",
	json: "application/json; charset=utf-8",
	docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
};
var GET = async ({ url }) => {
	const targetPath = url.searchParams.get("path");
	if (!targetPath) return new Response("Path required", { status: 400 });
	const normPath = targetPath.replace(/\\/g, "/").replace(/^\/+/, "");
	const filename = path.basename(normPath);
	if (normPath.includes("generated_images/") || normPath.includes("workspace/")) {
		const cwd = process.cwd();
		const candPaths = [
			path.resolve(cwd, normPath),
			path.resolve(cwd, "workspace", "generated_images", filename),
			path.resolve(cwd, "LUMI_Desktop", normPath),
			path.resolve(cwd, "LUMI_Desktop", "workspace", "generated_images", filename),
			path.resolve(path.dirname(cwd), normPath),
			path.resolve(path.dirname(cwd), "workspace", "generated_images", filename),
			path.resolve(path.dirname(cwd), "LUMI_Desktop", normPath),
			path.resolve(path.dirname(cwd), "LUMI_Desktop", "workspace", "generated_images", filename),
			path.resolve(cwd, "workspaces", "user_workspace", normPath),
			path.resolve(path.dirname(cwd), "workspaces", "user_workspace", normPath)
		];
		for (const cand of candPaths) if (fs.existsSync(cand) && !fs.statSync(cand).isDirectory()) {
			const contentType = MIME_MAP[path.extname(cand).toLowerCase().replace(".", "")] || "image/png";
			const fileBuffer = fs.readFileSync(cand);
			return new Response(fileBuffer, {
				status: 200,
				headers: {
					"Content-Type": contentType,
					"Content-Disposition": `inline; filename="${path.basename(cand)}"`,
					"Cache-Control": "no-cache, no-store, must-revalidate",
					"X-Content-Type-Options": "nosniff"
				}
			});
		}
	}
	const validation = validatePathWithinWorkspace(targetPath);
	if (!validation.valid || !validation.resolvedPath) return new Response(validation.error || "Access denied: requested resource is outside the user workspace.", {
		status: 403,
		headers: { "Content-Type": "text/plain" }
	});
	const resolved = validation.resolvedPath;
	if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) return new Response("File not found", { status: 404 });
	const contentType = MIME_MAP[path.extname(resolved).toLowerCase().replace(".", "")] || "application/octet-stream";
	const fileBuffer = fs.readFileSync(resolved);
	return new Response(fileBuffer, {
		status: 200,
		headers: {
			"Content-Type": contentType,
			"Content-Disposition": `inline; filename="${path.basename(resolved)}"`,
			"Cache-Control": "no-cache, no-store, must-revalidate",
			"X-Content-Type-Options": "nosniff"
		}
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/workspace/raw@_@ts
var page = () => raw_exports;
//#endregion
export { page };
