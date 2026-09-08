import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import fs from "fs/promises";
import path from "path";
//#region src/pages/api/kb/files.ts
var files_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	ensureStorageDir: () => ensureStorageDir,
	prerender: () => false,
	readKbIndex: () => readKbIndex,
	writeKbIndex: () => writeKbIndex
});
var STORAGE_DIR = path.resolve(process.cwd(), "sovereign-ai-workbench", "data", "knowledge");
var INDEX_FILE = path.join(STORAGE_DIR, "index.json");
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
async function readKbIndex() {
	await ensureStorageDir();
	try {
		const raw = await fs.readFile(INDEX_FILE, "utf-8");
		return JSON.parse(raw);
	} catch {
		return [];
	}
}
async function writeKbIndex(files) {
	await ensureStorageDir();
	await fs.writeFile(INDEX_FILE, JSON.stringify(files, null, 2), "utf-8");
}
var GET = async () => {
	const files = await readKbIndex();
	return new Response(JSON.stringify({
		success: true,
		files
	}), {
		status: 200,
		headers: { "Content-Type": "application/json" }
	});
};
//#endregion
export { writeKbIndex as i, files_exports as n, readKbIndex as r, ensureStorageDir as t };
