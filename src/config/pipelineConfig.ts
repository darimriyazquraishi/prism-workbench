export interface PipelineConfig {
  initialModel: string;
  generalReasoningModel: string;
  validatorModel: string;
  confidenceThreshold: number;
  maxRoutingAttempts: number;
  validationEnabled: boolean;
  developerLogsEnabled: boolean;
}

export const defaultPipelineConfig: PipelineConfig = {
  initialModel: 'qwen3:8b',
  generalReasoningModel: 'qwen3:14b',
  validatorModel: 'qwen3:8b',
  confidenceThreshold: 0.75,
  maxRoutingAttempts: 2,
  validationEnabled: true,
  developerLogsEnabled: true
};
