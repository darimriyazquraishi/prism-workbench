import { create } from 'zustand';

export type PipelineStatus = 'IDLE' | 'LOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type TelemetryEventType =
  | 'PROCESS_STARTED'
  | 'PROCESS_STAGE_CHANGED'
  | 'FRAME_STARTED'
  | 'FRAME_COMPLETED'
  | 'INFERENCE_STARTED'
  | 'INFERENCE_COMPLETED'
  | 'ENHANCEMENT_STARTED'
  | 'ENHANCEMENT_COMPLETED'
  | 'PROCESS_COMPLETED'
  | 'PROCESS_FAILED'
  | 'PROCESS_CANCELLED';

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  jobId: string;
  fileName: string;
  stage: string;
  type: TelemetryEventType;
  currentFrame: number;
  totalFrames: number;
  progress: number;
  processingTimeMs: number;
  fps: number | null;
  etaSeconds: number | null;
  model: string | null;
  resolution: string | null;
  detections: number | null;
  error?: string | null;
  details?: string;
}

export interface CurrentOperation {
  jobId: string | null;
  fileName: string | null;
  stage: string | null;
  currentFrame: number;
  totalFrames: number;
  progress: number; // 0 to 100, or -1 for indeterminate
}

export interface PerformanceMetrics {
  processingFps: number | null;
  averageFps: number | null;
  processingTimeMs: number;
  elapsedTimeMs: number;
  estimatedRemainingSeconds: number | null; // null => "Calculating..."
  queueSize: number;
  completedJobsCount: number;
}

export interface VideoTelemetry {
  currentFrame: number | null;
  totalFrames: number | null;
  sourceFps: number | null;
  outputFps: number | null;
  durationSeconds: number | null;
  currentTimestamp: string | null;
  resolution: string | null;
  codec: string | null;
}

export interface ImageTelemetry {
  inputResolution: string | null;
  outputResolution: string | null;
  scaleFactor: string | null;
  processingTimeMs: number | null;
  currentStage: string | null;
}

export interface AiTelemetry {
  activeModel: string | null;
  modelLoadingStatus: string | null;
  inferenceTimeMs: number | null;
  modelLatenciesMs?: Record<string, number>;
  detectionsCount: number | null;
  confidence: number | null;
  yoloFps: number | null;
  esrganStatus: string | null;
  esrganTimeMs: number | null;
}

export interface SystemHardwareTelemetry {
  cpuUsagePct: number | null;
  ramUsedGb: number | null;
  ramTotalGb: number | null;
  ramUsagePct: number | null;
  appMemoryMb: number | null;
  gpuAvailable: boolean;
  gpuName: string | null;
  gpuUsagePct: number | null;
  vramUsedGb: number | null;
  vramTotalGb: number | null;
  gpuTempC: number | null;
  lastUpdated: string | null;
}

export interface CompletedJobStats {
  jobId: string;
  fileName: string;
  totalProcessingTimeMs: number;
  averageFps: number | null;
  framesProcessed: number;
  detections: number;
  inputSizeBytes: number | null;
  outputSizeBytes: number | null;
  completedAt: string;
}

export interface FailureState {
  jobId: string;
  stage: string;
  error: string;
  elapsedTimeMs: number;
  failedAt: string;
}

// -------------------------------------------------------------
// Live Pipeline Execution State Models (Single Execution Model)
// -------------------------------------------------------------
export interface PipelineStageItem {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  details?: string;
  startTime?: number;
  endTime?: number;
}

export interface PipelineToolItem {
  id: string;
  name: string;
  toolName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input?: string;
  output?: string;
  durationMs?: number;
}

export interface PipelineRetrievalState {
  status: 'not_required' | 'running' | 'completed' | 'failed';
  query?: string;
  chunksRetrieved: number;
  chunks?: { title: string; snippet: string }[];
}

export interface PipelineValidationState {
  status: 'pending' | 'running' | 'passed' | 'failed' | 'reevaluating' | 'low_confidence';
  confidence: number | null;
  initialConfidence?: number | null;
  reevaluationConfidence?: number | null;
  evaluationCount?: number;
  maxEvaluations?: number;
  ungroundedClaims?: string[];
  reason?: string;
  validatorModel?: string;
}

export interface PipelineRoutingState {
  initialModel: string;
  decision: 'return_initial' | 'reevaluate' | 'return_after_reevaluation' | 'return_low_confidence' | 'route_to_general_reasoning' | null;
  targetModel?: string;
  reason?: string;
}

export interface PipelineExecutionState {
  requestId: string;
  prompt: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentStage: string;
  stages: PipelineStageItem[];
  activeModel: string;
  modelsUsed: string[];
  retrieval: PipelineRetrievalState;
  tools: PipelineToolItem[];
  validation: PipelineValidationState | null;
  routing: PipelineRoutingState | null;
  startedAt: string;
  completedAt?: string;
  elapsedTimeMs: number;
  error?: string;
  outputDeliverable?: { name: string; type: string; sizeKb: number };
}

export interface TelemetryStoreState {
  status: PipelineStatus;
  currentOperation: CurrentOperation;
  performance: PerformanceMetrics;
  videoTelemetry: VideoTelemetry;
  imageTelemetry: ImageTelemetry;
  aiTelemetry: AiTelemetry;
  systemTelemetry: SystemHardwareTelemetry;
  completedJobStats: CompletedJobStats | null;
  failureState: FailureState | null;
  eventsHistory: TelemetryEvent[];

  // Real-time Single Request Pipeline Execution
  currentExecution: PipelineExecutionState | null;

  // Time & FPS tracking internal state
  jobStartTime: number | null;
  frameTimestamps: number[];

  // Actions
  startJob: (payload: { jobId: string; fileName: string; totalFrames?: number; stage?: string; model?: string; resolution?: string }) => void;
  updateStage: (stage: string, model?: string) => void;
  recordFrame: (payload: { currentFrame: number; totalFrames?: number; detections?: number; resolution?: string }) => void;
  recordInference: (payload: { model: string; inferenceTimeMs: number; detections?: number; confidence?: number; yoloFps?: number }) => void;
  recordEnhancement: (payload: { status: string; enhancementTimeMs: number; inputRes?: string; outputRes?: string; scale?: string }) => void;
  completeJob: (payload?: { inputSizeBytes?: number; outputSizeBytes?: number }) => void;
  failJob: (error: string, stage?: string) => void;
  cancelJob: () => void;
  resetTelemetry: () => void;
  fetchSystemMetrics: () => Promise<void>;
  emitRawEvent: (event: Omit<TelemetryEvent, 'id' | 'timestamp'>) => void;

  // Live Single-Request Telemetry Pipeline Methods
  resetExecutionState: (requestId: string, prompt: string, initialModel: string) => void;
  updateExecutionStage: (requestId: string, stageId: string, stageName: string, status: 'running' | 'completed' | 'failed', details?: string) => void;
  updateExecutionRetrieval: (requestId: string, retrievalState: Partial<PipelineRetrievalState>) => void;
  updateExecutionTool: (requestId: string, toolId: string, toolName: string, status: 'running' | 'completed' | 'failed', output?: string, durationMs?: number) => void;
  updateExecutionValidationAndRouting: (requestId: string, validation: PipelineValidationState, routing?: PipelineRoutingState, activeModel?: string) => void;
  completeCurrentExecution: (requestId: string, deliverable?: { name: string; type: string; sizeKb: number }) => void;
  failCurrentExecution: (requestId: string, error: string, stageName?: string) => void;
}

const initialOperation: CurrentOperation = {
  jobId: null,
  fileName: null,
  stage: null,
  currentFrame: 0,
  totalFrames: 0,
  progress: 0
};

const initialPerformance: PerformanceMetrics = {
  processingFps: null,
  averageFps: null,
  processingTimeMs: 0,
  elapsedTimeMs: 0,
  estimatedRemainingSeconds: null,
  queueSize: 0,
  completedJobsCount: 0
};

const initialVideo: VideoTelemetry = {
  currentFrame: null,
  totalFrames: null,
  sourceFps: null,
  outputFps: null,
  durationSeconds: null,
  currentTimestamp: null,
  resolution: null,
  codec: null
};

const initialImage: ImageTelemetry = {
  inputResolution: null,
  outputResolution: null,
  scaleFactor: null,
  processingTimeMs: null,
  currentStage: null
};

const initialAi: AiTelemetry = {
  activeModel: null,
  modelLoadingStatus: 'IDLE',
  inferenceTimeMs: null,
  modelLatenciesMs: {},
  detectionsCount: null,
  confidence: null,
  yoloFps: null,
  esrganStatus: 'IDLE',
  esrganTimeMs: null
};

const initialSystem: SystemHardwareTelemetry = {
  cpuUsagePct: null,
  ramUsedGb: null,
  ramTotalGb: null,
  ramUsagePct: null,
  appMemoryMb: null,
  gpuAvailable: false,
  gpuName: null,
  gpuUsagePct: null,
  vramUsedGb: null,
  vramTotalGb: null,
  gpuTempC: null,
  lastUpdated: null
};

export const useTelemetryStore = create<TelemetryStoreState>((set, get) => ({
  status: 'IDLE',
  currentOperation: initialOperation,
  performance: initialPerformance,
  videoTelemetry: initialVideo,
  imageTelemetry: initialImage,
  aiTelemetry: initialAi,
  systemTelemetry: initialSystem,
  completedJobStats: null,
  failureState: null,
  eventsHistory: [],
  currentExecution: null,

  jobStartTime: null,
  frameTimestamps: [],

  // Live Single-Request Telemetry Pipeline Methods
  resetExecutionState: (requestId, prompt, initialModel) => {
    const timestampStr = new Date().toLocaleTimeString();
    const initialStage: PipelineStageItem = {
      id: 'prompt_received',
      name: 'Prompt received',
      status: 'completed',
      startTime: Date.now(),
      endTime: Date.now()
    };

    set({
      currentExecution: {
        requestId,
        prompt,
        status: 'running',
        currentStage: 'Prompt received',
        stages: [initialStage],
        activeModel: initialModel,
        modelsUsed: [initialModel],
        retrieval: {
          status: 'running',
          chunksRetrieved: 0
        },
        tools: [],
        validation: null,
        routing: null,
        startedAt: timestampStr,
        elapsedTimeMs: 0
      }
    });

    // Also start job in legacy telemetry container for backwards compatibility
    get().startJob({
      jobId: requestId,
      fileName: prompt.slice(0, 30) + '...',
      stage: 'Prompt received',
      model: initialModel
    });
  },

  updateExecutionStage: (requestId, stageId, stageName, status, details) => {
    set((s) => {
      if (!s.currentExecution || s.currentExecution.requestId !== requestId) return {};
      const now = Date.now();
      const existingStageIndex = s.currentExecution.stages.findIndex((st) => st.id === stageId);
      let updatedStages = [...s.currentExecution.stages];

      if (existingStageIndex >= 0) {
        updatedStages[existingStageIndex] = {
          ...updatedStages[existingStageIndex],
          status,
          details: details || updatedStages[existingStageIndex].details,
          endTime: status === 'completed' || status === 'failed' ? now : undefined
        };
      } else {
        updatedStages.push({
          id: stageId,
          name: stageName,
          status,
          details,
          startTime: now,
          endTime: status === 'completed' || status === 'failed' ? now : undefined
        });
      }

      return {
        currentExecution: {
          ...s.currentExecution,
          currentStage: stageName,
          stages: updatedStages
        }
      };
    });

    // Sync legacy stage update
    get().updateStage(stageName);
  },

  updateExecutionRetrieval: (requestId, retrievalState) => {
    set((s) => {
      if (!s.currentExecution || s.currentExecution.requestId !== requestId) return {};
      return {
        currentExecution: {
          ...s.currentExecution,
          retrieval: {
            ...s.currentExecution.retrieval,
            ...retrievalState
          }
        }
      };
    });
  },

  updateExecutionTool: (requestId, toolId, toolName, status, output, durationMs) => {
    set((s) => {
      if (!s.currentExecution || s.currentExecution.requestId !== requestId) return {};
      const existingIndex = s.currentExecution.tools.findIndex((t) => t.id === toolId);
      let updatedTools = [...s.currentExecution.tools];

      if (existingIndex >= 0) {
        updatedTools[existingIndex] = {
          ...updatedTools[existingIndex],
          status,
          output: output || updatedTools[existingIndex].output,
          durationMs: durationMs || updatedTools[existingIndex].durationMs
        };
      } else {
        updatedTools.push({
          id: toolId,
          name: toolName,
          toolName,
          status,
          output,
          durationMs
        });
      }

      return {
        currentExecution: {
          ...s.currentExecution,
          tools: updatedTools
        }
      };
    });
  },

  updateExecutionValidationAndRouting: (requestId, validation, routing, activeModel) => {
    set((s) => {
      if (!s.currentExecution || s.currentExecution.requestId !== requestId) return {};
      const modelsUsed = [...s.currentExecution.modelsUsed];
      if (activeModel && !modelsUsed.includes(activeModel)) {
        modelsUsed.push(activeModel);
      }

      return {
        currentExecution: {
          ...s.currentExecution,
          activeModel: activeModel || s.currentExecution.activeModel,
          modelsUsed,
          validation: {
            ...(s.currentExecution.validation || {}),
            ...validation
          },
          routing: routing ? {
            ...(s.currentExecution.routing || {}),
            ...routing
          } : s.currentExecution.routing
        }
      };
    });

    if (validation.confidence !== null && validation.confidence !== undefined) {
      get().recordInference({
        model: activeModel || get().aiTelemetry.activeModel || 'qwen3:8b',
        inferenceTimeMs: 400,
        confidence: validation.confidence
      });
    }
  },

  completeCurrentExecution: (requestId, deliverable) => {
    set((s) => {
      if (!s.currentExecution || s.currentExecution.requestId !== requestId) return {};
      const timestampStr = new Date().toLocaleTimeString();
      return {
        currentExecution: {
          ...s.currentExecution,
          status: 'completed',
          currentStage: 'Completed',
          completedAt: timestampStr,
          outputDeliverable: deliverable || s.currentExecution.outputDeliverable
        }
      };
    });
    get().completeJob();
  },

  failCurrentExecution: (requestId, error, stageName = 'Execution') => {
    set((s) => {
      if (!s.currentExecution || s.currentExecution.requestId !== requestId) return {};
      return {
        currentExecution: {
          ...s.currentExecution,
          status: 'failed',
          currentStage: `Failed: ${stageName}`,
          error
        }
      };
    });
    get().failJob(error, stageName);
  },

  startJob: ({ jobId, fileName, totalFrames = 0, stage = 'Initializing Job', model, resolution }) => {
    const now = Date.now();
    const timestampStr = new Date().toLocaleTimeString();

    const startEvent: TelemetryEvent = {
      id: `evt-${now}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timestampStr,
      jobId,
      fileName,
      stage,
      type: 'PROCESS_STARTED',
      currentFrame: 0,
      totalFrames,
      progress: 0,
      processingTimeMs: 0,
      fps: null,
      etaSeconds: null,
      model: model || null,
      resolution: resolution || null,
      detections: 0
    };

    set((state) => ({
      status: 'PROCESSING',
      jobStartTime: now,
      frameTimestamps: [],
      failureState: null,
      currentOperation: {
        jobId,
        fileName,
        stage,
        currentFrame: 0,
        totalFrames,
        progress: 0
      },
      performance: {
        ...state.performance,
        processingFps: null,
        averageFps: null,
        processingTimeMs: 0,
        elapsedTimeMs: 0,
        estimatedRemainingSeconds: null
      },
      videoTelemetry: {
        ...initialVideo,
        totalFrames: totalFrames > 0 ? totalFrames : null,
        resolution: resolution || null
      },
      aiTelemetry: {
        ...initialAi,
        activeModel: model || state.aiTelemetry.activeModel,
        modelLoadingStatus: 'READY'
      },
      eventsHistory: [startEvent, ...state.eventsHistory].slice(0, 100)
    }));
  },

  updateStage: (stage, model) => {
    const state = get();
    if (state.status !== 'PROCESSING') return;

    const now = Date.now();
    const elapsed = state.jobStartTime ? now - state.jobStartTime : 0;
    const timestampStr = new Date().toLocaleTimeString();

    const stageEvent: TelemetryEvent = {
      id: `evt-${now}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timestampStr,
      jobId: state.currentOperation.jobId || 'job-0',
      fileName: state.currentOperation.fileName || 'N/A',
      stage,
      type: 'PROCESS_STAGE_CHANGED',
      currentFrame: state.currentOperation.currentFrame,
      totalFrames: state.currentOperation.totalFrames,
      progress: state.currentOperation.progress,
      processingTimeMs: elapsed,
      fps: state.performance.processingFps,
      etaSeconds: state.performance.estimatedRemainingSeconds,
      model: model || state.aiTelemetry.activeModel,
      resolution: state.videoTelemetry.resolution,
      detections: state.aiTelemetry.detectionsCount
    };

    set((s) => ({
      currentOperation: {
        ...s.currentOperation,
        stage
      },
      aiTelemetry: {
        ...s.aiTelemetry,
        activeModel: model || s.aiTelemetry.activeModel
      },
      imageTelemetry: {
        ...s.imageTelemetry,
        currentStage: stage
      },
      eventsHistory: [stageEvent, ...s.eventsHistory].slice(0, 100)
    }));
  },

  recordFrame: ({ currentFrame, totalFrames, detections, resolution }) => {
    const state = get();
    if (state.status !== 'PROCESSING') return;

    const now = Date.now();
    const startTime = state.jobStartTime || now;
    const elapsedMs = now - startTime;
    const elapsedSec = elapsedMs / 1000;

    const newTimestamps = [...state.frameTimestamps, now].slice(-30);
    const totFrames = totalFrames ?? state.currentOperation.totalFrames;

    // Calculate rolling FPS over last 30 frames
    let rollingFps: number | null = null;
    if (newTimestamps.length > 1) {
      const windowTimeSec = (newTimestamps[newTimestamps.length - 1] - newTimestamps[0]) / 1000;
      if (windowTimeSec > 0) {
        rollingFps = Math.round(((newTimestamps.length - 1) / windowTimeSec) * 10) / 10;
      }
    } else if (elapsedSec > 0 && currentFrame > 0) {
      rollingFps = Math.round((currentFrame / elapsedSec) * 10) / 10;
    }

    // Average FPS
    const avgFps = elapsedSec > 0 && currentFrame > 0 ? Math.round((currentFrame / elapsedSec) * 10) / 10 : null;

    // Progress
    const progress = totFrames > 0 ? Math.min(100, Math.round((currentFrame / totFrames) * 1000) / 10) : -1;

    // ETA calculation: remainingWork / rollingFPS
    let etaSeconds: number | null = null;
    if (totFrames > 0 && currentFrame < totFrames && rollingFps && rollingFps > 0) {
      const remainingFrames = totFrames - currentFrame;
      etaSeconds = Math.round(remainingFrames / rollingFps);
    }

    const timestampStr = new Date().toLocaleTimeString();
    const frameEvent: TelemetryEvent = {
      id: `evt-${now}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timestampStr,
      jobId: state.currentOperation.jobId || 'job-0',
      fileName: state.currentOperation.fileName || 'N/A',
      stage: state.currentOperation.stage || 'Processing Frames',
      type: 'FRAME_COMPLETED',
      currentFrame,
      totalFrames: totFrames,
      progress,
      processingTimeMs: elapsedMs,
      fps: rollingFps,
      etaSeconds,
      model: state.aiTelemetry.activeModel,
      resolution: resolution || state.videoTelemetry.resolution,
      detections: detections ?? state.aiTelemetry.detectionsCount
    };

    set((s) => ({
      frameTimestamps: newTimestamps,
      currentOperation: {
        ...s.currentOperation,
        currentFrame,
        totalFrames: totFrames,
        progress
      },
      performance: {
        ...s.performance,
        processingFps: rollingFps,
        averageFps: avgFps,
        elapsedTimeMs: elapsedMs,
        estimatedRemainingSeconds: etaSeconds
      },
      videoTelemetry: {
        ...s.videoTelemetry,
        currentFrame,
        totalFrames: totFrames > 0 ? totFrames : s.videoTelemetry.totalFrames,
        resolution: resolution || s.videoTelemetry.resolution
      },
      aiTelemetry: {
        ...s.aiTelemetry,
        detectionsCount: detections !== undefined ? (s.aiTelemetry.detectionsCount || 0) + detections : s.aiTelemetry.detectionsCount
      },
      eventsHistory: [frameEvent, ...s.eventsHistory].slice(0, 100)
    }));
  },

  recordInference: ({ model, inferenceTimeMs, detections, confidence, yoloFps }) => {
    const state = get();
    const now = Date.now();
    const timestampStr = new Date().toLocaleTimeString();

    const infEvent: TelemetryEvent = {
      id: `evt-${now}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timestampStr,
      jobId: state.currentOperation.jobId || 'job-0',
      fileName: state.currentOperation.fileName || 'N/A',
      stage: 'AI Inference',
      type: 'INFERENCE_COMPLETED',
      currentFrame: state.currentOperation.currentFrame,
      totalFrames: state.currentOperation.totalFrames,
      progress: state.currentOperation.progress,
      processingTimeMs: inferenceTimeMs,
      fps: yoloFps || state.performance.processingFps,
      etaSeconds: state.performance.estimatedRemainingSeconds,
      model,
      resolution: state.videoTelemetry.resolution,
      detections: detections ?? null
    };

    set((s) => ({
      aiTelemetry: {
        ...s.aiTelemetry,
        activeModel: model,
        inferenceTimeMs,
        modelLatenciesMs: {
          ...(s.aiTelemetry.modelLatenciesMs || {}),
          [model]: inferenceTimeMs
        },
        detectionsCount: detections !== undefined ? (s.aiTelemetry.detectionsCount || 0) + detections : s.aiTelemetry.detectionsCount,
        confidence: confidence !== undefined ? confidence : s.aiTelemetry.confidence,
        yoloFps: yoloFps !== undefined ? yoloFps : s.aiTelemetry.yoloFps
      },
      eventsHistory: [infEvent, ...s.eventsHistory].slice(0, 100)
    }));
  },

  recordEnhancement: ({ status, enhancementTimeMs, inputRes, outputRes, scale }) => {
    set((s) => ({
      aiTelemetry: {
        ...s.aiTelemetry,
        esrganStatus: status,
        esrganTimeMs: enhancementTimeMs
      },
      imageTelemetry: {
        ...s.imageTelemetry,
        inputResolution: inputRes || s.imageTelemetry.inputResolution,
        outputResolution: outputRes || s.imageTelemetry.outputResolution,
        scaleFactor: scale || s.imageTelemetry.scaleFactor,
        processingTimeMs: enhancementTimeMs
      }
    }));
  },

  completeJob: (payload) => {
    const state = get();
    const now = Date.now();
    const elapsedMs = state.jobStartTime ? now - state.jobStartTime : state.performance.elapsedTimeMs;
    const timestampStr = new Date().toLocaleTimeString();

    const framesProcessed = state.currentOperation.currentFrame || 1;
    const elapsedSec = elapsedMs / 1000;
    const avgFps = elapsedSec > 0 ? Math.round((framesProcessed / elapsedSec) * 10) / 10 : null;

    const completedStats: CompletedJobStats = {
      jobId: state.currentOperation.jobId || `job-${now}`,
      fileName: state.currentOperation.fileName || 'N/A',
      totalProcessingTimeMs: elapsedMs,
      averageFps: avgFps,
      framesProcessed,
      detections: state.aiTelemetry.detectionsCount || 0,
      inputSizeBytes: payload?.inputSizeBytes || null,
      outputSizeBytes: payload?.outputSizeBytes || null,
      completedAt: timestampStr
    };

    const compEvent: TelemetryEvent = {
      id: `evt-${now}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timestampStr,
      jobId: completedStats.jobId,
      fileName: completedStats.fileName,
      stage: 'Completed',
      type: 'PROCESS_COMPLETED',
      currentFrame: framesProcessed,
      totalFrames: state.currentOperation.totalFrames,
      progress: 100,
      processingTimeMs: elapsedMs,
      fps: avgFps,
      etaSeconds: 0,
      model: state.aiTelemetry.activeModel,
      resolution: state.videoTelemetry.resolution,
      detections: completedStats.detections
    };

    set((s) => ({
      status: 'COMPLETED',
      completedJobStats: completedStats,
      currentOperation: {
        ...s.currentOperation,
        progress: 100,
        stage: 'Completed'
      },
      performance: {
        ...s.performance,
        averageFps: avgFps,
        elapsedTimeMs: elapsedMs,
        estimatedRemainingSeconds: 0,
        completedJobsCount: s.performance.completedJobsCount + 1
      },
      eventsHistory: [compEvent, ...s.eventsHistory].slice(0, 100)
    }));
  },

  failJob: (error, stage = 'Execution') => {
    const state = get();
    const now = Date.now();
    const elapsedMs = state.jobStartTime ? now - state.jobStartTime : state.performance.elapsedTimeMs;
    const timestampStr = new Date().toLocaleTimeString();

    const failure: FailureState = {
      jobId: state.currentOperation.jobId || `job-${now}`,
      stage,
      error,
      elapsedTimeMs: elapsedMs,
      failedAt: timestampStr
    };

    const failEvent: TelemetryEvent = {
      id: `evt-${now}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timestampStr,
      jobId: failure.jobId,
      fileName: state.currentOperation.fileName || 'N/A',
      stage,
      type: 'PROCESS_FAILED',
      currentFrame: state.currentOperation.currentFrame,
      totalFrames: state.currentOperation.totalFrames,
      progress: state.currentOperation.progress,
      processingTimeMs: elapsedMs,
      fps: null,
      etaSeconds: null,
      model: state.aiTelemetry.activeModel,
      resolution: state.videoTelemetry.resolution,
      detections: state.aiTelemetry.detectionsCount,
      error
    };

    set((s) => ({
      status: 'FAILED',
      failureState: failure,
      currentOperation: {
        ...s.currentOperation,
        stage: `Failed: ${stage}`
      },
      performance: {
        ...s.performance,
        estimatedRemainingSeconds: null
      },
      eventsHistory: [failEvent, ...s.eventsHistory].slice(0, 100)
    }));
  },

  cancelJob: () => {
    const state = get();
    const now = Date.now();
    const elapsedMs = state.jobStartTime ? now - state.jobStartTime : state.performance.elapsedTimeMs;
    const timestampStr = new Date().toLocaleTimeString();

    const cancelEvent: TelemetryEvent = {
      id: `evt-${now}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timestampStr,
      jobId: state.currentOperation.jobId || `job-${now}`,
      fileName: state.currentOperation.fileName || 'N/A',
      stage: 'Cancelled by User',
      type: 'PROCESS_CANCELLED',
      currentFrame: state.currentOperation.currentFrame,
      totalFrames: state.currentOperation.totalFrames,
      progress: state.currentOperation.progress,
      processingTimeMs: elapsedMs,
      fps: null,
      etaSeconds: null,
      model: state.aiTelemetry.activeModel,
      resolution: state.videoTelemetry.resolution,
      detections: state.aiTelemetry.detectionsCount
    };

    set((s) => ({
      status: 'CANCELLED',
      currentOperation: {
        ...s.currentOperation,
        stage: 'Cancelled'
      },
      performance: {
        ...s.performance,
        estimatedRemainingSeconds: null
      },
      eventsHistory: [cancelEvent, ...s.eventsHistory].slice(0, 100)
    }));
  },

  resetTelemetry: () => {
    set({
      status: 'IDLE',
      currentOperation: initialOperation,
      performance: initialPerformance,
      videoTelemetry: initialVideo,
      imageTelemetry: initialImage,
      aiTelemetry: initialAi,
      completedJobStats: null,
      failureState: null,
      jobStartTime: null,
      frameTimestamps: [],
      currentExecution: null
    });
  },

  fetchSystemMetrics: async () => {
    try {
      const res = await fetch('/api/system/metrics', {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        set({
          systemTelemetry: {
            cpuUsagePct: data.cpuUsagePct ?? null,
            ramUsedGb: data.ramUsedGb ?? null,
            ramTotalGb: data.ramTotalGb ?? null,
            ramUsagePct: data.ramUsagePct ?? null,
            appMemoryMb: data.appMemoryMb ?? null,
            gpuAvailable: !!data.gpuAvailable,
            gpuName: data.gpuName ?? null,
            gpuUsagePct: data.gpuUsagePct ?? null,
            vramUsedGb: data.vramUsedGb ?? null,
            vramTotalGb: data.vramTotalGb ?? null,
            gpuTempC: data.gpuTempC ?? null,
            lastUpdated: new Date().toLocaleTimeString()
          }
        });
      }
    } catch {
      // Endpoint unreachable or offline
    }
  },

  emitRawEvent: (event) => {
    const now = Date.now();
    const timestampStr = new Date().toLocaleTimeString();
    const fullEvent: TelemetryEvent = {
      id: `evt-${now}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timestampStr,
      ...event
    };

    set((s) => ({
      eventsHistory: [fullEvent, ...s.eventsHistory].slice(0, 100)
    }));
  }
}));
