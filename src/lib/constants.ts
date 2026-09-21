// ==============================================================================
// Jan Samadhan (जन समाधान) - National Public Challenge Resolution Platform
// Constants & Legal Framework Disclosures
// ==============================================================================

export const DISTRICTS_LIST = [
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
  'West Singhbhum',
  'Delhi NCR',
  'Mumbai Suburban',
  'Bengaluru Urban',
  'Kolkata',
  'Chennai',
  'Hyderabad',
  'Pune',
  'Ahmedabad'
] as const;

export type DistrictOption = typeof DISTRICTS_LIST[number];

// Alias for backward compatibility
export const JHARKHAND_DISTRICTS = DISTRICTS_LIST;

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
  'Panchayat / PRI',
  'Urban Local Body (ULB)',
  'Public Agency'
] as const;

export type SubmitterType = typeof SUBMITTER_TYPES[number];

// Digital Personal Data Protection Act, 2023 (DPDP Act 2023) Statutory Disclosures
export const DPDP_CONSENT_TEXT = 
  'In accordance with Section 6 of the Digital Personal Data Protection Act, 2023 (DPDP Act 2023), I hereby grant free, specific, and informed consent to the Jan Samadhan public grievance and innovation network to process my submitted issue details solely for technical analysis, field verification, and resolution. Under Section 8, exact GPS coordinates are masked from public view and accessible only to verified administrative and institutional officers.';
