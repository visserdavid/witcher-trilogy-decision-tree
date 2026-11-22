/*
 * Draws the trilogy tree as SVG: one band per game, stacked, joined by the save thread.
 *
 * All positions come from the data (`layout`, `at`); band offsets and the total height are computed.
 * All colours live in style.css, so this file only decides geometry and classes.
 */
(function (root) {
  "use strict";

  const { svg } = root.WitcherDom;

  const WIDTH = 1345;
  const TITLE_SPACE = 38;  // room above each band for the game title
  const BAND_GAP = 32;     // space between two bands (the save thread runs through it)
  const RAIL_X = 28;       // x of the save thread's descent on the left
  const CORNER = 10;       // radius of the save thread's corners
  const HEAD_Y = 22;       // column heading baseline, relative to the band
  const RULE_Y = 32;       // rule under the column headings

  /* Where each band starts; the last value is the total height. */
  function layoutBands(games) {
    let top = TITLE_SPACE + 2;
    const bands = games.map((game) => {
      const band = { game, top, bottom: top + game.layout.height };
      top = band.bottom + BAND_GAP + TITLE_SPACE;
      return band;
    });
    return { bands, height: bands[bands.length - 1].bottom + 8 };
  }

  const findNode = (game, id) => game.choices.find((n) => n.id === id) || (game.markers || []).find((n) => n.id === id);

  /* Geometry of one node: a choice or a marker. */
  function box(band, node) {
    const { x0, step, nodeWidth, nodeHeight } = band.game.layout;
    const [column, y] = node.at;
    const x = x0 + column * step;
    const top = band.top + y;
    return { x, y: top, width: nodeWidth, height: nodeHeight, column, cx: x + nodeWidth / 2, cy: top + nodeHeight / 2 };
  }

  /* ---------- edge routing ----------
   * Edges never pass behind a node. An edge that skips columns threads through the free gaps between
   * the nodes of every column it crosses, like a metro line; edges sharing a gap get their own lane.
   * Several edges at one node side are spread out over that side ("ports"), so each stays traceable.
   */
  const LANES = [0, 5, -5, 10, -10, 15, -15];
  const clamp = (value, lo, hi) => Math.min(hi, Math.max(lo, value));
  const PORT_SPACING = 6;
  const GAP_MARGIN = 4;

  const allNodes = (game) => [...game.choices, ...(game.markers || [])];

  /* Free vertical intervals per column: the space above, between and below its nodes. */
  function freeGaps(band) {
    const columns = new Map();
    for (const node of allNodes(band.game)) {
      const b = box(band, node);
      if (!columns.has(b.column)) columns.set(b.column, []);
      columns.get(b.column).push(b);
    }
    const gaps = new Map();
    for (const [column, boxes] of columns) {
      boxes.sort((a, b) => a.y - b.y);
      const free = [];
      let start = band.top + RULE_Y + 6;
      for (const b of boxes) {
        if (b.y - start >= 2 * GAP_MARGIN + 4) free.push([start, b.y]);
        start = b.y + b.height;
      }
      free.push([start, band.bottom - 2]);
      gaps.set(column, free);
    }
    return gaps;
  }

  /* Spread the edges that leave (or enter) one node along its side, ordered by where they go. */
  function assignPorts(edges) {
    const spread = (list, side, other) => {
      list.sort((a, b) => other(a) - other(b));
      list.forEach((edge, i) => {
        const box = side === "out" ? edge.a : edge.b;
        const step = Math.min(PORT_SPACING, (box.height - 12) / Math.max(1, list.length - 1));
        edge[side === "out" ? "y1" : "y2"] = box.cy + (i - (list.length - 1) / 2) * step;
      });
    };
    const group = (pick) => {
      const map = new Map();
      for (const edge of edges) {
        const id = pick(edge);
        if (!map.has(id)) map.set(id, []);
        map.get(id).push(edge);
      }
      return map.values();
    };
    for (const list of group((e) => e.from)) spread(list, "out", (e) => e.b.cy);
    for (const list of group((e) => e.to)) spread(list, "in", (e) => e.a.cy);
  }

  function routeEdges(band) {
    const { game } = band;
    const { step, nodeWidth } = game.layout;
    const colX = (column) => game.layout.x0 + column * step;
    const gaps = freeGaps(band);
    const usage = new Map();

    const edges = game.edges.map(([from, to, style]) => ({
      from, to, style, a: box(band, findNode(game, from)), b: box(band, findNode(game, to))
    }));
    assignPorts(edges);

    /* Lanes are handed out from the shortest edge to the longest, so short hops stay straight. */
    const order = [...edges].sort((p, q) => (p.b.column - p.a.column) - (q.b.column - q.a.column));
    for (const edge of order) {
      const { a, b } = edge;
      if (a.column === b.column) {
        edge.d = sameColumnPath(edge, allNodes(game).map((node) => box(band, node)), nodeWidth, step);
        continue;
      }
      const x1 = a.x + a.width, x2 = b.x - 3;
      let d = `M${x1},${edge.y1}`, x = x1, y = edge.y1;
      for (let column = a.column + 1; column < b.column; column++) {
        const left = colX(column), right = left + nodeWidth;
        const wanted = edge.y1 + (edge.y2 - edge.y1) * ((left + nodeWidth / 2 - x1) / (x2 - x1));
        const [lo, hi] = gaps.get(column)?.reduce((best, gap) => {
          const dist = (g) => Math.max(0, g[0] - wanted, wanted - g[1]);
          return dist(gap) < dist(best) ? gap : best;
        }) ?? [wanted - 10, wanted + 10];
        const laneKey = `${column}:${lo}`;
        const lane = LANES[(usage.get(laneKey) || 0) % LANES.length];
        usage.set(laneKey, (usage.get(laneKey) || 0) + 1);
        const fit = (v) => clamp(v, lo + GAP_MARGIN, hi - GAP_MARGIN);
        const gy = fit(fit(wanted) + lane);
        d += ` ${bend(x, y, left, gy)} L${right},${gy}`;
        x = right; y = gy;
      }
      edge.d = `${d} ${bend(x, y, x2, edge.y2)}`;
    }
    return edges;
  }

  /* A smooth S-bend from one point to the next, leaving and arriving horizontally. */
  function bend(x1, y1, x2, y2) {
    const dx = Math.max(8, (x2 - x1) / 2);
    return `C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
  }

  /* Within one column: straight down when nothing is in the way, otherwise around through the right gutter. */
  function sameColumnPath(edge, boxes, nodeWidth, step) {
    const { a, b } = edge;
    const down = b.y > a.y;
    const top = Math.min(a.y, b.y), bottom = Math.max(a.y, b.y);
    const blocked = boxes.some((o) => o.column === a.column && o.y > top && o.y < bottom);
    if (!blocked) {
      return down ? `M${a.cx},${a.y + a.height} L${b.cx},${b.y - 3}` : `M${a.cx},${a.y} L${b.cx},${b.y + b.height + 3}`;
    }
    const gutter = a.x + nodeWidth + (step - nodeWidth) / 2, s = down ? 1 : -1, r = 8;
    const x1 = a.x + a.width, x2 = b.x + b.width + 3;
    return `M${x1},${edge.y1} Q${gutter},${edge.y1} ${gutter},${edge.y1 + s * r} L${gutter},${edge.y2 - s * r} Q${gutter},${edge.y2} ${x2},${edge.y2}`;
  }

  /* Right out of the source, down the gap, left along it, down the rail and into the target. */
  function threadPath(from, to, gapY) {
    const x1 = from.x + from.width, right = x1 + 14, r = CORNER, x2 = to.x - 3;
    return [
      `M${x1},${from.cy}`, `L${right - r},${from.cy}`, `Q${right},${from.cy} ${right},${from.cy + r}`,
      `L${right},${gapY - r}`, `Q${right},${gapY} ${right - r},${gapY}`,
      `L${RAIL_X + r},${gapY}`, `Q${RAIL_X},${gapY} ${RAIL_X},${gapY + r}`,
      `L${RAIL_X},${to.cy - r}`, `Q${RAIL_X},${to.cy} ${RAIL_X + r},${to.cy}`, `L${x2},${to.cy}`
    ].join(" ");
  }

  const arrow = (id) =>
    svg("marker", { id, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto" },
      svg("path", { d: "M0,0L10,5L0,10z" }));

  function nodeElement(planner, band, node, isChoice) {
    const game = band.game;
    const key = `${game.id}.${node.id}`;
    const b = box(band, node);
    const kind = isChoice ? (node.major ? "major" : "minor") : (node.kind || "cons");
    const revealed = planner.isRevealed(isChoice ? key : `${game.id}.${node.parent}`);
    const text = (isChoice ? node.short || node.title : node.label);
    const label = !revealed && node.hidden ? node.hidden : text;
    const chosen = isChoice && planner.known(key) !== null;
    const target = isChoice ? `card:${key}` : node.jump.replace(/^card:/, `card:${game.id}.`).replace(/^summary$/, `summary:${game.id}`);
    return svg("g", {
      class: ["node", `node--${kind}`, node.path && `node--path-${node.path}`, node.ciri && "node--ciri",
        chosen && "is-chosen", isChoice && planner.isOffPath(key) && "is-off"],
      tabindex: 0, role: "link", "aria-label": chosen ? `${label} (chosen)` : label,
      dataset: { action: "jump", target, focus: `jump:${target}`, key }
    },
    svg("rect", { x: b.x, y: b.y, width: b.width, height: b.height, rx: 6 }),
    svg("text", { x: b.cx, y: b.cy + 4.5, "text-anchor": "middle" }, label),
    chosen && svg("circle", { class: "node-dot", cx: b.x + b.width - 9, cy: b.y + 9, r: 4.5 }));
  }

  function bandElements(planner, band) {
    const { game } = band;
    const { x0, step, nodeWidth } = game.layout;
    const colX = (column) => x0 + column * step;
    const out = [];

    out.push(svg("rect", { class: "band", x: 8, y: band.top - TITLE_SPACE, width: 1322, height: game.layout.height + TITLE_SPACE, rx: 12 }));
    out.push(svg("g", {
      class: "band-title", tabindex: 0, role: "link", "aria-label": `Open ${game.subtitle}`,
      dataset: { action: "jump", target: `tab:${game.id}`, focus: `jump:tab:${game.id}` }
    }, svg("text", { x: x0, y: band.top - 12 }, game.title, svg("tspan", { dx: 14 }, game.subtitle))));

    game.columns.forEach((title, column) => {
      out.push(svg("text", { class: "col-head", x: colX(column) + nodeWidth / 2, y: band.top + HEAD_Y, "text-anchor": "middle" }, title));
      out.push(svg("line", { class: "col-rule", x1: colX(column), x2: colX(column) + nodeWidth, y1: band.top + RULE_Y, y2: band.top + RULE_Y }));
    });

    for (const area of game.areas || []) {
      const x = colX(area.columns[0]) - 20;
      const width = colX(area.columns[1]) + nodeWidth + 20 - x;
      out.push(svg("rect", { class: `area area--${area.path}`, x, y: band.top + area.y, width, height: area.height, rx: 10 }));
      out.push(svg("text", { class: `area-label path-text--${area.path}`, x: x + 8, y: band.top + area.y + area.height - 6 }, area.label));
    }
    if (game.divider) {
      const x = colX(game.divider.column) - 17;
      out.push(svg("line", { class: "divider", x1: x, x2: x, y1: band.top + 40, y2: band.top + game.layout.height - 5 }));
      out.push(svg("text", { class: "divider-label", x: colX(game.divider.column) + nodeWidth + 22, y: band.top + game.layout.height - 15, "text-anchor": "middle" }, game.divider.label));
    }

    for (const edge of routeEdges(band)) {
      out.push(svg("path", {
        class: ["edge", edge.style && `edge--${edge.style}`], d: edge.d,
        dataset: { from: `${game.id}.${edge.from}`, to: `${game.id}.${edge.to}` },
        "marker-end": edge.style === "next" ? null : `url(#arrow-${edge.style === "ciri" ? "ice" : "red"})`
      }));
    }
    for (const label of game.labels || []) {
      out.push(svg("text", { class: `path-label path-text--${label.path}`, x: colX(label.column) + label.dx, y: band.top + label.y }, label.text));
    }
    return out;
  }

  function render(target, planner) {
    const { bands, height } = layoutBands(planner.games);
    const nodeLayer = [], lineLayer = [];

    bands.forEach((band, index) => {
      lineLayer.push(...bandElements(planner, band));
      band.game.choices.forEach((choice) => nodeLayer.push(nodeElement(planner, band, choice, true)));
      (band.game.markers || []).forEach((marker) => nodeLayer.push(nodeElement(planner, band, marker, false)));

      const thread = band.game.saveThread;
      const next = bands[index + 1];
      if (thread && next) {
        const from = box(band, findNode(band.game, thread.from));
        const to = box(next, findNode(next.game, thread.to.split(".")[1]));
        const gapY = band.bottom + BAND_GAP / 2;
        lineLayer.push(svg("g", { class: "thread-group", dataset: { from: `${band.game.id}.${thread.from}`, to: thread.to } },
          svg("path", { class: "thread", d: threadPath(from, to, gapY), "marker-end": "url(#arrow-pink)" }),
          svg("text", { class: "thread-label", x: (RAIL_X + from.x + from.width + 14) / 2, y: gapY - 7, "text-anchor": "middle" },
            `your save carries over to ${next.game.title}`)));
      }
    });

    target.setAttribute("viewBox", `0 0 ${WIDTH} ${height}`);
    target.replaceChildren(
      svg("defs", null, arrow("arrow-red"), arrow("arrow-ice"), arrow("arrow-pink")),
      ...lineLayer, ...nodeLayer
    );
  }

  /* ---------- tracing ----------
   * Light up everything that leads to a node and everything it leads to, across games via the save thread,
   * and fade the rest. Links are any element with data-from/data-to; nodes carry data-key.
   */
  function trace(target, key) {
    target.classList.toggle("is-tracing", Boolean(key));
    for (const element of target.querySelectorAll(".is-lit")) element.classList.remove("is-lit");
    if (!key) return;
    const links = [...target.querySelectorAll("[data-from]")];
    const lit = new Set([key]);
    const walk = (forward) => {
      const [here, there] = forward ? ["from", "to"] : ["to", "from"];
      const queue = [key], seen = new Set(queue);
      while (queue.length) {
        const current = queue.shift();
        for (const link of links) {
          if (link.dataset[here] !== current) continue;
          link.classList.add("is-lit");
          const next = link.dataset[there];
          lit.add(next);
          if (!seen.has(next)) { seen.add(next); queue.push(next); }
        }
      }
    };
    walk(true);
    walk(false);
    for (const node of target.querySelectorAll(".node")) if (lit.has(node.dataset.key)) node.classList.add("is-lit");
  }

  /* Hover or keyboard focus on a node traces its threads. */
  function enableTracing(target) {
    const nodeKey = (element) => element?.closest?.(".node")?.dataset.key ?? null;
    target.addEventListener("pointerover", (event) => trace(target, nodeKey(event.target)));
    target.addEventListener("pointerleave", () => trace(target, null));
    target.addEventListener("focusin", (event) => trace(target, nodeKey(event.target)));
    target.addEventListener("focusout", (event) => { if (!nodeKey(event.relatedTarget)) trace(target, null); });
  }

  root.WitcherTree = Object.freeze({ render, enableTracing });
})(globalThis);
