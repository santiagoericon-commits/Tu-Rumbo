-- SCHED-01 · DB-02: dosis continuas y fila de profiles por usuario

-- a) Verificación: no debe haber dosis duplicadas (0 el 4 nov 2026). Si las hay, aborta.
do $$
begin
  if exists (
    select 1 from public.doses
    group by medication_id, scheduled_at
    having count(*) > 1
  ) then
    raise exception 'Hay dosis duplicadas por (medication_id, scheduled_at); resolver antes de migrar';
  end if;
end $$;

-- b) Rellenar es idempotente: una sola dosis por medicamento e instante.
alter table public.doses
  add constraint doses_medication_id_scheduled_at_key unique (medication_id, scheduled_at);

-- c) DB-02: cada usuario nuevo de auth.users tiene su fila en profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Nadie la llama directo; el trigger no necesita EXECUTE al dispararse.
revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill de los usuarios existentes.
insert into public.profiles (user_id)
select id from auth.users
on conflict (user_id) do nothing;
