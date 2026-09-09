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
var IMAGE_MODELS = [
	{
		id: "z-image-turbo",
		name: "Z-Image Turbo (DiT BF16 + Qwen 3 4B)",
		format: "DiT Safetensors (Modular)",
		file: "z_image_turbo_bf16.safetensors",
		path: "models/unet/z_image_turbo_bf16.safetensors",
		sizeGb: 14.2
	},
	{
		id: "sdxl-lightning",
		name: "SDXL-Lightning",
		format: "4-Step Safetensors",
		file: "sdxl_lightning_4step.safetensors",
		path: "models/sdxl-lightning/sdxl_lightning_4step.safetensors",
		sizeGb: 6.94
	},
	{
		id: "flux1-schnell",
		name: "FLUX.1 [schnell]",
		format: "GGUF (Q4_K_S)",
		file: "flux1-schnell-Q4_K_S.gguf",
		path: "models/flux1-schnell/flux1-schnell-Q4_K_S.gguf",
		sizeGb: 6.78
	}
];
function findModularModelFile(filename, subdirs, cwd) {
	const drives = [
		"F:",
		"C:",
		"D:",
		"E:"
	];
	const candidates = [];
	for (const sub of subdirs) {
		candidates.push(path.resolve(cwd, "models", sub, filename), path.resolve(cwd, "LUMI_Desktop", "models", sub, filename), path.resolve(path.dirname(cwd), "models", sub, filename), path.resolve(cwd, "models", filename));
		for (const d of drives) candidates.push(path.join(d, "ComfyUIMain", "models", sub, filename), path.join(d, "ComfyUI", "models", sub, filename), path.join(d, "ComfyUI_windows_portable", "ComfyUI", "models", sub, filename));
	}
	for (const cand of candidates) if (fs.existsSync(cand)) return cand;
	return "";
}
function findModelOnDisk(relPath, cwd) {
	const basename = path.basename(relPath);
	const dirname = path.basename(path.dirname(relPath));
	const drives = [
		"F:",
		"C:",
		"D:",
		"E:"
	];
	const candidates = [
		path.resolve(cwd, relPath),
		path.resolve(path.dirname(cwd), relPath),
		path.resolve(cwd, "LUMI_Desktop", relPath),
		path.resolve(path.dirname(cwd), "models", dirname, basename),
		path.resolve(cwd, "models", dirname, basename),
		path.resolve(cwd, "models", basename)
	];
	for (const d of drives) candidates.push(path.join(d, "ComfyUIMain", "models", dirname, basename), path.join(d, "ComfyUIMain", "models", "checkpoints", basename), path.join(d, "ComfyUI", "models", dirname, basename), path.join(d, "ComfyUI", "models", "checkpoints", basename));
	for (const cand of candidates) if (fs.existsSync(cand)) return cand;
	return "";
}
var GET = async () => {
	const cwd = process.cwd();
	const zDiff = findModularModelFile("z_image_turbo_bf16.safetensors", [
		"unet",
		"diffusion_models",
		"z-image-turbo"
	], cwd);
	const zLlm = findModularModelFile("qwen_3_4b.safetensors", [
		"text_encoders",
		"LLM",
		"z-image-turbo"
	], cwd);
	const zVae = findModularModelFile("ae.safetensors", ["vae", "z-image-turbo"], cwd);
	const zInstalled = Boolean(zDiff && zLlm && zVae);
	const models = IMAGE_MODELS.map((m) => {
		if (m.id === "z-image-turbo") return {
			...m,
			installed: zInstalled,
			fullPath: zInstalled ? zDiff : void 0,
			components: {
				diffusion: zDiff || null,
				llm: zLlm || null,
				vae: zVae || null
			}
		};
		const fullPath = findModelOnDisk(m.path, cwd);
		const installed = Boolean(fullPath && fs.existsSync(fullPath));
		return {
			...m,
			installed,
			fullPath: installed ? fullPath : void 0
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
		const cwd = process.cwd();
		let requestedModelId = (body.modelId || "").trim().toLowerCase();
		if (!requestedModelId || requestedModelId !== "z-image-turbo" && requestedModelId !== "flux1-schnell" && requestedModelId !== "sdxl-lightning") requestedModelId = "z-image-turbo";
		const zDiffPath = findModularModelFile("z_image_turbo_bf16.safetensors", [
			"unet",
			"diffusion_models",
			"z-image-turbo"
		], cwd);
		const zLlmPath = findModularModelFile("qwen_3_4b.safetensors", [
			"text_encoders",
			"LLM",
			"z-image-turbo"
		], cwd);
		const zVaePath = findModularModelFile("ae.safetensors", ["vae", "z-image-turbo"], cwd);
		const hasZImage = Boolean(zDiffPath && zLlmPath && zVaePath);
		const sdxlRel = path.join("models", "sdxl-lightning", "sdxl_lightning_4step.safetensors");
		const fluxRel = path.join("models", "flux1-schnell", "flux1-schnell-Q4_K_S.gguf");
		const sdxlPath = findModelOnDisk(sdxlRel, cwd);
		const fluxPath = findModelOnDisk(fluxRel, cwd);
		let effectiveModelId = requestedModelId;
		let resolvedModelPath = "";
		if (requestedModelId === "z-image-turbo" && hasZImage) {
			effectiveModelId = "z-image-turbo";
			resolvedModelPath = zDiffPath;
		} else if (requestedModelId === "flux1-schnell" && fluxPath) {
			effectiveModelId = "flux1-schnell";
			resolvedModelPath = fluxPath;
		} else if (requestedModelId === "sdxl-lightning" && sdxlPath) {
			effectiveModelId = "sdxl-lightning";
			resolvedModelPath = sdxlPath;
		} else if (hasZImage) {
			effectiveModelId = "z-image-turbo";
			resolvedModelPath = zDiffPath;
		} else if (sdxlPath) {
			effectiveModelId = "sdxl-lightning";
			resolvedModelPath = sdxlPath;
		} else if (fluxPath) {
			effectiveModelId = "flux1-schnell";
			resolvedModelPath = fluxPath;
		}
		const isZImage = effectiveModelId === "z-image-turbo";
		const isSdxl = effectiveModelId === "sdxl-lightning";
		const width = Number(body.width) || 1024;
		const height = Number(body.height) || 1024;
		const steps = isZImage ? Number(body.steps) || 8 : isSdxl ? 4 : Number(body.steps) || 4;
		const cfgScale = isZImage ? "1.0" : isSdxl ? "1.0" : body.cfgScale ? String(body.cfgScale) : "1.0";
		const modelName = isZImage ? "Z-Image Turbo (DiT BF16 + Qwen 3 4B)" : isSdxl ? "SDXL-Lightning 4-Step (Safetensors)" : "FLUX.1 [schnell] (GGUF Q4_K_S)";
		const timestamp = Date.now();
		const outputDir = path.join(cwd, "workspace", "generated_images");
		fs.mkdirSync(outputDir, { recursive: true });
		const outputFilename = `img_${effectiveModelId}_${timestamp}.png`;
		const outputPath = path.join(outputDir, outputFilename);
		const sdCandidates = [
			path.join(cwd, "tools", "sd", "sd-cli.exe"),
			path.join(cwd, "LUMI_Desktop", "tools", "sd", "sd-cli.exe"),
			path.join(path.dirname(cwd), "tools", "sd", "sd-cli.exe"),
			path.join(path.dirname(cwd), "LUMI_Desktop", "tools", "sd", "sd-cli.exe")
		];
		let resolvedSdBin = "";
		for (const cand of sdCandidates) if (fs.existsSync(cand)) {
			resolvedSdBin = cand;
			break;
		}
		let result = null;
		const startTime = Date.now();
		if (resolvedSdBin && resolvedModelPath) try {
			const sdDir = path.dirname(resolvedSdBin);
			const llamaDir = path.join(path.dirname(sdDir), "llama_server");
			const customEnv = {
				...process.env,
				PATH: `${sdDir};${llamaDir};${process.env.PATH || ""}`
			};
			const randomSeed = Math.floor(Math.random() * 2147483647);
			const sdArgs = [];
			if (isZImage) sdArgs.push("--diffusion-model", zDiffPath, "--llm", zLlmPath, "--vae", zVaePath, "-p", prompt, "-o", outputPath, "-W", String(width), "-H", String(height), "--steps", String(steps), "--cfg-scale", cfgScale, "--sampling-method", "euler", "-s", String(randomSeed));
			else {
				sdArgs.push("-m", resolvedModelPath, "-p", prompt, "-o", outputPath, "-W", String(width), "-H", String(height), "--steps", String(steps), "--cfg-scale", cfgScale, "--sampling-method", "euler", "--vae-tiling");
				if (isSdxl) sdArgs.push("--force-sdxl-vae-conv-scale");
				sdArgs.push("-s", String(randomSeed));
			}
			if (body.negativePrompt) sdArgs.push("-n", String(body.negativePrompt));
			await new Promise((resolve, reject) => {
				execFile(resolvedSdBin, sdArgs, {
					cwd: sdDir,
					env: customEnv,
					timeout: 18e4
				}, (err) => {
					if (err && !fs.existsSync(outputPath)) return reject(err);
					resolve(true);
				});
			});
			if (fs.existsSync(outputPath)) {
				const mirrorDirs = [
					path.join(cwd, "LUMI_Desktop", "workspace", "generated_images"),
					path.join(path.dirname(cwd), "workspace", "generated_images"),
					path.join(path.dirname(cwd), "LUMI_Desktop", "workspace", "generated_images")
				];
				for (const mDir of mirrorDirs) try {
					if (fs.existsSync(path.dirname(path.dirname(mDir)))) {
						fs.mkdirSync(mDir, { recursive: true });
						fs.copyFileSync(outputPath, path.join(mDir, outputFilename));
					}
				} catch {}
				const stats = fs.statSync(outputPath);
				result = {
					success: true,
					output_path: `workspace/generated_images/${outputFilename}`,
					filename: outputFilename,
					model_id: effectiveModelId,
					model_name: modelName,
					model_file: path.basename(resolvedModelPath),
					prompt,
					width,
					height,
					duration_ms: Date.now() - startTime,
					size_bytes: stats.size
				};
			}
		} catch (directErr) {
			console.warn("[IMAGE] Direct sd-cli execution warning, checking fallback:", directErr);
		}
		if (!result) {
			const pyArgs = [
				path.join(cwd, "scripts", "generate_image.py"),
				"--prompt",
				prompt,
				"--model-id",
				effectiveModelId,
				"--width",
				String(width),
				"--height",
				String(height),
				"--steps",
				String(steps)
			];
			if (body.negativePrompt) pyArgs.push("--negative-prompt", String(body.negativePrompt));
			try {
				result = await new Promise((resolve, reject) => {
					execFile("python", pyArgs, {
						cwd,
						timeout: 18e4
					}, (error, stdout, stderr) => {
						if (error && !stdout) return reject(new Error(stderr || error.message));
						try {
							const lines = stdout.trim().split("\n");
							const lastLine = lines[lines.length - 1];
							resolve(JSON.parse(lastLine));
						} catch {
							resolve(null);
						}
					});
				});
			} catch (pyErr) {
				if (!resolvedModelPath) return new Response(JSON.stringify({
					success: false,
					error: `Image model weights not found. Please place z_image_turbo_bf16.safetensors, qwen_3_4b.safetensors, and ae.safetensors in models/ (or ComfyUI models folder), or sdxl_lightning_4step.safetensors in models/sdxl-lightning/.`
				}), {
					status: 404,
					headers: { "Content-Type": "application/json" }
				});
				return new Response(JSON.stringify({
					success: false,
					error: `Image generation failed: ${pyErr.message}`
				}), {
					status: 500,
					headers: { "Content-Type": "application/json" }
				});
			}
		}
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
