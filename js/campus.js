/* Around campus page: places by area and type, with favorites saved in the browser. */

const campus = {
  area: FVCN_CAMPUS.areas[0].id,
  type: "all",
  savedOnly: false,
  saved: new Set(localStore.get("fvcn.savedPlaces", []))
};

const placeId = (place) => place.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");
const mapsUrl = (place) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, ${place.address}`)}`;

function renderAreaTabs() {
  $("#areaTabs").innerHTML = FVCN_CAMPUS.areas
    .map((area) => {
      const selected = area.id === campus.area;
      const photo = FVCN_DATA.photos[area.photo];
      const count = FVCN_CAMPUS.places.filter((place) => place.area === area.id).length;
      return `
        <button type="button" class="area-tab" role="tab" id="area-${area.id}" data-area="${area.id}"
          aria-selected="${selected}" aria-controls="placeGrid" tabindex="${selected ? 0 : -1}">
          <img src="${photo.src}" alt="" loading="lazy" decoding="async" />
          <span class="area-tab-text">
            <small>${escapeHtml(area.place)}</small>
            <strong>${escapeHtml(area.label)}</strong>
            <span>${count} places</span>
          </span>
        </button>`;
    })
    .join("");
  $("#placeGrid").setAttribute("aria-labelledby", `area-${campus.area}`);
}

function renderAreaIntro() {
  const area = FVCN_CAMPUS.areas.find((item) => item.id === campus.area);
  $("#areaIntro").innerHTML = `<h2>${escapeHtml(area.label)}</h2><p>${escapeHtml(area.intro)}</p>`;
}

function renderTypeFilters() {
  const inArea = FVCN_CAMPUS.places.filter((place) => place.area === campus.area);
  const types = Object.keys(FVCN_CAMPUS.types).filter((type) => inArea.some((place) => place.type === type));
  if (campus.type !== "all" && !types.includes(campus.type)) campus.type = "all";
  $("#typeFilters").innerHTML = ["all", ...types]
    .map((type) => {
      const meta = FVCN_CAMPUS.types[type];
      const n = type === "all" ? inArea.length : inArea.filter((place) => place.type === type).length;
      return `
        <button type="button" class="chip" data-type="${type}" aria-pressed="${type === campus.type}">
          ${meta ? icon(meta.icon) : ""}${meta ? escapeHtml(meta.label) : "All"} <span class="count">${n}</span>
        </button>`;
    })
    .join("");
}

function renderPlaces() {
  const list = FVCN_CAMPUS.places.filter((place) =>
    place.area === campus.area &&
    (campus.type === "all" || place.type === campus.type) &&
    (!campus.savedOnly || campus.saved.has(placeId(place))));

  $("#savedCount").textContent = campus.saved.size ? `(${campus.saved.size})` : "";

  if (!list.length) {
    $("#placeGrid").innerHTML = `
      <div class="empty-state">
        <h3>${campus.savedOnly ? "No saved places here yet" : "Nothing here yet"}</h3>
        <p>${campus.savedOnly ? "Tap the heart on a place to save it for later." : "Try another filter."}</p>
      </div>`;
    return;
  }

  $("#placeGrid").innerHTML = list
    .map((place, index) => {
      const id = placeId(place);
      const saved = campus.saved.has(id);
      const type = FVCN_CAMPUS.types[place.type];
      return `
        <article class="place-card" style="animation-delay: ${index * 30}ms">
          <div class="place-top">
            <span class="place-icon" aria-hidden="true">${icon(type.icon)}</span>
            <button type="button" class="place-save ${saved ? "is-saved" : ""}" data-save="${id}" aria-pressed="${saved}"
              aria-label="${saved ? "Remove" : "Save"} ${escapeHtml(place.name)}">${icon("heart")}</button>
          </div>
          <h3>${escapeHtml(place.name)}</h3>
          <span class="tag">${escapeHtml(type.label)}</span>
          <p>${escapeHtml(place.note)}</p>
          <a class="place-map" href="${mapsUrl(place)}" target="_blank" rel="noopener noreferrer">
            ${icon("pin")}<span>${escapeHtml(place.address)}</span>
            <span class="sr-only">(opens Google Maps in a new tab)</span>
          </a>
        </article>`;
    })
    .join("");
}

function renderGettingAround() {
  $("#aroundGrid").innerHTML = FVCN_CAMPUS.gettingAround
    .map((item) => `
      <article class="around-card">
        <span class="around-icon" aria-hidden="true">${icon(item.icon)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.body)}</p>
      </article>`)
    .join("");
}

function renderHeroLinks() {
  $("#areaLinks").innerHTML = FVCN_CAMPUS.areas
    .map((area) => `<a href="#places" data-area-link="${area.id}">${icon(area.id === "vietnamese" ? "bowl" : "pin")}${escapeHtml(area.label)}</a>`)
    .join("") + `<a href="#getting-around">${icon("train")}Getting around</a>`;
}

function renderPhotoCredits() {
  const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`;
  $("#photoCredits").innerHTML = FVCN_CAMPUS.areas
    .map((area) => FVCN_DATA.photos[area.photo])
    .map((photo) => `<li>${escapeHtml(photo.caption)}: ${link(photo.source, "photo")} by ${escapeHtml(photo.author)}, ${link(photo.licenseUrl, photo.license)}</li>`)
    .join("");
}

function selectArea(id) {
  campus.area = id;
  renderAreaTabs();
  renderAreaIntro();
  renderTypeFilters();
  renderPlaces();
  history.replaceState(null, "", `?area=${id}#places`);
}

function setupCampus() {
  const linked = new URLSearchParams(window.location.search).get("area");
  if (FVCN_CAMPUS.areas.some((area) => area.id === linked)) campus.area = linked;

  renderHeroLinks();
  renderAreaTabs();
  renderAreaIntro();
  renderTypeFilters();
  renderPlaces();
  renderGettingAround();
  renderPhotoCredits();

  $("#areaTabs").addEventListener("click", (event) => {
    const tab = event.target.closest("[data-area]");
    if (tab) selectArea(tab.dataset.area);
  });
  // Arrow keys move between area tabs.
  $("#areaTabs").addEventListener("keydown", (event) => {
    const ids = FVCN_CAMPUS.areas.map((area) => area.id);
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = ids[(ids.indexOf(campus.area) + step + ids.length) % ids.length];
    selectArea(next);
    $(`#area-${next}`).focus();
  });
  $("#areaLinks").addEventListener("click", (event) => {
    const link = event.target.closest("[data-area-link]");
    if (link) selectArea(link.dataset.areaLink);
  });

  $("#typeFilters").addEventListener("click", (event) => {
    const chip = event.target.closest("[data-type]");
    if (!chip) return;
    campus.type = chip.dataset.type;
    renderTypeFilters();
    renderPlaces();
  });

  $("#savedOnly").addEventListener("change", (event) => {
    campus.savedOnly = event.target.checked;
    renderPlaces();
  });

  $("#placeGrid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-save]");
    if (!button) return;
    const id = button.dataset.save;
    if (campus.saved.has(id)) campus.saved.delete(id);
    else campus.saved.add(id);
    localStore.set("fvcn.savedPlaces", [...campus.saved]);
    if (campus.savedOnly) {
      renderPlaces();
    } else {
      const saved = campus.saved.has(id);
      button.classList.toggle("is-saved", saved);
      button.setAttribute("aria-pressed", saved);
      button.setAttribute("aria-label", button.getAttribute("aria-label").replace(/^(Save|Remove)/, saved ? "Remove" : "Save"));
      $("#savedCount").textContent = campus.saved.size ? `(${campus.saved.size})` : "";
    }
    toast(campus.saved.has(id) ? "Saved to your list." : "Removed from your list.");
  });
}

setupCampus();

// Links from site search: ?area=<area id>
window.addEventListener("fvcn:route", () => {
  const area = new URLSearchParams(window.location.search).get("area");
  if (FVCN_CAMPUS.areas.some((item) => item.id === area)) selectArea(area);
});
