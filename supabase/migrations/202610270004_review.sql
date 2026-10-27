begin;
create function public.review_submission(p_id uuid,p_teacher uuid,p_verdict text,p_reason text,p_resolved boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if p_verdict not in ('correct','incorrect','inconclusive') or length(p_reason)<10 then raise exception 'invalid review'; end if;
 update public.submissions set data=jsonb_set(jsonb_set(jsonb_set(data,'{evaluation,verdict}',to_jsonb(p_verdict)),'{evaluation,reviewState}','"verified"'),'{hasResolvedMistake}',to_jsonb(p_resolved)) where id=p_id and teacher_id=p_teacher;
 if not found then raise exception 'not owned'; end if;
 insert into public.audit_events(actor_id,action,target_id,reason) values(p_teacher,'review_submission',p_id,p_reason);
end $$;
revoke all on function public.review_submission(uuid,uuid,text,text,boolean) from public,anon,authenticated; grant execute on function public.review_submission(uuid,uuid,text,text,boolean) to service_role;
commit;
