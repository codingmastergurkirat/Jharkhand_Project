-- ==============================================================================
-- GOVERNMENT OF JHARKHAND COLLABORATIVE GOVERNANCE PLATFORM (SIH26043 - Team LIMITLESS)
-- 003_seed_data.sql: Sample Data, Access Codes & Resolution Proofs
-- ==============================================================================
-- NOTE:
-- User accounts (Admin, Citizen, 5 Universities, 5 Industries) are created
-- via `scripts/seed.ts` using the Supabase Auth Admin API so passwords are hashed.
-- The `on_auth_user_created` trigger automatically generates their rows in `profiles`.
-- This SQL script populates:
-- 1. Unused single-use access codes for new university/industry registrations
-- 2. 10 realistic societal problems across Jharkhand districts & domains
-- 3. Milestones, proposals, student teams, and industry CSR interests
-- 4. Impact metrics with Before/After resolution photos for completed projects
-- ==============================================================================

-- 1. PRE-GENERATED ACCESS CODES FOR TESTING
INSERT INTO public.access_codes (code, role_type, org_name, is_used)
VALUES 
    ('UNIV-JH-8821', 'university', 'Kolhan University', false),
    ('UNIV-JH-4409', 'university', 'Vinoba Bhave University', false),
    ('IND-JH-9132', 'industry', 'Hindalco Industries', false)
ON CONFLICT (code) DO NOTHING;

-- 2. SAMPLE PROBLEMS (Using deterministic UUIDs for reference)
-- UUID references:
-- Prob 1: d1111111-1111-1111-1111-111111111111 (Completed - Water Management, Ranchi)
-- Prob 2: d2222222-2222-2222-2222-222222222222 (Completed - Agriculture, Gumla)
-- Prob 3: d3333333-3333-3333-3333-333333333333 (In Progress - Environment, Dhanbad)
-- Prob 4: d4444444-4444-4444-4444-444444444444 (Assigned - Urban Infrastructure, Ranchi)
-- Prob 5: d5555555-5555-5555-5555-555555555555 (In Progress - Urban Infrastructure, East Singhbhum)
-- Prob 6: d6666666-6666-6666-6666-666666666666 (Pending - Water Management, Palamu)
-- Prob 7: d7777777-7777-7777-7777-777777777777 (Pending - Healthcare, Latehar)
-- Prob 8: d8888888-8888-8888-8888-888888888888 (Pending - Energy, West Singhbhum)
-- Prob 9: d9999999-9999-9999-9999-999999999999 (Pending - Public Administration, Bokaro)
-- Prob 10: daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa (Testing - Accessibility, Ranchi)

INSERT INTO public.problems (
    id, title, description, domain, district, lat, lng, location_source,
    photo_urls, status, support_count, submitted_by_type
) VALUES
(
    'd1111111-1111-1111-1111-111111111111',
    'Arsenic & Iron Contamination in Tribal Drinking Wells',
    'Over 14 hamlets in Namkum block rely on handpumps delivering groundwater with severe iron turbidity and arsenic trace levels exceeding permissible BIS standards, leading to widespread skin lesions and digestive illnesses among children.',
    'Water Management',
    'Ranchi',
    23.3441, 85.3096, 'auto',
    ARRAY['https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'],
    'completed',
    42,
    'Citizen'
),
(
    'd2222222-2222-2222-2222-222222222222',
    'Off-Grid Solar Cold Storage for Tribal Organic Vegetables',
    'Smallholder vegetable farmers in Bishunpur block suffer over 45% post-harvest loss during summer months due to complete absence of cold chain storage, forcing distress sales to middlemen at unremunerative prices.',
    'Agriculture',
    'Gumla',
    23.0416, 84.5422, 'auto',
    ARRAY['https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80'],
    'completed',
    68,
    'Community Organization'
),
(
    'd3333333-3333-3333-3333-333333333333',
    'Acid Mine Drainage & Toxic Runoff in Damodar River Catchment',
    'Effluent runoff from legacy abandoned open-cast coal mines is discharging acidic water (pH 3.2) heavily laden with dissolved iron and sulfates directly into the Damodar basin, destroying aquatic biodiversity and village irrigation channels.',
    'Environment',
    'Dhanbad',
    23.7957, 86.4304, 'auto',
    ARRAY['https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=800&q=80'],
    'in_progress',
    89,
    'PRI'
),
(
    'd4444444-4444-4444-4444-444444444444',
    'Smart Adaptive Traffic Control for Main Road Bottlenecks',
    'Severe traffic congestion on Albert Ekka Chowk to Overbridge corridor leads to daily emergency vehicle delays exceeding 35 minutes during peak school and office hours. Traditional static timers are unsuited for dynamic vehicle density.',
    'Urban Infrastructure',
    'Ranchi',
    23.3644, 85.3282, 'manual',
    ARRAY['https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80'],
    'assigned',
    51,
    'ULB'
),
(
    'd5555555-5555-5555-5555-555555555555',
    'Industrial Slag Waste Reutilization for Low-Cost Rural Pavements',
    'Disposal mounds of granulated blast-furnace slag occupy agricultural borders near industrial clusters. Converting this non-biodegradable waste into geopolymer stabilized road paving blocks can solve both waste accumulation and rural road connectivity.',
    'Urban Infrastructure',
    'East Singhbhum',
    22.8046, 86.2029, 'auto',
    ARRAY['https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80'],
    'in_progress',
    34,
    'Citizen'
),
(
    'd6666666-6666-6666-6666-666666666666',
    'High Fluoride Groundwater Remediation in Daltonganj Rural Schools',
    'Primary schools across Chainpur and Satbarwa blocks report skeletal and dental fluorosis among 32% of enrolled students due to deep borewell fluoride concentrations reaching 5.4 mg/L (safe limit: 1.0 mg/L).',
    'Water Management',
    'Palamu',
    24.0433, 84.0722, 'manual',
    ARRAY['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80'],
    'pending',
    76,
    'Citizen'
),
(
    'd7777777-7777-7777-7777-777777777777',
    'Solar Diagnostic Telemedicine Kiosks for Forest Fringe Health Sub-Centres',
    '18 health sub-centres in Mahuadanr valley lack regular medical officers. Patients must travel 65 km through dense forest corridors for basic ECG, blood profiling, and antenatal consultations.',
    'Healthcare',
    'Latehar',
    23.7431, 84.5029, 'manual',
    ARRAY['https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80'],
    'pending',
    57,
    'Government Department'
),
(
    'd8888888-8888-8888-8888-888888888888',
    'Micro-Hydro Kinetic Generation in Saranda Forest Hamlets',
    'Perennial hill streams flow adjacent to 9 unelectrified Particularly Vulnerable Tribal Group (PVTG) villages where grid extension is prohibited under forest conservation laws. Clean zero-head hydro generators can power community lighting.',
    'Energy',
    'West Singhbhum',
    22.2500, 85.3400, 'auto',
    ARRAY['https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80'],
    'pending',
    39,
    'Community Organization'
),
(
    'd9999999-9999-9999-9999-999999999999',
    'Panchayat Digital Record Kiosk Queue Bottleneck and Mutation Delay',
    'Citizens in Chas and Chandankiyari blocks face 90+ day backlogs for land mutation certificates and caste verification due to manual record verification bottlenecks and unreliable offline sync at block development offices.',
    'Public Administration',
    'Bokaro',
    23.6693, 86.1511, 'manual',
    ARRAY['https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80'],
    'pending',
    27,
    'Citizen'
),
(
    'daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Assistive Low-Cost Smart Ramp & Haptic Guidance for District Hospitals',
    'Visually impaired and orthopedically challenged patients encounter hazardous step thresholds and broken tactile paths at Sadar Hospital Ranchi, making independent navigation impossible.',
    'Accessibility',
    'Ranchi',
    23.3500, 85.3200, 'auto',
    ARRAY['https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'],
    'testing',
    64,
    'Citizen'
)
ON CONFLICT (id) DO NOTHING;

-- 3. MILESTONES FOR TRACKING PROGRESS
INSERT INTO public.milestones (id, problem_id, title, status, completed_at)
VALUES
-- Problem 1 (Completed)
('m1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Geological Water Sampling & Speciation Lab Testing', 'completed', NOW() - INTERVAL '45 days'),
('m1111111-1111-1111-1111-111111111112', 'd1111111-1111-1111-1111-111111111111', 'Fabrication of Low-Cost Nano-Adsorptive Filtration Column', 'completed', NOW() - INTERVAL '30 days'),
('m1111111-1111-1111-1111-111111111113', 'd1111111-1111-1111-1111-111111111111', 'Community Pilot Installation & Water Safety Certification', 'completed', NOW() - INTERVAL '10 days'),

-- Problem 2 (Completed)
('m2222222-2222-2222-2222-222222222221', 'd2222222-2222-2222-2222-222222222222', 'Thermal Insulative Chamber Design & Solar PV Sizing', 'completed', NOW() - INTERVAL '60 days'),
('m2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'Phase Change Material (PCM) Thermal Storage Integration', 'completed', NOW() - INTERVAL '35 days'),
('m2222222-2222-2222-2222-222222222223', 'd2222222-2222-2222-2222-222222222223', 'Farmer Producer Organization (FPO) Operational Handover', 'completed', NOW() - INTERVAL '5 days'),

-- Problem 3 (In Progress)
('m3333333-3333-3333-3333-333333333331', 'd3333333-3333-3333-3333-333333333333', 'Drainage Runoff Chemical Profiling & Heavy Metal Assay', 'completed', NOW() - INTERVAL '15 days'),
('m3333333-3333-3333-3333-333333333332', 'd3333333-3333-3333-3333-333333333333', 'Passive Limestone Wetland Bioreactor Pilot Construction', 'pending', NULL),
('m3333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 'Continuous Water Quality IoT Monitoring & Damodar Discharge Safety Audit', 'pending', NULL),

-- Problem 5 (In Progress)
('m5555555-5555-5555-5555-555555555551', 'd5555555-5555-5555-5555-555555555555', 'Slag Characterization & Geopolymer Activator Proportioning', 'completed', NOW() - INTERVAL '20 days'),
('m5555555-5555-5555-5555-555555555552', 'd5555555-5555-5555-5555-555555555555', 'Compressive Strength & Weathering Resistance ASTM Testing', 'pending', NULL),
('m5555555-5555-5555-5555-555555555553', 'd5555555-5555-5555-5555-555555555555', '1-km Pilot Village Road Testbed Deployment', 'pending', NULL),

-- Problem 10 (Testing)
('maaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ergonomic Gradient Measurement & Ultrasonic Sensor Array Prototyping', 'completed', NOW() - INTERVAL '12 days'),
('maaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Haptic Floor Guidance System Deployment at Sadar Hospital OPD', 'completed', NOW() - INTERVAL '3 days'),
('maaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'User Accessibility Certification by Jharkhand Divyangjan Welfare Board', 'pending', NULL)
ON CONFLICT (id) DO NOTHING;

-- 4. RESOLUTION PROOF & IMPACT METRICS (For Completed Problems)
-- Before/After visual comparison, cost saved, citizen rating & feedback
INSERT INTO public.impact_metrics (
    problem_id, people_benefited, cost_saved, 
    before_photo_url, after_photo_url, citizen_rating, citizen_feedback
) VALUES
(
    'd1111111-1111-1111-1111-111111111111',
    14200,
    380000.00,
    'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    5,
    'Our village handpumps were completely orange with rust and smelled terrible. The university installed the gravel-adsorbent filtration unit. Now water tests below 0.01 mg/L iron and crystal clear. Children are no longer falling sick!'
),
(
    'd2222222-2222-2222-2222-222222222222',
    3500,
    650000.00,
    'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80',
    5,
    'We used to sell tomatoes at 2 rupees per kilo because they would rot in 3 days. With this cold storage room running on rooftop solar, our produce stays fresh for 18 days. We sell at Ranchi market for 22 rupees. Exceptional impact!'
)
ON CONFLICT (problem_id) DO UPDATE SET
    people_benefited = EXCLUDED.people_benefited,
    cost_saved = EXCLUDED.cost_saved,
    before_photo_url = EXCLUDED.before_photo_url,
    after_photo_url = EXCLUDED.after_photo_url,
    citizen_rating = EXCLUDED.citizen_rating,
    citizen_feedback = EXCLUDED.citizen_feedback;
