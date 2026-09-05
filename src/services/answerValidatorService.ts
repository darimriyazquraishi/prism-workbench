import { callLocalLlm, parseOrRepairJson } from './localLlmService';
import { defaultPipelineConfig, type PipelineConfig } from '../config/pipelineConfig';
import type { ValidationResult, ValidationAuditLog } from '../types/antigravity';
import { useTelemetryStore } from '../store/telemetryStore';

const VALIDATOR_SYSTEM_PROMPT = `You are an independent, highly analytical Evidence & Task Validator for an enterprise AI workbench.
Your job is to objectively evaluate a generated answer against the user's explicit prompt and the provided source material.

DO NOT trust self-reported statements or assume the generated answer is correct.
Assess the answer according to these strict rules:
1. Does the answer directly perform the requested task and format (e.g. summary, table, specific structure)?
2. Are all facts, numbers, dates, and claims supported by the supplied source context?
3. Does the answer introduce unrelated domain knowledge, boilerplate, or assumptions not present in the context?
4. Is the supplied source evidence sufficient to answer the request reliably?

Output ONLY valid JSON matching this schema:
{
  "grounded": boolean,
  "answers_question": boolean,
  "evidence_sufficient": boolean,
  "confidence": number, // 0.0 to 1.0
  "unsupported_claims": string[],
  "missing_information": string[],
  "contradictions": string[],
  "reason": "Detailed explanation of evaluation",
  "route": "RETURN" | "GENERAL_REASONING" | "INSUFFICIENT_EVIDENCE"
}`;

/**
 * Validates a generated response against user prompt and source material using an independent validator model call.
 */
export async function validateAnswerWithModel(
  userQuery: string,
  sourceContext: string,
  generatedAnswer: string,
  validatorModel: string = defaultPipelineConfig.validatorModel,
  threshold: number = defaultPipelineConfig.confidenceThreshold
): Promise<ValidationResult> {
  const prompt = `USER REQUEST:
${userQuery}

SUPPLIED SOURCE MATERIAL / CONTEXT:
${sourceContext || '(No external source material provided)'}

GENERATED ANSWER TO EVALUATE:
${generatedAnswer}

TASK: Evaluate the GENERATED ANSWER. Check if it directly answers the USER REQUEST using ONLY the SUPPLIED SOURCE MATERIAL. Compute an independent confidence score (0.0 to 1.0). Set "route" to "RETURN" if confidence >= ${threshold} AND grounded == true AND answers_question == true AND evidence_sufficient == true; otherwise set "route" to "GENERAL_REASONING".`;

  try {
    const valRes = await callLocalLlm({
      model: validatorModel,
      systemPrompt: VALIDATOR_SYSTEM_PROMPT,
      userPrompt: prompt,
      formatJson: true,
      temperature: 0.1
    });

    const parsed = await parseOrRepairJson<ValidationResult>(
      valRes.content,
      validatorModel,
      'ValidationResult JSON object'
    );

    // Fallback normalization
    const confidence = typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5;
    const isGrounded = Boolean(parsed.grounded);
    const answersQuestion = Boolean(parsed.answers_question);
    const evidenceSufficient = Boolean(parsed.evidence_sufficient);

    const passesThreshold =
      confidence >= threshold && isGrounded && answersQuestion && evidenceSufficient;

    return {
      grounded: isGrounded,
      answers_question: answersQuestion,
      evidence_sufficient: evidenceSufficient,
      confidence,
      unsupported_claims: Array.isArray(parsed.unsupported_claims) ? parsed.unsupported_claims : [],
      missing_information: Array.isArray(parsed.missing_information) ? parsed.missing_information : [],
      contradictions: Array.isArray(parsed.contradictions) ? parsed.contradictions : [],
      reason: parsed.reason || 'Validation completed.',
      route: passesThreshold ? 'RETURN' : (evidenceSufficient ? 'GENERAL_REASONING' : 'INSUFFICIENT_EVIDENCE')
    };
  } catch (err: any) {
    console.warn('Validator call failed or unparseable. Falling back to cautious validation failure.', err);
    return {
      grounded: false,
      answers_question: false,
      evidence_sufficient: false,
      confidence: 0.3,
      unsupported_claims: ['Validation service execution encountered error: ' + err.message],
      missing_information: [],
      contradictions: [],
      reason: 'Validator execution error. Routing to General Reasoning model.',
      route: 'GENERAL_REASONING'
    };
  }
}

export interface PipelineExecutionResult {
  finalAnswer: string;
  auditLog: ValidationAuditLog;
  groundedStatus: 'grounded' | 'routed' | 'insufficient';
}

/**
 * Full Answer Validation and Model-Routing Pipeline:
 * Specialized Model -> Evidence Validator -> Pass (Return) OR Fail (General Reasoning Model -> Final Validation -> Return / Insufficient Response)
 */
export async function executeValidationAndRoutingPipeline(
  userQuery: string,
  sourceContext: string,
  overrideConfig: Partial<PipelineConfig> = {},
  requestId?: string
): Promise<PipelineExecutionResult> {
  const cfg: PipelineConfig = { ...defaultPipelineConfig, ...overrideConfig };
  const logId = `val-log-${Date.now()}`;
  const timestamp = new Date().toLocaleTimeString();

  // If validation is explicitly disabled, run initial model and return directly
  if (!cfg.validationEnabled) {
    const initialRes = await callLocalLlm({
      model: cfg.initialModel,
      userPrompt: `Context:\n${sourceContext}\n\nUser Question:\n${userQuery}`
    });
    const mockValidation: ValidationResult = {
      grounded: true,
      answers_question: true,
      evidence_sufficient: true,
      confidence: 1.0,
      unsupported_claims: [],
      missing_information: [],
      contradictions: [],
      reason: 'Validation disabled in configuration.',
      route: 'RETURN'
    };
    return {
      finalAnswer: initialRes.content,
      groundedStatus: 'grounded',
      auditLog: {
        id: logId,
        timestamp,
        user_query: userQuery,
        retrieved_context: sourceContext,
        selected_initial_model: cfg.initialModel,
        initial_answer: initialRes.content,
        validation_confidence: 1.0,
        validation_result: mockValidation,
        unsupported_claims: [],
        missing_information: [],
        contradictions: [],
        routing_decision: 'ACCEPTED_INITIAL',
        final_answer: initialRes.content
      }
    };
  }

  const startTotal = performance.now();
  const hasSourceContext = Boolean(sourceContext && sourceContext.trim());

  // STEP 1: Execute Initial Specialized / Fast Model
  const initialPrompt = hasSourceContext
    ? `SUPPLIED SOURCE CONTEXT:\n${sourceContext}\n\nUSER REQUEST:\n${userQuery}\n\nAnswer the request based on the supplied source context:`
    : userQuery;

  const startInitialModel = performance.now();
  const initialRes = await callLocalLlm({
    model: cfg.initialModel,
    systemPrompt: hasSourceContext
      ? 'You are a precise, grounded assistant. Answer the user prompt using available evidence. Do not hallucinate or invent details.'
      : 'You are a helpful, concise assistant. Answer the user prompt directly.',
    userPrompt: initialPrompt,
    temperature: 0.2
  });
  const initialModelDuration = Math.round(performance.now() - startInitialModel);
  const initialAnswer = initialRes.content;

  // FAST PATH: If NO external source context was provided, evidence validation against source text is irrelevant.
  // Return initial answer immediately (1 LLM call) without invoking second validator model.
  if (!hasSourceContext) {
    const totalDuration = Math.round(performance.now() - startTotal);
    console.log(`[VALIDATION PIPELINE LATENCY] Request ID: ${requestId || logId}
  User Query: "${userQuery.slice(0, 50)}"
  Initial Model (${cfg.initialModel}): ${initialModelDuration} ms
  Evidence Validation: SKIPPED (No external source context to ground against)
  Total Pipeline Duration: ${totalDuration} ms`);

    if (requestId) {
      useTelemetryStore.getState().updateExecutionValidationAndRouting(
        requestId,
        {
          status: 'passed',
          confidence: 1.0,
          ungroundedClaims: [],
          reason: 'Direct Q&A — no external source context to validate against.',
          validatorModel: 'N/A (Skipped)'
        },
        {
          initialModel: cfg.initialModel,
          decision: 'return_initial',
          reason: 'Direct response generated (source validation skipped).'
        },
        cfg.initialModel
      );
    }

    const mockValidation: ValidationResult = {
      grounded: true,
      answers_question: true,
      evidence_sufficient: true,
      confidence: 1.0,
      unsupported_claims: [],
      missing_information: [],
      contradictions: [],
      reason: 'Direct response generated (source validation skipped).',
      route: 'RETURN'
    };

    return {
      finalAnswer: initialAnswer,
      groundedStatus: 'grounded',
      auditLog: {
        id: logId,
        timestamp,
        user_query: userQuery,
        retrieved_context: '',
        selected_initial_model: cfg.initialModel,
        initial_answer: initialAnswer,
        validation_confidence: 1.0,
        validation_result: mockValidation,
        unsupported_claims: [],
        missing_information: [],
        contradictions: [],
        routing_decision: 'ACCEPTED_INITIAL',
        final_answer: initialAnswer
      }
    };
  }  // HARD PROGRAMMATIC MAXIMUM FOR VALIDATION EVALUATIONS
  const MAX_VALIDATION_EVALUATIONS = 2;

  // STEP 2: Independent Evidence Validation #1 (When source context IS present)
  let evaluationCount = 1;
  const startValidation1 = performance.now();
  let initialValidation: ValidationResult;
  try {
    initialValidation = await validateAnswerWithModel(
      userQuery,
      sourceContext,
      initialAnswer,
      cfg.validatorModel,
      cfg.confidenceThreshold
    );
  } catch (err: any) {
    console.warn('Evaluation #1 model call or JSON parsing failed. Treating as failed evaluation 1.', err);
    initialValidation = {
      grounded: false,
      answers_question: false,
      evidence_sufficient: false,
      confidence: 0.3,
      unsupported_claims: ['Validation service error on pass 1: ' + err.message],
      missing_information: [],
      contradictions: [],
      reason: 'Validation #1 service error.',
      route: 'REEVALUATE'
    };
  }
  const validation1Duration = Math.round(performance.now() - startValidation1);

  const passesCheck1 =
    initialValidation.confidence >= cfg.confidenceThreshold &&
    initialValidation.grounded &&
    initialValidation.answers_question &&
    initialValidation.evidence_sufficient;

  // PASS PATH: Evaluation #1 passes threshold
  if (passesCheck1) {
    const totalDuration = Math.round(performance.now() - startTotal);
    console.log(`[VALIDATION PIPELINE LATENCY] Request ID: ${requestId || logId}
  User Query: "${userQuery.slice(0, 50)}"
  Initial Model (${cfg.initialModel}): ${initialModelDuration} ms
  Evidence Validation 1 (${cfg.validatorModel}): ${validation1Duration} ms (Confidence: ${initialValidation.confidence})
  Evaluations: 1 / ${MAX_VALIDATION_EVALUATIONS}
  Decision: ACCEPTED_INITIAL (return_initial)
  Total Pipeline Duration: ${totalDuration} ms`);

    if (requestId) {
      useTelemetryStore.getState().updateExecutionValidationAndRouting(
        requestId,
        {
          status: 'passed',
          confidence: initialValidation.confidence,
          initialConfidence: initialValidation.confidence,
          evaluationCount: 1,
          maxEvaluations: MAX_VALIDATION_EVALUATIONS,
          ungroundedClaims: initialValidation.unsupported_claims,
          reason: initialValidation.reason,
          validatorModel: cfg.validatorModel
        },
        {
          initialModel: cfg.initialModel,
          decision: 'return_initial',
          reason: `Passed evaluation 1/${MAX_VALIDATION_EVALUATIONS} with confidence ${initialValidation.confidence}`
        },
        cfg.initialModel
      );
    }

    return {
      finalAnswer: initialAnswer,
      groundedStatus: 'grounded',
      auditLog: {
        id: logId,
        timestamp,
        user_query: userQuery,
        retrieved_context: sourceContext,
        selected_initial_model: cfg.initialModel,
        initial_answer: initialAnswer,
        validation_confidence: initialValidation.confidence,
        initial_confidence: initialValidation.confidence,
        evaluation_count: 1,
        max_evaluations: MAX_VALIDATION_EVALUATIONS,
        validation_result: initialValidation,
        unsupported_claims: initialValidation.unsupported_claims,
        missing_information: initialValidation.missing_information,
        contradictions: initialValidation.contradictions,
        routing_decision: 'ACCEPTED_INITIAL',
        final_answer: initialAnswer
      }
    };
  }

  // FIRST EVALUATION FAILED -> PROCEED TO EXACTLY ONE RE-EVALUATION (Evaluation #2)
  evaluationCount = 2;
  console.info(`Validation 1 failed (Confidence: ${initialValidation.confidence} < ${cfg.confidenceThreshold}). Performing EXACTLY ONE re-evaluation (2/${MAX_VALIDATION_EVALUATIONS})...`);

  if (requestId) {
    useTelemetryStore.getState().updateExecutionValidationAndRouting(
      requestId,
      {
        status: 'reevaluating',
        confidence: initialValidation.confidence,
        initialConfidence: initialValidation.confidence,
        evaluationCount: 2,
        maxEvaluations: MAX_VALIDATION_EVALUATIONS,
        ungroundedClaims: initialValidation.unsupported_claims,
        reason: `Evaluation 1 failed (Confidence ${initialValidation.confidence} < ${cfg.confidenceThreshold}). Re-evaluating answer...`,
        validatorModel: cfg.validatorModel
      },
      {
        initialModel: cfg.initialModel,
        decision: 'reevaluate',
        reason: `Evaluation 1 below threshold. Performing 1 allowed re-evaluation pass.`
      },
      cfg.initialModel
    );
  }

  // Generate Re-evaluation Answer using Validation Feedback
  const reevalPrompt = `USER REQUEST:
${userQuery}

SUPPLIED SOURCE MATERIAL / CONTEXT:
${sourceContext}

INITIAL GENERATED ANSWER (REJECTED BY VALIDATOR):
${initialAnswer}

VALIDATION FEEDBACK (CONFIDENCE SCORE: ${initialValidation.confidence}):
- Reason: ${initialValidation.reason}
- Unsupported Claims: ${initialValidation.unsupported_claims.join('; ') || 'None'}
- Missing Information: ${initialValidation.missing_information.join('; ') || 'None'}
- Contradictions: ${initialValidation.contradictions.join('; ') || 'None'}

RE-EVALUATION INSTRUCTIONS:
Re-evaluate and refine the answer using the feedback above. Ground all claims strictly in the SUPPLIED SOURCE MATERIAL. Fix unsupported claims, missing information, or contradictions. Output a complete, refined final answer:`;

  let reevalAnswer = initialAnswer;
  try {
    const reevalGenRes = await callLocalLlm({
      model: cfg.initialModel,
      systemPrompt: 'You are a precise, grounded assistant performing re-evaluation. Revise the answer using validator feedback to ensure 100% adherence to source evidence.',
      userPrompt: reevalPrompt,
      temperature: 0.2
    });
    reevalAnswer = reevalGenRes.content;
  } catch (err: any) {
    console.warn('Re-evaluation answer generation encountered error, falling back to initial answer for validation #2:', err);
  }

  // EVALUATION #2 (Second and Final Validation Pass)
  const startValidation2 = performance.now();
  let reevalValidation: ValidationResult;
  try {
    reevalValidation = await validateAnswerWithModel(
      userQuery,
      sourceContext,
      reevalAnswer,
      cfg.validatorModel,
      cfg.confidenceThreshold
    );
  } catch (err: any) {
    console.warn('Evaluation #2 model call or JSON parsing failed. Treating as failed evaluation 2.', err);
    reevalValidation = {
      grounded: false,
      answers_question: false,
      evidence_sufficient: false,
      confidence: 0.3,
      unsupported_claims: ['Validation service error on pass 2: ' + err.message],
      missing_information: [],
      contradictions: [],
      reason: 'Validation #2 service error.',
      route: 'RETURN_LOW_CONFIDENCE'
    };
  }
  const validation2Duration = Math.round(performance.now() - startValidation2);

  const passesCheck2 =
    reevalValidation.confidence >= cfg.confidenceThreshold &&
    reevalValidation.grounded &&
    reevalValidation.answers_question &&
    reevalValidation.evidence_sufficient;

  // SECOND EVALUATION PASSES
  if (passesCheck2) {
    const totalDuration = Math.round(performance.now() - startTotal);
    console.log(`[VALIDATION PIPELINE LATENCY] Request ID: ${requestId || logId}
  User Query: "${userQuery.slice(0, 50)}"
  Initial Model (${cfg.initialModel}): ${initialModelDuration} ms
  Validation 1 (${cfg.validatorModel}): ${validation1Duration} ms (Confidence: ${initialValidation.confidence})
  Validation 2 (${cfg.validatorModel}): ${validation2Duration} ms (Confidence: ${reevalValidation.confidence})
  Evaluations: 2 / ${MAX_VALIDATION_EVALUATIONS}
  Decision: ACCEPTED_AFTER_REEVALUATION (return_after_reevaluation)
  Total Pipeline Duration: ${totalDuration} ms`);

    if (requestId) {
      useTelemetryStore.getState().updateExecutionValidationAndRouting(
        requestId,
        {
          status: 'passed',
          confidence: reevalValidation.confidence,
          initialConfidence: initialValidation.confidence,
          reevaluationConfidence: reevalValidation.confidence,
          evaluationCount: 2,
          maxEvaluations: MAX_VALIDATION_EVALUATIONS,
          ungroundedClaims: reevalValidation.unsupported_claims,
          reason: reevalValidation.reason,
          validatorModel: cfg.validatorModel
        },
        {
          initialModel: cfg.initialModel,
          decision: 'return_after_reevaluation',
          reason: `Passed re-evaluation (2/${MAX_VALIDATION_EVALUATIONS}) with confidence ${reevalValidation.confidence}`
        },
        cfg.initialModel
      );
    }

    return {
      finalAnswer: reevalAnswer,
      groundedStatus: 'grounded',
      auditLog: {
        id: logId,
        timestamp,
        user_query: userQuery,
        retrieved_context: sourceContext,
        selected_initial_model: cfg.initialModel,
        initial_answer: initialAnswer,
        validation_confidence: reevalValidation.confidence,
        initial_confidence: initialValidation.confidence,
        reevaluation_confidence: reevalValidation.confidence,
        evaluation_count: 2,
        max_evaluations: MAX_VALIDATION_EVALUATIONS,
        validation_result: reevalValidation,
        unsupported_claims: reevalValidation.unsupported_claims,
        missing_information: reevalValidation.missing_information,
        contradictions: reevalValidation.contradictions,
        routing_decision: 'ACCEPTED_AFTER_REEVALUATION',
        reasoning_answer: reevalAnswer,
        final_answer: reevalAnswer,
        final_validation_result: reevalValidation
      }
    };
  }

  // SECOND EVALUATION ALSO FAILS -> TERMINAL LOW-CONFIDENCE RETURN
  // HARD STOP PROGRAMMATICALLY ENFORCED: ABSOLUTELY NO 3RD LLM CALL!
  const totalDuration = Math.round(performance.now() - startTotal);
  console.log(`[VALIDATION PIPELINE LATENCY] Request ID: ${requestId || logId}
  User Query: "${userQuery.slice(0, 50)}"
  Evaluations: 2 / ${MAX_VALIDATION_EVALUATIONS} (Both below threshold: ${initialValidation.confidence} & ${reevalValidation.confidence})
  Decision: TERMINAL_LOW_CONFIDENCE (return_low_confidence)
  Action: Appending low-confidence disclaimer and returning 2nd output. NO THIRD LLM CALL.
  Total Pipeline Duration: ${totalDuration} ms`);

  const DISCLAIMER_PREFIX = `⚠️ Low-confidence response: The system could not sufficiently verify this answer against the available evidence. Please review the response before relying on it.\n\n`;

  const finalLowConfidenceAnswer = `${DISCLAIMER_PREFIX}${reevalAnswer}`;

  if (requestId) {
    useTelemetryStore.getState().updateExecutionValidationAndRouting(
      requestId,
      {
        status: 'low_confidence',
        confidence: reevalValidation.confidence,
        initialConfidence: initialValidation.confidence,
        reevaluationConfidence: reevalValidation.confidence,
        evaluationCount: 2,
        maxEvaluations: MAX_VALIDATION_EVALUATIONS,
        ungroundedClaims: reevalValidation.unsupported_claims,
        reason: `Evaluation 2/${MAX_VALIDATION_EVALUATIONS} failed (Confidence ${reevalValidation.confidence} < ${cfg.confidenceThreshold}). Returned with low-confidence disclaimer.`,
        validatorModel: cfg.validatorModel
      },
      {
        initialModel: cfg.initialModel,
        decision: 'return_low_confidence',
        reason: `Evaluation 2/${MAX_VALIDATION_EVALUATIONS} failed. Terminal decision: Return response with human review disclaimer.`
      },
      cfg.initialModel
    );
  }

  return {
    finalAnswer: finalLowConfidenceAnswer,
    groundedStatus: 'insufficient',
    auditLog: {
      id: logId,
      timestamp,
      user_query: userQuery,
      retrieved_context: sourceContext,
      selected_initial_model: cfg.initialModel,
      initial_answer: initialAnswer,
      validation_confidence: reevalValidation.confidence,
      initial_confidence: initialValidation.confidence,
      reevaluation_confidence: reevalValidation.confidence,
      evaluation_count: 2,
      max_evaluations: MAX_VALIDATION_EVALUATIONS,
      disclaimer_added: true,
      validation_result: reevalValidation,
      unsupported_claims: reevalValidation.unsupported_claims,
      missing_information: reevalValidation.missing_information,
      contradictions: reevalValidation.contradictions,
      routing_decision: 'RETURN_LOW_CONFIDENCE',
      reasoning_answer: reevalAnswer,
      final_answer: finalLowConfidenceAnswer,
      final_validation_result: reevalValidation
    }
  };
}
