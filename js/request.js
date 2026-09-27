/*
  Private status page for one coffee chat request: request.html#<manage-token>.
  The token lives in the URL fragment, so it is never sent to web servers or analytics.
*/

const token = decodeURIComponent(window.location.hash.slice(1)).trim();
const card = $("#statusCard");

const STEPS = ["Request sent", "Time confirmed", "Chat completed"];
const STEP_INDEX = { pending: 1, confirmed: 2, completed: 3 };
const CHAT_MINUTES = 30;

let booking = null;

const compact = (date) => date.toISOString().replace(/[-:]|\.\d{3}/g, "");

function calendarDetails() {
  const start = new Date(booking.confirmedTime);
  const end = new Date(start.getTime() + CHAT_MINUTES * 60000);
  const title = `FVCN ${booking.meetingType.toLowerCase()} with ${booking.mentorName}`;
  const details = [
    `${booking.meetingType} (${booking.format}) booked through FVCN.`,
    booking.staffNote ? `Note from your mentor: ${booking.staffNote}` : "",
    `Request status: ${api.statusUrl(token)}`
  ].filter(Boolean).join("\n\n");
  return { start, end, title, details };
}

function googleCalendarUrl() {
  const { start, end, title, details } = calendarDetails();
  const params = new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${compact(start)}/${compact(end)}`, details });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function downloadCalendarFile() {
  const { start, end, title, details } = calendarDetails();
  const text = (value) => value.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//FVCN//Coffee chats//EN", "BEGIN:VEVENT",
    `UID:${booking.id}@fvcn`, `DTSTAMP:${compact(new Date())}`, `DTSTART:${compact(start)}`, `DTEND:${compact(end)}`,
    `SUMMARY:${text(title)}`, `DESCRIPTION:${text(details)}`, "END:VEVENT", "END:VCALENDAR"
  ];
  downloadFile(`fvcn-${booking.id}.ics`, lines.join("\r\n"), "text/calendar");
}

function headline() {
  const first = booking.mentorName.split(" ")[0];
  switch (booking.status) {
    case "pending":
      return {
        title: `Waiting for ${booking.mentorName === "a matched mentor" ? "a mentor" : first} to confirm`,
        text: "Mentors usually reply within a few days. This page updates as soon as your chat is confirmed."
      };
    case "confirmed":
      return { title: "You're confirmed!", text: `Your ${booking.meetingType.toLowerCase()} with ${booking.mentorName} is set.` };
    case "completed":
      return { title: "Chat completed", text: "Thanks for using FVCN. We hope it helped." };
    case "declined":
      return {
        title: `${booking.mentorName} can't take this request`,
        text: "It happens, since mentors are busy students too. Pick another mentor, or choose \"No preference\" and we'll match you."
      };
    default:
      return { title: "Request cancelled", text: "You cancelled this request. You can book a new chat any time." };
  }
}

function progressHtml() {
  const reached = STEP_INDEX[booking.status];
  if (!reached) return "";
  return `
    <ol class="status-steps" aria-label="Progress">
      ${STEPS.map((label, i) => {
        const state = i < reached ? "is-done" : i === reached ? "is-current" : "";
        return `<li class="${state}"><span class="status-step-dot">${i < reached ? icon("check") : i + 1}</span>${label}</li>`;
      }).join("")}
    </ol>`;
}

function render() {
  const { title, text } = headline();
  const open = booking.status === "pending" || booking.status === "confirmed";
  const rows = [
    ["Reference", booking.id],
    ["Mentor", booking.mentorName],
    ["Topic", `${booking.meetingType} · ${booking.format}`],
    booking.confirmedTime
      ? ["Meeting time", formatDateTime(booking.confirmedTime)]
      : ["Requested times", [booking.time1, booking.time2].filter(Boolean).map(formatDateTime).join(" or ")]
  ];

  card.innerHTML = `
    <div class="status-head">
      <span class="pill pill-${booking.status}">${escapeHtml(booking.status)}</span>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(text)}</p>
    </div>

    ${progressHtml()}

    ${booking.status === "confirmed" && booking.confirmedTime ? `
      <div class="status-when">
        ${icon("calendar")}
        <div>
          <strong>${escapeHtml(formatDateTime(booking.confirmedTime))}</strong>
          <span>${escapeHtml(booking.format)} · about ${CHAT_MINUTES} minutes</span>
        </div>
      </div>` : ""}

    ${booking.staffNote && (booking.status === "confirmed" || booking.status === "declined") ? `
      <div class="status-note">
        <span class="req-label">Note from your mentor</span>
        <p>${escapeHtml(booking.staffNote)}</p>
      </div>` : ""}

    <dl class="success-summary">
      ${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
    </dl>

    <div class="status-actions">
      ${booking.status === "confirmed" && booking.confirmedTime ? `
        <a class="btn btn-primary" href="${googleCalendarUrl()}" target="_blank" rel="noopener noreferrer">${icon("calendar-plus")}Add to Google Calendar</a>
        <button type="button" class="btn btn-secondary" data-ics>${icon("calendar")}Download .ics</button>` : ""}
      ${booking.status === "declined" || booking.status === "cancelled" ? `
        <a class="btn btn-primary" href="index.html#mentors">Book another chat ${icon("arrow-right")}</a>` : ""}
      ${booking.status === "pending" || booking.status === "confirmed" ? `
        <a class="btn btn-secondary" href="index.html#booking">First chat? Read the playbook</a>` : ""}
      ${open ? `<button type="button" class="btn btn-ghost btn-danger" data-cancel>Cancel request</button>` : ""}
    </div>

    <div id="feedbackSlot"></div>

    <div class="status-private">
      ${icon("lock")}
      <p><strong>This is your private link.</strong> Bookmark it to check this request from any device.
        Anyone with the link can see or cancel it, so don't share it publicly.</p>
      <button type="button" class="btn btn-secondary btn-sm" data-copy-link>${icon("copy")}Copy link</button>
    </div>`;

  if (typeof renderFeedback === "function") renderFeedback();
}

function renderNotFound(message) {
  card.innerHTML = `
    <div class="status-head">
      <span class="dash-icon">${icon("lock")}</span>
      <h1>We couldn't find that request</h1>
      <p>${escapeHtml(message || "The link may be incomplete. Open the full link from your confirmation, or check \"Your requests\" on the FVCN site in the browser you booked from.")}</p>
    </div>
    <div class="status-actions">
      <a class="btn btn-primary" href="index.html#booking">Go to booking ${icon("arrow-right")}</a>
    </div>`;
}

async function load() {
  if (!token) {
    renderNotFound();
    return;
  }
  try {
    booking = await api.getBookingByToken(token);
    if (booking) render();
    else renderNotFound();
  } catch (error) {
    renderNotFound(error.message);
  }
}

card.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-ics], [data-cancel], [data-copy-link]");
  if (!target) return;

  if ("ics" in target.dataset) {
    downloadCalendarFile();
  } else if ("copyLink" in target.dataset) {
    toast((await copyText(api.statusUrl(token))) ? "Link copied." : "Copy the link from your browser's address bar.");
  } else if ("cancel" in target.dataset) {
    if (!confirm("Cancel this request? Your mentor will see it as cancelled.")) return;
    try {
      await api.cancelBookingByToken(token);
      toast("Request cancelled.");
      await load();
    } catch (error) {
      toast(error.message, "error");
    }
  }
});

window.addEventListener("hashchange", () => window.location.reload());
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && booking) load();
});

load();
