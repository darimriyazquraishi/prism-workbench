import { useTelemetryStore } from '../store/telemetryStore';
import type {
  PptxStructuredContent,
  DocxStructuredContent,
  XlsxStructuredContent,
  KbGuidanceRef
} from '../types/antigravity';

export interface ConversationTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const DEFAULT_FACTUAL_SYSTEM_PROMPT = 
  'You are a knowledgeable, factually rigorous AI assistant. Provide accurate, truthful, and well-verified responses. Accurately identify fictional works, characters, creators, titles, technical concepts, and historical facts without hallucinating. If uncertain about a specific detail, state your uncertainty explicitly.';

export interface LocalLlmOptions {
  model?: string;
  systemPrompt?: string;
  userPrompt: string;
  conversationHistory?: ConversationTurn[];
  formatJson?: boolean;
  images?: string[]; // base64 strings
  temperature?: number;
  numCtx?: number;
  thinkHarder?: boolean;
  onToken?: (token: string, accumulated: string, isThinking?: boolean) => void;
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
const VISION_SERVER_BASE = 'http://127.0.0.1:8080';

// Dynamic model registry cache populated from /api/tags or launcher
let cachedInstalledOllamaModels: string[] = [];

export function setInstalledOllamaModels(models: string[]) {
  if (Array.isArray(models)) {
    cachedInstalledOllamaModels = models.filter(Boolean);
  }
}

export function getInstalledOllamaModels(): string[] {
  return cachedInstalledOllamaModels;
}

function extractCleanErrorMessage(raw: string, status: number): string {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.error === 'string') {
      try {
        const inner = JSON.parse(parsed.error);
        if (inner?.error?.message) return inner.error.message;
        if (inner?.message) return inner.message;
      } catch {
        return parsed.error;
      }
    }
    if (parsed?.error?.message) return parsed.error.message;
    if (parsed?.message) return parsed.message;
  } catch {}
  return `Ollama returned HTTP ${status}: ${raw}`;
}

/**
 * Pre-warms and loads model weights into GPU VRAM to ensure 0-lag execution.
 */
export async function warmupModelCache(modelTag?: string): Promise<{ success: boolean; durationMs: number; error?: string }> {
  const resolved = resolveOllamaModelTag(modelTag);
  if (!resolved || resolved === 'default') {
    return { success: false, durationMs: 0, error: 'No model available to warm up' };
  }
  const startTime = performance.now();
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: resolved,
        messages: [{ role: 'user', content: 'Warmup cache ping' }],
        stream: false,
        options: { num_predict: 1 }
      })
    });
    if (res.ok) {
      return { success: true, durationMs: Math.round(performance.now() - startTime) };
    }
    const errText = await res.text().catch(() => '');
    return { success: false, durationMs: Math.round(performance.now() - startTime), error: errText };
  } catch (err: any) {
    return { success: false, durationMs: Math.round(performance.now() - startTime), error: err.message };
  }
}

/**
 * Dynamically resolves requested model names/roles against actually installed Ollama models.
 * Never forces hardcoded model tags that may not exist on the user's workstation.
 */
export function resolveOllamaModelTag(requested?: string): string {
  // 1. Direct exact match
  if (requested && cachedInstalledOllamaModels.includes(requested)) {
    return requested;
  }

  // 2. Case-insensitive match
  if (requested) {
    const reqLower = requested.toLowerCase();
    const matched = cachedInstalledOllamaModels.find(m => m.toLowerCase() === reqLower);
    if (matched) return matched;
  }

  const r = (requested || '').toLowerCase();

  // 3. Coding role match
  if (r.includes('coder') || r.includes('code') || r.includes('python')) {
    const coder = cachedInstalledOllamaModels.find(m => {
      const ml = m.toLowerCase();
      return ml.includes('coder') || ml.includes('code') || ml.includes('python') || ml.includes('starcoder') || ml.includes('dev');
    });
    if (coder) return coder;
  }

  // 4. Vision / Multimodal role match
  if (r.includes('vl') || r.includes('vision') || r.includes('image') || r.includes('multimodal')) {
    const vision = cachedInstalledOllamaModels.find(m => {
      const ml = m.toLowerCase();
      return ml.includes('vl') || ml.includes('vision') || ml.includes('llava') || ml.includes('multimodal') || ml.includes('clip');
    });
    if (vision) return vision;
  }

  // 5. Embedding role match
  if (r.includes('embed') || r.includes('nomic') || r.includes('bge')) {
    const embed = cachedInstalledOllamaModels.find(m => {
      const ml = m.toLowerCase();
      return ml.includes('embed') || ml.includes('nomic') || ml.includes('bge');
    });
    if (embed) return embed;
  }

  // 6. Substring match for specific model name or parameter size (e.g. "14b", "llama3", "deepseek")
  if (requested && requested.trim()) {
    const fuzzy = cachedInstalledOllamaModels.find(m => m.toLowerCase().includes(r));
    if (fuzzy) return fuzzy;
  }

  // 7. Premier General Reasoning Model: pick primary general model (non-embedding, non-reranker)
  if (cachedInstalledOllamaModels.length > 0) {
    const general = cachedInstalledOllamaModels.find(m => {
      const ml = m.toLowerCase();
      return !ml.includes('embed') && !ml.includes('rerank') && !ml.includes('vl') && !ml.includes('vision');
    });
    if (general) return general;
    return cachedInstalledOllamaModels[0];
  }

  return requested || 'default';
}

/**
 * Executes a live inference request to local Ollama (11434) or CUDA Vision Server (8080).
 * Supports real-time token streaming via options.onToken.
 * Measures exact latency and bytes transferred.
 */
export async function callLocalLlm(options: LocalLlmOptions): Promise<LocalLlmResult> {
  const startTime = performance.now();

  // Use high-rigor factual system prompt by default
  let effectiveSystemPrompt = options.systemPrompt || DEFAULT_FACTUAL_SYSTEM_PROMPT;
  if (options.thinkHarder) {
    const thinkHarderDirective = `\n\n[MAX POWER REASONING MODE: THINK HARDER ACTIVE]\n- Systematically analyze the underlying problem, assumptions, and constraints.\n- Break the task down into clear intermediate sub-steps with explicit logical justification.\n- Rigorously check edge cases, counterarguments, and potential failure modes.\n- Ensure deliverables strictly conform to required contracts and syntax.`;
    effectiveSystemPrompt = effectiveSystemPrompt ? (effectiveSystemPrompt + thinkHarderDirective) : thinkHarderDirective.trim();
  } else if (options.formatJson) {
    effectiveSystemPrompt = effectiveSystemPrompt + '\nRespond strictly with valid JSON conforming to the requested schema.';
  }

  // 1. Multimodal Vision Handling: If images attached, prioritize the CUDA llama-server on port 8080 (native mmproj support)
  if (options.images && options.images.length > 0) {
    try {
      const visionRes = await fetch(`${VISION_SERVER_BASE}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...(effectiveSystemPrompt ? [{ role: 'system', content: effectiveSystemPrompt }] : []),
            ...(options.conversationHistory || []).slice(-10).map(t => ({ role: t.role, content: t.content })),
            {
              role: 'user',
              content: [
                { type: 'text', text: options.userPrompt },
                ...options.images.map(img => ({
                  type: 'image_url',
                  image_url: { url: img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}` }
                }))
              ]
            }
          ],
          max_tokens: options.thinkHarder ? 4096 : 3500,
          temperature: options.thinkHarder ? 0.15 : (options.temperature ?? 0.2),
          stream: Boolean(options.onToken)
        }),
        signal: AbortSignal.timeout(120000)
      });

      if (visionRes.ok) {
        if (options.onToken && visionRes.body) {
          const reader = visionRes.body.getReader();
          const decoder = new TextDecoder();
          let vAccumulated = '';
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data:')) continue;
              const jsonStr = trimmed.replace(/^data:\s*/, '').trim();
              if (jsonStr === '[DONE]') continue;
              try {
                const chunk = JSON.parse(jsonStr);
                const delta = chunk.choices?.[0]?.delta?.content || '';
                if (delta) {
                  vAccumulated += delta;
                  options.onToken(delta, vAccumulated, false);
                }
              } catch {}
            }
          }

          if (vAccumulated) {
            const durationMs = Math.round(performance.now() - startTime);
            const bytesRec = new TextEncoder().encode(vAccumulated).length;
            useTelemetryStore.getState().recordInference({
              model: 'Local Vision Engine (CUDA mmproj 8080)',
              inferenceTimeMs: durationMs
            });
            return {
              content: vAccumulated.trim(),
              model: 'vision (CUDA mmproj)',
              durationMs,
              bytesSent: new TextEncoder().encode(options.userPrompt).length,
              bytesReceived: bytesRec,
              endpoint: `${VISION_SERVER_BASE}/v1/chat/completions`
            };
          }
        } else {
          const vData = await visionRes.json();
          const vText = vData?.choices?.[0]?.message?.content || '';
          if (vText) {
            const durationMs = Math.round(performance.now() - startTime);
            const bytesRec = new TextEncoder().encode(JSON.stringify(vData)).length;
            useTelemetryStore.getState().recordInference({
              model: 'Local Vision Engine (CUDA mmproj 8080)',
              inferenceTimeMs: durationMs
            });
            return {
              content: vText.trim(),
              model: 'vision (CUDA mmproj)',
              durationMs,
              bytesSent: new TextEncoder().encode(options.userPrompt).length,
              bytesReceived: bytesRec,
              endpoint: `${VISION_SERVER_BASE}/v1/chat/completions`
            };
          }
        }
      }
    } catch (vErr) {
      console.warn('[VISION] CUDA mmproj server on port 8080 not responding, falling back to Ollama 11434:', vErr);
    }
  }

  // 2. Standard / Fallback Ollama Pipeline on port 11434
  const modelTag = resolveOllamaModelTag(options.model);
  const messages: { role: string; content: string; images?: string[] }[] = [];
  if (effectiveSystemPrompt) {
    messages.push({ role: 'system', content: effectiveSystemPrompt });
  }

  // Inject prior conversation turns if provided for multi-turn conversational awareness
  if (options.conversationHistory && options.conversationHistory.length > 0) {
    // Keep the most recent 16 turns to remain safely within context window
    const recentHistory = options.conversationHistory.slice(-16);
    for (const turn of recentHistory) {
      if (turn.content && typeof turn.content === 'string' && turn.content.trim()) {
        messages.push({
          role: turn.role,
          content: turn.content.length > 3000 ? turn.content.slice(0, 3000) + '...' : turn.content
        });
      }
    }
  }

  const userMsg: { role: string; content: string; images?: string[] } = {
    role: 'user',
    content: options.userPrompt
  };

  if (options.images && options.images.length > 0) {
    userMsg.images = options.images.map(img => {
      const parts = img.split(',');
      return parts.length > 1 ? parts[1] : img;
    });
  }

  messages.push(userMsg);

  // Context window: 32,768 for Think Harder, 16,384 for vision, 8,192 default
  const defaultNumCtx = options.numCtx ?? (options.thinkHarder ? 32768 : (options.images && options.images.length > 0 ? 16384 : 8192));
  const numPredict = options.thinkHarder ? 4096 : 3500;
  const temperature = options.thinkHarder ? 0.15 : (options.temperature ?? 0.2);
  const isStreaming = Boolean(options.onToken);

  const requestBody = JSON.stringify({
    model: modelTag,
    messages,
    stream: isStreaming,
    format: options.formatJson ? 'json' : undefined,
    options: {
      temperature,
      num_ctx: defaultNumCtx,
      num_predict: numPredict
    }
  });

  const bytesSent = new TextEncoder().encode(requestBody).length;

  let responseText = '';
  let bytesReceived = 0;

  try {
    const controller = new AbortController();
    const timeoutDuration = options.images && options.images.length > 0 ? 120000 : 90000;
    const timeout = setTimeout(() => controller.abort(), timeoutDuration);

    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      // If context length was exceeded, automatically retry once with expanded 32,768 context
      if (
        (errBody.includes('exceed_context_size_error') ||
         errBody.includes('exceeds the available context size')) &&
        defaultNumCtx < 32768
      ) {
        console.warn(`[LOCAL LLM] Context limit hit (${defaultNumCtx} tokens), auto-escalating to 32,768 tokens...`);
        const retryBody = JSON.stringify({
          model: modelTag,
          messages,
          stream: isStreaming,
          format: options.formatJson ? 'json' : undefined,
          options: {
            temperature: options.temperature ?? 0.2,
            num_ctx: 32768,
            num_predict: 3500
          }
        });
        const retryRes = await fetch(`${OLLAMA_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: retryBody,
          signal: controller.signal
        });
        if (retryRes.ok) {
          if (isStreaming && retryRes.body) {
            const reader = retryRes.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';
            let accumulatedThinking = '';
            let buffer = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';
              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                try {
                  const chunk = JSON.parse(trimmed);
                  const thinking = chunk.message?.thinking || '';
                  const content = chunk.message?.content || '';
                  if (thinking) {
                    accumulatedThinking += thinking;
                    options.onToken?.(thinking, accumulatedContent || accumulatedThinking, true);
                  }
                  if (content) {
                    accumulatedContent += content;
                    options.onToken?.(content, accumulatedContent, false);
                  }
                } catch {}
              }
            }
            responseText = accumulatedContent || accumulatedThinking;
            bytesReceived = new TextEncoder().encode(responseText).length;
          } else {
            const retryData = await retryRes.json();
            responseText = retryData?.message?.content || retryData?.message?.thinking || '';
            bytesReceived = new TextEncoder().encode(JSON.stringify(retryData)).length;
          }
        } else {
          const retryErr = await retryRes.text().catch(() => '');
          throw new Error(extractCleanErrorMessage(retryErr || retryRes.statusText, retryRes.status));
        }
      } else {
        throw new Error(extractCleanErrorMessage(errBody || res.statusText, res.status));
      }
    } else {
      // Handle streaming or JSON response
      if (isStreaming && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';
        let accumulatedThinking = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const chunk = JSON.parse(trimmed);
              const thinking = chunk.message?.thinking || '';
              const content = chunk.message?.content || '';
              if (thinking) {
                accumulatedThinking += thinking;
                options.onToken?.(thinking, accumulatedContent || accumulatedThinking, true);
              }
              if (content) {
                accumulatedContent += content;
                options.onToken?.(content, accumulatedContent, false);
              }
            } catch {}
          }
        }

        if (buffer.trim()) {
          try {
            const chunk = JSON.parse(buffer.trim());
            const thinking = chunk.message?.thinking || '';
            const content = chunk.message?.content || '';
            if (thinking) {
              accumulatedThinking += thinking;
              options.onToken?.(thinking, accumulatedContent || accumulatedThinking, true);
            }
            if (content) {
              accumulatedContent += content;
              options.onToken?.(content, accumulatedContent, false);
            }
          } catch {}
        }

        responseText = accumulatedContent || accumulatedThinking;
        bytesReceived = new TextEncoder().encode(responseText).length;
      } else {
        const data = await res.json();
        responseText = data?.message?.content || data?.message?.thinking || '';
        bytesReceived = new TextEncoder().encode(JSON.stringify(data)).length;
      }
    }

    if (options.images && options.images.length > 0) {
      console.log(`[LOCAL LLM DIAGNOSTIC] Vision request to '${modelTag}' completed successfully`, {
        durationMs: Math.round(performance.now() - startTime),
        bytesReceived,
        outputLength: responseText.length
      });
    }
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - startTime);
    if (err.name === 'AbortError') {
      throw new Error(`Local model execution timed out after ${options.images && options.images.length > 0 ? 120 : 90} seconds on model '${modelTag}'. Please ensure Ollama server is responsive.`);
    }
    if (err.message && (err.message.toLowerCase().includes('fetch') || err.name === 'TypeError')) {
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
    console.warn('Initial JSON parse failed. Attempting repair with local reasoning model...', initialParseError);

    // Attempt 2: Ask the model to repair the JSON syntax
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
 * PPTX Content Reasoning: Model determines presentation title, slide order, content, speaker notes
 */
export async function generatePptxSlidesWithQwen(
  userPrompt: string,
  sourceMaterial: string,
  ragContext: KbGuidanceRef[],
  modelTag?: string
): Promise<{ data: PptxStructuredContent; audit: LocalLlmResult }> {
  const resolvedModel = resolveOllamaModelTag(modelTag);
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

  const systemPrompt = `You are the executive presentation architect for Lumi Sovereign AI Workbench.
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
    model: resolvedModel,
    systemPrompt,
    userPrompt: userQuery,
    formatJson: true,
    temperature: 0.3
  });

  const parsed = await parseOrRepairJson<PptxStructuredContent>(result.content, resolvedModel, schemaDesc);

  // Schema validation checks
  if (!parsed.title || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
    throw new Error('Model returned incomplete slide structure (missing title or slides array).');
  }

  return { data: parsed, audit: result };
}

/**
 * DOCX Content Reasoning: Model determines full document sections, findings, and formal approval note
 */
export async function generateDocxSectionsWithQwen(
  userPrompt: string,
  sourceMaterial: string,
  ragContext: KbGuidanceRef[],
  deterministicCalcs?: { formula: string; result: any; summary: string },
  modelTag?: string
): Promise<{ data: DocxStructuredContent; audit: LocalLlmResult }> {
  const resolvedModel = resolveOllamaModelTag(modelTag);
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

  const systemPrompt = `You are the engineering reasoning brain for Lumi Sovereign AI Workbench.
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
    model: resolvedModel,
    systemPrompt,
    userPrompt: userQuery,
    formatJson: true,
    temperature: 0.2
  });

  const parsed = await parseOrRepairJson<DocxStructuredContent>(result.content, resolvedModel, schemaDesc);

  if (!parsed.documentTitle || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
    throw new Error('Model returned incomplete document structure (missing documentTitle or sections).');
  }

  return { data: parsed, audit: result };
}

/**
 * XLSX Structure Reasoning: Model decides workbook layout, sheets, column headers, and data rows
 */
export async function generateXlsxStructureWithQwen(
  userPrompt: string,
  sourceMaterial: string,
  deterministicCalcs?: { formula: string; result: any; summary: string },
  modelTag?: string
): Promise<{ data: XlsxStructuredContent; audit: LocalLlmResult }> {
  const resolvedModel = resolveOllamaModelTag(modelTag);
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

  const systemPrompt = `You are the quantitative spreadsheet architect for Lumi Sovereign AI Workbench.
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
    model: resolvedModel,
    systemPrompt,
    userPrompt: userQuery,
    formatJson: true,
    temperature: 0.2
  });

  const parsed = await parseOrRepairJson<XlsxStructuredContent>(result.content, resolvedModel, schemaDesc);

  if (!parsed.workbookTitle || !Array.isArray(parsed.sheets) || parsed.sheets.length === 0) {
    throw new Error('Model returned incomplete spreadsheet structure (missing workbookTitle or sheets).');
  }

  return { data: parsed, audit: result };
}

/**
 * Code Generation: Model writes genuine, executable Python code
 */
export async function generatePythonCodeWithQwen(
  userPrompt: string,
  sourceData: string,
  modelTag?: string
): Promise<{ code: string; explanation: string; audit: LocalLlmResult }> {
  const resolvedModel = resolveOllamaModelTag(modelTag || 'coder');
  const systemPrompt = `You are a world-class senior Python engineer in an air-gapped industrial computing environment.
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
    model: resolvedModel,
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

// Aliases for cleaner imports without vendor-specific names
export const generatePptxSlides = generatePptxSlidesWithQwen;
export const generateDocxSections = generateDocxSectionsWithQwen;
export const generateXlsxStructure = generateXlsxStructureWithQwen;
export const generatePythonCode = generatePythonCodeWithQwen;
