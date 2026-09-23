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

// UN Sustainable Development Goals (SDGs 1-17)
export const SDG_GOALS = [
  'SDG 1: No Poverty',
  'SDG 2: Zero Hunger',
  'SDG 3: Good Health and Well-being',
  'SDG 4: Quality Education',
  'SDG 5: Gender Equality',
  'SDG 6: Clean Water and Sanitation',
  'SDG 7: Affordable and Clean Energy',
  'SDG 8: Decent Work and Economic Growth',
  'SDG 9: Industry, Innovation, and Infrastructure',
  'SDG 10: Reduced Inequalities',
  'SDG 11: Sustainable Cities and Communities',
  'SDG 12: Responsible Consumption and Production',
  'SDG 13: Climate Action',
  'SDG 14: Life Below Water',
  'SDG 15: Life on Land',
  'SDG 16: Peace, Justice, and Strong Institutions',
  'SDG 17: Partnerships for the Goals'
] as const;

export type SDGGoal = typeof SDG_GOALS[number];

// Digital Personal Data Protection Act, 2023 (DPDP Act 2023) Statutory Disclosures
export const DPDP_CONSENT_TEXT = 
  'In accordance with Section 6 of the Digital Personal Data Protection Act, 2023 (DPDP Act 2023), I hereby grant free, specific, and informed consent to the Jan Samadhan public grievance and innovation network to process my submitted issue details solely for technical analysis, field verification, and resolution. Under Section 8, exact GPS coordinates are masked from public view and accessible only to verified administrative and institutional officers.';
