// Supabase Edge Function: email notifications for coffee chat requests.
//
// Triggered by a Database Webhook on public.bookings (INSERT and UPDATE):
//   - new request        → email the mentor (or all admins for "match me"), plus a receipt to the student
//   - confirmed/declined → email the student
//
// Environment:
//   RESEND_API_KEY   Resend API key (emails are skipped when unset)
//   NOTIFY_FROM      sender, e.g. "FVCN <hello@example.com>"
//   SITE_URL         public URL of the site, used for links in emails
//   WEBHOOK_SECRET   shared secret expected in the x-webhook-secret header
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  provided by the Supabase runtime

import { createClient } from "npm:@supabase/supabase-js@2";

type Booking = {
  id: string;
  reference: string;
  student_name: string;
  student_email: string;
  class_year: string;
  mentor_id: string | null;
  meeting_type: string;
  format: string;
  preferred_time_1: string;
  preferred_time_2: string | null;
  message: string;
  status: string;
  confirmed_time: string | null;
  staff_note: string | null;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = Deno.env.get("NOTIFY_FROM") ?? "FVCN <onboarding@resend.dev>";
const SITE_URL = (Deno.env.get("SITE_URL") ?? "").replace(/\/$/, "");
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") ?? "";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const formatTime = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
    }).format(new Date(iso)) + " ET"
    : "";

function layout(title: string, body: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1c1917">
    <div style="background:#861f41;color:#fff;padding:18px 24px;border-radius:12px 12px 0 0;font-weight:700">FVCN · Fordham Vietnamese Career Network</div>
    <div style="border:1px solid #e9e1d7;border-top:0;padding:24px;border-radius:0 0 12px 12px">
      <h2 style="margin:0 0 12px;color:#3b0c1e">${escapeHtml(title)}</h2>${body}
    </div></div>`;
}

async function send(to: string | string[], subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log("RESEND_API_KEY not set; skipping email:", subject);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html })
  });
  if (!res.ok) console.error("Resend error", res.status, await res.text());
}

async function onNewRequest(b: Booking) {
  let staff: string[] = [];
  let mentorName = "a mentor";
  if (b.mentor_id) {
    const [{ data: contact }, { data: mentor }] = await Promise.all([
      db.from("mentor_private").select("email").eq("mentor_id", b.mentor_id).maybeSingle(),
      db.from("mentors").select("name").eq("id", b.mentor_id).maybeSingle()
    ]);
    if (contact?.email) staff = [contact.email];
    if (mentor?.name) mentorName = mentor.name;
  }
  if (!staff.length) {
    const { data: admins } = await db.from("admins").select("email");
    staff = (admins ?? []).map((a) => a.email);
  }

  const details = `<p><strong>${escapeHtml(b.student_name)}</strong> (${escapeHtml(b.class_year)}) · ${escapeHtml(b.meeting_type)} · ${escapeHtml(b.format)}</p>
    <p>Preferred: ${formatTime(b.preferred_time_1)}${b.preferred_time_2 ? `<br>Backup: ${formatTime(b.preferred_time_2)}` : ""}</p>
    <blockquote style="margin:0;padding:12px 16px;background:#fbf8f4;border-radius:8px">${escapeHtml(b.message)}</blockquote>`;

  if (staff.length) {
    await send(staff, `New coffee chat request from ${b.student_name} (${b.reference})`,
      layout("New coffee chat request", `${details}
        <p style="margin-top:20px"><a href="${SITE_URL}/dashboard.html" style="background:#861f41;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none">Open the dashboard</a></p>`));
  }

  await send(b.student_email, `We got your request (${b.reference})`,
    layout(`Thanks, ${b.student_name.split(" ")[0]}!`, `<p>Your request to talk with ${escapeHtml(b.mentor_id ? mentorName : "an FVCN mentor")} was received. You'll get another email once a time is confirmed.</p>${details}
      <p style="color:#6b645e;font-size:13px">Reference: ${escapeHtml(b.reference)}. You can check or cancel it on <a href="${SITE_URL}/#booking">the FVCN site</a> from the same browser.</p>`));
}

async function onStatusChange(b: Booking) {
  const first = b.student_name.split(" ")[0];
  if (b.status === "confirmed") {
    await send(b.student_email, `Confirmed: your ${b.meeting_type.toLowerCase()} on ${formatTime(b.confirmed_time)}`,
      layout(`You're confirmed, ${first}!`, `<p>Your ${escapeHtml(b.meeting_type.toLowerCase())} is set for <strong>${formatTime(b.confirmed_time)}</strong> (${escapeHtml(b.format)}).</p>
        ${b.staff_note ? `<p><strong>Note from your mentor:</strong><br>${escapeHtml(b.staff_note)}</p>` : ""}
        <p>First coffee chat? Read the <a href="${SITE_URL}/#booking">Coffee Chat Playbook</a> before you go.</p>`));
  } else if (b.status === "declined") {
    await send(b.student_email, `Update on your FVCN request (${b.reference})`,
      layout(`Hi ${first},`, `<p>Your mentor can't take this request right now. Please <a href="${SITE_URL}/#mentors">pick another mentor</a> or choose "No preference" and we'll match you.</p>
        ${b.staff_note ? `<p>${escapeHtml(b.staff_note)}</p>` : ""}`));
  }
}

Deno.serve(async (req) => {
  if (!WEBHOOK_SECRET || req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }
  const payload = await req.json();
  const record = payload.record as Booking;
  const old = payload.old_record as Booking | null;

  try {
    if (payload.type === "INSERT") await onNewRequest(record);
    else if (payload.type === "UPDATE" && record.status !== old?.status) await onStatusChange(record);
  } catch (error) {
    console.error(error);
    return Response.json({ ok: false }, { status: 500 });
  }
  return Response.json({ ok: true });
});
