import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import fs from "fs/promises";
import path from "path";
//#region src/pages/api/kb/files.ts
var files_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	ensureStorageDir: () => ensureStorageDir,
	prerender: () => false,
	readKbFiles: () => readKbFiles,
	readKbIndex: () => readKbIndex,
	writeKbFiles: () => writeKbFiles,
	writeKbIndex: () => writeKbIndex
});
var STORAGE_DIR = path.resolve(process.cwd(), "sovereign-ai-workbench", "data", "knowledge");
var INDEX_FILE = path.join(STORAGE_DIR, "index.json");
var PARSED_FILE = path.join(STORAGE_DIR, "parsed_knowledge.json");
async function ensureStorageDir() {
	try {
		await fs.mkdir(STORAGE_DIR, { recursive: true });
		try {
			await fs.access(INDEX_FILE);
		} catch {
			await fs.writeFile(INDEX_FILE, JSON.stringify([], null, 2), "utf-8");
		}
	} catch (err) {
		console.error("Failed to create storage directory:", err);
	}
}
async function readKbFiles() {
	await ensureStorageDir();
	let indexList = [];
	try {
		const rawIndex = await fs.readFile(INDEX_FILE, "utf-8");
		indexList = JSON.parse(rawIndex);
	} catch {
		indexList = [];
	}
	let parsedList = [];
	try {
		const rawParsed = await fs.readFile(PARSED_FILE, "utf-8");
		parsedList = JSON.parse(rawParsed);
	} catch {
		parsedList = [];
	}
	const parsedMap = /* @__PURE__ */ new Map();
	for (const p of parsedList) {
		if (p.filename) parsedMap.set(p.filename.toLowerCase(), p);
		if (p.id) parsedMap.set(p.id.toLowerCase(), p);
		if (p.name) parsedMap.set(p.name.toLowerCase(), p);
	}
	const merged = [];
	const processedKeys = /* @__PURE__ */ new Set();
	for (const idxItem of indexList) {
		const key = (idxItem.filename || idxItem.id || idxItem.name || "").toLowerCase();
		const parsed = parsedMap.get(key) || {};
		processedKeys.add(key);
		const fullItem = {
			id: idxItem.id || parsed.id || `kb-${Date.now()}`,
			name: idxItem.name || parsed.name || idxItem.filename || "Document",
			filename: idxItem.filename || parsed.filename || idxItem.name || "document",
			path: idxItem.path || path.join(STORAGE_DIR, idxItem.filename || ""),
			sizeBytes: idxItem.sizeBytes || 0,
			mimeType: idxItem.mimeType || "application/octet-stream",
			uploadedAt: idxItem.uploadedAt || (/* @__PURE__ */ new Date()).toISOString(),
			formattedDate: idxItem.formattedDate || "Saved",
			document_type: parsed.document_type || "guideline",
			category: parsed.category || "General",
			summary: parsed.summary || (parsed.content ? parsed.content.slice(0, 200) + "..." : ""),
			content: parsed.content || "",
			totalChunks: parsed.content ? Math.max(1, Math.ceil(parsed.content.split(/\s+/).length / 150)) : 1
		};
		merged.push(fullItem);
	}
	for (const parsed of parsedList) {
		const key = (parsed.filename || parsed.id || parsed.name || "").toLowerCase();
		if (!processedKeys.has(key)) {
			processedKeys.add(key);
			merged.push({
				id: parsed.id || `kb-${Date.now()}`,
				name: parsed.name || parsed.filename || "Document",
				filename: parsed.filename || "document",
				path: path.join(STORAGE_DIR, parsed.filename || ""),
				sizeBytes: 0,
				mimeType: "application/pdf",
				uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
				formattedDate: "Pre-indexed",
				document_type: parsed.document_type || "guideline",
				category: parsed.category || "General",
				summary: parsed.summary || (parsed.content ? parsed.content.slice(0, 200) + "..." : ""),
				content: parsed.content || "",
				totalChunks: parsed.content ? Math.max(1, Math.ceil(parsed.content.split(/\s+/).length / 150)) : 1
			});
		}
	}
	return merged;
}
async function writeKbFiles(files) {
	await ensureStorageDir();
	const indexEntries = files.map((f) => ({
		id: f.id,
		name: f.name,
		filename: f.filename,
		path: f.path,
		sizeBytes: f.sizeBytes,
		mimeType: f.mimeType,
		uploadedAt: f.uploadedAt,
		formattedDate: f.formattedDate
	}));
	await fs.writeFile(INDEX_FILE, JSON.stringify(indexEntries, null, 2), "utf-8");
	const parsedEntries = files.map((f) => ({
		id: f.id,
		name: f.name,
		filename: f.filename,
		document_type: f.document_type || "guideline",
		category: f.category || "General",
		summary: f.summary || "",
		content: f.content || ""
	}));
	await fs.writeFile(PARSED_FILE, JSON.stringify(parsedEntries, null, 2), "utf-8");
}
var readKbIndex = readKbFiles;
var writeKbIndex = writeKbFiles;
var GET = async () => {
	const files = await readKbFiles();
	return new Response(JSON.stringify({
		success: true,
		files
	}), {
		status: 200,
		headers: { "Content-Type": "application/json" }
	});
};
//#endregion
export { writeKbFiles as i, files_exports as n, readKbFiles as r, ensureStorageDir as t };
