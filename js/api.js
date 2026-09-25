/*
  Data access layer.
  Every read and write the UI makes goes through `api`. There are two
  interchangeable backends with the same methods:

    - supabaseBackend: the real database (Postgres + Row Level Security).
      Used when js/config.js has a Supabase URL and anon key.
    - demoBackend: js/data.js + the browser's localStorage, so the site
      still works with no backend at all.

  The UI never knows which one it is talking to.
*/
const api = (() => {
  const KEYS = {
    bookings: "fvcn.bookings",
    rsvps: "fvcn.rsvps",
    roadmap: "fvcn.roadmap",
    interest: "fvcn.interest"
  };

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable (private mode, blocked cookies). The UI still works for this visit.
    }
  }

  // An error the UI can show as-is. `field` names the form field it belongs to, when there is one.
  class ApiError extends Error {
    constructor(message, field = null) {
      super(message);
      this.field = field;
    }
  }

  // Content that rarely changes stays in code for both backends.
  const staticContent = {
    async getPhotos() {
      return FVCN_DATA.photos;
    },
    async getRoadmap() {
      return FVCN_DATA.roadmap;
    },
    async getGuide(id) {
      return FVCN_DATA.guides[id] || null;
    },
    async getFaqs() {
      return FVCN_DATA.faqs;
    },
    // Checklist progress is personal and low-stakes, so it stays in the browser.
    async getRoadmapProgress() {
      return read(KEYS.roadmap, {});
    },
    async setRoadmapItem(itemId, done) {
      const progress = read(KEYS.roadmap, {});
      if (done) progress[itemId] = true;
      else delete progress[itemId];
      write(KEYS.roadmap, progress);
      return progress;
    }
  };

  /* ------------------------------------------------------------------------
     Demo backend (no server)
     ------------------------------------------------------------------------ */
  function createDemoBackend() {
    const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
    const makeId = (prefix) =>
      `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();

    return {
      mode: "demo",
      ...staticContent,

      async getMajors() {
        return FVCN_DATA.majors;
      },
      async getMentors() {
        return FVCN_DATA.mentors;
      },
      async getResources() {
        return FVCN_DATA.resources;
      },
      async getEvents() {
        return FVCN_DATA.events;
      },
      async getCompanies() {
        return FVCN_DATA.companies;
      },

      async createBooking(input) {
        await wait(700);
        const booking = { ...input, id: makeId("FV"), status: "pending", createdAt: new Date().toISOString() };
        write(KEYS.bookings, [booking, ...read(KEYS.bookings, [])]);
        return booking;
      },
      async listMyBookings() {
        return read(KEYS.bookings, []);
      },
      async cancelBooking(id) {
        await wait(200);
        write(KEYS.bookings, read(KEYS.bookings, []).map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
      },

      async getMyRsvps() {
        return read(KEYS.rsvps, []);
      },
      async getEventCounts() {
        return Object.fromEntries(read(KEYS.rsvps, []).map((id) => [id, 1]));
      },
      async toggleRsvp(eventId) {
        await wait(200);
        const rsvps = read(KEYS.rsvps, []);
        const going = !rsvps.includes(eventId);
        write(KEYS.rsvps, going ? [...rsvps, eventId] : rsvps.filter((id) => id !== eventId));
        return going;
      },

      async submitInterest(input) {
        await wait(600);
        const entry = { id: makeId("INT"), ...input, createdAt: new Date().toISOString() };
        write(KEYS.interest, [entry, ...read(KEYS.interest, [])]);
        return entry;
      }
    };
  }

  /* ------------------------------------------------------------------------
     Supabase backend
     ------------------------------------------------------------------------ */
  function createSupabaseBackend(client) {
    // Tokens returned by create_booking / rsvp_event. They are the student's proof of ownership.
    const TOKEN_KEYS = { bookings: "fvcn.bookingTokens", rsvps: "fvcn.rsvpTokens" };

    function unwrap({ data, error }) {
      if (error) throw new ApiError(error.message || "Something went wrong. Please try again.", error.hint || null);
      return data;
    }

    // Public content falls back to js/data.js if Supabase is unreachable (e.g. a paused free project),
    // so the site never renders empty.
    async function readContent(query, map, fallback) {
      try {
        return unwrap(await query).map(map);
      } catch (error) {
        console.warn("[FVCN] Falling back to built-in content:", error.message);
        return fallback;
      }
    }

    // Event times are stored as timestamps; the UI works in New York local date + time.
    function newYorkParts(iso) {
      const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-CA", {
          timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
          hour: "2-digit", minute: "2-digit", hourCycle: "h23"
        }).formatToParts(new Date(iso)).map((part) => [part.type, part.value])
      );
      return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
    }

    const toMajor = (row) => ({
      id: row.id, name: row.name, shortName: row.short_name || undefined, icon: row.icon,
      summary: row.summary, roles: row.roles, skills: row.skills, timeline: row.timeline
    });
    const toCompany = (row) => ({
      id: row.id, name: row.name, logo: row.logo_url || undefined, icon: row.icon_url || undefined,
      fit: row.logo_fit === "cover" ? "cover" : undefined
    });
    const toMentor = (row) => ({
      id: row.id, name: row.name, majorId: row.major_id, status: row.status, role: row.role,
      companyIds: (row.mentor_companies || []).sort((a, b) => a.sort_order - b.sort_order).map((link) => link.company_id),
      companyLabel: row.company_label || undefined, linkedin: row.linkedin_url || undefined,
      bio: row.bio, helpsWith: row.helps_with, interests: row.interests, photo: row.photo_url || undefined,
      featured: row.featured
    });
    const toResource = (row) => ({
      id: row.id, title: row.title, majorId: row.major_id || "general", type: row.type, level: row.level,
      source: row.source, url: row.url || undefined, guideId: row.guide_id || undefined, description: row.description
    });
    const toEvent = (row) => {
      const start = newYorkParts(row.starts_at);
      return {
        id: row.id, title: row.title, category: row.category, date: start.date, start: start.time,
        end: newYorkParts(row.ends_at).time, location: row.location, description: row.description
      };
    };

    return {
      mode: "supabase",
      ...staticContent,

      getMajors: () => readContent(client.from("majors").select("*").order("sort_order"), toMajor, FVCN_DATA.majors),
      getCompanies: () => readContent(client.from("companies").select("*").order("sort_order"), toCompany, FVCN_DATA.companies),
      getMentors: () => readContent(
        client.from("mentors").select("*, mentor_companies(company_id, sort_order)").eq("is_active", true).order("sort_order"),
        toMentor, FVCN_DATA.mentors),
      getResources: () => readContent(
        client.from("resources").select("*").eq("is_published", true).order("sort_order"), toResource, FVCN_DATA.resources),
      getEvents: () => readContent(
        client.from("events").select("*").eq("is_published", true).order("starts_at"), toEvent, FVCN_DATA.events),

      async createBooking(input) {
        const rows = unwrap(await client.rpc("create_booking", {
          p_name: input.name,
          p_email: input.email,
          p_class_year: input.year,
          p_meeting_type: input.meetingType,
          p_format: input.format,
          p_time_1: new Date(input.time1).toISOString(),
          p_message: input.message,
          p_major_id: input.majorId && input.majorId !== "exploring" ? input.majorId : null,
          p_mentor_id: input.mentorId && input.mentorId !== "any" ? input.mentorId : null,
          p_time_2: input.time2 ? new Date(input.time2).toISOString() : null,
          p_link: input.link || null
        }));
        const created = rows[0];
        write(TOKEN_KEYS.bookings, [{ id: created.reference, token: created.manage_token }, ...read(TOKEN_KEYS.bookings, [])]);
        return { ...input, id: created.reference, status: created.status, createdAt: created.created_at };
      },

      async listMyBookings() {
        const saved = read(TOKEN_KEYS.bookings, []);
        if (!saved.length) return [];
        const rows = unwrap(await client.rpc("get_my_bookings", { p_tokens: saved.map((item) => item.token) }));
        return rows.map((row) => ({
          id: row.reference,
          status: row.status,
          meetingType: row.meeting_type,
          format: row.format,
          time1: row.preferred_time_1,
          time2: row.preferred_time_2,
          confirmedTime: row.confirmed_time,
          mentorName: row.mentor_name || "a matched mentor",
          createdAt: row.created_at
        }));
      },

      async cancelBooking(id) {
        const saved = read(TOKEN_KEYS.bookings, []).find((item) => item.id === id);
        if (!saved) throw new ApiError("We couldn't find that request on this device.");
        unwrap(await client.rpc("cancel_booking", { p_token: saved.token }));
      },

      async getMyRsvps() {
        return read(TOKEN_KEYS.rsvps, []).map((item) => item.eventId);
      },

      async getEventCounts() {
        try {
          const rows = unwrap(await client.rpc("get_event_rsvp_counts"));
          return Object.fromEntries(rows.map((row) => [row.event_id, row.going]));
        } catch {
          return {};
        }
      },

      // person = { name, email }, required to RSVP (not to cancel).
      async toggleRsvp(eventId, person) {
        const saved = read(TOKEN_KEYS.rsvps, []);
        const existing = saved.find((item) => item.eventId === eventId);
        if (existing) {
          unwrap(await client.rpc("cancel_rsvp", { p_token: existing.token }));
          write(TOKEN_KEYS.rsvps, saved.filter((item) => item.eventId !== eventId));
          return false;
        }
        const token = unwrap(await client.rpc("rsvp_event", { p_event_id: eventId, p_name: person.name, p_email: person.email }));
        write(TOKEN_KEYS.rsvps, [...saved, { eventId, token }]);
        return true;
      },

      async submitInterest(input) {
        return unwrap(await client.rpc("submit_interest", {
          p_type: input.type, p_name: input.name, p_email: input.email, p_details: input.details
        }));
      }
    };
  }

  const config = window.FVCN_CONFIG || {};
  const configured = Boolean(config.supabaseUrl && config.supabaseAnonKey);
  if (configured && !window.supabase) {
    console.error("[FVCN] Supabase is configured but supabase-js did not load. Running in demo mode.");
  }

  const client = configured && window.supabase
    ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, { auth: { persistSession: false } })
    : null;
  const backend = client ? createSupabaseBackend(client) : createDemoBackend();

  // While true, the UI tells users that requests are only saved in their browser.
  backend.DEMO_MODE = backend.mode === "demo";
  backend.ApiError = ApiError;
  return backend;
})();
