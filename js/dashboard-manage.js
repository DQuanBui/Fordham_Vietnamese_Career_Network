/*
  Dashboard management tools (loaded after dashboard.js and uses its state):
    - "My profile" for mentors: edit bio, topics, interests, LinkedIn, and pause new requests
    - "Mentors" for admins: add or edit mentors, set dashboard emails, pause or hide mentors
    - "Events" for admins: add, edit, publish, and delete events
  Admin writes go straight to the tables and are allowed by the "Admins edit ..." RLS policies.
  Mentor edits go through the update_my_profile RPC, which only touches the caller's own row.
*/

const slugify = (text) =>
  text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const splitList = (value) => value.split(",").map((item) => item.trim()).filter(Boolean);
const joinList = (list) => (list || []).join(", ");

// Event times are entered in New York time and stored as timestamps.
function newYorkIso(date, time) {
  const probe = new Date(`${date}T12:00:00Z`);
  const name = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", timeZoneName: "shortOffset" })
    .formatToParts(probe).find((part) => part.type === "timeZoneName")?.value || "GMT-5";
  const [, sign = "-", hours = "5", minutes = "00"] = name.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/) || [];
  return `${date}T${time}:00${sign}${hours.padStart(2, "0")}:${minutes}`;
}

function newYorkParts(iso) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date(iso)).map((part) => [part.type, part.value])
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

function renderManage() {
  if (state.me?.mentor_id) renderMyProfile();
  if (isAdmin()) {
    renderMentorAdmin();
    renderEventAdmin();
  }
}

/* ==========================================================================
   My profile (mentors)
   ========================================================================== */
function renderMyProfile() {
  const m = state.mentorById[state.me.mentor_id];
  if (!m) return;
  $("#profilePanel").innerHTML = `
    <form class="dash-card manage-form" id="profileForm" novalidate>
      <div class="manage-head">
        <div>
          <h2>Your mentor profile</h2>
          <p>This is what students see on FVCN. <a class="text-link" href="index.html#mentors" target="_blank" rel="noopener">View it on the site</a></p>
        </div>
        <label class="switch">
          <input type="checkbox" name="accepting" ${m.accepting_requests !== false ? "checked" : ""} />
          <span class="switch-track" aria-hidden="true"></span>
          <span>Taking new requests</span>
        </label>
      </div>
      <p class="manage-note">Busy week? Turn off "Taking new requests". Your profile stays visible, but students can't send you new requests until you turn it back on.</p>

      <div class="field">
        <label for="p-bio">Bio <span class="optional">20–400 characters</span></label>
        <textarea id="p-bio" name="bio" rows="4" maxlength="400">${escapeHtml(m.bio)}</textarea>
      </div>
      <div class="form-row">
        <div class="field">
          <label for="p-helps">Can help with <span class="optional">1–5 topics, separated by commas</span></label>
          <input id="p-helps" name="helps" value="${escapeHtml(joinList(m.helps_with))}" />
        </div>
        <div class="field">
          <label for="p-interests">Outside of work <span class="optional">optional, comma separated</span></label>
          <input id="p-interests" name="interests" value="${escapeHtml(joinList(m.interests))}" />
        </div>
      </div>
      <div class="field">
        <label for="p-linkedin">LinkedIn profile</label>
        <input id="p-linkedin" name="linkedin" type="url" value="${escapeHtml(m.linkedin_url || "")}" placeholder="https://www.linkedin.com/in/your-name/" />
      </div>
      <p class="manage-note">To change your role, company, or photo, ask an FVCN admin.</p>
      <div><button type="submit" class="btn btn-primary">Save profile</button></div>
    </form>`;
}

async function saveMyProfile(form) {
  const button = $('button[type="submit"]', form);
  button.classList.add("is-loading");
  try {
    await call(client.rpc("update_my_profile", {
      p_bio: form.elements.bio.value,
      p_helps_with: splitList(form.elements.helps.value),
      p_interests: splitList(form.elements.interests.value),
      p_linkedin_url: form.elements.linkedin.value.trim(),
      p_accepting_requests: form.elements.accepting.checked
    }));
    toast("Profile saved. It's live on the site now.");
    await loadAll();
  } catch (error) {
    toast(error.message, "error");
  } finally {
    button.classList.remove("is-loading");
  }
}

/* ==========================================================================
   Mentors (admins)
   ========================================================================== */
function companyNamesFor(mentor) {
  const ids = (mentor.mentor_companies || []).sort((a, b) => a.sort_order - b.sort_order).map((c) => c.company_id);
  const names = ids.map((id) => state.companyById[id]?.name || id);
  return names.length ? names.join(" & ") : mentor.company_label || "—";
}

function renderMentorAdmin() {
  const contacts = Object.fromEntries((state.mentorContacts || []).map((c) => [c.mentor_id, c.email]));
  const taking = state.mentors.filter((m) => m.is_active && m.accepting_requests !== false).length;

  $("#mentorAdminList").innerHTML = `
    <div class="manage-toolbar">
      <p class="result-count">${state.mentors.length} mentors · ${taking} taking requests</p>
      <button type="button" class="btn btn-primary btn-sm" data-mentor-form="new">+ Add mentor</button>
    </div>
    <div id="mentorFormSlot"></div>
    <div class="table-scroll">
      <table class="dash-table manage-table">
        <thead><tr><th>Mentor</th><th>Role</th><th>Dashboard email</th><th>Taking requests</th><th>Shown on site</th><th></th></tr></thead>
        <tbody>
          ${state.mentors.map((m) => `
            <tr>
              <td><strong>${escapeHtml(m.name)}</strong><br /><span class="req-sub">${escapeHtml(state.majorById[m.major_id]?.short_name || state.majorById[m.major_id]?.name || m.major_id)}</span></td>
              <td>${escapeHtml(m.role)}<br /><span class="req-sub">${escapeHtml(companyNamesFor(m))}</span></td>
              <td>${contacts[m.id] ? escapeHtml(contacts[m.id]) : `<span class="req-sub">Not set</span>`}</td>
              <td><label class="switch switch-sm"><input type="checkbox" data-mentor-toggle="${m.id}" data-field="accepting_requests" ${m.accepting_requests !== false ? "checked" : ""} /><span class="switch-track" aria-hidden="true"></span><span class="sr-only">Taking requests</span></label></td>
              <td><label class="switch switch-sm"><input type="checkbox" data-mentor-toggle="${m.id}" data-field="is_active" ${m.is_active ? "checked" : ""} /><span class="switch-track" aria-hidden="true"></span><span class="sr-only">Shown on site</span></label></td>
              <td><button type="button" class="btn btn-ghost btn-sm" data-mentor-form="${m.id}">Edit</button></td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

function mentorFormHtml(m = {}, prefill = {}) {
  const ids = (m.mentor_companies || []).sort((a, b) => a.sort_order - b.sort_order).map((c) => c.company_id);
  const email = (state.mentorContacts || []).find((c) => c.mentor_id === m.id)?.email || prefill.email || "";
  const companyOptions = (selected) => `<option value="">None</option>` +
    state.companies.map((c) => `<option value="${c.id}" ${c.id === selected ? "selected" : ""}>${escapeHtml(c.name)}</option>`).join("");
  return `
    <form class="dash-card manage-form" id="mentorForm" data-id="${m.id || ""}" novalidate>
      <div class="manage-head">
        <h2>${m.id ? `Edit ${escapeHtml(m.name)}` : "Add a mentor"}</h2>
        <button type="button" class="icon-btn" data-close-form aria-label="Close">${icon("x")}</button>
      </div>
      <div class="form-row">
        <div class="field"><label for="m-name">Full name</label><input id="m-name" name="name" required value="${escapeHtml(m.name || prefill.name || "")}" /></div>
        <div class="field"><label for="m-major">Major</label>
          <select id="m-major" name="major">${Object.values(state.majorById).map((mj) => `<option value="${mj.id}" ${mj.id === m.major_id ? "selected" : ""}>${escapeHtml(mj.name)}</option>`).join("")}</select></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="m-role">Role</label><input id="m-role" name="role" required value="${escapeHtml(m.role || "")}" placeholder="e.g. Software Engineer Intern" /></div>
        <div class="field"><label for="m-status">Status</label>
          <select id="m-status" name="status">${["current", "incoming", "former"].map((s) => `<option value="${s}" ${s === (m.status || "current") ? "selected" : ""}>${s[0].toUpperCase() + s.slice(1)}</option>`).join("")}</select></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="m-c1">Company</label><select id="m-c1" name="company1">${companyOptions(ids[0])}</select></div>
        <div class="field"><label for="m-c2">Second company <span class="optional">optional</span></label><select id="m-c2" name="company2">${companyOptions(ids[1])}</select></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="m-label">Company name if not listed <span class="optional">e.g. "Startup"</span></label><input id="m-label" name="label" value="${escapeHtml(m.company_label || "")}" /></div>
        <div class="field"><label for="m-linkedin">LinkedIn</label><input id="m-linkedin" name="linkedin" type="url" value="${escapeHtml(m.linkedin_url || "")}" /></div>
      </div>
      <div class="field"><label for="m-bio">Bio</label><textarea id="m-bio" name="bio" rows="3" maxlength="400">${escapeHtml(m.bio || "")}</textarea></div>
      <div class="form-row">
        <div class="field"><label for="m-helps">Can help with <span class="optional">comma separated</span></label><input id="m-helps" name="helps" value="${escapeHtml(joinList(m.helps_with))}" /></div>
        <div class="field"><label for="m-interests">Interests <span class="optional">comma separated</span></label><input id="m-interests" name="interests" value="${escapeHtml(joinList(m.interests))}" /></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="m-email">Dashboard sign-in email <span class="optional">private</span></label><input id="m-email" name="email" type="email" value="${escapeHtml(email)}" /></div>
        <label class="checkbox-line manage-check"><input type="checkbox" name="featured" ${m.featured ? "checked" : ""} /><span>Feature on the home page</span></label>
      </div>
      <div class="req-actions"><button type="submit" class="btn btn-primary">${m.id ? "Save changes" : "Add mentor"}</button></div>
    </form>`;
}

function openMentorForm(id, prefill = {}) {
  selectTab("mentors");
  $("#mentorFormSlot").innerHTML = mentorFormHtml(id === "new" ? {} : state.mentorById[id], prefill);
  $("#mentorForm").scrollIntoView({ behavior: "smooth", block: "start" });
  $("#m-name").focus({ preventScroll: true });
}

async function saveMentor(form) {
  const f = form.elements;
  if (!f.name.value.trim() || !f.role.value.trim()) {
    toast("Name and role are required.", "error");
    return;
  }
  let id = form.dataset.id;
  const isNew = !id;
  if (isNew) {
    const base = slugify(f.name.value) || "mentor";
    id = base;
    for (let n = 2; state.mentorById[id]; n++) id = `${base}-${n}`;
  }
  const row = {
    name: f.name.value.trim(),
    major_id: f.major.value,
    status: f.status.value,
    role: f.role.value.trim(),
    company_label: f.label.value.trim() || null,
    linkedin_url: f.linkedin.value.trim() || null,
    bio: f.bio.value.trim(),
    helps_with: splitList(f.helps.value),
    interests: splitList(f.interests.value),
    featured: f.featured.checked
  };
  const companies = [...new Set([f.company1.value, f.company2.value].filter(Boolean))];
  const email = f.email.value.trim().toLowerCase();

  const button = $('button[type="submit"]', form);
  button.classList.add("is-loading");
  try {
    if (isNew) {
      const nextOrder = Math.max(0, ...state.mentors.map((m) => m.sort_order || 0)) + 1;
      await call(client.from("mentors").insert({ id, ...row, sort_order: nextOrder }));
    } else {
      await call(client.from("mentors").update(row).eq("id", id));
      await call(client.from("mentor_companies").delete().eq("mentor_id", id));
    }
    if (companies.length) {
      await call(client.from("mentor_companies").insert(companies.map((company_id, i) => ({ mentor_id: id, company_id, sort_order: i }))));
    }
    if (email) await call(client.from("mentor_private").upsert({ mentor_id: id, email }));
    else if (!isNew) await call(client.from("mentor_private").delete().eq("mentor_id", id));

    toast(isNew ? `${row.name} was added and is live on the site.` : "Mentor saved.");
    await loadAll();
  } catch (error) {
    toast(error.message, "error");
  } finally {
    button.classList.remove("is-loading");
  }
}

/* ==========================================================================
   Events (admins)
   ========================================================================== */
function renderEventAdmin() {
  const now = new Date();
  const going = (id) => state.rsvps.filter((r) => r.event_id === id).length;
  const rows = [...state.events].sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at));

  $("#eventAdminList").innerHTML = `
    <div class="manage-toolbar">
      <p class="result-count">${rows.filter((e) => new Date(e.ends_at) >= now).length} upcoming · ${rows.length} total</p>
      <button type="button" class="btn btn-primary btn-sm" data-event-form="new">+ Add event</button>
    </div>
    <div id="eventFormSlot"></div>
    <div class="table-scroll">
      <table class="dash-table manage-table">
        <thead><tr><th>Event</th><th>When (New York)</th><th>RSVPs</th><th>Published</th><th></th></tr></thead>
        <tbody>
          ${rows.map((e) => `
            <tr class="${new Date(e.ends_at) < now ? "is-past" : ""}">
              <td><strong>${escapeHtml(e.title)}</strong><br /><span class="req-sub">${escapeHtml(e.category)} · ${escapeHtml(e.location)}</span></td>
              <td>${escapeHtml(formatDateTime(e.starts_at))}</td>
              <td>${going(e.id)}</td>
              <td><label class="switch switch-sm"><input type="checkbox" data-event-toggle="${e.id}" ${e.is_published !== false ? "checked" : ""} /><span class="switch-track" aria-hidden="true"></span><span class="sr-only">Published</span></label></td>
              <td class="nowrap">
                <button type="button" class="btn btn-ghost btn-sm" data-event-form="${e.id}">Edit</button>
                <button type="button" class="btn btn-ghost btn-sm btn-danger" data-event-delete="${e.id}">Delete</button>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

function openEventForm(id) {
  const e = id === "new" ? {} : state.events.find((item) => item.id === id);
  const start = e.starts_at ? newYorkParts(e.starts_at) : { date: "", time: "18:00" };
  const end = e.ends_at ? newYorkParts(e.ends_at) : { time: "19:30" };
  $("#eventFormSlot").innerHTML = `
    <form class="dash-card manage-form" id="eventForm" data-id="${e.id || ""}">
      <div class="manage-head">
        <h2>${e.id ? `Edit ${escapeHtml(e.title)}` : "Add an event"}</h2>
        <button type="button" class="icon-btn" data-close-form aria-label="Close">${icon("x")}</button>
      </div>
      <div class="form-row">
        <div class="field"><label for="e-title">Title</label><input id="e-title" name="title" required value="${escapeHtml(e.title || "")}" /></div>
        <div class="field"><label for="e-category">Category</label>
          <select id="e-category" name="category">${["Career", "Community", "Alumni"].map((c) => `<option ${c === e.category ? "selected" : ""}>${c}</option>`).join("")}</select></div>
      </div>
      <div class="form-row form-row-3">
        <div class="field"><label for="e-date">Date</label><input id="e-date" name="date" type="date" required value="${start.date}" /></div>
        <div class="field"><label for="e-start">Starts (New York)</label><input id="e-start" name="start" type="time" required value="${start.time}" /></div>
        <div class="field"><label for="e-end">Ends</label><input id="e-end" name="end" type="time" required value="${end.time}" /></div>
      </div>
      <div class="field"><label for="e-location">Location</label><input id="e-location" name="location" required value="${escapeHtml(e.location || "")}" placeholder="e.g. Lincoln Center campus · room shared after RSVP" /></div>
      <div class="field"><label for="e-description">Description</label><textarea id="e-description" name="description" rows="3" required>${escapeHtml(e.description || "")}</textarea></div>
      <label class="checkbox-line"><input type="checkbox" name="published" ${e.is_published !== false ? "checked" : ""} /><span>Published on the site</span></label>
      <div class="req-actions"><button type="submit" class="btn btn-primary">${e.id ? "Save event" : "Add event"}</button></div>
    </form>`;
  $("#eventForm").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function saveEvent(form) {
  if (!form.reportValidity()) return;
  const f = form.elements;
  if (f.end.value <= f.start.value) {
    toast("The event must end after it starts.", "error");
    return;
  }
  const row = {
    title: f.title.value.trim(),
    category: f.category.value,
    starts_at: newYorkIso(f.date.value, f.start.value),
    ends_at: newYorkIso(f.date.value, f.end.value),
    location: f.location.value.trim(),
    description: f.description.value.trim(),
    is_published: f.published.checked
  };
  const button = $('button[type="submit"]', form);
  button.classList.add("is-loading");
  try {
    if (form.dataset.id) {
      await call(client.from("events").update(row).eq("id", form.dataset.id));
    } else {
      let id = `e-${slugify(row.title)}-${f.date.value}`;
      for (let n = 2; state.events.some((e) => e.id === id); n++) id = `e-${slugify(row.title)}-${f.date.value}-${n}`;
      await call(client.from("events").insert({ id, ...row }));
    }
    toast("Event saved. It's live on the site now.");
    await loadAll();
  } catch (error) {
    toast(error.message, "error");
  } finally {
    button.classList.remove("is-loading");
  }
}

/* ==========================================================================
   Wiring
   ========================================================================== */
document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!["profileForm", "mentorForm", "eventForm"].includes(form.id)) return;
  event.preventDefault();
  if (form.id === "profileForm") saveMyProfile(form);
  if (form.id === "mentorForm") saveMentor(form);
  if (form.id === "eventForm") saveEvent(form);
});

document.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-mentor-form], [data-event-form], [data-event-delete], [data-close-form], [data-add-mentor-from]");
  if (!target) return;
  const data = target.dataset;

  if (data.mentorForm) {
    openMentorForm(data.mentorForm);
  } else if (data.eventForm) {
    openEventForm(data.eventForm);
  } else if ("closeForm" in data) {
    target.closest("form").remove();
  } else if (data.addMentorFrom) {
    const submission = state.submissions.find((s) => s.id === data.addMentorFrom);
    openMentorForm("new", { name: submission?.name, email: submission?.email });
  } else if (data.eventDelete) {
    const e = state.events.find((item) => item.id === data.eventDelete);
    if (!confirm(`Delete "${e.title}"? Its RSVPs will be deleted too.`)) return;
    try {
      await call(client.from("events").delete().eq("id", e.id));
      toast("Event deleted.");
      await loadAll();
    } catch (error) {
      toast(error.message, "error");
    }
  }
});

document.addEventListener("change", async (event) => {
  const input = event.target;
  try {
    if (input.matches("[data-mentor-toggle]")) {
      await call(client.from("mentors").update({ [input.dataset.field]: input.checked }).eq("id", input.dataset.mentorToggle));
      toast("Saved.");
      await loadAll();
    } else if (input.matches("[data-event-toggle]")) {
      await call(client.from("events").update({ is_published: input.checked }).eq("id", input.dataset.eventToggle));
      toast(input.checked ? "Event published." : "Event hidden from the site.");
      await loadAll();
    }
  } catch (error) {
    input.checked = !input.checked;
    toast(error.message, "error");
  }
});
