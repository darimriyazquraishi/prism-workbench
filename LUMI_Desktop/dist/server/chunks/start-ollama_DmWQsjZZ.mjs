import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
//#region src/pages/api/launcher/start-ollama.ts
var start_ollama_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = async () => {
	try {
		const isAlive = await fetch("http://127.0.0.1:11434/api/tags", { signal: AbortSignal.timeout(1e3) }).then((r) => r.ok).catch(() => false);
		return new Response(JSON.stringify({
			success: isAlive,
			message: isAlive ? "Ollama GPU inference service active" : "Ollama not responding on port 11434"
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			success: false,
			error: err?.message || "Failed to check Ollama status"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/launcher/start-ollama@_@ts
var page = () => start_ollama_exports;
//#endregion
export { page };
