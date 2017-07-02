/* imported GET_TOUCHY */

(function(){
'use strict';

const GUY_COLOR = 'orange';
const GOAL_COLOR = 'cornflowerblue';
const BG_COLOR = 'black';
const CONTROL_COLOR = 'white';

const GRID_ROWS = 8;
const GRID_COLS = 8;
const GRID_W = 55;
const GRID_H = 55;
const ZERO_W = GRID_W * .6;
const ZERO_H = GRID_H * .6;
const ONE_W = GRID_W * .2;
const ONE_H = GRID_H * .6;
const ZERO_INNER_W = GRID_W * .3;
const ZERO_INNER_H = GRID_H * .3;
const PAIR_OFFSET = 4;

const EQ_W = GRID_W * .7;

let RESIZE_SCALE = 1;
let LANDSCAPE = true;

const PAD_X = 10;
const PAD_Y = 10;

const LANDSCAPE_CONTROLS_X = 480;
const LANDSCAPE_CONTROLS_Y = 10;
const PORTRAIT_CONTROLS_X = 250;
const PORTRAIT_CONTROLS_Y = 20;
let CONTROLS_X = 10;
let CONTROLS_Y = 10;

const CONTROL_W = 48;
const CONTROL_H = 80;
const CONTROL_PAD_X = 50;
const CONTROL_PAD_Y = 25;

const ICON_W = 10;
const ICON_H = 20;
const BIT_ICON_W = 30;
const BIT_ICON_H = 30;

const LANDSCAPE_LEGEND_X = LANDSCAPE_CONTROLS_X - 20;
const LANDSCAPE_LEGEND_Y = LANDSCAPE_CONTROLS_Y + CONTROL_PAD_Y * 2+ CONTROL_H * 2;
const PORTRAIT_LEGEND_X = 20;
const PORTRAIT_LEGEND_Y = 5;
let LEGEND_X = 10;
let LEGEND_Y = 10;

const LANDSCAPE_GRID_X = 10;
const LANDSCAPE_GRID_Y = 10;
const PORTRAIT_GRID_X = 10;
const PORTRAIT_GRID_Y = 230;
let GRID_X = 10;
let GRID_Y = 10;

const GRID_ANIM_MS = 150;
const MOVE_ANIM_MS = 250;
const WIN_DELAY_MS = 50;
const LEVEL_SWITCH_MS = 500;
const GUY_SCALE = 0.8;

let LEVEL_STATE = null;
let LEVEL_SWITCH = null;

const BUTTON_LAYOUT = {};
const BUTTON_HELD_OFFSET = 5;

const cnv = document.getElementById('cnv');
const ctx = cnv.getContext('2d');

let DPR = 1;
if (window.devicePixelRatio) {
  DPR = window.devicePixelRatio;
}


const setSize = function () {
  LANDSCAPE = window.innerWidth > window.innerHeight;
  if (LANDSCAPE) {
    CONTROLS_X = LANDSCAPE_CONTROLS_X;
    CONTROLS_Y = LANDSCAPE_CONTROLS_Y;
    LEGEND_X = LANDSCAPE_LEGEND_X;
    LEGEND_Y = LANDSCAPE_LEGEND_Y;
    GRID_X = LANDSCAPE_GRID_X;
    GRID_Y = LANDSCAPE_GRID_Y;
  } else {
    CONTROLS_X = PORTRAIT_CONTROLS_X;
    CONTROLS_Y = PORTRAIT_CONTROLS_Y;
    LEGEND_X = PORTRAIT_LEGEND_X;
    LEGEND_Y = PORTRAIT_LEGEND_Y;
    GRID_X = PORTRAIT_GRID_X;
    GRID_Y = PORTRAIT_GRID_Y;
  }

  {
    const l = BUTTON_LAYOUT;
    l.gridMinX = GRID_X;
    l.gridMinY = GRID_Y;
    l.gridMaxX = GRID_X + GRID_W * GRID_COLS;
    l.gridMaxY = GRID_Y + GRID_H * GRID_ROWS;

    l.stepMinX = CONTROLS_X + CONTROL_W + CONTROL_PAD_X / 2;
    l.stepMinY = CONTROLS_Y;
    l.stepMaxX = CONTROLS_X + CONTROL_PAD_X * 2 + CONTROL_W * 2;
    l.stepMaxY = CONTROLS_Y + CONTROL_H;

    l.playMinX = CONTROLS_X + CONTROL_W;
    l.playMinY = CONTROLS_Y + CONTROL_H;
    l.playMaxX = CONTROLS_X + CONTROL_PAD_X * 2 + CONTROL_W * 2;
    l.playMaxY = CONTROLS_Y + CONTROL_PAD_Y * 2 + CONTROL_H * 2;

    l.resetMinX = CONTROLS_X - CONTROL_PAD_X / 2;
    l.resetMinY = CONTROLS_Y;
    l.resetMaxX = CONTROLS_X + CONTROL_W + CONTROL_PAD_X / 2;
    l.resetMaxY = CONTROLS_Y + CONTROL_H;
  }

  const desiredWidth = LANDSCAPE ?
    LANDSCAPE_LEGEND_X + GRID_W * 3.5 + PAD_X :
    GRID_X + GRID_W * GRID_COLS + PAD_X;
  const desiredHeight = GRID_Y + GRID_H * GRID_ROWS + PAD_Y;

  let width = Math.min(window.innerWidth, desiredWidth);
  let height = Math.min(window.innerHeight, desiredHeight);

  let widthScale = 1;
  let heightScale = 1;
  if (width < desiredWidth) {
    widthScale = width / desiredWidth;
  }
  if (height < desiredHeight) {
    heightScale = height / desiredHeight;
  }

  cnv.width = desiredWidth * DPR;
  cnv.height = desiredHeight * DPR;

  RESIZE_SCALE = 1;
  if (widthScale < heightScale) {
    height = Math.floor(desiredHeight * widthScale);
    RESIZE_SCALE = widthScale;
  } else if (heightScale < widthScale) {
    width = Math.floor(desiredWidth * heightScale);
    RESIZE_SCALE = heightScale;
  }

  cnv.style.width = width + 'px';
  cnv.style.height = height + 'px';

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(DPR, DPR);
}

const handleResize = function (e) {
  setSize();
  requestDraw();
};

const lerp = function (x0, x1, t) {
  return x0 + (x1 - x0) * t;
};

const draw0 = function (ctx, {x, y}, offset, holeColor, t) {
  if (t >= 1) {
    return;
  }
  {
    const x0 = x + (GRID_W - ZERO_W)/2 + offset;
    const y0 = y + (GRID_H - ZERO_H)/2;
    const w0 = ZERO_W;
    const h0 = ZERO_H;

    const x1 = x + GRID_W/2;
    const y1 = y + GRID_H/2;
    const w1 = 0;
    const h1 = 0;

    const xN = lerp(x0, x1, t);
    const yN = lerp(y0, y1, t);
    const wN = lerp(w0, w1, t);
    const hN = lerp(h0, h1, t);
    ctx.fillStyle = 'white';
    ctx.fillRect(xN, yN, wN, hN)
  }
  {
    const x0 = x + (GRID_W - ZERO_INNER_W)/2 + offset;
    const y0 = y + (GRID_H - ZERO_INNER_H)/2;
    const w0 = ZERO_INNER_W;
    const h0 = ZERO_INNER_H;

    const x1 = x + GRID_W/2;
    const y1 = y + GRID_H/2;
    const w1 = 0;
    const h1 = 0;

    const xN = lerp(x0, x1, t);
    const yN = lerp(y0, y1, t);
    const wN = lerp(w0, w1, t);
    const hN = lerp(h0, h1, t);

    ctx.fillStyle = holeColor;
    ctx.fillRect(xN, yN, wN, hN);
  }
};

const drawIcon0 = function (ctx, x, y, w, h) {
  ctx.save();
  ctx.scale(w / GRID_W, h / GRID_H);

  draw0(ctx, {x: x * GRID_W / w, y: y * GRID_H / h}, 0, 'black', 0);

  ctx.restore();
};

const draw1 = function (ctx, {x, y}, offset, t) {
  const x0 = x + (GRID_W - ONE_W)/2 + offset;
  const y0 = y + (GRID_H - ONE_H)/2;
  const w0 = ONE_W;
  const h0 = ONE_H;

  const x1 = x;
  const y1 = y;
  const w1 = GRID_W;
  const h1 = GRID_H;

  const xN = lerp(x0, x1, t);
  const yN = lerp(y0, y1, t);
  const wN = lerp(w0, w1, t);
  const hN = lerp(h0, h1, t);

  const vN = Math.floor(lerp(255, 128, t));
  ctx.fillStyle = `rgb(${vN},${vN},${vN})`;
  ctx.fillRect(xN, yN, wN, hN);

  if (t > 0) {
    const v = Math.floor(lerp(255, 64, t));
    ctx.strokeStyle = `rgb(${v},${v},${v})`;

    ctx.strokeRect(xN - .5, yN - .5, wN, hN);
  }
};

const drawIcon1 = function (ctx, x, y, w, h) {
  ctx.save();
  ctx.scale(w / GRID_W, h / GRID_H);

  draw1(ctx, {x: x * GRID_W / w, y: y * GRID_H / h}, 0, 0);

  ctx.restore();
};

const drawEq = function ({x, y}) {
  ctx.fillStyle = 'white';
  ctx.fillRect(x + GRID_W / 5, y + GRID_H * 4 / 12, GRID_W * 3 / 8, GRID_W / 8);
  ctx.fillRect(x + GRID_W / 5, y + GRID_H * 7 / 12, GRID_W * 3 / 8, GRID_W / 8);
};

const drawGrid = function (grid, t, guyAt, goalAt) {
  ctx.lineWidth = 1;
  for (let j = 0; j < GRID_ROWS; j ++) {
    for (let i = 0; i < GRID_COLS; i ++) {
      const x = GRID_X + i * GRID_W;
      const y = GRID_Y + j * GRID_H;
      const offset = (i % 2) === 0 ? PAIR_OFFSET : -PAIR_OFFSET;

      let holeColor;
      if (i === guyAt.i && j === guyAt.j) {
        holeColor = GUY_COLOR;
      } else if (i === goalAt.i && j === goalAt.j) {
        holeColor = GOAL_COLOR;
      } else {
        holeColor = BG_COLOR;
      }

      if (grid[j][i] === 1) {
        draw1(ctx, {x, y}, offset, t);
      } else {
        draw0(ctx, {x, y}, offset, holeColor, t);
      } // end else (0)
    } // end i loop
  } // end j loop

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'grey';
  ctx.strokeRect(GRID_X, GRID_Y, GRID_W * GRID_COLS, GRID_H * GRID_ROWS);
};

const drawBGGrid = function (grid, t) {
  if (t === 0) {
    return;
  }
  ctx.lineWidth = 1;
  const vN = Math.floor(lerp(0, 64, t));
  ctx.strokeStyle = `rgb(${vN},${vN},${vN})`;

  for (let j = 0; j < GRID_ROWS; j++) {
    for (let i = 0; i < GRID_COLS; i++) {
      if (grid[j][i] === 0) {
        const x = GRID_X + i * GRID_W;
        const y = GRID_Y + j * GRID_H;
        ctx.strokeRect(x - .5, y - .5, GRID_W, GRID_H);
      }
    }
  }
};

const drawGuy = function ({i, j, w, h}, t) {
  const scale = lerp(1, GUY_SCALE, t);
  ctx.fillStyle = GUY_COLOR;
  ctx.fillRect(GRID_X + GRID_W * i + GRID_W * w * (1 - scale) / 2,
               GRID_Y + GRID_H * j + GRID_H * h * (1 - scale) / 2,
               GRID_W * w * scale - 1, GRID_H * h * scale - 1);
};

const drawGoal = function ({i, j}) {
  ctx.fillStyle = GOAL_COLOR;
  ctx.fillRect(GRID_X + GRID_W * i, GRID_Y + GRID_H * j,
               GRID_W-1, GRID_H-1);
};

const drawPC = function (pc) {
  if (pc < 0) {
    pc += GRID_ROWS * GRID_COLS / 2;
  }

  const j = Math.floor(pc / 4);
  const i = (pc - j * 4) * 2;
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;

  ctx.strokeRect(GRID_X + GRID_W * i, GRID_Y + GRID_H * j,
                 GRID_W * 2 - 1, GRID_H - 1);

  const v = LEVEL_STATE.grid[j][i] * 2 + LEVEL_STATE.grid[j][i+1];

  ctx.strokeRect(LEGEND_X, LEGEND_Y + GRID_H * v,
                 GRID_W * 3.5, GRID_H);
};

const drawPlay = function (ctx, x, y, w, h) {
  if (BUTTON_LAYOUT.playHeld) {
    x += BUTTON_HELD_OFFSET;
    y += BUTTON_HELD_OFFSET;
  }

  // play button
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y + h * 0.5);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fillStyle = CONTROL_COLOR;
  ctx.fill();
};

const drawStep = function (ctx, x, y, w, h) {
  if (BUTTON_LAYOUT.stepHeld) {
    x += BUTTON_HELD_OFFSET;
    y += BUTTON_HELD_OFFSET;
  }

  ctx.beginPath();
  // triangle start
  ctx.moveTo(x, y);
  ctx.lineTo(x + w * 0.75, y + h * .5);
  // bar
  ctx.lineTo(x + w* 0.75, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w* 0.75, y + h);
  // triangle end
  ctx.lineTo(x + w* 0.75, y + h * 0.5);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fillStyle = CONTROL_COLOR;
  ctx.fill();
};

const drawReset = function (ctx, x, y, w, h) {
  if (BUTTON_LAYOUT.resetHeld) {
    x += BUTTON_HELD_OFFSET;
    y += BUTTON_HELD_OFFSET;
  }

  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.5);
  ctx.lineTo(x + w * 0.5, y);
  ctx.lineTo(x + w * 0.5, y + h * 0.5);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w* 0.5, y + h* 0.5);
  ctx.lineTo(x + w * 0.5, y + h);
  ctx.closePath();
  ctx.fillStyle = CONTROL_COLOR;
  ctx.fill();
};

const drawControls = function (showPlay, showReset, showStep, playPressed, stepPressed) {
  let x = CONTROLS_X;
  let y = CONTROLS_Y;
  // step button

  if (showReset) {
    drawReset(ctx, x, y, CONTROL_W, CONTROL_H);
  }

  x += CONTROL_W + CONTROL_PAD_X;

  if (showStep) {
    drawStep(ctx, x, y, CONTROL_W, CONTROL_H);
    if (stepPressed) {
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 5;
      ctx.stroke();
    }
  }

  y += CONTROL_H + CONTROL_PAD_Y;

  if (showPlay) {
    drawPlay(ctx, x, y, CONTROL_W, CONTROL_H);
    if (playPressed) {
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 5;
      ctx.stroke();
    }
  }

};

const drawLegendBGTile = function ({x, y}, t) {
  if (t === 0) {
    return;
  }

  const vN = Math.floor(lerp(0, 64, t));
  const vNRGB = `rgb(${vN},${vN},${vN})`;

  ctx.lineWidth = 1;
  ctx.strokeStyle = vNRGB;
  ctx.strokeRect(x - .5, y - .5, GRID_W, GRID_H);
}

const drawLegend = function (limited, t) {
  let initX;
  let initY;

  initX = LEGEND_X;
  initY = LEGEND_Y;

  let x = initX;
  let y = initY;

  const w = GRID_W;
  const h = GRID_H;

  ctx.lineWidth = 1;
  drawLegendBGTile({x,y}, t);
  draw0(ctx, {x, y}, PAIR_OFFSET, BG_COLOR, t);
  x += w;
  drawLegendBGTile({x,y}, t);
  draw0(ctx, {x, y}, -PAIR_OFFSET, BG_COLOR, t);
  x += w;
  drawEq({x, y});
  x += EQ_W;

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + w * .45, y + h * .3);
  ctx.lineTo(x + w * .25, y + h * .5);
  ctx.lineTo(x + w * .45, y + h * .7);
  ctx.moveTo(x + w * .25, y + h * .5);
  ctx.lineTo(x + w * .7, y + h * .5);
  ctx.stroke();

  x = initX;
  y += h;

  if (!limited) {
    ctx.lineWidth = 1;
    drawLegendBGTile({x,y}, t);
    draw0(ctx, {x, y}, PAIR_OFFSET, BG_COLOR, t);
    x += w;
    draw1(ctx, {x, y}, -PAIR_OFFSET, t);
    x += w;
    drawEq({x, y});
    x += EQ_W;

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + w * .5, y + h * .3);
    ctx.lineTo(x + w * .7, y + h * .5);
    ctx.lineTo(x + w * .5, y + h * .7);
    ctx.moveTo(x + w * .7, y + h * .5);
    ctx.lineTo(x + w * .25, y + h * .5);
    ctx.stroke();

    x = initX;
    y += h;

    ctx.lineWidth = 1;
    draw1(ctx, {x, y}, PAIR_OFFSET, t);
    x += w;
    drawLegendBGTile({x,y}, t);
    draw0(ctx, {x, y}, -PAIR_OFFSET, BG_COLOR, t);
    x += w;
    drawEq({x, y});
    x += EQ_W;

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + w * .25, y + h * .5);
    ctx.lineTo(x + w * .45, y + h * .3);
    ctx.lineTo(x + w * .65, y + h * .5);
    ctx.moveTo(x + w * .45, y + h * .3);
    ctx.lineTo(x + w * .45, y + h * .75);
    ctx.stroke();

    x = initX;
    y += h;

    ctx.lineWidth = 1;
    draw1(ctx, {x, y}, PAIR_OFFSET, t);
    x += w;
    draw1(ctx, {x, y}, -PAIR_OFFSET, t);
    x += w;
    drawEq({x, y});
    x += EQ_W;

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + w * .25, y + h * .55);
    ctx.lineTo(x + w * .45, y + h * .75);
    ctx.lineTo(x + w * .65, y + h * .55);
    ctx.moveTo(x + w * .45, y + h * .75);
    ctx.lineTo(x + w * .45, y + h * .3);
    ctx.stroke();
  }
};

const toggleBit = function (state, {i, j}) {
  if (state.grid[j][i] === 1) {
    state.grid[j][i] = 0;
  } else {
    state.grid[j][i] = 1;
  }
  requestDraw();
};

const animateProgress = function (state, progress, cb) {
  if (state.progress !== progress) {
    state.progressAnim.push(
      {t: 0, x: state.progress}, {t: GRID_ANIM_MS, x: progress, cb});
    state.progress = progress;
  } else if (cb) {
    cb();
  }
};


const extendRectInDir = function ({x, y, w, h}, {dx, dy}) {
  if (dx < 0) {
    w -= dx;
    x += dx;
  } else {
    w += dx;
  }
  if (dy < 0) {
    h -= dy;
    y += dy;
  } else {
    h += dy;
  }

  return {x, y, w, h};
};

const shortenRectInDir = function ({x, y, w, h}, {dx, dy}) {
  if (dx < 0) {
    w += dx;
  } else {
    w -= dx;
    x += dx;
  }
  if (dy < 0) {
    h += dy;
  } else {
    h -= dy;
    y += dy;
  }

  return {x, y, w, h};
};

const quadIn = function (t) {
  return (t*t);
};

const quadOut = function (t) {
  return t*(2-t);
};

const quadInOut = function (t) {
  if (t < 0.5) {
    return 2*t*t;
  } else {
    return -1 + 2*t*(2 - t);
  }
};


const animateMove = function (anim, from, to, auto) {
  const cb = auto ? autoRunCommand : checkForWin;

  const di = to.i - from.i;
  const dj = to.j - from.j;

  const squashW = 1 / (1 + Math.abs(dj)/2);
  const squashH = 1 / (1 + Math.abs(di)/2);
  const squashI = from.i + (1 - squashW) / 2;
  const squashJ = from.j + (1 - squashH) / 2;

  const {x: midI, y: midJ, w: midW, h: midH} =
    extendRectInDir({x: squashI, y: squashJ, w: squashW, h: squashH}, {dx: di, dy: dj});

  anim.push(
    {t: 0, i: from.i, j: from.j, w: 1, h: 1},
    {t: MOVE_ANIM_MS * 0.5, i: midI, j: midJ, w: midW, h: midH},
    {t: MOVE_ANIM_MS * 0.5, i: to.i, j: to.j, w: 1, h: 1, f: quadInOut, cb},
  );
};

const animateBump = function (anim, from, to) {
  // how far it gets before the bump
  const amt = (1 - GUY_SCALE) / 2;
  const di = to.i - from.i;
  const dj = to.j - from.j;

  const {x: midI, y: midJ, w: midW, h: midH} =
    extendRectInDir(
      {x: from.i, y: from.j, w: 1, h: 1}, {dx: di * amt, dy: dj * amt});

  let {x: squashI, y: squashJ, w: squashW, h: squashH} =
    shortenRectInDir(
      {x: midI, y: midJ, w: midW, h: midH}, {dx: di * 0.3, dy: dj * 0.3});
  const sq = 1/0.8;
  const sq2 = (sq - 1)/2
  squashW *= di === 0 ? sq : 1;
  squashH *= di === 0 ? 1 : sq;
  squashI -= Math.abs(dj) * sq2;
  squashJ -= Math.abs(di) * sq2;

  anim.push(
    {t: 0, i: from.i, j: from.j, w: 1, h: 1},
    {t: MOVE_ANIM_MS * amt, i: midI, j: midJ, w: midW, h: midH},
    {t: MOVE_ANIM_MS * amt * 3, i: squashI, j: squashJ, w: squashW, h: squashH},
    {t: MOVE_ANIM_MS * amt * 5, i: from.i, j: from.j, w: 1, h: 1},
  );

};

let DRAW_IN_FLIGHT = false;
const requestDraw = function () {
  if (!DRAW_IN_FLIGHT) {
    window.requestAnimationFrame(draw);
    DRAW_IN_FLIGHT = true;
  }
};

const draw = function (t) {
  DRAW_IN_FLIGHT = false;
  if (!LEVEL_STATE) {
    return;
  }

  ctx.save();

  if (LEVEL_SWITCH) {
    if (typeof LEVEL_SWITCH.start !== 'number') {
      LEVEL_SWITCH.start = t;
    }

    if (t - LEVEL_SWITCH.start > LEVEL_SWITCH_MS) {
      LEVEL_SWITCH = null;
    }
  }

  if (LEVEL_SWITCH) {
    ctx.translate(cnv.width / DPR *
      quadInOut(1 - (t - LEVEL_SWITCH.start) / LEVEL_SWITCH_MS), 0);
    requestDraw();
  }

  ctx.clearRect(0, 0, cnv.width, cnv.height);
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, cnv.width, cnv.height);

//    transformAnim ? move.animAt(transformAnim, t) : (toggle ? 0 : 1);

  let progress = LEVEL_STATE.progress;

  let curProgressFrame = LEVEL_STATE.progressAnim[0], prevProgressFrame;
  while (LEVEL_STATE.progressAnim.length > 0) {
    if (!curProgressFrame.offsetSet) {
      if (prevProgressFrame) {
        curProgressFrame.t += prevProgressFrame.t;
      } else {
        curProgressFrame.t += t;
      }
      curProgressFrame.offsetSet = true;
    }

    if (t < curProgressFrame.t) {
      break;
    }

    if (curProgressFrame.cb) {
      curProgressFrame.cb(t);
      curProgressFrame.cb = null;
    }
    prevProgressFrame = LEVEL_STATE.progressAnim.shift();
    curProgressFrame = LEVEL_STATE.progressAnim[0];
  }

  if (!curProgressFrame && prevProgressFrame) {
    progress = prevProgressFrame.x;
  } else if (curProgressFrame && prevProgressFrame) {
    progress = lerp(prevProgressFrame.x, curProgressFrame.x,
      (t - prevProgressFrame.t) / (curProgressFrame.t - prevProgressFrame.t));
  }


  if (LEVEL_STATE.progressAnim.length > 0) {
    if (prevProgressFrame) {
      LEVEL_STATE.progressAnim.unshift(prevProgressFrame);
    }
    requestDraw();
  }

  drawBGGrid(LEVEL_STATE.grid, progress);

  drawGoal(LEVEL_STATE.goalAt);

  let guy = {i: LEVEL_STATE.guyAt.i, j: LEVEL_STATE.guyAt.j, w: 1, h: 1};

  let curAnimFrame = LEVEL_STATE.guyAnim[0], prevAnimFrame;
  while (LEVEL_STATE.guyAnim.length > 0) {
    if (!curAnimFrame.offsetSet) {
      if (prevAnimFrame) {
        // time is relative to previous frame
        curAnimFrame.t += prevAnimFrame.t;
      } else {
        // otherwise, time is relative to now
        curAnimFrame.t += t;
      }
      curAnimFrame.offsetSet = true;
    }

    if (t < curAnimFrame.t) {
      break;
    }

    if (curAnimFrame.cb) {
      curAnimFrame.cb(t);
      curAnimFrame.cb = null;
    }
    prevAnimFrame = LEVEL_STATE.guyAnim.shift();
    curAnimFrame = LEVEL_STATE.guyAnim[0];
  }

  if (!curAnimFrame && prevAnimFrame) {
    // past the last keyframe, just use it directly
    guy = {i: prevAnimFrame.i, j: prevAnimFrame.j, w: prevAnimFrame.w, h: prevAnimFrame.h};
  } else if (curAnimFrame && prevAnimFrame) {
    // two keyframes to lerp between
    let tt = (t - prevAnimFrame.t) / ( curAnimFrame.t - prevAnimFrame.t);
    if (curAnimFrame.f) {
      tt = curAnimFrame.f(tt);
    }

    guy = {
      i: lerp(prevAnimFrame.i, curAnimFrame.i, tt),
      j: lerp(prevAnimFrame.j, curAnimFrame.j, tt),
      w: lerp(prevAnimFrame.w, curAnimFrame.w, tt),
      h: lerp(prevAnimFrame.h, curAnimFrame.h, tt),
    };
  }

  if (LEVEL_STATE.guyAnim.length > 0) {
    // still animating
    if (prevAnimFrame) {
      // restore the previous keyframe to be used again
      LEVEL_STATE.guyAnim.unshift(prevAnimFrame);
    }
    requestDraw();
  }


  drawGuy({i: guy.i, j: guy.j,
           w: guy.w, h: guy.h }, progress);

  drawGrid(LEVEL_STATE.grid, progress,
           LEVEL_STATE.guyAt, LEVEL_STATE.goalAt);

  drawControls(!LEVEL_STATE.noPlay && !LEVEL_STATE.dead,
    (LEVEL_STATE.playActive || LEVEL_STATE.stepActive || LEVEL_STATE.dead),
    !LEVEL_STATE.playActive,
    LEVEL_STATE.playActive, LEVEL_STATE.stepActive);

  drawLegend(LEVEL_STATE.limitedLegend, progress);

  if (progress === 1) {
    if (LEVEL_STATE.guyAnim.length > 0 && !LEVEL_STATE.dead) {
      drawPC(LEVEL_STATE.pc - 1)
    } else {
      drawPC(LEVEL_STATE.pc);
    }
  }

  ctx.restore();
};

const handleTouchStart = function ({x: pageX, y: pageY}) {
  const x = pageX/RESIZE_SCALE;
  const y = pageY/RESIZE_SCALE;

  const l = BUTTON_LAYOUT;

  l.playHeld = x >= l.playMinX && x < l.playMaxX &&
                  y >= l.playMinY && y < l.playMaxY;
  l.stepHeld = x >= l.stepMinX && x < l.stepMaxX &&
                  y >= l.stepMinY && y < l.stepMaxY;
  l.resetHeld = x >= l.resetMinX && x < l.resetMaxX &&
                   y >= l.resetMinY && y < l.resetMaxY;
  requestDraw();
};

const handleTouchCancel = function () {
  const l = BUTTON_LAYOUT;

  l.playHeld = false;
  l.stepHeld = false;
  l.resetHeld = false;

  requestDraw();
};

const handleTouchEnd = function ({x: pageX, y: pageY}) {
  const x = pageX/RESIZE_SCALE;
  const y = pageY/RESIZE_SCALE;

  const l = BUTTON_LAYOUT;

  l.playHeld = false;
  l.stepHeld = false;
  l.resetHeld = false;

  if (CUR_LEVEL === LEVELS.length - 1) {
    return;
  }

  if (LEVEL_SWITCH) {
    return;
  }

  if (!LEVEL_STATE || !LEVEL_STATE.guyAt) {
    hideMessage();
    winLevel();
    return;
  }

  if (!LEVEL_STATE.noEdit && LEVEL_STATE.progress === 0 &&
      x >= l.gridMinX && x < l.gridMaxX && y >= l.gridMinY && y < l.gridMaxY) {
    toggleBit(LEVEL_STATE,
          {i: Math.floor((x - GRID_X) / GRID_W),
           j: Math.floor((y - GRID_Y) / GRID_H)});
  } else if (!LEVEL_STATE.playActive && LEVEL_STATE.guyAnim.length === 0 &&
             x >= l.stepMinX && x < l.stepMaxX && y >= l.stepMinY && y < l.stepMaxY) {
    if (LEVEL_STATE.progress === 0) {
      // kickoff
      LEVEL_STATE.stepActive = true;
      animateProgress(LEVEL_STATE, 1);
      // check for crushed immediately
      if (LEVEL_STATE.grid[LEVEL_STATE.guyAt.j][LEVEL_STATE.guyAt.i] === 1) {
        LEVEL_STATE.dead = true;
        showMessage(RESET_MESSAGE, false);
      }
    } else {
      // continue
      runCommand(false);
    }
  } else if (!LEVEL_STATE.noPlay &&
             !LEVEL_STATE.playActive && !LEVEL_STATE.dead &&
             x >= l.playMinX && x < l.playMaxX && y >= l.playMinY && y < l.playMaxY) {
    LEVEL_STATE.playActive = true;

    if (LEVEL_STATE.grid[LEVEL_STATE.guyAt.j][LEVEL_STATE.guyAt.i] === 1) {
      animateProgress(LEVEL_STATE, 1);
      LEVEL_STATE.dead = true;
      showMessage(RESET_MESSAGE, false);
    } else {
      animateProgress(LEVEL_STATE, 1, function (t) { autoRunCommand(t); });
    }

  } else if ((LEVEL_STATE.playActive || LEVEL_STATE.stepActive || LEVEL_STATE.dead) &&
             x >= l.resetMinX && x < l.resetMaxX && y >= l.resetMinY && y < l.resetMaxY) {
    resetLevel(LEVEL_STATE);
  }

  requestDraw();
};


let CUR_LEVEL = 0;
const LEVELS = [
  // 0
  { msg: 'Welcome to <big>PrograMaze</big>!<br><br>' +
         'The object of each level is to move the ' +
         '<span style="color: ' + GUY_COLOR + '">orange</span> box to the ' +
         '<span style ="color: ' + GOAL_COLOR + '">blue</span> goal.<br><br>' +
         'Tap or click to begin'},
  // 1
  {
    msg: 'Tap Step (<canvas id="stepIcon"></canvas>) ' +
         'repeatedly to run the program',
    guyAt: {i: 6, j: 0},
    goalAt: {i: 1, j: 0},
    limitedLegend: true,
    noPlay: true,
    noEdit: true
  },
  // 2
  { msg: 'Tap the bits (' +
         '<canvas id="icon0"></canvas>,<canvas id="icon1"></canvas>) ' +
         'to change the program',
    grid: [[0,0,0,0,0,0,1,0],
           [1,0,1,0,0,0,0,0],
           [0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0]],
    guyAt: {i: 4, j: 2},
    goalAt: {i: 7, j: 5},
    noPlay: true,
  },
  // 3
  { msg: 'Every<canvas id="icon1"></canvas>becomes a solid wall',
    grid: [[1,1,1,1,1,1,1,1],
           [0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0],
           [1,1,1,1,1,1,1,1],
           [0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0]],
    guyAt: {i: 5, j: 1},
    goalAt: {i: 0, j: 5},
    noPlay: true
  },
  // 4
  { msg: 'Tap Play (<canvas id="playIcon"></canvas>) '+
         'to run the program automatically',
    guyAt: {i: 5, j: 0},
    goalAt: {i: 0, j: 3},
  },
  // 5
  { guyAt: {i: 5, j: 7},
    goalAt: {i: 1, j: 0},
  },
  // 6
  { guyAt: {i: 3, j: 0},
    goalAt: {i: 3, j: 7},
  },
  // 7
  { guyAt: {i: 4, j: 7},
    goalAt: {i: 4, j: 0},
  },
  // 8
  {msg: 'Boss puzzle!'},
  // 9
  { guyAt: {i: 1, j: 7},
    goalAt: {i: 6, j: 0},
  },
  // 10
  {msg: 'Final phase!'},
  // 11
  { guyAt: {i: 1, j: 0},
    goalAt: {i: 6, j: 0},
  },
  // 12
  {msg: 'You win!<br><br>Thanks for playing!<br><br>' +
        '<small>Designed by ' +
        '<a href="https://gashlin.net" style="color: white">Adam&nbsp;Gashlin</a>' +
        '</small>'}
];

const RESET_MESSAGE = 'Tap Reset (<canvas id="resetIcon"></canvas>) '+
                      'to retry.';

const initLevel = function (level) {
  const state = {grid: []};
  for (let j = 0; j < GRID_ROWS; j ++) {
    const row = [];
    state.grid.push(row);
    for (let i = 0; i < GRID_COLS; i ++) {
      if (!level.grid) {
        row.push(0);
      } else {
        row.push(level.grid[j][i]);
      }
    }
  }

  state.guyAtInit = level.guyAt;
  state.goalAt = level.goalAt;
  state.noPlay = level.noPlay;
  state.limitedLegend = level.limitedLegend;
  state.noEdit = level.noEdit;
  state.msg = level.msg;
  state.progress = 0;

  state.progressAnim = [];
  state.guyAnim = [];

  resetLevel(state);

  return state;
};

const resetLevel = function (state) {
  // doesn't touch grid
  state.guyAt = {i: state.guyAtInit.i, j: state.guyAtInit.j};
  state.pc = 0;
  state.playActive = false;
  state.stepActive = false;
  animateProgress(state, 0);
  state.guyAnim = [];

  if (state.msg) {
    showMessage(state.msg, false);
  } else {
    hideMessage();
  }

  state.dead = false;
};

const showMessage = function (msg, fullscreen) {
  const div = document.getElementById('message');
  div.style.visibility = 'visible';
  if (fullscreen) {
    div.style.top = '0';
    div.style.bottom = '';
    div.style['padding-top'] = '100px';
    ctx.clearRect(0, 0, cnv.width, cnv.height);
  } else {
    div.style.top = '';
    div.style.bottom = '';
    div.style['padding-top'] = '';
  }
  div.innerHTML = msg;

  [{id: 'stepIcon', f: drawStep, w: ICON_W, h: ICON_H},
   {id: 'playIcon', f: drawPlay, w: ICON_W, h: ICON_H},
   {id: 'resetIcon', f: drawReset, w: ICON_W, h: ICON_H},
   {id: 'icon0', f: drawIcon0, w: BIT_ICON_W, h: BIT_ICON_H},
   {id: 'icon1', f: drawIcon1, w: BIT_ICON_W, h: BIT_ICON_H},
  ].forEach(function ({id, f, w, h}) {
       const icon = document.getElementById(id);
    if (!icon ) {
      return;
    }
    icon.width = w;
    icon.height = h;
    icon.style.width = w + 'px';
    icon.style.height = h + 'px';
    f(icon.getContext('2d'), 0, 0, w, h);
  });
};

const hideMessage = function () {
  const div = document.getElementById('message');
  div.innerHTML = '';
  div.style.visibility = 'hidden';
};

const checkDest = function ({i, j}) {
  return i >= 0 && j >= 0 && i < GRID_COLS && j < GRID_ROWS &&
         LEVEL_STATE.grid[j][i] !== 1;
}

const runCommand = function (auto) {
  const pc = LEVEL_STATE.pc;
  const pcj = Math.floor(pc /4);
  const pci = (pc - pcj * 4) * 2;
  let ls = LEVEL_STATE;

  const b1 = ls.grid[pcj][pci];
  const b0 = ls.grid[pcj][pci+1];
  const guyAt = ls.guyAt;
  let dest;

  if (b1 === 0 && b0 === 0) {
    // left
    dest = {i: guyAt.i - 1, j: guyAt.j};
  } else if (b1 === 0 && b0 === 1) {
    // right
    dest = {i: guyAt.i + 1, j: guyAt.j};
  } else if (b1 === 1 && b0 === 0) {
    // up
    dest = {i: guyAt.i, j: guyAt.j - 1};
  } else if (b1 === 1 && b0 === 1) {
    // down
    dest = {i: guyAt.i, j: guyAt.j + 1};
  }

  if (!ls.dead && checkDest(dest)) {
    animateMove(LEVEL_STATE.guyAnim, ls.guyAt, dest, auto);
    ls.guyAt = dest;

    ls.pc += 1;
    if (ls.pc >= 32) {
      ls.pc = 0;
    }
  } else {
    ls.dead = true;
    LEVEL_STATE.playActive = false;
    animateBump(LEVEL_STATE.guyAnim, ls.guyAt, dest);
    showMessage(RESET_MESSAGE, false);
  }
};

const checkForWin = function () {
  const ls = LEVEL_STATE;
  if (ls.guyAt.i === ls.goalAt.i && ls.guyAt.j === ls.goalAt.j) {
    window.setTimeout(winLevel, WIN_DELAY_MS);
    return true;
  }
  return false;
};

const autoRunCommand = function () {
  if (checkForWin()) {
    return;
  }
  runCommand(true);
};

const startLevel = function () {
  const level = LEVELS[CUR_LEVEL];
  if (level.msg) {
    showMessage(level.msg, !level.guyAt);
  } else {
    hideMessage();
  }

  if (level.guyAt) {
    LEVEL_STATE = initLevel(level);
    requestDraw();
  } else {
    LEVEL_STATE = null;
  }

  if (CUR_LEVEL === LEVELS.length - 1) {
    TOUCHY.unregister();
  }
};


const winLevel = function () {
  if (CUR_LEVEL < LEVELS.length - 1) {
    if (LEVELS[CUR_LEVEL].guyAt && LEVELS[CUR_LEVEL + 1].guyAt) {
      LEVEL_SWITCH = {};
    }
    CUR_LEVEL += 1;
    getHashFromLevel();
    startLevel();
  }
};

const getLevelFromHash = function () {
  const n = parseInt(window.location.hash.substring(1), 10);
  if (!isNaN(n) && n >= 0 && n < LEVELS.length) {
    CUR_LEVEL = n;
  }
};

const getHashFromLevel = function () {
  window.history.replaceState(undefined, undefined, '#' + CUR_LEVEL);
};

// main code starts here

window.addEventListener('resize', handleResize);

const TOUCHY = GET_TOUCHY(window, {
  touchStart: handleTouchStart,
  touchEnd: handleTouchEnd,
  touchCancel: handleTouchCancel
});

setSize();

window.addEventListener('hashchange', function () {
  getLevelFromHash();
  startLevel();
});

getLevelFromHash();

startLevel();

})();
