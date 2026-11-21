// Boot and the one loop: input is read on every click and keypress, the world
// advances in fixed 1/60 s steps (several in a slow frame, none in a fast one),
// and the renderer paints what is there.
//
// ?shot=start|play|play2|end stages one fixed scene instead of running the
// loop, paints it twice and sets window.__shotReady for a screenshot.
// ?seed=N is accepted and ignored: the scenes are drawn the same every time,
// so a screenshot never depends on it.

import { BEST_KEY, SCREEN_FAILED, SCREEN_LEVEL_DONE, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_VICTORY } from './config.js';
import { createGame } from './state.js';
import { createRenderer, buttonsFor } from './render.js';
import { buttonHit, createInput } from './input.js';
import { stageShot } from './shots.js';
import { isMuted, setMuted, playClick } from './audio.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const api = createGame();
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

api.game.best = readBest();

function announce() {
  const game = api.game;
  const level = game.levelIndex + 1;
  if (game.screen === SCREEN_PLAY) {
    status.textContent = `Level ${level}: ${game.found.size} dari 7 perbedaan ditemukan, ${Math.ceil(game.timeLeft)} detik tersisa, ${game.hearts} nyawa.`;
  } else if (game.screen === SCREEN_TITLE) {
    status.textContent = 'Taman Senja, cari perbedaannya. Tekan Enter untuk mulai.';
  } else if (game.screen === SCREEN_VICTORY) {
    status.textContent = `Kamu menang! Skor akhir ${game.score}.`;
  }
}

function onButton(x, y) {
  const buttons = buttonsFor(api.game.screen, api.game);
  const id = buttonHit(buttons, x, y);
  if (id === null) return false;
  playClick();
  if (id === 'start' || id === 'again') {
    api.startGame();
  } else if (id === 'next') {
    api.nextLevel();
  } else if (id === 'retry') {
    api.retryLevel();
  } else if (id === 'menu') {
    api.backToTitle();
  } else if (id === 'resume') {
    api.togglePause();
  } else if (id === 'hint') {
    api.useHint();
  } else if (id === 'mute') {
    setMuted(!isMuted());
  }
  announce();
  return true;
}

function onAction(action) {
  const game = api.game;
  if (action === 'confirm') {
    if (game.screen === SCREEN_TITLE || game.screen === SCREEN_VICTORY) {
      api.startGame();
    } else if (game.screen === SCREEN_LEVEL_DONE) {
      api.nextLevel();
    } else if (game.screen === SCREEN_FAILED) {
      api.retryLevel();
    } else if (game.screen === SCREEN_PAUSED) {
      api.togglePause();
    }
  } else if (action === 'pause') {
    api.togglePause();
  } else if (action === 'hint') {
    api.useHint();
  } else if (action === 'restart') {
    if (game.screen === SCREEN_PLAY || game.screen === SCREEN_PAUSED || game.screen === SCREEN_FAILED) {
      api.retryLevel();
    }
  } else if (action === 'mute') {
    setMuted(!isMuted());
  }
  announce();
}

function onPanelClick(panel, x, y) {
  api.clickPanel(panel, x, y);
  announce();
}

createInput(canvas, { onButton, onAction, onPanelClick });

function runShot(name) {
  stageShot(name, api);
  let painted = 0;
  function paint() {
    renderer.draw(api);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let previous = performance.now();
  let accumulator = 0;
  const STEP = 1 / 60;
  const MAX_FRAME = 0.25;
  function frame(now) {
    const elapsed = Math.min((now - previous) / 1000, MAX_FRAME);
    previous = now;
    accumulator += elapsed;
    while (accumulator >= STEP) {
      api.advance(STEP);
      accumulator -= STEP;
    }
    renderer.draw(api);
    if (api.game.screen === SCREEN_VICTORY && api.game.score > 0) saveBest(api.game.score);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if (shot !== null) runShot(shot);
else runGame();
announce();
