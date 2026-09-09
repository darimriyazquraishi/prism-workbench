import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
//#region src/pages/api/launcher/start-all.ts
var start_all_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = async () => {
	fetch("http://127.0.0.1:11434/api/tags", { signal: AbortSignal.timeout(1e3) }).then((r) => r.json()).then((data) => {
		if (data?.models?.length > 0) {
			const preferred = data.models.find((m) => m.name.includes("qwen") || m.name.includes("coder")) || data.models[0];
			if (preferred?.name) fetch("http://127.0.0.1:11434/api/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					model: preferred.name,
					prompt: "GPU Warmup",
					stream: false,
					options: {
						num_predict: 1,
						num_gpu: 99,
						main_gpu: 0,
						num_ctx: 2048,
						f16_kv: true
					}
				})
			}).catch(() => null);
		}
	}).catch(() => null);
	return new Response(JSON.stringify({
		success: true,
		message: "Local sovereign GPU engines active"
	}), {
		status: 200,
		headers: { "Content-Type": "application/json" }
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/launcher/start-all@_@ts
var page = () => start_all_exports;
//#endregion
export { page };
