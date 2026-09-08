import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { i as writeKbIndex, r as readKbIndex, t as ensureStorageDir } from "./files_CxNoRQQl.mjs";
import fs from "fs/promises";
import path from "path";
//#region src/pages/api/kb/upload.ts
var upload_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var STORAGE_DIR = path.resolve(process.cwd(), "sovereign-ai-workbench", "data", "knowledge");
function formatDate(date) {
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
}
var POST = async ({ request }) => {
	try {
		await ensureStorageDir();
		const file = (await request.formData()).get("file");
		if (!file || typeof file === "string") return new Response(JSON.stringify({
			success: false,
			error: "No valid file provided"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const originalName = file.name;
		const safeFilename = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
		const targetPath = path.join(STORAGE_DIR, safeFilename);
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		await fs.writeFile(targetPath, buffer);
		const now = /* @__PURE__ */ new Date();
		const metadata = {
			id: `kb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
			name: originalName,
			filename: safeFilename,
			path: targetPath,
			sizeBytes: buffer.length,
			mimeType: file.type || "application/octet-stream",
			uploadedAt: now.toISOString(),
			formattedDate: formatDate(now)
		};
		const updatedFiles = [metadata, ...(await readKbIndex()).filter((f) => f.filename !== safeFilename)];
		await writeKbIndex(updatedFiles);
		return new Response(JSON.stringify({
			success: true,
			file: metadata,
			files: updatedFiles
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		console.error("Failed to upload file to Knowledge Base:", err);
		return new Response(JSON.stringify({
			success: false,
			error: err.message || "Upload failed"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/kb/upload@_@ts
var page = () => upload_exports;
//#endregion
export { page };
