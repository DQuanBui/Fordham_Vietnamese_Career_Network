/* Prep kit page: interview question bank and practice mode. */

const prep = {
  track: "all",
  query: "",
  hidePracticed: false,
  practiced: new Set(localStore.get("fvcn.practiced", [])),
  practice: { current: null, timer: null, remaining: 120 }
};

const trackById = Object.fromEntries(FVCN_PREP.tracks.map((track) => [track.id, track]));

function savePracticed() {
  localStore.set("fvcn.practiced", [...prep.practiced]);
}

/* ==========================================================================
   Question bank
   ========================================================================== */
function filteredQuestions({ ignoreHidden = false } = {}) {
  const query = prep.query.trim().toLowerCase();
  return FVCN_PREP.questions.filter((question) => {
    if (prep.track !== "all" && question.track !== prep.track) return false;
    if (!ignoreHidden && prep.hidePracticed && prep.practiced.has(question.id)) return false;
    if (!query) return true;
    return [question.q, question.tip, question.type, ...question.points].join(" ").toLowerCase().includes(query);
  });
}

function renderTrackFilters() {
  const count = (id) => FVCN_PREP.questions.filter((question) => question.track === id).length;
  const chips = [{ id: "all", label: "All", n: FVCN_PREP.questions.length }]
    .concat(FVCN_PREP.tracks.map((track) => ({ id: track.id, label: track.label, n: count(track.id) })));
  $("#trackFilters").innerHTML = chips
    .map((chip) => `
      <button type="button" class="chip" data-track="${chip.id}" aria-pressed="${chip.id === prep.track}">
        ${escapeHtml(chip.label)} <span class="count">${chip.n}</span>
      </button>`)
    .join("");
}

function answerHtml(question) {
  return `
    <p class="qb-tip">${icon("compass")}<span>${escapeHtml(question.tip)}</span></p>
    <h4>A strong answer covers</h4>
    <ul class="check-list">${question.points.map((point) => `<li>${icon("check")}<span>${escapeHtml(point)}</span></li>`).join("")}</ul>`;
}

function renderProgress() {
  const scope = prep.track === "all" ? FVCN_PREP.questions : FVCN_PREP.questions.filter((q) => q.track === prep.track);
  const done = scope.filter((q) => prep.practiced.has(q.id)).length;
  const label = prep.track === "all" ? "questions" : `${trackById[prep.track].label} questions`;
  $("#qbProgressText").textContent = `${done} of ${scope.length} ${label} practiced`;
  $("#qbProgressBar").style.width = `${scope.length ? (done / scope.length) * 100 : 0}%`;
}

// The booking link carries the selected track, so the form opens with the right major.
function updateMockInterviewLink() {
  const major = prep.track !== "all" && prep.track !== "behavioral" ? `&major=${prep.track}` : "";
  $("#mockInterviewLink").href = `index.html?topic=Interview+prep${major}#booking`;
}

function renderQuestions() {
  updateMockInterviewLink();
  const list = filteredQuestions();
  $("#questionCount").textContent = `${list.length} question${list.length === 1 ? "" : "s"}`;
  renderProgress();

  if (!list.length) {
    $("#questionList").innerHTML = `
      <div class="empty-state">
        <h3>No questions match</h3>
        <p>Try another track or search term${prep.hidePracticed ? ", or show the ones you've practiced" : ""}.</p>
      </div>`;
    return;
  }

  $("#questionList").innerHTML = list
    .map((question) => {
      const track = trackById[question.track];
      const done = prep.practiced.has(question.id);
      return `
        <details class="qb-item ${done ? "is-done" : ""}" data-question="${question.id}">
          <summary>
            <span class="qb-icon" aria-hidden="true">${icon(track.icon)}</span>
            <span class="qb-q">
              <strong>${escapeHtml(question.q)}</strong>
              <span class="qb-tags">
                <span class="tag">${escapeHtml(track.label)}</span>
                <span class="tag tag-gold">${escapeHtml(question.type)}</span>
                ${done ? `<span class="tag tag-success">${icon("check")}Practiced</span>` : ""}
              </span>
            </span>
            ${icon("chevron")}
          </summary>
          <div class="qb-answer">
            ${answerHtml(question)}
            <label class="qb-done">
              <input type="checkbox" data-practiced="${question.id}" ${done ? "checked" : ""} />
              I've practiced this one
            </label>
          </div>
        </details>`;
    })
    .join("");
}

function setPracticed(id, done) {
  if (done) prep.practiced.add(id);
  else prep.practiced.delete(id);
  savePracticed();
}

/* ==========================================================================
   Practice mode: a random question, a 2-minute timer, then the outline
   ========================================================================== */
const PRACTICE_SECONDS = 120;

function formatClock(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function stopTimer() {
  clearInterval(prep.practice.timer);
  prep.practice.timer = null;
  $("#practiceTimerBtn").textContent = prep.practice.remaining < PRACTICE_SECONDS ? "Resume timer" : "Start timer";
}

function toggleTimer() {
  if (prep.practice.timer) {
    stopTimer();
    return;
  }
  if (prep.practice.remaining <= 0) prep.practice.remaining = PRACTICE_SECONDS;
  $("#practiceTimerBtn").textContent = "Pause";
  prep.practice.timer = setInterval(() => {
    prep.practice.remaining -= 1;
    $("#practiceClock").textContent = formatClock(Math.max(prep.practice.remaining, 0));
    $("#practiceClock").classList.toggle("is-low", prep.practice.remaining <= 20);
    if (prep.practice.remaining <= 0) {
      stopTimer();
      $("#practiceTimerBtn").textContent = "Restart timer";
      toast("Time's up. Wrap up your answer, then check the outline.");
    }
  }, 1000);
}

function nextPracticeQuestion() {
  // Prefer questions not practiced yet, and never repeat the current one.
  const pool = filteredQuestions({ ignoreHidden: true }).filter((q) => q.id !== prep.practice.current?.id);
  const fresh = pool.filter((q) => !prep.practiced.has(q.id));
  const choices = fresh.length ? fresh : pool;
  if (!choices.length) {
    toast("No other questions match your filters.", "error");
    return;
  }
  const question = choices[Math.floor(Math.random() * choices.length)];
  prep.practice.current = question;

  stopTimer();
  prep.practice.remaining = PRACTICE_SECONDS;
  $("#practiceClock").textContent = formatClock(PRACTICE_SECONDS);
  $("#practiceClock").classList.remove("is-low");
  $("#practiceTimerBtn").textContent = "Start timer";

  $("#practiceMeta").textContent = `${trackById[question.track].label} · ${question.type}`;
  $("#practiceQuestion").textContent = question.q;
  $("#practiceAnswer").innerHTML = answerHtml(question);
  $("#practiceAnswer").hidden = true;
  $("#practiceReveal").hidden = false;
  $("#practiceDone").disabled = prep.practiced.has(question.id);
}

function setupPractice() {
  const dialog = $("#practiceDialog");
  $("#practiceStart").addEventListener("click", () => {
    prep.practice.current = null;
    nextPracticeQuestion();
    if (prep.practice.current) dialog.showModal();
  });
  $("#practiceTimerBtn").addEventListener("click", toggleTimer);
  $("#practiceReveal").addEventListener("click", () => {
    stopTimer();
    $("#practiceAnswer").hidden = false;
    $("#practiceReveal").hidden = true;
  });
  $("#practiceDone").addEventListener("click", () => {
    setPracticed(prep.practice.current.id, true);
    $("#practiceDone").disabled = true;
    renderQuestions();
    toast("Marked as practiced.");
  });
  $("#practiceNext").addEventListener("click", nextPracticeQuestion);
  dialog.addEventListener("close", stopTimer);
}

/* ==========================================================================
   Recruiting calendar
   ========================================================================== */
const ACADEMIC_MONTHS = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7]; // August to July
const CLASS_YEARS = [
  { id: "freshman", label: "Freshman" },
  { id: "sophomore", label: "Sophomore" },
  { id: "junior", label: "Junior" },
  { id: "senior", label: "Senior" }
];
const monthIndex = (month) => (month - 8 + 12) % 12;
const monthName = (month, style = "short") => new Date(2000, month - 1, 1).toLocaleString("en-US", { month: style });

const calendar = {
  track: FVCN_PREP.calendar[0].id,
  year: localStore.get("fvcn.classYear", "freshman"),
  now: new Date().getMonth() + 1
};

function monthRange(phase) {
  return phase.from === phase.to ? monthName(phase.from) : `${monthName(phase.from)}–${monthName(phase.to)}`;
}

function renderCalendarControls() {
  $("#calTracks").innerHTML = FVCN_PREP.calendar
    .map((track) => `
      <button type="button" class="chip" data-cal-track="${track.id}" aria-pressed="${track.id === calendar.track}">
        ${escapeHtml(track.label)}
      </button>`)
    .join("");
  $("#calYears").innerHTML = CLASS_YEARS
    .map((year) => `
      <label><input type="radio" name="calYear" value="${year.id}" ${year.id === calendar.year ? "checked" : ""} /><span>${year.label}</span></label>`)
    .join("");
  $("#calLegend").innerHTML = Object.entries(FVCN_PREP.calendarKinds)
    .map(([kind, label]) => `<li><span class="cal-swatch cal-${kind}"></span>${escapeHtml(label)}</li>`)
    .join("");
}

function renderCalendar() {
  const track = FVCN_PREP.calendar.find((item) => item.id === calendar.track);
  const phases = track.phases
    .filter((phase) => phase.year === calendar.year)
    .sort((a, b) => monthIndex(a.from) - monthIndex(b.from));
  const nowCol = monthIndex(calendar.now) + 2; // column 1 holds the phase titles

  const header = `
    <div class="cal-row cal-head" aria-hidden="true">
      <span class="cal-label"></span>
      ${ACADEMIC_MONTHS.map((month, i) => `
        <span class="cal-month ${i + 2 === nowCol ? "is-now" : ""}" style="grid-column: ${i + 2}">
          <span class="cal-month-full">${monthName(month)}</span><span class="cal-month-initial">${monthName(month, "narrow")}</span>
        </span>`).join("")}
    </div>`;

  const rows = phases
    .map((phase) => {
      const start = monthIndex(phase.from) + 2;
      const end = monthIndex(phase.to) + 3;
      const active = nowCol >= start && nowCol < end;
      return `
        <div class="cal-row">
          <span class="cal-label">
            <strong>${escapeHtml(phase.title)}</strong>
            <small>${monthRange(phase)} · ${escapeHtml(FVCN_PREP.calendarKinds[phase.kind])}</small>
          </span>
          <span class="cal-now-line" style="grid-column: ${nowCol}" aria-hidden="true"></span>
          <span class="cal-bar cal-${phase.kind} ${active ? "is-active" : ""}" style="grid-column: ${start} / ${end}"
            title="${escapeHtml(phase.detail || phase.title)}"></span>
        </div>`;
    })
    .join("");

  $("#calGrid").innerHTML = header + rows;
  renderCalendarNow(track, phases);
}

// "Right now" panel: what's happening this month for the chosen path and year, and what comes next.
function renderCalendarNow(track, phases) {
  const now = monthIndex(calendar.now);
  const active = phases.filter((phase) => monthIndex(phase.from) <= now && now <= monthIndex(phase.to));
  const upcoming = phases.filter((phase) => monthIndex(phase.from) > now).slice(0, 2);
  const yearLabel = CLASS_YEARS.find((year) => year.id === calendar.year).label;

  const item = (phase) => `
    <li class="cal-now-item">
      <span class="cal-swatch cal-${phase.kind}"></span>
      <div>
        <strong>${escapeHtml(phase.title)}</strong>
        <small>${monthRange(phase)}</small>
        ${phase.detail ? `<p>${escapeHtml(phase.detail)}</p>` : ""}
      </div>
    </li>`;

  $("#calNow").innerHTML = `
    <p class="eyebrow">Right now · ${monthName(calendar.now, "long")}</p>
    <h3>${yearLabel} year · ${escapeHtml(track.label)}</h3>
    ${active.length
      ? `<ul class="cal-now-list">${active.map(item).join("")}</ul>`
      : `<p class="cal-quiet">A quieter month for this path. A good time for coffee chats and building skills.</p>`}
    ${upcoming.length ? `<h4>Coming up</h4><ul class="cal-now-list is-upcoming">${upcoming.map(item).join("")}</ul>` : ""}
    <a class="btn btn-primary btn-block" href="index.html?topic=Internship+search&major=${track.majorId}#booking">
      Ask a mentor about timing ${icon("arrow-right")}
    </a>`;
}

function setupCalendar() {
  if (!CLASS_YEARS.some((year) => year.id === calendar.year)) calendar.year = "freshman";
  // prep.html?track=finance opens the matching path.
  const linked = FVCN_PREP.calendar.find((item) => item.majorId === new URLSearchParams(window.location.search).get("track"));
  if (linked) calendar.track = linked.id;
  renderCalendarControls();
  renderCalendar();

  $("#calTracks").addEventListener("click", (event) => {
    const chip = event.target.closest("[data-cal-track]");
    if (!chip) return;
    calendar.track = chip.dataset.calTrack;
    $$("[data-cal-track]").forEach((el) => el.setAttribute("aria-pressed", el === chip));
    renderCalendar();
  });
  $("#calYears").addEventListener("change", (event) => {
    calendar.year = event.target.value;
    localStore.set("fvcn.classYear", calendar.year);
    renderCalendar();
  });
}

/* ==========================================================================
   Init
   ========================================================================== */
function setupQuestionBank() {
  renderTrackFilters();
  renderQuestions();

  $("#trackFilters").addEventListener("click", (event) => {
    const chip = event.target.closest("[data-track]");
    if (!chip) return;
    prep.track = chip.dataset.track;
    renderTrackFilters();
    renderQuestions();
  });

  let searchTimer;
  $("#questionSearch").addEventListener("input", (event) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      prep.query = event.target.value;
      renderQuestions();
    }, 150);
  });

  $("#hidePracticed").addEventListener("change", (event) => {
    prep.hidePracticed = event.target.checked;
    renderQuestions();
  });

  $("#questionList").addEventListener("change", (event) => {
    const box = event.target.closest("[data-practiced]");
    if (!box) return;
    setPracticed(box.dataset.practiced, box.checked);
    const item = box.closest(".qb-item");
    item.classList.toggle("is-done", box.checked);
    $(".tag-success", item)?.remove();
    if (box.checked) $(".qb-tags", item).insertAdjacentHTML("beforeend", `<span class="tag tag-success">${icon("check")}Practiced</span>`);
    renderProgress();
    // Re-render after a moment so the "Practiced" tag updates without collapsing the open answer abruptly.
    if (prep.hidePracticed && box.checked) setTimeout(renderQuestions, 400);
  });

  // Deep links like prep.html?track=finance#questions
  const track = new URLSearchParams(window.location.search).get("track");
  if (track && trackById[track]) {
    prep.track = track;
    renderTrackFilters();
    renderQuestions();
  }

  setupPractice();
}

setupQuestionBank();
setupCalendar();
