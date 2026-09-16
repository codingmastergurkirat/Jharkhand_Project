// ==============================================================================
// Government of Jharkhand Collaborative Governance Platform
// Deterministic Matching Engine (Explainable, Transparent Scoring)
// ==============================================================================

export interface UniversityProfile {
  id: string;
  name: string;
  org_name?: string;
  district?: string;
  domain_tags?: string[];
  facilities?: string;
  expertise?: string;
}

export interface ProblemItem {
  id: string;
  title: string;
  description: string;
  domain: string;
  district: string;
}

export interface MatchScoreBreakdown {
  domainMatch: boolean;
  domainPoints: number;
  districtMatch: boolean;
  districtPoints: number;
  matchedKeywords: string[];
  keywordPoints: number;
}

export interface UniversityMatch {
  universityId: string;
  universityName: string;
  district: string;
  totalScore: number;
  breakdown: MatchScoreBreakdown;
  reasoning: string;
}

const KEYWORD_DICTIONARY: Record<string, string[]> = {
  'Water Management': ['water', 'arsenic', 'iron', 'filtration', 'groundwater', 'fluoride', 'borewell', 'effluent', 'hydrology'],
  'Environment': ['mine', 'mining', 'drainage', 'damodar', 'pollution', 'acid', 'sustainability', 'ecology', 'biodiversity', 'remediation'],
  'Urban Infrastructure': ['traffic', 'road', 'corridor', 'pavement', 'slag', 'geopolymer', 'civil', 'bridge', 'urban', 'congestion', 'signal'],
  'Agriculture': ['cold', 'storage', 'crop', 'harvest', 'farming', 'produce', 'vegetable', 'tribal', 'rural', 'solar', 'fpo'],
  'Healthcare': ['telemedicine', 'health', 'clinic', 'kiosk', 'diagnostic', 'medical', 'ecg', 'blood', 'hospital', 'patient'],
  'Energy': ['solar', 'hydro', 'micro-hydro', 'kinetic', 'renewable', 'power', 'grid', 'off-grid', 'electricity', 'turbine'],
  'Accessibility': ['wheelchair', 'ramp', 'haptic', 'tactile', 'blind', 'assistive', 'hospital', 'orthopedic', 'gradient'],
  'Education': ['school', 'computing', 'training', 'vocational', 'literacy', 'learning', 'incubator', 'labs'],
  'Public Administration': ['mutation', 'record', 'panchayat', 'kiosk', 'certificate', 'software', 'workflow', 'e-governance'],
  'Rural Livelihoods': ['livelihood', 'tribal', 'handicraft', 'forest', 'artisan', 'income', 'employment', 'self-help'],
  'Sanitation': ['waste', 'sanitation', 'toilets', 'sewage', 'solid', 'drainage', 'hygiene']
};

export function calculateMatchScore(problem: ProblemItem, university: UniversityProfile): UniversityMatch {
  const universityName = university.org_name || university.name;
  const univDistrict = university.district || '';
  const domainTags = university.domain_tags || [];
  const facilitiesAndExpertise = (university.facilities || '' + ' ' + (university.expertise || '')).toLowerCase();

  const isDirectDomainMatch = domainTags.some(
    (tag) => tag.toLowerCase() === problem.domain.toLowerCase()
  );
  const domainPoints = isDirectDomainMatch ? 50 : 0;

  const isDistrictMatch = univDistrict.toLowerCase() === problem.district.toLowerCase();
  const districtPoints = isDistrictMatch ? 30 : 0;

  const candidateKeywords = KEYWORD_DICTIONARY[problem.domain] || [];
  const problemText = (problem.title + ' ' + problem.description).toLowerCase();
  
  const matchedKeywords: string[] = [];
  for (const kw of candidateKeywords) {
    if (problemText.includes(kw) && facilitiesAndExpertise.includes(kw)) {
      matchedKeywords.push(kw);
    }
  }

  const keywordPoints = Math.min(20, matchedKeywords.length * 5);
  const totalScore = domainPoints + districtPoints + keywordPoints;

  const reasons: string[] = [];
  if (isDirectDomainMatch) {
    reasons.push('+50 pts: Institution specialization in ' + problem.domain);
  } else {
    reasons.push('+0 pts: Domain ' + problem.domain + ' not in listed tags');
  }

  if (isDistrictMatch) {
    reasons.push('+30 pts: Local district presence in ' + problem.district);
  } else {
    reasons.push('+0 pts: Located in ' + (univDistrict || 'another district'));
  }

  if (matchedKeywords.length > 0) {
    reasons.push('+' + keywordPoints + ' pts: Overlap on [' + matchedKeywords.slice(0, 3).join(', ') + ']');
  }

  const reasoning = 'Score ' + totalScore + '/100: ' + reasons.join(' | ');

  return {
    universityId: university.id,
    universityName,
    district: univDistrict,
    totalScore,
    breakdown: {
      domainMatch: isDirectDomainMatch,
      domainPoints,
      districtMatch: isDistrictMatch,
      districtPoints,
      matchedKeywords,
      keywordPoints,
    },
    reasoning,
  };
}

export function rankUniversities(problem: ProblemItem, universities: UniversityProfile[]): UniversityMatch[] {
  return universities
    .map((univ) => calculateMatchScore(problem, univ))
    .sort((a, b) => b.totalScore - a.totalScore);
}
