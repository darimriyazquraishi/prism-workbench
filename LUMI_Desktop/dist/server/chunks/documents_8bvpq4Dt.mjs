import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { n as getAllDocuments, r as getDocumentById } from "./documentDb_DJ8NrkOT.mjs";
//#region src/pages/api/workspace/documents.ts
var documents_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var GET = async ({ url }) => {
	try {
		const id = url.searchParams.get("id");
		if (id) {
			const doc = getDocumentById(id);
			if (!doc) return new Response(JSON.stringify({
				success: false,
				error: "Document not found"
			}), {
				status: 404,
				headers: { "Content-Type": "application/json" }
			});
			return new Response(JSON.stringify({
				success: true,
				document: doc
			}), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
		}
		const docs = getAllDocuments();
		return new Response(JSON.stringify({
			success: true,
			documents: docs,
			count: docs.length
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			success: false,
			error: err.message
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/workspace/documents@_@ts
var page = () => documents_exports;
//#endregion
export { page };
