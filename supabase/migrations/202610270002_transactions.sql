begin;
create table public.login_limits(key text not null, bucket timestamptz not null, count integer not null default 0, primary key(key,bucket));
alter table public.login_limits enable row level security;
revoke all on public.login_limits from anon,authenticated;
create function public.login_rate_limit(p_key text) returns boolean language plpgsql security definer set search_path='' as $$
declare n integer; b timestamptz := to_timestamp(floor(extract(epoch from now())/900)*900);
begin
 insert into public.login_limits(key,bucket,count) values(p_key,b,1) on conflict(key,bucket) do update set count=public.login_limits.count+1 returning count into n;
 return n<=10;
end $$;
revoke all on function public.login_rate_limit(text) from public,anon,authenticated; grant execute on function public.login_rate_limit(text) to service_role;
create function public.finish_ai(p_id uuid,p_owner uuid,p_message text,p_result jsonb,p_attachments jsonb) returns void language plpgsql security definer set search_path='' as $$
declare r public.ai_requests; student public.student_accounts;
begin
 select * into r from public.ai_requests where id=p_id and owner_id=p_owner for update;
 if not found or r.status<>'processing' then raise exception 'invalid request state'; end if;
 insert into public.messages(conversation_id,owner_id,role,content,data) values(r.conversation_id,p_owner,'user',p_message,jsonb_build_object('attachmentIds',p_attachments)),(r.conversation_id,p_owner,'assistant',p_result->>'chatReply',p_result);
 update public.ai_requests set status='done',result=p_result where id=p_id;
 update public.usage_counters set tokens=tokens+coalesce((p_result->>'tokens')::bigint,0) where owner_id=p_owner and day=current_date;
 select * into student from public.student_accounts where user_id=p_owner;
 if found and p_result->>'verdict' in ('correct','incorrect','inconclusive') then
  insert into public.submissions(id,student_id,teacher_id,class_id,data) values(p_id,p_owner,student.teacher_id,student.class_id,jsonb_build_object('problemText',p_message,'evaluation',p_result,'hasResolvedMistake',false));
 end if;
end $$;
revoke all on function public.finish_ai(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated; grant execute on function public.finish_ai(uuid,uuid,text,jsonb,jsonb) to service_role;
commit;
