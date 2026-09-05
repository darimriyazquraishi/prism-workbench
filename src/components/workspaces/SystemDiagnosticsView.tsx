import React, { useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  HardDrive, 
  ShieldCheck, 
  Square, 
  RefreshCw, 
  AlertTriangle, 
  Clock, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Film, 
  Image as ImageIcon, 
  Terminal,
  Server
} from 'lucide-react';
import { useTelemetryStore } from '../../store/telemetryStore';

export const SystemDiagnosticsView: React.FC = () => {
  const {
    status,
    currentOperation,
    performance,
    videoTelemetry,
    imageTelemetry,
    aiTelemetry,
    systemTelemetry,
    completedJobStats,
    failureState,
    eventsHistory,
    cancelJob,
    resetTelemetry,
    fetchSystemMetrics
  } = useTelemetryStore();

  // Poll real system metrics from backend API every 3 seconds
  useEffect(() => {
    fetchSystemMetrics();
    const interval = setInterval(() => {
      fetchSystemMetrics();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchSystemMetrics]);

  // Format seconds to MM:SS
  const formatSeconds = (sec: number | null): string => {
    if (sec === null || isNaN(sec) || sec < 0) return 'Calculating...';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Format ms to readable string
  const formatTimeMs = (ms: number): string => {
    if (ms <= 0) return '00:00';
    const sec = Math.floor(ms / 1000);
    return formatSeconds(sec);
  };

  // Status Badge Colors & Labels
  const getStatusBadge = () => {
    switch (status) {
      case 'PROCESSING':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            PROCESSING
          </span>
        );
      case 'LOADING':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 animate-spin" />
            LOADING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            COMPLETED
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            FAILED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
            <Square className="w-3 h-3" />
            CANCELLED
          </span>
        );
      case 'IDLE':
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            IDLE
          </span>
        );
    }
  };

  return (
    <div className="h-full flex flex-col space-y-3 font-sans text-xs overflow-y-auto p-3 bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* 1. TOP HEADER & PIPELINE CONTROL BAR */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono font-bold text-sm text-[var(--text-primary)]">
            <Activity className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>LIVE PIPELINE TELEMETRY</span>
          </div>
          {getStatusBadge()}
        </div>

        <div className="flex items-center gap-2">
          {status === 'PROCESSING' && (
            <button
              onClick={cancelJob}
              className="px-3 py-1.5 rounded-md bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/60 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Cancel running processing job"
            >
              <Square className="w-3 h-3 fill-rose-300" />
              <span>Cancel Job</span>
            </button>
          )}

          {(status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED') && (
            <button
              onClick={resetTelemetry}
              className="px-3 py-1.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset telemetry panel state"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset View</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--accent-success)] bg-[var(--bg-elevated)] px-2.5 py-1 rounded border border-[var(--border-subtle)]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Real Live State</span>
          </div>
        </div>
      </div>

      {/* 2. FAILURE STATE BANNER */}
      {status === 'FAILED' && failureState && (
        <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-800/60 text-rose-200 space-y-1.5 shadow-md font-mono text-xs">
          <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>Pipeline Execution Failed at Stage: {failureState.stage}</span>
          </div>
          <div className="text-xs text-rose-200 bg-rose-950/50 p-2.5 rounded border border-rose-900/40 leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {failureState.error}
          </div>
          <div className="text-[10px] text-rose-400/80">
            Failed at: {failureState.failedAt} | Elapsed before failure: {formatTimeMs(failureState.elapsedTimeMs)}
          </div>
        </div>
      )}

      {/* 3. CURRENT OPERATION & PROGRESS BAR */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3.5 space-y-3 shadow-sm font-mono">
        <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
          <span className="flex items-center gap-2">
            <Play className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Current Operation</span>
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] font-normal">
            Job ID: <code className="text-[var(--accent-primary)]">{currentOperation.jobId || 'N/A'}</code>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)] space-y-1">
            <div className="text-[var(--text-secondary)] text-[10px] uppercase">Current File</div>
            <div className="font-bold text-[var(--text-primary)] truncate" title={currentOperation.fileName || 'N/A'}>
              {currentOperation.fileName || 'N/A'}
            </div>
          </div>

          <div className="p-2.5 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)] space-y-1">
            <div className="text-[var(--text-secondary)] text-[10px] uppercase">Processing Stage</div>
            <div className="font-bold text-[var(--accent-primary)] truncate" title={currentOperation.stage || 'N/A'}>
              {currentOperation.stage || 'N/A'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-secondary)]">
              Progress: {currentOperation.progress >= 0 ? `${currentOperation.progress.toFixed(1)}%` : 'N/A'}
            </span>
            <span className="text-[var(--text-primary)] font-bold">
              Frame / Item: {currentOperation.currentFrame.toLocaleString()} / {currentOperation.totalFrames > 0 ? currentOperation.totalFrames.toLocaleString() : 'N/A'}
            </span>
          </div>

          <div className="h-2 bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border-subtle)] relative">
            {currentOperation.progress >= 0 ? (
              <div 
                className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(0, Math.min(100, currentOperation.progress))}%` }}
              ></div>
            ) : status === 'PROCESSING' ? (
              <div className="h-full bg-[var(--accent-primary)] w-1/3 animate-pulse rounded-full"></div>
            ) : (
              <div className="h-full bg-slate-700 w-0"></div>
            )}
          </div>
        </div>
      </div>

      {/* 4. PERFORMANCE & METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono text-xs">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3 space-y-1">
          <div className="text-[var(--text-secondary)] text-[10px] uppercase flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Processing FPS</span>
          </div>
          <div className="text-sm font-bold text-[var(--text-primary)]">
            {performance.processingFps !== null ? `${performance.processingFps} FPS` : 'N/A'}
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3 space-y-1">
          <div className="text-[var(--text-secondary)] text-[10px] uppercase flex items-center gap-1">
            <Zap className="w-3 h-3 text-sky-400" />
            <span>Average FPS</span>
          </div>
          <div className="text-sm font-bold text-[var(--text-primary)]">
            {performance.averageFps !== null ? `${performance.averageFps} FPS` : 'N/A'}
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3 space-y-1">
          <div className="text-[var(--text-secondary)] text-[10px] uppercase flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Elapsed Time</span>
          </div>
          <div className="text-sm font-bold text-[var(--text-primary)]">
            {formatTimeMs(performance.elapsedTimeMs)}
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3 space-y-1">
          <div className="text-[var(--text-secondary)] text-[10px] uppercase flex items-center gap-1">
            <Clock className="w-3 h-3 text-purple-400" />
            <span>ETA</span>
          </div>
          <div className="text-sm font-bold text-[var(--accent-primary)]">
            {formatSeconds(performance.estimatedRemainingSeconds)}
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3 space-y-1">
          <div className="text-[var(--text-secondary)] text-[10px] uppercase">Queue Size</div>
          <div className="text-sm font-bold text-[var(--text-primary)]">
            {performance.queueSize}
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3 space-y-1">
          <div className="text-[var(--text-secondary)] text-[10px] uppercase">Completed Jobs</div>
          <div className="text-sm font-bold text-emerald-400">
            {performance.completedJobsCount}
          </div>
        </div>
      </div>

      {/* 5. MEDIA TELEMETRY (VIDEO & IMAGE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
        {/* Video Telemetry */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3.5 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] uppercase border-b border-[var(--border-subtle)] pb-2">
            <span className="flex items-center gap-2">
              <Film className="w-3.5 h-3.5 text-sky-400" />
              <span>Video Telemetry</span>
            </span>
            <span className="text-[10px] text-[var(--text-secondary)]">FFmpeg Engine</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
              <div className="text-[var(--text-secondary)] text-[10px]">Current Frame</div>
              <div className="font-bold text-[var(--text-primary)]">
                {videoTelemetry.currentFrame !== null ? videoTelemetry.currentFrame.toLocaleString() : 'N/A'}
              </div>
            </div>

            <div className="p-2 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
              <div className="text-[var(--text-secondary)] text-[10px]">Total Frames</div>
              <div className="font-bold text-[var(--text-primary)]">
                {videoTelemetry.totalFrames !== null ? videoTelemetry.totalFrames.toLocaleString() : 'N/A'}
              </div>
            </div>

            <div className="p-2 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
              <div className="text-[var(--text-secondary)] text-[10px]">Source / Output FPS</div>
              <div className="font-bold text-[var(--text-primary)]">
                {videoTelemetry.sourceFps !== null ? `${videoTelemetry.sourceFps} / ${videoTelemetry.outputFps || 'N/A'}` : 'N/A'}
              </div>
            </div>

            <div className="p-2 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
              <div className="text-[var(--text-secondary)] text-[10px]">Resolution &amp; Codec</div>
              <div className="font-bold text-[var(--text-primary)] truncate">
                {videoTelemetry.resolution ? `${videoTelemetry.resolution} (${videoTelemetry.codec || 'H.264'})` : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Image Telemetry */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3.5 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] uppercase border-b border-[var(--border-subtle)] pb-2">
            <span className="flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>Image &amp; Batch Telemetry</span>
            </span>
            <span className="text-[10px] text-[var(--text-secondary)]">PyMuPDF / PaddleOCR</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
              <div className="text-[var(--text-secondary)] text-[10px]">Input Resolution</div>
              <div className="font-bold text-[var(--text-primary)]">
                {imageTelemetry.inputResolution || 'N/A'}
              </div>
            </div>

            <div className="p-2 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
              <div className="text-[var(--text-secondary)] text-[10px]">Output Resolution</div>
              <div className="font-bold text-[var(--text-primary)]">
                {imageTelemetry.outputResolution || 'N/A'}
              </div>
            </div>

            <div className="p-2 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
              <div className="text-[var(--text-secondary)] text-[10px]">Scale Factor</div>
              <div className="font-bold text-[var(--accent-primary)]">
                {imageTelemetry.scaleFactor || 'N/A'}
              </div>
            </div>

            <div className="p-2 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
              <div className="text-[var(--text-secondary)] text-[10px]">Image Stage Time</div>
              <div className="font-bold text-[var(--text-primary)]">
                {imageTelemetry.processingTimeMs ? `${imageTelemetry.processingTimeMs} ms` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. AI & MODEL TELEMETRY */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3.5 space-y-3 shadow-sm font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 font-bold uppercase tracking-wider text-[var(--text-primary)]">
          <span className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>AI / Model Telemetry</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-normal">
            Status: {aiTelemetry.modelLoadingStatus || 'READY'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[11px]">
          <div className="p-2.5 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
            <div className="text-[var(--text-secondary)] text-[10px]">Active Model</div>
            <div className="font-bold text-[var(--text-primary)] truncate" title={aiTelemetry.activeModel || 'N/A'}>
              {aiTelemetry.activeModel || 'N/A'}
            </div>
          </div>

          <div className="p-2.5 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
            <div className="text-[var(--text-secondary)] text-[10px]">Inference Time</div>
            <div className="font-bold text-[var(--accent-primary)]">
              {aiTelemetry.inferenceTimeMs !== null ? `${aiTelemetry.inferenceTimeMs} ms` : 'N/A'}
            </div>
          </div>

          <div className="p-2.5 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
            <div className="text-[var(--text-secondary)] text-[10px]">Detections</div>
            <div className="font-bold text-[var(--text-primary)]">
              {aiTelemetry.detectionsCount !== null ? aiTelemetry.detectionsCount.toLocaleString() : 'N/A'}
            </div>
          </div>

          <div className="p-2.5 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
            <div className="text-[var(--text-secondary)] text-[10px]">Confidence</div>
            <div className="font-bold text-emerald-400">
              {aiTelemetry.confidence !== null ? `${(aiTelemetry.confidence * 100).toFixed(1)}%` : 'N/A'}
            </div>
          </div>

          <div className="p-2.5 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
            <div className="text-[var(--text-secondary)] text-[10px]">YOLO FPS</div>
            <div className="font-bold text-amber-400">
              {aiTelemetry.yoloFps !== null ? `${aiTelemetry.yoloFps} FPS` : 'N/A'}
            </div>
          </div>

          <div className="p-2.5 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
            <div className="text-[var(--text-secondary)] text-[10px]">Real-ESRGAN Status</div>
            <div className="font-bold text-sky-400 truncate">
              {aiTelemetry.esrganStatus || 'N/A'}
            </div>
          </div>

          <div className="p-2.5 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
            <div className="text-[var(--text-secondary)] text-[10px]">Enhancement Time</div>
            <div className="font-bold text-[var(--text-primary)]">
              {aiTelemetry.esrganTimeMs !== null ? `${aiTelemetry.esrganTimeMs} ms` : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* 7. HARDWARE & SYSTEM TELEMETRY (REAL HARDWARE METRICS) */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3.5 space-y-3 shadow-sm font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 font-bold uppercase tracking-wider text-[var(--text-primary)]">
          <span className="flex items-center gap-2">
            <Server className="w-4 h-4 text-sky-400" />
            <span>System Hardware Telemetry (Real Host OS APIs)</span>
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] font-normal">
            Updated: {systemTelemetry.lastUpdated || 'Polling...'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* CPU & Memory */}
          <div className="space-y-2.5 bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border-subtle)]">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--text-secondary)]">CPU USAGE</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {systemTelemetry.cpuUsagePct !== null ? `${systemTelemetry.cpuUsagePct}%` : 'N/A'}
                </span>
              </div>
              <div className="h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div 
                  className="h-full bg-sky-400 transition-all duration-500" 
                  style={{ width: `${Math.max(0, Math.min(100, systemTelemetry.cpuUsagePct || 0))}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--text-secondary)]">SYSTEM RAM</span>
                <span className="font-bold text-emerald-400">
                  {systemTelemetry.ramUsedGb !== null && systemTelemetry.ramTotalGb !== null
                    ? `${systemTelemetry.ramUsedGb} / ${systemTelemetry.ramTotalGb} GB (${systemTelemetry.ramUsagePct}%)`
                    : 'N/A'}
                </span>
              </div>
              <div className="h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div 
                  className="h-full bg-emerald-400 transition-all duration-500" 
                  style={{ width: `${Math.max(0, Math.min(100, systemTelemetry.ramUsagePct || 0))}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between text-[11px] pt-1 border-t border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">APP PROCESS MEMORY</span>
              <span className="font-bold text-[var(--accent-primary)]">
                {systemTelemetry.appMemoryMb !== null ? `${systemTelemetry.appMemoryMb} MB` : 'N/A'}
              </span>
            </div>
          </div>

          {/* GPU Hardware Telemetry */}
          <div className="space-y-2.5 bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border-subtle)]">
            {systemTelemetry.gpuAvailable ? (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[var(--text-secondary)] truncate font-bold" title={systemTelemetry.gpuName || 'GPU'}>
                      {systemTelemetry.gpuName || 'GPU'}
                    </span>
                    <span className="font-bold text-purple-400">
                      {systemTelemetry.gpuUsagePct !== null ? `${systemTelemetry.gpuUsagePct}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                    <div 
                      className="h-full bg-purple-400 transition-all duration-500" 
                      style={{ width: `${Math.max(0, Math.min(100, systemTelemetry.gpuUsagePct || 0))}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[var(--text-secondary)]">GPU VRAM</span>
                    <span className="font-bold text-amber-400">
                      {systemTelemetry.vramUsedGb !== null && systemTelemetry.vramTotalGb !== null
                        ? `${systemTelemetry.vramUsedGb} / ${systemTelemetry.vramTotalGb} GB`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                    <div 
                      className="h-full bg-amber-400 transition-all duration-500" 
                      style={{ 
                        width: systemTelemetry.vramUsedGb && systemTelemetry.vramTotalGb 
                          ? `${Math.max(0, Math.min(100, (systemTelemetry.vramUsedGb / systemTelemetry.vramTotalGb) * 100))}%`
                          : '0%' 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] pt-1 border-t border-[var(--border-subtle)]">
                  <span className="text-[var(--text-secondary)]">GPU TEMPERATURE</span>
                  <span className="font-bold text-rose-400">
                    {systemTelemetry.gpuTempC !== null ? `${systemTelemetry.gpuTempC} °C` : 'N/A'}
                  </span>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-3 text-center space-y-1 text-[var(--text-secondary)]">
                <HardDrive className="w-5 h-5 text-slate-500 opacity-60" />
                <div className="font-bold text-xs text-slate-400">GPU telemetry unavailable</div>
                <div className="text-[10px] text-slate-500">No active NVIDIA GPU or nvidia-smi API detected</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 8. COMPLETED PROCESSING STATISTICS (RETAINED ON COMPLETION) */}
      {completedJobStats && (
        <div className="bg-[var(--bg-surface)] border border-emerald-800/40 rounded-lg p-3.5 space-y-2.5 shadow-sm font-mono text-xs">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300 uppercase border-b border-emerald-900/40 pb-2">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Last Job Final Statistics</span>
            </span>
            <span className="text-[10px] text-emerald-400/80 font-normal">
              Completed at: {completedJobStats.completedAt}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px]">
            <div className="p-2 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
              <div className="text-[var(--text-secondary)] text-[10px]">Total Time</div>
              <div className="font-bold text-[var(--text-primary)]">
                {formatTimeMs(completedJobStats.totalProcessingTimeMs)}
              </div>
            </div>

            <div className="p-2 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
              <div className="text-[var(--text-secondary)] text-[10px]">Average FPS</div>
              <div className="font-bold text-[var(--text-primary)]">
                {completedJobStats.averageFps !== null ? `${completedJobStats.averageFps} FPS` : 'N/A'}
              </div>
            </div>

            <div className="p-2 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
              <div className="text-[var(--text-secondary)] text-[10px]">Frames Processed</div>
              <div className="font-bold text-[var(--text-primary)]">
                {completedJobStats.framesProcessed.toLocaleString()}
              </div>
            </div>

            <div className="p-2 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
              <div className="text-[var(--text-secondary)] text-[10px]">Detections</div>
              <div className="font-bold text-[var(--text-primary)]">
                {completedJobStats.detections.toLocaleString()}
              </div>
            </div>

            <div className="p-2 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
              <div className="text-[var(--text-secondary)] text-[10px]">Input Size</div>
              <div className="font-bold text-[var(--text-primary)]">
                {completedJobStats.inputSizeBytes ? `${(completedJobStats.inputSizeBytes / 1024).toFixed(1)} KB` : 'N/A'}
              </div>
            </div>

            <div className="p-2 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)]">
              <div className="text-[var(--text-secondary)] text-[10px]">Output Size</div>
              <div className="font-bold text-emerald-400">
                {completedJobStats.outputSizeBytes ? `${(completedJobStats.outputSizeBytes / 1024).toFixed(1)} KB` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. REAL-TIME PIPELINE EVENT AUDIT STREAM */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3.5 space-y-2.5 shadow-sm font-mono text-xs">
        <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] uppercase border-b border-[var(--border-subtle)] pb-2">
          <span className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Pipeline Event Audit Trail ({eventsHistory.length})</span>
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] font-normal">Real-Time Event Stream</span>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
          {eventsHistory.length === 0 ? (
            <div className="text-[11px] text-[var(--text-secondary)] italic text-center py-3">
              No pipeline telemetry events recorded yet. Start a job to view live events.
            </div>
          ) : (
            eventsHistory.map((evt) => (
              <div 
                key={evt.id}
                className="p-2 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] flex items-start justify-between gap-2 text-[11px] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                      evt.type === 'PROCESS_STARTED' ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                      evt.type === 'PROCESS_COMPLETED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      evt.type === 'PROCESS_FAILED' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      evt.type === 'PROCESS_CANCELLED' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {evt.type}
                    </span>
                    <span className="font-bold text-[var(--text-primary)] truncate">{evt.stage}</span>
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] truncate">
                    File: {evt.fileName} | Model: {evt.model || 'N/A'} | Progress: {evt.progress >= 0 ? `${evt.progress}%` : 'N/A'}
                  </div>
                  {evt.error && (
                    <div className="text-[10px] text-rose-400 font-bold">Error: {evt.error}</div>
                  )}
                </div>

                <div className="text-right flex-shrink-0 text-[10px] text-[var(--text-tertiary)]">
                  <div>{evt.timestamp}</div>
                  {evt.fps !== null && <div className="text-amber-400">{evt.fps} FPS</div>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
