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

It's a single, self-contained `index.html` with no build step and no dependencies, apart from Google Fonts.

- **Locally:** open `index.html` in a browser.
- **GitHub Pages:** push the repository, then go to *Settings → Pages* and choose *Deploy from a branch* with the `main` branch and the `/ (root)` folder. The site will be available at `https://<your-username>.github.io/<repository-name>/`.

## Editing the data

All game data lives in the `<script>` at the bottom of `index.html`, in three objects: `W1`, `W2` and `W3`.

- `nodes`: tree nodes (`c` = column, `y` = vertical position, `t` = label, `h` = spoiler-free label, `k` = `major` | `minor` | `cons` | `end`).
- `edges`: `[from, to]` threads within a game.
- `D`: choice cards (`t` = title, `ht` = spoiler-free title, `when` = where it happens, `q` = the question, `o` = `[key, label, [consequences]]`).

The links between games are in `val()` (the Letho import), `carryFrom1()` and `carryFrom2()`.

## Sources

Choices and consequences were checked against the Witcher Wiki, GameBanshee, Gamepressure, GamerGuides, the official Prima guides, PC Gamer, GamesRadar and player reports. The full list is at the bottom of the page. Where sources disagree, the page says so.

## License

The code is released under the [MIT License](LICENSE).

## Disclaimer

This is an unofficial fan project. It is not affiliated with or endorsed by CD PROJEKT RED. The Witcher and all related names are trademarks of their respective owners.
