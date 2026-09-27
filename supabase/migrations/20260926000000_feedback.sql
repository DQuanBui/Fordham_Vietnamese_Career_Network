-- =============================================================================
-- Post-chat feedback, published testimonials, and public impact stats.
--   * Students rate a chat (1–5) from their private status link once it has happened.
--   * Admins choose which comments to publish; students must opt in to being quoted.
--   * Aggregate numbers (chats completed, average rating) are public; rows are not.
-- =============================================================================

create table public.booking_feedback (
  booking_id    uuid primary key references public.bookings (id) on delete cascade,
  rating        int not null check (rating between 1 and 5),
  comment       text check (comment is null or char_length(comment) <= 1000),
  allow_quote   boolean not null default false,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table public.booking_feedback enable row level security;

create policy "Staff see feedback for requests they can see" on public.booking_feedback for select
  using (exists (
    select 1 from public.bookings b
    where b.id = booking_id
      and (public.is_admin() or coalesce(b.mentor_id = public.current_mentor_id(), false))
  ));

create policy "Admins publish feedback" on public.booking_feedback for update
  using (public.is_admin()) with check (public.is_admin());


-- The status page now also shows the mentor's note and whether feedback was left.
drop function public.get_my_bookings(uuid[]);

create function public.get_my_bookings(p_tokens uuid[])
returns table (
  reference text, manage_token uuid, status public.booking_status, meeting_type public.meeting_type,
  format public.meeting_format, preferred_time_1 timestamptz, preferred_time_2 timestamptz,
  confirmed_time timestamptz, mentor_name text, created_at timestamptz,
  staff_note text, feedback_rating int
)
language sql stable security definer
set search_path = public
as $$
  select b.reference, b.manage_token, b.status, b.meeting_type, b.format, b.preferred_time_1,
         b.preferred_time_2, b.confirmed_time, m.name, b.created_at,
         b.staff_note, f.rating
  from public.bookings b
  left join public.mentors m on m.id = b.mentor_id
  left join public.booking_feedback f on f.booking_id = b.id
  where b.manage_token = any (coalesce(p_tokens, '{}'))
  order by b.created_at desc
  limit 20
$$;


-- Students can rate a chat once it is completed, or once the confirmed time has passed.
create or replace function public.submit_feedback(
  p_token uuid, p_rating int, p_comment text default null, p_allow_quote boolean default false
)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_id     uuid;
  v_status public.booking_status;
  v_time   timestamptz;
begin
  select b.id, b.status, b.confirmed_time into v_id, v_status, v_time
  from public.bookings b where b.manage_token = p_token;

  if v_id is null then
    raise exception 'We couldn''t find that request.' using hint = 'not_found';
  end if;
  if not (v_status = 'completed' or (v_status = 'confirmed' and v_time < now())) then
    raise exception 'You can leave feedback after your chat.' using hint = 'invalid_status';
  end if;
  if p_rating is null or p_rating not between 1 and 5 then
    raise exception 'Please choose a rating from 1 to 5.' using hint = 'rating';
  end if;
  if char_length(coalesce(p_comment, '')) > 1000 then
    raise exception 'Please keep your comment under 1,000 characters.' using hint = 'comment';
  end if;

  insert into public.booking_feedback (booking_id, rating, comment, allow_quote)
  values (v_id, p_rating, nullif(trim(p_comment), ''), coalesce(p_allow_quote, false))
  on conflict (booking_id) do update
    set rating = excluded.rating,
        comment = excluded.comment,
        allow_quote = excluded.allow_quote,
        is_published = false;           -- edited feedback needs to be approved again
end;
$$;


-- Published quotes for the home page: first name, class year, and major only.
create or replace function public.get_testimonials()
returns table (quote text, rating int, student text, detail text, mentor text)
language sql stable security definer
set search_path = public
as $$
  select f.comment,
         f.rating,
         split_part(trim(b.student_name), ' ', 1),
         b.class_year::text || coalesce(', ' || coalesce(ma.short_name, ma.name), ''),
         m.name
  from public.booking_feedback f
  join public.bookings b on b.id = f.booking_id
  left join public.majors ma on ma.id = b.major_id
  left join public.mentors m on m.id = b.mentor_id
  where f.is_published and f.allow_quote and f.comment is not null
  order by f.created_at desc
  limit 6
$$;


-- Aggregate impact numbers for the home page.
create or replace function public.get_public_stats()
returns table (chats_completed int, students_helped int, average_rating numeric)
language sql stable security definer
set search_path = public
as $$
  select
    (count(*) filter (where b.status = 'completed'))::int,
    (count(distinct lower(b.student_email)) filter (where b.status in ('confirmed', 'completed')))::int,
    round(avg(f.rating), 1)
  from public.bookings b
  left join public.booking_feedback f on f.booking_id = b.id
$$;


revoke execute on function
  public.get_my_bookings(uuid[]),
  public.submit_feedback(uuid, int, text, boolean),
  public.get_testimonials(),
  public.get_public_stats()
from public, anon, authenticated;

grant execute on function
  public.get_my_bookings(uuid[]),
  public.submit_feedback(uuid, int, text, boolean),
  public.get_testimonials(),
  public.get_public_stats()
to anon, authenticated;
