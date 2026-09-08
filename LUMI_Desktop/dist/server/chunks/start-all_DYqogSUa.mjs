import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
//#region src/pages/api/launcher/start-all.ts
var start_all_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = async () => {
	return new Response(JSON.stringify({
		success: true,
		message: "Local sovereign engines active"
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
