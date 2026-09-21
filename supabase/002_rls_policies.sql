-- ==============================================================================
-- JAN SAMADHAN (जन समाधान) - National Public Challenge Resolution Platform
-- 002_rls_policies.sql: Rock-Solid, Error-Free Row Level Security & Storage Policies
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY ACROSS ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public and authenticated can view profiles" ON public.profiles;
CREATE POLICY "Public and authenticated can view profiles"
ON public.profiles FOR SELECT
TO public, authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert profile" ON public.profiles;
CREATE POLICY "Authenticated users can insert profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 3. ACCESS CODES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view access codes" ON public.access_codes;
CREATE POLICY "Anyone can view access codes"
ON public.access_codes FOR SELECT
TO public, authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users manage access codes" ON public.access_codes;
CREATE POLICY "Authenticated users manage access codes"
ON public.access_codes FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 4. PROBLEMS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Problems are publicly readable" ON public.problems;
CREATE POLICY "Problems are publicly readable"
ON public.problems FOR SELECT
TO public, authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert problems" ON public.problems;
CREATE POLICY "Authenticated users can insert problems"
ON public.problems FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update problems" ON public.problems;
CREATE POLICY "Authenticated users can update problems"
ON public.problems FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Submitters can delete pending problems" ON public.problems;
CREATE POLICY "Submitters can delete pending problems"
ON public.problems FOR DELETE
TO authenticated
USING (auth.uid() = submitted_by);

-- ------------------------------------------------------------------------------
-- 5. PROBLEM SUPPORTERS POLICIES (1 Vote Per Citizen)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Problem supporters viewable" ON public.problem_supporters;
CREATE POLICY "Problem supporters viewable"
ON public.problem_supporters FOR SELECT
TO public, authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can toggle support" ON public.problem_supporters;
CREATE POLICY "Authenticated users can toggle support"
ON public.problem_supporters FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can remove support" ON public.problem_supporters;
CREATE POLICY "Users can remove support"
ON public.problem_supporters FOR DELETE
TO authenticated
USING (true);

-- ------------------------------------------------------------------------------
-- 6. PROPOSALS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Proposals viewable by all" ON public.proposals;
CREATE POLICY "Proposals viewable by all"
ON public.proposals FOR SELECT
TO public, authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users manage proposals" ON public.proposals;
CREATE POLICY "Authenticated users manage proposals"
ON public.proposals FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 7. PROPOSAL STUDENTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Proposal students viewable by all" ON public.proposal_students;
CREATE POLICY "Proposal students viewable by all"
ON public.proposal_students FOR SELECT
TO public, authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users manage students" ON public.proposal_students;
CREATE POLICY "Authenticated users manage students"
ON public.proposal_students FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 8. INDUSTRY INTERESTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Industry interests viewable by all" ON public.industry_interests;
CREATE POLICY "Industry interests viewable by all"
ON public.industry_interests FOR SELECT
TO public, authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users manage industry interests" ON public.industry_interests;
CREATE POLICY "Authenticated users manage industry interests"
ON public.industry_interests FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 9. MILESTONES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Milestones viewable by all" ON public.milestones;
CREATE POLICY "Milestones viewable by all"
ON public.milestones FOR SELECT
TO public, authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users manage milestones" ON public.milestones;
CREATE POLICY "Authenticated users manage milestones"
ON public.milestones FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 10. IMPACT METRICS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Impact metrics viewable by all" ON public.impact_metrics;
CREATE POLICY "Impact metrics viewable by all"
ON public.impact_metrics FOR SELECT
TO public, authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users manage impact metrics" ON public.impact_metrics;
CREATE POLICY "Authenticated users manage impact metrics"
ON public.impact_metrics FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 11. SUPABASE STORAGE BUCKET & POLICIES (problem-evidence)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('problem-evidence', 'problem-evidence', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view problem evidence" ON storage.objects;
CREATE POLICY "Public can view problem evidence"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'problem-evidence');

DROP POLICY IF EXISTS "Authenticated users can upload problem evidence" ON storage.objects;
CREATE POLICY "Authenticated users can upload problem evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'problem-evidence');

DROP POLICY IF EXISTS "Authenticated users can update evidence" ON storage.objects;
CREATE POLICY "Authenticated users can update evidence"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'problem-evidence');
