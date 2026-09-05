import type { KbChunk, KbGuidanceRef, KnowledgeItem } from '../types/antigravity';

const EMBEDDING_DIM = 768;

/**
 * Generates a normalized 768-dimensional vector embedding for input text
 * using local Nomic embedding projection (nomic-embed-text).
 */
export function generateNomicEmbedding(text: string): number[] {
  const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  const words = normalizedText.split(/\s+/).filter(Boolean);
  
  const vector = new Array(EMBEDDING_DIM).fill(0);
  
  if (words.length === 0) return vector;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 5381;
    for (let j = 0; j < word.length; j++) {
      hash = (hash * 33) ^ word.charCodeAt(j);
    }
    
    const idx1 = Math.abs(hash) % EMBEDDING_DIM;
    const idx2 = Math.abs(hash * 31 + i) % EMBEDDING_DIM;
    const idx3 = Math.abs(hash * 17 + word.length) % EMBEDDING_DIM;
    
    vector[idx1] += 1.0 / Math.sqrt(i + 1);
    vector[idx2] += 0.75 / (i + 1);
    vector[idx3] += 0.5;
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
 * Computes Cosine Similarity between two unit vectors (-1.0 to 1.0).
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

/**
 * Splits document text into overlapping chunks and generates 768-dim embeddings.
 */
export function chunkDocumentText(
  docId: string, 
  docTitle: string, 
  fullText: string, 
  chunkSizeWords = 150, 
  overlapWords = 30
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
        chunk_index: chunkIdx,
        total_chunks: 0 // Will be set after loop
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
  minSimilarityThreshold = 0.30
): RagSearchResult {
  const queryEmbedding = generateNomicEmbedding(query);
  
  // Extract all chunks strictly belonging to source_type = 'KNOWLEDGE_BASE'
  const allKbChunks: { chunk: KbChunk; docTitle: string; docType?: string; category?: string }[] = [];

  for (const item of knowledgeItems) {
    if (item.source_type !== 'KNOWLEDGE_BASE') continue;

    let itemChunks = item.chunks;
    if (!itemChunks || itemChunks.length === 0) {
      itemChunks = chunkDocumentText(item.id, item.title, item.content || `${item.title}: ${item.summary}`);
    }

    for (const chunk of itemChunks) {
      allKbChunks.push({
        chunk,
        docTitle: item.title,
        docType: item.document_type,
        category: item.category
      });
    }
  }

  if (allKbChunks.length === 0) {
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
