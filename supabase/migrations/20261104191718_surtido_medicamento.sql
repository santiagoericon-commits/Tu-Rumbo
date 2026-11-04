-- P9 · Surtido por medicamento. Columnas nuevas y nullable: compatible con el código en producción.
alter table public.medications
  add column supply_count int,
  add column supply_set_at timestamptz,
  add constraint medications_supply_count_check
    check (supply_count is null or supply_count between 0 and 1000),
  add constraint medications_supply_pair_check
    check ((supply_count is null) = (supply_set_at is null));
