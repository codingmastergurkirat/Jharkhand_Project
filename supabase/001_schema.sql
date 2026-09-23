-- ==============================================================================
-- JAN SAMADHAN (जन समाधान) - National Public Challenge Resolution Platform
-- 001_schema.sql: Core Tables, Cascading Drops, Triggers, and Constraints
-- ==============================================================================

-- 1. CLEAN TEARDOWN (Allows complete reset without orphaned dependencies)
DROP TABLE IF EXISTS public.impact_metrics CASCADE;
DROP TABLE IF EXISTS public.milestones CASCADE;
DROP TABLE IF EXISTS public.industry_interests CASCADE;
DROP TABLE IF EXISTS public.proposal_students CASCADE;
DROP TABLE IF EXISTS public.proposals CASCADE;
DROP TABLE IF EXISTS public.problem_supporters CASCADE;
DROP TABLE IF EXISTS public.problems CASCADE;
DROP TABLE IF EXISTS public.access_codes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PROFILES TABLE (Linked directly to Supabase Auth)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('citizen', 'university', 'industry', 'admin')),
    org_name TEXT,
    district TEXT,
    domain_tags TEXT[] DEFAULT '{}',
    facilities TEXT,
    expertise TEXT,
    interest_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ACCESS CODES TABLE (For verified institutional onboarding)
CREATE TABLE public.access_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    role_type TEXT NOT NULL CHECK (role_type IN ('university', 'industry')),
    org_name TEXT NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    redeemed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROBLEMS TABLE (Public challenges reported by citizens)
-- Note: photo_urls is NOT NULL and requires at least 1 image evidence
CREATE TABLE public.problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    domain TEXT NOT NULL CHECK (domain IN (
        'Education', 'Healthcare', 'Agriculture', 'Water Management',
        'Sanitation', 'Environment', 'Energy', 'Urban Infrastructure',
        'Accessibility', 'Public Administration', 'Rural Livelihoods'
    )),
    sdg_goal TEXT,
    district TEXT NOT NULL,
    lat NUMERIC,
    lng NUMERIC,
    location_source TEXT CHECK (location_source IN ('auto', 'manual')) DEFAULT 'manual',
    photo_urls TEXT[] NOT NULL CHECK (cardinality(photo_urls) >= 1),
    status TEXT CHECK (status IN (
        'pending', 'assigned', 'in_progress', 'testing', 'completed', 'failed'
    )) DEFAULT 'pending',
    support_count INT DEFAULT 0,
    submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    submitted_by_type TEXT DEFAULT 'Citizen',
    assigned_university_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PROBLEM SUPPORTERS JUNCTION TABLE (Enforces 1 vote per citizen)
CREATE TABLE public.problem_supporters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_problem_user_support UNIQUE (problem_id, user_id)
);

-- 6. PROPOSALS TABLE (University solution proposals)
CREATE TABLE public.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    university_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentor_name TEXT NOT NULL,
    mentor_department TEXT NOT NULL,
    mentor_email TEXT NOT NULL,
    description TEXT NOT NULL,
    timeline TEXT NOT NULL,
    estimated_budget NUMERIC NOT NULL DEFAULT 0,
    ip_notice_ack BOOLEAN DEFAULT TRUE,
    cancellation_reason TEXT,
    status TEXT CHECK (status IN (
        'submitted', 'approved', 'rejected', 'in_progress', 'completed'
    )) DEFAULT 'submitted',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROPOSAL STUDENTS TABLE (Student team assigned to a proposal)
CREATE TABLE public.proposal_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_roll_no TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INDUSTRY INTERESTS TABLE (Corporate CSR & Mentorship pledges)
CREATE TABLE public.industry_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    industry_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    interest_type TEXT NOT NULL CHECK (interest_type IN ('funding', 'mentorship', 'both')),
    funding_amount NUMERIC DEFAULT 0,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. MILESTONES TABLE (Project resolution stages)
CREATE TABLE public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. IMPACT METRICS TABLE (Proof of resolution, before/after photos, ratings)
CREATE TABLE public.impact_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    people_benefited INT DEFAULT 0,
    cost_saved NUMERIC DEFAULT 0,
    before_photo_url TEXT,
    after_photo_url TEXT,
    citizen_rating INT CHECK (citizen_rating >= 1 AND citizen_rating <= 5),
    citizen_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_problem_impact UNIQUE (problem_id)
);

-- ==============================================================================
-- DATABASE TRIGGERS
-- ==============================================================================

-- TRIGGER 1: Synchronize problem_supporters count to problems.support_count
CREATE OR REPLACE FUNCTION public.sync_problem_support_count()
RETURNS TRIGGER AS $$
DECLARE
    v_problem_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_problem_id := OLD.problem_id;
    ELSE
        v_problem_id := NEW.problem_id;
    END IF;

    UPDATE public.problems
    SET support_count = (
        SELECT COUNT(*) FROM public.problem_supporters WHERE problem_id = v_problem_id
    )
    WHERE id = v_problem_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_sync_support_count ON public.problem_supporters;
CREATE TRIGGER trigger_sync_support_count
AFTER INSERT OR DELETE ON public.problem_supporters
FOR EACH ROW
EXECUTE FUNCTION public.sync_problem_support_count();


-- TRIGGER 2: Synchronize milestone completion to problems.status
CREATE OR REPLACE FUNCTION public.sync_problem_status_on_milestone()
RETURNS TRIGGER AS $$
DECLARE
    v_problem_id UUID;
    v_total_milestones INT;
    v_completed_milestones INT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_problem_id := OLD.problem_id;
    ELSE
        v_problem_id := NEW.problem_id;
    END IF;

    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'completed')
    INTO 
        v_total_milestones, 
        v_completed_milestones
    FROM public.milestones
    WHERE problem_id = v_problem_id;

    IF v_total_milestones > 0 AND v_total_milestones = v_completed_milestones THEN
        UPDATE public.problems 
        SET status = 'completed' 
        WHERE id = v_problem_id AND status != 'completed';
    ELSIF v_completed_milestones > 0 THEN
        UPDATE public.problems 
        SET status = 'in_progress' 
        WHERE id = v_problem_id AND status != 'in_progress';
    END IF;

    RETURN NULL; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_sync_problem_status ON public.milestones;
CREATE TRIGGER trigger_sync_problem_status
AFTER INSERT OR UPDATE OF status OR DELETE 
ON public.milestones
FOR EACH ROW
EXECUTE FUNCTION public.sync_problem_status_on_milestone();


-- TRIGGER 3: Automatic profile creation upon Supabase auth.users INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_raw_tags JSONB;
    v_domain_tags TEXT[] := '{}';
BEGIN
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'citizen');

    -- Disallow public self-registration with 'admin' role
    IF v_role = 'admin' AND (CURRENT_USER = 'anon' OR CURRENT_USER = 'authenticated') THEN
        RAISE EXCEPTION 'Administrative accounts cannot be self-registered.';
    END IF;

    v_raw_tags := NEW.raw_user_meta_data->'domain_tags';
    IF v_raw_tags IS NOT NULL AND jsonb_typeof(v_raw_tags) = 'array' THEN
        SELECT ARRAY_AGG(x.val::text) INTO v_domain_tags
        FROM jsonb_array_elements_text(v_raw_tags) AS x(val);
    END IF;

    INSERT INTO public.profiles (
        id,
        name,
        email,
        role,
        org_name,
        district,
        domain_tags,
        facilities,
        expertise,
        interest_type
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        v_role,
        NEW.raw_user_meta_data->>'org_name',
        NEW.raw_user_meta_data->>'district',
        COALESCE(v_domain_tags, '{}'),
        NEW.raw_user_meta_data->>'facilities',
        NEW.raw_user_meta_data->>'expertise',
        NEW.raw_user_meta_data->>'interest_type'
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        org_name = EXCLUDED.org_name,
        district = EXCLUDED.district,
        domain_tags = EXCLUDED.domain_tags,
        facilities = EXCLUDED.facilities,
        expertise = EXCLUDED.expertise,
        interest_type = EXCLUDED.interest_type;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Indexes for high performance querying
CREATE INDEX IF NOT EXISTS idx_problems_district ON public.problems(district);
CREATE INDEX IF NOT EXISTS idx_problems_domain ON public.problems(domain);
CREATE INDEX IF NOT EXISTS idx_problems_status ON public.problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_assigned_univ ON public.problems(assigned_university_id);
CREATE INDEX IF NOT EXISTS idx_proposals_problem ON public.proposals(problem_id);
CREATE INDEX IF NOT EXISTS idx_proposals_university ON public.proposals(university_id);
