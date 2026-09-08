import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import net from "node:net";
//#region src/pages/api/launcher/status.ts
var status_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
function checkPort(port) {
	return new Promise((resolve) => {
		const socket = new net.Socket();
		socket.setTimeout(350);
		socket.once("connect", () => {
			socket.destroy();
			resolve(true);
		});
		socket.once("timeout", () => {
			socket.destroy();
			resolve(false);
		});
		socket.once("error", () => {
			resolve(false);
		});
		socket.connect(port, "127.0.0.1");
	});
}
var GET = async () => {
	const ollama = await checkPort(11434);
	const visionServer = await checkPort(8080);
	return new Response(JSON.stringify({
		ollama,
		visionServer,
		port: 4321,
		loadedModel: "Local Sovereign Engine"
	}), {
		status: 200,
		headers: { "Content-Type": "application/json" }
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/launcher/status@_@ts
var page = () => status_exports;
//#endregion
export { page };
