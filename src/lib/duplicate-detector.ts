// ==============================================================================
// Jan Samadhan Collaborative Governance Platform
// Duplicate Detection Engine (Token Overlap & Fuzzy Jaccard Similarity)
// ==============================================================================

export interface CandidateProblem {
  id: string;
  title: string;
  district: string;
  support_count?: number;
}

export interface DuplicateMatchResult {
  isDuplicate: boolean;
  matchedProblem?: CandidateProblem;
  similarityScore: number;
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'for', 'to', 'of', 'and', 'or', 'with',
  'is', 'are', 'was', 'were', 'by', 'near', 'from', 'our', 'over', 'due'
]);

function tokenize(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return new Set(words);
}

export function calculateTokenSimilarity(titleA: string, titleB: string): number {
  const tokensA = tokenize(titleA);
  const tokensB = tokenize(titleB);

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersectionCount = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) {
      intersectionCount++;
    }
  });

  const unionSize = new Set([...Array.from(tokensA), ...Array.from(tokensB)]).size;
  return unionSize === 0 ? 0 : intersectionCount / unionSize;
}

export function detectDuplicate(
  inputTitle: string,
  inputDistrict: string,
  existingProblems: CandidateProblem[],
  threshold: number = 0.35
): DuplicateMatchResult {
  if (!inputTitle || inputTitle.trim().length < 5) {
    return { isDuplicate: false, similarityScore: 0 };
  }

  // Filter existing problems strictly by matching district
  const districtProblems = existingProblems.filter(
    (p) => p.district.toLowerCase() === inputDistrict.toLowerCase()
  );

  let bestMatch: CandidateProblem | undefined;
  let highestScore = 0;

  for (const problem of districtProblems) {
    const score = calculateTokenSimilarity(inputTitle, problem.title);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = problem;
    }
  }

  if (highestScore >= threshold && bestMatch) {
    return {
      isDuplicate: true,
      matchedProblem: bestMatch,
      similarityScore: Math.round(highestScore * 100),
    };
  }

  return {
    isDuplicate: false,
    similarityScore: Math.round(highestScore * 100),
  };
}
