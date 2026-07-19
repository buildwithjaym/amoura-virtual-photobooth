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



alter table public.dual_rooms
drop constraint if exists dual_rooms_status_check;

alter table public.dual_rooms
add constraint dual_rooms_status_check check (
  status = any (
    array[
      'waiting'::text,
      'partner_joined'::text,
      'ready'::text,
      'countdown'::text,
      'capturing'::text,
      'between_shots'::text,
      'completed'::text,
      'expired'::text,
      'cancelled'::text
    ]
  )
);




create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamp with time zone not null default now()
);

alter table public.admin_users enable row level security;

create policy "Admins can read admin users"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

insert into public.admin_users (user_id, email)
select id, email
from auth.users
where email = 'YOUR_ADMIN_EMAIL_HERE'
on conflict (email) do nothing;



create or replace function public.get_admin_dashboard_stats()
returns json
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  is_admin boolean;
  result json;
begin
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  )
  into is_admin;

  if not is_admin then
    raise exception 'Not authorized';
  end if;

  select json_build_object(
    'totalUsers', (
      select count(*)
      from auth.users
    ),

    'usersToday', (
      select count(*)
      from auth.users
      where created_at >= date_trunc('day', now())
    ),

    'usersLast7Days', (
      select count(*)
      from auth.users
      where created_at >= now() - interval '7 days'
    ),

    'usersLast30Days', (
      select count(*)
      from auth.users
      where created_at >= now() - interval '30 days'
    ),

    'totalDualRooms', (
      select count(*)
      from public.dual_rooms
    ),

    'dualRoomsToday', (
      select count(*)
      from public.dual_rooms
      where created_at >= date_trunc('day', now())
    ),

    'dualRoomsLast7Days', (
      select count(*)
      from public.dual_rooms
      where created_at >= now() - interval '7 days'
    ),

    'completedDualRooms', (
      select count(*)
      from public.dual_rooms
      where status = 'completed'
    ),

    'activeDualRooms', (
      select count(*)
      from public.dual_rooms
      where status in ('waiting', 'partner_joined', 'ready', 'countdown', 'capturing', 'between_shots')
    ),

    'totalDualMembers', (
      select count(*)
      from public.dual_room_members
    ),

    'dailyStats', (
      select coalesce(json_agg(row_to_json(day_stats)), '[]'::json)
      from (
        select
          day::date as date,

          (
            select count(*)
            from auth.users u
            where u.created_at >= day
              and u.created_at < day + interval '1 day'
          ) as users,

          (
            select count(*)
            from public.dual_rooms dr
            where dr.created_at >= day
              and dr.created_at < day + interval '1 day'
          ) as dualRooms,

          (
            select count(*)
            from public.dual_rooms dr
            where dr.created_at >= day
              and dr.created_at < day + interval '1 day'
              and dr.status = 'completed'
          ) as completedRooms

        from generate_series(
          date_trunc('day', now()) - interval '6 days',
          date_trunc('day', now()),
          interval '1 day'
        ) day
        order by day asc
      ) day_stats
    ),

    'recentRooms', (
      select coalesce(json_agg(row_to_json(recent)), '[]'::json)
      from (
        select
          dr.id,
          dr.room_code,
          dr.status,
          dr.current_shot,
          dr.total_shots,
          dr.created_at,
          dr.expires_at,
          count(drm.id) as members
        from public.dual_rooms dr
        left join public.dual_room_members drm
          on drm.room_id = dr.id
        group by dr.id
        order by dr.created_at desc
        limit 10
      ) recent
    )
  )
  into result;

  return result;
end;
$$;

revoke all on function public.get_admin_dashboard_stats() from public;
grant execute on function public.get_admin_dashboard_stats() to authenticated;


-- =====================================================
-- Create the pings table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    value INTEGER NOT NULL CHECK (value = 1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Enable Row Level Security (RLS)
-- =====================================================
ALTER TABLE public.pings
ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Policy: Allow anonymous users to insert records
-- =====================================================
CREATE POLICY "allow insert"
ON public.pings
FOR INSERT
TO anon
WITH CHECK (true);

-- =====================================================
-- Policy: Allow anonymous users to read records
-- =====================================================
CREATE POLICY "allow read"
ON public.pings
FOR SELECT
TO anon
USING (true);