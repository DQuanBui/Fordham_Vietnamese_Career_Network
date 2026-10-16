/*
  Site-wide search (Ctrl+K, "/", or the search button in the header).
  Searches mentors, career paths, guides, resources, events, FAQs, interview questions,
  glossary terms, and places. Content files a page doesn't already load are fetched the
  first time search opens.
*/
const siteSearch = (() => {
  const page = window.location.pathname.split("/").pop() || "index.html";
  // Content files declare top-level consts: global bindings, but not window properties.
  const DATA_FILES = {
    FVCN_DATA: { src: "js/data.js", get: () => (typeof FVCN_DATA !== "undefined" ? FVCN_DATA : null) },
    FVCN_PREP: { src: "js/prep-data.js", get: () => (typeof FVCN_PREP !== "undefined" ? FVCN_PREP : null) },
    FVCN_CAMPUS: { src: "js/campus-data.js", get: () => (typeof FVCN_CAMPUS !== "undefined" ? FVCN_CAMPUS : null) }
  };
  const MAX_RESULTS = 8;
  let entries = null;
  let results = [];
  let active = 0;

  function loadScript(src) {
    return new Promise((resolve) => {
      const script = Object.assign(document.createElement("script"), { src });
      script.onload = resolve;
      script.onerror = resolve; // Search still works with whatever loaded.
      document.head.appendChild(script);
    });
  }

  async function ensureData() {
    await Promise.all(Object.values(DATA_FILES).filter((file) => !file.get()).map((file) => loadScript(file.src)));
  }

  /* ------------------------------------------------------------------------
     Index
     ------------------------------------------------------------------------ */
  function buildIndex() {
    const list = [];
    const add = (kind, title, subtitle, url, keywords = "") =>
      list.push({ kind, title, subtitle, url, haystack: normalize(`${title} ${subtitle} ${keywords}`), titleWords: normalize(title) });

    // Pages and sections
    add("Page", "Book a coffee chat", "Request a chat with a mentor", "index.html#booking", "booking request meet mentor");
    add("Page", "Find your path quiz", "Five questions to find a major that fits", "index.html?quiz=1#paths", "quiz undecided major exploring");
    add("Page", "4-year roadmap", "What to do each year at Fordham", "index.html#roadmap", "checklist freshman sophomore junior senior");
    add("Page", "Interview question bank", "Prep kit", "prep.html#questions", "practice interview behavioral technical");
    add("Page", "Recruiting calendar", "Prep kit", "prep.html#calendar", "timeline deadlines when apply months");
    add("Page", "Message templates", "Prep kit", "prep.html#templates", "email linkedin networking thank you follow up referral");
    add("Page", "International students", "Prep kit", "prep.html#international", "visa f-1 cpt opt sponsorship h-1b");
    add("Page", "Around campus", "Food, coffee, and study spots", "campus.html", "eat restaurant cafe study");

    const data = DATA_FILES.FVCN_DATA.get();
    if (data) {
      const companyName = Object.fromEntries(data.companies.map((company) => [company.id, company.name]));
      const majorName = Object.fromEntries(data.majors.map((major) => [major.id, major.name]));

      data.majors.forEach((major) =>
        add("Career path", major.name, major.summary, `index.html?path=${major.id}#paths`, [...major.roles, ...major.skills].join(" ")));
      data.mentors.forEach((mentor) => {
        const companies = (mentor.companyIds || []).map((id) => companyName[id]).filter(Boolean).join(" & ") || mentor.companyLabel || "";
        add("Mentor", mentor.name, [companies, mentor.role].filter(Boolean).join(" · "), `index.html?profile=${mentor.id}#mentors`,
          [majorName[mentor.majorId], mentor.bio, ...(mentor.helpsWith || []), ...(mentor.interests || [])].join(" "));
      });
      Object.entries(data.guides).forEach(([id, guide]) =>
        add("Guide", guide.title, "FVCN guide", `index.html?guide=${id}#resources`, guide.intro));
      data.resources
        .filter((resource) => resource.url)
        .forEach((resource) => add("Resource", resource.title, `${resource.type} · ${resource.source}`, resource.url, resource.description));
      data.events.forEach((event) => add("Event", event.title, event.date, "index.html#events", `${event.category} ${event.description}`));
      data.faqs.forEach((faq) => add("FAQ", faq.q, "Frequently asked", "index.html#faq", faq.a));
    }

    const prep = DATA_FILES.FVCN_PREP.get();
    if (prep) {
      const trackLabel = Object.fromEntries(prep.tracks.map((track) => [track.id, track.label]));
      prep.questions.forEach((question) =>
        add("Interview question", question.q, `${trackLabel[question.track]} · ${question.type}`, `prep.html?q=${question.id}#questions`, question.tip));
      prep.glossary.forEach((item) =>
        add("Glossary", item.term, item.def, `prep.html?glossary=${encodeURIComponent(item.term)}#glossary`, item.category));
    }

    const campus = DATA_FILES.FVCN_CAMPUS.get();
    if (campus) {
      const areaLabel = Object.fromEntries(campus.areas.map((area) => [area.id, area.label]));
      campus.places.forEach((place) =>
        add("Place", place.name, `${areaLabel[place.area]} · ${place.address}`, `campus.html?area=${place.area}#places`, place.note));
    }
    return list;
  }

  // Lowercase, strip Vietnamese diacritics ("phở" → "pho"), and pad words with spaces
  // so a query only matches the start of a word ("pho" finds phở, not sophomore).
  function normalize(text) {
    return ` ${text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, " ")} `;
  }

  // Every word must start a word somewhere; title matches rank first.
  function search(query) {
    const words = normalize(query).trim().split(" ").filter(Boolean);
    if (!words.length) return entries.filter((entry) => entry.kind === "Page");
    return entries
      .map((entry) => {
        if (!words.every((word) => entry.haystack.includes(` ${word}`))) return null;
        let score = 0;
        words.forEach((word) => {
          if (entry.titleWords.startsWith(` ${word}`)) score += 6;
          else if (entry.titleWords.includes(` ${word}`)) score += 3;
          else score += 1;
        });
        if (entry.kind === "Mentor" || entry.kind === "Career path") score += 1;
        return { ...entry, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS);
  }

  /* ------------------------------------------------------------------------
     UI
     ------------------------------------------------------------------------ */
  function mount() {
    if ($("#searchDialog")) return;
    document.body.insertAdjacentHTML("beforeend", `
      <dialog class="search-dialog" id="searchDialog" aria-label="Search FVCN">
        <div class="search-box">
          <svg class="icon" aria-hidden="true"><use href="#i-search"></use></svg>
          <input type="search" id="searchInput" placeholder="Search mentors, guides, questions, places…" autocomplete="off"
            role="combobox" aria-expanded="true" aria-controls="searchResults" aria-autocomplete="list" />
          <kbd>Esc</kbd>
        </div>
        <ul class="search-results" id="searchResults" role="listbox" aria-label="Results"></ul>
        <p class="search-hint"><kbd>↑</kbd><kbd>↓</kbd> to move · <kbd>Enter</kbd> to open · <kbd>Ctrl</kbd> <kbd>K</kbd> anywhere</p>
      </dialog>`);

    const dialog = $("#searchDialog");
    const input = $("#searchInput");
    input.addEventListener("input", () => render(input.value));
    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!results.length) return;
        active = (active + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length;
        highlight();
      } else if (event.key === "Enter" && results[active]) {
        event.preventDefault();
        go(results[active].url);
      }
    });
    $("#searchResults").addEventListener("click", (event) => {
      const item = event.target.closest("[data-url]");
      if (item) go(item.dataset.url);
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  function render(query) {
    results = search(query);
    active = 0;
    const list = $("#searchResults");
    list.innerHTML = results.length
      ? results
        .map((entry, index) => `
          <li class="search-result" role="option" id="sr-${index}" data-url="${escapeHtml(entry.url)}" aria-selected="${index === 0}">
            <span class="search-kind">${escapeHtml(entry.kind)}</span>
            <span class="search-text"><strong>${escapeHtml(entry.title)}</strong><small>${escapeHtml(entry.subtitle)}</small></span>
            ${icon(/^https?:/.test(entry.url) ? "external" : "arrow-right")}
          </li>`)
        .join("")
      : `<li class="search-empty">No results for "${escapeHtml(query)}". Try a company, a major, or a term like "superday".</li>`;
    highlight();
  }

  function highlight() {
    $$(".search-result").forEach((item, index) => item.setAttribute("aria-selected", index === active));
    const current = $(`#sr-${active}`);
    $("#searchInput").setAttribute("aria-activedescendant", current ? current.id : "");
    current?.scrollIntoView({ block: "nearest" });
  }

  // Same page: update the URL and let the page react. Other pages and external links: navigate.
  function go(url) {
    $("#searchDialog").close();
    const target = new URL(url, window.location.href);
    if (target.origin !== window.location.origin) {
      window.open(target.href, "_blank", "noopener");
      return;
    }
    const targetPage = target.pathname.split("/").pop() || "index.html";
    if (targetPage === page) {
      history.pushState(null, "", target.search + target.hash);
      window.dispatchEvent(new CustomEvent("fvcn:route"));
      document.getElementById(target.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.href = target.href;
    }
  }

  async function open() {
    mount();
    const dialog = $("#searchDialog");
    if (dialog.open) return;
    dialog.showModal();
    const input = $("#searchInput");
    input.value = "";
    if (!entries) {
      $("#searchResults").innerHTML = `<li class="search-empty">Loading…</li>`;
      await ensureData();
      entries = buildIndex();
    }
    render(input.value);
    input.focus();
  }

  document.addEventListener("keydown", (event) => {
    const typing = event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable]");
    if ((event.key === "k" || event.key === "K") && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      open();
    } else if (event.key === "/" && !typing && !document.querySelector("dialog[open]")) {
      event.preventDefault();
      open();
    }
  });
  document.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("[data-open-search]")) open();
  });

  return { open };
})();
