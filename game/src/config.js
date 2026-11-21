// Taman Senja — Cari Perbedaannya: every tuning number in one place.
//
// The playfield is a fixed 1280 x 720 logical area. The renderer scales it to
// fit the browser window, so no rule below depends on the screen size. Two
// picture panels sit side by side; each level paints the same scene twice,
// with a handful of small changes between the two copies.

export const FIELD = { width: 1280, height: 720 };

// The two picture panels, in field coordinates.
export const PANEL = { width: 560, height: 420, y: 158, gap: 80 };
export const LEFT_PANEL = { x: 40, y: PANEL.y, width: PANEL.width, height: PANEL.height };
export const RIGHT_PANEL = { x: 680, y: PANEL.y, width: PANEL.width, height: PANEL.height };

// Header and footer bands, in field coordinates.
export const HEADER = { height: 132 };
export const FOOTER = { y: 596, height: 124 };

// How long a level lasts, and what a mistake costs.
export const LEVEL_TIME = 150;
export const HEARTS_PER_LEVEL = 3;
export const HINTS_PER_LEVEL = 3;

// Scoring.
export const POINTS_PER_FIND = 100;
export const POINTS_WRONG_CLICK = 25;
export const POINTS_LEVEL_BONUS = 250;
export const POINTS_TIME_BONUS_PER_SECOND = 2;

// How close a click must land to a difference's centre to count, in panel pixels.
export const CLICK_RADIUS = 34;

// The ring drawn around a found difference, and how long a wrong-click cross stays up.
export const MARK_RING = 26;
export const WRONG_FLASH_SECONDS = 0.6;
export const HINT_PULSE_SECONDS = 1.6;

// Screens the game moves between.
export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL_DONE = 'level-done';
export const SCREEN_VICTORY = 'victory';
export const SCREEN_FAILED = 'failed';

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

export const PALETTE = {
  backdrop: '#171223',
  header: '#221a33',
  panelFrame: '#3d2f5c',
  panelFrameFound: '#57c785',
  text: '#f5efe4',
  muted: '#b7a8d4',
  accent: '#ffb347',
  accentSoft: '#ffd28a',
  danger: '#ff6b6b',
  good: '#57c785',
  button: '#4a3572',
  buttonHover: '#5d4489',
  footer: '#241b38',
};

export const BEST_KEY = 'taman-senja.best';
