-- ==============================================================================
-- GOVERNMENT OF JHARKHAND COLLABORATIVE GOVERNANCE PLATFORM (SIH26043 - Team LIMITLESS)
-- 001_schema.sql: Core Tables, Triggers, and Foreign Keys
-- Run this in the Supabase SQL Editor as the first migration.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked directly to Supabase Auth)
-- Stores custom profile information for all 4 roles.
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- 2. ACCESS CODES TABLE (For verified University & Industry onboarding)
-- Single-use 8-character codes format: PREFIX-JH-####
CREATE TABLE IF NOT EXISTS public.access_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    role_type TEXT NOT NULL CHECK (role_type IN ('university', 'industry')),
    org_name TEXT NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    redeemed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROBLEMS TABLE (Societal challenges reported by citizens)
CREATE TABLE IF NOT EXISTS public.problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    domain TEXT NOT NULL CHECK (domain IN (
        'Education', 'Healthcare', 'Agriculture', 'Water Management',
        'Sanitation', 'Environment', 'Energy', 'Urban Infrastructure',
        'Accessibility', 'Public Administration', 'Rural Livelihoods'
    )),
    district TEXT NOT NULL,
    lat NUMERIC,
    lng NUMERIC,
    location_source TEXT CHECK (location_source IN ('auto', 'manual')) DEFAULT 'manual',
    photo_urls TEXT[] DEFAULT '{}',
    status TEXT CHECK (status IN (
        'pending', 'assigned', 'in_progress', 'testing', 'completed', 'failed'
    )) DEFAULT 'pending',
    support_count INT DEFAULT 0,
    submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    submitted_by_type TEXT DEFAULT 'Citizen',
    assigned_university_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROBLEM SUPPORTERS JUNCTION TABLE (Enforces 1 vote per citizen)
CREATE TABLE IF NOT EXISTS public.problem_supporters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_problem_user_support UNIQUE (problem_id, user_id)
);

-- 5. PROPOSALS TABLE (University solution proposals)
CREATE TABLE IF NOT EXISTS public.proposals (
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

-- 6. PROPOSAL STUDENTS TABLE (Student team assigned to a proposal)
CREATE TABLE IF NOT EXISTS public.proposal_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_roll_no TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INDUSTRY INTERESTS TABLE (CSR Funding & Mentorship pledges)
CREATE TABLE IF NOT EXISTS public.industry_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    industry_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    interest_type TEXT NOT NULL CHECK (interest_type IN ('funding', 'mentorship', 'both')),
    funding_amount NUMERIC DEFAULT 0,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MILESTONES TABLE (Project resolution stages)
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. IMPACT METRICS TABLE (Proof of resolution, before/after photos, rating)
CREATE TABLE IF NOT EXISTS public.impact_metrics (
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    -- Handle problem_id gracefully depending on operation
    IF TG_OP = 'DELETE' THEN
        v_problem_id := OLD.problem_id;
    ELSE
        v_problem_id := NEW.problem_id;
    END IF;

    -- Aggregate total and completed milestones
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'completed')
    INTO 
        v_total_milestones, 
        v_completed_milestones
    FROM public.milestones
    WHERE problem_id = v_problem_id;

    -- Apply state machine logic
    IF v_total_milestones > 0 AND v_total_milestones = v_completed_milestones THEN
        -- All milestones complete
        UPDATE public.problems 
        SET status = 'completed' 
        WHERE id = v_problem_id AND status != 'completed';
    ELSIF v_completed_milestones > 0 THEN
        -- At least one milestone complete
        UPDATE public.problems 
        SET status = 'in_progress' 
        WHERE id = v_problem_id AND status != 'in_progress';
    END IF;

    RETURN NULL; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_problem_status ON public.milestones;
CREATE TRIGGER trigger_sync_problem_status
AFTER INSERT OR UPDATE OF status OR DELETE 
ON public.milestones
FOR EACH ROW
EXECUTE FUNCTION public.sync_problem_status_on_milestone();


-- TRIGGER 3: Automatic profile creation upon Supabase auth.users INSERT
-- Rejects public self-signup with 'admin' role. Reads all fields from user_metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_raw_tags JSONB;
    v_domain_tags TEXT[] := '{}';
BEGIN
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'citizen');

    -- Disallow public self-registration with 'admin' role
    -- Admins must be seeded or created with service_role privileges
    IF v_role = 'admin' AND (CURRENT_USER = 'anon' OR CURRENT_USER = 'authenticated') THEN
        RAISE EXCEPTION 'Administrative accounts cannot be self-registered.';
    END IF;

    -- Extract domain_tags if present
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_problems_district ON public.problems(district);
CREATE INDEX IF NOT EXISTS idx_problems_domain ON public.problems(domain);
CREATE INDEX IF NOT EXISTS idx_problems_status ON public.problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_assigned_univ ON public.problems(assigned_university_id);
CREATE INDEX IF NOT EXISTS idx_proposals_problem ON public.proposals(problem_id);
CREATE INDEX IF NOT EXISTS idx_proposals_university ON public.proposals(university_id);
