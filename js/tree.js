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

  function curve(from, to) {
    if (from.column === to.column) {
      return `M${from.cx},${from.y + from.height} L${to.cx},${to.y - 3}`;
    }
    const x1 = from.x + from.width, x2 = to.x - 3;
    const dx = Math.max(30, (x2 - x1) * 0.5);
    return `M${x1},${from.cy} C${x1 + dx},${from.cy} ${x2 - dx},${to.cy} ${x2},${to.cy}`;
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
      dataset: { action: "jump", target, focus: `jump:${target}` }
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

    for (const [from, to, style] of game.edges) {
      const a = box(band, findNode(game, from)), b = box(band, findNode(game, to));
      out.push(svg("path", {
        class: ["edge", style && `edge--${style}`], d: curve(a, b),
        "marker-end": style === "next" ? null : `url(#arrow-${style === "ciri" ? "ice" : "red"})`
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
        lineLayer.push(svg("path", { class: "thread", d: threadPath(from, to, gapY), "marker-end": "url(#arrow-pink)" }));
        lineLayer.push(svg("text", { class: "thread-label", x: (RAIL_X + from.x + from.width + 14) / 2, y: gapY - 7, "text-anchor": "middle" },
          `your save carries over to ${next.game.title}`));
      }
    });

    target.setAttribute("viewBox", `0 0 ${WIDTH} ${height}`);
    target.replaceChildren(
      svg("defs", null, arrow("arrow-red"), arrow("arrow-ice"), arrow("arrow-pink")),
      ...lineLayer, ...nodeLayer
    );
  }

  root.WitcherTree = Object.freeze({ render });
})(globalThis);
