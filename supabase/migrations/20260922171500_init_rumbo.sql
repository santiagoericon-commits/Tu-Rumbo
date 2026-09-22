create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  dosage text,
  created_at timestamptz not null default now()
);

create table if not exists public.doses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  medication_id uuid references public.medications(id) on delete set null,
  scheduled_at timestamptz not null,
  status text not null default 'pending' check (status in ('taken', 'missed', 'pending')),
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scheduled_at timestamptz not null,
  title text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.symptom_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  severity int not null check (severity between 1 and 5),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.medications enable row level security;
alter table public.doses enable row level security;
alter table public.appointments enable row level security;
alter table public.symptom_logs enable row level security;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles_delete_own" on public.profiles
for delete using (auth.uid() = user_id);

create policy "medications_select_own" on public.medications
for select using (auth.uid() = user_id);
create policy "medications_insert_own" on public.medications
for insert with check (auth.uid() = user_id);
create policy "medications_update_own" on public.medications
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "medications_delete_own" on public.medications
for delete using (auth.uid() = user_id);

create policy "doses_select_own" on public.doses
for select using (auth.uid() = user_id);
create policy "doses_insert_own" on public.doses
for insert with check (auth.uid() = user_id);
create policy "doses_update_own" on public.doses
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "doses_delete_own" on public.doses
for delete using (auth.uid() = user_id);

create policy "appointments_select_own" on public.appointments
for select using (auth.uid() = user_id);
create policy "appointments_insert_own" on public.appointments
for insert with check (auth.uid() = user_id);
create policy "appointments_update_own" on public.appointments
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "appointments_delete_own" on public.appointments
for delete using (auth.uid() = user_id);

create policy "symptom_logs_select_own" on public.symptom_logs
for select using (auth.uid() = user_id);
create policy "symptom_logs_insert_own" on public.symptom_logs
for insert with check (auth.uid() = user_id);
create policy "symptom_logs_update_own" on public.symptom_logs
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "symptom_logs_delete_own" on public.symptom_logs
for delete using (auth.uid() = user_id);
