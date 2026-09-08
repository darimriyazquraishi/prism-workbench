import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import os from "os";
import { execSync } from "child_process";
//#region src/pages/api/system/metrics.ts
var metrics_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var lastCpuMeasure = getCpuTimes();
function getCpuTimes() {
	const cpus = os.cpus();
	let user = 0;
	let nice = 0;
	let sys = 0;
	let idle = 0;
	let irq = 0;
	for (const cpu of cpus) {
		user += cpu.times.user;
		nice += cpu.times.nice;
		sys += cpu.times.sys;
		idle += cpu.times.idle;
		irq += cpu.times.irq;
	}
	const total = user + nice + sys + idle + irq;
	return {
		idle,
		total
	};
}
function getCpuUsagePercent() {
	const current = getCpuTimes();
	const idleDiff = current.idle - lastCpuMeasure.idle;
	const totalDiff = current.total - lastCpuMeasure.total;
	lastCpuMeasure = current;
	if (totalDiff === 0) return 0;
	const usage = 100 - idleDiff / totalDiff * 100;
	return Math.max(0, Math.min(100, Math.round(usage * 10) / 10));
}
function getGpuMetrics() {
	try {
		const rawOutput = execSync("nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits", {
			timeout: 500,
			encoding: "utf8"
		}).trim();
		if (!rawOutput) return {
			available: false,
			name: null,
			utilizationPct: null,
			vramUsedGb: null,
			vramTotalGb: null,
			tempC: null
		};
		const firstGpu = rawOutput.split("\n")[0].split(",").map((s) => s.trim());
		if (firstGpu.length >= 5) {
			const name = firstGpu[0];
			const utilizationPct = parseFloat(firstGpu[1]);
			const vramUsedMb = parseFloat(firstGpu[2]);
			const vramTotalMb = parseFloat(firstGpu[3]);
			const tempC = parseFloat(firstGpu[4]);
			return {
				available: true,
				name,
				utilizationPct: isNaN(utilizationPct) ? null : utilizationPct,
				vramUsedGb: isNaN(vramUsedMb) ? null : Math.round(vramUsedMb / 1024 * 10) / 10,
				vramTotalGb: isNaN(vramTotalMb) ? null : Math.round(vramTotalMb / 1024 * 10) / 10,
				tempC: isNaN(tempC) ? null : tempC
			};
		}
	} catch (err) {}
	return {
		available: false,
		name: null,
		utilizationPct: null,
		vramUsedGb: null,
		vramTotalGb: null,
		tempC: null
	};
}
var GET = async () => {
	const cpuUsagePct = getCpuUsagePercent();
	const totalMemBytes = os.totalmem();
	const usedMemBytes = totalMemBytes - os.freemem();
	const ramUsedGb = Math.round(usedMemBytes / 1073741824 * 10) / 10;
	const ramTotalGb = Math.round(totalMemBytes / 1073741824 * 10) / 10;
	const memUsage = process.memoryUsage();
	const appMemoryMb = Math.round(memUsage.rss / 1048576 * 10) / 10;
	const gpu = getGpuMetrics();
	return new Response(JSON.stringify({
		timestamp: (/* @__PURE__ */ new Date()).toISOString(),
		cpuUsagePct,
		ramUsedGb,
		ramTotalGb,
		ramUsagePct: Math.round(usedMemBytes / totalMemBytes * 1e3) / 10,
		appMemoryMb,
		gpuAvailable: gpu.available,
		gpuName: gpu.name,
		gpuUsagePct: gpu.utilizationPct,
		vramUsedGb: gpu.vramUsedGb,
		vramTotalGb: gpu.vramTotalGb,
		gpuTempC: gpu.tempC
	}), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "no-cache, no-store, must-revalidate"
		}
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/system/metrics@_@ts
var page = () => metrics_exports;
//#endregion
export { page };
