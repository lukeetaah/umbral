-- Anonymous, opt-in research contributions. Raw rows are never publicly readable;
-- the public can only call the aggregate snapshot function below.

create table public.anonymous_contributions (
  id uuid primary key,
  lab text not null check (lab in ('atlas','apprenticeship','state','anchor')),
  condition text not null check (condition in ('baseline','paired','repetition','sham','omission','transfer','preparation')),
  stimulus_seed bigint not null check (stimulus_seed >= 0),
  genome_hash text not null check (char_length(genome_hash) between 8 and 64),
  occurred boolean,
  category text not null check (char_length(category) between 1 and 64),
  confidence smallint not null check (confidence between 0 and 100),
  expectation smallint not null check (expectation between 0 and 100),
  engine_version text not null check (char_length(engine_version) between 1 and 16),
  algorithm_version text not null check (char_length(algorithm_version) between 1 and 16),
  created_at timestamptz not null default now()
);

create index anonymous_contributions_signal_idx on public.anonymous_contributions(condition, stimulus_seed);
create index anonymous_contributions_category_idx on public.anonymous_contributions(category) where occurred is true;
alter table public.anonymous_contributions enable row level security;

create or replace function public.submit_anonymous_contributions(p_rows jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer := 0;
begin
  if jsonb_typeof(p_rows) <> 'array' then
    raise exception 'Expected an array of contributions';
  end if;
  if jsonb_array_length(p_rows) = 0 or jsonb_array_length(p_rows) > 32 then
    raise exception 'Contribution batch must contain between 1 and 32 rows';
  end if;

  insert into public.anonymous_contributions (
    id, lab, condition, stimulus_seed, genome_hash, occurred, category,
    confidence, expectation, engine_version, algorithm_version
  )
  select
    (row->>'id')::uuid,
    row->>'lab',
    row->>'condition',
    (row->>'stimulus_seed')::bigint,
    row->>'genome_hash',
    case when jsonb_typeof(row->'occurred') = 'boolean' then (row->>'occurred')::boolean else null end,
    row->>'category',
    (row->>'confidence')::smallint,
    (row->>'expectation')::smallint,
    row->>'engine_version',
    row->>'algorithm_version'
  from jsonb_array_elements(p_rows) as row
  on conflict (id) do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

revoke all on table public.anonymous_contributions from anon, authenticated;
revoke all on function public.submit_anonymous_contributions(jsonb) from public;
grant execute on function public.submit_anonymous_contributions(jsonb) to anon, authenticated;

create or replace function public.get_collective_learning_snapshot()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'response_count', count(*),
    'signal_count', count(*) filter (where condition not in ('sham','preparation')),
    'control_count', count(*) filter (where condition in ('sham','preparation')),
    'signal_positive_rate', round(avg(occurred::int) filter (where condition not in ('sham','preparation')), 3),
    'control_positive_rate', round(avg(occurred::int) filter (where condition in ('sham','preparation')), 3),
    'category_counts', coalesce((select jsonb_object_agg(category, category_count) from (select category, count(*) as category_count from public.anonymous_contributions where occurred is true and category not in ('none','otra') group by category order by category_count desc, category limit 8) categories), '{}'::jsonb),
    'promising_genomes', coalesce((select jsonb_agg(jsonb_build_object('seed', stimulus_seed, 'genome_hash', genome_hash, 'observations', observations, 'positive_rate', positive_rate) order by positive_rate desc, observations desc) from (select stimulus_seed, genome_hash, count(*) as observations, round(avg(occurred::int), 3) as positive_rate from public.anonymous_contributions where condition not in ('sham','preparation') group by stimulus_seed, genome_hash having count(*) >= 5 order by positive_rate desc, observations desc limit 5) genomes), '[]'::jsonb),
    'minimum_group_size', 5,
    'updated_at', max(created_at)
  )
  from public.anonymous_contributions;
$$;

revoke all on function public.get_collective_learning_snapshot() from public;
grant execute on function public.get_collective_learning_snapshot() to anon, authenticated;

comment on table public.anonymous_contributions is 'Opt-in, de-identified trial responses. No email, account id, IP, free text, or session identifier is stored in this table.';
comment on function public.get_collective_learning_snapshot() is 'Returns aggregate learning only; promising genomes require at least five observations.';
