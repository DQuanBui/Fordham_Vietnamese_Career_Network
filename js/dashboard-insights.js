/*
  Dashboard: Insights tab (admins).
  Everything is computed in the browser from data the dashboard already loads
  (bookings with their status history and feedback, mentors, RSVPs), so there is
  no extra query and no new database permission.
*/
const DAY = 24 * 60 * 60 * 1000;
const WEEKS_SHOWN = 12;

const median = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

function formatHours(hours) {
  if (hours === null) return "–";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 48) return `${Math.round(hours)} h`;
  return `${Math.round(hours / 24)} days`;
}

// Hours from a request being sent to the first staff decision (confirmed or declined).
function responseHours(booking) {
  const first = (booking.history || [])
    .filter((entry) => entry.from_status === "pending" && ["confirmed", "declined"].includes(entry.to_status))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];
  return first ? (new Date(first.created_at) - new Date(booking.created_at)) / 36e5 : null;
}

// Monday 00:00 of the week containing `date`.
function weekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

function insightsData() {
  const bookings = state.bookings;
  const now = Date.now();
  const last30 = bookings.filter((b) => now - new Date(b.created_at) <= 30 * DAY).length;
  const prev30 = bookings.filter((b) => {
    const age = now - new Date(b.created_at);
    return age > 30 * DAY && age <= 60 * DAY;
  }).length;

  const responded = bookings.map(responseHours).filter((hours) => hours !== null);
  const rated = bookings.filter((b) => b.feedback);
  const reachedChat = bookings.filter((b) => ["confirmed", "completed"].includes(b.status) ||
    (b.history || []).some((entry) => entry.to_status === "confirmed"));
  const completed = bookings.filter((b) => b.status === "completed");

  // Requests per week, oldest first.
  const thisWeek = weekStart(now);
  const weeks = Array.from({ length: WEEKS_SHOWN }, (_, i) => {
    const start = new Date(thisWeek);
    start.setDate(start.getDate() - (WEEKS_SHOWN - 1 - i) * 7);
    return { start, count: 0 };
  });
  bookings.forEach((b) => {
    const index = Math.round((weekStart(b.created_at) - weeks[0].start) / (7 * DAY));
    if (index >= 0 && index < WEEKS_SHOWN) weeks[index].count += 1;
  });

  const tally = (key, label = (value) => value) => {
    const counts = {};
    bookings.forEach((b) => {
      const name = label(b[key]);
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const mentorRows = state.mentors
    .map((mentor) => {
      const theirs = bookings.filter((b) => b.mentor_id === mentor.id);
      const ratings = theirs.filter((b) => b.feedback).map((b) => b.feedback.rating);
      return {
        mentor,
        total: theirs.length,
        pending: theirs.filter((b) => b.status === "pending").length,
        completed: theirs.filter((b) => b.status === "completed").length,
        response: median(theirs.map(responseHours).filter((hours) => hours !== null)),
        rating: ratings.length ? ratings.reduce((sum, n) => sum + n, 0) / ratings.length : null
      };
    })
    .filter((row) => row.total > 0 || row.mentor.is_active)
    .sort((a, b) => b.total - a.total || a.mentor.name.localeCompare(b.mentor.name));

  return {
    total: bookings.length,
    last30,
    prev30,
    medianResponse: median(responded),
    completionRate: reachedChat.length ? Math.round((completed.length / reachedChat.length) * 100) : null,
    averageRating: rated.length ? rated.reduce((sum, b) => sum + b.feedback.rating, 0) / rated.length : null,
    ratedCount: rated.length,
    funnel: [
      { label: "Requested", value: bookings.length },
      { label: "Confirmed", value: reachedChat.length },
      { label: "Completed", value: completed.length },
      { label: "Rated", value: rated.length }
    ],
    weeks,
    byMajor: tally("major_id", (id) => (id ? state.majorById[id]?.short_name || state.majorById[id]?.name || id : "Still exploring")),
    byTopic: tally("meeting_type"),
    byYear: tally("class_year"),
    mentorRows,
    rsvpCount: (state.rsvps || []).length
  };
}

/* ------------------------------------------------------------------------
   Rendering
   ------------------------------------------------------------------------ */
function weeklyChart(weeks) {
  const max = Math.max(...weeks.map((week) => week.count), 1);
  const width = 640;
  const height = 180;
  const gap = 10;
  const barWidth = (width - gap * (weeks.length - 1)) / weeks.length;
  const label = (date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const bars = weeks
    .map((week, i) => {
      const h = Math.max((week.count / max) * (height - 28), week.count ? 4 : 2);
      const x = i * (barWidth + gap);
      const y = height - 20 - h;
      return `
        <g>
          <title>Week of ${label(week.start)}: ${week.count} request${week.count === 1 ? "" : "s"}</title>
          <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="5" class="${i === weeks.length - 1 ? "bar-now" : "bar"}" />
          ${week.count ? `<text x="${x + barWidth / 2}" y="${y - 5}" class="bar-value">${week.count}</text>` : ""}
          ${i % 2 === weeks.length % 2 ? "" : `<text x="${x + barWidth / 2}" y="${height - 4}" class="bar-label">${label(week.start)}</text>`}
        </g>`;
    })
    .join("");

  return `
    <svg class="insights-chart" viewBox="0 -12 ${width} ${height + 12}" role="img"
      aria-label="Requests per week for the last ${weeks.length} weeks: ${weeks.map((week) => week.count).join(", ")}">
      ${bars}
    </svg>`;
}

function breakdown(title, rows) {
  const max = Math.max(...rows.map(([, n]) => n), 1);
  return `
    <div class="insights-card">
      <h3>${escapeHtml(title)}</h3>
      ${rows.length
        ? `<ul class="hbar-list">${rows.slice(0, 6).map(([name, n]) => `
            <li>
              <span class="hbar-label">${escapeHtml(name)}</span>
              <span class="hbar-track"><span style="width: ${(n / max) * 100}%"></span></span>
              <span class="hbar-value">${n}</span>
            </li>`).join("")}</ul>`
        : `<p class="req-sub">No requests yet.</p>`}
    </div>`;
}

function renderInsights() {
  const panel = $("#insightsPanel");
  if (!panel) return;
  const data = insightsData();

  const trend = data.prev30
    ? Math.round(((data.last30 - data.prev30) / data.prev30) * 100)
    : null;
  const kpis = [
    { label: "Requests, last 30 days", value: data.last30,
      note: trend === null ? `${data.total} all time` : `${trend >= 0 ? "+" : ""}${trend}% vs. previous 30 days` },
    { label: "Median time to reply", value: formatHours(data.medianResponse), note: "From request to confirm or decline" },
    { label: "Confirmed chats completed", value: data.completionRate === null ? "–" : `${data.completionRate}%`, note: "Of chats that were confirmed" },
    { label: "Average rating", value: data.averageRating === null ? "–" : `${data.averageRating.toFixed(1)} / 5`,
      note: `${data.ratedCount} rating${data.ratedCount === 1 ? "" : "s"} · ${data.rsvpCount} event RSVPs` }
  ];
  const funnelMax = Math.max(data.funnel[0].value, 1);

  panel.innerHTML = `
    <div class="insights-kpis">
      ${kpis.map((kpi) => `
        <div class="insights-kpi">
          <span>${escapeHtml(kpi.label)}</span>
          <strong>${escapeHtml(String(kpi.value))}</strong>
          <small>${escapeHtml(kpi.note)}</small>
        </div>`).join("")}
    </div>

    <div class="insights-grid">
      <div class="insights-card insights-wide">
        <h3>Requests per week</h3>
        ${weeklyChart(data.weeks)}
      </div>
      <div class="insights-card">
        <h3>From request to rating</h3>
        <ol class="funnel">
          ${data.funnel.map((step, i) => `
            <li>
              <span class="funnel-bar" style="width: ${Math.max((step.value / funnelMax) * 100, 6)}%"></span>
              <span class="funnel-label">${step.label}</span>
              <span class="funnel-value">${step.value}${i && data.funnel[0].value ? ` <small>${Math.round((step.value / data.funnel[0].value) * 100)}%</small>` : ""}</span>
            </li>`).join("")}
        </ol>
      </div>
      ${breakdown("By major", data.byMajor)}
      ${breakdown("What students ask for", data.byTopic)}
      ${breakdown("By class year", data.byYear)}
    </div>

    <div class="insights-card">
      <h3>Mentor load</h3>
      <div class="table-scroll">
        <table class="insights-table">
          <thead>
            <tr><th scope="col">Mentor</th><th scope="col">Requests</th><th scope="col">Waiting</th>
              <th scope="col">Completed</th><th scope="col">Median reply</th><th scope="col">Rating</th></tr>
          </thead>
          <tbody>
            ${data.mentorRows.map((row) => `
              <tr>
                <th scope="row">${escapeHtml(row.mentor.name)}${row.mentor.accepting_requests === false ? ` <span class="pill pill-cancelled">Paused</span>` : ""}</th>
                <td>${row.total}</td>
                <td class="${row.pending >= 3 ? "is-warn" : ""}">${row.pending}</td>
                <td>${row.completed}</td>
                <td>${formatHours(row.response)}</td>
                <td>${row.rating === null ? "–" : row.rating.toFixed(1)}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <p class="req-sub">Mentors with three or more waiting requests are highlighted, so you can reassign or nudge them.</p>
    </div>`;
}
