/* Tests for the data and the planner. Run with: node --test */
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

/* Load the browser scripts into an isolated global, the way the page does. */
function load() {
  const context = vm.createContext({});
  for (const file of ["js/data.js", "js/planner.js"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
  }
  return context;
}

const { WITCHER_DATA: DATA, WitcherPlanner } = load();
const { Planner, matches } = WitcherPlanner;

/* Objects from the vm context have other prototypes; compare them as plain data. */
const plain = (value) => JSON.parse(JSON.stringify(value));
const same = (actual, expected) => assert.deepEqual(plain(actual), plain(expected));
const fresh = () => new Planner(DATA);
const pick = (planner, choices) => {
  for (const [key, option] of Object.entries(choices)) {
    planner.reveal(key);
    assert.ok(planner.choose(key, option), `choose ${key}=${option}`);
  }
  return planner;
};

test("the data has no broken references", () => {
  same(fresh().validate(), []);
});

test("conditions: any, unknown, value, list and any-of", () => {
  const read = (key) => ({ a: "x", b: null })[key] ?? null;
  assert.ok(matches({ a: "*" }, read));
  assert.ok(!matches({ b: "*" }, read));
  assert.ok(matches({ b: null }, read));
  assert.ok(matches({ a: ["y", "x"] }, read));
  assert.ok(!matches({ a: "y" }, read));
  assert.ok(matches([{ a: "y" }, { b: null }], read));
  assert.ok(matches(undefined, read));
});

test("a choice stays unknown until its card is revealed", () => {
  const planner = fresh();
  planner.choose("w1.adda", "save");
  assert.equal(planner.value("w1.adda"), "save");
  assert.equal(planner.known("w1.adda"), null);
  planner.reveal("w1.adda");
  assert.equal(planner.known("w1.adda"), "save");
  planner.state.revealed = {};
  planner.setShowAll(true);
  assert.equal(planner.known("w1.adda"), "save");
});

test("the bank robbery blocks a path and moves a blocked pick to neutral", () => {
  const planner = pick(fresh(), { "w1.path": "order" });
  pick(planner, { "w1.bank": "yaevinn" });
  assert.equal(planner.value("w1.path"), "neutral");
  assert.ok(planner.isBlocked("w1.path", "order"));
  assert.equal(planner.choose("w1.path", "order"), false);
  assert.ok(planner.choose("w1.path", "elves"));
});

test("Letho's fate in game 2 fills in and locks the Imperial Audience", () => {
  const planner = fresh();
  planner.reveal("w3.imp");
  assert.ok(planner.choose("w3.imp", "dead"));
  pick(planner, { "w2.letho": "free" });
  assert.equal(planner.known("w3.imp"), "alive");
  assert.ok(planner.isLocked("w3.imp"));
  assert.equal(planner.choose("w3.imp", "dead"), false);
  same(planner.contextNotes("w3.brothers"), ["Letho is alive in your playthrough and can fight alongside you."]);
});

test("cards on the other path are marked off-path", () => {
  const planner = pick(fresh(), { "w2.cross": "r" });
  assert.ok(planner.isOffPath("w2.prison"));
  assert.ok(!planner.isOffPath("w2.henselt"));
  assert.ok(!planner.isOffPath("w2.sile"));
});

test("Ciri's fate follows the five moments and the politics", () => {
  const ciri = DATA.games[2].outcomes.find((row) => row.ciri);
  const fate = (choices) => pick(fresh(), choices).outcome(ciri);
  const good = { "w3.snow": "snowballs", "w3.lab": "vent", "w3.grave": "go", "w3.lodge": "alone" };

  assert.equal(fresh().outcome(ciri), "First reveal all five moments that count.");
  assert.match(fate({ ...good, "w3.emhyr": "refuse", "w3.reason": "roche" }), /^5 of the 5 .* Empress of Nilfgaard\.$/);
  assert.match(fate({ ...good, "w3.emhyr": "refuse" }), /still depends on Reason of State/);
  assert.match(fate({ ...good, "w3.emhyr": "skip", "w3.reason": "roche" }), /witcher's path/);
  assert.match(fate({ "w3.snow": "drinks", "w3.emhyr": "accept", "w3.lab": "calm", "w3.grave": "go", "w3.lodge": "alone" }), /^2 of the 5 .* does not survive\.$/);
});

test("the sample route carries the right things into game 2", () => {
  const planner = fresh();
  planner.loadSample("w1");
  const carry = planner.carry("w2");
  assert.equal(carry.from.id, "w1");
  assert.ok(carry.lines.includes("Foltest mentions Adda: she is alive and married to Radovid"));
  assert.ok(carry.lines.includes("Aerondight is among the swords that carry over"));
  assert.ok(!carry.lines.includes("as an Order player, a few extra effects in chapter 3"));
});

test("outcome rows: lookups, joined cases and filled-in labels", () => {
  const planner = fresh();
  planner.loadSample("w1");
  const rows = Object.fromEntries(planner.summary("w1").outcomes.map((row) => [row.title, row.value]));
  assert.equal(rows["Sword at the lake"], "Aerondight");
  assert.equal(rows["Helpers in the epilogue"], "Triss, Adda as a striga, Abigail (if she survived the Beast)");

  pick(planner, { "w2.cross": "i", "w2.prison": "women", "w2.greater": "triss" });
  const ending = planner.summary("w2").outcomes.find((row) => row.title === "Your ending");
  assert.equal(ending.value, "one of the four endings of Iorveth's path (Rescue the women; Rescue Triss)");
});

test("Geralt's row takes the first matching case", () => {
  const geralt = DATA.games[2].outcomes.find((row) => row.label === "Geralt");
  assert.equal(fresh().outcome(geralt), null);
  assert.equal(pick(fresh(), { "w3.triss": "stay" }).outcome(geralt), "Geralt chooses a life with Triss.");
  assert.equal(pick(fresh(), { "w3.triss": "stay", "w3.yen": "yes" }).outcome(geralt), "You chose both, but you can't keep them both.");
  assert.equal(pick(fresh(), { "w3.yen": "no" }).outcome(geralt), "Geralt stays alone, unless you still pick a romance.");
});

test("the summary hides choices on the path not taken", () => {
  const planner = fresh();
  planner.setShowAll(true);
  pick(planner, { "w2.prison": "loredo", "w2.cross": "r" });
  const titles = planner.summary("w2").choices.map((row) => row.title);
  assert.ok(titles.includes("At a Crossroads"));
  assert.ok(!titles.includes("The Floating Prison"));
});

test("saved state is sanitized against the data", () => {
  const planner = new Planner(DATA, {
    choices: { "w1.adda": "save", "w1.ghost": "x", "w1.thaler": "maybe", "w1.bank": "siegfried", "w1.path": "elves" },
    revealed: { "w1.adda": 1, "nope.nothing": 1 },
    showAll: "yes",
    tab: "w9"
  });
  same(planner.state.choices, { "w1.adda": "save", "w1.bank": "siegfried", "w1.path": "neutral" });
  same(planner.state.revealed, { "w1.adda": true });
  assert.equal(planner.state.showAll, false);
  assert.equal(planner.state.tab, "w1");
  same(new Planner(DATA, "garbage").state, fresh().emptyState());
});

test("reset clears choices but keeps the open tab", () => {
  const planner = fresh();
  planner.loadSample("w1");
  planner.setTab("w3");
  planner.reset();
  same(planner.state.choices, {});
  assert.equal(planner.state.tab, "w3");
});
