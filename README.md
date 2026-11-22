# Witcher Trilogy Decision Tree

An interactive, spoiler-aware decision tree for **The Witcher** (2007), **The Witcher 2: Assassins of Kings** (2011) and **The Witcher 3: Wild Hunt** (2015), including the Hearts of Stone and Blood and Wine expansions.

**Live demo:** https://visserdavid.github.io/witcher-trilogy-decision-tree/

## Features

- **One tree for the whole trilogy.** Each game is a band with its chapters as columns, choices as nodes and threads to later consequences. A dashed thread shows your save carrying over to the next game.
- **Spoilers stay hidden.** Each choice stays hidden until you click "I'm here". Only then do you see the options, and the consequences appear only after you choose. A global switch reveals everything at once.
- **Choices carry over.** Your choices in game 1 feed the import summary for game 2. Letho's fate in game 2 automatically fills in the Imperial Audience in game 3.
- **Running outcome.** A sidebar shows your outcome per game: your path and allies in game 1, your ending in game 2, and Ciri's fate, the North, Skellige and Geralt in game 3.
- **Remembers your progress.** Choices and revealed cards are stored in your browser (`localStorage`). Nothing is sent anywhere.
- Works in light and dark mode, on desktop and on mobile, and with the keyboard.

## Usage

Plain HTML, CSS and JavaScript: no build step and no dependencies, apart from Google Fonts.

- **Locally:** open `index.html` in a browser. The scripts are classic scripts rather than ES modules, so this works straight from disk.
- **GitHub Pages:** push the repository, then go to *Settings → Pages* and choose *Deploy from a branch* with the `main` branch and the `/ (root)` folder.

## How it's built

| File | Role |
| --- | --- |
| `index.html` | Static content: intro, tabs, bridge tables, sources. No inline styles or scripts. |
| `css/style.css` | All styling, including the tree's colours (as CSS variables). |
| `js/data.js` | **All game facts**: choices, options, consequences, tree positions and the rules that link games. |
| `js/planner.js` | The rules engine. Pure logic without a DOM, so it runs in Node too. |
| `js/dom.js` | A tiny element builder; the app never assembles HTML from strings. |
| `js/tree.js` | Draws the SVG tree. Band positions and the total height are computed from the data. |
| `js/app.js` | Renders the planner into the page and handles events through `data-action` attributes. |

### Editing the data

Everything lives in `js/data.js`; the code holds no game facts. A choice is addressed as `game.choice`, for example `w1.adda`. The rules are declarative:

- **Conditions** (`when`) map keys to `"*"` (known), `null` (not known yet), an option id, or a list of option ids. An array of conditions means "any of these".
- **`blockedBy`** on an option disables it (for example, the bank robbery limits the final path). The choice's `fallback` option is used when an earlier pick becomes blocked.
- **`importFrom`** fills a choice in from an earlier game and locks it (for example, Letho's fate in game 3).
- **`carry`** lists what carries over into a game, and **`outcomes`** lists the sidebar rows. Text can reference a choice as `{w2.prison}`.
- **`points`** on options and the `ciri` outcome define how Ciri's fate is counted.

On load, the planner validates the data and logs any broken reference to the console.

### Tests

```
node --test
```

The tests cover the data's integrity and the rules: spoiler hiding, blocked options, the Letho import, path filtering, Ciri's fate, carry-over and saved-state sanitizing. They need Node 18 or later and have no dependencies.

## Sources

Choices and consequences were checked against the Witcher Wiki, GameBanshee, Gamepressure, GamerGuides, the official Prima guides, PC Gamer, GamesRadar and player reports. The full list is at the bottom of the page. Where sources disagree, the page says so.

## License

The code is released under the [MIT License](LICENSE).

## Disclaimer

This is an unofficial fan project. It is not affiliated with or endorsed by CD PROJEKT RED. The Witcher and all related names are trademarks of their respective owners.
