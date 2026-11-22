/*
 * A tiny element builder, so the app never assembles HTML from strings.
 *
 *   el("button", { class: "opt", type: "button", dataset: { key: "w1.adda" } }, "Save her")
 *
 * Props: `class` (string or array; falsy entries are dropped), `dataset`, `text`, and any attribute.
 * Attributes set to false/null/undefined are left out; true becomes an empty attribute.
 * Children: nodes, strings (inserted as text, never parsed), nested arrays; null/false are skipped.
 */
(function (root) {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  function build(element, props, children) {
    for (const [name, value] of Object.entries(props || {})) {
      if (value == null || value === false) continue;
      if (name === "class") {
        const classes = (Array.isArray(value) ? value : [value]).filter(Boolean);
        if (classes.length) element.setAttribute("class", classes.join(" "));
      } else if (name === "dataset") {
        for (const [key, data] of Object.entries(value)) if (data != null) element.dataset[key] = data;
      } else if (name === "text") {
        element.textContent = value;
      } else {
        element.setAttribute(name, value === true ? "" : String(value));
      }
    }
    for (const child of children.flat(Infinity)) {
      if (child == null || child === false) continue;
      element.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return element;
  }

  const el = (tag, props, ...children) => build(document.createElement(tag), props, children);
  const svg = (tag, props, ...children) => build(document.createElementNS(SVG_NS, tag), props, children);

  root.WitcherDom = Object.freeze({ el, svg });
})(globalThis);
