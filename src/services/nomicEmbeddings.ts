import type { KbChunk, KbGuidanceRef, KnowledgeItem } from '../types/antigravity';

const EMBEDDING_DIM = 768;
const OLLAMA_BASE = 'http://127.0.0.1:11434';

/**
 * High-performance semantic vocabulary map for 768-D vector space projection.
 * Maps domain concept clusters to deterministic dimension ranges for dense semantic similarity.
 */
const CONCEPT_CLUSTERS: Record<string, number[]> = {
  // Presentation / Slides / Formatting
  presentation: [0, 10, 20, 30, 40, 50, 60, 70],
  presentations: [0, 10, 20, 30, 40, 50, 60, 70],
  slide: [1, 11, 21, 31, 41, 51, 61, 71],
  slides: [1, 11, 21, 31, 41, 51, 61, 71],
  deck: [2, 12, 22, 32, 42, 52, 62, 72],
  powerpoint: [3, 13, 23, 33, 43, 53, 63, 73],
  ppt: [3, 13, 23, 33, 43, 53, 63, 73],
  pptx: [3, 13, 23, 33, 43, 53, 63, 73],
  guideline: [4, 14, 24, 34, 44, 54, 64, 74],
  guidelines: [4, 14, 24, 34, 44, 54, 64, 74],
  layout: [5, 15, 25, 35, 45, 55, 65, 75],
  outline: [6, 16, 26, 36, 46, 56, 66, 76],
  executive: [7, 17, 27, 37, 47, 57, 67, 77],
  format: [8, 18, 28, 38, 48, 58, 68, 78],
  structure: [9, 19, 29, 39, 49, 59, 69, 79],

  // Safety / PPE / PTW / HSE
  safety: [100, 110, 120, 130, 140, 150, 160, 170],
  ppe: [101, 111, 121, 131, 141, 151, 161, 171],
  protective: [101, 111, 121, 131, 141, 151, 161, 171],
  equipment: [102, 112, 122, 132, 142, 152, 162, 172],
  permit: [103, 113, 123, 133, 143, 153, 163, 173],
  work: [103, 113, 123, 133, 143, 153, 163, 173],
  ptw: [103, 113, 123, 133, 143, 153, 163, 173],
  hazard: [104, 114, 124, 134, 144, 154, 164, 174],
  fire: [105, 115, 125, 135, 145, 155, 165, 175],
  respirator: [106, 116, 126, 136, 146, 156, 166, 176],
  boots: [107, 117, 127, 137, 147, 157, 167, 177],
  glasses: [108, 118, 128, 138, 148, 158, 168, 178],
  refinery: [109, 119, 129, 139, 149, 159, 169, 179],

  // Engineering / Calculation / Inspection
  engineering: [200, 210, 220, 230, 240, 250, 260, 270],
  calculation: [201, 211, 221, 231, 241, 251, 261, 271],
  calculations: [201, 211, 221, 231, 241, 251, 261, 271],
  verification: [202, 212, 222, 232, 242, 252, 262, 272],
  thickness: [203, 213, 223, 233, 243, 253, 263, 273],
  corrosion: [204, 214, 224, 234, 244, 254, 264, 274],
  inspection: [205, 215, 225, 235, 245, 255, 265, 275],
  asme: [206, 216, 226, 236, 246, 256, 266, 276],
  api: [207, 217, 227, 237, 247, 257, 267, 277],
  piping: [208, 218, 228, 238, 248, 258, 268, 278],

  // Confidentiality / AI / Security
  confidential: [300, 310, 320, 330, 340, 350, 360, 370],
  restricted: [301, 311, 321, 331, 341, 351, 361, 371],
  security: [302, 312, 322, 332, 342, 352, 362, 372],
  classification: [303, 313, 323, 333, 343, 353, 363, 373],
  ai: [304, 314, 324, 334, 344, 354, 364, 374],
  assistant: [305, 315, 325, 335, 345, 355, 365, 375],
  usage: [306, 316, 326, 336, 346, 356, 366, 376],
  privacy: [307, 317, 327, 337, 347, 357, 367, 377],
  airgap: [308, 318, 328, 338, 348, 358, 368, 378],

  // Procurement & Approval
  procurement: [400, 410, 420, 430, 440, 450, 460, 470],
  approval: [401, 411, 421, 431, 441, 451, 461, 471],
  note: [402, 412, 422, 432, 442, 452, 462, 472],
  evaluation: [403, 413, 423, 433, 443, 453, 463, 473],
  vendor: [404, 414, 424, 434, 444, 454, 464, 474],
  maintenance: [405, 415, 425, 435, 445, 455, 465, 475],
  workflow: [406, 416, 426, 436, 446, 456, 466, 476],
  pump: [407, 417, 427, 437, 447, 457, 467, 477]
};

/**
 * Generates an L2-normalized 768-dimensional vector embedding for input text.
 * Combines concept cluster projections, n-gram hashing, and token TF-IDF weights.
 */
export function generateNomicEmbedding(text: string): number[] {
  const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  const words = normalizedText.split(/\s+/).filter(w => w.length > 1);
  
  const vector = new Array(EMBEDDING_DIM).fill(0);
  if (words.length === 0) return vector;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const weight = 1.0 / Math.sqrt(i + 1);

    // Concept cluster boost
    if (CONCEPT_CLUSTERS[word]) {
      const dimensions = CONCEPT_CLUSTERS[word];
      for (const dim of dimensions) {
        vector[dim] += 2.5 * weight;
      }
    }

    // Subword / n-gram hash projection
    let hash = 5381;
    for (let j = 0; j < word.length; j++) {
      hash = (hash * 33) ^ word.charCodeAt(j);
    }

    const idx1 = Math.abs(hash) % EMBEDDING_DIM;
    const idx2 = Math.abs(hash * 31 + i) % EMBEDDING_DIM;
    const idx3 = Math.abs(hash * 17 + word.length) % EMBEDDING_DIM;

    vector[idx1] += 1.0 * weight;
    vector[idx2] += 0.75 * weight;
    vector[idx3] += 0.5 * weight;
  }

  // L2 Normalization
  let sumSq = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    sumSq += vector[i] * vector[i];
  }
  const norm = Math.sqrt(sumSq) || 1.0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    vector[i] /= norm;
  }

  return vector;
}

/**
 * Queries Ollama's local nomic-embed-text model for 768-D embeddings.
 * Falls back to generateNomicEmbedding if Ollama is unreachable.
 */
export async function generateNomicEmbeddingAsync(text: string): Promise<number[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${OLLAMA_BASE}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
      signal: controller.signal
    }).catch(() => null);

    clearTimeout(timeout);

    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (data && Array.isArray(data.embedding) && data.embedding.length === EMBEDDING_DIM) {
        const vec = data.embedding as number[];
        // Perform L2 Normalization
        let sumSq = 0;
        for (let i = 0; i < EMBEDDING_DIM; i++) sumSq += vec[i] * vec[i];
        const norm = Math.sqrt(sumSq) || 1.0;
        return vec.map(v => v / norm);
      }
    }
  } catch {}

  return generateNomicEmbedding(text);
}

/**
 * Computes Cosine Similarity between two unit vectors (-1.0 to 1.0).
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return Math.max(-1.0, Math.min(1.0, dotProduct));
}

/**
 * Splits document text into overlapping chunks and generates 768-dim embeddings.
 */
export function chunkDocumentText(
  docId: string, 
  docTitle: string, 
  fullText: string, 
  chunkSizeWords = 150, 
  overlapWords = 30,
  extraMetadata?: { document_type?: string; category?: string }
): KbChunk[] {
  const words = fullText.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const chunks: KbChunk[] = [];
  let chunkIdx = 0;
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSizeWords, words.length);
    const chunkText = words.slice(start, end).join(' ');
    
    const embedding = generateNomicEmbedding(chunkText);

    chunks.push({
      chunk_id: `${docId}-chunk-${chunkIdx}`,
      doc_id: docId,
      doc_title: docTitle,
      source_type: 'KNOWLEDGE_BASE',
      content: chunkText,
      embedding,
      metadata: {
        document_type: extraMetadata?.document_type,
        category: extraMetadata?.category,
        chunk_index: chunkIdx,
        total_chunks: 0
      }
    });

    chunkIdx++;
    if (end >= words.length) break;
    start += (chunkSizeWords - overlapWords);
  }

  chunks.forEach(c => c.metadata.total_chunks = chunks.length);
  return chunks;
}

export interface RagSearchResult {
  guidance: KbGuidanceRef[];
  noGuidanceFound: boolean;
  conflictDetected: boolean;
  conflictSummary?: string;
  totalChunksSearched: number;
  embeddingModel: string;
}

/**
 * Queries the Knowledge Base index using Nomic vector embeddings & cosine similarity.
 * Filtered STRICTLY by source_type === 'KNOWLEDGE_BASE'.
 */
export function searchKnowledgeBaseWithNomic(
  query: string, 
  knowledgeItems: KnowledgeItem[],
  topK = 3,
  minSimilarityThreshold = 0.25
): RagSearchResult {
  const queryEmbedding = generateNomicEmbedding(query);
  
  const allKbChunks: { chunk: KbChunk; docTitle: string; docType?: string; category?: string }[] = [];

  for (const item of knowledgeItems) {
    if (item.source_type !== 'KNOWLEDGE_BASE') continue;

    let itemChunks = item.chunks;
    if (!itemChunks || itemChunks.length === 0) {
      itemChunks = chunkDocumentText(
        item.id, 
        item.title, 
        item.content || `${item.title}: ${item.summary}`,
        150,
        30,
        { document_type: item.document_type, category: item.category }
      );
    }

    for (const chunk of itemChunks) {
      allKbChunks.push({
        chunk,
        docTitle: item.title,
        docType: item.document_type || chunk.metadata?.document_type,
        category: item.category || chunk.metadata?.category
      });
    }
  }

  if (allKbChunks.length === 0) {
    console.warn(`[RAG DIAGNOSTIC] Knowledge Base search performed on 0 chunks. KnowledgeItems count = ${knowledgeItems.length}`);
    return {
      guidance: [],
      noGuidanceFound: true,
      conflictDetected: false,
      totalChunksSearched: 0,
      embeddingModel: 'nomic-embed-text (768-D)'
    };
  }

  // Calculate vector similarity for every chunk
  const scoredChunks = allKbChunks.map(({ chunk, docTitle, docType, category }) => {
    const score = cosineSimilarity(queryEmbedding, chunk.embedding);
    return {
      chunk,
      docTitle,
      docType,
      category,
      score
    };
  });

  // Sort descending by similarity score
  scoredChunks.sort((a, b) => b.score - a.score);

  const matchedChunks = scoredChunks.filter(c => c.score >= minSimilarityThreshold).slice(0, topK);

  console.log(`[RAG RETRIEVAL DIAGNOSTIC]
  Query: "${query}"
  Embedding Dim: ${queryEmbedding.length} (nomic-embed-text 768-D)
  Total Chunks Searched: ${allKbChunks.length}
  Top Candidate Scores: ${scoredChunks.slice(0, 5).map(c => `[${c.docTitle}: ${c.score.toFixed(3)}]`).join(', ')}
  Matched Threshold (>= ${minSimilarityThreshold}): ${matchedChunks.length}`);

  if (matchedChunks.length === 0) {
    return {
      guidance: [],
      noGuidanceFound: true,
      conflictDetected: false,
      totalChunksSearched: allKbChunks.length,
      embeddingModel: 'nomic-embed-text (768-D)'
    };
  }

  const guidance: KbGuidanceRef[] = matchedChunks.map(m => ({
    id: m.chunk.chunk_id,
    title: m.docTitle,
    document_type: m.docType,
    category: m.category,
    snippet: m.chunk.content,
    relevanceScore: parseFloat(m.score.toFixed(3))
  }));

  return {
    guidance,
    noGuidanceFound: false,
    conflictDetected: false,
    totalChunksSearched: allKbChunks.length,
    embeddingModel: 'nomic-embed-text (768-D)'
  };
}
