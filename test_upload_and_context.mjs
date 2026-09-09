import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4321';

async function runTests() {
  console.log('=== RUNNING SENTINELAI FILE UPLOAD & DOCUMENT CONTEXT ACCEPTANCE TESTS ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  // TEST 1: Path Traversal Attack Prevention
  console.log('--- TEST 1: Workspace Boundary & Security Isolation ---');
  try {
    const rawRes = await fetch(`${BASE_URL}/api/workspace/raw?path=${encodeURIComponent('../../package.json')}`);
    assert(rawRes.status === 403, `Access to ../../package.json blocked with 403 (Status: ${rawRes.status})`);
    
    const fileRes = await fetch(`${BASE_URL}/api/workspace/file?path=${encodeURIComponent('../../../src/index.ts')}`);
    assert(fileRes.status === 403, `Access to ../../../src/index.ts blocked with 403 (Status: ${fileRes.status})`);
  } catch (err) {
    assert(false, `Security isolation test encountered error: ${err.message}`);
  }

  // TEST 2: Real File Upload & SQLite Insertion
  console.log('\n--- TEST 2: Real File Upload & SQLite Ingestion ---');
  const sampleText = `SENTINEL_INSPECTION_AUDIT_REPORT
Line: 04-CR-102
Nominal Wall Thickness: 5.50 mm
Measured Minimum Thickness: 4.65 mm
Corrosion Rate: 0.12 mm/year
Remaining Safe Life: 12.5 years
Recommendation: Safe for continuous operation until next turnaround in 2028.`;

  let uploadedDocId = null;
  let storedFilename = null;

  try {
    const formData = new FormData();
    const blob = new Blob([sampleText], { type: 'text/plain' });
    formData.append('files', blob, 'Line_04_CR_102_acceptance.txt');

    const uploadRes = await fetch(`${BASE_URL}/api/kb/upload`, {
      method: 'POST',
      body: formData
    });
    const uploadData = await uploadRes.json();

    assert(uploadRes.status === 200 && uploadData.success === true, 'Upload API returned 200 with success: true');
    assert(uploadData.file && uploadData.file.name === 'Line_04_CR_102_acceptance.txt', 'Uploaded file name matches');
    assert(uploadData.file.sha256 && uploadData.file.sha256.length === 64, `SHA-256 generated: ${uploadData.file.sha256.slice(0, 16)}...`);
    assert(uploadData.file.content && uploadData.file.content.includes('Line: 04-CR-102'), 'Extracted content contains document text');

    uploadedDocId = uploadData.file.id;
    storedFilename = uploadData.file.filename;

    // Verify on disk
    const diskPath = path.resolve(process.cwd(), 'workspaces', 'user_workspace', 'Uploads', storedFilename);
    assert(fs.existsSync(diskPath), `File verified on disk at workspaces/user_workspace/Uploads/${storedFilename}`);
  } catch (err) {
    assert(false, `Upload test failed: ${err.message}`);
  }

  // TEST 3: Query SQLite Documents Table
  console.log('\n--- TEST 3: SQLite Persistence Verification ---');
  try {
    const docsRes = await fetch(`${BASE_URL}/api/workspace/documents`);
    const docsData = await docsRes.json();

    assert(docsRes.status === 200 && docsData.success === true, 'GET /api/workspace/documents returned 200');
    const found = docsData.documents.find(d => d.original_filename === 'Line_04_CR_102_acceptance.txt');
    assert(found !== undefined, 'Uploaded document found in SQLite database query');
    assert(found && found.extracted_text && found.extracted_text.includes('Remaining Safe Life: 12.5 years'), 'SQLite record contains extracted text');
    assert(found && found.relative_path.startsWith('Uploads/'), `SQLite relative_path properly scoped: ${found?.relative_path}`);
  } catch (err) {
    assert(false, `SQLite query test failed: ${err.message}`);
  }

  // TEST 4: Raw File Streaming
  console.log('\n--- TEST 4: Raw Stream Endpoint ---');
  try {
    const streamRes = await fetch(`${BASE_URL}/api/workspace/raw?path=${encodeURIComponent('Uploads/' + storedFilename)}`);
    assert(streamRes.status === 200, `Raw stream returned 200 for Uploads/${storedFilename}`);
    const streamedText = await streamRes.text();
    assert(streamedText.includes('Nominal Wall Thickness: 5.50 mm'), 'Streamed content matches original document content');
  } catch (err) {
    assert(false, `Raw stream test failed: ${err.message}`);
  }

  // TEST 5: Document Text & Metadata Extraction via /api/workspace/file
  console.log('\n--- TEST 5: Document Metadata & Text via File Endpoint ---');
  try {
    const fileRes = await fetch(`${BASE_URL}/api/workspace/file?path=${encodeURIComponent('Uploads/' + storedFilename)}`);
    const fileData = await fileRes.json();
    assert(fileRes.status === 200 && fileData.success === true, 'GET /api/workspace/file returned 200');
    assert(fileData.content.includes('Remaining Safe Life: 12.5 years'), 'File content retrieved successfully');
  } catch (err) {
    assert(false, `File endpoint test failed: ${err.message}`);
  }

  // TEST 6: Non-Destructive Duplicate Upload
  console.log('\n--- TEST 6: Non-Destructive Duplicate Filename Handling ---');
  try {
    const formData = new FormData();
    const differentText = 'MODIFIED_INSPECTION_CONTENT: Line 04-CR-102 secondary survey reading: 4.88 mm.';
    const blob = new Blob([differentText], { type: 'text/plain' });
    formData.append('files', blob, 'Line_04_CR_102_acceptance.txt');

    const dupRes = await fetch(`${BASE_URL}/api/kb/upload`, {
      method: 'POST',
      body: formData
    });
    const dupData = await dupRes.json();
    assert(dupRes.status === 200 && dupData.success === true, 'Duplicate upload accepted');
    // Stored filename should have timestamp appended if content differed
    assert(dupData.file.filename !== storedFilename, `Duplicate generated distinct filename to protect data: ${dupData.file.filename}`);
  } catch (err) {
    assert(false, `Duplicate test failed: ${err.message}`);
  }

  // CLEANUP TEST ARTIFACTS
  console.log('\n--- CLEANUP ---');
  try {
    const { DatabaseSync } = await import('node:sqlite');
    const dbPath = path.resolve(process.cwd(), 'sovereign-ai-workbench', 'data', 'sentinel_documents.db');
    const db = new DatabaseSync(dbPath);
    db.exec("DELETE FROM documents WHERE original_filename LIKE '%acceptance%'");

    const uploadsDir = path.resolve(process.cwd(), 'workspaces', 'user_workspace', 'Uploads');
    if (fs.existsSync(uploadsDir)) {
      for (const f of fs.readdirSync(uploadsDir)) {
        if (f.includes('acceptance')) {
          fs.unlinkSync(path.join(uploadsDir, f));
        }
      }
    }
    console.log('✓ Acceptance test documents cleaned successfully.');
  } catch (err) {
    console.warn('Cleanup note:', err.message);
  }

  console.log(`\n========================================`);
  console.log(`FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
