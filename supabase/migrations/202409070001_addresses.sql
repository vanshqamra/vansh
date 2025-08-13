create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  label text,
  first_name text,
  last_name text,
  company text,
  gst text,
  phone text,
  line1 text,
  line2 text,
  city text,
  state text,
  pincode text,
  country text default 'India',
  notes text,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table addresses enable row level security;

-- RLS policies
drop policy if exists "addresses user select" on addresses;
create policy "addresses user select" on addresses for select to authenticated using (user_id = auth.uid());

drop policy if exists "addresses user insert" on addresses;
create policy "addresses user insert" on addresses for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "addresses user update" on addresses;
create policy "addresses user update" on addresses for update to authenticated using (user_id = auth.uid());

drop policy if exists "addresses user delete" on addresses;
create policy "addresses user delete" on addresses for delete to authenticated using (user_id = auth.uid());

create index if not exists addresses_user_id_idx on addresses(user_id);
