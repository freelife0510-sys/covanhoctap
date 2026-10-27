begin;
alter table public.question_reviews add column content_hash text not null default '';
-- An old approval cannot authorize changed content. Re-review binds exact question bytes.
commit;
