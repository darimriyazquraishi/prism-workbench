import { useTelemetryStore } from '../store/telemetryStore';
import type {
  PptxStructuredContent,
  DocxStructuredContent,
  XlsxStructuredContent,
  KbGuidanceRef
} from '../types/antigravity';

export interface LocalLlmOptions {
  model?: string;
  systemPrompt?: string;
  userPrompt: string;
  formatJson?: boolean;
  images?: string[]; // base64 strings
  temperature?: number;
}

export interface LocalLlmResult {
  content: string;
  model: string;
  durationMs: number;
  bytesSent: number;
  bytesReceived: number;
  endpoint: string;
}

const OLLAMA_BASE = 'http://127.0.0.1:11434';

/**
 * Normalizes model names from plan descriptions/aliases to available Ollama model tags
 */
export function resolveOllamaModelTag(requested?: string): string {
  if (!requested) return 'qwen3:8b';
  const r = requested.toLowerCase();

  if (r.includes('coder') || r.includes('code') || r.includes('python')) {
    return 'qwen2.5-coder:7b';
  }
  if (r.includes('vl') || r.includes('vision')) {
    return 'qwen2.5vl:7b';
  }
  if (r.includes('14b')) {
    return 'qwen3:14b';
  }
  if (r.includes('qwen') || r.includes('instruct') || r.includes('8b')) {
    return 'qwen3:8b';
  }
  return requested;
}

/**
 * Executes a live inference request to local Ollama on 127.0.0.1:11434
 * Measures exact latency and bytes transferred.
 */
export async function callLocalLlm(options: LocalLlmOptions): Promise<LocalLlmResult> {
  const modelTag = resolveOllamaModelTag(options.model);
  const startTime = performance.now();

  const messages: { role: string; content: string; images?: string[] }[] = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }

  const userMsg: { role: string; content: string; images?: string[] } = {
    role: 'user',
    content: options.userPrompt
  };

  if (options.images && options.images.length > 0) {
    // Extract raw base64 if it is a data URL
    userMsg.images = options.images.map(img => {
      const parts = img.split(',');
      return parts.length > 1 ? parts[1] : img;
    });
  }

  messages.push(userMsg);

  const requestBody = JSON.stringify({
    model: modelTag,
    messages,
    stream: false,
    format: options.formatJson ? 'json' : undefined,
    options: {
      temperature: options.temperature ?? 0.2,
      num_predict: 3500
    }
  });

  const bytesSent = new TextEncoder().encode(requestBody).length;

  let responseText = '';
  let bytesReceived = 0;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000); // 90s ceiling

    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`Ollama returned HTTP ${res.status}: ${errBody || res.statusText}`);
    }

    const data = await res.json();
    responseText = data?.message?.content || '';
    bytesReceived = new TextEncoder().encode(JSON.stringify(data)).length;
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - startTime);
    if (err.name === 'AbortError') {
      throw new Error(`Local model execution timed out after 90 seconds on model '${modelTag}'.`);
    }
    if (err.message && err.message.includes('fetch failed')) {
      throw new Error(
        `Local LLM engine (${modelTag}) is unreachable at ${OLLAMA_BASE}. Please ensure Ollama is running ('ollama serve') and model '${modelTag}' is installed.`
      );
    }
    throw new Error(`Local LLM execution failed on '${modelTag}': ${err.message}`);
  }

  const durationMs = Math.round(performance.now() - startTime);

  useTelemetryStore.getState().recordInference({
    model: modelTag,
    inferenceTimeMs: durationMs
  });

  return {
    content: responseText.trim(),
    model: modelTag,
    durationMs,
    bytesSent,
    bytesReceived,
    endpoint: `${OLLAMA_BASE}/api/chat`
  };
}

/**
 * Extracts and parses JSON from model output, with retry/repair if parsing fails
 */
export async function parseOrRepairJson<T>(rawText: string, modelTag: string, schemaDescription: string): Promise<T> {
  // Clean markdown fencing
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // Attempt 1: Direct JSON.parse
  try {
    return JSON.parse(cleaned) as T;
  } catch (initialParseError: any) {
    console.warn('Initial JSON parse failed. Attempting repair with local Qwen...', initialParseError);

    // Attempt 2: Ask Qwen to repair the JSON syntax
    try {
      const repairPrompt = `The following text was supposed to be valid JSON conforming to this schema:\n${schemaDescription}\n\nHowever, it failed JSON.parse with error: ${initialParseError.message}\n\nPlease output ONLY the fixed, valid JSON. Do not include markdown commentary, explanations, or backticks.\n\nINVALID JSON:\n${cleaned}`;

      const repairResult = await callLocalLlm({
        model: modelTag,
        systemPrompt: 'You are a JSON repair specialist. Output ONLY 100% valid, parseable RFC 8259 JSON with no markdown wrapping.',
        userPrompt: repairPrompt,
        formatJson: true,
        temperature: 0.1
      });

      let repairCleaned = repairResult.content.trim();
      if (repairCleaned.startsWith('```json')) {
        repairCleaned = repairCleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      } else if (repairCleaned.startsWith('```')) {
        repairCleaned = repairCleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      return JSON.parse(repairCleaned) as T;
    } catch (repairError: any) {
      throw new Error(
        `JSON Validation Failed: The local model produced invalid structured output and could not be repaired. Error: ${initialParseError.message}. Snippet: ${cleaned.slice(0, 200)}...`
      );
    }
  }
}

/**
 * PPTX Content Reasoning: Qwen determines presentation title, slide order, content, speaker notes
 */
export async function generatePptxSlidesWithQwen(
  userPrompt: string,
  sourceMaterial: string,
  ragContext: KbGuidanceRef[],
  modelTag = 'qwen3:8b'
): Promise<{ data: PptxStructuredContent; audit: LocalLlmResult }> {
  const schemaDesc = `{
  "title": "string (Executive Presentation Title)",
  "subtitle": "string (Subtitle with context and date)",
  "executiveSummary": "string (Brief high-level summary)",
  "slides": [
    {
      "title": "string (Slide Heading)",
      "purpose": "string (Intent of this slide)",
      "content": ["string (Bullet point 1)", "string (Bullet point 2)", "string (Bullet point 3)"],
      "speakerNotes": "string (Spoken explanation for the presenter)",
      "visualSuggestion": "string (e.g. 2-column comparison, diagram, metric cards)",
      "layout": "title" | "content" | "split" | "summary"
    }
  ]
}`;

  const ragSection = ragContext.length > 0
    ? ragContext.map(r => `[Guideline: ${r.title}]\n${r.snippet}`).join('\n\n')
    : 'No specific corporate presentation guidelines retrieved.';

  const systemPrompt = `You are Qwen, the executive presentation brain for Lumi Sovereign AI Workbench.
Your job is to thoroughly analyze the user request, uploaded source notes, and company presentation guidelines to create a high-impact, professional slide deck.
You MUST determine:
- Title and subtitle
- Strategic slide count (between 4 and 7 slides)
- Logical slide progression
- Substantive, concrete bullet points grounded strictly in the source material
- Professional speaker notes for each slide
- Appropriate layout for each slide ('title', 'content', 'split', 'summary')

Output MUST be strictly valid JSON matching this schema:
${schemaDesc}`;

  const userQuery = `USER REQUEST:
${userPrompt}

SOURCE MATERIAL / MEETING NOTES:
${sourceMaterial || 'No meeting notes attached. Synthesize an executive strategy presentation based on the user prompt.'}

COMPANY PRESENTATION GUIDELINES & RAG CONTEXT:
${ragSection}

Create the complete structured presentation JSON now. Ground all factual statements in the provided sources.`;

  const result = await callLocalLlm({
    model: modelTag,
    systemPrompt,
    userPrompt: userQuery,
    formatJson: true,
    temperature: 0.3
  });

  const parsed = await parseOrRepairJson<PptxStructuredContent>(result.content, modelTag, schemaDesc);

  // Schema validation checks
  if (!parsed.title || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
    throw new Error('Qwen returned incomplete slide structure (missing title or slides array).');
  }

  return { data: parsed, audit: result };
}

/**
 * DOCX Content Reasoning: Qwen determines full document sections, findings, and formal approval note
 */
export async function generateDocxSectionsWithQwen(
  userPrompt: string,
  sourceMaterial: string,
  ragContext: KbGuidanceRef[],
  deterministicCalcs?: { formula: string; result: any; summary: string },
  modelTag = 'qwen3:8b'
): Promise<{ data: DocxStructuredContent; audit: LocalLlmResult }> {
  const schemaDesc = `{
  "documentTitle": "string (Formal Document / Approval Note Title)",
  "documentType": "string (e.g. Formal Approval Note / Technical Inspection Brief)",
  "metadata": {
    "referenceNumber": "string",
    "facility": "string",
    "equipmentTag": "string",
    "date": "string",
    "signOffStatus": "string"
  },
  "executiveSummary": "string (Executive summary paragraph)",
  "sections": [
    {
      "heading": "string (e.g. 1. Purpose & Scope)",
      "paragraphs": ["string"],
      "bulletPoints": ["string"],
      "keyMetrics": { "metric_name": "metric_value" }
    }
  ],
  "signOffBlock": {
    "preparedBy": "string",
    "verifiedBy": "string",
    "status": "string"
  }
}`;

  const ragSection = ragContext.length > 0
    ? ragContext.map(r => `[SOP/Standard: ${r.title}]\n${r.snippet}`).join('\n\n')
    : 'No SOP guidelines retrieved.';

  const calcSection = deterministicCalcs
    ? `Formula Applied: ${deterministicCalcs.formula}\nCalculated Values: ${JSON.stringify(deterministicCalcs.result)}\nSummary: ${deterministicCalcs.summary}`
    : 'No deterministic sensor calculations provided.';

  const systemPrompt = `You are Qwen, the engineering reasoning brain for Lumi Sovereign AI Workbench.
Your job is to synthesize an official, formal engineering document (Word .docx format) such as an Equipment Approval Note or Compliance Review.
You MUST reason over:
- Uploaded inspection notes and readings
- Retrieved SOP standards and threshold limits
- Deterministic calculation results (do not hallucinate numbers; use the calculated values provided)
- Engineering justification, risk assessment, and recommended turnaround actions.

Output MUST be strictly valid JSON matching this schema:
${schemaDesc}`;

  const userQuery = `USER REQUEST:
${userPrompt}

SOURCE MATERIAL & INSPECTION DATA:
${sourceMaterial || 'Inspection report data.'}

RETRIEVED SOP STANDARDS & RAG CONTEXT:
${ragSection}

DETERMINISTIC SENSOR & COST CALCULATIONS:
${calcSection}

Produce the structured document content now. Ground all analysis directly in the provided evidence.`;

  const result = await callLocalLlm({
    model: modelTag,
    systemPrompt,
    userPrompt: userQuery,
    formatJson: true,
    temperature: 0.2
  });

  const parsed = await parseOrRepairJson<DocxStructuredContent>(result.content, modelTag, schemaDesc);

  if (!parsed.documentTitle || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
    throw new Error('Qwen returned incomplete document structure (missing documentTitle or sections).');
  }

  return { data: parsed, audit: result };
}

/**
 * XLSX Structure Reasoning: Qwen decides workbook layout, sheets, column headers, and data rows
 */
export async function generateXlsxStructureWithQwen(
  userPrompt: string,
  sourceMaterial: string,
  deterministicCalcs?: { formula: string; result: any; summary: string },
  modelTag = 'qwen3:8b'
): Promise<{ data: XlsxStructuredContent; audit: LocalLlmResult }> {
  const schemaDesc = `{
  "workbookTitle": "string",
  "summary": "string",
  "sheets": [
    {
      "name": "string (Sheet Name, max 30 chars)",
      "purpose": "string",
      "headers": ["Col 1", "Col 2", "Col 3"],
      "rows": [
        ["val1", "val2", 100],
        ["val3", "val4", 250]
      ],
      "formulas": ["string (e.g. SUM of Column C)"],
      "summary": "string"
    }
  ]
}`;

  const calcSection = deterministicCalcs
    ? `Formula Applied: ${deterministicCalcs.formula}\nCalculations: ${JSON.stringify(deterministicCalcs.result)}\nSummary: ${deterministicCalcs.summary}`
    : 'No prior calculation results.';

  const systemPrompt = `You are Qwen, the quantitative spreadsheet architect for Lumi Sovereign AI Workbench.
Your job is to structure an Excel workbook (.xlsx) with clean, professional financial/engineering tables.
You MUST determine:
- Meaningful sheet names (e.g. 'Executive Summary', 'Cost Breakdown', 'Reliability Metrics')
- Clear, standardized column headers
- Accurate numerical and text rows reflecting source data and calculated metrics
- Formula rows and summary highlights

Output MUST be strictly valid JSON matching this schema:
${schemaDesc}`;

  const userQuery = `USER REQUEST:
${userPrompt}

INPUT DATA & TASK CONTEXT:
${sourceMaterial || 'General industrial financial and reliability data.'}

DETERMINISTIC CALCULATION FINDINGS:
${calcSection}

Synthesize the complete workbook schema now.`;

  const result = await callLocalLlm({
    model: modelTag,
    systemPrompt,
    userPrompt: userQuery,
    formatJson: true,
    temperature: 0.2
  });

  const parsed = await parseOrRepairJson<XlsxStructuredContent>(result.content, modelTag, schemaDesc);

  if (!parsed.workbookTitle || !Array.isArray(parsed.sheets) || parsed.sheets.length === 0) {
    throw new Error('Qwen returned incomplete spreadsheet structure (missing workbookTitle or sheets).');
  }

  return { data: parsed, audit: result };
}

/**
 * Code Generation: Qwen2.5-Coder writes genuine, executable Python code
 */
export async function generatePythonCodeWithQwen(
  userPrompt: string,
  sourceData: string,
  modelTag = 'qwen2.5-coder:7b'
): Promise<{ code: string; explanation: string; audit: LocalLlmResult }> {
  const systemPrompt = `You are Qwen2.5-Coder, a world-class senior Python engineer in an air-gapped industrial computing environment.
Your job is to write complete, bug-free, self-contained, and deterministic Python code fulfilling the user's requirements.
Follow these rules:
1. Provide valid Python 3 code with imports, clear type annotations, and docstrings.
2. Include executable calculations and print statements showing results.
3. Wrap your code inside a single \`\`\`python ... \`\`\` block.
4. Before or after the code, provide a concise explanation of the methodology.`;

  const userQuery = `USER REQUEST:
${userPrompt}

AVAILABLE DATA / SPECIFICATION:
${sourceData || 'Standard industrial dataset specifications.'}

Write the complete Python calculation script now.`;

  const result = await callLocalLlm({
    model: modelTag,
    systemPrompt,
    userPrompt: userQuery,
    temperature: 0.2
  });

  // Extract python code block
  const codeMatch = result.content.match(/```python([\s\S]*?)```/i) || result.content.match(/```([\s\S]*?)```/i);
  const code = codeMatch ? codeMatch[1].trim() : result.content;
  const explanation = result.content.replace(/```python[\s\S]*?```/gi, '').replace(/```[\s\S]*?```/gi, '').trim();

  return {
    code,
    explanation,
    audit: result
  };
}
