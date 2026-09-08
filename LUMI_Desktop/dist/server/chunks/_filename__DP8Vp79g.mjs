import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
//#region src/pages/api/download/[filename].ts
var _filename__exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var GET = async ({ params, request }) => {
	const filename = params.filename;
	if (!filename) return new Response(JSON.stringify({ error: "Filename is required" }), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
	const cleanFilename = filename.replace(/^Generated\//, "");
	let contentType = "application/octet-stream";
	if (cleanFilename.endsWith(".pptx")) contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
	else if (cleanFilename.endsWith(".docx")) contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
	else if (cleanFilename.endsWith(".xlsx")) contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
	else if (cleanFilename.endsWith(".py")) contentType = "text/x-python;charset=utf-8";
	return new Response(`Deliverable file payload for ${cleanFilename}`, {
		status: 200,
		headers: {
			"Content-Type": contentType,
			"Content-Disposition": `attachment; filename="${cleanFilename}"`
		}
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/download/[filename]@_@ts
var page = () => _filename__exports;
//#endregion
export { page };
