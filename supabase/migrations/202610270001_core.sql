begin;
create table public.teacher_access(user_id uuid primary key references auth.users(id), enabled boolean not null default true);
create table public.profiles(user_id uuid primary key references auth.users(id), role text not null check(role in ('teacher','student')), name text not null, school text not null default '', forced_password_change boolean not null default false);
create table public.classes(id uuid primary key, teacher_id uuid not null references public.profiles(user_id), data jsonb not null, archived_at timestamptz, created_at timestamptz not null default now());
create table public.student_accounts(user_id uuid primary key references public.profiles(user_id), student_code text not null unique, auth_email text not null unique, teacher_id uuid not null references public.profiles(user_id), class_id uuid not null references public.classes(id), data jsonb not null default '{}');
create table public.conversations(id uuid primary key, owner_id uuid not null references public.profiles(user_id), created_at timestamptz not null default now());
create table public.messages(id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations(id), owner_id uuid not null references public.profiles(user_id), role text not null check(role in ('user','assistant')), content text not null, data jsonb not null default '{}', created_at timestamptz not null default now());
create table public.submissions(id uuid primary key, student_id uuid not null references public.student_accounts(user_id), teacher_id uuid not null references public.profiles(user_id), class_id uuid not null references public.classes(id), data jsonb not null, created_at timestamptz not null default now());
create table public.documents(id uuid primary key, owner_id uuid not null references public.profiles(user_id), title text not null, content jsonb not null, revision integer not null default 1, updated_at timestamptz not null default now());
create table public.document_versions(document_id uuid not null references public.documents(id), revision integer not null, content jsonb not null, created_at timestamptz not null default now(), primary key(document_id,revision));
create table public.attachments(id uuid primary key, owner_id uuid not null references public.profiles(user_id), path text not null unique, mime text not null, bytes bigint not null check(bytes between 1 and 10485760), status text not null default 'pending' check(status in ('pending','ready','deleted')), created_at timestamptz not null default now());
create table public.ai_requests(id uuid primary key, owner_id uuid not null references public.profiles(user_id), conversation_id uuid not null references public.conversations(id), status text not null, result jsonb, created_at timestamptz not null default now());
create table public.usage_counters(owner_id uuid not null, day date not null, requests integer not null default 0, tokens bigint not null default 0, primary key(owner_id,day));
create table public.audit_events(id uuid primary key default gen_random_uuid(), actor_id uuid not null references public.profiles(user_id), action text not null, target_id uuid not null, reason text, created_at timestamptz not null default now());
create table public.attempts(id uuid primary key, owner_id uuid not null references public.profiles(user_id), lesson_id text not null, format text not null, data jsonb not null, created_at timestamptz not null default now());
create table public.assignments(id uuid primary key, teacher_id uuid not null references public.profiles(user_id), class_id uuid not null references public.classes(id), title text not null, lesson_id text not null, deadline timestamptz, created_at timestamptz not null default now());

-- All mutations go through validated server operations. No browser-supplied score/role grants.
create function public.is_teacher() returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.teacher_access where user_id=auth.uid() and enabled) $$;
revoke all on function public.is_teacher() from public; grant execute on function public.is_teacher() to authenticated;
create function public.owns_student(student uuid) returns boolean language sql stable security definer set search_path = '' as $$ select public.is_teacher() and exists(select 1 from public.student_accounts where user_id=student and teacher_id=auth.uid()) $$;
revoke all on function public.owns_student(uuid) from public; grant execute on function public.owns_student(uuid) to authenticated;

do $$ declare t text; begin
 foreach t in array array['teacher_access','profiles','classes','student_accounts','conversations','messages','submissions','documents','document_versions','attachments','ai_requests','usage_counters','audit_events','attempts','assignments'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
 end loop;
end $$;
grant select on public.teacher_access,public.profiles,public.classes,public.conversations,public.messages,public.submissions,public.documents,public.document_versions,public.attachments,public.attempts,public.assignments to authenticated;
grant select(user_id,student_code,teacher_id,class_id,data) on public.student_accounts to authenticated;
create policy teacher_self on public.teacher_access for select to authenticated using(user_id=auth.uid());
create policy profile_read on public.profiles for select to authenticated using(user_id=auth.uid() or public.owns_student(user_id));
create policy class_read on public.classes for select to authenticated using((teacher_id=auth.uid() and public.is_teacher()) or exists(select 1 from public.student_accounts s where s.user_id=auth.uid() and s.class_id=classes.id));
create policy student_read on public.student_accounts for select to authenticated using(user_id=auth.uid() or (teacher_id=auth.uid() and public.is_teacher()));
create policy conversation_read on public.conversations for select to authenticated using(owner_id=auth.uid());
create policy message_read on public.messages for select to authenticated using(owner_id=auth.uid());
create policy submission_read on public.submissions for select to authenticated using(student_id=auth.uid() or (teacher_id=auth.uid() and public.is_teacher()));
create policy document_read on public.documents for select to authenticated using(owner_id=auth.uid());
create policy document_version_read on public.document_versions for select to authenticated using(exists(select 1 from public.documents d where d.id=document_id and d.owner_id=auth.uid()));
create policy attachment_read on public.attachments for select to authenticated using(owner_id=auth.uid());
create policy attempt_read on public.attempts for select to authenticated using(owner_id=auth.uid() or public.owns_student(owner_id));
create policy assignment_read on public.assignments for select to authenticated using((teacher_id=auth.uid() and public.is_teacher()) or exists(select 1 from public.student_accounts s where s.user_id=auth.uid() and s.class_id=assignments.class_id));

-- Atomic reservation: duplicates cannot call the provider or consume quota twice.
create function public.reserve_ai(p_id uuid,p_owner uuid,p_conversation uuid,p_limit integer,p_global_tokens bigint) returns text language plpgsql security definer set search_path = '' as $$
declare existing public.ai_requests; n integer; total bigint;
begin
 perform pg_advisory_xact_lock(270001);
 select * into existing from public.ai_requests where id=p_id;
 if found then
  if existing.owner_id<>p_owner or existing.conversation_id<>p_conversation then raise exception 'request conflict'; end if;
  return existing.status;
 end if;
 select coalesce(sum(tokens),0) into total from public.usage_counters where day=current_date;
 if total>=p_global_tokens then return 'quota'; end if;
 insert into public.usage_counters(owner_id,day,requests) values(p_owner,current_date,0) on conflict do nothing;
 update public.usage_counters set requests=requests+1 where owner_id=p_owner and day=current_date and requests<p_limit returning requests into n;
 if n is null then return 'quota'; end if;
 insert into public.ai_requests(id,owner_id,conversation_id,status) values(p_id,p_owner,p_conversation,'processing');
 return 'reserved';
end $$;
revoke all on function public.reserve_ai(uuid,uuid,uuid,integer,bigint) from public,anon,authenticated;
grant execute on function public.reserve_ai(uuid,uuid,uuid,integer,bigint) to service_role;

create function public.save_document(p_id uuid,p_owner uuid,p_revision integer,p_title text,p_content jsonb) returns integer language plpgsql security definer set search_path = '' as $$
declare next_revision integer;
begin
 if p_revision=0 then
  insert into public.documents(id,owner_id,title,content) values(p_id,p_owner,p_title,p_content) on conflict do nothing returning revision into next_revision;
 else
  update public.documents set content=p_content,title=p_title,revision=revision+1,updated_at=now() where id=p_id and owner_id=p_owner and revision=p_revision returning revision into next_revision;
 end if;
 if next_revision is null then return null; end if;
 insert into public.document_versions(document_id,revision,content) values(p_id,next_revision,p_content);
 return next_revision;
end $$;
revoke all on function public.save_document(uuid,uuid,integer,text,jsonb) from public,anon,authenticated;
grant execute on function public.save_document(uuid,uuid,integer,text,jsonb) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('attachments','attachments',false,10485760,array['image/png','image/jpeg','image/webp','application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document']) on conflict(id) do nothing;
-- No anonymous/public object policies. Only server-authorized signed uploads/downloads.
commit;
