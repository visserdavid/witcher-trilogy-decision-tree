/*
 * The page: renders the planner's state into the DOM and turns clicks into planner actions.
 *
 * One render cycle: every state change calls render(), which rebuilds the cards, carry-over boxes,
 * sidebar and tree from the planner, saves the state and puts keyboard focus back where it was.
 * Interactive elements declare what they do with data-action, handled by one delegated listener.
 */
(function (root) {
  "use strict";

  const { Planner } = root.WitcherPlanner;
  const { el } = root.WitcherDom;
  const Tree = root.WitcherTree;

  const STORAGE_KEY = "witcher-trilogy:v1";
  const LEGACY_KEYS = { choices: "trilogy-s", revealed: "trilogy-r", showAll: "trilogy-sp", tab: "trilogy-tab" };

  const TEXT = {
    major: "Major choice",
    minor: "Minor choice",
    ciri: "counts towards Ciri",
    offPath: "not on your path",
    carriedFrom: (game) => `carried over from ${game.tab.toLowerCase()}`,
    reveal: "I'm here: show the choice",
    pending: "The consequences appear once you choose.",
    inYourPlaythrough: "In your playthrough:",
    lockedBy: (game, choice, label) => `Set by your choice in ${game.tab.toLowerCase()} at "${choice.title}": ${label}.`,
    importHint: (game, choice) => `Once you choose at "${choice.title}" in ${game.tab.toLowerCase()}, this is filled in automatically.`,
    blocked: (titles, labels) => `Because of your choice at ${titles}, you can no longer choose: ${labels}.`,
    carriedHeading: (game) => `Carried over from ${game.tab.toLowerCase()}`,
    fromGame: (game) => `From ${game.tab.toLowerCase()}`,
    noImport: "no import: the default situation",
    yourChoices: (count) => `Your choices (${count})`,
    nothingYet: "Nothing chosen yet",
    nothingYetHint: "Reveal a card in this game and make a choice.",
    confirmReset: "Clear all choices and revealed cards in all three games?"
  };

  /* ---------- storage ---------- */

  const storage = {
    read(key) { try { return localStorage.getItem(key); } catch { return null; } },
    write(key, value) { try { localStorage.setItem(key, value); } catch { /* storage unavailable: keep working in memory */ } },
    remove(key) { try { localStorage.removeItem(key); } catch { /* ignore */ } }
  };

  const parseJson = (text) => {
    if (text == null) return null;
    try { return JSON.parse(text); } catch { return null; }
  };

  /* The saved state, or the state from the first published version (separate keys), or nothing. */
  function loadState() {
    const saved = parseJson(storage.read(STORAGE_KEY));
    if (saved) return saved;
    const choices = parseJson(storage.read(LEGACY_KEYS.choices));
    if (!choices) return null;
    const legacy = {
      choices,
      revealed: parseJson(storage.read(LEGACY_KEYS.revealed)),
      showAll: storage.read(LEGACY_KEYS.showAll) === "1",
      tab: storage.read(LEGACY_KEYS.tab)
    };
    Object.values(LEGACY_KEYS).forEach((key) => storage.remove(key));
    return legacy;
  }

  /* ---------- setup ---------- */

  const planner = new Planner(root.WITCHER_DATA, loadState());
  const problems = planner.validate();
  if (problems.length) console.error(`Witcher data has ${problems.length} problem(s):\n${problems.join("\n")}`);

  const byId = (id) => document.getElementById(id);
  const tree = byId("tree");
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const motion = () => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");
  const cardId = (key) => `card-${key.replace(".", "-")}`;
  const save = () => storage.write(STORAGE_KEY, JSON.stringify(planner.state));

  /* ---------- cards ---------- */

  function tagLine(game, choice, key) {
    const source = choice.importFrom && planner.isLocked(key) ? planner.entry(choice.importFrom.key).game : null;
    const parts = [
      choice.major ? el("b", null, TEXT.major) : TEXT.minor,
      choice.path && game.paths[choice.path],
      choice.ciri && TEXT.ciri,
      planner.isOffPath(key) && TEXT.offPath,
      source && TEXT.carriedFrom(source)
    ].filter(Boolean);
    return el("p", { class: "tag" }, parts.flatMap((part, i) => (i ? [" · ", part] : [part])));
  }

  function importNote(choice, key) {
    const source = planner.entry(choice.importFrom.key);
    return planner.isLocked(key)
      ? el("p", { class: ["small", "lock"] }, TEXT.lockedBy(source.game, source.choice, planner.label(choice.importFrom.key)))
      : el("p", { class: "small" }, TEXT.importHint(source.game, source.choice));
  }

  function blockedNote(choice, key) {
    const blocked = choice.options.filter((option) => planner.isBlocked(key, option.id));
    if (!blocked.length) return null;
    const causes = [...new Set(blocked.flatMap((option) => Object.keys(option.blockedBy)))];
    const titles = causes.map((cause) => `"${planner.entry(cause).choice.title}"`).join(" and ");
    return el("p", { class: "small" }, TEXT.blocked(titles, blocked.map((option) => option.label).join(", ")));
  }

  function cardBody(choice, key) {
    const current = planner.value(key);
    const locked = planner.isLocked(key);
    const chosen = choice.options.find((option) => option.id === current);
    const context = planner.contextNotes(key);
    return [
      el("p", null, choice.question),
      el("div", { class: "opts" }, choice.options.map((option) =>
        el("button", {
          class: "opt", type: "button", "aria-pressed": String(current === option.id),
          disabled: locked || planner.isBlocked(key, option.id),
          dataset: { action: "choose", key, option: option.id, focus: `choose:${key}:${option.id}` }
        }, option.label))),
      choice.importFrom && importNote(choice, key),
      blockedNote(choice, key),
      chosen
        ? el("ul", { class: "fx" }, chosen.effects.map((effect) => el("li", null, effect)))
        : el("p", { class: "small" }, TEXT.pending),
      context.length > 0 && el("p", { class: "small" }, `${TEXT.inYourPlaythrough} ${context.join(" ")}`),
      choice.note && el("p", { class: "small" }, choice.note)
    ];
  }

  function card(game, choice) {
    const key = `${game.id}.${choice.id}`;
    const revealed = planner.isRevealed(key);
    return el("article", {
      id: cardId(key),
      class: ["card", choice.major && "major", choice.path && `path-${choice.path}`, choice.ciri && "ciri", planner.isOffPath(key) && "off"]
    },
    tagLine(game, choice, key),
    el("h4", null, revealed ? choice.title : choice.hidden || choice.title),
    el("p", null, choice.when),
    revealed
      ? cardBody(choice, key)
      : el("button", { class: ["btn", "reveal"], type: "button", dataset: { action: "reveal", key, focus: `reveal:${key}` } }, TEXT.reveal));
  }

  /* Cards grouped by chapter, in data order. */
  function renderCards(game) {
    const chapters = [];
    for (const choice of game.choices) {
      let chapter = chapters[chapters.length - 1];
      if (!chapter || chapter.title !== choice.chapter) chapters.push((chapter = { title: choice.chapter, cards: [] }));
      chapter.cards.push(card(game, choice));
    }
    document.querySelector(`[data-cards="${game.id}"]`)
      .replaceChildren(...chapters.map((c) => el("section", { class: "ch" }, el("h3", null, c.title), c.cards)));
  }

  /* ---------- carry-over and summary ---------- */

  function renderCarry(game) {
    const carry = planner.carry(game.id);
    const box = document.querySelector(`[data-carry="${game.id}"]`);
    if (!carry || !box) return;
    const body = carry.lines.length
      ? [el("ul", null, carry.lines.map((line) => el("li", null, line))), carry.footnote && el("p", { class: "small" }, carry.footnote)]
      : [el("p", null, carry.empty)];
    box.replaceChildren(el("h3", null, TEXT.carriedHeading(carry.from)), ...body.filter(Boolean));
  }

  const rows = (items) => items.flatMap(({ title, value }) => [el("dt", null, title), el("dd", null, value)]);

  function renderSummary(game) {
    const { choices, outcomes, carry } = planner.summary(game.id);
    const body = byId(`summary-${game.id}`).querySelector(".summary-body");
    const wasOpen = body.querySelector(".choices")?.open ?? false;
    /* Outcomes first (what it all leads to), then what came in from the previous game, then the choices themselves. */
    const parts = [
      outcomes.length > 0 && el("dl", null, rows(outcomes)),
      carry && el("dl", null, rows([{ title: TEXT.fromGame(carry.from), value: carry.lines.join("; ") || TEXT.noImport }])),
      choices.length
        ? el("details", { class: "choices", open: wasOpen }, el("summary", null, TEXT.yourChoices(choices.length)), el("dl", null, rows(choices)))
        : el("dl", null, rows([{ title: TEXT.nothingYet, value: TEXT.nothingYetHint }]))
    ].filter(Boolean);
    parts.slice(1).forEach((part) => part.classList.add("end"));
    body.replaceChildren(...parts);
  }

  /* ---------- tabs and controls ---------- */

  function renderTabs() {
    for (const tab of tabs) {
      const active = tab.dataset.tab === planner.state.tab;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      byId(tab.getAttribute("aria-controls")).hidden = !active;
    }
  }

  function renderControls() {
    byId("sp-hide").setAttribute("aria-pressed", String(!planner.state.showAll));
    byId("sp-show").setAttribute("aria-pressed", String(planner.state.showAll));
  }

  function openSummaryOf(gameId) {
    for (const game of planner.games) byId(`summary-${game.id}`).open = game.id === gameId;
  }

  function activate(gameId, { focusTab = false } = {}) {
    if (gameId !== planner.state.tab) {
      planner.setTab(gameId);
      openSummaryOf(gameId);
      renderTabs();
      save();
    }
    if (focusTab) byId(`tab-${gameId}`).focus();
  }

  /* ---------- render cycle ---------- */

  function render(focusSelector) {
    const focusId = document.activeElement?.dataset?.focus;
    for (const game of planner.games) {
      renderCards(game);
      renderCarry(game);
      renderSummary(game);
    }
    Tree.render(tree, planner);
    renderTabs();
    renderControls();
    save();
    const target = focusSelector
      ? document.querySelector(focusSelector)
      : focusId && document.querySelector(`[data-focus="${CSS.escape(focusId)}"]`);
    target?.focus({ preventScroll: true });
  }

  /* ---------- navigation ---------- */

  function scrollTo(element) {
    element?.scrollIntoView({ behavior: motion(), block: "start" });
  }

  /* Targets: "tab:w1", "card:w1.adda", "summary:w3" or "el:<element id>". */
  function jump(target) {
    const split = target.indexOf(":");
    const type = target.slice(0, split), ref = target.slice(split + 1);
    if (type === "tab") {
      activate(ref);
      scrollTo(byId("tabs"));
    } else if (type === "card") {
      activate(ref.split(".")[0]);
      scrollTo(byId(cardId(ref)));
    } else if (type === "summary") {
      activate(ref);
      byId(`summary-${ref}`).open = true;
      scrollTo(document.querySelector(".out"));
    } else if (type === "el") {
      const element = byId(ref);
      const panel = element?.closest('[role="tabpanel"]');
      if (panel) activate(panel.dataset.game);
      if (element instanceof HTMLDetailsElement) element.open = true;
      scrollTo(element);
    }
  }

  /* ---------- events ---------- */

  const actions = {
    reveal: ({ key }) => {
      planner.reveal(key);
      render(`[data-action="choose"][data-key="${CSS.escape(key)}"]:not(:disabled)`);
    },
    choose: ({ key, option }) => {
      if (planner.choose(key, option)) render();
    },
    jump: ({ target }) => jump(target),
    tab: ({ tab }) => activate(tab),
    spoilers: ({ show }) => {
      planner.setShowAll(show === "true");
      render();
    },
    sample: ({ game }) => {
      planner.loadSample(game);
      render();
    },
    reset: () => {
      if (!confirm(TEXT.confirmReset)) return;
      planner.reset();
      render();
    }
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-action]");
    if (trigger) actions[trigger.dataset.action]?.(trigger.dataset);
  });

  /* SVG nodes are not buttons: let Enter and Space activate them. */
  tree.addEventListener("keydown", (event) => {
    const node = event.target.closest("[data-action]");
    if (node && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      actions[node.dataset.action]?.(node.dataset);
    }
  });

  /* Arrow keys, Home and End move between tabs (WAI-ARIA tabs pattern). */
  byId("tabs").addEventListener("keydown", (event) => {
    const index = tabs.findIndex((tab) => tab.dataset.tab === planner.state.tab);
    const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    activate(tabs[(next + tabs.length) % tabs.length].dataset.tab, { focusTab: true });
  });

  /* On narrow screens, stacked tables show each cell's column header as a label. */
  for (const table of document.querySelectorAll("table.stack")) {
    const headers = [...table.tHead.rows[0].cells].map((cell) => cell.textContent);
    for (const row of table.tBodies[0].rows) [...row.cells].forEach((cell, i) => { cell.dataset.label = headers[i] || ""; });
  }

  openSummaryOf(planner.state.tab);
  Tree.enableTracing(tree);
  render();
})(globalThis);
