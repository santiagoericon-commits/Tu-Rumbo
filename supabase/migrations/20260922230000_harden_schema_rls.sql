alter table public.medications
  add constraint medications_id_user_id_key unique (id, user_id);

alter table public.doses
  drop constraint doses_medication_id_fkey;

alter table public.doses
  add constraint doses_medication_fkey
  foreign key (medication_id, user_id)
  references public.medications (id, user_id)
  on delete cascade;

create index if not exists medications_user_id_idx on public.medications (user_id);
create index if not exists doses_user_id_scheduled_at_idx on public.doses (user_id, scheduled_at);
create index if not exists doses_medication_id_user_id_idx on public.doses (medication_id, user_id);
create index if not exists appointments_user_id_scheduled_at_idx on public.appointments (user_id, scheduled_at);

alter table public.symptom_logs
  rename column date to log_date;

create index if not exists symptom_logs_user_id_log_date_idx on public.symptom_logs (user_id, log_date);

alter table public.symptom_logs
  add constraint symptom_logs_user_id_log_date_key unique (user_id, log_date);

drop policy "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select to authenticated using ((select auth.uid()) = user_id);

drop policy "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
for delete to authenticated using ((select auth.uid()) = user_id);

drop policy "medications_select_own" on public.medications;
create policy "medications_select_own" on public.medications
for select to authenticated using ((select auth.uid()) = user_id);

drop policy "medications_insert_own" on public.medications;
create policy "medications_insert_own" on public.medications
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy "medications_update_own" on public.medications;
create policy "medications_update_own" on public.medications
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy "medications_delete_own" on public.medications;
create policy "medications_delete_own" on public.medications
for delete to authenticated using ((select auth.uid()) = user_id);

drop policy "doses_select_own" on public.doses;
create policy "doses_select_own" on public.doses
for select to authenticated using ((select auth.uid()) = user_id);

drop policy "doses_insert_own" on public.doses;
create policy "doses_insert_own" on public.doses
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy "doses_update_own" on public.doses;
create policy "doses_update_own" on public.doses
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy "doses_delete_own" on public.doses;
create policy "doses_delete_own" on public.doses
for delete to authenticated using ((select auth.uid()) = user_id);

drop policy "appointments_select_own" on public.appointments;
create policy "appointments_select_own" on public.appointments
for select to authenticated using ((select auth.uid()) = user_id);

drop policy "appointments_insert_own" on public.appointments;
create policy "appointments_insert_own" on public.appointments
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy "appointments_update_own" on public.appointments;
create policy "appointments_update_own" on public.appointments
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy "appointments_delete_own" on public.appointments;
create policy "appointments_delete_own" on public.appointments
for delete to authenticated using ((select auth.uid()) = user_id);

drop policy "symptom_logs_select_own" on public.symptom_logs;
create policy "symptom_logs_select_own" on public.symptom_logs
for select to authenticated using ((select auth.uid()) = user_id);

drop policy "symptom_logs_insert_own" on public.symptom_logs;
create policy "symptom_logs_insert_own" on public.symptom_logs
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy "symptom_logs_update_own" on public.symptom_logs;
create policy "symptom_logs_update_own" on public.symptom_logs
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy "symptom_logs_delete_own" on public.symptom_logs;
create policy "symptom_logs_delete_own" on public.symptom_logs
for delete to authenticated using ((select auth.uid()) = user_id);
