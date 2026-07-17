-- Harden consent and algorithm provenance. These records are history, not editable preferences.

create or replace function public.protect_consent_history()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id <> old.id
    or new.user_id <> old.user_id
    or new.document_id <> old.document_id
    or new.granted <> old.granted
    or new.recorded_at <> old.recorded_at
    or new.client_snapshot <> old.client_snapshot then
    raise exception 'Consent history is immutable; only withdrawal is allowed';
  end if;
  if old.withdrawn_at is not null and new.withdrawn_at is distinct from old.withdrawn_at then
    raise exception 'A recorded withdrawal is immutable';
  end if;
  return new;
end;
$$;

drop trigger if exists user_consents_immutable on public.user_consents;
create trigger user_consents_immutable
before update on public.user_consents
for each row execute function public.protect_consent_history();

drop policy if exists consents_self on public.user_consents;
create policy consents_self_read on public.user_consents for select to authenticated using(user_id=auth.uid());
create policy consents_self_insert on public.user_consents for insert to authenticated with check(user_id=auth.uid() and withdrawn_at is null);
create policy consents_self_withdraw on public.user_consents for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and withdrawn_at is not null);

drop policy if exists decisions_self on public.algorithm_decisions;
create policy decisions_self_read on public.algorithm_decisions for select to authenticated using(user_id=auth.uid());
create policy decisions_self_insert on public.algorithm_decisions for insert to authenticated with check(user_id=auth.uid());

comment on table public.algorithm_decisions is 'Append-only provenance for local algorithm decisions; participants may read and insert their own records.';
comment on table public.user_consents is 'Append-only consent history. Withdrawal sets withdrawn_at; original grant and snapshot remain immutable.';
