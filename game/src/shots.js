// The screenshot scenes behind ?shot=start|play|play2|end.
//
// Each one puts the real game into a fixed, repeatable state and paints it —
// the same code path a player goes through, with the clicks already made:
//   start — the title screen over the first scene, nothing found yet;
//   play  — level 1 mid-game, 3 of 7 differences found, 4 still to find;
//   play2 — level 2 mid-game, 2 of 7 found, on the beach scene;
//   end   — the victory screen after all three levels.
// The main loop paints twice, then sets window.__shotReady for the screenshot.

import { SCREEN_LEVEL_DONE, SCREEN_PLAY, SCREEN_TITLE, SCREEN_VICTORY } from './config.js';
import { LEVELS } from './scenes.js';

function markFound(api, ids) {
  for (const id of ids) api.game.found.add(id);
  api.game.levelScore += ids.length * 100;
  api.game.score += ids.length * 100;
}

export function stageShot(name, api) {
  const game = api.game;
  if (name === 'play') {
    api.startLevel(0);
    markFound(api, ['burung', 'bunga', 'ikan']);
    game.timeLeft = 98;
    game.hints = 2;
    game.screen = SCREEN_PLAY;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'play2') {
    api.startGame();
    api.startLevel(1);
    markFound(api, ['kepiting', 'bola']);
    game.timeLeft = 112;
    game.hints = 3;
    game.screen = SCREEN_PLAY;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'end') {
    api.startGame();
    for (let levelIndex = 0; levelIndex < LEVELS.length; levelIndex += 1) {
      api.startLevel(levelIndex);
      for (const difference of LEVELS[levelIndex].differences) {
        game.found.add(difference.id);
      }
      game.timeLeft = 40 + levelIndex * 12;
      game.levelScore = 700 + 250 + Math.round(game.timeLeft) * 2;
      game.score += game.levelScore;
    }
    game.screen = SCREEN_VICTORY;
    game.best = game.score;
    return { screen: SCREEN_VICTORY };
  }
  // start, and anything else: the title screen.
  api.startLevel(0);
  game.screen = SCREEN_TITLE;
  game.best = 0;
  return { screen: SCREEN_TITLE };
}

export { SCREEN_LEVEL_DONE, SCREEN_TITLE };
