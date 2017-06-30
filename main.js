(function(){
'use strict';

const GUY_COLOR = 'orange';
const GOAL_COLOR = 'blue';
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

const LANDSCAPE_CONTROLS_X = 70;
const LANDSCAPE_CONTROLS_Y = 20;
const PORTRAIT_CONTROLS_X = 100;
const PORTRAIT_CONTROLS_Y = 20;
let CONTROLS_X = 10;
let CONTROLS_Y = 10;
let STEP_PRESSED = false;
let PLAY_PRESSED = false;
let SHOW_PLAY = true;

const CONTROL_H = 80;
const CONTROL_W = 48;
const CONTROL_PAD = 25;

const LANDSCAPE_GRID_X = 200;
const LANDSCAPE_GRID_Y = 10;
const PORTRAIT_GRID_X = 10;
const PORTRAIT_GRID_Y = 220;
let GRID_X = 10;
let GRID_Y = 10;

let TEXT_X = 10;
let TEXT_Y = 10;

let LEVEL_STATE = null;

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
    GRID_X = LANDSCAPE_GRID_X;
    GRID_Y = LANDSCAPE_GRID_Y;
  } else {
    CONTROLS_X = PORTRAIT_CONTROLS_X;
    CONTROLS_Y = PORTRAIT_CONTROLS_Y;
    GRID_X = PORTRAIT_GRID_X;
    GRID_Y = PORTRAIT_GRID_Y;
  }
  const desiredWidth = GRID_X + GRID_W * GRID_COLS + PAD_X;
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

setSize();

const move = MOVE();

let startTime = null;

const stretch = [{t: 0, x: 1},
                 {t: 150, x: 2.2, f: MOVE.quadin},
                 {t: 300, x: 1},];
const crawl = [{t: 0, x: 0},
               {t: 150, x: 0, f: MOVE.quadin},
               {t: 300, x: 1.2}];

const transform01 = [{t: 0, x: 0}, {t: 125, x: 1}];
const transform10 = [{t: 0, x: 1}, {t: 125, x: 0}];

let transformAnim;

const lerp = function (x0, x1, t) {
  return x0 + (x1 - x0) * t;
};

const draw0 = function ({x, y}, offset, holeColor, t) {
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

const draw1 = function ({x, y}, offset, t) {
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

const drawEq = function ({x, y}) {
  ctx.fillStyle = 'white';
  ctx.fillRect(x + GRID_W / 5, y + GRID_H * 3 / 12, GRID_W / 2, GRID_W / 6);
  ctx.fillRect(x + GRID_W / 5, y + GRID_H * 7 / 12, GRID_W / 2, GRID_W / 6);
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
        draw1({x, y}, offset, t);
      } else {
        draw0({x, y}, offset, holeColor, t);
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

  for (let j = 0; j < grid.length; j++) {
    for (let i = 0; i < grid[j].length; i++) {
      if (grid[j][i] === 0) {
        const x = GRID_X + i * GRID_W;
        const y = GRID_Y + j * GRID_H;
        ctx.strokeRect(x - .5, y - .5, GRID_W, GRID_H);
      }
    }
  }
};

const drawGuy = function ({i, j}) {
  ctx.fillStyle = GUY_COLOR;
  ctx.fillRect(GRID_X + GRID_W * i, GRID_Y + GRID_H * j,
               GRID_W-1, GRID_H-1);
  /*
  const size = 20;
  const s = move.animAt(stretchAnim, t);
  const w = s * size;
  const h = size * size / w;
  const x = xpos + size * move.animAt(crawlAnim, t);
  */
  /*
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, 100 + size / 2);
  ctx.lineTo(x + w/2, 100 + size / 2 - h/2);
  ctx.lineTo(x + w, 100 + size/2);
  ctx.lineTo(x + w/2, 100 + size / 2 + h/2);
  ctx.closePath();
  ctx.stroke();
  */
};

const drawGoal = function ({i, j}) {
  ctx.fillStyle = GOAL_COLOR;
  ctx.fillRect(GRID_X + GRID_W * i, GRID_Y + GRID_H * j,
               GRID_W-1, GRID_H-1);
};

const drawPC = function ({i, j}) {
};

const drawControls = function (showPlay, playPressed, stepPressed) {
  ctx.fillStyle = CONTROL_COLOR;

  let x = CONTROLS_X;
  let y = CONTROLS_Y;
  // step button
  ctx.beginPath();
  // triangle start
  ctx.moveTo(x, y);
  ctx.lineTo(x + CONTROL_W * 0.75, y + CONTROL_H * .5);
  // bar
  ctx.lineTo(x + CONTROL_W * 0.75, y);
  ctx.lineTo(x + CONTROL_W, y);
  ctx.lineTo(x + CONTROL_W, y + CONTROL_H);
  ctx.lineTo(x + CONTROL_W * 0.75, y + CONTROL_H);
  // triangle end
  ctx.lineTo(x + CONTROL_W * 0.75, y + CONTROL_H * 0.5);
  ctx.lineTo(x, y + CONTROL_H);
  ctx.closePath();
  ctx.fill();

  if (stepPressed) {
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 5;
    ctx.stroke();
  }


  y += CONTROL_H + CONTROL_PAD;

  if (showPlay) {
    // play button
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + CONTROL_W, y + CONTROL_H * 0.5);
    ctx.lineTo(x, y + CONTROL_H);
    ctx.closePath();
    ctx.fill();

    if (playPressed) {
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 5;
      ctx.stroke();
    }
  }

};

const drawLegend = function (t) {
  let initX;
  let initY;
  
  if (LANDSCAPE) {
    initX = 2 ;
    initY = LANDSCAPE_CONTROLS_Y + (CONTROL_PAD + CONTROL_H) * 2;
  } else {
    initX = GRID_X + GRID_W * 4;
    initY = -2;
  }

  let x = initX;
  let y = initY;

  ctx.lineWidth = 1;
  draw0({x, y}, PAIR_OFFSET, BG_COLOR, t);
  x += GRID_W;
  draw0({x, y}, -PAIR_OFFSET, BG_COLOR, t);
  x += GRID_W;
  drawEq({x, y});
  x += EQ_W;

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + GRID_W * .35, y + GRID_H * .3);
  ctx.lineTo(x + GRID_W * .65, y + GRID_H * .5);
  ctx.lineTo(x + GRID_W * .35, y + GRID_H * .7);
  ctx.stroke();

  x = initX;
  y += GRID_H;

  ctx.lineWidth = 1;
  draw0({x, y}, PAIR_OFFSET, BG_COLOR, t);
  x += GRID_W;
  draw1({x, y}, -PAIR_OFFSET, t);
  x += GRID_W;
  drawEq({x, y});
  x += EQ_W;

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + GRID_W * .65, y + GRID_H * .3);
  ctx.lineTo(x + GRID_W * .35, y + GRID_H * .5);
  ctx.lineTo(x + GRID_W * .65, y + GRID_H * .7);
  ctx.stroke();

  x = initX;
  y += GRID_H;

  ctx.lineWidth = 1;
  draw1({x, y}, PAIR_OFFSET, t);
  x += GRID_W;
  draw0({x, y}, -PAIR_OFFSET, BG_COLOR, t);
  x += GRID_W
  drawEq({x, y});
  x += EQ_W;

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + GRID_W * .3, y + GRID_H * .35);
  ctx.lineTo(x + GRID_W * .5, y + GRID_H * .65);
  ctx.lineTo(x + GRID_W * .7, y + GRID_H * .35);
  ctx.stroke();

  x = initX;
  y += GRID_H;

  ctx.lineWidth = 1;
  draw1({x, y}, PAIR_OFFSET, t);
  x += GRID_W;
  draw1({x, y}, -PAIR_OFFSET, t);
  x += GRID_W;
  drawEq({x, y});
  x += EQ_W;

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + GRID_W * .3, y + GRID_H * .65);
  ctx.lineTo(x + GRID_W * .5, y + GRID_H * .35);
  ctx.lineTo(x + GRID_W * .7, y + GRID_H * .65);
  ctx.stroke();


};

let DRAW_IN_FLIGHT = false;
const requestDraw = function () {
  if (!DRAW_IN_FLIGHT) {
    window.requestAnimationFrame(draw);
    DRAW_IN_FLIGHT = true;
  }
};

const click = function (state, {i, j}) {
  if (state.grid[j][i] === 1) {
    state.grid[j][i] = 0;
  } else {
    state.grid[j][i] = 1;
  }
  requestDraw();
};

/*
let toggle = true;
const flipToggle = function (t) {
  if (!transformAnim) {
    //stretchAnim = move.setupAnim(stretch, t, 0);
    //crawlAnim = move.setupAnim(crawl, t, 0);
    toggle = !toggle;
    if (toggle) {
      transformAnim = move.setupAnim(transform10, t, 0);
    } else {
      transformAnim = move.setupAnim(transform01, t, 0);
    }
  }
  requestDraw();
};
*/

const draw = function (t) {
  DRAW_IN_FLIGHT = false;

  ctx.clearRect(0, 0, cnv.width, cnv.height);
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, cnv.width, cnv.height);

  const progress = 0;
//    transformAnim ? move.animAt(transformAnim, t) : (toggle ? 0 : 1);

  drawBGGrid(LEVEL_STATE.grid, progress);

  drawGoal(LEVEL_STATE.goalAt);
  drawGuy(LEVEL_STATE.guyAt);

  drawGrid(LEVEL_STATE.grid, progress, LEVEL_STATE.guyAt, LEVEL_STATE.goalAt);

  drawControls(!LEVEL_STATE.noPlay, PLAY_PRESSED, STEP_PRESSED);

  drawLegend(progress);

  if (transformAnim) {
    if (move.isAnimDone(transformAnim, t)) {
      //stretchAnim = undefined;
      //crawlAnim = undefined;
      //xpos += size * 1.2;
      //window.requestAnimationFrame(draw);
      transformAnim = undefined;
    } else {
      requestDraw();
    }
  }
};

const LEVELS = [
  // level 0
  {
    msg: 'Click Step repeatedly to run the program.',
    grid: [[0,0,0,0,0,0,0,0],
           [1,1,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0],
           [0,0,0,0,0,0,0,0]],
    guyAt: {i: 6, j: 0},
    goalAt: {i: 2, j: 1},
    noPlay: true
  },
  // level 1
  { msg: 'You can toggle the bits of the program by clicking them.',
    guyAt: {i: 2, j: 2},
    goalAt: {i: 6, j: 3},
    noPlay: true
  },
  // level 2
  { msg: 'Clicking Play will run the program automatically',
    guyAt: {i: 6, j: 0},
    goalAt: {i: 1, j: 3},
  },
  // level 3
  { guyAt: {i: 5, j: 7},
    goalAt: {i: 1, j: 0},
  },
  // level 4
  { guyAt: {i: 3, j: 0},
    goalAt: {i: 3, j: 7},
  },
  // level 5
  { guyAt: {i: 4, j: 7},
    goalAt: {i: 4, j: 0},
  },
  {msg: 'Boss puzzle!'},
  // level 6
  { guyAt: {i: 1, j: 7},
    goalAt: {i: 6, j: 0},
  },
  {msg: 'Final phase!'},
  // level 7
  { guyAt: {i: 1, j: 0},
    goalAt: {i: 6, j: 0},
  },
  {msg: 'Thanks for playing!'}
];

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

  return state;
};

const resetLevel = function (state) {
  // doesn't touch grid
  state.guyAt = {i: state.guyAtInit.i, j: state.guyAtInit.j};
  state.pc = 0;
};

const showMessage = function (msg) {
  const div = document.getElementById('message');
  div.style.visibility = 'visible';
  div.textContent = msg;
};
const hideMessage = function () {
  const div = document.getElementById('message');
  div.textContent = '';
  div.style.visibility = 'hidden';
};


// main code starts here

let curLevel = 1;
if (LEVELS[curLevel].msg) {
  showMessage(LEVELS[curLevel].msg);
} else {
  hideMessage();
}
LEVEL_STATE = initLevel(LEVELS[curLevel]);
resetLevel(LEVEL_STATE);
requestDraw();

cnv.addEventListener('click', function (e) {
  if (e.button !== 0) {
    return;
  }

  e.preventDefault();
  const x = e.pageX/RESIZE_SCALE;
  const y = e.pageY/RESIZE_SCALE;
  if (x >= GRID_X && x < GRID_X + GRID_W * GRID_COLS &&
      y >= GRID_Y && y < GRID_Y * GRID_H * GRID_ROWS) {
    click(LEVEL_STATE,
          {i: Math.floor((x - GRID_X) / GRID_W),
           j: Math.floor((y - GRID_Y) / GRID_H)});
  } else if (x >= CONTROLS_X && x < CONTROLS_X + CONTROL_W &&
             y >= CONTROLS_Y && y < CONTROLS_Y + CONTROL_H) {
    STEP_PRESSED = !STEP_PRESSED;
  } else if (SHOW_PLAY &&
             y >= CONTROLS_Y + CONTROL_H + CONTROL_PAD &&
             y < CONTROLS_Y + 2 * CONTROL_H + CONTROL_PAD &&
             x >= CONTROLS_X && x < CONTROLS_X + CONTROL_W) {
    PLAY_PRESSED = !PLAY_PRESSED;
    flipToggle(performance.now());
  }

  requestDraw();
});

window.addEventListener('resize', function (e) {
  setSize();
  requestDraw();
});

})();
