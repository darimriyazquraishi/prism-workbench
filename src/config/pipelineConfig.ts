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
  initialModel: '',
  generalReasoningModel: '',
  validatorModel: '',
  confidenceThreshold: 0.75,
  maxRoutingAttempts: 2,
  validationEnabled: true,
  developerLogsEnabled: true
};

export function updateDefaultPipelineModels(generalModel: string, validatorModel?: string) {
  if (generalModel) {
    defaultPipelineConfig.initialModel = generalModel;
    defaultPipelineConfig.generalReasoningModel = generalModel;
    defaultPipelineConfig.validatorModel = validatorModel || generalModel;
  }
}
