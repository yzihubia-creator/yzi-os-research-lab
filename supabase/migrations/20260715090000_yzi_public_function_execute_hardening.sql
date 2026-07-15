begin;

-- These authenticated product RPCs are invoked through the user's server-side
-- Supabase session and enforce auth.uid()/tenant membership internally.
revoke execute on function public.yzi_advance_after_approval(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke execute on function public.yzi_decide_action_request(uuid, text, text, text)
  from public, anon, authenticated, service_role;
revoke execute on function public.yzi_imob_record_message(uuid, uuid, text, text, text, text)
  from public, anon, authenticated, service_role;
revoke execute on function public.yzi_record_run_adjustment(uuid, uuid, text, jsonb, text)
  from public, anon, authenticated, service_role;
revoke execute on function public.yzi_start_prepare_contact_run(uuid, uuid, uuid, text, jsonb, text, uuid)
  from public, anon, authenticated, service_role;

grant execute on function public.yzi_advance_after_approval(uuid, uuid)
  to authenticated;
grant execute on function public.yzi_decide_action_request(uuid, text, text, text)
  to authenticated;
grant execute on function public.yzi_imob_record_message(uuid, uuid, text, text, text, text)
  to authenticated;
grant execute on function public.yzi_record_run_adjustment(uuid, uuid, text, jsonb, text)
  to authenticated;
grant execute on function public.yzi_start_prepare_contact_run(uuid, uuid, uuid, text, jsonb, text, uuid)
  to authenticated;

-- This SECURITY INVOKER helper runs inside the authenticated RPCs above.
-- Its caller gate still rejects direct invocation outside the governed path.
revoke execute on function public.yzi_internal_record_audit_event(uuid, uuid, uuid, text, text, jsonb)
  from public, anon, authenticated, service_role;
grant execute on function public.yzi_internal_record_audit_event(uuid, uuid, uuid, text, text, jsonb)
  to authenticated;

-- PostgreSQL invokes trigger functions through the trigger, without requiring
-- direct EXECUTE from the role that changed the row.
revoke execute on function public.yzi_guard_action_request_decision()
  from public, anon, authenticated, service_role;

do $assert$
declare
  v_authenticated_entrypoint regprocedure;
  v_signature regprocedure;
  v_role name;
begin
  foreach v_authenticated_entrypoint in array array[
    'public.yzi_advance_after_approval(uuid,uuid)'::regprocedure,
    'public.yzi_decide_action_request(uuid,text,text,text)'::regprocedure,
    'public.yzi_imob_record_message(uuid,uuid,text,text,text,text)'::regprocedure,
    'public.yzi_internal_record_audit_event(uuid,uuid,uuid,text,text,jsonb)'::regprocedure,
    'public.yzi_record_run_adjustment(uuid,uuid,text,jsonb,text)'::regprocedure,
    'public.yzi_start_prepare_contact_run(uuid,uuid,uuid,text,jsonb,text,uuid)'::regprocedure
  ] loop
    if not has_function_privilege('authenticated', v_authenticated_entrypoint, 'execute') then
      raise exception 'hardening assertion failed: authenticated lacks EXECUTE on %',
        v_authenticated_entrypoint;
    end if;
  end loop;

  foreach v_signature in array array[
    'public.yzi_advance_after_approval(uuid,uuid)'::regprocedure,
    'public.yzi_decide_action_request(uuid,text,text,text)'::regprocedure,
    'public.yzi_guard_action_request_decision()'::regprocedure,
    'public.yzi_imob_record_message(uuid,uuid,text,text,text,text)'::regprocedure,
    'public.yzi_internal_record_audit_event(uuid,uuid,uuid,text,text,jsonb)'::regprocedure,
    'public.yzi_record_run_adjustment(uuid,uuid,text,jsonb,text)'::regprocedure,
    'public.yzi_start_prepare_contact_run(uuid,uuid,uuid,text,jsonb,text,uuid)'::regprocedure
  ] loop
    foreach v_role in array array['public'::name, 'anon'::name, 'service_role'::name] loop
      if has_function_privilege(v_role, v_signature, 'execute') then
        raise exception 'hardening assertion failed: % still has EXECUTE on %',
          v_role, v_signature;
      end if;
    end loop;
  end loop;

  if has_function_privilege(
    'authenticated',
    'public.yzi_guard_action_request_decision()'::regprocedure,
    'execute'
  ) then
    raise exception 'hardening assertion failed: authenticated can execute trigger function directly';
  end if;
end
$assert$;

commit;
