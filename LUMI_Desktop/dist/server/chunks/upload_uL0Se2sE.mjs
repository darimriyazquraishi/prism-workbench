import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { i as writeKbFiles, r as readKbFiles, t as ensureStorageDir } from "./files_CmObFPfj.mjs";
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
/**
* Extracts plain text from various file formats: PDF, DOCX, XLSX, TXT, CSV, MD, JSON, Code
*/
async function extractDocumentText(buffer, filename, mimeType) {
	const ext = filename.split(".").pop()?.toLowerCase() || "";
	if (ext === "pdf" || mimeType === "application/pdf") try {
		const pdfModule = await import("pdf-parse");
		const parsed = await (pdfModule.default || pdfModule)(buffer);
		if (parsed?.text && parsed.text.trim()) return parsed.text.trim();
	} catch (err) {
		console.warn(`[KB PARSER] pdf-parse failed for ${filename}:`, err);
	}
	if (["docx", "doc"].includes(ext) || mimeType.includes("wordprocessingml")) try {
		const res = await (await import("mammoth")).extractRawText({ buffer });
		if (res?.value && res.value.trim()) return res.value.trim();
	} catch (err) {
		console.warn(`[KB PARSER] mammoth failed for ${filename}:`, err);
	}
	if (["xlsx", "xls"].includes(ext) || mimeType.includes("spreadsheetml") || mimeType.includes("excel")) try {
		const XLSX = await import("xlsx");
		const workbook = XLSX.read(buffer, { type: "buffer" });
		const sheetTexts = [];
		for (const sheetName of workbook.SheetNames) {
			const sheet = workbook.Sheets[sheetName];
			const csv = XLSX.utils.sheet_to_csv(sheet);
			if (csv.trim()) sheetTexts.push(`[Sheet: ${sheetName}]\n${csv}`);
		}
		if (sheetTexts.length > 0) return sheetTexts.join("\n\n");
	} catch (err) {
		console.warn(`[KB PARSER] xlsx parser failed for ${filename}:`, err);
	}
	if ([
		"txt",
		"md",
		"markdown",
		"csv",
		"tsv",
		"json",
		"log",
		"yaml",
		"yml",
		"xml",
		"html",
		"py",
		"js",
		"ts",
		"tsx",
		"css",
		"sql",
		"sh",
		"env",
		"ini"
	].includes(ext)) try {
		return buffer.toString("utf-8");
	} catch (err) {
		console.warn(`[KB PARSER] UTF-8 text decode failed for ${filename}:`, err);
	}
	if ([
		"png",
		"jpg",
		"jpeg",
		"webp",
		"gif",
		"bmp",
		"svg"
	].includes(ext)) return `[Visual Asset / Diagram]: ${filename}\nFormat: ${ext.toUpperCase()}, Size: ${(buffer.length / 1024).toFixed(1)} KB.`;
	try {
		const raw = buffer.toString("utf-8");
		if (raw.slice(0, 500).replace(/[^\x20-\x7E\r\n\t]/g, "").length > 250) return raw;
	} catch {}
	return `Document ${filename} (Format: ${ext.toUpperCase()})`;
}
/**
* Derives a clean human-readable title, document type, category, and summary
*/
function deriveMetadata(filename, content) {
	const title = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
	const lowerContent = content.toLowerCase();
	let docType = "Guideline";
	let category = "Engineering & Operations";
	if (lowerContent.includes("sop") || lowerContent.includes("standard operating procedure")) docType = "Standard Operating Procedure";
	else if (lowerContent.includes("safety") || lowerContent.includes("hazard") || lowerContent.includes("ppe") || lowerContent.includes("permit to work")) {
		docType = "Safety Protocol";
		category = "Safety & HSE";
	} else if (lowerContent.includes("inspection") || lowerContent.includes("ultrasonic") || lowerContent.includes("corrosion") || lowerContent.includes("wall thickness")) {
		docType = "Inspection Guideline";
		category = "Inspection & Quality";
	} else if (lowerContent.includes("approval note") || lowerContent.includes("governance")) {
		docType = "Approval Procedure";
		category = "Governance";
	} else if (lowerContent.includes("procurement") || lowerContent.includes("vendor") || lowerContent.includes("bid")) {
		docType = "Procurement Standard";
		category = "Procurement & Commercial";
	} else if (lowerContent.includes("presentation") || lowerContent.includes("slide") || lowerContent.includes("powerpoint")) {
		docType = "Presentation Standard";
		category = "Communications";
	} else if (lowerContent.includes("maintenance") || lowerContent.includes("pump") || lowerContent.includes("mtbf") || lowerContent.includes("overhaul")) {
		docType = "Maintenance Workflow";
		category = "Maintenance & Reliability";
	} else if (lowerContent.includes("specification") || lowerContent.includes("datasheet") || lowerContent.includes("drawing")) {
		docType = "Technical Specification";
		category = "Engineering";
	}
	let summary = "";
	if (content && content.length > 50) {
		const cleanLines = content.split("\n").map((l) => l.trim()).filter((l) => l.length > 20 && !l.startsWith("#") && !l.startsWith("==") && !l.startsWith("--"));
		if (cleanLines.length > 0) {
			summary = cleanLines.slice(0, 3).join(" ");
			if (summary.length > 250) summary = summary.slice(0, 247) + "...";
		} else summary = content.slice(0, 200).replace(/\s+/g, " ").trim() + "...";
	} else summary = `Knowledge base document covering ${title}.`;
	return {
		title,
		docType,
		category,
		summary
	};
}
var POST = async ({ request }) => {
	try {
		await ensureStorageDir();
		const formData = await request.formData();
		const rawFiles = [...formData.getAll("files"), ...formData.getAll("file")].filter((f) => f instanceof File && typeof f !== "string" && f.name.length > 0);
		if (rawFiles.length === 0) return new Response(JSON.stringify({
			success: false,
			error: "No valid file provided"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const rawPaths = [...formData.getAll("paths"), ...formData.getAll("relative_paths")].map((p) => String(p).trim());
		const { createHash } = await import("crypto");
		const { insertDocument } = await import("./documentDb_DJ8NrkOT.mjs").then((n) => n.t);
		const USER_UPLOADS_BASE = path.resolve(process.cwd(), "workspaces", "user_workspace", "Uploads");
		await fs.mkdir(USER_UPLOADS_BASE, { recursive: true });
		const ALLOWED_TEXT_EXTS = /* @__PURE__ */ new Set([
			"pdf",
			"txt",
			"md",
			"markdown",
			"docx",
			"doc",
			"csv",
			"tsv",
			"json",
			"py",
			"js",
			"ts",
			"tsx",
			"jsx",
			"html",
			"css",
			"sql",
			"sh",
			"yaml",
			"yml",
			"xlsx",
			"xls",
			"png",
			"jpg",
			"jpeg",
			"webp",
			"log",
			"xml",
			"env",
			"ini",
			"toml"
		]);
		const uploadedMetadatas = [];
		const uploadErrors = [];
		let currentExistingFiles = await readKbFiles();
		for (let i = 0; i < rawFiles.length; i++) {
			const file = rawFiles[i];
			try {
				const normalizedRel = (rawPaths[i] || file.webkitRelativePath || file.name).replace(/\\/g, "/").replace(/^\/+/, "").replace(/\.\.\//g, "");
				const relDir = path.dirname(normalizedRel) === "." ? "" : path.dirname(normalizedRel);
				const originalName = path.basename(normalizedRel) || path.basename(file.name);
				const ext = (originalName.split(".").pop() || "").toLowerCase();
				const safeBaseName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
				if (file.size > 157286400) {
					uploadErrors.push({
						file: originalName,
						error: `File exceeds 150MB limit (${(file.size / 1048576).toFixed(1)} MB)`
					});
					continue;
				}
				const arrayBuffer = await file.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);
				const sha256Hash = createHash("sha256").update(buffer).digest("hex");
				const targetUploadDir = relDir ? path.join(USER_UPLOADS_BASE, relDir) : USER_UPLOADS_BASE;
				await fs.mkdir(targetUploadDir, { recursive: true });
				let storedFilename = safeBaseName;
				let userUploadPath = path.join(targetUploadDir, storedFilename);
				try {
					if ((await fs.stat(userUploadPath)).isFile()) {
						const existingBuf = await fs.readFile(userUploadPath);
						if (createHash("sha256").update(existingBuf).digest("hex") !== sha256Hash) {
							const parsedName = path.parse(safeBaseName);
							storedFilename = `${parsedName.name}_${Date.now().toString().slice(-4)}${parsedName.ext}`;
							userUploadPath = path.join(targetUploadDir, storedFilename);
						}
					}
				} catch {}
				const relativeToWorkspace = relDir ? `Uploads/${relDir}/${storedFilename}`.replace(/\\/g, "/") : `Uploads/${storedFilename}`;
				const storageMirrorPath = path.join(STORAGE_DIR, storedFilename);
				await fs.writeFile(userUploadPath, buffer);
				try {
					await fs.writeFile(storageMirrorPath, buffer);
				} catch {}
				let extractedText = "";
				if (ALLOWED_TEXT_EXTS.has(ext)) extractedText = await extractDocumentText(buffer, originalName, file.type || "");
				else extractedText = `[File Asset: ${originalName}] Format: ${ext.toUpperCase() || "BINARY"}, Size: ${(buffer.length / 1024).toFixed(1)} KB.`;
				const meta = deriveMetadata(originalName, extractedText);
				const now = /* @__PURE__ */ new Date();
				const wordCount = extractedText.split(/\s+/).filter(Boolean).length;
				const totalChunks = Math.max(1, Math.ceil(wordCount / 150));
				const docId = `doc-${Date.now()}-${sha256Hash.slice(0, 8)}`;
				const metadata = {
					id: docId,
					name: originalName,
					filename: storedFilename,
					path: userUploadPath,
					sizeBytes: buffer.length,
					mimeType: file.type || "application/octet-stream",
					uploadedAt: now.toISOString(),
					formattedDate: formatDate(now),
					document_type: meta.docType,
					category: meta.category,
					summary: meta.summary,
					content: extractedText,
					totalChunks
				};
				insertDocument({
					id: docId,
					workspace_id: "user_workspace",
					original_filename: originalName,
					stored_filename: storedFilename,
					relative_path: relativeToWorkspace,
					mime_type: file.type || "application/octet-stream",
					file_size: buffer.length,
					sha256: sha256Hash,
					uploaded_at: now.toISOString(),
					updated_at: now.toISOString(),
					extracted_text: extractedText,
					status: "ready"
				});
				currentExistingFiles = [metadata, ...currentExistingFiles.filter((f) => f.filename !== storedFilename && f.name !== originalName)];
				uploadedMetadatas.push({
					...metadata,
					sha256: sha256Hash,
					relative_path: relativeToWorkspace,
					content_available: !!extractedText && extractedText.length > 0
				});
			} catch (fileErr) {
				uploadErrors.push({
					file: file.name,
					error: fileErr.message || "File processing error"
				});
			}
		}
		await writeKbFiles(currentExistingFiles);
		return new Response(JSON.stringify({
			success: uploadedMetadatas.length > 0,
			file: uploadedMetadatas[0] || null,
			files: uploadedMetadatas,
			total_uploaded: uploadedMetadatas.length,
			errors: uploadErrors.length > 0 ? uploadErrors : void 0
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
