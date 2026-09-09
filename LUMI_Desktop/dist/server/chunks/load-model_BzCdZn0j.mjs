import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
//#region src/pages/api/launcher/load-model.ts
var load_model_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = async ({ request }) => {
	try {
		const body = await request.json();
		const model = body?.modelPath || body?.model || "";
		if (model) {
			const cleanTag = model.split(/[/\\]/).pop()?.replace(/\.gguf$/i, "") || model;
			fetch("http://127.0.0.1:11434/api/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					model: cleanTag,
					prompt: "GPU Ping",
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
		return new Response(JSON.stringify({
			success: true,
			model
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch {
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/launcher/load-model@_@ts
var page = () => load_model_exports;
//#endregion
export { page };
