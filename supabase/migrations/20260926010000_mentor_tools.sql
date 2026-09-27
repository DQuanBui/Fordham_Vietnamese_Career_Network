-- =============================================================================
-- Mentor self-service.
--   * Mentors can pause new requests (e.g. during finals) without being hidden.
--   * Mentors edit their own bio, topics, interests, and LinkedIn through a
--     validated function; they cannot touch anyone else's profile.
-- Admins manage mentors, companies, and events directly through the existing
-- "Admins edit ..." RLS policies.
-- =============================================================================

alter table public.mentors add column if not exists accepting_requests boolean not null default true;


-- Same as before, plus: a paused mentor can't receive new requests.
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
  if p_mentor_id is not null and not exists (
    select 1 from public.mentors m where m.id = p_mentor_id and m.is_active and m.accepting_requests
  ) then
    raise exception 'That mentor isn''t taking new requests right now. Choose another mentor or "No preference".' using hint = 'mentorId';
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


create or replace function public.update_my_profile(
  p_bio                 text,
  p_helps_with          text[],
  p_interests           text[],
  p_linkedin_url        text,
  p_accepting_requests  boolean
)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_mentor text := public.current_mentor_id();
  v_helps  text[] := coalesce((select array_agg(trim(x)) from unnest(p_helps_with) x where trim(x) <> ''), '{}');
  v_likes  text[] := coalesce((select array_agg(trim(x)) from unnest(p_interests) x where trim(x) <> ''), '{}');
begin
  if v_mentor is null then
    raise exception 'Only mentors can edit a mentor profile.' using errcode = '42501';
  end if;
  if char_length(trim(coalesce(p_bio, ''))) not between 20 and 400 then
    raise exception 'Keep your bio between 20 and 400 characters.' using hint = 'bio';
  end if;
  if cardinality(v_helps) not between 1 and 5 or exists (select 1 from unnest(v_helps) x where char_length(x) > 40) then
    raise exception 'List 1 to 5 topics, each under 40 characters.' using hint = 'helpsWith';
  end if;
  if cardinality(v_likes) > 5 or exists (select 1 from unnest(v_likes) x where char_length(x) > 30) then
    raise exception 'List up to 5 interests, each under 30 characters.' using hint = 'interests';
  end if;
  if nullif(trim(p_linkedin_url), '') is not null and trim(p_linkedin_url) !~* '^https://([a-z]+\.)?linkedin\.com/' then
    raise exception 'Use your full LinkedIn profile link (https://www.linkedin.com/in/...).' using hint = 'linkedin';
  end if;

  update public.mentors
  set bio = trim(p_bio),
      helps_with = v_helps,
      interests = v_likes,
      linkedin_url = nullif(trim(p_linkedin_url), ''),
      accepting_requests = coalesce(p_accepting_requests, true)
  where id = v_mentor;
end;
$$;


revoke execute on function
  public.create_booking(text, text, public.class_year, public.meeting_type, public.meeting_format, timestamptz, text, text, text, timestamptz, text),
  public.update_my_profile(text, text[], text[], text, boolean)
from public, anon, authenticated;

grant execute on function
  public.create_booking(text, text, public.class_year, public.meeting_type, public.meeting_format, timestamptz, text, text, text, timestamptz, text)
to anon, authenticated;

grant execute on function public.update_my_profile(text, text[], text[], text, boolean) to authenticated;
