"""
Database tests for FVCN: runs the migration + seed on a throwaway local Postgres database
with Supabase-like roles (anon / authenticated), then checks Row Level Security and every RPC.

    pip install "psycopg[binary]"
    set PG_URL=host=localhost port=5432 user=postgres      (any local Postgres 15+ superuser)
    python tests/test_database.py

It creates and drops a database called fvcn_test. Never point it at your Supabase project.
"""
import json
import os
import pathlib
import sys

import psycopg

ROOT = str(pathlib.Path(__file__).resolve().parent.parent / "supabase") + "/"
PG_URL = os.environ.get("PG_URL", "host=localhost port=5432 user=postgres")
admin = psycopg.connect(PG_URL + " dbname=postgres", autocommit=True)
admin.execute("drop database if exists fvcn_test")
admin.execute("create database fvcn_test")
db = psycopg.connect(PG_URL + " dbname=fvcn_test", autocommit=True)

# --- Minimal stand-in for what Supabase provides ------------------------------
for role in ["anon", "authenticated", "service_role"]:
    exists = admin.execute("select 1 from pg_roles where rolname = %s", [role]).fetchone()
    if not exists:
        admin.execute(f"create role {role} nologin" + (" bypassrls" if role == "service_role" else ""))
db.execute("""
create schema auth;
create function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.jwt() to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
""")

db.execute(open(ROOT + "migrations/20260925000000_init.sql", encoding="utf-8").read())
db.execute(open(ROOT + "seed.sql", encoding="utf-8").read())
db.execute("insert into admins (email) values ('admin@fordham.edu')")
db.execute("insert into mentor_private (mentor_id, email) values ('quan-bui', 'Quan.Mentor@fordham.edu')")

results = []


def check(name, cond, extra=""):
    results.append(("PASS" if cond else "FAIL") + f"  {name} {extra}")


def as_user(email=None):
    """Switch the session to anon (no email) or an authenticated user."""
    db.execute("reset role")
    if email:
        db.execute("select set_config('request.jwt.claims', %s, false)", [json.dumps({"role": "authenticated", "email": email})])
        db.execute("set role authenticated")
    else:
        db.execute("select set_config('request.jwt.claims', %s, false)", [json.dumps({"role": "anon"})])
        db.execute("set role anon")


def err(sql, params=None):
    try:
        db.execute(sql, params or [])
        return None
    except psycopg.Error as e:
        return e


BOOK = """select * from create_booking(p_name => %s, p_email => %s, p_class_year => 'Freshman',
  p_meeting_type => 'Coffee chat', p_format => 'Virtual', p_time_1 => now() + interval '2 days',
  p_message => 'I want to learn about tech consulting recruiting.', p_major_id => %s, p_mentor_id => %s)"""

# --- Public content ---------------------------------------------------------------
as_user()
counts = {t: db.execute(f"select count(*) from {t}").fetchone()[0] for t in ["majors", "companies", "mentors", "mentor_companies", "resources", "events"]}
check("anon reads content", counts == {"majors": 5, "companies": 16, "mentors": 13, "mentor_companies": 13, "resources": 19, "events": 5}, counts)
thomas = db.execute("select array_agg(company_id order by sort_order) from mentor_companies where mentor_id = 'thomas-vu-hong'").fetchone()[0]
check("Thomas linked to Deloitte and EY", thomas == ["deloitte", "ey"], thomas)
check("soccer event 6-9pm NY", db.execute("select to_char(starts_at at time zone 'America/New_York','HH24:MI') || '-' || to_char(ends_at at time zone 'America/New_York','HH24:MI') from events where id='e-soccer'").fetchone()[0] == "18:00-21:00")
check("anon cannot read mentor emails", db.execute("select count(*) from mentor_private").fetchone()[0] == 0)
check("anon cannot read admins", db.execute("select count(*) from admins").fetchone()[0] == 0)

# --- Student booking flow ----------------------------------------------------------
row = db.execute(BOOK, ["Test Student", "Test@Fordham.edu", "info-systems", "quan-bui"]).fetchone()
token = row[2]
check("create_booking returns reference + token", row[1].startswith("FV-") and token is not None and row[3] == "pending", row[1])
row2 = db.execute(BOOK, ["Another Student", "another@fordham.edu", None, None]).fetchone()
check("anon cannot read bookings table", db.execute("select count(*) from bookings").fetchone()[0] == 0)
e = err("insert into bookings (student_name, student_email, class_year, meeting_type, preferred_time_1, message) values ('X Y','x@fordham.edu','Freshman','Coffee chat', now()+interval '1 day','hello there friend')")
check("anon cannot insert directly", e is not None, type(e).__name__)
e = err(BOOK, ["Bad Email", "bad@gmail.com", None, None])
check("non-fordham email rejected", e is not None and e.diag.message_hint == "email", e and e.diag.message_primary)
e = err(BOOK.replace("now() + interval '2 days'", "now() - interval '1 day'"), ["Past Time", "p@fordham.edu", None, None])
check("past time rejected", e is not None and e.diag.message_hint == "time1")
e = err(BOOK, ["Ghost Mentor", "g@fordham.edu", None, "nobody"])
check("unknown mentor rejected", e is not None and e.diag.message_hint == "mentorId")
for _ in range(4):
    db.execute(BOOK, ["Spam Student", "spam@fordham.edu", None, None])
db.execute(BOOK, ["Spam Student", "spam@fordham.edu", None, None])
e = err(BOOK, ["Spam Student", "spam@fordham.edu", None, None])
check("rate limit after 5 per day", e is not None and e.diag.message_hint == "rate_limit")

mine = db.execute("select * from get_my_bookings(%s)", [[token]]).fetchall()
check("get_my_bookings by token", len(mine) == 1 and mine[0][8] == "Quan Bui", mine[0][8] if mine else None)
check("get_my_bookings ignores unknown tokens", db.execute("select count(*) from get_my_bookings(array[gen_random_uuid()])").fetchone()[0] == 0)
e = err("select whoami()")
check("anon cannot call staff functions", e is not None and "permission denied" in str(e))

# --- RSVPs + interest ----------------------------------------------------------------
t1 = db.execute("select rsvp_event('e-soccer', 'Test Student', 'test@fordham.edu')").fetchone()[0]
t2 = db.execute("select rsvp_event('e-soccer', 'Test S.', 'TEST@fordham.edu')").fetchone()[0]
check("duplicate RSVP reuses the same token", t1 == t2)
db.execute("select rsvp_event('e-soccer', 'Friend', 'friend@gmail.com')")
cnt = dict(db.execute("select * from get_event_rsvp_counts()").fetchall())
check("rsvp counts", cnt.get("e-soccer") == 2, cnt)
db.execute("select cancel_rsvp(%s)", [t1])
check("cancel rsvp", dict(db.execute("select * from get_event_rsvp_counts()").fetchall()).get("e-soccer") == 1)
check("anon cannot read rsvps", db.execute("select count(*) from event_rsvps").fetchone()[0] == 0)
db.execute("select submit_interest('Become a mentor', 'Future Mentor', 'fm@fordham.edu', 'Junior in finance, interned at a bank.')")

# --- Mentor dashboard ------------------------------------------------------------------
as_user("quan.mentor@fordham.edu")
who = db.execute("select * from whoami()").fetchone()
check("mentor whoami", who[1] is False and who[2] == "quan-bui", who)
seen = db.execute("select count(*) from bookings").fetchone()[0]
check("mentor sees only their requests", seen == 1, seen)
bid = db.execute("select id from bookings").fetchone()[0]
e = err("select set_booking_status(%s, 'confirmed')", [bid])
check("confirm needs a time", e is not None and e.diag.message_hint == "confirmed_time")
db.execute("select set_booking_status(%s, 'confirmed', 'See you at Keating!', now() + interval '2 days')", [bid])
other = row2[0]
e = err("select set_booking_status(%s, 'declined')", [other])
check("mentor cannot touch others' requests", e is not None and e.sqlstate == "42501")
check("mentor cannot read submissions", db.execute("select count(*) from interest_submissions").fetchone()[0] == 0)

# --- Student sees the status change and cancels -------------------------------------------
as_user()
status = db.execute("select status, confirmed_time is not null from get_my_bookings(%s)", [[token]]).fetchone()
check("student sees confirmed status", status == ("confirmed", True), status)
db.execute("select cancel_booking(%s)", [token])
e = err("select cancel_booking(%s)", [token])
check("cannot cancel twice", e is not None and e.diag.message_hint == "invalid_status")

# --- Admin dashboard ----------------------------------------------------------------------
as_user("ADMIN@fordham.edu")
who = db.execute("select * from whoami()").fetchone()
check("admin whoami (case-insensitive)", who[1] is True)
total = db.execute("select count(*) from bookings").fetchone()[0]
check("admin sees all requests", total == 7, total)
db.execute("select assign_booking_mentor(%s, 'nick-trinh')", [other])
check("admin assigns mentor", db.execute("select mentor_id from bookings where id = %s", [other]).fetchone()[0] == "nick-trinh")
hist = db.execute("select from_status, to_status, changed_by, note from booking_status_history where booking_id = %s order by id", [bid]).fetchall()
check("status history recorded", [h[1] for h in hist] == ["pending", "confirmed", "cancelled"] and hist[1][2] == "quan.mentor@fordham.edu" and hist[2][2] == "student" and hist[1][3] == "See you at Keating!", hist)
check("admin reads rsvps + submissions", db.execute("select (select count(*) from event_rsvps), (select count(*) from interest_submissions)").fetchone() == (1, 1))
db.execute("update interest_submissions set is_reviewed = true")
check("admin marks submission reviewed", db.execute("select bool_and(is_reviewed) from interest_submissions").fetchone()[0] is True)
embedded = db.execute("select b.reference, m.name from bookings b left join mentors m on m.id = b.mentor_id where b.id = %s", [other]).fetchone()
check("assigned mentor visible", embedded[1] == "Nick Trinh")

# --- Random signed-in user ---------------------------------------------------------------------
as_user("random@gmail.com")
check("stranger sees no requests", db.execute("select count(*) from bookings").fetchone()[0] == 0)
e = err("select set_booking_status(%s, 'declined')", [other])
check("stranger cannot change status", e is not None and e.sqlstate == "42501")
e = err("update mentors set name = 'Hacked' where id = 'quan-bui'")
check("stranger cannot edit content", e is None and db.execute("select name from mentors where id='quan-bui'").fetchone()[0] == "Quan Bui")

# Seed is re-runnable.
db.execute("reset role")
db.execute(open(ROOT + "seed.sql", encoding="utf-8").read())
check("seed re-runs cleanly", db.execute("select count(*) from mentor_companies").fetchone()[0] == 13)

print("\n".join(results))
print(f"\n{sum(r.startswith('PASS') for r in results)}/{len(results)} passed")
