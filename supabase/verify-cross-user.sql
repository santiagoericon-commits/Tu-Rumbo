-- Rumbo · Prueba de aislamiento entre dos cuentas (FK compuesta + RLS)
--
-- Cómo usarla:
--   1. Crea dos cuentas demo en Supabase (Authentication > Users > Add user, con "Auto Confirm User").
--   2. Pega sus UUID abajo, en user_a y user_b.
--   3. Corre TODO el archivo en el SQL Editor de Supabase (o con el MCP de Supabase).
--
-- Resultado esperado: un único error que empieza con "RESULTADO: 9/9 pruebas OK".
-- Ese error es intencional: deshace todos los datos de prueba. La base queda exactamente igual.
-- Si ves "FALLO n: ...", hay una brecha real: no sigas con la demo hasta cerrarla.

do $$
declare
  user_a uuid := 'PEGA-AQUI-UUID-DEMO-1';  -- cuenta demo 1
  user_b uuid := 'PEGA-AQUI-UUID-DEMO-2';  -- cuenta demo 2
  med_a  uuid := gen_random_uuid();
  n      int;
begin
  if user_a = user_b then
    raise exception 'Configuración: user_a y user_b deben ser cuentas distintas';
  end if;

  -- Todo lo que sigue corre como un usuario autenticado normal, con RLS activo
  perform set_config('role', 'authenticated', true);

  -- Como A: datos propios
  perform set_config('request.jwt.claims', json_build_object('sub', user_a, 'role', 'authenticated')::text, true);
  insert into medications (id, user_id, name) values (med_a, user_a, 'Medicamento de prueba');
  insert into doses (user_id, medication_id, scheduled_at) values (user_a, med_a, now());
  insert into appointments (user_id, scheduled_at, title) values (user_a, now() + interval '7 days', 'Cita de prueba');
  insert into symptom_logs (user_id, log_date, severity) values (user_a, current_date - 3650, 2);

  -- Como B
  perform set_config('request.jwt.claims', json_build_object('sub', user_b, 'role', 'authenticated')::text, true);

  -- 1. B no ve nada de A
  select count(*) into n from medications where user_id = user_a;
  if n <> 0 then raise exception 'FALLO 1: B ve medicamentos de A'; end if;
  select count(*) into n from doses where user_id = user_a;
  if n <> 0 then raise exception 'FALLO 2: B ve dosis de A'; end if;
  select count(*) into n from appointments where user_id = user_a;
  if n <> 0 then raise exception 'FALLO 3: B ve citas de A'; end if;
  select count(*) into n from symptom_logs where user_id = user_a;
  if n <> 0 then raise exception 'FALLO 4: B ve síntomas de A'; end if;

  -- 5. B no puede crear una dosis propia apuntando al medicamento de A (FK compuesta)
  begin
    insert into doses (user_id, medication_id, scheduled_at) values (user_b, med_a, now());
    raise exception 'FALLO 5: B creó una dosis con el medicamento de A';
  exception when foreign_key_violation then null;
  end;

  -- 6. B no puede insertar filas a nombre de A (RLS with check)
  begin
    insert into medications (user_id, name) values (user_b, 'x'), (user_a, 'Intruso');
    raise exception 'FALLO 6: B insertó un medicamento a nombre de A';
  exception when insufficient_privilege then null;
  end;

  -- 7. B no puede modificar ni 8. borrar datos de A
  update doses set status = 'taken' where user_id = user_a;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALLO 7: B modificó dosis de A'; end if;
  delete from medications where id = med_a;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALLO 8: B borró un medicamento de A'; end if;

  -- 9. Un visitante sin sesión (anon) no ve nada
  perform set_config('request.jwt.claims', '', true);
  perform set_config('role', 'anon', true);
  select count(*) into n from doses;
  if n <> 0 then raise exception 'FALLO 9: anon ve dosis'; end if;

  raise exception 'RESULTADO: 9/9 pruebas OK. Error intencional para deshacer los datos de prueba.';
end $$;
