-- Let each user choose which OpenAI model grades their speeches.
alter table public.profiles
  add column if not exists grading_model text not null default 'gpt-4o-mini'
  check (grading_model in ('gpt-4o-mini', 'gpt-4o'));
