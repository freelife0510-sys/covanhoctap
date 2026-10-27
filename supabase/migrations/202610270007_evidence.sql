begin;
alter table public.attachments add column sha256 text;
alter table public.audit_events add column before_value jsonb;
alter table public.audit_events add column after_value jsonb;
create table public.mastery_evidence(id uuid primary key default gen_random_uuid(),student_id uuid not null references public.student_accounts(user_id),submission_id uuid not null references public.submissions(id),skill text not null,state text not null check(state in ('needs_remedy','resolved')),source text not null check(source='teacher'),reason text not null,reviewed_at timestamptz not null default now(),unique(student_id,submission_id,skill));
alter table public.mastery_evidence enable row level security;
revoke all on public.mastery_evidence from anon,authenticated;grant select on public.mastery_evidence to authenticated;
create policy mastery_read on public.mastery_evidence for select to authenticated using(student_id=auth.uid() or public.owns_student(student_id));
create or replace function public.review_submission(p_id uuid,p_teacher uuid,p_verdict text,p_reason text,p_resolved boolean) returns void language plpgsql security definer set search_path='' as $$
declare before_data jsonb;after_data jsonb;student uuid;v_skill text;
begin
 if p_verdict not in ('correct','incorrect','inconclusive') or length(p_reason)<10 or (p_resolved and p_verdict<>'correct') then raise exception 'invalid review';end if;
 select data,student_id into before_data,student from public.submissions where id=p_id and teacher_id=p_teacher for update;
 if not found then raise exception 'not owned';end if;
 after_data=jsonb_set(jsonb_set(jsonb_set(before_data,'{evaluation,verdict}',to_jsonb(p_verdict)),'{evaluation,reviewState}','"verified"'),'{hasResolvedMistake}',to_jsonb(p_resolved));
 update public.submissions set data=after_data where id=p_id;
 insert into public.audit_events(actor_id,action,target_id,reason,before_value,after_value)values(p_teacher,'review_submission',p_id,p_reason,before_data,after_data);
 if p_verdict='incorrect' then
  v_skill=coalesce(before_data->'evaluation'->>'errorCategory','Cần giáo viên xác định kỹ năng');
  insert into public.mastery_evidence(student_id,submission_id,skill,state,source,reason)values(student,p_id,v_skill,'needs_remedy','teacher',p_reason)on conflict(student_id,submission_id,skill)do update set state='needs_remedy',reason=p_reason,reviewed_at=now();
 elsif p_resolved then
  update public.mastery_evidence set state='resolved',reason=p_reason,reviewed_at=now()where submission_id=p_id and student_id=student;
 end if;
end $$;
commit;
