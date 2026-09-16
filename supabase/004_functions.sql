-- ==============================================================================
-- GOVERNMENT OF JHARKHAND COLLABORATIVE GOVERNANCE PLATFORM (SIH26043 - Team LIMITLESS)
-- 004_functions.sql: Stored Procedures & Atomic Business Logic
-- Run this in the Supabase SQL Editor as the fourth migration.
-- ==============================================================================

-- 1. ATOMIC ACCESS CODE REDEMPTION
-- Validates, locks, and marks single-use 8-character codes to prevent race conditions.
CREATE OR REPLACE FUNCTION public.redeem_access_code(
    p_code TEXT,
    p_user_id UUID,
    p_role TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_code_row public.access_codes%ROWTYPE;
BEGIN
    -- Normalize code
    p_code := UPPER(TRIM(p_code));

    -- Lock row FOR UPDATE to prevent race condition double-redemption
    SELECT * INTO v_code_row
    FROM public.access_codes
    WHERE code = p_code
    FOR UPDATE;

    -- Validate existence
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Invalid access code. Please verify the code issued by Jharkhand State Admin.'
        );
    END IF;

    -- Check if already used
    IF v_code_row.is_used THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'This access code has already been redeemed.'
        );
    END IF;

    -- Check role match
    IF v_code_row.role_type != p_role THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', format('This code is designated for %s onboarding, but %s was requested.', v_code_row.role_type, p_role)
        );
    END IF;

    -- Mark code as redeemed
    UPDATE public.access_codes
    SET is_used = true,
        redeemed_by = p_user_id
    WHERE id = v_code_row.id;

    -- Update user profile with org_name if needed
    UPDATE public.profiles
    SET org_name = COALESCE(org_name, v_code_row.org_name)
    WHERE id = p_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Access code verified and redeemed successfully.',
        'org_name', v_code_row.org_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. ATOMIC PROBLEM SUPPORT TOGGLER (1 vote per user)
-- Safely adds or removes support record in problem_supporters.
-- The trigger trigger_sync_support_count automatically updates problems.support_count.
CREATE OR REPLACE FUNCTION public.toggle_problem_support(
    p_problem_id UUID,
    p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_exists BOOLEAN;
    v_new_count INT;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.problem_supporters
        WHERE problem_id = p_problem_id AND user_id = p_user_id
    ) INTO v_exists;

    IF v_exists THEN
        DELETE FROM public.problem_supporters
        WHERE problem_id = p_problem_id AND user_id = p_user_id;

        SELECT support_count INTO v_new_count
        FROM public.problems WHERE id = p_problem_id;

        RETURN jsonb_build_object(
            'supported', false,
            'support_count', COALESCE(v_new_count, 0),
            'message', 'Support removed.'
        );
    ELSE
        INSERT INTO public.problem_supporters (problem_id, user_id)
        VALUES (p_problem_id, p_user_id);

        SELECT support_count INTO v_new_count
        FROM public.problems WHERE id = p_problem_id;

        RETURN jsonb_build_object(
            'supported', true,
            'support_count', COALESCE(v_new_count, 0),
            'message', 'Problem upvoted successfully!'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. ADMINISTRATIVE UNIVERSITY ASSIGNMENT OVERRIDE
CREATE OR REPLACE FUNCTION public.admin_override_assignment(
    p_problem_id UUID,
    p_university_id UUID,
    p_admin_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_is_admin BOOLEAN;
BEGIN
    SELECT (role = 'admin') INTO v_is_admin
    FROM public.profiles WHERE id = p_admin_id;

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Only Jharkhand State Admins can reassign problem allocations.';
    END IF;

    UPDATE public.problems
    SET assigned_university_id = p_university_id,
        status = 'assigned'
    WHERE id = p_problem_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'University assignment successfully updated by Admin.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
