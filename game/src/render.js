// The renderer: it paints the whole 1280 x 720 field every frame — header,
// the two picture panels, the markers on found differences, the footer — and
// the overlay screen on top (title, pause, level done, victory, failed).
//
// Buttons are drawn on the canvas. Each screen's buttons are listed by
// buttonsFor(), in field coordinates, so the click test in main.js checks the
// same rectangles this file draws.

import {
  FIELD,
  FONT,
  FOOTER,
  HEADER,
  LEFT_PANEL,
  MARK_RING,
  PALETTE,
  PANEL,
  RIGHT_PANEL,
  SCREEN_FAILED,
  SCREEN_LEVEL_DONE,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  SCREEN_VICTORY,
} from './config.js';
import { LEVELS } from './scenes.js';
import { isMuted } from './audio.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function heart(ctx, x, y, size, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.9);
  ctx.bezierCurveTo(x - size * 1.1, y, x - size * 0.5, y - size * 0.9, x, y - size * 0.25);
  ctx.bezierCurveTo(x + size * 0.5, y - size * 0.9, x + size * 1.1, y, x, y + size * 0.9);
  ctx.closePath();
  ctx.fill();
}

function star(ctx, x, y, outer, inner, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export function buttonsFor(screen, game) {
  const centre = FIELD.width / 2;
  if (screen === SCREEN_TITLE) {
    return [{ id: 'start', x: centre - 130, y: 470, w: 260, h: 64, label: 'Mulai Main' }];
  }
  if (screen === SCREEN_PAUSED) {
    return [
      { id: 'resume', x: centre - 130, y: 400, w: 260, h: 56, label: 'Lanjutkan' },
      { id: 'menu', x: centre - 130, y: 472, w: 260, h: 56, label: 'Menu Utama' },
    ];
  }
  if (screen === SCREEN_LEVEL_DONE) {
    return [{ id: 'next', x: centre - 150, y: 480, w: 300, h: 60, label: 'Level Berikutnya' }];
  }
  if (screen === SCREEN_VICTORY) {
    return [{ id: 'again', x: centre - 130, y: 500, w: 260, h: 60, label: 'Main Lagi' }];
  }
  if (screen === SCREEN_FAILED) {
    return [
      { id: 'retry', x: centre - 270, y: 470, w: 250, h: 60, label: 'Coba Lagi' },
      { id: 'menu', x: centre + 20, y: 470, w: 250, h: 60, label: 'Menu Utama' },
    ];
  }
  if (screen === SCREEN_PLAY) {
    return [
      { id: 'hint', x: 1080, y: 30, w: 150, h: 44, label: `Petunjuk (${game.hints})` },
      { id: 'mute', x: 1080, y: 82, w: 150, h: 44, label: isMuted() ? 'Suara: Mati' : 'Suara: Nyala' },
    ];
  }
  return [];
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function fitCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
  }

  function drawButton(button) {
    ctx.fillStyle = PALETTE.button;
    roundRect(ctx, button.x, button.y, button.w, button.h, 12);
    ctx.fill();
    ctx.strokeStyle = PALETTE.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = PALETTE.text;
    ctx.font = `700 ${button.h > 58 ? 24 : 19}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(button.label, button.x + button.w / 2, button.y + button.h / 2 + 1);
  }

  function drawHeader(game) {
    ctx.fillStyle = PALETTE.header;
    ctx.fillRect(0, 0, FIELD.width, HEADER.height);
    ctx.fillStyle = PALETTE.accent;
    ctx.font = `800 30px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('TAMAN SENJA', 40, 48);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `500 17px ${FONT}`;
    ctx.fillText(`Level ${game.levelIndex + 1} dari ${LEVELS.length} — ${LEVELS[game.levelIndex].name}`, 40, 76);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `500 15px ${FONT}`;
    ctx.fillText(LEVELS[game.levelIndex].subtitle, 40, 100);

    // The found counter, big and centred.
    const found = game.found.size;
    const total = LEVELS[game.levelIndex].differences.length;
    ctx.fillStyle = PALETTE.text;
    ctx.font = `800 40px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(`${found} / ${total}`, FIELD.width / 2, 58);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `500 15px ${FONT}`;
    ctx.fillText('perbedaan ditemukan', FIELD.width / 2, 82);

    // Timer.
    const lowTime = game.timeLeft <= 20;
    ctx.fillStyle = lowTime ? PALETTE.danger : PALETTE.text;
    ctx.font = `800 34px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.fillText(formatTime(game.timeLeft), 1050, 56);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `500 14px ${FONT}`;
    ctx.fillText('waktu tersisa', 1050, 80);

    // Hearts.
    for (let i = 0; i < 3; i += 1) {
      heart(ctx, 880 + i * 34, 96, 11, i < game.hearts ? '#ff6b81' : '#4a3a5e');
    }
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `500 14px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText('nyawa', 830, 100);

    // Score.
    ctx.fillStyle = PALETTE.text;
    ctx.font = `700 20px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.fillText(`Skor ${game.score}`, 1050, 118);
    ctx.textAlign = 'left';

    // Time bar.
    const barWidth = FIELD.width - 80;
    ctx.fillStyle = '#3a2a52';
    roundRect(ctx, 40, 122, barWidth, 6, 3);
    ctx.fill();
    ctx.fillStyle = lowTime ? PALETTE.danger : PALETTE.accent;
    roundRect(ctx, 40, 122, Math.max(0, barWidth * (game.timeLeft / 150)), 6, 3);
    ctx.fill();
  }

  function drawPanelFrame(panel, label, complete) {
    ctx.strokeStyle = complete ? PALETTE.good : PALETTE.panelFrame;
    ctx.lineWidth = complete ? 5 : 4;
    roundRect(ctx, panel.x - 4, panel.y - 4, panel.width + 8, panel.height + 8, 14);
    ctx.stroke();
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `600 15px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText(label, panel.x + 2, panel.y - 12);
    if (complete) {
      ctx.fillStyle = PALETTE.good;
      ctx.font = `700 16px ${FONT}`;
      ctx.textAlign = 'right';
      ctx.fillText('SELESAI', panel.x + panel.width - 2, panel.y - 12);
    }
  }

  function drawSceneInPanel(panel, level, side) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(panel.x, panel.y, panel.width, panel.height);
    ctx.clip();
    ctx.translate(panel.x, panel.y);
    level.paint(ctx, side);
    ctx.restore();
  }

  function drawMarkers(game) {
    const level = LEVELS[game.levelIndex];
    const panels = [LEFT_PANEL, RIGHT_PANEL];
    for (const difference of level.differences) {
      if (!game.found.has(difference.id)) continue;
      for (const panel of panels) {
        const x = panel.x + difference.x;
        const y = panel.y + difference.y;
        ctx.strokeStyle = PALETTE.good;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, MARK_RING, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - 11, y + 1);
        ctx.lineTo(x - 3, y + 9);
        ctx.lineTo(x + 12, y - 8);
        ctx.stroke();
      }
    }
    // The hint pulse: a ring that breathes over an unfound difference.
    if (game.hintPulse !== null && game.now < game.hintPulse.until) {
      const difference = level.differences.find((item) => item.id === game.hintPulse.id);
      if (difference) {
        const pulse = 0.5 + 0.5 * Math.sin(game.now * 8);
        const radius = MARK_RING + 4 + pulse * 8;
        for (const panel of panels) {
          ctx.strokeStyle = `rgba(255, 211, 138, ${0.55 + pulse * 0.45})`;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(panel.x + difference.x, panel.y + difference.y, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
    // The wrong-click cross, fading out.
    if (game.wrongFlash !== null && game.now < game.wrongFlash.until) {
      const panel = game.wrongFlash.panel === 'left' ? LEFT_PANEL : RIGHT_PANEL;
      const x = panel.x + game.wrongFlash.x;
      const y = panel.y + game.wrongFlash.y;
      const remain = (game.wrongFlash.until - game.now) / 0.6;
      ctx.strokeStyle = `rgba(255, 107, 107, ${remain})`;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - 13, y - 13);
      ctx.lineTo(x + 13, y + 13);
      ctx.moveTo(x + 13, y - 13);
      ctx.lineTo(x - 13, y + 13);
      ctx.stroke();
    }
  }

  function drawFooter() {
    ctx.fillStyle = PALETTE.footer;
    ctx.fillRect(0, FOOTER.y, FIELD.width, FOOTER.height);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `500 16px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Klik perbedaan pada salah satu gambar  •  H: petunjuk  •  P: jeda  •  R: ulang level  •  M: suara', FIELD.width / 2, FOOTER.y + 30);
    ctx.fillText('Temukan semua 7 perbedaan sebelum waktu habis. Tiga kali salah, level diulang.', FIELD.width / 2, FOOTER.y + 58);
    ctx.fillStyle = '#6f5f8f';
    ctx.font = `400 13px ${FONT}`;
    ctx.fillText('Taman Senja — game cari perbedaan orisinal. Semua gambar digambar dengan kode, tanpa file gambar.', FIELD.width / 2, FOOTER.y + 92);
  }

  function dim() {
    ctx.fillStyle = 'rgba(18, 12, 32, 0.72)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  }

  function overlayCard(x, y, w, h) {
    ctx.fillStyle = '#241b38';
    roundRect(ctx, x, y, w, h, 20);
    ctx.fill();
    ctx.strokeStyle = PALETTE.panelFrame;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawTitle(game, best) {
    // The first scene behind the title, dimmed, so the game shows itself at once.
    drawSceneInPanel(LEFT_PANEL, LEVELS[0], 0);
    drawSceneInPanel(RIGHT_PANEL, LEVELS[0], 1);
    drawPanelFrame(LEFT_PANEL, 'Gambar A', false);
    drawPanelFrame(RIGHT_PANEL, 'Gambar B', false);
    dim();
    ctx.fillStyle = PALETTE.accent;
    ctx.font = `800 64px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('TAMAN SENJA', FIELD.width / 2, 210);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `600 28px ${FONT}`;
    ctx.fillText('Cari Perbedaannya', FIELD.width / 2, 254);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `500 18px ${FONT}`;
    ctx.fillText('Dua gambar hampir sama. Ada 7 perbedaan di setiap level — temukan semuanya!', FIELD.width / 2, 300);
    ctx.fillText('3 level: taman senja, pantai pagi, dan pasar malam. 150 detik per level.', FIELD.width / 2, 330);
    ctx.fillText('Klik gambar yang berbeda, atau tekan Enter untuk mulai.', FIELD.width / 2, 360);
    if (best > 0) {
      ctx.fillStyle = PALETTE.accentSoft;
      ctx.font = `700 20px ${FONT}`;
      ctx.fillText(`Skor terbaik: ${best}`, FIELD.width / 2, 410);
    }
    for (const button of buttonsFor(SCREEN_TITLE, game)) drawButton(button);
  }

  function drawPaused(game) {
    dim();
    overlayCard(FIELD.width / 2 - 260, 240, 520, 320);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `800 40px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Jeda', FIELD.width / 2, 310);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `500 18px ${FONT}`;
    ctx.fillText('Istirahat sebentar — waktunya berhenti.', FIELD.width / 2, 348);
    for (const button of buttonsFor(SCREEN_PAUSED, game)) drawButton(button);
  }

  function drawLevelDone(game) {
    dim();
    overlayCard(FIELD.width / 2 - 300, 170, 600, 380);
    ctx.fillStyle = PALETTE.good;
    ctx.font = `800 38px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Level Selesai!', FIELD.width / 2, 240);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `600 22px ${FONT}`;
    ctx.fillText(`${LEVELS[game.levelIndex].name} — semua 7 perbedaan ketemu`, FIELD.width / 2, 282);
    const stars = game.mistakes === 0 ? 3 : game.mistakes === 1 ? 2 : 1;
    for (let i = 0; i < 3; i += 1) {
      star(ctx, FIELD.width / 2 + (i - 1) * 84, 350, 30, 13, i < stars ? '#ffd93d' : '#4a3a5e');
    }
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `500 18px ${FONT}`;
    ctx.fillText(`Skor level: ${game.levelScore}   •   Skor total: ${game.score}`, FIELD.width / 2, 420);
    for (const button of buttonsFor(SCREEN_LEVEL_DONE, game)) drawButton(button);
  }

  function drawVictory(game, best) {
    dim();
    overlayCard(FIELD.width / 2 - 320, 130, 640, 440);
    ctx.fillStyle = PALETTE.accent;
    ctx.font = `800 44px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Kamu Menang!', FIELD.width / 2, 210);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `600 22px ${FONT}`;
    ctx.fillText('Semua 21 perbedaan di 3 level sudah ketemu.', FIELD.width / 2, 256);
    star(ctx, FIELD.width / 2 - 84, 320, 30, 13, '#ffd93d');
    star(ctx, FIELD.width / 2, 320, 36, 16, '#ffd93d');
    star(ctx, FIELD.width / 2 + 84, 320, 30, 13, '#ffd93d');
    ctx.fillStyle = PALETTE.text;
    ctx.font = `800 30px ${FONT}`;
    ctx.fillText(`Skor akhir: ${game.score}`, FIELD.width / 2, 400);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `500 18px ${FONT}`;
    ctx.fillText(`Skor terbaik: ${best}`, FIELD.width / 2, 434);
    for (const button of buttonsFor(SCREEN_VICTORY, game)) drawButton(button);
  }

  function drawFailed(game) {
    dim();
    overlayCard(FIELD.width / 2 - 300, 200, 600, 330);
    ctx.fillStyle = PALETTE.danger;
    ctx.font = `800 38px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Level Gagal', FIELD.width / 2, 272);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `600 21px ${FONT}`;
    ctx.fillText(game.message || 'Coba lagi, ya!', FIELD.width / 2, 316);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `500 17px ${FONT}`;
    ctx.fillText(`Kamu sudah menemukan ${game.found.size} dari 7 perbedaan di level ini.`, FIELD.width / 2, 350);
    ctx.fillText(`Skor sejauh ini: ${game.score}`, FIELD.width / 2, 380);
    for (const button of buttonsFor(SCREEN_FAILED, game)) drawButton(button);
  }

  function draw(api) {
    const game = api.game;
    const screen = game.screen;
    fitCanvas();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const scale = Math.min(canvas.width / FIELD.width, canvas.height / FIELD.height);
    ctx.setTransform(scale, 0, 0, scale, (canvas.width - FIELD.width * scale) / 2, (canvas.height - FIELD.height * scale) / 2);
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(-100, -100, FIELD.width + 200, FIELD.height + 200);

    if (screen === SCREEN_TITLE) {
      drawHeader(api.game);
      drawTitle(game, api.game.best);
      drawFooter();
      return;
    }

    drawHeader(game);
    const level = LEVELS[game.levelIndex];
    const complete = game.found.size === level.differences.length;
    drawSceneInPanel(LEFT_PANEL, level, 0);
    drawSceneInPanel(RIGHT_PANEL, level, 1);
    drawPanelFrame(LEFT_PANEL, 'Gambar A', complete);
    drawPanelFrame(RIGHT_PANEL, 'Gambar B', complete);
    drawMarkers(game);
    drawFooter();

    if (screen === SCREEN_PLAY) {
      for (const button of buttonsFor(SCREEN_PLAY, game)) drawButton(button);
    } else if (screen === SCREEN_PAUSED) {
      drawPaused(game);
    } else if (screen === SCREEN_LEVEL_DONE) {
      drawLevelDone(game);
    } else if (screen === SCREEN_VICTORY) {
      drawVictory(game, game.best);
    } else if (screen === SCREEN_FAILED) {
      drawFailed(game);
    }
    void dpr;
  }

  return { draw, buttonsFor };
}
