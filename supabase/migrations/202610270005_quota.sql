begin;
alter table public.ai_requests add column reserved_tokens bigint not null default 200000;
create or replace function public.reserve_ai(p_id uuid,p_owner uuid,p_conversation uuid,p_limit integer,p_global_tokens bigint) returns text language plpgsql security definer set search_path = '' as $$
declare existing public.ai_requests; n integer; total bigint; reserved bigint;
begin
 if p_limit<=0 or p_global_tokens<=0 then return 'quota'; end if;
 perform pg_advisory_xact_lock(270001);
 select * into existing from public.ai_requests where id=p_id;
 if found then
  if existing.owner_id<>p_owner or existing.conversation_id<>p_conversation then raise exception 'request conflict'; end if;
  return existing.status;
 end if;
 select coalesce(sum(tokens),0) into total from public.usage_counters where day=current_date;
 -- Failed/aborted calls may have been charged; keep the reservation until reconciled.
 select coalesce(sum(reserved_tokens),0) into reserved from public.ai_requests where created_at>=current_date and status in ('processing','failed');
 if total+reserved+200000>p_global_tokens then return 'quota'; end if;
 insert into public.usage_counters(owner_id,day,requests) values(p_owner,current_date,0) on conflict do nothing;
 update public.usage_counters set requests=requests+1 where owner_id=p_owner and day=current_date and requests<p_limit returning requests into n;
 if n is null then return 'quota'; end if;
 insert into public.ai_requests(id,owner_id,conversation_id,status) values(p_id,p_owner,p_conversation,'processing');return 'reserved';
end $$;
commit;
