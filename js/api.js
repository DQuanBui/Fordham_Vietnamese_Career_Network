/*
  Data access layer.
  Every read and write the UI makes goes through this object. Today it is
  backed by js/data.js and the browser's localStorage. When the backend is
  ready, replace each function body with a fetch() call to the matching
  endpoint (listed above each function). The UI code won't need to change,
  because every function already returns a Promise.
*/
const api = (() => {
  // While true, the UI tells users that requests are saved on this device only.
  const DEMO_MODE = true;

  const KEYS = {
    bookings: "fvcn.bookings",
    rsvps: "fvcn.rsvps",
    roadmap: "fvcn.roadmap",
    interest: "fvcn.interest"
  };

  // Simulates network latency so loading states behave like they will in production.
  const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

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

  const makeId = (prefix) =>
    `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();

  return {
    DEMO_MODE,

    // GET /api/majors
    async getMajors() {
      return FVCN_DATA.majors;
    },

    // GET /api/mentors
    async getMentors() {
      return FVCN_DATA.mentors;
    },

    // GET /api/resources
    async getResources() {
      return FVCN_DATA.resources;
    },

    // GET /api/events?upcoming=true
    async getEvents() {
      return FVCN_DATA.events;
    },

    // GET /api/companies
    async getCompanies() {
      return FVCN_DATA.companies;
    },

    // GET /api/roadmap
    async getRoadmap() {
      return FVCN_DATA.roadmap;
    },

    // GET /api/guides/:id
    async getGuide(id) {
      return FVCN_DATA.guides[id] || null;
    },

    // GET /api/faqs
    async getFaqs() {
      return FVCN_DATA.faqs;
    },

    // POST /api/bookings
    async createBooking(input) {
      await wait(700);
      const booking = {
        id: makeId("REQ"),
        ...input,
        status: "pending",
        createdAt: new Date().toISOString()
      };
      write(KEYS.bookings, [booking, ...read(KEYS.bookings, [])]);
      return booking;
    },

    // GET /api/bookings/mine
    async listMyBookings() {
      return read(KEYS.bookings, []);
    },

    // PATCH /api/bookings/:id  { status: "cancelled" }
    async cancelBooking(id) {
      await wait(200);
      const bookings = read(KEYS.bookings, []).map((booking) =>
        booking.id === id ? { ...booking, status: "cancelled" } : booking
      );
      write(KEYS.bookings, bookings);
    },

    // GET /api/rsvps/mine
    async getMyRsvps() {
      return read(KEYS.rsvps, []);
    },

    // POST or DELETE /api/events/:id/rsvp
    async toggleRsvp(eventId) {
      await wait(200);
      const rsvps = read(KEYS.rsvps, []);
      const going = !rsvps.includes(eventId);
      write(KEYS.rsvps, going ? [...rsvps, eventId] : rsvps.filter((id) => id !== eventId));
      return going;
    },

    // GET /api/roadmap/progress
    async getRoadmapProgress() {
      return read(KEYS.roadmap, {});
    },

    // PUT /api/roadmap/progress/:itemId
    async setRoadmapItem(itemId, done) {
      const progress = read(KEYS.roadmap, {});
      if (done) progress[itemId] = true;
      else delete progress[itemId];
      write(KEYS.roadmap, progress);
      return progress;
    },

    // POST /api/interest  (mentor applications, resource suggestions, event ideas)
    async submitInterest(input) {
      await wait(600);
      const entry = { id: makeId("INT"), ...input, createdAt: new Date().toISOString() };
      write(KEYS.interest, [entry, ...read(KEYS.interest, [])]);
      return entry;
    }
  };
})();
