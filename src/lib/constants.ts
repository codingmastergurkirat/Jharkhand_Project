// ==============================================================================
// Government of Jharkhand Collaborative Governance Platform
// Constants & Legal Framework Disclosures
// ==============================================================================

export const JHARKHAND_DISTRICTS = [
  'Bokaro',
  'Chatra',
  'Deoghar',
  'Dhanbad',
  'Dumka',
  'East Singhbhum',
  'Garhwa',
  'Giridih',
  'Godda',
  'Gumla',
  'Hazaribagh',
  'Jamtara',
  'Khunti',
  'Koderma',
  'Latehar',
  'Lohardaga',
  'Pakur',
  'Palamu',
  'Ramgarh',
  'Ranchi',
  'Sahibganj',
  'Saraikela Kharsawan',
  'Simdega',
  'West Singhbhum'
] as const;

export type JharkhandDistrict = typeof JHARKHAND_DISTRICTS[number];

export const OFFICIAL_DOMAINS = [
  'Education',
  'Healthcare',
  'Agriculture',
  'Water Management',
  'Sanitation',
  'Environment',
  'Energy',
  'Urban Infrastructure',
  'Accessibility',
  'Public Administration',
  'Rural Livelihoods'
] as const;

export type ProblemDomain = typeof OFFICIAL_DOMAINS[number];

export const SUBMITTER_TYPES = [
  'Citizen',
  'Community Organization',
  'PRI',
  'ULB',
  'Government Department'
] as const;

export type SubmitterType = typeof SUBMITTER_TYPES[number];

// Digital Personal Data Protection Act, 2023 (DPDP Act 2023) Statutory Disclosures
export const DPDP_CONSENT_TEXT = 
  'In accordance with Section 6 of the Digital Personal Data Protection Act, 2023 (DPDP Act 2023), I hereby give free, specific, informed, and unconditional consent to the Government of Jharkhand to process my submitted details solely for addressing and resolving the reported public challenge. I acknowledge that under Section 8, exact GPS coordinates are masked from public view for citizen privacy, and will only be accessible to authorized district administrative officers.';
