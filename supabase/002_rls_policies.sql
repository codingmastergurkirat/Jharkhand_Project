-- ==============================================================================
-- GOVERNMENT OF JHARKHAND COLLABORATIVE GOVERNANCE PLATFORM (SIH26043 - Team LIMITLESS)
-- 002_rls_policies.sql: Row Level Security (RLS) & Storage Policies
-- Run this in the Supabase SQL Editor as the second migration.
-- ==============================================================================

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------------------------
-- 1. PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Anyone authenticated can view user profiles (needed for directory & matching)
CREATE POLICY "Profiles viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated, anon
USING (true);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins have full access to profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 2. ACCESS CODES POLICIES
-- ------------------------------------------------------------------------------
-- Admins can view and manage all access codes
CREATE POLICY "Admins manage access codes"
ON public.access_codes FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Users can view the access code they redeemed
CREATE POLICY "Users view redeemed codes"
ON public.access_codes FOR SELECT
TO authenticated
USING (redeemed_by = auth.uid());

-- ------------------------------------------------------------------------------
-- 3. PROBLEMS POLICIES
-- ------------------------------------------------------------------------------
-- Anyone (citizens, universities, industries, public) can view problems
CREATE POLICY "Problems are publicly readable"
ON public.problems FOR SELECT
TO authenticated, anon
USING (true);

-- Authenticated users (citizens) can submit new problems
CREATE POLICY "Citizens can insert problems"
ON public.problems FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = submitted_by);

-- Citizens can edit their own problems while still 'pending'
CREATE POLICY "Citizens can update own pending problems"
ON public.problems FOR UPDATE
TO authenticated
USING (auth.uid() = submitted_by AND status = 'pending')
WITH CHECK (auth.uid() = submitted_by);

-- Admins and assigned universities can update problems
CREATE POLICY "Admins and assigned universities can update problems"
ON public.problems FOR UPDATE
TO authenticated
USING (
    public.is_admin() OR 
    auth.uid() = assigned_university_id
);

-- ------------------------------------------------------------------------------
-- 4. PROBLEM SUPPORTERS POLICIES (1 vote per user)
-- ------------------------------------------------------------------------------
-- Supporters list is publicly viewable
CREATE POLICY "Problem supporters viewable"
ON public.problem_supporters FOR SELECT
TO authenticated, anon
USING (true);

-- Authenticated users can upvote (insert their own vote)
CREATE POLICY "Users can insert own support"
ON public.problem_supporters FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can remove their own upvote
CREATE POLICY "Users can delete own support"
ON public.problem_supporters FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. PROPOSALS POLICIES
-- ------------------------------------------------------------------------------
-- Proposals are readable by authenticated users and anon (for discovery)
CREATE POLICY "Proposals viewable by all"
ON public.proposals FOR SELECT
TO authenticated, anon
USING (true);

-- Universities can create proposals for problems
CREATE POLICY "Universities can insert proposals"
ON public.proposals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = university_id);

-- Universities can update their own proposals; Admins can update any
CREATE POLICY "Universities can update own proposals"
ON public.proposals FOR UPDATE
TO authenticated
USING (auth.uid() = university_id OR public.is_admin())
WITH CHECK (auth.uid() = university_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. PROPOSAL STUDENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Proposal students viewable by all"
ON public.proposal_students FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Universities and Admins manage proposal students"
ON public.proposal_students FOR ALL
TO authenticated
USING (
    public.is_admin() OR 
    EXISTS (
        SELECT 1 FROM public.proposals p 
        WHERE p.id = proposal_students.proposal_id AND p.university_id = auth.uid()
    )
);

-- ------------------------------------------------------------------------------
-- 7. INDUSTRY INTERESTS POLICIES
-- ------------------------------------------------------------------------------
-- Industry can see their own interests; proposal university and admin can see them
CREATE POLICY "Industry interests viewable by involved parties"
ON public.industry_interests FOR SELECT
TO authenticated
USING (
    public.is_admin() OR
    industry_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.proposals p 
        WHERE p.id = industry_interests.proposal_id AND p.university_id = auth.uid()
    )
);

-- Industry users can insert expressions of interest
CREATE POLICY "Industry can insert interest"
ON public.industry_interests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = industry_id);

-- Industry can update their own interest
CREATE POLICY "Industry can update own interest"
ON public.industry_interests FOR UPDATE
TO authenticated
USING (auth.uid() = industry_id);

-- ------------------------------------------------------------------------------
-- 8. MILESTONES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Milestones viewable by all"
ON public.milestones FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Assigned universities and Admins manage milestones"
ON public.milestones FOR ALL
TO authenticated
USING (
    public.is_admin() OR 
    EXISTS (
        SELECT 1 FROM public.problems pr 
        WHERE pr.id = milestones.problem_id AND pr.assigned_university_id = auth.uid()
    )
);

-- ------------------------------------------------------------------------------
-- 9. IMPACT METRICS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Impact metrics viewable by all"
ON public.impact_metrics FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Assigned universities and Admins can insert/update resolution metrics"
ON public.impact_metrics FOR INSERT
TO authenticated
WITH CHECK (
    public.is_admin() OR 
    EXISTS (
        SELECT 1 FROM public.problems pr 
        WHERE pr.id = impact_metrics.problem_id AND pr.assigned_university_id = auth.uid()
    )
);

CREATE POLICY "Assigned universities and Admins can update metrics"
ON public.impact_metrics FOR UPDATE
TO authenticated
USING (
    public.is_admin() OR 
    EXISTS (
        SELECT 1 FROM public.problems pr 
        WHERE pr.id = impact_metrics.problem_id AND pr.assigned_university_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.problems pr 
        WHERE pr.id = impact_metrics.problem_id AND pr.submitted_by = auth.uid()
    )
);

-- ==============================================================================
-- 10. SUPABASE STORAGE SETUP & POLICIES
-- Bucket: problem-evidence
-- ==============================================================================

-- Create bucket if it does not exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('problem-evidence', 'problem-evidence', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read access for images so they render without expiring signed URLs
DROP POLICY IF EXISTS "Public can view problem evidence" ON storage.objects;
CREATE POLICY "Public can view problem evidence"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'problem-evidence');

-- Authenticated users can upload evidence photos
DROP POLICY IF EXISTS "Authenticated users can upload problem evidence" ON storage.objects;
CREATE POLICY "Authenticated users can upload problem evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'problem-evidence');
