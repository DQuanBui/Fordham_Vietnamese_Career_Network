-- =============================================================================
-- FVCN database schema (Supabase / PostgreSQL). Site content lives in supabase/seed.sql.
--
-- Security model
--   * Row Level Security (RLS) is on for every table.
--   * Site content (majors, mentors, resources, events...) is publicly readable.
--   * Students never write to tables directly. They call RPC functions
--     (create_booking, rsvp_event, ...) that validate input, rate-limit, and
--     return a private "manage token" the browser keeps to view or cancel later.
--   * Staff sign in with Supabase Auth (email magic link). Admins are listed in
--     public.admins; mentors are matched by the email in public.mentor_private.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Types
-- -----------------------------------------------------------------------------
create type public.mentor_status as enum ('incoming', 'current', 'former');
create type public.booking_status as enum ('pending', 'confirmed', 'declined', 'completed', 'cancelled');
create type public.class_year as enum ('Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate student');
create type public.meeting_type as enum ('Coffee chat', 'Major or career advice', 'Resume review', 'Interview prep', 'Internship search');
create type public.meeting_format as enum ('Virtual', 'In person', 'Either');
create type public.interest_type as enum ('Become a mentor', 'Suggest a resource', 'Host an event');


-- -----------------------------------------------------------------------------
-- Site content
-- -----------------------------------------------------------------------------
create table public.majors (
  id          text primary key,
  name        text not null,
  short_name  text,
  icon        text not null default 'compass',
  summary     text not null,
  roles       text[] not null default '{}',
  skills      text[] not null default '{}',
  timeline    jsonb not null default '[]',   -- [{ "when": "...", "what": "..." }]
  sort_order  int not null default 0
);

create table public.companies (
  id          text primary key,
  name        text not null,
  logo_url    text,                          -- wide logo for the logo strip (null = not shown there)
  icon_url    text,                          -- small square mark next to a mentor's company
  logo_fit    text not null default 'contain' check (logo_fit in ('contain', 'cover')),
  sort_order  int not null default 0
);

create table public.mentors (
  id            text primary key,            -- url-friendly slug, e.g. "quan-bui"
  name          text not null,
  major_id      text not null references public.majors (id),
  status        public.mentor_status not null default 'current',
  role          text not null,
  company_label text,                        -- used when the company has no row in companies
  linkedin_url  text check (linkedin_url is null or linkedin_url ~* '^https://([a-z]+\.)?linkedin\.com/'),
  bio           text not null default '',
  helps_with    text[] not null default '{}',
  interests     text[] not null default '{}',
  photo_url     text,
  featured      boolean not null default false,
  is_active     boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

-- A mentor can be linked to more than one company (e.g. incoming at Deloitte and EY).
create table public.mentor_companies (
  mentor_id   text not null references public.mentors (id) on delete cascade,
  company_id  text not null references public.companies (id),
  sort_order  int not null default 0,
  primary key (mentor_id, company_id)
);

-- Mentor contact details live apart from the public mentors table.
create table public.mentor_private (
  mentor_id  text primary key references public.mentors (id) on delete cascade,
  email      text not null
);
create unique index mentor_private_email_key on public.mentor_private (lower(email));

create table public.resources (
  id           text primary key,
  title        text not null,
  major_id     text references public.majors (id),   -- null = useful for any major
  type         text not null,
  level        text not null check (level in ('Beginner', 'Intermediate', 'Advanced')),
  source       text not null,
  url          text,
  guide_id     text,                                  -- built-in FVCN guide shown in a dialog
  description  text not null,
  is_published boolean not null default true,
  sort_order   int not null default 0
);

create table public.events (
  id           text primary key,
  title        text not null,
  category     text not null check (category in ('Career', 'Community', 'Alumni')),
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  location     text not null,
  description  text not null,
  is_published boolean not null default true,
  check (ends_at > starts_at)
);


-- -----------------------------------------------------------------------------
-- Staff
-- -----------------------------------------------------------------------------
create table public.admins (
  email      text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);


-- -----------------------------------------------------------------------------
-- Coffee chat requests
-- -----------------------------------------------------------------------------
create table public.bookings (
  id                uuid primary key default gen_random_uuid(),
  reference         text not null unique
                      default ('FV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))),
  manage_token      uuid not null unique default gen_random_uuid(),  -- secret held by the student's browser
  student_name      text not null check (char_length(student_name) between 2 and 100),
  student_email     text not null check (student_email ~* '^[^[:space:]@]+@fordham\.edu$'),
  class_year        public.class_year not null,
  major_id          text references public.majors (id),    -- null = still exploring
  mentor_id         text references public.mentors (id),   -- null = "no preference, match me"
  meeting_type      public.meeting_type not null,
  format            public.meeting_format not null default 'Virtual',
  preferred_time_1  timestamptz not null,
  preferred_time_2  timestamptz,
  link              text check (link is null or link ~* '^https?://'),
  message           text not null check (char_length(message) between 10 and 600),
  status            public.booking_status not null default 'pending',
  confirmed_time    timestamptz,
  staff_note        text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index bookings_status_idx on public.bookings (status, created_at desc);
create index bookings_mentor_idx on public.bookings (mentor_id, status);
create index bookings_email_idx on public.bookings (lower(student_email), created_at desc);

-- Every status change is recorded, so staff can see a request's full history.
create table public.booking_status_history (
  id           bigint generated always as identity primary key,
  booking_id   uuid not null references public.bookings (id) on delete cascade,
  from_status  public.booking_status,
  to_status    public.booking_status not null,
  note         text,
  changed_by   text not null,     -- staff email, or 'student'
  created_at   timestamptz not null default now()
);
create index booking_status_history_booking_idx on public.booking_status_history (booking_id, created_at);


-- -----------------------------------------------------------------------------
-- Event RSVPs and "get involved" submissions
-- -----------------------------------------------------------------------------
create table public.event_rsvps (
  id            uuid primary key default gen_random_uuid(),
  event_id      text not null references public.events (id) on delete cascade,
  name          text not null check (char_length(name) between 2 and 100),
  email         text not null check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  manage_token  uuid not null unique default gen_random_uuid(),
  created_at    timestamptz not null default now()
);
create unique index event_rsvps_one_per_person on public.event_rsvps (event_id, lower(email));

create table public.interest_submissions (
  id           uuid primary key default gen_random_uuid(),
  type         public.interest_type not null,
  name         text not null check (char_length(name) between 2 and 100),
  email        text not null check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  details      text not null check (char_length(details) between 5 and 2000),
  is_reviewed  boolean not null default false,
  created_at   timestamptz not null default now()
);
create index interest_submissions_email_idx on public.interest_submissions (lower(email), created_at desc);


-- -----------------------------------------------------------------------------
-- Who is calling? (reads the signed-in user's email from the Supabase JWT)
-- -----------------------------------------------------------------------------
create or replace function public.current_email()
returns text
language sql stable
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.email = public.current_email())
$$;

create or replace function public.current_mentor_id()
returns text
language sql stable security definer
set search_path = public
as $$
  select mp.mentor_id from public.mentor_private mp
  where public.current_email() <> '' and lower(mp.email) = public.current_email()
$$;


-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger bookings_touch_updated_at
  before update on public.bookings
  for each row execute function public.touch_updated_at();

-- RPCs pass context to this trigger with set_config('fvcn.changed_by' / 'fvcn.status_note', ..., true).
create or replace function public.log_booking_status()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.booking_status_history (booking_id, from_status, to_status, note, changed_by)
    values (
      new.id,
      case when tg_op = 'UPDATE' then old.status end,
      new.status,
      nullif(current_setting('fvcn.status_note', true), ''),
      coalesce(nullif(current_setting('fvcn.changed_by', true), ''), nullif(public.current_email(), ''), 'student')
    );
  end if;
  return new;
end;
$$;

create trigger bookings_log_status
  after insert or update of status on public.bookings
  for each row execute function public.log_booking_status();


-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.majors                 enable row level security;
alter table public.companies              enable row level security;
alter table public.mentors                enable row level security;
alter table public.mentor_companies       enable row level security;
alter table public.mentor_private         enable row level security;
alter table public.resources              enable row level security;
alter table public.events                 enable row level security;
alter table public.admins                 enable row level security;
alter table public.bookings               enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.event_rsvps            enable row level security;
alter table public.interest_submissions   enable row level security;

-- Public content: anyone can read; admins can edit.
create policy "Content is public" on public.majors for select using (true);
create policy "Admins edit majors" on public.majors for all using (public.is_admin()) with check (public.is_admin());

create policy "Content is public" on public.companies for select using (true);
create policy "Admins edit companies" on public.companies for all using (public.is_admin()) with check (public.is_admin());

create policy "Active mentors are public" on public.mentors for select using (is_active or public.is_admin());
create policy "Admins edit mentors" on public.mentors for all using (public.is_admin()) with check (public.is_admin());

create policy "Content is public" on public.mentor_companies for select using (true);
create policy "Admins edit mentor companies" on public.mentor_companies for all using (public.is_admin()) with check (public.is_admin());

create policy "Published resources are public" on public.resources for select using (is_published or public.is_admin());
create policy "Admins edit resources" on public.resources for all using (public.is_admin()) with check (public.is_admin());

create policy "Published events are public" on public.events for select using (is_published or public.is_admin());
create policy "Admins edit events" on public.events for all using (public.is_admin()) with check (public.is_admin());

-- Staff-only data. No insert/update/delete policies: writes go through the RPCs below.
create policy "Admins see admins" on public.admins for select using (public.is_admin());

create policy "Staff see mentor contacts" on public.mentor_private for select
  using (public.is_admin() or mentor_id = public.current_mentor_id());
create policy "Admins edit mentor contacts" on public.mentor_private for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins see all requests; mentors see theirs" on public.bookings for select
  using (public.is_admin() or (mentor_id is not null and mentor_id = public.current_mentor_id()));

create policy "Staff see history for requests they can see" on public.booking_status_history for select
  using (exists (
    select 1 from public.bookings b
    where b.id = booking_id
      and (public.is_admin() or (b.mentor_id is not null and b.mentor_id = public.current_mentor_id()))
  ));

create policy "Admins see RSVPs" on public.event_rsvps for select using (public.is_admin());

create policy "Admins see submissions" on public.interest_submissions for select using (public.is_admin());
create policy "Admins mark submissions reviewed" on public.interest_submissions for update
  using (public.is_admin()) with check (public.is_admin());


-- -----------------------------------------------------------------------------
-- Student-facing RPCs (callable with the public anon key)
-- Errors use HINT to name the form field the message belongs to.
-- -----------------------------------------------------------------------------
create or replace function public.create_booking(
  p_name          text,
  p_email         text,
  p_class_year    public.class_year,
  p_meeting_type  public.meeting_type,
  p_format        public.meeting_format,
  p_time_1        timestamptz,
  p_message       text,
  p_major_id      text default null,
  p_mentor_id     text default null,
  p_time_2        timestamptz default null,
  p_link          text default null
)
returns table (id uuid, reference text, manage_token uuid, status public.booking_status, created_at timestamptz)
language plpgsql security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_email  text := lower(trim(coalesce(p_email, '')));
  v_recent int;
begin
  if char_length(trim(coalesce(p_name, ''))) < 2 then
    raise exception 'Please enter your full name.' using hint = 'name';
  end if;
  if v_email !~ '^[^[:space:]@]+@fordham\.edu$' then
    raise exception 'Please use your @fordham.edu email.' using hint = 'email';
  end if;
  if p_time_1 is null or p_time_1 < now() then
    raise exception 'Please choose a time in the future.' using hint = 'time1';
  end if;
  if p_time_2 is not null and (p_time_2 < now() or p_time_2 = p_time_1) then
    raise exception 'Pick a different backup time in the future.' using hint = 'time2';
  end if;
  if char_length(trim(coalesce(p_message, ''))) < 10 then
    raise exception 'Tell your mentor a little more (at least 10 characters).' using hint = 'message';
  end if;
  if p_major_id is not null and not exists (select 1 from public.majors m where m.id = p_major_id) then
    raise exception 'Please choose a major or interest.' using hint = 'majorId';
  end if;
  if p_mentor_id is not null and not exists (select 1 from public.mentors m where m.id = p_mentor_id and m.is_active) then
    raise exception 'That mentor is not taking requests right now.' using hint = 'mentorId';
  end if;

  select count(*) into v_recent
  from public.bookings b
  where lower(b.student_email) = v_email and b.created_at > now() - interval '24 hours';
  if v_recent >= 5 then
    raise exception 'You''ve sent several requests today. Please wait for a reply before sending more.' using hint = 'rate_limit';
  end if;

  return query
  insert into public.bookings as b (
    student_name, student_email, class_year, major_id, mentor_id, meeting_type, format,
    preferred_time_1, preferred_time_2, link, message
  )
  values (
    trim(p_name), v_email, p_class_year, p_major_id, p_mentor_id, p_meeting_type, coalesce(p_format, 'Virtual'),
    p_time_1, p_time_2, nullif(trim(p_link), ''), trim(p_message)
  )
  returning b.id, b.reference, b.manage_token, b.status, b.created_at;
end;
$$;

-- The student's browser keeps the manage tokens from create_booking and calls this to show "Your requests".
create or replace function public.get_my_bookings(p_tokens uuid[])
returns table (
  reference text, manage_token uuid, status public.booking_status, meeting_type public.meeting_type,
  format public.meeting_format, preferred_time_1 timestamptz, preferred_time_2 timestamptz,
  confirmed_time timestamptz, mentor_name text, created_at timestamptz
)
language sql stable security definer
set search_path = public
as $$
  select b.reference, b.manage_token, b.status, b.meeting_type, b.format, b.preferred_time_1,
         b.preferred_time_2, b.confirmed_time, m.name, b.created_at
  from public.bookings b
  left join public.mentors m on m.id = b.mentor_id
  where b.manage_token = any (coalesce(p_tokens, '{}'))
  order by b.created_at desc
  limit 20
$$;

create or replace function public.cancel_booking(p_token uuid)
returns public.booking_status
language plpgsql security definer
set search_path = public
as $$
declare
  v_id     uuid;
  v_status public.booking_status;
begin
  select b.id, b.status into v_id, v_status
  from public.bookings b where b.manage_token = p_token
  for update;

  if v_id is null then
    raise exception 'We couldn''t find that request.' using hint = 'not_found';
  end if;
  if v_status not in ('pending', 'confirmed') then
    raise exception 'This request can no longer be cancelled.' using hint = 'invalid_status';
  end if;

  perform set_config('fvcn.changed_by', 'student', true);
  update public.bookings set status = 'cancelled' where id = v_id;
  return 'cancelled';
end;
$$;

create or replace function public.rsvp_event(p_event_id text, p_name text, p_email text)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_token uuid;
begin
  if not exists (
    select 1 from public.events e where e.id = p_event_id and e.is_published and e.ends_at > now()
  ) then
    raise exception 'This event is no longer taking RSVPs.' using hint = 'not_found';
  end if;

  insert into public.event_rsvps (event_id, name, email)
  values (p_event_id, trim(p_name), lower(trim(p_email)))
  on conflict (event_id, lower(email)) do update set name = excluded.name
  returning manage_token into v_token;

  return v_token;
end;
$$;

create or replace function public.cancel_rsvp(p_token uuid)
returns void
language sql security definer
set search_path = public
as $$
  delete from public.event_rsvps where manage_token = p_token
$$;

create or replace function public.get_event_rsvp_counts()
returns table (event_id text, going int)
language sql stable security definer
set search_path = public
as $$
  select r.event_id, count(*)::int from public.event_rsvps r group by r.event_id
$$;

create or replace function public.submit_interest(
  p_type public.interest_type, p_name text, p_email text, p_details text
)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_id    uuid;
begin
  if (select count(*) from public.interest_submissions s
      where lower(s.email) = v_email and s.created_at > now() - interval '24 hours') >= 5 then
    raise exception 'Thanks! We already have several submissions from you today.' using hint = 'rate_limit';
  end if;

  insert into public.interest_submissions (type, name, email, details)
  values (p_type, trim(p_name), v_email, trim(p_details))
  returning id into v_id;
  return v_id;
end;
$$;


-- -----------------------------------------------------------------------------
-- Staff RPCs (require a signed-in admin or mentor)
-- -----------------------------------------------------------------------------
create or replace function public.whoami()
returns table (email text, is_admin boolean, mentor_id text, mentor_name text)
language sql stable security definer
set search_path = public
as $$
  select public.current_email(), public.is_admin(), m.id, m.name
  from (select public.current_mentor_id() as mid) me
  left join public.mentors m on m.id = me.mid
$$;

create or replace function public.set_booking_status(
  p_booking_id      uuid,
  p_status          public.booking_status,
  p_note            text default null,
  p_confirmed_time  timestamptz default null
)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
  v_admin   boolean := public.is_admin();
  v_mentor  text := public.current_mentor_id();
begin
  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found then
    raise exception 'We couldn''t find that request.' using hint = 'not_found';
  end if;

  -- coalesce: an unassigned request (mentor_id null) must not slip through as "unknown".
  if not (v_admin or coalesce(v_booking.mentor_id = v_mentor, false)) then
    raise exception 'You don''t have access to this request.' using errcode = '42501';
  end if;
  if not v_admin and p_status not in ('confirmed', 'declined', 'completed') then
    raise exception 'Mentors can confirm, decline, or complete a request.' using hint = 'status';
  end if;
  if not v_admin and v_booking.status = 'cancelled' then
    raise exception 'The student cancelled this request.' using hint = 'status';
  end if;
  if p_status = 'confirmed' and coalesce(p_confirmed_time, v_booking.confirmed_time) is null then
    raise exception 'Choose the meeting time you are confirming.' using hint = 'confirmed_time';
  end if;

  perform set_config('fvcn.changed_by', public.current_email(), true);
  perform set_config('fvcn.status_note', coalesce(trim(p_note), ''), true);

  update public.bookings
  set status         = p_status,
      confirmed_time = case when p_status = 'confirmed'
                            then coalesce(p_confirmed_time, confirmed_time)
                            else confirmed_time end,
      staff_note     = coalesce(nullif(trim(p_note), ''), staff_note)
  where id = p_booking_id;
end;
$$;

create or replace function public.assign_booking_mentor(p_booking_id uuid, p_mentor_id text)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_status public.booking_status;
  v_name   text;
begin
  if not public.is_admin() then
    raise exception 'Only admins can assign mentors.' using errcode = '42501';
  end if;

  select m.name into v_name from public.mentors m where m.id = p_mentor_id;
  if v_name is null then
    raise exception 'That mentor does not exist.' using hint = 'mentorId';
  end if;

  update public.bookings set mentor_id = p_mentor_id
  where id = p_booking_id
  returning status into v_status;
  if v_status is null then
    raise exception 'We couldn''t find that request.' using hint = 'not_found';
  end if;

  insert into public.booking_status_history (booking_id, from_status, to_status, note, changed_by)
  values (p_booking_id, v_status, v_status, 'Assigned to ' || v_name, public.current_email());
end;
$$;


-- -----------------------------------------------------------------------------
-- Function permissions: only expose what each role needs.
-- -----------------------------------------------------------------------------
revoke execute on all functions in schema public from public, anon, authenticated;

grant execute on function
  public.create_booking(text, text, public.class_year, public.meeting_type, public.meeting_format, timestamptz, text, text, text, timestamptz, text),
  public.get_my_bookings(uuid[]),
  public.cancel_booking(uuid),
  public.rsvp_event(text, text, text),
  public.cancel_rsvp(uuid),
  public.get_event_rsvp_counts(),
  public.submit_interest(public.interest_type, text, text, text)
to anon, authenticated;

grant execute on function
  public.whoami(),
  public.set_booking_status(uuid, public.booking_status, text, timestamptz),
  public.assign_booking_mentor(uuid, text)
to authenticated;

-- Used inside RLS policies, so every role that reads tables needs them.
grant execute on function public.current_email(), public.is_admin(), public.current_mentor_id()
to anon, authenticated;
