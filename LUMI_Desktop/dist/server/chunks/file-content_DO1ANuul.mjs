import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { s as validatePathWithinWorkspace } from "./workspaceSecurity_aeVCuJR8.mjs";
import path from "path";
import fs from "fs";
//#region src/pages/api/system/file-content.ts
var file_content_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var BINARY_EXTENSIONS = /* @__PURE__ */ new Set([
	"docx",
	"pptx",
	"xlsx",
	"pdf",
	"png",
	"jpg",
	"jpeg",
	"gif",
	"webp",
	"ico",
	"zip",
	"tar",
	"gz",
	"mp4",
	"webm",
	"mp3",
	"wav",
	"exe",
	"bin",
	"dll",
	"so"
]);
var GET = async ({ url }) => {
	try {
		const filePathParam = url.searchParams.get("path");
		if (!filePathParam) return new Response(JSON.stringify({
			success: false,
			error: "Missing path parameter"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const val = validatePathWithinWorkspace(filePathParam);
		if (!val.valid) return new Response(JSON.stringify({
			success: false,
			error: "Access denied: requested resource is outside the user workspace."
		}), {
			status: 403,
			headers: { "Content-Type": "application/json" }
		});
		const resolvedPath = val.resolvedPath;
		if (!fs.existsSync(resolvedPath)) return new Response(JSON.stringify({
			success: false,
			error: "File not found"
		}), {
			status: 404,
			headers: { "Content-Type": "application/json" }
		});
		const stat = fs.statSync(resolvedPath);
		if (stat.isDirectory()) return new Response(JSON.stringify({
			success: false,
			error: "Path is a directory"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const fileName = path.basename(resolvedPath);
		const ext = path.extname(fileName).toLowerCase().replace(".", "");
		if (BINARY_EXTENSIONS.has(ext)) return new Response(JSON.stringify({
			success: true,
			file: {
				name: fileName,
				path: filePathParam.replace(/\\/g, "/"),
				size: stat.size,
				extension: ext,
				isBinary: true,
				content: null
			}
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
		if (stat.size > 2097152) {
			const fd = fs.openSync(resolvedPath, "r");
			const buffer = Buffer.alloc(512e3);
			fs.readSync(fd, buffer, 0, buffer.length, 0);
			fs.closeSync(fd);
			const content = buffer.toString("utf-8") + "\n\n... [File truncated: showing first 500KB of " + (stat.size / 1024).toFixed(1) + " KB]";
			return new Response(JSON.stringify({
				success: true,
				file: {
					name: fileName,
					path: filePathParam.replace(/\\/g, "/"),
					size: stat.size,
					extension: ext,
					isBinary: false,
					content
				}
			}), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
		}
		const content = fs.readFileSync(resolvedPath, "utf-8");
		return new Response(JSON.stringify({
			success: true,
			file: {
				name: fileName,
				path: filePathParam.replace(/\\/g, "/"),
				size: stat.size,
				extension: ext,
				isBinary: false,
				content
			}
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			success: false,
			error: err?.message || "Failed to read file content"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/system/file-content@_@ts
var page = () => file_content_exports;
//#endregion
export { page };
