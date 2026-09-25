/* ==========================================================================
   Helpers
   ========================================================================== */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

const initials = (name) => {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
};

const formatDateTime = (value) =>
  new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    .format(new Date(value));

const formatTime = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, h, m));
};

function toast(message) {
  const region = $("#toastRegion");
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `${icon("check")}<span>${escapeHtml(message)}</span>`;
  region.appendChild(el);
  setTimeout(() => {
    el.classList.add("is-leaving");
    setTimeout(() => el.remove(), 250);
  }, 3200);
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ==========================================================================
   State
   ========================================================================== */
const state = {
  majors: [],
  mentors: [],
  resources: [],
  events: [],
  companies: [],
  roadmap: [],
  majorById: {},
  mentorById: {},
  activePath: null,
  activeYear: "freshman",
  roadmapProgress: {},
  rsvps: [],
  mentorMajor: "all",
  mentorQuery: "",
  resourceMajor: "all",
  resourceType: "all",
  resourcesExpanded: false
};

const RESOURCE_PREVIEW_COUNT = 6;

const majorLabel = (id) => {
  const major = state.majorById[id];
  return major ? major.shortName || major.name : "All majors";
};

/* ==========================================================================
   Hero
   ========================================================================== */
function renderHero() {
  $("#heroChips").innerHTML =
    state.majors
      .map((major) => `
        <button type="button" class="chip" data-filter-mentors="${major.id}">
          ${icon(major.icon)}${escapeHtml(major.shortName || major.name)}
        </button>`)
      .join("") +
    `<a href="#paths" class="chip">${icon("compass")}I'm not sure yet</a>`;

  // Show one mentor from each of the first three majors that have mentors.
  const featured = [];
  const seen = new Set();
  for (const mentor of state.mentors) {
    if (!seen.has(mentor.majorId)) {
      featured.push(mentor);
      seen.add(mentor.majorId);
    }
    if (featured.length === 3) break;
  }

  $("#heroMentors").innerHTML = featured
    .map((mentor) => `
      <li class="hero-mentor" data-major="${mentor.majorId}">
        <span class="avatar">${initials(mentor.name)}</span>
        <span class="hero-mentor-info">
          <strong>${escapeHtml(mentor.name)}</strong>
          <span>${escapeHtml(mentor.role)} · ${escapeHtml(mentor.company)}</span>
        </span>
        <button type="button" class="btn btn-secondary btn-sm" data-book-mentor="${mentor.id}">Request</button>
      </li>`)
    .join("");
}

/* ==========================================================================
   Stats + logos
   ========================================================================== */
function renderStats() {
  const stats = [
    { value: state.mentors.length, label: "Student and alumni mentors" },
    { value: state.majors.length, label: "Career paths mapped" },
    { value: state.resources.length, label: "Curated resources" },
    { value: state.companies.length, label: "Companies where members interned" }
  ];

  $("#stats").innerHTML = stats
    .map((stat) => `
      <div class="stat">
        <dt>${stat.label}</dt>
        <dd data-count="${stat.value}">${stat.value}</dd>
      </div>`)
    .join("");
}

function renderLogos() {
  const set = state.companies
    .map((company) => `
      <div class="logo-card ${company.fit === "cover" ? "logo-card-cover" : ""}" title="${escapeHtml(company.name)}">
        <img src="${company.logo}" alt="${escapeHtml(company.name)}" loading="lazy" decoding="async" />
      </div>`)
    .join("");

  // The set is rendered twice so the -50% marquee animation loops seamlessly.
  // The copy is hidden from screen readers so each logo is announced once.
  $("#logoTrack").innerHTML = `
    <div class="logo-set">${set}</div>
    <div class="logo-set" aria-hidden="true">${set.replace(/alt="[^"]*"/g, 'alt=""')}</div>`;
}

function setupCounters() {
  const counters = $$("[data-count]");
  if (!counters.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const animate = (el) => {
    const target = Number(el.dataset.count);
    const start = performance.now();
    const duration = 1200;
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round((1 - Math.pow(1 - progress, 3)) * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  counters.forEach((el) => (el.textContent = "0"));
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      counters.forEach(animate);
      observer.disconnect();
    }
  }, { threshold: 0.5 });
  observer.observe($("#stats"));
}

/* ==========================================================================
   Accessible tabs (arrow keys move between tabs)
   ========================================================================== */
function setupTabKeys(tablist, onSelect) {
  tablist.addEventListener("keydown", (event) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    const tabs = $$('[role="tab"]', tablist);
    const current = tabs.indexOf(document.activeElement);
    let next = current;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % tabs.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;

    onSelect(tabs[next].dataset.id);
    $$('[role="tab"]', tablist)[next].focus();
  });
}

/* ==========================================================================
   Career paths
   ========================================================================== */
function resourceAction(resource, compact = false) {
  if (resource.url) {
    return `<a class="resource-link" href="${resource.url}" target="_blank" rel="noopener noreferrer">
      ${compact ? "Open" : `Visit ${escapeHtml(resource.source)}`}${icon("external")}
      <span class="sr-only">(opens in a new tab)</span></a>`;
  }
  if (resource.guideId) {
    return `<button type="button" class="resource-link" data-open-guide="${resource.guideId}">Read guide${icon("arrow-right")}</button>`;
  }
  return `<span class="coming-soon">Coming soon</span>`;
}

function renderPathTabs() {
  $("#pathTabs").innerHTML = state.majors
    .map((major) => {
      const selected = major.id === state.activePath;
      return `
        <button type="button" class="path-tab" role="tab" id="tab-${major.id}" data-id="${major.id}"
          data-major="${major.id}" aria-selected="${selected}" aria-controls="pathPanel" tabindex="${selected ? 0 : -1}">
          <span class="path-tab-icon">${icon(major.icon)}</span>
          ${escapeHtml(major.shortName || major.name)}
        </button>`;
    })
    .join("");
}

function renderPathPanel() {
  const major = state.majorById[state.activePath];
  const panel = $("#pathPanel");
  const mentors = state.mentors.filter((mentor) => mentor.majorId === major.id);
  const resources = state.resources.filter((resource) => resource.majorId === major.id).slice(0, 3);

  panel.dataset.major = major.id;
  panel.setAttribute("aria-labelledby", `tab-${major.id}`);
  panel.innerHTML = `
    <div class="path-header">
      <span class="path-tab-icon">${icon(major.icon)}</span>
      <h3>${escapeHtml(major.name)}</h3>
    </div>
    <p class="path-summary">${escapeHtml(major.summary)}</p>

    <div class="path-grid">
      <div class="path-block">
        <h4>Common roles</h4>
        <div class="role-list">${major.roles.map((role) => `<span class="tag">${escapeHtml(role)}</span>`).join("")}</div>
      </div>

      <div class="path-block">
        <h4>Skills to build</h4>
        <ul class="check-list">${major.skills.map((skill) => `<li>${icon("check")}<span>${escapeHtml(skill)}</span></li>`).join("")}</ul>
      </div>

      <div class="path-block">
        <h4>Recruiting timeline</h4>
        <ol class="timeline">
          ${major.timeline.map((item) => `<li><strong>${escapeHtml(item.when)}</strong><span>${escapeHtml(item.what)}</span></li>`).join("")}
        </ol>
      </div>

      <div class="path-block">
        <h4>Talk to</h4>
        ${mentors.length
          ? `<div class="mini-list">${mentors.map((mentor) => `
              <div class="mini-item" data-major="${mentor.majorId}">
                <span class="avatar">${initials(mentor.name)}</span>
                <span class="mini-item-info">
                  <strong>${escapeHtml(mentor.name)}</strong>
                  <span>${escapeHtml(mentor.role)} · ${escapeHtml(mentor.company)}</span>
                </span>
                <button type="button" class="btn btn-secondary btn-sm" data-book-mentor="${mentor.id}">Request</button>
              </div>`).join("")}</div>`
          : `<p class="empty-inline">No mentors in this path yet. <a class="text-link" href="#booking" data-book-major="${major.id}">Request a match</a> and we'll find someone.</p>`}
      </div>

      <div class="path-block">
        <h4>Start here</h4>
        <div class="mini-list">
          ${resources.map((resource) => `
            <div class="mini-item">
              <span class="mini-item-info">
                <strong>${escapeHtml(resource.title)}</strong>
                <span>${escapeHtml(resource.type)} · ${escapeHtml(resource.source)}</span>
              </span>
              ${resourceAction(resource, true)}
            </div>`).join("")}
        </div>
      </div>
    </div>

    <div class="path-footer">
      <button type="button" class="btn btn-primary" data-book-major="${major.id}">Book a chat about ${escapeHtml(major.shortName || major.name)}</button>
      <button type="button" class="btn btn-ghost" data-show-resources="${major.id}">All ${escapeHtml(major.shortName || major.name)} resources ${icon("arrow-right")}</button>
    </div>`;

  panel.classList.remove("is-entering");
  void panel.offsetWidth; // restart the enter animation
  panel.classList.add("is-entering");
}

function selectPath(id) {
  if (!state.majorById[id]) return;
  state.activePath = id;
  renderPathTabs();
  renderPathPanel();
}

/* ==========================================================================
   Roadmap
   ========================================================================== */
function renderYearTabs() {
  $("#yearTabs").innerHTML = state.roadmap
    .map((year) => {
      const done = year.items.filter((item) => state.roadmapProgress[item.id]).length;
      const selected = year.id === state.activeYear;
      return `
        <button type="button" class="year-tab" role="tab" id="year-${year.id}" data-id="${year.id}"
          aria-selected="${selected}" aria-controls="roadmapPanel" tabindex="${selected ? 0 : -1}">
          ${escapeHtml(year.label)}
          <span class="badge ${done === year.items.length ? "is-done" : ""}">${done}/${year.items.length}</span>
        </button>`;
    })
    .join("");
}

function renderRoadmapPanel({ animate = true } = {}) {
  const year = state.roadmap.find((item) => item.id === state.activeYear);
  const done = year.items.filter((item) => state.roadmapProgress[item.id]).length;
  const percent = Math.round((done / year.items.length) * 100);
  const panel = $("#roadmapPanel");

  panel.setAttribute("aria-labelledby", `year-${year.id}`);
  panel.innerHTML = `
    <div class="roadmap-focus">
      <span class="tag tag-maroon">${escapeHtml(year.label)} year</span>
      <h3>${escapeHtml(year.focus)}</h3>
      <p>${escapeHtml(year.intro)}</p>
      <div class="progress">
        <div class="progress-label"><span>Your progress</span><span>${done} of ${year.items.length}</span></div>
        <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}" aria-label="${escapeHtml(year.label)} progress">
          <span style="width: ${percent}%"></span>
        </div>
      </div>
      <p class="roadmap-note">Need help with one of these? <a class="text-link" href="#booking">Book a coffee chat</a>.</p>
    </div>
    <ul class="task-list">
      ${year.items.map((item) => `
        <li>
          <label class="task">
            <input type="checkbox" data-roadmap-item="${item.id}" ${state.roadmapProgress[item.id] ? "checked" : ""} />
            <span class="task-box">${icon("check")}</span>
            <span class="task-text">${escapeHtml(item.text)}</span>
          </label>
        </li>`).join("")}
    </ul>`;

  if (animate) {
    panel.classList.remove("is-entering");
    void panel.offsetWidth;
    panel.classList.add("is-entering");
  }
}

function selectYear(id) {
  state.activeYear = id;
  renderYearTabs();
  renderRoadmapPanel();
}

async function toggleRoadmapItem(itemId, done) {
  state.roadmapProgress = await api.setRoadmapItem(itemId, done);
  renderYearTabs();

  // Update the progress bar in place so the checkbox keeps focus.
  const year = state.roadmap.find((item) => item.id === state.activeYear);
  const count = year.items.filter((item) => state.roadmapProgress[item.id]).length;
  const percent = Math.round((count / year.items.length) * 100);
  $("#roadmapPanel .progress-label span:last-child").textContent = `${count} of ${year.items.length}`;
  $("#roadmapPanel .progress-bar").setAttribute("aria-valuenow", percent);
  $("#roadmapPanel .progress-bar span").style.width = `${percent}%`;

  if (done && count === year.items.length) toast(`${year.label} year complete. Nice work!`);
}

/* ==========================================================================
   Mentors
   ========================================================================== */
function renderMentorFilters() {
  const count = (id) => state.mentors.filter((mentor) => mentor.majorId === id).length;
  const chips = [{ id: "all", label: "All", count: state.mentors.length }].concat(
    state.majors.map((major) => ({ id: major.id, label: major.shortName || major.name, count: count(major.id) }))
  );

  $("#mentorFilters").innerHTML = chips
    .map((chip) => `
      <button type="button" class="chip" data-mentor-filter="${chip.id}" aria-pressed="${chip.id === state.mentorMajor}">
        ${escapeHtml(chip.label)} <span class="count">${chip.count}</span>
      </button>`)
    .join("");
}

function renderMentors() {
  const query = state.mentorQuery.trim().toLowerCase();
  const list = state.mentors.filter((mentor) => {
    if (state.mentorMajor !== "all" && mentor.majorId !== state.mentorMajor) return false;
    if (!query) return true;
    const haystack = [mentor.name, mentor.role, mentor.company, mentor.bio, majorLabel(mentor.majorId), ...mentor.helpsWith, ...mentor.interests]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  $("#mentorCount").textContent = `Showing ${list.length} of ${state.mentors.length} mentors`;

  if (!list.length) {
    $("#mentorGrid").innerHTML = `
      <div class="empty-state">
        <h3>No mentors match that search</h3>
        <p>Try another keyword, or let us match you with someone.</p>
        <button type="button" class="btn btn-secondary" data-reset-mentors>Clear filters</button>
      </div>`;
    return;
  }

  $("#mentorGrid").innerHTML = list
    .map((mentor, index) => `
      <article class="card mentor-card" data-major="${mentor.majorId}" style="animation-delay: ${index * 40}ms">
        <div class="mentor-head">
          <span class="avatar avatar-lg">${initials(mentor.name)}</span>
          <div>
            <h3>${escapeHtml(mentor.name)}</h3>
            <p class="mentor-role">${escapeHtml(mentor.role)} · <strong>${escapeHtml(mentor.company)}</strong></p>
          </div>
        </div>
        <span class="tag mentor-major">${escapeHtml(majorLabel(mentor.majorId))}</span>
        <p class="mentor-bio">${escapeHtml(mentor.bio)}</p>
        <div class="mentor-helps">
          <h4>Can help with</h4>
          <ul>${mentor.helpsWith.map((item) => `<li class="tag tag-maroon">${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
        <div class="mentor-foot">
          <span class="mentor-interests">Outside work: ${escapeHtml(mentor.interests.join(", "))}</span>
          <button type="button" class="btn btn-primary btn-sm" data-book-mentor="${mentor.id}">Request a chat</button>
        </div>
      </article>`)
    .join("");
}

function filterMentors(majorId) {
  state.mentorMajor = majorId;
  renderMentorFilters();
  renderMentors();
}

/* ==========================================================================
   Resources
   ========================================================================== */
function renderResourceFilters() {
  const chips = [{ id: "all", label: "All" }]
    .concat(state.majors.map((major) => ({ id: major.id, label: major.shortName || major.name })))
    .concat({ id: "general", label: "Any major" });

  $("#resourceFilters").innerHTML = chips
    .map((chip) => `
      <button type="button" class="chip" data-resource-filter="${chip.id}" aria-pressed="${chip.id === state.resourceMajor}">
        ${escapeHtml(chip.label)}
      </button>`)
    .join("");
}

function renderResources() {
  const list = state.resources.filter(
    (resource) =>
      (state.resourceMajor === "all" || resource.majorId === state.resourceMajor) &&
      (state.resourceType === "all" || resource.type === state.resourceType)
  );

  const visible = state.resourcesExpanded ? list : list.slice(0, RESOURCE_PREVIEW_COUNT);
  $("#resourceCount").textContent = `Showing ${visible.length} of ${list.length} resources`;
  $("#resourceMore").hidden = visible.length === list.length;
  $("#resourceMoreBtn").textContent = `Show all ${list.length} resources`;

  if (!list.length) {
    $("#resourceGrid").innerHTML = `
      <div class="empty-state">
        <h3>Nothing here yet</h3>
        <p>Know a great resource for this? Share it with us.</p>
        <button type="button" class="btn btn-secondary" data-open-involve="Suggest a resource">Suggest a resource</button>
      </div>`;
    return;
  }

  $("#resourceGrid").innerHTML = visible
    .map((resource, index) => `
      <article class="card resource-card" style="animation-delay: ${index * 30}ms">
        <div class="resource-top">
          <span class="tag ${resource.source === "FVCN" ? "tag-maroon" : ""}">${resource.source === "FVCN" ? "FVCN guide" : escapeHtml(resource.type)}</span>
          <span class="tag">${escapeHtml(resource.level)}</span>
        </div>
        <h3>${escapeHtml(resource.title)}</h3>
        <p>${escapeHtml(resource.description)}</p>
        <div class="resource-foot">
          <span>${escapeHtml(resource.majorId === "general" ? "Any major" : majorLabel(resource.majorId))}</span>
          ${resourceAction(resource)}
        </div>
      </article>`)
    .join("");
}

function setupResourceTypeSelect() {
  const types = [...new Set(state.resources.map((resource) => resource.type))].sort();
  const select = $("#resourceType");
  select.innerHTML += types.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("");
  select.addEventListener("change", () => {
    state.resourceType = select.value;
    state.resourcesExpanded = false;
    renderResources();
  });

  $("#resourceMoreBtn").addEventListener("click", () => {
    state.resourcesExpanded = true;
    renderResources();
  });
}

/* ==========================================================================
   Events
   ========================================================================== */
const eventStart = (event) => new Date(`${event.date}T${event.start}`);
const eventEnd = (event) => new Date(`${event.date}T${event.end}`);

function renderEvents() {
  const now = new Date();
  const upcoming = state.events
    .filter((event) => eventEnd(event) >= now)
    .sort((a, b) => eventStart(a) - eventStart(b));

  if (!upcoming.length) {
    $("#eventList").innerHTML = `
      <div class="empty-state">
        <h3>No upcoming events right now</h3>
        <p>New events are posted every few weeks. Have an idea? We'd love to hear it.</p>
        <button type="button" class="btn btn-secondary" data-open-involve="Host an event">Suggest an event</button>
      </div>`;
    return;
  }

  $("#eventList").innerHTML = upcoming
    .map((event, index) => {
      const start = eventStart(event);
      const going = state.rsvps.includes(event.id);
      return `
        <article class="event-card" style="animation-delay: ${index * 40}ms">
          <div class="event-date" aria-hidden="true">
            <span class="month">${start.toLocaleString("en-US", { month: "short" })}</span>
            <span class="day">${start.getDate()}</span>
            <span class="weekday">${start.toLocaleString("en-US", { weekday: "short" })}</span>
          </div>
          <div class="event-body">
            <span class="tag ${event.category === "Career" ? "tag-maroon" : event.category === "Alumni" ? "tag-gold" : ""}">${escapeHtml(event.category)}</span>
            <h3>${escapeHtml(event.title)}</h3>
            <p>${escapeHtml(event.description)}</p>
            <div class="event-meta">
              <span>${icon("calendar")}${start.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
              <span>${icon("clock")}${formatTime(event.start)} – ${formatTime(event.end)}</span>
              <span>${icon("pin")}${escapeHtml(event.location)}</span>
            </div>
          </div>
          <div class="event-actions">
            <button type="button" class="btn btn-sm btn-secondary ${going ? "is-going" : ""}" data-rsvp="${event.id}" aria-pressed="${going}">
              ${going ? `${icon("check")}Going` : "RSVP"}
            </button>
            <button type="button" class="btn btn-ghost btn-sm" data-ics="${event.id}">${icon("calendar-plus")}Add to calendar</button>
          </div>
        </article>`;
    })
    .join("");
}

function downloadIcs(event) {
  const stamp = (date, time) => `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
  const text = (value) => value.replace(/([,;\\])/g, "\\$1");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FVCN//Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@fvcn`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART;TZID=America/New_York:${stamp(event.date, event.start)}`,
    `DTEND;TZID=America/New_York:${stamp(event.date, event.end)}`,
    `SUMMARY:${text(event.title)} (FVCN)`,
    `LOCATION:${text(event.location)}`,
    `DESCRIPTION:${text(event.description)}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: `${event.id}.ics` });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/* ==========================================================================
   FAQ
   ========================================================================== */
function renderFaqs(faqs) {
  $("#faqList").innerHTML = faqs
    .map((faq) => `
      <details class="faq-item">
        <summary>${escapeHtml(faq.q)}${icon("chevron")}</summary>
        <p>${escapeHtml(faq.a)}</p>
      </details>`)
    .join("");
}

/* ==========================================================================
   Booking
   ========================================================================== */
const bookingForm = $("#bookingForm");

function populateBookingForm() {
  $("#f-major").innerHTML += state.majors
    .map((major) => `<option value="${major.id}">${escapeHtml(major.name)}</option>`)
    .join("") + `<option value="exploring">Still exploring</option>`;

  $("#f-mentor").innerHTML += state.majors
    .map((major) => {
      const mentors = state.mentors.filter((mentor) => mentor.majorId === major.id);
      if (!mentors.length) return "";
      return `<optgroup label="${escapeHtml(major.name)}">${mentors
        .map((mentor) => `<option value="${mentor.id}">${escapeHtml(mentor.name)} · ${escapeHtml(mentor.company)}</option>`)
        .join("")}</optgroup>`;
    })
    .join("");

  // Don't allow picking a time in the past.
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const min = now.toISOString().slice(0, 16);
  $("#f-time1").min = min;
  $("#f-time2").min = min;
}

function prefillBooking({ mentorId, majorId, meetingType } = {}) {
  showBookingForm();
  if (mentorId) {
    $("#f-mentor").value = mentorId;
    majorId = majorId || state.mentorById[mentorId]?.majorId;
  }
  if (majorId) $("#f-major").value = majorId;
  if (meetingType) $("#f-type").value = meetingType;
  scrollToSection("booking");

  // Focus the first empty field once the scroll has settled.
  setTimeout(() => {
    const firstEmpty = $$("input[required], select[required], textarea[required]", bookingForm).find((field) => !field.value);
    (firstEmpty || $("#f-name")).focus({ preventScroll: true });
  }, 600);
}

const validators = {
  name: (value) => (value.trim().length < 2 ? "Please enter your full name." : ""),
  email: (value) => {
    if (!value.trim()) return "Please enter your email.";
    if (!/^[^\s@]+@fordham\.edu$/i.test(value.trim())) return "Please use your @fordham.edu email.";
    return "";
  },
  year: (value) => (value ? "" : "Please choose your class year."),
  majorId: (value) => (value ? "" : "Please choose a major or interest."),
  meetingType: (value) => (value ? "" : "Please choose what you need help with."),
  time1: (value) => {
    if (!value) return "Please choose a time.";
    if (new Date(value) < new Date()) return "Please choose a time in the future.";
    return "";
  },
  time2: (value) => {
    if (!value) return "";
    if (new Date(value) < new Date()) return "Please choose a time in the future.";
    if (value === $("#f-time1").value) return "Pick a different backup time.";
    return "";
  },
  link: (value) => {
    if (!value.trim()) return "";
    try {
      const url = new URL(value.trim());
      return /^https?:$/.test(url.protocol) ? "" : "Please enter a link that starts with https://";
    } catch {
      return "Please enter a full link, like https://linkedin.com/in/your-name";
    }
  },
  message: (value) => (value.trim().length < 10 ? "Tell your mentor a little more (at least 10 characters)." : "")
};

function validateField(name) {
  const field = bookingForm.elements[name];
  const error = validators[name]?.(field.value) || "";
  const wrapper = field.closest(".field");
  wrapper.classList.toggle("has-error", Boolean(error));
  field.setAttribute("aria-invalid", Boolean(error));
  const errorEl = $(`[data-error-for="${name}"]`, bookingForm);
  if (errorEl) {
    errorEl.textContent = error;
    errorEl.id = `err-${name}`;
    if (error) field.setAttribute("aria-describedby", errorEl.id);
    else field.removeAttribute("aria-describedby");
  }
  return !error;
}

function showBookingForm() {
  $("#bookingSuccess").hidden = true;
  bookingForm.hidden = false;
}

async function renderMyBookings() {
  const bookings = await api.listMyBookings();
  $("#myRequests").hidden = bookings.length === 0;
  $("#myRequestsList").innerHTML = bookings
    .slice(0, 5)
    .map((booking) => `
      <li class="request-item">
        <div class="request-info">
          <strong>${escapeHtml(booking.meetingType)} with ${escapeHtml(booking.mentorName)}</strong>
          <span>${escapeHtml(formatDateTime(booking.time1))}</span>
        </div>
        <span class="status status-${booking.status}">${escapeHtml(booking.status)}</span>
        ${booking.status === "pending" ? `<button type="button" class="request-cancel" data-cancel-booking="${booking.id}">Cancel</button>` : ""}
      </li>`)
    .join("");
}

function setupBooking() {
  populateBookingForm();

  // Validate a field when the user leaves it, then live once it has shown an error.
  bookingForm.addEventListener("focusout", (event) => {
    if (validators[event.target.name] && event.target.value) validateField(event.target.name);
  });
  bookingForm.addEventListener("input", (event) => {
    if (event.target.closest(".field.has-error")) validateField(event.target.name);
    if (event.target.name === "message") $("#charCount").textContent = `${event.target.value.length} / 600`;
  });

  // Choosing a mentor fills in the major; choosing a different major clears a mismatched mentor.
  $("#f-mentor").addEventListener("change", (event) => {
    const mentor = state.mentorById[event.target.value];
    if (mentor) {
      $("#f-major").value = mentor.majorId;
      validateField("majorId");
    }
  });
  $("#f-major").addEventListener("change", (event) => {
    const mentor = state.mentorById[$("#f-mentor").value];
    if (mentor && mentor.majorId !== event.target.value) $("#f-mentor").value = "any";
  });

  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const results = Object.keys(validators).map((name) => validateField(name));
    if (results.includes(false)) {
      $(".field.has-error input, .field.has-error select, .field.has-error textarea", bookingForm)?.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(bookingForm).entries());
    const mentor = state.mentorById[data.mentorId];
    const submit = $("#bookingSubmit");
    submit.classList.add("is-loading");
    $(".btn-label", submit).textContent = "Sending…";

    try {
      const booking = await api.createBooking({
        ...data,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        mentorName: mentor ? mentor.name : "a matched mentor"
      });
      showBookingSuccess(booking, mentor);
      bookingForm.reset();
      $("#charCount").textContent = "0 / 600";
      renderMyBookings();
    } catch {
      toast("Something went wrong. Please try again.");
    } finally {
      submit.classList.remove("is-loading");
      $(".btn-label", submit).textContent = "Send request";
    }
  });

  $("#bookAnother").addEventListener("click", () => {
    showBookingForm();
    $("#f-name").focus();
  });
}

function showBookingSuccess(booking, mentor) {
  const firstName = booking.name.split(" ")[0];
  $("#bookingSuccessText").textContent = mentor
    ? `Thanks, ${firstName}! ${mentor.name.split(" ")[0]} will confirm a time by email at ${booking.email}.`
    : `Thanks, ${firstName}! We'll match you with a mentor and email you at ${booking.email}.`;

  const rows = [
    ["Request ID", booking.id],
    ["Mentor", mentor ? `${mentor.name} · ${mentor.company}` : "We'll match you"],
    ["Topic", booking.meetingType],
    ["Format", booking.format],
    ["Preferred time", formatDateTime(booking.time1)]
  ];
  if (booking.time2) rows.push(["Backup time", formatDateTime(booking.time2)]);

  $("#bookingSummary").innerHTML = rows
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`)
    .join("");
  $("#bookingDemoNote").hidden = !api.DEMO_MODE;

  bookingForm.hidden = true;
  const success = $("#bookingSuccess");
  success.hidden = false;
  success.focus({ preventScroll: true });
  success.closest(".booking-card").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ==========================================================================
   Dialogs: guides + get involved
   ========================================================================== */
async function openGuide(id) {
  const guide = await api.getGuide(id);
  if (!guide) return;

  $("#guideTitle").textContent = guide.title;
  $("#guideBody").innerHTML = `
    <p class="guide-intro">${escapeHtml(guide.intro)}</p>
    ${guide.sections.map((section) => `
      <div class="guide-section">
        <h3>${escapeHtml(section.heading)}</h3>
        <ul class="check-list">${section.items.map((item) => `<li>${icon("check")}<span>${escapeHtml(item)}</span></li>`).join("")}</ul>
      </div>`).join("")}
    ${guide.template ? `
      <div class="guide-template">
        <div class="guide-template-head">
          <h3>Thank-you note template</h3>
          <button type="button" class="btn btn-secondary btn-sm" data-copy-template>${icon("copy")}Copy</button>
        </div>
        <pre id="guideTemplate">${escapeHtml(guide.template)}</pre>
      </div>` : ""}
    <div class="guide-cta">
      <button type="button" class="btn btn-primary" data-book-from-guide="${id === "resume" ? "Resume review" : "Coffee chat"}">
        ${id === "resume" ? "Book a resume review" : "Book a coffee chat"} ${icon("arrow-right")}
      </button>
    </div>`;

  $("#guideDialog").showModal();
  $("#guideDialog .dialog-body").scrollTop = 0;
}

const involvePrompts = {
  "Become a mentor": "Your class year, major, and internship or work experience",
  "Suggest a resource": "The resource name, a link, and who it would help",
  "Host an event": "What kind of event, and roughly when"
};

function openInvolve(type) {
  const form = $("#involveForm");
  form.reset();
  if (type) form.elements.type.value = type;
  $("#i-details-label").textContent = involvePrompts[form.elements.type.value];
  $("#involveDialog").showModal();
}

function setupDialogs() {
  $$(".dialog").forEach((dialog) => {
    // Clicking the backdrop (outside the dialog box) closes it.
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  $("#involveForm").elements.type.addEventListener("change", (event) => {
    $("#i-details-label").textContent = involvePrompts[event.target.value];
  });

  $("#involveForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;

    const button = $('button[type="submit"]', form);
    button.classList.add("is-loading");
    await api.submitInterest(Object.fromEntries(new FormData(form).entries()));
    button.classList.remove("is-loading");
    $("#involveDialog").close();
    toast("Thanks! We'll be in touch soon.");
  });
}

/* ==========================================================================
   Click handling (one delegated listener for all rendered content)
   ========================================================================== */
function setupActions() {
  document.addEventListener("click", async (event) => {
    const target = event.target.closest(
      "[data-book-mentor], [data-book-major], [data-filter-mentors], [data-mentor-filter], [data-reset-mentors], " +
      "[data-resource-filter], [data-show-resources], [data-open-guide], [data-open-involve], [data-close-dialog], " +
      "[data-copy-template], [data-book-from-guide], [data-rsvp], [data-ics], [data-cancel-booking], .path-tab, .year-tab"
    );
    if (!target) return;
    const data = target.dataset;

    if (data.bookMentor) {
      prefillBooking({ mentorId: data.bookMentor });
      toast(`${state.mentorById[data.bookMentor].name} selected. Just add your details.`);
    } else if (data.bookMajor) {
      event.preventDefault();
      prefillBooking({ majorId: data.bookMajor });
    } else if (data.filterMentors) {
      state.mentorQuery = "";
      $("#mentorSearch").value = "";
      filterMentors(data.filterMentors);
      scrollToSection("mentors");
    } else if (data.mentorFilter) {
      filterMentors(data.mentorFilter);
    } else if ("resetMentors" in data) {
      state.mentorQuery = "";
      $("#mentorSearch").value = "";
      filterMentors("all");
    } else if (data.resourceFilter) {
      state.resourceMajor = data.resourceFilter;
      state.resourcesExpanded = false;
      renderResourceFilters();
      renderResources();
    } else if (data.showResources) {
      state.resourceMajor = data.showResources;
      state.resourceType = "all";
      state.resourcesExpanded = true;
      $("#resourceType").value = "all";
      renderResourceFilters();
      renderResources();
      scrollToSection("resources");
    } else if (data.openGuide) {
      openGuide(data.openGuide);
    } else if (data.openInvolve) {
      openInvolve(data.openInvolve);
    } else if ("closeDialog" in data) {
      target.closest("dialog").close();
    } else if ("copyTemplate" in data) {
      try {
        await navigator.clipboard.writeText($("#guideTemplate").textContent);
        toast("Template copied to clipboard.");
      } catch {
        toast("Couldn't copy. Select the text and copy it manually.");
      }
    } else if (data.bookFromGuide) {
      $("#guideDialog").close();
      prefillBooking({ meetingType: data.bookFromGuide });
    } else if (data.rsvp) {
      const going = await api.toggleRsvp(data.rsvp);
      state.rsvps = await api.getMyRsvps();
      renderEvents();
      const title = state.events.find((item) => item.id === data.rsvp).title;
      toast(going ? `You're going to ${title}. Details will be emailed before the event.` : `RSVP cancelled for ${title}.`);
    } else if (data.ics) {
      downloadIcs(state.events.find((item) => item.id === data.ics));
    } else if (data.cancelBooking) {
      await api.cancelBooking(data.cancelBooking);
      renderMyBookings();
      toast("Request cancelled.");
    } else if (target.classList.contains("path-tab")) {
      selectPath(data.id);
    } else if (target.classList.contains("year-tab")) {
      selectYear(data.id);
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-roadmap-item]")) {
      toggleRoadmapItem(event.target.dataset.roadmapItem, event.target.checked);
    }
  });

  let searchTimer;
  $("#mentorSearch").addEventListener("input", (event) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.mentorQuery = event.target.value;
      renderMentors();
    }, 150);
  });

  setupTabKeys($("#pathTabs"), selectPath);
  setupTabKeys($("#yearTabs"), selectYear);
}

/* ==========================================================================
   Navigation, scroll effects, reveal
   ========================================================================== */
function setupNav() {
  const header = $("#siteHeader");
  const toggle = $("#navToggle");
  const links = $("#navLinks");
  const backToTop = $("#backToTop");

  const setMenu = (open) => {
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    $("use", toggle).setAttribute("href", open ? "#i-x" : "#i-menu");
  };

  toggle.addEventListener("click", () => setMenu(!links.classList.contains("open")));
  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".navbar")) setMenu(false);
  });

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
    backToTop.classList.toggle("show", window.scrollY > 900);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Highlight the nav link for the section currently in view.
  const navLinks = $$('.nav-links a[href^="#"]:not(.btn)');
  const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("is-active", active);
          if (active) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((section) => spy.observe(section));
}

function setupReveal() {
  const elements = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  elements.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   Init
   ========================================================================== */
async function init() {
  const [majors, mentors, resources, events, companies, roadmap, faqs, roadmapProgress, rsvps] = await Promise.all([
    api.getMajors(),
    api.getMentors(),
    api.getResources(),
    api.getEvents(),
    api.getCompanies(),
    api.getRoadmap(),
    api.getFaqs(),
    api.getRoadmapProgress(),
    api.getMyRsvps()
  ]);

  Object.assign(state, { majors, mentors, resources, events, companies, roadmap, roadmapProgress, rsvps });
  state.majorById = Object.fromEntries(majors.map((major) => [major.id, major]));
  state.mentorById = Object.fromEntries(mentors.map((mentor) => [mentor.id, mentor]));
  state.activePath = majors[0]?.id;

  renderHero();
  renderStats();
  renderLogos();
  renderPathTabs();
  renderPathPanel();
  renderYearTabs();
  renderRoadmapPanel({ animate: false });
  renderMentorFilters();
  renderMentors();
  renderResourceFilters();
  setupResourceTypeSelect();
  renderResources();
  renderEvents();
  renderFaqs(faqs);
  renderMyBookings();

  setupNav();
  setupActions();
  setupBooking();
  setupDialogs();
  setupReveal();
  setupCounters();

  $("#year").textContent = new Date().getFullYear();
}

init();
