-- ==============================================================================
-- JAN SAMADHAN (जन समाधान) - National Public Challenge Resolution Platform
-- 003_seed_data.sql: Pre-Generated Access Codes, Sample Issues & Resolution Proofs
-- ==============================================================================

-- 1. PRE-GENERATED ACCESS CODES FOR VERIFIED ONBOARDING
INSERT INTO public.access_codes (code, role_type, org_name, is_used)
VALUES 
    ('UNIV-JH-8821', 'university', 'Kolhan University', false),
    ('UNIV-JH-4409', 'university', 'Vinoba Bhave University', false),
    ('IND-JH-9132', 'industry', 'Hindalco Industries', false)
ON CONFLICT (code) DO UPDATE SET
    org_name = EXCLUDED.org_name,
    role_type = EXCLUDED.role_type,
    is_used = EXCLUDED.is_used,
    redeemed_by = NULL;

-- 2. SAMPLE PROBLEMS WITH MANDATORY PHOTOGRAPHIC EVIDENCE
INSERT INTO public.problems (
    id,
    title,
    description,
    domain,
    sdg_goal,
    district,
    lat,
    lng,
    location_source,
    photo_urls,
    status,
    support_count,
    submitted_by_type
) VALUES
(
    'd1111111-1111-1111-1111-111111111111',
    'Arsenic & Iron Contamination in Drinking Water Wells',
    'Over 14 village hamlets rely on community handpumps delivering groundwater with severe iron turbidity and arsenic trace levels exceeding permissible standards, causing widespread digestive and dermatological illnesses.',
    'Water Management',
    'SDG 6: Clean Water and Sanitation',
    'Ranchi',
    23.3441, 85.3096, 'auto',
    ARRAY[
        'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80'
    ],
    'completed',
    42,
    'Citizen'
),
(
    'd2222222-2222-2222-2222-222222222222',
    'Off-Grid Solar Cold Storage for Smallholder Farming Produce',
    'Smallholder organic vegetable growers suffer over 45% post-harvest spoilage during peak summer months due to complete absence of cold chain facilities, forcing distressed fire-sales at local weekly haats.',
    'Agriculture',
    'SDG 2: Zero Hunger',
    'Gumla',
    23.0416, 84.5422, 'auto',
    ARRAY[
        'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80'
    ],
    'completed',
    68,
    'Community Organization'
),
(
    'd3333333-3333-3333-3333-333333333333',
    'Acid Mine Drainage & Toxic Effluent Runoff in River Catchment',
    'Discharge from legacy open-cast mining quarries is releasing acidic runoff heavily laden with dissolved iron and sulfates directly into local stream basins, impairing agricultural irrigation canals.',
    'Environment',
    'SDG 15: Life on Land',
    'Dhanbad',
    23.7957, 86.4304, 'auto',
    ARRAY['https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=800&q=80'],
    'in_progress',
    89,
    'PRI'
),
(
    'd4444444-4444-4444-4444-444444444444',
    'Smart Adaptive Traffic Signal Grid for High-Density Urban Corridors',
    'Severe traffic congestion on major metropolitan junction corridors leads to critical emergency ambulance delays. Existing fixed-timer systems cannot adapt to variable traffic surges during office hours.',
    'Urban Infrastructure',
    'SDG 11: Sustainable Cities and Communities',
    'Ranchi',
    23.3644, 85.3282, 'manual',
    ARRAY['https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80'],
    'assigned',
    51,
    'ULB'
),
(
    'd5555555-5555-5555-5555-555555555555',
    'Industrial Slag Waste Reutilization for Low-Cost Rural Pavement Blocks',
    'Piles of industrial granulated blast-furnace slag occupy agricultural borders. Converting this non-biodegradable waste into geopolymer interlocking paving blocks solves both industrial waste accumulation and village connectivity.',
    'Urban Infrastructure',
    'SDG 9: Industry, Innovation, and Infrastructure',
    'East Singhbhum',
    22.8046, 86.2029, 'auto',
    ARRAY['https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80'],
    'in_progress',
    34,
    'Citizen'
),
(
    'd6666666-6666-6666-6666-666666666666',
    'High Fluoride Groundwater Remediation in Rural Schools',
    'Primary and secondary schools report skeletal and dental fluorosis among 32% of enrolled children due to deep borewell fluoride concentrations reaching 5.4 mg/L against the safe 1.0 mg/L limit.',
    'Water Management',
    'SDG 6: Clean Water and Sanitation',
    'Palamu',
    24.0433, 84.0722, 'manual',
    ARRAY['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80'],
    'pending',
    76,
    'Citizen'
),
(
    'd7777777-7777-7777-7777-777777777777',
    'Solar Diagnostic Telemedicine Kiosks for Forest Fringe Primary Health Centres',
    'Rural health sub-centres in remote valley pockets lack specialized medical practitioners. Patients currently travel 60+ km for basic cardiac telemetry, blood glucose profiling, and antenatal assessments.',
    'Healthcare',
    'SDG 3: Good Health and Well-being',
    'Latehar',
    23.7431, 84.5029, 'manual',
    ARRAY['https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80'],
    'pending',
    57,
    'Government Department'
),
(
    'd8888888-8888-8888-8888-888888888888',
    'Micro-Hydro Kinetic Power Generation for Off-Grid Remote Hamlets',
    'Perennial hill streams flow adjacent to unelectrified forest hamlets where standard grid extension is restricted. Clean zero-head kinetic hydro turbines can provide continuous clean lighting and charging.',
    'Energy',
    'SDG 7: Affordable and Clean Energy',
    'West Singhbhum',
    22.2500, 85.3400, 'auto',
    ARRAY['https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80'],
    'pending',
    39,
    'Community Organization'
),
(
    'd9999999-9999-9999-9999-999999999999',
    'Panchayat Citizen Service Kiosk Queue Delays & Verification Bottlenecks',
    'Citizens face significant delays for caste certificates, disability pensions, and land records due to manual record verification bottlenecks and spotty offline sync at rural development offices.',
    'Public Administration',
    'SDG 16: Peace, Justice, and Strong Institutions',
    'Bokaro',
    23.6693, 86.1511, 'manual',
    ARRAY['https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80'],
    'pending',
    27,
    'Citizen'
),
(
    'daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Assistive Smart Ramp & Haptic Guidance Systems for District Public Hospitals',
    'Visually impaired and orthopedically disabled citizens encounter steep gradients and broken tactile guidance paths at the district civil hospital, making independent navigation hazardous.',
    'Accessibility',
    'SDG 10: Reduced Inequalities',
    'Ranchi',
    23.3500, 85.3200, 'auto',
    ARRAY['https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'],
    'testing',
    64,
    'Citizen'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    photo_urls = EXCLUDED.photo_urls,
    status = EXCLUDED.status;

-- 3. MILESTONES FOR PROGRESSION
INSERT INTO public.milestones (id, problem_id, title, status, completed_at)
VALUES
-- Problem 1 (Completed)
('a1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Water Quality Sampling & Spectrometry Assays', 'completed', NOW() - INTERVAL '45 days'),
('a1111111-1111-1111-1111-111111111112', 'd1111111-1111-1111-1111-111111111111', 'Fabrication of Low-Cost Nano-Adsorptive Filter Columns', 'completed', NOW() - INTERVAL '30 days'),
('a1111111-1111-1111-1111-111111111113', 'd1111111-1111-1111-1111-111111111111', 'Community Pilot Deployment & Potability Certification', 'completed', NOW() - INTERVAL '10 days'),

-- Problem 2 (Completed)
('a2222222-2222-2222-2222-222222222221', 'd2222222-2222-2222-2222-222222222222', 'Thermal Insulative Chamber Engineering & Solar PV Sizing', 'completed', NOW() - INTERVAL '60 days'),
('a2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'Phase Change Material (PCM) Thermal Storage Integration', 'completed', NOW() - INTERVAL '35 days'),
('a2222222-2222-2222-2222-222222222223', 'd2222222-2222-2222-2222-222222222222', 'Farmer Producer Collective Handover & Training', 'completed', NOW() - INTERVAL '5 days'),

-- Problem 3 (In Progress)
('a3333333-3333-3333-3333-333333333331', 'd3333333-3333-3333-3333-333333333333', 'Drainage Runoff Chemical Profiling & Heavy Metal Assay', 'completed', NOW() - INTERVAL '15 days'),
('a3333333-3333-3333-3333-333333333332', 'd3333333-3333-3333-3333-333333333333', 'Passive Limestone Bioreactor Wetland Pilot Construction', 'pending', NULL),
('a3333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 'Continuous IoT Water Quality Monitoring Station Setup', 'pending', NULL)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    completed_at = EXCLUDED.completed_at;

-- 4. RESOLUTION PROOFS & CITIZEN RATINGS
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
    'Our handpumps previously pumped orange, foul-smelling water. The university faculty and student team built an indigenous adsorbent filter unit. Now the water is certified crystal clear and safe for consumption!'
),
(
    'd2222222-2222-2222-2222-222222222222',
    3500,
    650000.00,
    'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80',
    5,
    'Before this rooftop solar cold storage room was installed, our organic tomatoes rotted in 3 days. Now they remain fresh for over 18 days, enabling fair wholesale market prices and doubling farmer income.'
)
ON CONFLICT (problem_id) DO UPDATE SET
    people_benefited = EXCLUDED.people_benefited,
    cost_saved = EXCLUDED.cost_saved,
    before_photo_url = EXCLUDED.before_photo_url,
    after_photo_url = EXCLUDED.after_photo_url,
    citizen_rating = EXCLUDED.citizen_rating,
    citizen_feedback = EXCLUDED.citizen_feedback;
