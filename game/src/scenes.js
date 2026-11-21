// The three scenes of Taman Senja. Every picture is drawn with canvas shapes —
// no image files, no copied art — and each level paints the same scene twice:
// the left copy and the right copy differ in exactly seven small places.
//
// A difference is a spot on the picture (x, y in panel pixels, 560 x 420) whose
// drawing changes with the side: side 0 is the left panel, side 1 the right one.
// Some differences are a thing present on one side and gone on the other;
// others are the same thing in a different colour or number.

import { createRandom } from './random.js';

export const PANEL_W = 560;
export const PANEL_H = 420;

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function cloud(ctx, x, y, scale, colour) {
  ctx.fillStyle = colour;
  circle(ctx, x, y, 18 * scale);
  circle(ctx, x + 20 * scale, y - 6 * scale, 14 * scale);
  circle(ctx, x + 40 * scale, y, 16 * scale);
  ellipse(ctx, x + 20 * scale, y + 6 * scale, 32 * scale, 12 * scale);
}

function bird(ctx, x, y, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 9, y);
  ctx.quadraticCurveTo(x - 4, y - 7, x, y);
  ctx.quadraticCurveTo(x + 4, y - 7, x + 9, y);
  ctx.stroke();
}

function flower(ctx, x, y, petal, centre) {
  ctx.fillStyle = petal;
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    circle(ctx, x + Math.cos(a) * 7, y + Math.sin(a) * 7, 5);
  }
  ctx.fillStyle = centre;
  circle(ctx, x, y, 4.5);
}

function grassTuft(ctx, x, y, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (const dx of [-8, -3, 2, 7]) {
    ctx.beginPath();
    ctx.moveTo(x + dx, y);
    ctx.lineTo(x + dx + 2, y - 10 - Math.abs(dx));
    ctx.stroke();
  }
}

// ---------------------------------------------------------------------------
// Level 1 — Taman Senja: a park at dusk, sun low, a pond and a bench.
// ---------------------------------------------------------------------------

function paintPark(ctx, side) {
  // Dusk sky.
  const sky = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  sky.addColorStop(0, '#2c1c50');
  sky.addColorStop(0.45, '#c65a6e');
  sky.addColorStop(0.8, '#ff9e5e');
  sky.addColorStop(1, '#ffc46b');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);

  // Sun, low over the hills.
  ctx.fillStyle = '#ffd97a';
  circle(ctx, 455, 95, 34);
  ctx.fillStyle = '#ffedb0';
  circle(ctx, 455, 95, 26);
  if (side === 0) {
    // Difference: rays around the sun.
    ctx.strokeStyle = '#ffd97a';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(455 + Math.cos(a) * 42, 95 + Math.sin(a) * 42);
      ctx.lineTo(455 + Math.cos(a) * 54, 95 + Math.sin(a) * 54);
      ctx.stroke();
    }
  }

  // Clouds.
  cloud(ctx, 90, 55, 1, 'rgba(255, 214, 180, 0.85)');
  if (side === 0) {
    // Difference: one more cloud, high in the middle.
    cloud(ctx, 250, 48, 0.8, 'rgba(255, 214, 180, 0.85)');
  }
  cloud(ctx, 480, 150, 0.7, 'rgba(255, 190, 150, 0.7)');

  // Birds. One of them only flies on the left picture.
  bird(ctx, 330, 78, '#3a2440');
  bird(ctx, 360, 60, '#3a2440');
  if (side === 0) bird(ctx, 400, 70, '#3a2440');

  // Rolling hills.
  ctx.fillStyle = '#5d3a6e';
  ctx.beginPath();
  ctx.moveTo(0, 260);
  ctx.quadraticCurveTo(140, 190, 300, 250);
  ctx.quadraticCurveTo(430, 300, PANEL_W, 240);
  ctx.lineTo(PANEL_W, PANEL_H);
  ctx.lineTo(0, PANEL_H);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#4a7a52';
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.quadraticCurveTo(180, 250, 360, 300);
  ctx.quadraticCurveTo(470, 330, PANEL_W, 290);
  ctx.lineTo(PANEL_W, PANEL_H);
  ctx.lineTo(0, PANEL_H);
  ctx.closePath();
  ctx.fill();

  // The pond, bottom right.
  ctx.fillStyle = '#7fc4d8';
  ellipse(ctx, 430, 345, 105, 42);
  ctx.fillStyle = '#a5d9e8';
  ellipse(ctx, 415, 338, 70, 24);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(380, 350);
  ctx.quadraticCurveTo(410, 344, 440, 350);
  ctx.stroke();
  if (side === 0) {
    // Difference: a fish under the pond's surface.
    ctx.fillStyle = '#ff8c42';
    ellipse(ctx, 430, 345, 14, 7);
    ctx.beginPath();
    ctx.moveTo(444, 345);
    ctx.lineTo(454, 338);
    ctx.lineTo(454, 352);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2c1c50';
    circle(ctx, 424, 343, 1.8);
  }

  // The big tree on the left.
  ctx.fillStyle = '#5a3a28';
  ctx.fillRect(72, 210, 16, 110);
  ctx.beginPath();
  ctx.moveTo(80, 230);
  ctx.lineTo(52, 180);
  ctx.lineTo(66, 200);
  ctx.lineTo(80, 170);
  ctx.lineTo(96, 200);
  ctx.lineTo(110, 182);
  ctx.lineTo(88, 232);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3f7a44';
  circle(ctx, 80, 165, 52);
  circle(ctx, 42, 195, 34);
  circle(ctx, 118, 195, 34);
  ctx.fillStyle = '#57a05c';
  circle(ctx, 66, 150, 26);
  circle(ctx, 102, 168, 22);

  // The bench, centre left, with a cat that only sits on one side.
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(140, 268, 110, 10);
  ctx.fillRect(140, 288, 110, 10);
  ctx.fillRect(148, 278, 8, 44);
  ctx.fillRect(234, 278, 8, 44);
  ctx.fillStyle = '#8d6540';
  ctx.fillRect(140, 248, 110, 8);
  if (side === 0) {
    ctx.fillStyle = '#e8e0d0';
    circle(ctx, 178, 252, 11);
    ellipse(ctx, 178, 262, 13, 8);
    ctx.beginPath();
    ctx.moveTo(170, 244);
    ctx.lineTo(168, 234);
    ctx.lineTo(174, 242);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(186, 244);
    ctx.lineTo(188, 234);
    ctx.lineTo(182, 242);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#e8e0d0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(190, 266);
    ctx.quadraticCurveTo(202, 262, 200, 250);
    ctx.stroke();
  }

  // The path winding to the bench.
  ctx.fillStyle = '#e8c890';
  ctx.beginPath();
  ctx.moveTo(250, PANEL_H);
  ctx.quadraticCurveTo(230, 360, 195, 330);
  ctx.lineTo(215, 322);
  ctx.quadraticCurveTo(255, 355, 285, PANEL_H);
  ctx.closePath();
  ctx.fill();

  // Flower beds along the bottom.
  ctx.fillStyle = '#3f7a44';
  ctx.fillRect(0, 392, PANEL_W, 28);
  flower(ctx, 40, 400, '#ff5d73', '#ffd97a');
  flower(ctx, 90, 408, '#ff8c42', '#7a2d1d');
  flower(ctx, 140, 400, '#c77dff', '#ffd97a');
  flower(ctx, 300, 400, side === 0 ? '#ff5d73' : '#ffd94d', '#7a2d1d');
  flower(ctx, 330, 408, '#ff8c42', '#ffd97a');
  flower(ctx, 520, 402, '#ff5d73', '#ffd97a');
  grassTuft(ctx, 200, 410, '#57a05c');
  grassTuft(ctx, 470, 412, '#57a05c');

  // A butterfly that only visits one picture.
  if (side === 0) {
    ctx.fillStyle = '#7dd8ff';
    ellipse(ctx, 344, 316, 8, 11);
    ellipse(ctx, 358, 316, 8, 11);
    ctx.fillStyle = '#2c1c50';
    ctx.fillRect(350, 312, 2, 12);
  }
}

// ---------------------------------------------------------------------------
// Level 2 — Pantai Pagi: a morning beach, sun up, a boat and a palm.
// ---------------------------------------------------------------------------

function paintBeach(ctx, side) {
  // Morning sky.
  const sky = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  sky.addColorStop(0, '#8ec9ee');
  sky.addColorStop(0.55, '#cfeef7');
  sky.addColorStop(1, '#fff3c4');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);

  // Sun, top left.
  ctx.fillStyle = '#ffe066';
  circle(ctx, 90, 70, 32);
  ctx.fillStyle = '#fff3b0';
  circle(ctx, 90, 70, 24);

  // Clouds, one of them only on the left picture.
  cloud(ctx, 200, 60, 0.9, 'rgba(255, 255, 255, 0.95)');
  if (side === 0) cloud(ctx, 330, 48, 0.75, 'rgba(255, 255, 255, 0.95)');
  cloud(ctx, 480, 90, 0.6, 'rgba(255, 255, 255, 0.9)');

  // The sea.
  ctx.fillStyle = '#2fa8c9';
  ctx.fillRect(0, 170, PANEL_W, 90);
  ctx.fillStyle = '#57c4de';
  ctx.fillRect(0, 170, PANEL_W, 26);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 2.5;
  for (const y of [196, 222, 246]) {
    ctx.beginPath();
    for (let x = 10; x < PANEL_W; x += 46) {
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 12, y - 5, x + 23, y);
    }
    ctx.stroke();
  }

  // The little boat, its sail red on one side and white on the other.
  ctx.fillStyle = '#7a4a21';
  ctx.beginPath();
  ctx.moveTo(272, 210);
  ctx.lineTo(340, 210);
  ctx.lineTo(326, 226);
  ctx.lineTo(286, 226);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5a3a28';
  ctx.fillRect(305, 158, 4, 52);
  ctx.fillStyle = side === 0 ? '#e84a5f' : '#f5f0e6';
  ctx.beginPath();
  ctx.moveTo(309, 160);
  ctx.lineTo(309, 206);
  ctx.lineTo(344, 206);
  ctx.closePath();
  ctx.fill();

  // The sand.
  ctx.fillStyle = '#f2d8a0';
  ctx.fillRect(0, 260, PANEL_W, 160);
  ctx.fillStyle = '#eac987';
  ctx.beginPath();
  ctx.ellipse(120, 300, 90, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(430, 380, 110, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // The umbrella, left centre.
  ctx.strokeStyle = '#8d6540';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(150, 250);
  ctx.lineTo(150, 340);
  ctx.stroke();
  ctx.fillStyle = '#ff6b6b';
  ctx.beginPath();
  ctx.moveTo(150, 250);
  ctx.arc(150, 250, 62, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd93d';
  ctx.beginPath();
  ctx.moveTo(150, 250);
  ctx.arc(150, 250, 62, Math.PI * 1.25, Math.PI * 1.75);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#4ecdc4';
  ctx.beginPath();
  ctx.moveTo(150, 250);
  ctx.arc(150, 250, 62, Math.PI * 1.5, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  // The beach ball, only on the left picture.
  if (side === 0) {
    circle(ctx, 120, 300, 20);
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.moveTo(120, 300);
    ctx.arc(120, 300, 20, -Math.PI / 2, Math.PI / 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.moveTo(120, 300);
    ctx.arc(120, 300, 20, Math.PI / 6, Math.PI * 5 / 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd93d';
    ctx.beginPath();
    ctx.moveTo(120, 300);
    ctx.arc(120, 300, 20, Math.PI * 5 / 6, Math.PI * 3 / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    circle(ctx, 120, 300, 5);
  }

  // The bucket, blue on one side and green on the other.
  ctx.fillStyle = side === 0 ? '#3d8bfd' : '#43aa5b';
  ctx.beginPath();
  ctx.moveTo(238, 330);
  ctx.lineTo(262, 330);
  ctx.lineTo(258, 362);
  ctx.lineTo(242, 362);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5a3a28';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(250, 330, 12, Math.PI, 0);
  ctx.stroke();

  // The starfish, only on the left picture.
  if (side === 0) {
    ctx.fillStyle = '#ff9f43';
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const a2 = a + Math.PI / 5;
      const x1 = 180 + Math.cos(a) * 14;
      const y1 = 370 + Math.sin(a) * 14;
      const x2 = 180 + Math.cos(a2) * 6;
      const y2 = 370 + Math.sin(a2) * 6;
      if (i === 0) ctx.moveTo(x1, y1);
      else ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e07b24';
    circle(ctx, 180, 370, 3);
  }

  // Shells scattered on the sand.
  ctx.fillStyle = '#ffffff';
  ellipse(ctx, 210, 392, 9, 6);
  ellipse(ctx, 330, 360, 8, 5);
  ctx.fillStyle = '#ffb6c1';
  ellipse(ctx, 90, 392, 8, 5);

  // The palm, right side. It holds three coconuts on one side, two on the other.
  ctx.strokeStyle = '#7a5230';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(470, 340);
  ctx.quadraticCurveTo(462, 260, 480, 180);
  ctx.stroke();
  ctx.strokeStyle = '#3f9e4d';
  ctx.lineWidth = 9;
  for (const [dx, dy, ex, ey] of [[-58, -18, -72, 8], [-30, -42, -52, -66], [6, -52, 22, -82], [42, -30, 74, -44], [52, -2, 84, 4], [-8, 6, -30, 34]]) {
    ctx.beginPath();
    ctx.moveTo(480 + dx * 0.4, 180 + dy * 0.4);
    ctx.quadraticCurveTo(480 + dx, 180 + dy, 480 + ex, 180 + ey);
    ctx.stroke();
  }
  ctx.fillStyle = '#6b4a2f';
  circle(ctx, 472, 188, 8);
  circle(ctx, 488, 192, 8);
  if (side === 0) circle(ctx, 480, 200, 8);

  // The crab, only on the left picture.
  if (side === 0) {
    ctx.fillStyle = '#ff6b6b';
    ellipse(ctx, 430, 350, 18, 12);
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 3;
    for (const [sx, sy] of [[-14, -8], [-8, -12], [8, -12], [14, -8]]) {
      ctx.beginPath();
      ctx.moveTo(430 + sx, 350 + sy);
      ctx.lineTo(430 + sx * 1.6, 350 + sy - 8);
      ctx.stroke();
    }
    ctx.fillStyle = '#2c1c50';
    circle(ctx, 424, 342, 2.5);
    circle(ctx, 436, 342, 2.5);
    ctx.fillStyle = '#ff6b6b';
    circle(ctx, 412, 348, 6);
    circle(ctx, 448, 348, 6);
  }
  grassTuft(ctx, 520, 400, '#c9a86a');
}

// ---------------------------------------------------------------------------
// Level 3 — Pasar Malam: a night market under string lights and the moon.
// ---------------------------------------------------------------------------

function paintMarket(ctx, side) {
  const random = createRandom(7);

  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  sky.addColorStop(0, '#0e1030');
  sky.addColorStop(0.6, '#232052');
  sky.addColorStop(1, '#3d2a63');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);

  // Stars, one of them bright and only on the left picture.
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 26; i += 1) {
    const x = 20 + random() * 520;
    const y = 14 + random() * 120;
    const r = 1 + random() * 1.6;
    circle(ctx, x, y, r);
  }
  if (side === 0) {
    ctx.fillStyle = '#ffe98a';
    circle(ctx, 200, 45, 3.5);
    ctx.strokeStyle = '#ffe98a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(200, 34);
    ctx.lineTo(200, 56);
    ctx.moveTo(189, 45);
    ctx.lineTo(211, 45);
    ctx.stroke();
  }

  // The moon, full on one side and crescent on the other.
  ctx.fillStyle = '#ffeeb0';
  circle(ctx, 470, 70, 30);
  if (side === 1) {
    ctx.fillStyle = '#232052';
    circle(ctx, 482, 62, 26);
  }
  ctx.fillStyle = 'rgba(255, 238, 176, 0.25)';
  circle(ctx, 470, 70, 38);

  // String lights across the top.
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 96);
  ctx.quadraticCurveTo(280, 130, PANEL_W, 96);
  ctx.stroke();
  const bulbColours = ['#ffd93d', '#ff6b6b', '#4ecdc4', '#c77dff', '#ffd93d', '#ff6b6b', '#4ecdc4'];
  for (let i = 0; i < 7; i += 1) {
    const x = 40 + i * 80;
    const y = 96 + Math.sin((x / PANEL_W) * Math.PI) * 22;
    ctx.strokeStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.moveTo(x, y - 8);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = bulbColours[i];
    circle(ctx, x, y + 4, 6);
  }

  // The ground.
  ctx.fillStyle = '#2e2140';
  ctx.fillRect(0, 330, PANEL_W, 90);
  ctx.fillStyle = '#3a2a52';
  ctx.fillRect(0, 330, PANEL_W, 8);

  // Left stall: striped awning, jars, and a sign that is round on one side.
  ctx.fillStyle = '#8d2f3c';
  ctx.fillRect(60, 180, 160, 14);
  for (let x = 76; x < 220; x += 32) {
    ctx.fillStyle = '#f5efe4';
    ctx.fillRect(x, 180, 16, 14);
  }
  ctx.fillStyle = '#5a3a28';
  ctx.fillRect(66, 194, 148, 8);
  ctx.fillRect(70, 202, 10, 128);
  ctx.fillRect(200, 202, 10, 128);
  ctx.fillStyle = '#e8c890';
  ctx.fillRect(66, 280, 148, 50);
  // Jars on the counter.
  ctx.fillStyle = '#ff8c42';
  ellipse(ctx, 100, 268, 12, 14);
  ctx.fillStyle = '#57c785';
  ellipse(ctx, 140, 268, 12, 14);
  ctx.fillStyle = '#c77dff';
  ellipse(ctx, 180, 268, 12, 14);
  // The sign above the stall.
  ctx.fillStyle = side === 0 ? '#ff6b9d' : '#4ecdc4';
  if (side === 0) {
    circle(ctx, 90, 158, 14);
  } else {
    ctx.fillRect(76, 144, 28, 28);
  }

  // Right stall: teal awning, fruit, and lanterns.
  ctx.fillStyle = '#1f6f6b';
  ctx.fillRect(330, 180, 170, 14);
  for (let x = 346; x < 500; x += 34) {
    ctx.fillStyle = '#f5efe4';
    ctx.fillRect(x, 180, 17, 14);
  }
  ctx.fillStyle = '#5a3a28';
  ctx.fillRect(336, 194, 158, 8);
  ctx.fillRect(340, 202, 10, 128);
  ctx.fillRect(480, 202, 10, 128);
  ctx.fillStyle = '#e8c890';
  ctx.fillRect(336, 280, 158, 50);
  // Fruit on the counter.
  ctx.fillStyle = '#ff5d73';
  circle(ctx, 370, 270, 10);
  circle(ctx, 392, 270, 10);
  ctx.fillStyle = '#ffd93d';
  circle(ctx, 414, 270, 10);
  ctx.fillStyle = '#57c785';
  circle(ctx, 436, 270, 10);
  circle(ctx, 458, 270, 10);

  // Lanterns hanging between the stalls. One is red, one gold.
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(250, 130);
  ctx.lineTo(250, 150);
  ctx.stroke();
  ctx.fillStyle = side === 0 ? '#e84a5f' : '#ffd93d';
  ellipse(ctx, 250, 168, 14, 18);
  ctx.fillStyle = '#ffd93d';
  ctx.fillRect(244, 148, 12, 4);
  ctx.fillRect(244, 184, 12, 4);

  // Balloons bunched by the right stall: three on one side, two on the other.
  ctx.strokeStyle = 'rgba(245, 239, 228, 0.8)';
  ctx.lineWidth = 1.5;
  for (const [bx, by] of [[480, 210], [500, 196]]) {
    ctx.beginPath();
    ctx.moveTo(bx, by + 14);
    ctx.lineTo(468, 250);
    ctx.stroke();
  }
  ctx.fillStyle = '#ff6b6b';
  ellipse(ctx, 480, 210, 12, 15);
  ctx.fillStyle = '#4ecdc4';
  ellipse(ctx, 500, 196, 12, 15);
  if (side === 0) {
    ctx.strokeStyle = 'rgba(245, 239, 228, 0.8)';
    ctx.beginPath();
    ctx.moveTo(462, 224);
    ctx.lineTo(468, 250);
    ctx.stroke();
    ctx.fillStyle = '#ffd93d';
    ellipse(ctx, 462, 210, 12, 15);
  }

  // A cat asleep on the left stall's roof, only on the left picture.
  if (side === 0) {
    ctx.fillStyle = '#3a2a52';
    ellipse(ctx, 300, 176, 18, 9);
    circle(ctx, 284, 170, 8);
    ctx.beginPath();
    ctx.moveTo(278, 164);
    ctx.lineTo(277, 156);
    ctx.lineTo(282, 162);
    ctx.closePath();
    ctx.fill();
  }

  // A firefly drifting over the ground, only on the left picture.
  if (side === 0) {
    ctx.fillStyle = 'rgba(190, 255, 120, 0.35)';
    circle(ctx, 380, 300, 12);
    ctx.fillStyle = '#beff78';
    circle(ctx, 380, 300, 4);
  }

  // Cobblestones.
  ctx.fillStyle = 'rgba(245, 239, 228, 0.12)';
  for (const [cx, cy] of [[80, 360], [180, 380], [300, 365], [420, 385], [500, 360], [240, 395]]) {
    ellipse(ctx, cx, cy, 26, 7);
  }
}

// ---------------------------------------------------------------------------
// The level list: name, subtitle, the seven spots, and the painter.
// ---------------------------------------------------------------------------

export const LEVELS = [
  {
    name: 'Taman Senja',
    subtitle: 'Taman di waktu senja',
    seed: 11,
    differences: [
      { id: 'burung', x: 400, y: 70 },
      { id: 'sinar-matahari', x: 455, y: 95 },
      { id: 'bunga', x: 300, y: 400 },
      { id: 'kucing', x: 178, y: 252 },
      { id: 'ikan', x: 430, y: 345 },
      { id: 'awan', x: 250, y: 48 },
      { id: 'kupu-kupu', x: 350, y: 316 },
    ],
    paint: paintPark,
  },
  {
    name: 'Pantai Pagi',
    subtitle: 'Pantai di pagi hari',
    seed: 23,
    differences: [
      { id: 'kepiting', x: 430, y: 350 },
      { id: 'layar', x: 322, y: 185 },
      { id: 'bintang-laut', x: 180, y: 370 },
      { id: 'kelapa', x: 480, y: 196 },
      { id: 'bola', x: 120, y: 300 },
      { id: 'awan', x: 330, y: 48 },
      { id: 'ember', x: 250, y: 346 },
    ],
    paint: paintBeach,
  },
  {
    name: 'Pasar Malam',
    subtitle: 'Pasar malam di bawah lampu',
    seed: 37,
    differences: [
      { id: 'lampion', x: 250, y: 168 },
      { id: 'balon', x: 462, y: 210 },
      { id: 'bulan', x: 470, y: 70 },
      { id: 'kucing', x: 300, y: 172 },
      { id: 'bintang', x: 200, y: 45 },
      { id: 'kunang-kunang', x: 380, y: 300 },
      { id: 'papan', x: 90, y: 158 },
    ],
    paint: paintMarket,
  },
];
