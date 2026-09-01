-- =============================================
-- ورشة التفاوض السياسي — Initial Schema
-- =============================================

-- 1. Countries table (10 fixed rows)
create table countries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  flag_emoji text not null,
  points integer not null default 0,
  created_at timestamptz default now()
);

-- 2. Agreements table
create table agreements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_at timestamptz default now()
);

-- 3. Join table: many-to-many countries <-> agreements
create table agreement_countries (
  agreement_id uuid references agreements(id) on delete cascade,
  country_id uuid references countries(id) on delete cascade,
  primary key (agreement_id, country_id)
);

-- =============================================
-- Row Level Security
-- =============================================

alter table countries enable row level security;
alter table agreements enable row level security;
alter table agreement_countries enable row level security;

-- Public read access (anon)
create policy "Public read countries"
  on countries for select
  to anon, authenticated
  using (true);

create policy "Public read agreements"
  on agreements for select
  to anon, authenticated
  using (true);

create policy "Public read agreement_countries"
  on agreement_countries for select
  to anon, authenticated
  using (true);

-- Admin write access (authenticated only)
create policy "Admin insert countries"
  on countries for insert
  to authenticated
  with check (true);

create policy "Admin update countries"
  on countries for update
  to authenticated
  using (true)
  with check (true);

create policy "Admin delete countries"
  on countries for delete
  to authenticated
  using (true);

create policy "Admin insert agreements"
  on agreements for insert
  to authenticated
  with check (true);

create policy "Admin update agreements"
  on agreements for update
  to authenticated
  using (true)
  with check (true);

create policy "Admin delete agreements"
  on agreements for delete
  to authenticated
  using (true);

create policy "Admin insert agreement_countries"
  on agreement_countries for insert
  to authenticated
  with check (true);

create policy "Admin delete agreement_countries"
  on agreement_countries for delete
  to authenticated
  using (true);

-- =============================================
-- Enable Realtime
-- =============================================

alter publication supabase_realtime add table countries;
alter publication supabase_realtime add table agreements;
alter publication supabase_realtime add table agreement_countries;

-- =============================================
-- Seed: 10 Countries
-- =============================================

insert into countries (name, flag_emoji, points) values
  ('تركيا', '🇹🇷', 0),
  ('ألمانيا', '🇩🇪', 0),
  ('فرنسا', '🇫🇷', 0),
  ('الولايات المتحدة', '🇺🇸', 0),
  ('إيطاليا', '🇮🇹', 0),
  ('إسبانيا', '🇪🇸', 0),
  ('اليابان', '🇯🇵', 0),
  ('الصين', '🇨🇳', 0),
  ('بريطانيا', '🇬🇧', 0),
  ('كندا', '🇨🇦', 0);
