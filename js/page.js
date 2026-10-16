/* Shared behavior for content pages (Prep kit, Around campus): header, mobile menu, dialogs. */

function setupPageChrome() {
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

  // Dialogs close on a backdrop click or any [data-close-dialog] button.
  $$(".dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });
  document.addEventListener("click", (event) => {
    const close = event.target.closest("[data-close-dialog]");
    if (close) close.closest("dialog").close();
  });

  $("#year").textContent = new Date().getFullYear();
}

// Small wrapper around localStorage for per-browser progress (practiced questions, saved places).
const localStore = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage blocked: progress lasts for this visit only.
    }
  }
};

setupPageChrome();
