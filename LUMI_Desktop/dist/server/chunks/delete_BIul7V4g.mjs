import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { i as writeKbIndex, r as readKbIndex, t as ensureStorageDir } from "./files_CxNoRQQl.mjs";
import fs from "fs/promises";
import path from "path";
//#region src/pages/api/kb/delete.ts
var delete_exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	POST: () => POST,
	prerender: () => false
});
var STORAGE_DIR = path.resolve(process.cwd(), "sovereign-ai-workbench", "data", "knowledge");
var DELETE = async ({ request }) => {
	try {
		await ensureStorageDir();
		const body = await request.json().catch(() => ({}));
		const filename = body.filename || body.id;
		if (!filename) return new Response(JSON.stringify({
			success: false,
			error: "Filename or ID required for deletion"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const existingFiles = await readKbIndex();
		const targetFile = existingFiles.find((f) => f.filename === filename || f.id === filename || f.name === filename);
		const safeFilename = targetFile ? targetFile.filename : filename.replace(/[^a-zA-Z0-9._-]/g, "_");
		const targetPath = path.join(STORAGE_DIR, safeFilename);
		try {
			await fs.unlink(targetPath);
		} catch (e) {}
		const updatedFiles = existingFiles.filter((f) => f.filename !== safeFilename && f.id !== filename && f.name !== filename);
		await writeKbIndex(updatedFiles);
		return new Response(JSON.stringify({
			success: true,
			message: `Successfully deleted ${safeFilename}`,
			files: updatedFiles
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		console.error("Failed to delete Knowledge Base file:", err);
		return new Response(JSON.stringify({
			success: false,
			error: err.message || "Deletion failed"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
var POST = async (context) => {
	return DELETE(context);
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/kb/delete@_@ts
var page = () => delete_exports;
//#endregion
export { page };
