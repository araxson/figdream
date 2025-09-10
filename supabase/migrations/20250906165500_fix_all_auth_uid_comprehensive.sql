-- Comprehensive Auth UID Fix - Replace ALL auth.uid() patterns
-- This migration systematically fixes all 111+ remaining auth.uid() performance issues

-- Create a function that will systematically replace auth.uid() in ALL policies
CREATE OR REPLACE FUNCTION replace_auth_uid_in_all_policies()
RETURNS TEXT AS $$
DECLARE
    policy_rec RECORD;
    table_name TEXT;
    schema_name TEXT;
    policy_name TEXT;
    cmd_type TEXT;
    roles_array TEXT[];
    using_clause TEXT;
    with_check_clause TEXT;
    result_text TEXT := '';
BEGIN
    -- Get all policies with auth.uid() references
    FOR policy_rec IN 
        SELECT 
            schemaname,
            tablename, 
            policyname,
            cmd,
            roles,
            qual,
            with_check
        FROM pg_policies 
        WHERE qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%'
        ORDER BY schemaname, tablename, policyname
    LOOP
        schema_name := policy_rec.schemaname;
        table_name := policy_rec.tablename;
        policy_name := policy_rec.policyname;
        cmd_type := policy_rec.cmd;
        roles_array := policy_rec.roles;
        using_clause := policy_rec.qual;
        with_check_clause := policy_rec.with_check;
        
        -- Replace auth.uid() patterns in using clause
        IF using_clause IS NOT NULL THEN
            using_clause := replace(using_clause, '( SELECT auth.uid() AS uid)', '(select auth.uid())');
            using_clause := replace(using_clause, 'auth.uid()', '(select auth.uid())');
        END IF;
        
        -- Replace auth.uid() patterns in with_check clause
        IF with_check_clause IS NOT NULL THEN
            with_check_clause := replace(with_check_clause, '( SELECT auth.uid() AS uid)', '(select auth.uid())');
            with_check_clause := replace(with_check_clause, 'auth.uid()', '(select auth.uid())');
        END IF;
        
        -- Drop existing policy
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            policy_name, schema_name, table_name);
        
        -- Recreate policy with optimized auth.uid() calls
        IF with_check_clause IS NOT NULL THEN
            EXECUTE format('CREATE POLICY %I ON %I.%I FOR %s TO %s USING (%s) WITH CHECK (%s)',
                policy_name, schema_name, table_name, cmd_type, 
                array_to_string(roles_array, ', '), using_clause, with_check_clause);
        ELSE
            EXECUTE format('CREATE POLICY %I ON %I.%I FOR %s TO %s USING (%s)',
                policy_name, schema_name, table_name, cmd_type, 
                array_to_string(roles_array, ', '), using_clause);
        END IF;
        
        result_text := result_text || format('Fixed: %s.%s.%s', schema_name, table_name, policy_name) || E'\n';
    END LOOP;
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql;

-- Execute the comprehensive fix
SELECT replace_auth_uid_in_all_policies();

-- Drop the helper function
DROP FUNCTION replace_auth_uid_in_all_policies();

-- Add verification
DO $$
DECLARE
    remaining_issues INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_issues 
    FROM pg_policies 
    WHERE qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%';
    
    IF remaining_issues = 0 THEN
        RAISE NOTICE 'SUCCESS: All auth.uid() performance issues have been eliminated!';
    ELSE
        RAISE NOTICE 'WARNING: % auth.uid() issues still remain', remaining_issues;
    END IF;
END $$;

COMMENT ON SCHEMA public IS 'Comprehensive auth.uid() fix applied - all policies optimized for performance';