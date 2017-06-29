(function(){
'use strict';

const GUY_COLOR = 'orange';
const GOAL_COLOR = 'blue';
const BG_COLOR = 'black';

let GRID_X = 100;
let GRID_Y = 100;
const GRID_W = 40;
const GRID_H = 40;
const ZERO_W = GRID_W * .6;
const ZERO_H = GRID_H * .6;
const ONE_W = GRID_W * .2;
const ONE_H = GRID_H * .6;
const ZERO_INNER_W = GRID_W * .3;
const ZERO_INNER_H = GRID_H * .3;
const PAIR_OFFSET = 4;

const cnv = document.getElementById('cnv');
cnv.width = cnv.offsetWidth;
cnv.height = cnv.offsetHeight;
let ctx = cnv.getContext('2d');

if (window.devicePixelRatio) {
  const dpr = window.devicePixelRatio;
  const width = cnv.width;
  const height = cnv.height

  cnv.width = width * dpr;
  cnv.height = height * dpr;
  ctx.scale(dpr, dpr);
}

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


const drawGrid = function (grid, t, guyAt, goalAt) {
  for (let j = 0; j < grid.length; j ++) {
    for (let i = 0; i < grid[j].length; i ++) {
      const x = GRID_X + i * GRID_W;
      const y = GRID_Y + j * GRID_H;
      const offset = (i % 2) === 0 ? PAIR_OFFSET : -PAIR_OFFSET;

      if (grid[j][i] === 1) {
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
      } else {
        if (t < 1) {
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

            if (i === guyAt.x && j === guyAt.y) {
              ctx.fillStyle = GUY_COLOR;
            } else if (i === goalAt.x && j === goalAt.y) {
              ctx.fillStyle = GOAL_COLOR;
            }  else {
              ctx.fillStyle = BG_COLOR;
            }
            ctx.fillRect(xN, yN, wN, hN);
          }
        }
      } // end else (0)
    } // end i loop
  } // end j loop
};

const drawBGGrid = function (grid, t) {
  if (t === 0) {
    return;
  }
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

const drawGuy = function ({x, y}) {
  ctx.fillStyle = GUY_COLOR;
  ctx.fillRect(GRID_X + GRID_W * x, GRID_Y + GRID_H * y,
               GRID_W-1, GRID_H-1);
};

const drawGoal = function ({x, y}) {
  ctx.fillStyle = GOAL_COLOR;
  ctx.fillRect(GRID_X + GRID_W * x, GRID_Y + GRID_H * y,
               GRID_W-1, GRID_H-1);
};

const drawPC = function ({x, y}) {
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

const drawControls = function (x, y, showPlay, playPressed, pausePressed) {
};

let toggle = true;
const draw = function (t) {
  if (typeof transformAnim !== 'object') {
    //stretchAnim = move.setupAnim(stretch, t, 0);
    //crawlAnim = move.setupAnim(crawl, t, 0);
    if (toggle) {
      transformAnim = move.setupAnim(transform10, t, 0);
    } else {
      transformAnim = move.setupAnim(transform01, t, 0);
    }
    toggle = !toggle;
  }

  ctx.clearRect(0, 0, cnv.width, cnv.height);
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, cnv.width, cnv.height);

  const progress = move.animAt(transformAnim, t);

  const grid = [[1,1,1,1,1,1,1,1],
                [1,1,1,0,1,1,1,1],
                [1,0,0,0,0,1,1,1],
                [1,1,1,0,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [0,0,0,0,0,0,0,0],
                [0,0,1,0,1,0,0,0],
                [0,0,0,0,0,0,0,0]];

  drawBGGrid(grid, progress);

  drawGoal({x:3, y:2});
  drawGuy({x:2.5, y:2});

  drawGrid(grid, progress, {x:2,y:2}, {x:3,y:2});

  if (move.isAnimDone(transformAnim, t)) {
    //stretchAnim = undefined;
    //crawlAnim = undefined;
    //xpos += size * 1.2;
    //window.requestAnimationFrame(draw);
    transformAnim = undefined;
  } else {
    window.requestAnimationFrame(draw);
  }
};

window.requestAnimationFrame(draw);
window.addEventListener('click', function () {
  window.requestAnimationFrame(draw);
});

})();
