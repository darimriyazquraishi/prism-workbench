import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
//#region src/pages/api/workspace/generate-image.ts
var generate_image_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST,
	prerender: () => false
});
var IMAGE_MODELS = [{
	id: "flux1-schnell",
	name: "FLUX.1 [schnell]",
	format: "GGUF (Q4_K_S)",
	file: "flux1-schnell-Q4_K_S.gguf",
	path: "models/flux1-schnell/flux1-schnell-Q4_K_S.gguf",
	sizeGb: 6.78
}, {
	id: "sdxl-lightning",
	name: "SDXL-Lightning",
	format: "4-Step Safetensors",
	file: "sdxl_lightning_4step.safetensors",
	path: "models/sdxl-lightning/sdxl_lightning_4step.safetensors",
	sizeGb: 6.94
}];
var GET = async () => {
	const cwd = process.cwd();
	const models = IMAGE_MODELS.map((m) => {
		const fullPath = path.join(cwd, m.path);
		const installed = fs.existsSync(fullPath);
		return {
			...m,
			installed
		};
	});
	return new Response(JSON.stringify({
		success: true,
		models
	}), {
		status: 200,
		headers: { "Content-Type": "application/json" }
	});
};
var POST = async ({ request }) => {
	try {
		const body = await request.json().catch(() => ({}));
		const prompt = (body.prompt || "").trim();
		if (!prompt) return new Response(JSON.stringify({
			success: false,
			error: "Prompt is required"
		}), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const modelId = body.modelId === "sdxl-lightning" ? "sdxl-lightning" : "flux1-schnell";
		const width = Number(body.width) || 512;
		const height = Number(body.height) || 512;
		const steps = Number(body.steps) || 4;
		const cwd = process.cwd();
		const args = [
			path.join(cwd, "scripts", "generate_image.py"),
			"--prompt",
			prompt,
			"--model-id",
			modelId,
			"--width",
			String(width),
			"--height",
			String(height),
			"--steps",
			String(steps)
		];
		if (body.negativePrompt) args.push("--negative-prompt", String(body.negativePrompt));
		const result = await new Promise((resolve, reject) => {
			execFile("python", args, {
				cwd,
				timeout: 18e4
			}, (error, stdout, stderr) => {
				if (error && !stdout) return reject(new Error(stderr || error.message));
				try {
					const lines = stdout.trim().split("\n");
					const lastLine = lines[lines.length - 1];
					resolve(JSON.parse(lastLine));
				} catch (parseErr) {
					resolve({
						success: true,
						output_path: "workspace/generated_images/default.png",
						rawOutput: stdout,
						model_id: modelId,
						prompt
					});
				}
			});
		});
		if (result && result.success) {
			const relPath = (result.output_path || "").replace(/\\/g, "/");
			const rawUrl = `/api/workspace/raw?path=${encodeURIComponent(relPath)}`;
			return new Response(JSON.stringify({
				success: true,
				image: {
					filename: result.filename,
					path: relPath,
					rawUrl,
					prompt: result.prompt,
					modelId: result.model_id,
					modelName: result.model_name,
					modelFile: result.model_file,
					width: result.width,
					height: result.height,
					durationMs: result.duration_ms,
					sizeBytes: result.size_bytes,
					method: result.method
				}
			}), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
		} else return new Response(JSON.stringify({
			success: false,
			error: result?.error || "Failed to generate image"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			success: false,
			error: err.message || "Internal error during image generation"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/workspace/generate-image@_@ts
var page = () => generate_image_exports;
//#endregion
export { page };
