---This is the official database schema of Amoura - Virtual Photobooth
create table if not exists public.photostrips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text default 'Untitled strip',
  image_url text not null,
  mode text not null default 'single',
  created_at timestamptz not null default now()
);

alter table public.photostrips enable row level security;

create policy "Users can view their own photostrips"
on public.photostrips
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own photostrips"
on public.photostrips
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can delete their own photostrips"
on public.photostrips
for delete
to authenticated
using (auth.uid() = user_id);