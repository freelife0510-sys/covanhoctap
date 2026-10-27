begin;
-- Answer-key snapshots cannot be selected directly through the public Data API.
revoke select on public.attempts from authenticated;
create table public.question_reviews(question_id text primary key,status text not null check(status in ('reviewed','withdrawn')),reviewer_id uuid not null references public.profiles(user_id),reason text not null, reviewed_at timestamptz not null default now());
alter table public.question_reviews enable row level security;
revoke all on public.question_reviews from anon,authenticated;
grant select on public.question_reviews to authenticated;
create policy review_read on public.question_reviews for select to authenticated using(true);
create function public.submit_attempt(p_id uuid,p_owner uuid,p_answers jsonb,p_result jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.attempts;
begin
 select * into a from public.attempts where id=p_id and owner_id=p_owner for update;
 if not found then raise exception 'missing attempt'; end if;
 if a.data->>'submitted'='true' then return a.data->'result'; end if;
 update public.attempts set data=data||jsonb_build_object('answers',p_answers,'result',p_result,'submitted',true) where id=p_id;
 return p_result;
end $$;
revoke all on function public.submit_attempt(uuid,uuid,jsonb,jsonb) from public,anon,authenticated;grant execute on function public.submit_attempt(uuid,uuid,jsonb,jsonb) to service_role;
commit;
