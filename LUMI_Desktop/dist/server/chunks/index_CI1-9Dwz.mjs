import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import fs from "fs/promises";
import path from "path";
//#region src/pages/api/kb/index.ts
var kb_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var STORAGE_DIR = path.resolve(process.cwd(), "sovereign-ai-workbench", "data", "knowledge");
var PARSED_FILE = path.join(STORAGE_DIR, "parsed_knowledge.json");
var GET = async () => {
	try {
		const raw = await fs.readFile(PARSED_FILE, "utf-8");
		const documents = JSON.parse(raw);
		return new Response(JSON.stringify({
			success: true,
			documents
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			success: false,
			documents: [],
			error: String(err)
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/kb/index@_@ts
var page = () => kb_exports;
//#endregion
export { page };
