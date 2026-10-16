/*
  Site content and markup checks. Run with: node --test tests/
  - Content files (js/data.js, js/prep-data.js, js/campus-data.js) are internally consistent.
  - Every page only references files that exist, anchors that exist, and icons in its sprite.
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");
// Page markup without HTML comments (which hold usage examples, not real references).
const readPage = (path) => read(path).replace(/<!--[\s\S]*?-->/g, "");

// The content files declare top-level consts; evaluate them together and return the values.
function loadContent() {
  const context = vm.createContext({});
  const source = ["js/data.js", "js/prep-data.js", "js/campus-data.js"].map(read).join("\n");
  vm.runInContext(`${source}\n;globalThis.__content = { FVCN_DATA, FVCN_PREP, FVCN_CAMPUS };`, context);
  return context.__content;
}

const { FVCN_DATA: data, FVCN_PREP: prep, FVCN_CAMPUS: campus } = loadContent();
const majorIds = new Set(data.majors.map((major) => major.id));

const unique = (list, label) => {
  const seen = new Set();
  for (const id of list) {
    assert.ok(!seen.has(id), `duplicate ${label}: ${id}`);
    seen.add(id);
  }
};

/* ------------------------------------------------------------------------
   js/data.js
   ------------------------------------------------------------------------ */
test("mentors reference real majors and companies", () => {
  const companyIds = new Set(data.companies.map((company) => company.id));
  unique(data.mentors.map((mentor) => mentor.id), "mentor id");
  for (const mentor of data.mentors) {
    assert.ok(majorIds.has(mentor.majorId), `${mentor.id}: unknown major ${mentor.majorId}`);
    assert.ok(["incoming", "current", "former"].includes(mentor.status), `${mentor.id}: bad status ${mentor.status}`);
    for (const id of mentor.companyIds || []) assert.ok(companyIds.has(id), `${mentor.id}: unknown company ${id}`);
    assert.ok((mentor.companyIds || []).length || mentor.companyLabel, `${mentor.id}: needs a company`);
    if (mentor.linkedin) assert.match(mentor.linkedin, /^https:\/\/(www\.)?linkedin\.com\//);
  }
});

test("resources link to a URL or an existing guide", () => {
  unique(data.resources.map((resource) => resource.id), "resource id");
  for (const resource of data.resources) {
    assert.ok(resource.majorId === "general" || majorIds.has(resource.majorId), `${resource.id}: unknown major`);
    if (resource.url) assert.match(resource.url, /^https:\/\//, `${resource.id}: links must use https`);
    if (resource.guideId) assert.ok(data.guides[resource.guideId], `${resource.id}: missing guide ${resource.guideId}`);
  }
});

test("guides are complete and their booking shortcut points at a real major", () => {
  for (const [id, guide] of Object.entries(data.guides)) {
    assert.ok(guide.title && guide.intro, `${id}: title and intro`);
    assert.ok(guide.sections.length > 0, `${id}: sections`);
    for (const section of guide.sections) assert.ok(section.items.length > 0, `${id}: empty section ${section.heading}`);
    if (guide.cta?.majorId) assert.ok(majorIds.has(guide.cta.majorId), `${id}: unknown CTA major`);
  }
});

test("events have valid dates and times", () => {
  unique(data.events.map((event) => event.id), "event id");
  for (const event of data.events) {
    assert.match(event.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(event.start, /^\d{2}:\d{2}$/);
    assert.match(event.end, /^\d{2}:\d{2}$/);
    assert.ok(event.end > event.start, `${event.id}: ends before it starts`);
  }
});

test("every quiz answer scores real majors, and every major can win", () => {
  const reachable = new Set();
  for (const question of data.quiz) {
    assert.ok(question.options.length >= 2, `quiz question needs options: ${question.q}`);
    for (const option of question.options) {
      for (const [id, points] of Object.entries(option.scores)) {
        assert.ok(majorIds.has(id), `quiz: unknown major ${id}`);
        assert.ok(points > 0);
        reachable.add(id);
      }
    }
  }
  for (const id of majorIds) assert.ok(reachable.has(id), `quiz never scores ${id}`);
});

/* ------------------------------------------------------------------------
   js/prep-data.js
   ------------------------------------------------------------------------ */
test("interview questions belong to known tracks", () => {
  const trackIds = new Set(prep.tracks.map((track) => track.id));
  unique(prep.questions.map((question) => question.id), "question id");
  for (const question of prep.questions) {
    assert.ok(trackIds.has(question.track), `${question.id}: unknown track`);
    assert.ok(question.tip && question.points.length >= 2, `${question.id}: needs a tip and points`);
  }
  for (const track of prep.tracks) {
    if (track.id !== "behavioral") assert.ok(majorIds.has(track.id), `track ${track.id} should match a major id`);
    assert.ok(prep.questions.some((question) => question.track === track.id), `track ${track.id} has no questions`);
  }
});

test("calendar phases stay inside one academic year (August to July)", () => {
  const monthIndex = (month) => (month - 8 + 12) % 12;
  const years = new Set(["freshman", "sophomore", "junior", "senior"]);
  for (const track of prep.calendar) {
    assert.ok(majorIds.has(track.majorId), `${track.id}: unknown major`);
    for (const phase of track.phases) {
      const where = `${track.id} / ${phase.title}`;
      assert.ok(years.has(phase.year), `${where}: bad year`);
      assert.ok(prep.calendarKinds[phase.kind], `${where}: bad kind`);
      assert.ok(phase.from >= 1 && phase.from <= 12 && phase.to >= 1 && phase.to <= 12, `${where}: bad month`);
      assert.ok(monthIndex(phase.from) <= monthIndex(phase.to), `${where}: wraps past July`);
    }
    for (const year of years) assert.ok(track.phases.some((phase) => phase.year === year), `${track.id}: nothing for ${year}`);
  }
});

test("message templates only use fields they ask for", () => {
  unique(prep.templates.map((template) => template.id), "template id");
  for (const template of prep.templates) {
    const used = new Set([...`${template.subject || ""} ${template.body}`.matchAll(/\{(\w+)\}/g)].map(([, key]) => key));
    for (const key of used) {
      assert.ok(prep.templateFields[key], `${template.id}: undefined field {${key}}`);
      assert.ok(template.fields.includes(key), `${template.id}: {${key}} is used but not in its form`);
    }
    for (const key of template.fields) assert.ok(used.has(key), `${template.id}: asks for ${key} but never uses it`);
  }
});

test("the LinkedIn note fits its limit with typical answers", () => {
  const note = prep.templates.find((template) => template.limit);
  const filled = note.body.replace(/\{(\w+)\}/g, (_, key) => prep.templateFields[key].placeholder);
  assert.ok(filled.length <= note.limit, `example note is ${filled.length} characters`);
});

test("glossary terms are unique", () => {
  unique(prep.glossary.map((item) => item.term.toLowerCase()), "glossary term");
  for (const item of prep.glossary) assert.ok(item.def.length > 20, `${item.term}: definition too short`);
});

/* ------------------------------------------------------------------------
   js/campus-data.js
   ------------------------------------------------------------------------ */
test("places belong to known areas and types, and area photos exist", () => {
  const areaIds = new Set(campus.areas.map((area) => area.id));
  unique(campus.places.map((place) => place.name), "place name");
  for (const area of campus.areas) {
    assert.ok(data.photos[area.photo], `${area.id}: unknown photo ${area.photo}`);
    assert.ok(campus.places.some((place) => place.area === area.id), `${area.id}: no places`);
  }
  for (const place of campus.places) {
    assert.ok(areaIds.has(place.area), `${place.name}: unknown area`);
    assert.ok(campus.types[place.type], `${place.name}: unknown type`);
    assert.ok(place.address && place.note, `${place.name}: needs an address and a note`);
  }
});

/* ------------------------------------------------------------------------
   Pages
   ------------------------------------------------------------------------ */
const PAGES = ["index.html", "prep.html", "campus.html", "request.html", "dashboard.html", "privacy.html", "404.html"];

test("pages only reference local files that exist", () => {
  for (const page of PAGES) {
    const html = readPage(page);
    const refs = [...html.matchAll(/(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g)]
      .map(([, path]) => path)
      // Root-relative paths (used by 404.html, which GitHub Pages serves from any URL) start with the site's base path.
      .map((path) => path.replace(/^\/Fordham_Vietnamese_Career_Network\//, ""))
      .filter((path) => !/^(https?:|mailto:|data:|\/\/)/.test(path) && path !== "");
    for (const ref of refs) assert.ok(existsSync(join(root, ref)), `${page}: missing file ${ref}`);
  }
});

test("in-page anchors point at elements that exist", () => {
  for (const page of PAGES) {
    const html = readPage(page);
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id));
    for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(id), `${page}: #${id} not found`);
  }
});

test("links to other pages' sections point at elements that exist", () => {
  for (const page of PAGES) {
    for (const [, target, id] of readPage(page).matchAll(/href="([a-z0-9-]+\.html)(?:\?[^"#]*)?#([^"]+)"/g)) {
      assert.ok(readPage(target).includes(`id="${id}"`), `${page}: ${target}#${id} not found`);
    }
  }
});

test("every icon a page uses is in its sprite", () => {
  const scriptsFor = (html) => [...html.matchAll(/<script src="(js\/[^"]+)"/g)].map(([, src]) => read(src)).join("\n");
  for (const page of PAGES) {
    const html = readPage(page);
    const sprite = new Set([...html.matchAll(/<symbol id="i-([\w-]+)"/g)].map(([, name]) => name));
    if (!sprite.size) continue;
    const js = scriptsFor(html);
    const used = new Set([
      ...[...html.matchAll(/href="#i-([\w-]+)"/g)].map(([, name]) => name),
      ...[...js.matchAll(/\bicon\("([\w-]+)"\)/g)].map(([, name]) => name)
    ]);
    // Icons named in content data (majors, tracks, places, templates).
    if (/js\/main\.js|js\/search\.js/.test(html)) data.majors.forEach((major) => used.add(major.icon));
    if (html.includes("js/prep.js")) {
      prep.tracks.forEach((track) => used.add(track.icon));
      prep.templates.forEach((template) => used.add(template.icon));
    }
    if (html.includes("js/campus.js")) {
      Object.values(campus.types).forEach((type) => used.add(type.icon));
      campus.gettingAround.forEach((item) => used.add(item.icon));
    }
    for (const name of used) assert.ok(sprite.has(name), `${page}: icon "${name}" is not in the sprite`);
  }
});
