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




create table if not exists public.dual_rooms (
  id uuid not null default gen_random_uuid(),
  room_code text not null,
  host_user_id uuid not null,
  status text not null default 'waiting',
  total_shots integer not null default 3,
  current_shot integer not null default 0,
  countdown_starts_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  expires_at timestamp with time zone not null default (now() + interval '30 minutes'),

  constraint dual_rooms_pkey primary key (id),
  constraint dual_rooms_room_code_key unique (room_code),
  constraint dual_rooms_host_user_id_fkey foreign key (host_user_id)
    references auth.users (id) on delete cascade,
  constraint dual_rooms_status_check check (
    status in (
      'waiting',
      'partner_joined',
      'ready',
      'countdown',
      'capturing',
      'completed',
      'expired',
      'cancelled'
    )
  )
);

create table if not exists public.dual_room_members (
  id uuid not null default gen_random_uuid(),
  room_id uuid not null,
  user_id uuid null,
  role text not null,
  display_name text null,
  is_ready boolean not null default false,
  is_connected boolean not null default true,
  joined_at timestamp with time zone not null default now(),

  constraint dual_room_members_pkey primary key (id),
  constraint dual_room_members_room_id_fkey foreign key (room_id)
    references public.dual_rooms (id) on delete cascade,
  constraint dual_room_members_user_id_fkey foreign key (user_id)
    references auth.users (id) on delete cascade,
  constraint dual_room_members_role_check check (role in ('host', 'partner')),
  constraint dual_room_members_unique_role_per_room unique (room_id, role)
);

alter table public.dual_rooms enable row level security;
alter table public.dual_room_members enable row level security;

drop policy if exists "Users can create dual rooms" on public.dual_rooms;
drop policy if exists "Users can view active dual rooms" on public.dual_rooms;
drop policy if exists "Host can update dual room" on public.dual_rooms;
drop policy if exists "Host can delete dual room" on public.dual_rooms;

create policy "Users can create dual rooms"
on public.dual_rooms
for insert
to authenticated
with check (auth.uid() = host_user_id);

create policy "Users can view active dual rooms"
on public.dual_rooms
for select
to authenticated
using (expires_at > now());

create policy "Host can update dual room"
on public.dual_rooms
for update
to authenticated
using (host_user_id = auth.uid())
with check (host_user_id = auth.uid());

create policy "Host can delete dual room"
on public.dual_rooms
for delete
to authenticated
using (host_user_id = auth.uid());

drop policy if exists "Users can view room members" on public.dual_room_members;
drop policy if exists "Users can join room as themselves" on public.dual_room_members;
drop policy if exists "Users can update own room member" on public.dual_room_members;
drop policy if exists "Users can leave own room member" on public.dual_room_members;

create policy "Users can view room members"
on public.dual_room_members
for select
to authenticated
using (
  exists (
    select 1
    from public.dual_rooms r
    where r.id = dual_room_members.room_id
      and r.expires_at > now()
  )
);

create policy "Users can join room as themselves"
on public.dual_room_members
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update own room member"
on public.dual_room_members
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can leave own room member"
on public.dual_room_members
for delete
to authenticated
using (user_id = auth.uid());

alter publication supabase_realtime add table public.dual_rooms;
alter publication supabase_realtime add table public.dual_room_members;