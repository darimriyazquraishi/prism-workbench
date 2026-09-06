const p = "extract the company guidelines for presentation and then summarize and then explain them to".toLowerCase();
const rawP = "extract the company guidelines for presentation and then summarize and then explain them to";

const asksForPPT = /\b(ppt|presentation|slides|slide deck|powerpoint)\b/.test(p);
const asksForExcel = /\b(excel|xlsx|spreadsheet|csv report)\b/.test(p);
const asksForWord = /\b(word|docx|document|approval note|formal brief|written report)\b/.test(p);
const asksForDocGen = asksForPPT || asksForExcel || asksForWord || /\b(create a document|generate a report|compile a document|draft an official)\b/.test(p);

const asksForRAG = /\b(sop|manual|guideline|guidelines|company standard|knowledge base|retrieval|cross-reference|cross reference|sop-ops|api 570|ppe|permit to work|ptw|safety protocol|confidential|information classification|inspection report|approval note|procurement|equipment maintenance|engineering calculation)\b/.test(p);

const hasRealFiles = false;

const isAmbiguousTaskCommand = !hasRealFiles && !asksForDocGen && !asksForRAG && (
  /^(summarize|summarise|extract|analyze|analyse|process)\b/i.test(p) ||
  /^(summarize it|summarize this|extract data|extract readings|process this|analyze this)$/i.test(p)
);

console.log('asksForPPT:', asksForPPT);
console.log('asksForRAG:', asksForRAG);
console.log('isAmbiguousTaskCommand:', isAmbiguousTaskCommand);

const requiresWorkflow = (hasRealFiles || asksForDocGen || asksForRAG) && !/^(hi|hello)\b/.test(p);
console.log('requiresWorkflow:', requiresWorkflow);
