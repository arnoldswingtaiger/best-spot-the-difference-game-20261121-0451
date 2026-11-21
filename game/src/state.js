// The game's state: which screen is up, which level is being played, what has
// been found, how much time and how many hearts and hints are left, and the
// score. Nothing here touches the canvas; the renderer paints this state.
//
// A click lands on a panel in panel coordinates. If it is close enough to an
// unfound difference it is found; otherwise it is a mistake. Finding the last
// difference of a level ends the level; three mistakes, or the clock running
// out, fails it.

import {
  CLICK_RADIUS,
  HEARTS_PER_LEVEL,
  HINTS_PER_LEVEL,
  LEVEL_TIME,
  POINTS_LEVEL_BONUS,
  POINTS_PER_FIND,
  POINTS_TIME_BONUS_PER_SECOND,
  POINTS_WRONG_CLICK,
  SCREEN_FAILED,
  SCREEN_LEVEL_DONE,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  SCREEN_VICTORY,
  WRONG_FLASH_SECONDS,
  HINT_PULSE_SECONDS,
} from './config.js';
import { LEVELS } from './scenes.js';
import {
  playClick,
  playFailed,
  playFound,
  playHint,
  playLevelDone,
  playVictory,
  playWrong,
} from './audio.js';

export function createGame() {
  const game = {
    screen: SCREEN_TITLE,
    levelIndex: 0,
    found: new Set(),
    hearts: HEARTS_PER_LEVEL,
    hints: HINTS_PER_LEVEL,
    timeLeft: LEVEL_TIME,
    score: 0,
    levelScore: 0,
    best: 0,
    mistakes: 0,
    wrongFlash: null, // { x, y, panel, until } in panel coordinates
    hintPulse: null, // { id, until }
    hinted: new Set(), // differences already hinted at, so a hint picks a new one
    message: '',
    messageUntil: 0,
    now: 0, // seconds since the game started, advanced by the loop
    pausedFrom: null,
  };

  function level() {
    return LEVELS[game.levelIndex];
  }

  function startLevel(index) {
    game.levelIndex = index;
    game.found = new Set();
    game.hearts = HEARTS_PER_LEVEL;
    game.hints = HINTS_PER_LEVEL;
    game.timeLeft = LEVEL_TIME;
    game.levelScore = 0;
    game.mistakes = 0;
    game.wrongFlash = null;
    game.hintPulse = null;
    game.hinted = new Set();
    game.message = '';
    game.screen = SCREEN_PLAY;
  }

  function startGame() {
    game.score = 0;
    startLevel(0);
  }

  function finishLevel() {
    const timeBonus = Math.round(game.timeLeft) * POINTS_TIME_BONUS_PER_SECOND;
    game.levelScore += POINTS_LEVEL_BONUS + timeBonus;
    game.score += POINTS_LEVEL_BONUS + timeBonus;
    if (game.levelIndex + 1 >= LEVELS.length) {
      game.screen = SCREEN_VICTORY;
      if (game.score > game.best) game.best = game.score;
      playVictory();
    } else {
      game.screen = SCREEN_LEVEL_DONE;
      playLevelDone();
    }
  }

  function failLevel(reason) {
    game.screen = SCREEN_FAILED;
    game.message = reason;
    playFailed();
  }

  function nearestDifference(x, y) {
    let nearest = null;
    let nearestDistance = Infinity;
    for (const difference of level().differences) {
      const dx = difference.x - x;
      const dy = difference.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = difference;
      }
    }
    return nearestDistance <= CLICK_RADIUS ? nearest : null;
  }

  function clickPanel(panel, x, y) {
    if (game.screen !== SCREEN_PLAY) return;
    const difference = nearestDifference(x, y);
    if (difference !== null && !game.found.has(difference.id)) {
      game.found.add(difference.id);
      game.levelScore += POINTS_PER_FIND;
      game.score += POINTS_PER_FIND;
      game.wrongFlash = null;
      playFound();
      if (game.found.size === level().differences.length) finishLevel();
      return;
    }
    if (difference !== null) {
      // Clicking a spot already found is harmless: just a tick.
      playClick();
      return;
    }
    game.hearts -= 1;
    game.mistakes += 1;
    game.wrongFlash = { x, y, panel, until: game.now + WRONG_FLASH_SECONDS };
    playWrong();
    if (game.hearts <= 0) failLevel('Tiga kali salah — hati habis!');
  }

  function useHint() {
    if (game.screen !== SCREEN_PLAY || game.hints <= 0) return;
    const remaining = level().differences.filter(
      (difference) => !game.found.has(difference.id) && !game.hinted.has(difference.id),
    );
    const pool = remaining.length > 0 ? remaining : level().differences.filter(
      (difference) => !game.found.has(difference.id),
    );
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    game.hinted.add(pick.id);
    game.hints -= 1;
    game.hintPulse = { id: pick.id, until: game.now + HINT_PULSE_SECONDS };
    playHint();
  }

  function togglePause() {
    if (game.screen === SCREEN_PLAY) {
      game.screen = SCREEN_PAUSED;
      game.pausedFrom = game.screen;
    } else if (game.screen === SCREEN_PAUSED) {
      game.screen = SCREEN_PLAY;
    }
  }

  function advance(seconds) {
    game.now += seconds;
    if (game.screen !== SCREEN_PLAY) return;
    game.timeLeft -= seconds;
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      failLevel('Waktu habis!');
    }
  }

  function foundCount() {
    return game.found.size;
  }

  function totalDifferences() {
    return level().differences.length;
  }

  return {
    game,
    level,
    startGame,
    startLevel,
    clickPanel,
    useHint,
    togglePause,
    advance,
    foundCount,
    totalDifferences,
    nextLevel() {
      startLevel(game.levelIndex + 1);
    },
    retryLevel() {
      startLevel(game.levelIndex);
    },
    backToTitle() {
      game.screen = SCREEN_TITLE;
    },
  };
}
