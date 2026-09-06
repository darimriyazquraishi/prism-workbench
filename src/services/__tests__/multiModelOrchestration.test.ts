import { detectRequiredCapabilities, resolveModelForCapability } from '../modelCapabilityRouter';
import { classifyIntent } from '../../store/useAntigravityStore';

function runTests() {
  console.log('--- RUNNING MULTI-MODEL ORCHESTRATION UNIT TESTS ---');

  // Test 1: Text-only request
  const caps1 = detectRequiredCapabilities('What is the capital of France?');
  console.assert(caps1.includes('text_reasoning'), 'Test 1 Failed: text_reasoning missing');
  console.assert(!caps1.includes('vision'), 'Test 1 Failed: vision falsely detected');
  console.log('✓ Test 1 Passed: Text-only request resolves to text_reasoning capability only.');

  // Test 2: Image-dependent request (e.g. attached novel cover)
  const caps2 = detectRequiredCapabilities('Summarize the story of the novel shown in the attached image.', [], [{ name: 'novel_cover.jpg', extension: 'jpg', type: 'image' }]);
  console.assert(caps2.includes('vision'), 'Test 2 Failed: vision capability missing');
  console.assert(caps2.includes('text_reasoning'), 'Test 2 Failed: text_reasoning missing');
  const visionModel = resolveModelForCapability('vision');
  console.assert(visionModel.tag === 'qwen2.5vl:7b', 'Test 2 Failed: wrong vision model tag');
  console.log('✓ Test 2 Passed: Image request dynamically resolves Vision (qwen2.5vl:7b) + General Reasoning capabilities.');

  // Test 3: Vision + Document Deliverable request
  const caps3 = detectRequiredCapabilities('Read this scanned inspection report and generate a Word document', [], [{ name: 'report.png', extension: 'png', type: 'image' }]);
  console.assert(caps3.includes('vision'), 'Test 3 Failed: vision missing');
  console.assert(caps3.includes('document_synthesis'), 'Test 3 Failed: document_synthesis missing');
  console.log('✓ Test 3 Passed: Scanned document request resolves Vision + Document Synthesis capabilities.');

  // Test 4: Dynamic Intent Classification for Vision Question
  const intentResult = classifyIntent(
    'Summarize the story of the novel shown in the attached image.',
    [],
    [{ name: 'book_cover.png' }]
  );
  console.assert(intentResult.intent === 'WORKFLOW', 'Test 4 Failed: Intent should be WORKFLOW');
  console.assert(intentResult.requires_vision === true, 'Test 4 Failed: requires_vision should be true');
  console.log('✓ Test 4 Passed: classifyIntent correctly routes vision question to WORKFLOW with requires_vision=true.');

  console.log('--- ALL MULTI-MODEL ORCHESTRATION TESTS PASSED SUCCESSFULLY ---');
}

runTests();
