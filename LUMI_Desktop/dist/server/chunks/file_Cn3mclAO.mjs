import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { a as logFsAudit, n as getActiveWorkspaceRoot, s as validatePathWithinWorkspace } from "./workspaceSecurity_CNHgb3cP.mjs";
import path from "path";
import fs from "fs";
//#region src/pages/api/workspace/file.ts
var file_exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	POST: () => POST,
	PUT: () => PUT,
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
		const target = url.searchParams.get("path");
		if (!target) return new Response(JSON.stringify({
			success: false,
			error: "Path parameter required"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const validation = validatePathWithinWorkspace(target);
		if (!validation.valid || !validation.resolvedPath) return new Response(JSON.stringify({
			success: false,
			error: validation.error
		}), {
			status: 403,
			headers: { "Content-Type": "application/json" }
		});
		const filePath = validation.resolvedPath;
		if (!fs.existsSync(filePath)) {
			logFsAudit("READ", filePath, "error", "File not found");
			return new Response(JSON.stringify({
				success: false,
				error: `File not found: ${validation.relativePath}`
			}), {
				status: 404,
				headers: { "Content-Type": "application/json" }
			});
		}
		const stat = fs.statSync(filePath);
		if (stat.isDirectory()) return new Response(JSON.stringify({
			success: false,
			error: "Target path is a directory, not a file"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const ext = path.extname(filePath).toLowerCase().replace(".", "");
		const isBinary = BINARY_EXTENSIONS.has(ext);
		logFsAudit("READ", filePath, "allowed");
		if (isBinary) {
			let extractedText = null;
			try {
				const { getDocumentByPath, getDocumentByName } = await import("./documentDb_DJ8NrkOT.mjs").then((n) => n.t);
				const doc = getDocumentByPath(validation.relativePath) || getDocumentByName(path.basename(filePath));
				if (doc?.extracted_text) extractedText = doc.extracted_text;
			} catch {}
			return new Response(JSON.stringify({
				success: true,
				content: extractedText,
				extractedText,
				file: {
					name: path.basename(filePath),
					path: validation.relativePath,
					fullPath: filePath.replace(/\\/g, "/"),
					size: stat.size,
					extension: ext,
					isBinary: true,
					content: extractedText,
					extractedText,
					modifiedAt: stat.mtime.toISOString()
				}
			}), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
		}
		if (stat.size > 3145728) {
			const fd = fs.openSync(filePath, "r");
			const buffer = Buffer.alloc(512e3);
			fs.readSync(fd, buffer, 0, buffer.length, 0);
			fs.closeSync(fd);
			const content = buffer.toString("utf-8") + "\n\n... [File truncated: showing first 500KB of " + (stat.size / 1024).toFixed(1) + " KB]";
			return new Response(JSON.stringify({
				success: true,
				content,
				file: {
					name: path.basename(filePath),
					path: validation.relativePath,
					fullPath: filePath.replace(/\\/g, "/"),
					size: stat.size,
					extension: ext,
					isBinary: false,
					content,
					modifiedAt: stat.mtime.toISOString()
				}
			}), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
		}
		const content = fs.readFileSync(filePath, "utf-8");
		return new Response(JSON.stringify({
			success: true,
			content,
			file: {
				name: path.basename(filePath),
				path: validation.relativePath,
				fullPath: filePath.replace(/\\/g, "/"),
				size: stat.size,
				extension: ext,
				isBinary: false,
				content,
				modifiedAt: stat.mtime.toISOString()
			}
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			success: false,
			error: err?.message || "Read error"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
var POST = async ({ request }) => {
	try {
		const body = await request.json().catch(() => ({}));
		const target = body.path;
		const content = body.content;
		if (!target) return new Response(JSON.stringify({
			success: false,
			error: "Path parameter required"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		if (content === void 0 || content === null) return new Response(JSON.stringify({
			success: false,
			error: "Content parameter required"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const validation = validatePathWithinWorkspace(target);
		if (!validation.valid || !validation.resolvedPath) return new Response(JSON.stringify({
			success: false,
			error: validation.error
		}), {
			status: 403,
			headers: { "Content-Type": "application/json" }
		});
		const filePath = validation.resolvedPath;
		const parentDir = path.dirname(filePath);
		if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
		fs.writeFileSync(filePath, content, "utf-8");
		const stat = fs.statSync(filePath);
		logFsAudit("WRITE", filePath, "allowed", `Wrote ${stat.size} bytes`);
		return new Response(JSON.stringify({
			success: true,
			message: `File ${validation.relativePath} saved to disk`,
			path: validation.relativePath,
			size: stat.size,
			modifiedAt: stat.mtime.toISOString()
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			success: false,
			error: err?.message || "Write error"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
var PUT = async ({ request }) => {
	try {
		const body = await request.json().catch(() => ({}));
		const target = body.path;
		const isDirectory = !!body.isDirectory;
		const content = body.content || "";
		if (!target) return new Response(JSON.stringify({
			success: false,
			error: "Path parameter required"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const validation = validatePathWithinWorkspace(target);
		if (!validation.valid || !validation.resolvedPath) return new Response(JSON.stringify({
			success: false,
			error: validation.error
		}), {
			status: 403,
			headers: { "Content-Type": "application/json" }
		});
		const filePath = validation.resolvedPath;
		if (fs.existsSync(filePath)) return new Response(JSON.stringify({
			success: false,
			error: `Item already exists at path: ${validation.relativePath}`
		}), {
			status: 409,
			headers: { "Content-Type": "application/json" }
		});
		if (isDirectory) {
			fs.mkdirSync(filePath, { recursive: true });
			logFsAudit("CREATE", filePath, "allowed", "Created directory");
			return new Response(JSON.stringify({
				success: true,
				message: `Directory ${validation.relativePath} created`,
				path: validation.relativePath,
				isDirectory: true
			}), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
		}
		const parentDir = path.dirname(filePath);
		if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
		fs.writeFileSync(filePath, content, "utf-8");
		const stat = fs.statSync(filePath);
		logFsAudit("CREATE", filePath, "allowed", `Created file (${stat.size} bytes)`);
		return new Response(JSON.stringify({
			success: true,
			message: `File ${validation.relativePath} created`,
			path: validation.relativePath,
			isDirectory: false,
			size: stat.size,
			modifiedAt: stat.mtime.toISOString()
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			success: false,
			error: err?.message || "Create error"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
var DELETE = async ({ request, url }) => {
	try {
		const target = (await request.json().catch(() => ({}))).path || url?.searchParams.get("path");
		if (!target) return new Response(JSON.stringify({
			success: false,
			error: "Path parameter required"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const validation = validatePathWithinWorkspace(target);
		if (!validation.valid || !validation.resolvedPath) return new Response(JSON.stringify({
			success: false,
			error: validation.error
		}), {
			status: 403,
			headers: { "Content-Type": "application/json" }
		});
		const filePath = validation.resolvedPath;
		const wsRoot = getActiveWorkspaceRoot();
		if (path.resolve(filePath).toLowerCase() === path.resolve(wsRoot).toLowerCase()) {
			logFsAudit("DELETE", filePath, "blocked", "Attempt to delete workspace root blocked");
			return new Response(JSON.stringify({
				success: false,
				error: "Security Error: Cannot delete the active workspace root directory"
			}), {
				status: 400,
				headers: { "Content-Type": "application/json" }
			});
		}
		if (!fs.existsSync(filePath)) return new Response(JSON.stringify({
			success: false,
			error: `Path does not exist: ${validation.relativePath}`
		}), {
			status: 404,
			headers: { "Content-Type": "application/json" }
		});
		if (fs.statSync(filePath).isDirectory()) {
			fs.rmSync(filePath, {
				recursive: true,
				force: true
			});
			logFsAudit("DELETE", filePath, "allowed", "Deleted directory recursively");
		} else {
			fs.unlinkSync(filePath);
			logFsAudit("DELETE", filePath, "allowed", "Deleted file");
		}
		return new Response(JSON.stringify({
			success: true,
			message: `Successfully deleted ${validation.relativePath}`,
			path: validation.relativePath
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			success: false,
			error: err?.message || "Delete error"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/workspace/file@_@ts
var page = () => file_exports;
//#endregion
export { page };
