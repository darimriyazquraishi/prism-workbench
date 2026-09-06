import { searchKnowledgeBaseWithNomic } from '../services/nomicEmbeddings';
import type { KnowledgeItem } from '../types/antigravity';

export interface TestCaseResult {
  query: string;
  expectedDocumentTitle: string | string[];
  retrievedGuidanceCount: number;
  topMatchedTitle: string | null;
  topScore: number | null;
  totalChunksSearched: number;
  passed: boolean;
}

export function runRagRetrievalTestSuite(knowledgeItems: KnowledgeItem[]): TestCaseResult[] {
  const testCases = [
    {
      query: "extract the company guidelines for presentation and then summarize and then explain them to",
      expected: ["Management Presentation Guideline", "mrpl_presentation_guidelines.pdf"]
    },
    {
      query: "company guidelines for presentation",
      expected: ["Management Presentation Guideline", "mrpl_presentation_guidelines.pdf"]
    },
    {
      query: "What should management presentations contain?",
      expected: ["Management Presentation Guideline", "mrpl_presentation_guidelines.pdf"]
    },
    {
      query: "presentation structure and approval requirements",
      expected: ["Management Presentation Guideline", "mrpl_presentation_guidelines.pdf"]
    },
    {
      query: "PPE requirements",
      expected: ["Refinery Safety Protocol", "01_Refinery_Safety_Protocol.pdf"]
    },
    {
      query: "permit to work requirements",
      expected: ["Refinery Safety Protocol", "01_Refinery_Safety_Protocol.pdf"]
    },
    {
      query: "engineering calculation verification",
      expected: ["Engineering Calculation Documentation Guideline", "07_Engineering_Calculation_Documentation_Guideline.pdf"]
    },
    {
      query: "confidential information and AI usage",
      expected: ["Information Classification Guideline", "Internal AI Assistant Usage Guideline", "Confidential Data Handling Procedure"]
    }
  ];

  const results: TestCaseResult[] = [];

  console.log('=== STARTING RAG RETRIEVAL REGRESSION TEST SUITE ===');

  for (const tc of testCases) {
    const res = searchKnowledgeBaseWithNomic(tc.query, knowledgeItems);
    const topMatch = res.guidance[0] || null;
    
    let passed = false;
    if (topMatch) {
      const matchTitle = topMatch.title.toLowerCase();
      passed = tc.expected.some(exp => matchTitle.includes(exp.toLowerCase()));
    }

    const testResult: TestCaseResult = {
      query: tc.query,
      expectedDocumentTitle: tc.expected,
      retrievedGuidanceCount: res.guidance.length,
      topMatchedTitle: topMatch ? topMatch.title : null,
      topScore: topMatch ? (topMatch.relevanceScore || null) : null,
      totalChunksSearched: res.totalChunksSearched,
      passed
    };

    results.push(testResult);

    console.log(`[TEST CASE] Query: "${tc.query}"
    Passed: ${passed ? '✓ YES' : '✗ NO'}
    Top Match: ${testResult.topMatchedTitle || 'None'} (Score: ${testResult.topScore})
    Retrieved Chunks: ${res.guidance.length} / Chunks Searched: ${res.totalChunksSearched}`);
  }

  const passedCount = results.filter(r => r.passed).length;
  console.log(`=== TEST SUMMARY: ${passedCount} / ${results.length} PASSED ===`);

  return results;
}

