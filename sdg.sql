-- ==============================================================================
-- Jan Samadhan (जन समाधान) - UN Sustainable Development Goals (SDG) Migration
-- Script: sdg.sql
-- Description: Adds optional sdg_goal column to problems table and populates existing problems
-- ==============================================================================

-- 1. Add optional sdg_goal column to public.problems table
ALTER TABLE public.problems 
ADD COLUMN IF NOT EXISTS sdg_goal TEXT;

-- 2. Add documentation comment on the column
COMMENT ON COLUMN public.problems.sdg_goal IS 'UN Sustainable Development Goal alignment chosen by submitter (optional)';

-- 3. Populate existing pre-seeded challenges with realistic UN SDG goals
UPDATE public.problems 
SET sdg_goal = 'SDG 6: Clean Water and Sanitation' 
WHERE id = 'd1111111-1111-1111-1111-111111111111';

UPDATE public.problems 
SET sdg_goal = 'SDG 2: Zero Hunger' 
WHERE id = 'd2222222-2222-2222-2222-222222222222';

UPDATE public.problems 
SET sdg_goal = 'SDG 15: Life on Land' 
WHERE id = 'd3333333-3333-3333-3333-333333333333';

UPDATE public.problems 
SET sdg_goal = 'SDG 11: Sustainable Cities and Communities' 
WHERE id = 'd4444444-4444-4444-4444-444444444444';

UPDATE public.problems 
SET sdg_goal = 'SDG 9: Industry, Innovation, and Infrastructure' 
WHERE id = 'd5555555-5555-5555-5555-555555555555';

UPDATE public.problems 
SET sdg_goal = 'SDG 6: Clean Water and Sanitation' 
WHERE id = 'd6666666-6666-6666-6666-666666666666';

UPDATE public.problems 
SET sdg_goal = 'SDG 3: Good Health and Well-being' 
WHERE id = 'd7777777-7777-7777-7777-777777777777';

UPDATE public.problems 
SET sdg_goal = 'SDG 7: Affordable and Clean Energy' 
WHERE id = 'd8888888-8888-8888-8888-888888888888';

UPDATE public.problems 
SET sdg_goal = 'SDG 16: Peace, Justice, and Strong Institutions' 
WHERE id = 'd9999999-9999-9999-9999-999999999999';

UPDATE public.problems 
SET sdg_goal = 'SDG 10: Reduced Inequalities' 
WHERE id = 'daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- 4. Fallback for any other custom problems without an SDG Goal
UPDATE public.problems SET sdg_goal = 'SDG 6: Clean Water and Sanitation' WHERE domain = 'Water Management' AND sdg_goal IS NULL;
UPDATE public.problems SET sdg_goal = 'SDG 11: Sustainable Cities and Communities' WHERE domain = 'Urban Infrastructure' AND sdg_goal IS NULL;
UPDATE public.problems SET sdg_goal = 'SDG 15: Life on Land' WHERE domain = 'Environment' AND sdg_goal IS NULL;
UPDATE public.problems SET sdg_goal = 'SDG 7: Affordable and Clean Energy' WHERE domain = 'Energy' AND sdg_goal IS NULL;
UPDATE public.problems SET sdg_goal = 'SDG 2: Zero Hunger' WHERE domain = 'Agriculture' AND sdg_goal IS NULL;
UPDATE public.problems SET sdg_goal = 'SDG 3: Good Health and Well-being' WHERE domain = 'Healthcare' AND sdg_goal IS NULL;
UPDATE public.problems SET sdg_goal = 'SDG 4: Quality Education' WHERE domain = 'Education' AND sdg_goal IS NULL;
UPDATE public.problems SET sdg_goal = 'SDG 6: Clean Water and Sanitation' WHERE domain = 'Sanitation' AND sdg_goal IS NULL;
UPDATE public.problems SET sdg_goal = 'SDG 10: Reduced Inequalities' WHERE domain = 'Accessibility' AND sdg_goal IS NULL;
UPDATE public.problems SET sdg_goal = 'SDG 8: Decent Work and Economic Growth' WHERE domain = 'Rural Livelihoods' AND sdg_goal IS NULL;
UPDATE public.problems SET sdg_goal = 'SDG 16: Peace, Justice, and Strong Institutions' WHERE domain = 'Public Administration' AND sdg_goal IS NULL;
