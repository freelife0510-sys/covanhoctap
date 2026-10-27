begin;
create table public.assignment_feedback(attempt_id uuid primary key references public.attempts(id),teacher_id uuid not null references public.profiles(user_id),student_id uuid not null references public.profiles(user_id),message text not null check(length(message) between 1 and 5000),updated_at timestamptz not null default now());
alter table public.assignment_feedback enable row level security;revoke all on public.assignment_feedback from anon,authenticated;grant select on public.assignment_feedback to authenticated;
create policy feedback_read on public.assignment_feedback for select to authenticated using(student_id=auth.uid() or (teacher_id=auth.uid() and public.is_teacher()));
commit;
