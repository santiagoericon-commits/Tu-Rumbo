-- P4 · Programación de medicamentos, DB-01 y DB-03

-- 1) Columnas de programación en medications
alter table public.medications
  add column schedule_times time[],
  add column start_date date;

-- Relleno de la fila existente (datos ficticios de demo) a partir de sus dosis.
update public.medications m
set
  schedule_times = coalesce(
    (
      select array_agg(t.local_time order by t.local_time)
      from (
        select distinct (d.scheduled_at at time zone 'America/Mazatlan')::time as local_time
        from public.doses d
        where d.medication_id = m.id
        order by 1
        limit 4
      ) t
    ),
    array['08:00'::time]
  ),
  start_date = coalesce(
    (
      select min((d.scheduled_at at time zone 'America/Mazatlan')::date)
      from public.doses d
      where d.medication_id = m.id
    ),
    (m.created_at at time zone 'America/Mazatlan')::date
  );

alter table public.medications
  alter column schedule_times set not null,
  alter column start_date set not null,
  add constraint medications_schedule_times_check
    check (
      cardinality(schedule_times) between 1 and 4
      and array_position(schedule_times, null) is null
    );

-- 2) DB-01: ninguna dosis sin medicamento (0 filas NULL verificadas el 29 sept 2026)
alter table public.doses
  alter column medication_id set not null;

-- 3) DB-03: la app nunca consulta como anon; authenticated no necesita
--    TRUNCATE (ignora RLS), REFERENCES ni TRIGGER.
revoke all privileges on table
  public.profiles, public.medications, public.doses, public.appointments, public.symptom_logs
from anon;

revoke truncate, references, trigger on table
  public.profiles, public.medications, public.doses, public.appointments, public.symptom_logs
from authenticated;
