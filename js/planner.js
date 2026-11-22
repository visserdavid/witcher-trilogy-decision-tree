/*
 * Planner: the rules engine behind the decision tree.
 *
 * Pure logic, no DOM: it reads the declarative game data, holds the player's state and answers
 * questions such as "what is known about this choice?" or "what carries over to the next game?".
 * It runs in the browser and in Node (see tests/).
 */
(function (root) {
  "use strict";

  const ANY = "*";
  const TOKEN = /\{([\w]+\.[\w]+)\}/g;

  /* Does a condition hold? `read` returns the known value of a key, or null. */
  function matches(when, read) {
    if (when == null) return true;
    if (Array.isArray(when)) return when.some((part) => matches(part, read));
    return Object.entries(when).every(([key, spec]) => {
      const value = read(key) ?? null;
      if (spec === ANY) return value !== null;
      if (Array.isArray(spec)) return spec.includes(value);
      return value === spec;
    });
  }

  /* All keys a condition refers to (for validation). */
  function conditionKeys(when) {
    if (when == null) return [];
    if (Array.isArray(when)) return when.flatMap(conditionKeys);
    return Object.keys(when);
  }

  class Planner {
    constructor(data, state) {
      this.games = data.games;
      this.gameById = new Map(this.games.map((game) => [game.id, game]));
      this.entries = new Map();
      for (const game of this.games) {
        for (const choice of game.choices) this.entries.set(`${game.id}.${choice.id}`, { game, choice });
      }
      this.state = this.sanitize(state);
    }

    /* ---------- state ---------- */

    emptyState() {
      return { choices: {}, revealed: {}, showAll: false, tab: this.games[0].id };
    }

    /* Accept anything (e.g. parsed localStorage) and keep only what is valid for the current data. */
    sanitize(input) {
      const state = this.emptyState();
      if (!input || typeof input !== "object") return state;
      for (const [key, value] of Object.entries(input.choices || {})) {
        if (this.option(key, value)) state.choices[key] = value;
      }
      for (const key of Object.keys(input.revealed || {})) {
        if (this.entries.has(key)) state.revealed[key] = true;
      }
      state.showAll = input.showAll === true;
      if (this.gameById.has(input.tab)) state.tab = input.tab;
      this.enforceRestrictions(state);
      return state;
    }

    /* ---------- lookups ---------- */

    entry(key) {
      return this.entries.get(key);
    }

    option(key, optionId) {
      const entry = this.entries.get(key);
      return entry ? entry.choice.options.find((option) => option.id === optionId) : undefined;
    }

    /* The value a choice gets from an earlier game, if that earlier choice is known. */
    imported(key) {
      const source = this.entry(key)?.choice.importFrom;
      if (!source) return null;
      return source.map[this.known(source.key)] ?? null;
    }

    value(key) {
      return this.imported(key) ?? this.state.choices[key] ?? null;
    }

    isRevealed(key) {
      return this.state.showAll || this.state.revealed[key] === true;
    }

    /* The value as the player sees it: null until the card is revealed and a choice is made. */
    known(key) {
      return this.isRevealed(key) ? this.value(key) : null;
    }

    isLocked(key) {
      return this.imported(key) !== null;
    }

    isBlocked(key, optionId, state = this.state) {
      const blockedBy = this.option(key, optionId)?.blockedBy;
      return Boolean(blockedBy) && matches(blockedBy, (k) => state.choices[k]);
    }

    /* A card on the path the player is not playing (e.g. Iorveth's cards on Roche's path). */
    isOffPath(key) {
      const { game, choice } = this.entry(key);
      if (!game.pathChoice || !choice.path) return false;
      const taken = this.known(`${game.id}.${game.pathChoice}`);
      return taken !== null && taken !== choice.path;
    }

    label(key) {
      return this.option(key, this.value(key))?.label ?? "";
    }

    /* Replace {game.choice} tokens with the chosen option's label. */
    fill(text) {
      return text.replace(TOKEN, (_, key) => this.label(key));
    }

    /* ---------- actions ---------- */

    choose(key, optionId) {
      if (!this.option(key, optionId) || this.isLocked(key) || this.isBlocked(key, optionId)) return false;
      this.state.choices[key] = optionId;
      this.enforceRestrictions(this.state);
      return true;
    }

    /* When a choice blocks an option that was already picked elsewhere, fall back (e.g. path -> neutral). */
    enforceRestrictions(state) {
      for (const [key, { choice }] of this.entries) {
        const current = state.choices[key];
        if (current && this.isBlocked(key, current, state)) {
          if (choice.fallback) state.choices[key] = choice.fallback;
          else delete state.choices[key];
        }
      }
    }

    reveal(key) {
      if (this.entries.has(key)) this.state.revealed[key] = true;
    }

    setShowAll(showAll) {
      this.state.showAll = Boolean(showAll);
    }

    setTab(gameId) {
      if (this.gameById.has(gameId)) this.state.tab = gameId;
    }

    loadSample(gameId) {
      const game = this.gameById.get(gameId);
      for (const [id, optionId] of Object.entries(game?.sampleRoute || {})) {
        const key = `${gameId}.${id}`;
        this.state.revealed[key] = true;
        this.state.choices[key] = optionId;
      }
      this.enforceRestrictions(this.state);
    }

    reset() {
      this.state = { ...this.emptyState(), tab: this.state.tab };
    }

    /* ---------- derived views ---------- */

    contextNotes(key) {
      const read = (k) => this.known(k);
      return (this.entry(key).choice.context || []).filter((note) => matches(note.when, read)).map((note) => note.text);
    }

    /* Lines describing what carries over into `gameId` from the previous game. */
    carry(gameId) {
      const carry = this.gameById.get(gameId)?.carry;
      if (!carry) return null;
      const read = (k) => this.known(k);
      const lines = carry.lines.filter((line) => matches(line.when, read)).map((line) => this.fill(line.text));
      return { from: this.gameById.get(carry.from), lines, empty: carry.empty, footnote: carry.footnote };
    }

    /* Ciri's fate: count the positive moments, then take the first matching case. */
    ciriFate(spec) {
      if (!spec.moments.every((key) => this.known(key) !== null)) return spec.incomplete;
      const points = spec.moments.reduce((sum, key) => sum + (this.option(key, this.known(key)).points || 0), 0);
      const read = (k) => this.known(k);
      const below = points < spec.threshold;
      const outcome = spec.cases.find((c) => (c.below ? below : !below && matches(c.when, read)));
      return `${spec.score.replace("{points}", points)} ${outcome.text}`;
    }

    /* One outcome row: a lookup (key + text map), the first matching case, or all matching cases joined. */
    outcome(row) {
      if (row.ciri) return this.ciriFate(row.ciri);
      const read = (k) => this.known(k);
      const cases = row.key
        ? Object.entries(row.text).map(([value, text]) => ({ when: { [row.key]: value }, text }))
        : row.cases;
      const hits = cases.filter((c) => matches(c.when, read)).map((c) => this.fill(c.text));
      if (!hits.length) return null;
      return row.join ? hits.join(row.join) : hits[0];
    }

    /* Everything the sidebar shows for one game. */
    summary(gameId) {
      const game = this.gameById.get(gameId);
      const choices = game.choices
        .map((choice) => `${game.id}.${choice.id}`)
        .filter((key) => this.known(key) !== null && !this.isOffPath(key))
        .map((key) => ({ title: this.entry(key).choice.title, value: this.label(key) }));
      const outcomes = (game.outcomes || [])
        .map((row) => ({ title: row.label, value: this.outcome(row) }))
        .filter((row) => row.value !== null);
      return { choices, outcomes, carry: this.carry(gameId) };
    }

    /* ---------- validation ---------- */

    /* Check the data for broken references; returns a list of problems (empty when all is well). */
    validate() {
      const problems = [];
      const checkKey = (key, where) => {
        if (!this.entries.has(key)) problems.push(`${where}: unknown choice "${key}"`);
      };
      const checkCondition = (when, where) => conditionKeys(when).forEach((key) => checkKey(key, where));
      const checkTokens = (text, where) => [...text.matchAll(TOKEN)].forEach(([, key]) => checkKey(key, where));

      for (const [index, game] of this.games.entries()) {
        const nodeIds = new Set([...game.choices, ...(game.markers || [])].map((node) => node.id));
        if (nodeIds.size !== game.choices.length + (game.markers || []).length) problems.push(`${game.id}: duplicate node id`);

        for (const node of [...game.choices, ...(game.markers || [])]) {
          const [column] = node.at;
          if (column < 0 || column >= game.columns.length) problems.push(`${game.id}.${node.id}: column ${column} out of range`);
        }
        for (const [from, to] of game.edges) {
          if (!nodeIds.has(from) || !nodeIds.has(to)) problems.push(`${game.id}: edge ${from} -> ${to} has an unknown end`);
        }
        for (const marker of game.markers || []) {
          if (marker.parent && !nodeIds.has(marker.parent)) problems.push(`${game.id}.${marker.id}: unknown parent`);
          const [type, target] = marker.jump.split(":");
          if (type === "card" && !this.entries.has(`${game.id}.${target}`)) problems.push(`${game.id}.${marker.id}: jump to unknown card`);
        }
        for (const choice of game.choices) {
          const where = `${game.id}.${choice.id}`;
          if (choice.path && !game.paths?.[choice.path]) problems.push(`${where}: unknown path "${choice.path}"`);
          if (choice.fallback && !choice.options.some((o) => o.id === choice.fallback)) problems.push(`${where}: unknown fallback`);
          if (choice.importFrom) {
            checkKey(choice.importFrom.key, where);
            for (const [from, to] of Object.entries(choice.importFrom.map)) {
              if (!this.option(choice.importFrom.key, from)) problems.push(`${where}: import maps unknown option "${from}"`);
              if (!choice.options.some((o) => o.id === to)) problems.push(`${where}: import maps to unknown option "${to}"`);
            }
          }
          for (const option of choice.options) checkCondition(option.blockedBy, `${where}.${option.id}`);
          for (const note of choice.context || []) checkCondition(note.when, `${where} context`);
        }
        if (game.pathChoice && !this.entries.has(`${game.id}.${game.pathChoice}`)) problems.push(`${game.id}: unknown path choice`);
        for (const [id, optionId] of Object.entries(game.sampleRoute || {})) {
          if (!this.option(`${game.id}.${id}`, optionId)) problems.push(`${game.id} sample route: invalid ${id}=${optionId}`);
        }
        if (game.saveThread) {
          const next = this.games[index + 1];
          const [nextGame, nextNode] = game.saveThread.to.split(".");
          if (!nodeIds.has(game.saveThread.from)) problems.push(`${game.id}: save thread starts at an unknown node`);
          if (!next || next.id !== nextGame || ![...next.choices, ...(next.markers || [])].some((n) => n.id === nextNode)) {
            problems.push(`${game.id}: save thread must end at a node of the next game`);
          }
        }
        for (const line of game.carry?.lines || []) {
          checkCondition(line.when, `${game.id} carry`);
          checkTokens(line.text, `${game.id} carry`);
        }
        for (const row of game.outcomes || []) {
          if (row.key) checkKey(row.key, `${game.id} outcome "${row.label}"`);
          for (const c of row.cases || row.ciri?.cases || []) {
            checkCondition(c.when, `${game.id} outcome "${row.label}"`);
            checkTokens(c.text, `${game.id} outcome "${row.label}"`);
          }
          for (const key of row.ciri?.moments || []) checkKey(key, `${game.id} Ciri`);
        }
      }
      return problems;
    }
  }

  root.WitcherPlanner = Object.freeze({ Planner, matches });
})(globalThis);
