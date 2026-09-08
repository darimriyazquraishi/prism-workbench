import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import fs from "fs/promises";
import path from "path";
//#region src/pages/api/kb/view/[filename].ts
var _filename__exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var STORAGE_DIR = path.resolve(process.cwd(), "sovereign-ai-workbench", "data", "knowledge");
function getMimeType(filename) {
	switch (path.extname(filename).toLowerCase()) {
		case ".pdf": return "application/pdf";
		case ".docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
		case ".pptx": return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
		case ".xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
		case ".txt": return "text/plain; charset=utf-8";
		case ".md": return "text/markdown; charset=utf-8";
		case ".json": return "application/json";
		case ".png": return "image/png";
		case ".jpg":
		case ".jpeg": return "image/jpeg";
		default: return "application/octet-stream";
	}
}
var GET = async ({ params }) => {
	const filename = params.filename;
	if (!filename) return new Response("Filename required", { status: 400 });
	const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
	const filePath = path.join(STORAGE_DIR, safeFilename);
	try {
		const fileBuffer = await fs.readFile(filePath);
		const mimeType = getMimeType(safeFilename);
		return new Response(fileBuffer, {
			status: 200,
			headers: {
				"Content-Type": mimeType,
				"Content-Disposition": `inline; filename="${safeFilename}"`
			}
		});
	} catch {
		return new Response(`File not found: ${safeFilename}`, { status: 404 });
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/kb/view/[filename]@_@ts
var page = () => _filename__exports;
//#endregion
export { page };
