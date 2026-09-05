import { validateAnswerWithModel, executeValidationAndRoutingPipeline } from '../services/answerValidatorService';

/**
 * End-to-End Test: Pump P-204 Meeting Notes Summarization & Unrelated Answer Rejection
 */
export async function runPumpP204ValidationTest() {
  console.log('--- STARTING END-TO-END VALIDATION TEST: PUMP P-204 ---');

  const userQuery = `Convert these meeting notes into:
Summary → Decisions → Action Items → Responsible Person → Deadline → Risks/Unresolved Issues.`;

  const meetingNotes = `Meeting Date: 5 September 2024

Ravi said Pump P-204 has shown abnormal vibration for the last three inspections.

Ankit suggested checking the bearing before replacing the entire pump.

Maintenance team will inspect P-204 on 8 September.

Priya will provide the previous three inspection reports by 6 September.

The replacement bearing is currently available in inventory.

The team decided not to shut down the pump immediately unless vibration crosses the safety threshold.

Next review meeting: 10 September.`;

  const genericVibrationResponse = `Vibration RMS measures the overall energy of structural or rotational vibration in industrial machinery. According to ISO 10816 standards, RMS vibration velocity (in mm/s) reflects the kinetic energy dissipated through bearings and structural supports, helping engineers assess mechanical health and detect imbalance, misalignment, or bearing degradation before catastrophic failure.`;

  console.log('1. Testing Validator Evaluation on Generic Unrelated Answer...');
  const valResult = await validateAnswerWithModel(
    userQuery,
    meetingNotes,
    genericVibrationResponse,
    'qwen3:8b',
    0.75
  );

  console.log('Validator Output for Generic Answer:', JSON.stringify(valResult, null, 2));

  // Assertions: Generic answer MUST fail validation
  const failedAsExpected =
    !valResult.grounded ||
    !valResult.answers_question ||
    valResult.confidence < 0.75 ||
    valResult.route !== 'RETURN';

  if (failedAsExpected) {
    console.log('✓ SUCCESS: Validator successfully rejected the generic vibration RMS answer!');
  } else {
    console.error('✗ FAILURE: Validator incorrectly accepted generic vibration RMS answer!');
  }

  console.log('\n2. Testing Full Pipeline Execution (Routing to General Reasoning Model)...');
  const pipelineResult = await executeValidationAndRoutingPipeline(userQuery, meetingNotes, {
    confidenceThreshold: 0.75
  });

  console.log('Pipeline Final Answer Status:', pipelineResult.groundedStatus);
  console.log('Pipeline Final Answer:\n', pipelineResult.finalAnswer);
  console.log('Pipeline Audit Log Routing Decision:', pipelineResult.auditLog.routing_decision);

  console.log('--- END-TO-END VALIDATION TEST COMPLETED ---');
}
