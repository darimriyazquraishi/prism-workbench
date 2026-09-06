import type { APIRoute } from 'astro';
import os from 'os';
import { execSync } from 'child_process';

export const prerender = false;

let lastCpuMeasure = getCpuTimes();

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
  return { idle, total };
}

function getCpuUsagePercent(): number {
  const current = getCpuTimes();
  const idleDiff = current.idle - lastCpuMeasure.idle;
  const totalDiff = current.total - lastCpuMeasure.total;
  lastCpuMeasure = current;

  if (totalDiff === 0) return 0;
  const usage = 100 - (idleDiff / totalDiff) * 100;
  return Math.max(0, Math.min(100, Math.round(usage * 10) / 10));
}

interface GpuMetrics {
  available: boolean;
  name: string | null;
  utilizationPct: number | null;
  vramUsedGb: number | null;
  vramTotalGb: number | null;
  tempC: number | null;
  error?: string;
}

function getGpuMetrics(): GpuMetrics {
  try {
    const rawOutput = execSync(
      'nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits',
      { timeout: 500, encoding: 'utf8' }
    ).trim();

    if (!rawOutput) {
      return { available: false, name: null, utilizationPct: null, vramUsedGb: null, vramTotalGb: null, tempC: null };
    }

    const lines = rawOutput.split('\n');
    const firstGpu = lines[0].split(',').map((s) => s.trim());

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
        vramUsedGb: isNaN(vramUsedMb) ? null : Math.round((vramUsedMb / 1024) * 10) / 10,
        vramTotalGb: isNaN(vramTotalMb) ? null : Math.round((vramTotalMb / 1024) * 10) / 10,
        tempC: isNaN(tempC) ? null : tempC
      };
    }
  } catch (err: any) {
    // nvidia-smi failed or not available
  }

  return {
    available: false,
    name: null,
    utilizationPct: null,
    vramUsedGb: null,
    vramTotalGb: null,
    tempC: null
  };
}

export const GET: APIRoute = async () => {
  const cpuUsagePct = getCpuUsagePercent();
  const totalMemBytes = os.totalmem();
  const freeMemBytes = os.freemem();
  const usedMemBytes = totalMemBytes - freeMemBytes;

  const ramUsedGb = Math.round((usedMemBytes / (1024 * 1024 * 1024)) * 10) / 10;
  const ramTotalGb = Math.round((totalMemBytes / (1024 * 1024 * 1024)) * 10) / 10;

  const memUsage = process.memoryUsage();
  const appMemoryMb = Math.round((memUsage.rss / (1024 * 1024)) * 10) / 10;

  const gpu = getGpuMetrics();

  return new Response(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      cpuUsagePct,
      ramUsedGb,
      ramTotalGb,
      ramUsagePct: Math.round((usedMemBytes / totalMemBytes) * 1000) / 10,
      appMemoryMb,
      gpuAvailable: gpu.available,
      gpuName: gpu.name,
      gpuUsagePct: gpu.utilizationPct,
      vramUsedGb: gpu.vramUsedGb,
      vramTotalGb: gpu.vramTotalGb,
      gpuTempC: gpu.tempC
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    }
  );
};
