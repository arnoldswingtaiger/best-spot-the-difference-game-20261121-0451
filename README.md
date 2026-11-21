# Taman Senja — Cari Perbedaannya

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/arnoldswingtaiger/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/arnoldswingtaiger/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A complete spot-the-difference game that runs entirely offline in a desktop
browser from its own static files. Two near-identical pictures sit side by
side; find all 7 differences in each level before the clock runs out. Every
picture is drawn with canvas code — no image files, no network requests.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no libraries: just
`game/index.html` and its ES modules.

## The game

- **3 hand-drawn levels** — Taman Senja (a park at dusk), Pantai Pagi (a
  morning beach), and Pasar Malam (a night market). Each level paints the same
  scene twice with exactly 7 small differences between the two copies.
- **Click to find** — click a difference on either picture to ring it with a
  green check. A wrong click flashes a red cross and costs a heart; three
  hearts lost, or the 150-second clock running out, fails the level.
- **Hints** — press H (or the Petunjuk button) for a pulsing ring over an
  unfound difference. Three hints per level.
- **Scoring** — 100 points per difference, plus a level bonus and a time
  bonus. Three stars for a level finished without a mistake.
- **Sound** — every sound is a short WebAudio tone (found, wrong, hint, win);
  press M to mute. No audio files.
- **Keyboard** — Enter starts, P pauses, R restarts the level, H hints,
  M mutes.
- **Screenshots** — `shots.json` lists the four staged scenes; open
  `?shot=start|play|play2|end` to see each one.

## Layout

- `game/index.html` + `game/src/` — the game (config, scenes, state, render,
  input, audio, shots, main).
- `main.ts` — the entrypoint: copies `game/` and `screenshots/` to `/output`
  and writes `dossier.json` with the vendored make.fun library.
- `screenshots/` — four real renders of the game's own code.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
