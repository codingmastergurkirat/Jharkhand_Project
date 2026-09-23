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

// Pre-registered Premier Universities inside Jharkhand
export interface PresetUniversity {
  id: string;
  name: string;
  org_name: string;
  email: string;
  pass: string;
  district: string;
  domain_tags: string[];
  expertise: string;
  facilities: string;
  role: 'university';
}

export const PRESET_UNIVERSITIES: PresetUniversity[] = [
  {
    id: '9fdb6403-fa9e-40c9-85bb-41a0d440552e',
    name: 'Indian Institute of Technology (ISM) Dhanbad',
    org_name: 'Indian Institute of Technology (ISM) Dhanbad',
    email: 'admin@iitism.ac.in',
    pass: 'Univ@IITISM2026',
    district: 'Dhanbad',
    domain_tags: ['Environment', 'Energy', 'Urban Infrastructure', 'Water Management'],
    expertise: 'Advanced engineering, earth sciences, geological engineering, mechanical engineering',
    facilities: 'High-tier research labs, technical testing environments',
    role: 'university'
  },
  {
    id: 'a335a792-0442-40f9-94e5-c0e3b247b5d8',
    name: 'Birla Institute of Technology (BIT) Mesra',
    org_name: 'Birla Institute of Technology (BIT) Mesra',
    email: 'admin@bitmesra.ac.in',
    pass: 'Univ@BIT2026',
    district: 'Ranchi',
    domain_tags: ['Education', 'Public Administration', 'Accessibility', 'Urban Infrastructure'],
    expertise: 'Computer science, electrical engineering, aerospace engineering, civil engineering',
    facilities: 'Software incubators, advanced computing centers',
    role: 'university'
  },
  {
    id: 'aa97822b-f310-4e28-9da7-a90494a0bd9d',
    name: 'National Institute of Technology (NIT) Jamshedpur',
    org_name: 'National Institute of Technology (NIT) Jamshedpur',
    email: 'admin@nitjsr.ac.in',
    pass: 'Univ@NIT2026',
    district: 'East Singhbhum',
    domain_tags: ['Urban Infrastructure', 'Environment', 'Energy'],
    expertise: 'Metallurgical engineering, manufacturing processes, automation',
    facilities: 'Industrial simulation labs, core engineering workshops',
    role: 'university'
  },
  {
    id: '1cc65eab-9a3d-4ed3-b2f9-3d51d08573f9',
    name: 'Central University of Jharkhand',
    org_name: 'Central University of Jharkhand',
    email: 'admin@cuj.ac.in',
    pass: 'Univ@CUJ2026',
    district: 'Ranchi',
    domain_tags: ['Rural Livelihoods', 'Environment', 'Agriculture', 'Energy'],
    expertise: 'Interdisciplinary sciences, renewable energy, environmental sustainability',
    facilities: 'Research databases, community-oriented research centers',
    role: 'university'
  },
  {
    id: 'cd966c3d-9a38-4c7e-a281-6c6e5cbcb260',
    name: 'Usha Martin University',
    org_name: 'Usha Martin University',
    email: 'admin@umu.ac.in',
    pass: 'Univ@UMU2026',
    district: 'Ranchi',
    domain_tags: ['Education', 'Healthcare', 'Accessibility'],
    expertise: 'Industry-driven engineering courses, computer science, vocational training',
    facilities: 'Modern infrastructure, placement cells, industry-interface labs',
    role: 'university'
  }
];

// Pre-registered Corporate CSR Industry Partners
export interface PresetIndustry {
  id: string;
  name: string;
  org_name: string;
  email: string;
  pass: string;
  district: string;
  domain_tags: string[];
  expertise: string;
  interest_type: string;
  role: 'industry';
}

export const PRESET_INDUSTRIES: PresetIndustry[] = [
  {
    id: '00f6c638-d39a-4b11-886f-b7b68499affc',
    name: 'Tata Steel Limited',
    org_name: 'Tata Steel Limited',
    email: 'csr@tatasteel.com',
    pass: 'Ind@Tata2026',
    district: 'East Singhbhum',
    domain_tags: ['Healthcare', 'Education', 'Rural Livelihoods', 'Urban Infrastructure'],
    expertise: 'Heavy steel manufacturing, disaster management, livelihood enhancement',
    interest_type: 'both',
    role: 'industry'
  },
  {
    id: 'a8a74d70-41a8-4640-8f5b-d047a43a01b3',
    name: 'Central Coalfields Limited (CCL)',
    org_name: 'Central Coalfields Limited (CCL)',
    email: 'csr@centralcoalfields.in',
    pass: 'Ind@CCL2026',
    district: 'Ranchi',
    domain_tags: ['Sanitation', 'Healthcare', 'Energy', 'Environment'],
    expertise: 'Public health initiatives, large-scale sanitation installations',
    interest_type: 'funding',
    role: 'industry'
  },
  {
    id: '28fdd89e-9fa0-4ef6-ad0e-39a16d3f84eb',
    name: 'Bokaro Steel Plant (SAIL)',
    org_name: 'Bokaro Steel Plant (SAIL)',
    email: 'csr@sailbokaro.in',
    pass: 'Ind@SAIL2026',
    district: 'Bokaro',
    domain_tags: ['Urban Infrastructure', 'Energy', 'Water Management'],
    expertise: 'Iron and steel production, heavy industry infrastructure',
    interest_type: 'both',
    role: 'industry'
  },
  {
    id: '5e7e125d-8215-42d0-9414-a5d49f7fbc7e',
    name: 'Eastern Coalfields Limited (ECL)',
    org_name: 'Eastern Coalfields Limited (ECL)',
    email: 'csr@easterncoal.gov.in',
    pass: 'Ind@ECL2026',
    district: 'Dhanbad',
    domain_tags: ['Rural Livelihoods', 'Education', 'Agriculture'],
    expertise: 'Mining operations, extensive rural development projects',
    interest_type: 'funding',
    role: 'industry'
  },
  {
    id: '2bf6ee6e-a8ea-45e9-a42a-1dae185a2e62',
    name: 'Uranium Corporation of India Limited (UCIL)',
    org_name: 'Uranium Corporation of India Limited (UCIL)',
    email: 'contact@ucil.gov.in',
    pass: 'Ind@UCIL2026',
    district: 'East Singhbhum',
    domain_tags: ['Environment', 'Energy', 'Healthcare'],
    expertise: 'Specialized environmental monitoring and community healthcare',
    interest_type: 'both',
    role: 'industry'
  }
];

