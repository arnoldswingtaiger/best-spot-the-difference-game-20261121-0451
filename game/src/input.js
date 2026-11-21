// Input: mouse clicks on the two panels, and the keyboard.
//
// The canvas is scaled to fit the window, so a click's client coordinates are
// turned into field coordinates (1280 x 720) before anything asks which panel
// it landed on. Buttons are drawn on the canvas itself, so clicks on them are
// tested here too, against the same rectangles the renderer draws.

import { FIELD, LEFT_PANEL, RIGHT_PANEL, SCREEN_PLAY } from './config.js';

export const ACTION_CONFIRM = 'confirm';
export const ACTION_PAUSE = 'pause';
export const ACTION_HINT = 'hint';
export const ACTION_RESTART = 'restart';
export const ACTION_MUTE = 'mute';

export function createInput(canvas, handlers) {
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    scale = Math.min(rect.width / FIELD.width, rect.height / FIELD.height);
    offsetX = rect.left + (rect.width - FIELD.width * scale) / 2;
    offsetY = rect.top + (rect.height - FIELD.height * scale) / 2;
  }

  function toField(clientX, clientY) {
    return {
      x: (clientX - offsetX) / scale,
      y: (clientY - offsetY) / scale,
    };
  }

  function panelAt(field) {
    for (const [name, panel] of [['left', LEFT_PANEL], ['right', RIGHT_PANEL]]) {
      if (
        field.x >= panel.x && field.x <= panel.x + panel.width &&
        field.y >= panel.y && field.y <= panel.y + panel.height
      ) {
        return { name, x: field.x - panel.x, y: field.y - panel.y };
      }
    }
    return null;
  }

  function onPointerDown(event) {
    resize();
    const field = toField(event.clientX, event.clientY);
    if (handlers.onButton && handlers.onButton(field.x, field.y)) return;
    const hit = panelAt(field);
    if (hit !== null) handlers.onPanelClick(hit.name, hit.x, hit.y);
  }

  function onKeyDown(event) {
    const key = event.key.toLowerCase();
    if (key === 'enter' || key === ' ') {
      event.preventDefault();
      handlers.onAction(ACTION_CONFIRM);
    } else if (key === 'p' || key === 'escape') {
      handlers.onAction(ACTION_PAUSE);
    } else if (key === 'h') {
      handlers.onAction(ACTION_HINT);
    } else if (key === 'r') {
      handlers.onAction(ACTION_RESTART);
    } else if (key === 'm') {
      handlers.onAction(ACTION_MUTE);
    }
  }

  window.addEventListener('resize', resize);
  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('keydown', onKeyDown);
  resize();

  return {
    resize,
    toField,
    panelAt,
  };
}

// The rectangles a screen's buttons occupy, in field coordinates, so the
// renderer and the click test agree. Each entry: { id, x, y, w, h }.
export function buttonHit(buttons, x, y) {
  for (const button of buttons) {
    if (x >= button.x && x <= button.x + button.w && y >= button.y && y <= button.y + button.h) {
      return button.id;
    }
  }
  return null;
}

export { SCREEN_PLAY };
