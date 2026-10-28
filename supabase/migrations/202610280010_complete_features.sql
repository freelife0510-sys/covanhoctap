begin;

alter table public.submissions add column if not exists updated_at timestamptz not null default now();
alter table public.submissions alter column student_id drop not null;
alter table public.submissions alter column class_id drop not null;

create table if not exists public.import_batches(
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(user_id) on delete cascade,
  source_checksum text not null,
  status text not null default 'imported' check (status in ('imported','rolled_back')),
  summary jsonb not null default '{}'::jsonb,
  imported_ids jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  rolled_back_at timestamptz
);

create unique index if not exists idx_import_batches_active_checksum
  on public.import_batches(teacher_id, source_checksum)
  where status = 'imported';

alter table public.import_batches enable row level security;
revoke all on public.import_batches from anon, authenticated;
grant select on public.import_batches to authenticated;

create policy teacher_import_batches_read on public.import_batches
  for select to authenticated
  using (teacher_id = auth.uid() and public.is_teacher());

create table if not exists public.ai_generated_questions(
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(user_id) on delete cascade,
  lesson_id text not null,
  format text not null check (format in ('multiple_choice','true_false','short_answer')),
  status text not null default 'draft_ai' check (status in ('draft_ai','reviewed','withdrawn')),
  content_hash text not null,
  data jsonb not null,
  reviewed_by uuid references public.profiles(user_id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.ai_generated_questions enable row level security;
revoke all on public.ai_generated_questions from anon, authenticated;
grant select on public.ai_generated_questions to authenticated;

create policy ai_questions_read on public.ai_generated_questions
  for select to authenticated
  using (owner_id = auth.uid() or status = 'reviewed' or public.is_teacher());

create or replace function public.submit_self_correction(
  p_id uuid,
  p_student uuid,
  p_note text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_before jsonb;
  v_after jsonb;
begin
  select data into v_before
  from public.submissions
  where id = p_id
    and student_id = p_student
  for update;

  if not found then
    return null;
  end if;

  v_after := jsonb_set(
    jsonb_set(
      jsonb_set(v_before, '{selfCorrectionNote}', to_jsonb(p_note), true),
      '{selfCorrectionSubmittedAt}', to_jsonb(now()), true
    ),
    '{workflowState}', '"self_correction_submitted"'::jsonb, true
  );

  update public.submissions
  set data = v_after,
      updated_at = now()
  where id = p_id
    and student_id = p_student;

  insert into public.audit_events(actor_id, action, target_id, reason, before_value, after_value)
  values (
    p_student,
    'student_self_correction',
    p_id,
    left(p_note, 500),
    v_before,
    v_after
  );

  return v_after;
end
$$;

revoke all on function public.submit_self_correction(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.submit_self_correction(uuid, uuid, text) to service_role;

commit;
