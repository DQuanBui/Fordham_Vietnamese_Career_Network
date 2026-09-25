/*
  Mentor & staff dashboard.
  Sign-in uses Supabase Auth magic links. What each person sees is enforced by
  the database (Row Level Security), not by this file:
    - admins (public.admins) see every request, RSVP, and form submission
    - mentors (public.mentor_private) see only requests addressed to them
  Status changes go through the set_booking_status / assign_booking_mentor RPCs,
  which record every change in booking_status_history.
*/

/* ==========================================================================
   Helpers
   ========================================================================== */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value))
    : "";

function timeAgo(value) {
  const minutes = Math.round((Date.now() - new Date(value)) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days < 30 ? `${days} d ago` : formatDateTime(value);
}

function toast(message, type = "success") {
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.innerHTML = `${icon(type === "error" ? "x" : "check")}<span>${escapeHtml(message)}</span>`;
  $("#toastRegion").appendChild(el);
  setTimeout(() => {
    el.classList.add("is-leaving");
    setTimeout(() => el.remove(), 250);
  }, 3600);
}

function downloadFile(filename, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/* ==========================================================================
   State
   ========================================================================== */
const config = window.FVCN_CONFIG || {};
const client = config.supabaseUrl && config.supabaseAnonKey && window.supabase
  ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey)
  : null;

const STATUSES = ["pending", "confirmed", "completed", "declined", "cancelled"];

const state = {
  me: null,             // { email, is_admin, mentor_id, mentor_name }
  bookings: [],
  mentors: [],
  mentorById: {},
  majorById: {},
  events: [],
  rsvps: [],
  submissions: [],
  filter: "pending",
  query: "",
  tab: "requests"
};

const isAdmin = () => Boolean(state.me?.is_admin);

function show(viewId) {
  ["viewSetup", "viewSignIn", "viewNoAccess", "viewApp"].forEach((id) => {
    $(`#${id}`).hidden = id !== viewId;
  });
}

async function call(promise) {
  const { data, error } = await promise;
  if (error) throw error;
  return data;
}

/* ==========================================================================
   Auth
   ========================================================================== */
function setupAuth() {
  $("#signInForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = $("#signInEmail").value.trim().toLowerCase();
    const button = $("#signInButton");
    button.classList.add("is-loading");
    $("#signInStatus").textContent = "";
    try {
      await call(client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.href.split("#")[0] }
      }));
      $("#signInStatus").textContent = `Check ${email} for your sign-in link. You can close this tab.`;
      $("#signInStatus").className = "dash-status is-success";
    } catch (error) {
      $("#signInStatus").textContent = error.message || "Couldn't send the link. Please try again.";
      $("#signInStatus").className = "dash-status is-error";
    } finally {
      button.classList.remove("is-loading");
    }
  });

  const signOut = async () => {
    await client.auth.signOut();
    window.location.hash = "";
  };
  $("#signOut").addEventListener("click", signOut);
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-sign-out]")) signOut();
  });

  // Don't await Supabase calls inside this callback (supabase-js recommendation); defer instead.
  client.auth.onAuthStateChange((_event, session) => {
    setTimeout(() => route(session), 0);
  });
}

async function route(session) {
  if (!session) {
    state.me = null;
    $("#dashUser").hidden = true;
    show("viewSignIn");
    return;
  }

  try {
    const rows = await call(client.rpc("whoami"));
    state.me = rows[0];
  } catch (error) {
    toast(error.message, "error");
    return;
  }

  $("#dashUser").hidden = false;
  $("#dashUserEmail").textContent = state.me.email;
  $("#dashRole").textContent = isAdmin() ? "Admin" : "Mentor";

  if (!isAdmin() && !state.me.mentor_id) {
    $("#noAccessText").textContent =
      `${state.me.email} isn't linked to a mentor or admin account. Ask an FVCN admin to add this email, or sign in with the email you gave FVCN.`;
    show("viewNoAccess");
    return;
  }

  $$("[data-admin-only]").forEach((el) => { el.hidden = !isAdmin(); });
  $("#dashEyebrow").textContent = isAdmin() ? "Admin dashboard" : "Mentor dashboard";
  $("#dashGreeting").textContent = isAdmin()
    ? "Coffee chat requests"
    : `Hi ${state.me.mentor_name.split(" ")[0]}, here are your requests`;
  $("#dashSubtitle").textContent = isAdmin()
    ? "Every request from students. Assign a mentor to \"match me\" requests, and keep statuses up to date."
    : "Confirm a time that works, add a note (like a Zoom link or meeting spot), and email the student.";
  show("viewApp");
  await loadAll();
}

/* ==========================================================================
   Data
   ========================================================================== */
async function loadAll() {
  try {
    const [bookings, mentors, majors] = await Promise.all([
      call(client.from("bookings").select("*, history:booking_status_history(*)").order("created_at", { ascending: false })),
      call(client.from("mentors").select("id, name, major_id, is_active").order("sort_order")),
      call(client.from("majors").select("id, name, short_name"))
    ]);
    state.bookings = bookings;
    state.mentors = mentors;
    state.mentorById = Object.fromEntries(mentors.map((mentor) => [mentor.id, mentor]));
    state.majorById = Object.fromEntries(majors.map((major) => [major.id, major]));

    if (isAdmin()) {
      const [events, rsvps, submissions] = await Promise.all([
        call(client.from("events").select("id, title, starts_at, location").order("starts_at")),
        call(client.from("event_rsvps").select("*").order("created_at")),
        call(client.from("interest_submissions").select("*").order("created_at", { ascending: false }))
      ]);
      Object.assign(state, { events, rsvps, submissions });
    }
  } catch (error) {
    toast(error.message || "Couldn't load the dashboard.", "error");
  }
  renderAll();
}

function renderAll() {
  renderStats();
  renderFilters();
  renderRequests();
  if (isAdmin()) {
    renderRsvps();
    renderSubmissions();
  }
}

/* ==========================================================================
   Requests
   ========================================================================== */
const needsMentor = (booking) => !booking.mentor_id && booking.status === "pending";

function renderStats() {
  const count = (status) => state.bookings.filter((b) => b.status === status).length;
  const stats = [
    { value: count("pending"), label: "Waiting for a reply" },
    { value: count("confirmed"), label: "Confirmed chats" },
    { value: count("completed"), label: "Completed chats" },
    isAdmin()
      ? { value: state.bookings.filter(needsMentor).length, label: "Need a mentor assigned" }
      : { value: state.bookings.length, label: "Requests all time" }
  ];
  $("#dashStats").innerHTML = stats
    .map((stat) => `<div class="stat"><dt>${stat.label}</dt><dd>${stat.value}</dd></div>`)
    .join("");
}

function renderFilters() {
  const filters = [{ id: "pending", label: "Pending" }];
  if (isAdmin()) filters.push({ id: "unassigned", label: "Needs a mentor" });
  filters.push(
    { id: "confirmed", label: "Confirmed" },
    { id: "completed", label: "Completed" },
    { id: "declined", label: "Declined" },
    { id: "cancelled", label: "Cancelled" },
    { id: "all", label: "All" }
  );
  const countFor = (id) => filteredBy(id, "").length;
  $("#statusFilters").innerHTML = filters
    .map((f) => `<button type="button" class="chip" data-filter="${f.id}" aria-pressed="${f.id === state.filter}">
        ${f.label} <span class="count">${countFor(f.id)}</span></button>`)
    .join("");
}

function filteredBy(filter, query) {
  const q = query.trim().toLowerCase();
  return state.bookings.filter((b) => {
    if (filter === "unassigned" && !needsMentor(b)) return false;
    if (STATUSES.includes(filter) && b.status !== filter) return false;
    if (!q) return true;
    return [b.student_name, b.student_email, b.reference, state.mentorById[b.mentor_id]?.name]
      .join(" ").toLowerCase().includes(q);
  });
}

function mailtoLink(booking) {
  const first = booking.student_name.split(" ")[0];
  const mentor = state.mentorById[booking.mentor_id]?.name || "your FVCN mentor";
  const when = booking.confirmed_time ? formatDateTime(booking.confirmed_time) : "";
  const subject = `Your FVCN ${booking.meeting_type.toLowerCase()} (${booking.reference})`;
  const body = booking.status === "confirmed"
    ? `Hi ${first},\n\nYour ${booking.meeting_type.toLowerCase()} with ${mentor} is confirmed for ${when}.\n\n${booking.staff_note || ""}\n\nSee you then!\nFVCN`
    : `Hi ${first},\n\nThanks for your request on FVCN.\n\n`;
  return `mailto:${encodeURIComponent(booking.student_email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function requestCard(b) {
  const mentor = state.mentorById[b.mentor_id];
  const major = b.major_id ? (state.majorById[b.major_id]?.short_name || state.majorById[b.major_id]?.name) : "Still exploring";
  const times = [b.preferred_time_1, b.preferred_time_2].filter(Boolean);
  const selectedTime = b.confirmed_time || b.preferred_time_1;
  const open = b.status === "pending" || b.status === "confirmed";
  const history = [...(b.history || [])].sort((x, y) => new Date(x.created_at) - new Date(y.created_at));

  const mentorCell = isAdmin() && open
    ? `<select class="dash-select" data-assign="${b.id}" aria-label="Assign mentor">
        <option value="">${mentor ? "" : "Choose a mentor…"}</option>
        ${state.mentors.map((m) => `<option value="${m.id}" ${m.id === b.mentor_id ? "selected" : ""}>${escapeHtml(m.name)}</option>`).join("")}
      </select>`
    : escapeHtml(mentor?.name || "Not assigned");

  const actions = [];
  if (b.status === "pending") {
    actions.push(`<button type="button" class="btn btn-primary btn-sm" data-action="confirmed" data-id="${b.id}">${icon("check")}Confirm selected time</button>`);
    actions.push(`<button type="button" class="btn btn-ghost btn-sm btn-danger" data-action="declined" data-id="${b.id}">Decline</button>`);
  } else if (b.status === "confirmed") {
    actions.push(`<button type="button" class="btn btn-primary btn-sm" data-action="completed" data-id="${b.id}">${icon("check")}Mark as completed</button>`);
    actions.push(`<button type="button" class="btn btn-secondary btn-sm" data-action="confirmed" data-id="${b.id}">Update time or note</button>`);
    actions.push(`<button type="button" class="btn btn-ghost btn-sm btn-danger" data-action="declined" data-id="${b.id}">Decline</button>`);
  } else if (isAdmin()) {
    actions.push(`<button type="button" class="btn btn-secondary btn-sm" data-action="pending" data-id="${b.id}">Reopen</button>`);
  }
  actions.push(`<a class="btn btn-ghost btn-sm" href="${mailtoLink(b)}">${icon("mail")}Email student</a>`);

  return `
    <article class="req-card status-${b.status}" data-booking="${b.id}">
      <header class="req-head">
        <div>
          <h3>${escapeHtml(b.student_name)}</h3>
          <p class="req-sub">
            ${escapeHtml(b.class_year)} · ${escapeHtml(major)} ·
            <a href="mailto:${escapeHtml(b.student_email)}">${escapeHtml(b.student_email)}</a>
          </p>
        </div>
        <div class="req-head-right">
          <span class="pill pill-${b.status}">${b.status}</span>
          <span class="req-ref">${escapeHtml(b.reference)}</span>
        </div>
      </header>

      <div class="req-grid">
        <div><span class="req-label">Topic</span>${escapeHtml(b.meeting_type)} · ${escapeHtml(b.format)}</div>
        <div><span class="req-label">Mentor</span>${mentorCell}</div>
        <div><span class="req-label">Received</span>${timeAgo(b.created_at)}</div>
      </div>

      <div class="req-message">
        <span class="req-label">What they want to talk about</span>
        <p>${escapeHtml(b.message)}</p>
        ${b.link ? `<a class="resource-link" href="${escapeHtml(b.link)}" target="_blank" rel="noopener noreferrer">Resume / LinkedIn ${icon("external")}</a>` : ""}
      </div>

      ${open ? `
        <fieldset class="req-times">
          <legend class="req-label">${b.status === "confirmed" ? "Confirmed time" : "Pick the time you can do"}</legend>
          ${times.map((t, i) => `
            <label class="time-option">
              <input type="radio" name="time-${b.id}" value="${t}" ${new Date(t).getTime() === new Date(selectedTime).getTime() ? "checked" : ""} />
              <span>${icon("calendar")}${i === 0 ? "Preferred" : "Backup"}: ${formatDateTime(t)}</span>
            </label>`).join("")}
        </fieldset>
        <div class="field req-note">
          <label for="note-${b.id}">Note for the student <span class="optional">optional, saved with the status</span></label>
          <textarea id="note-${b.id}" rows="2" placeholder="e.g. Zoom link, or meet at the Keating Hall steps">${escapeHtml(b.staff_note || "")}</textarea>
        </div>` : b.confirmed_time ? `<p class="req-confirmed">${icon("calendar")}Met ${formatDateTime(b.confirmed_time)}</p>` : ""}

      <div class="req-actions">${actions.join("")}</div>

      ${history.length ? `
        <details class="req-history">
          <summary>History (${history.length})</summary>
          <ol>
            ${history.map((h) => `
              <li>
                <strong>${h.from_status && h.from_status !== h.to_status ? `${h.from_status} → ${h.to_status}` : h.to_status}</strong>
                ${h.note ? `· ${escapeHtml(h.note)}` : ""}
                <span>${escapeHtml(h.changed_by)} · ${formatDateTime(h.created_at)}</span>
              </li>`).join("")}
          </ol>
        </details>` : ""}
    </article>`;
}

function renderRequests() {
  const list = filteredBy(state.filter, state.query);
  $("#requestCount").textContent = `${list.length} request${list.length === 1 ? "" : "s"}`;
  $("#requestList").innerHTML = list.length
    ? list.map(requestCard).join("")
    : `<div class="empty-state"><h3>Nothing here</h3><p>${state.filter === "pending" ? "You're all caught up." : "No requests match this filter."}</p></div>`;
}

async function updateStatus(bookingId, status) {
  const card = $(`[data-booking="${bookingId}"]`);
  const note = $(`#note-${bookingId}`)?.value.trim() || null;
  const chosen = $(`input[name="time-${bookingId}"]:checked`, card)?.value || null;

  if (status === "declined" && !confirm("Decline this request? The student will see it as declined.")) return;

  try {
    await call(client.rpc("set_booking_status", {
      p_booking_id: bookingId,
      p_status: status,
      p_note: note,
      p_confirmed_time: status === "confirmed" ? chosen : null
    }));
    toast({ confirmed: "Confirmed. Email the student with the details.", declined: "Request declined.", completed: "Marked as completed. Thank you!", pending: "Request reopened." }[status]);
    await loadAll();
  } catch (error) {
    toast(error.message, "error");
  }
}

async function assignMentor(bookingId, mentorId) {
  if (!mentorId) return;
  try {
    await call(client.rpc("assign_booking_mentor", { p_booking_id: bookingId, p_mentor_id: mentorId }));
    toast(`Assigned to ${state.mentorById[mentorId].name}.`);
    await loadAll();
  } catch (error) {
    toast(error.message, "error");
  }
}

function exportCsv() {
  const rows = filteredBy(state.filter, state.query);
  const columns = [
    ["Reference", (b) => b.reference], ["Received", (b) => b.created_at], ["Status", (b) => b.status],
    ["Student", (b) => b.student_name], ["Email", (b) => b.student_email], ["Year", (b) => b.class_year],
    ["Major", (b) => state.majorById[b.major_id]?.name || "Still exploring"],
    ["Mentor", (b) => state.mentorById[b.mentor_id]?.name || ""], ["Topic", (b) => b.meeting_type], ["Format", (b) => b.format],
    ["Preferred time", (b) => b.preferred_time_1], ["Backup time", (b) => b.preferred_time_2 || ""],
    ["Confirmed time", (b) => b.confirmed_time || ""], ["Message", (b) => b.message], ["Link", (b) => b.link || ""]
  ];
  const cell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [columns.map(([name]) => cell(name)).join(","), ...rows.map((b) => columns.map(([, get]) => cell(get(b))).join(","))].join("\r\n");
  downloadFile(`fvcn-requests-${new Date().toISOString().slice(0, 10)}.csv`, csv, "text/csv");
}

/* ==========================================================================
   Admin: RSVPs + get-involved submissions
   ========================================================================== */
function renderRsvps() {
  if (!state.events.length) {
    $("#rsvpList").innerHTML = `<div class="empty-state"><h3>No events yet</h3><p>Add events in Supabase → Table Editor → events.</p></div>`;
    return;
  }
  $("#rsvpList").innerHTML = state.events
    .map((event) => {
      const people = state.rsvps.filter((r) => r.event_id === event.id);
      return `
        <article class="req-card">
          <header class="req-head">
            <div>
              <h3>${escapeHtml(event.title)}</h3>
              <p class="req-sub">${formatDateTime(event.starts_at)} · ${escapeHtml(event.location)}</p>
            </div>
            <div class="req-head-right">
              <span class="pill pill-confirmed">${people.length} going</span>
              ${people.length ? `<button type="button" class="btn btn-secondary btn-sm" data-copy-emails="${event.id}">${icon("copy")}Copy emails</button>` : ""}
            </div>
          </header>
          ${people.length ? `
            <table class="dash-table">
              <thead><tr><th>Name</th><th>Email</th><th>RSVP'd</th></tr></thead>
              <tbody>${people.map((p) => `<tr><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.email)}</td><td>${timeAgo(p.created_at)}</td></tr>`).join("")}</tbody>
            </table>` : `<p class="req-sub">No RSVPs yet.</p>`}
        </article>`;
    })
    .join("");
}

function renderSubmissions() {
  $("#submissionList").innerHTML = state.submissions.length
    ? state.submissions
      .map((s) => `
        <article class="req-card ${s.is_reviewed ? "is-reviewed" : ""}">
          <header class="req-head">
            <div>
              <h3>${escapeHtml(s.name)}</h3>
              <p class="req-sub"><a href="mailto:${escapeHtml(s.email)}">${escapeHtml(s.email)}</a> · ${timeAgo(s.created_at)}</p>
            </div>
            <div class="req-head-right">
              <span class="tag tag-maroon">${escapeHtml(s.type)}</span>
            </div>
          </header>
          <div class="req-message"><p>${escapeHtml(s.details)}</p></div>
          <div class="req-actions">
            <button type="button" class="btn ${s.is_reviewed ? "btn-ghost" : "btn-secondary"} btn-sm" data-review="${s.id}" data-reviewed="${s.is_reviewed}">
              ${s.is_reviewed ? "Mark as new" : `${icon("check")}Mark as reviewed`}
            </button>
          </div>
        </article>`)
      .join("")
    : `<div class="empty-state"><h3>No submissions yet</h3><p>Mentor applications, resource ideas, and event ideas will show up here.</p></div>`;
}

/* ==========================================================================
   Events
   ========================================================================== */
function selectTab(tab) {
  state.tab = tab;
  $$("#dashTabs [data-tab]").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.tab === tab)));
  $$("[data-panel]").forEach((panel) => { panel.hidden = panel.dataset.panel !== tab; });
}

function setupActions() {
  document.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-filter], [data-action], [data-tab], [data-copy-emails], [data-review]");
    if (!target) return;
    const data = target.dataset;

    if (data.filter) {
      state.filter = data.filter;
      renderFilters();
      renderRequests();
    } else if (data.action) {
      target.classList.add("is-loading");
      await updateStatus(data.id, data.action);
      target.classList.remove("is-loading");
    } else if (data.tab) {
      selectTab(data.tab);
    } else if (data.copyEmails) {
      const emails = state.rsvps.filter((r) => r.event_id === data.copyEmails).map((r) => r.email).join(", ");
      try {
        await navigator.clipboard.writeText(emails);
        toast("Emails copied.");
      } catch {
        prompt("Copy these emails:", emails);
      }
    } else if (data.review) {
      try {
        await call(client.from("interest_submissions").update({ is_reviewed: data.reviewed !== "true" }).eq("id", data.review));
        await loadAll();
      } catch (error) {
        toast(error.message, "error");
      }
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-assign]")) assignMentor(event.target.dataset.assign, event.target.value);
  });

  let timer;
  $("#requestSearch").addEventListener("input", (event) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      state.query = event.target.value;
      renderRequests();
    }, 150);
  });

  $("#refreshButton").addEventListener("click", async () => {
    await loadAll();
    toast("Up to date.");
  });
  $("#exportButton").addEventListener("click", exportCsv);
}

/* ==========================================================================
   Init
   ========================================================================== */
if (!client) {
  show("viewSetup");
} else {
  setupAuth();
  setupActions();
}
