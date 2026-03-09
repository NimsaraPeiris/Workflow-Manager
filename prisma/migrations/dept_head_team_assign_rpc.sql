-- RPC: assign_team_members
-- Allows SUPER_ADMIN, HEAD, DEP_HEAD, or any user with 'team:manage' permission
-- to assign/remove members from a team within their own department.
-- Runs with SECURITY DEFINER to bypass RLS.

CREATE OR REPLACE FUNCTION public.assign_team_members(
    p_team_id UUID,
    p_add_ids UUID[],
    p_remove_ids UUID[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_role        TEXT;
    v_caller_dept        UUID;
    v_caller_permissions TEXT[];
    v_team_dept          UUID;
    v_has_permission     BOOLEAN;
BEGIN
    -- Fetch caller's role, department, and explicit permissions from their profile
    SELECT role, department_id, permissions
    INTO v_caller_role, v_caller_dept, v_caller_permissions
    FROM public.profiles
    WHERE id = auth.uid();

    -- Permission check: SUPER_ADMIN, HEAD, DEP_HEAD, OR explicit 'team:manage' permission
    v_has_permission :=
        v_caller_role IN ('SUPER_ADMIN', 'HEAD', 'DEP_HEAD')
        OR ('team:manage' = ANY(COALESCE(v_caller_permissions, ARRAY[]::TEXT[])));

    IF NOT v_has_permission THEN
        RAISE EXCEPTION 'Permission denied: you do not have permission to manage team members.';
    END IF;

    -- Fetch the department this team belongs to
    SELECT department_id
    INTO v_team_dept
    FROM public.teams
    WHERE id = p_team_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Team not found.';
    END IF;

    -- Non-admins can only manage teams in their own department
    IF v_caller_role != 'SUPER_ADMIN' AND v_team_dept != v_caller_dept THEN
        RAISE EXCEPTION 'Permission denied: team does not belong to your department.';
    END IF;

    -- Remove members
    IF array_length(p_remove_ids, 1) IS NOT NULL THEN
        UPDATE public.profiles
        SET team_id = NULL
        WHERE id = ANY(p_remove_ids);
    END IF;

    -- Add members
    IF array_length(p_add_ids, 1) IS NOT NULL THEN
        UPDATE public.profiles
        SET team_id = p_team_id
        WHERE id = ANY(p_add_ids);
    END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.assign_team_members(UUID, UUID[], UUID[]) TO authenticated;
